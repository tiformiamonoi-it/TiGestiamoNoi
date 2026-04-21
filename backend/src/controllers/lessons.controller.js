// backend/src/controllers/lessons.controller.js
/**
 * Controller per gestione lezioni
 * Schema: 1 lezione = più studenti tramite LessonStudent
 * Gestisce scalamento automatico ore e calcolo compensi
 */

const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');
const {
  determinaTipoLezione,
  calcolaCompensoTutor,
  calcolaNuoviValoriPacchetto,
  ripristinaValoriPacchetto,
} = require('../utils/lessonCalculations');
const { updatePackageStates, isPacchettoValidoPerLezioni } = require('../utils/packageStates');

// ============================================
// GET LEZIONI
// ============================================

/**
 * GET /api/lessons
 * Lista lezioni con filtri
 */
const getLessons = async (req, res, next) => {
  try {
    const {
      tutorId,
      studentId,
      dataInizio,
      dataFine,
      tipo,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {};

    // Filtri
    if (tutorId) where.tutorId = tutorId;
    if (studentId) {
      where.lessonStudents = {
        some: {
          studentId: studentId,
        },
      };
    }
    if (dataInizio || dataFine) {
      where.data = {};
      if (dataInizio) where.data.gte = new Date(dataInizio);
      if (dataFine) where.data.lte = new Date(dataFine);
    }
    if (tipo) where.tipo = tipo;

    const [lessons, total] = await Promise.all([
      prisma.lesson.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          tutor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          timeSlot: true,
          lessonStudents: {
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
              package: {
                select: {
                  id: true,
                  nome: true,
                  tipo: true,
                  oreResiduo: true,
                },
              },
            },
          },
        },
        orderBy: [
          { data: 'desc' },
          { timeSlot: { oraInizio: 'asc' } },
        ],
      }),
      prisma.lesson.count({ where }),
    ]);

    res.json({
      lessons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/lessons/:id
 * Singola lezione
 */
const getLessonById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        tutor: true,
        timeSlot: true,
        lessonStudents: {
          include: {
            student: true,
            package: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lezione non trovata' });
    }

    res.json({ lesson });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CREA LEZIONE
// ============================================

/**
 * POST /api/lessons
 * Crea nuova lezione o aggiunge studenti a lezione esistente
 * ✅ FIX: Se esiste già una lezione per tutor+data+slot, aggiunge gli studenti
 * ✅ FIX: Per pacchetti MENSILI, scala -1 giorno solo se prima lezione della data
 */
const createLesson = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      tutorId,
      timeSlotId,
      data,
      studenti,
      forzaGruppo = false,
      note,
    } = req.body;

    // Validazione base
    if (!tutorId || !timeSlotId || !data || !studenti || studenti.length === 0) {
      return res.status(400).json({
        error: 'Campi obbligatori: tutorId, timeSlotId, data, studenti',
      });
    }

    const invalidStudents = studenti.filter(s => !s.studentId);
    if (invalidStudents.length > 0) {
      return res.status(400).json({
        error: 'Ogni studente deve avere studentId',
      });
    }

    // ✅ NUOVO: Validazione Tutor e TimeSlot attivi
    const [tutor, timeSlot] = await Promise.all([
      prisma.user.findUnique({ where: { id: tutorId }, select: { active: true, role: true } }),
      prisma.timeSlot.findUnique({ where: { id: timeSlotId }, select: { active: true } })
    ]);

    if (!tutor || !tutor.active || tutor.role !== 'TUTOR') {
      return res.status(400).json({ error: 'Il tutor selezionato non è attivo o non è un tutor valido' });
    }

    if (!timeSlot || !timeSlot.active) {
      return res.status(400).json({ error: 'Lo slot orario selezionato non è più disponibile' });
    }

    // ✅ STEP 0: Cerca lezione esistente per tutor+data+slot
    const dataInizioGiorno = new Date(data);
    dataInizioGiorno.setHours(0, 0, 0, 0);
    const dataFineGiorno = new Date(data);
    dataFineGiorno.setHours(23, 59, 59, 999);

    const lessioneEsistente = await prisma.lesson.findFirst({
      where: {
        tutorId,
        timeSlotId,
        data: {
          gte: dataInizioGiorno,
          lte: dataFineGiorno,
        },
      },
      include: {
        lessonStudents: true,
      },
    });

    // ✅ Se esiste una lezione, aggiungi studenti a quella
    if (lessioneEsistente) {
      console.log(`📌 Trovata lezione esistente ${lessioneEsistente.id} per tutor+data+slot`);

      // Filtra studenti già presenti nella lezione
      const studentiEsistentiIds = lessioneEsistente.lessonStudents.map(ls => ls.studentId);
      const studentiNuovi = studenti.filter(s => !studentiEsistentiIds.includes(s.studentId));

      if (studentiNuovi.length === 0) {
        return res.status(400).json({
          error: 'Tutti gli studenti sono già presenti in questa lezione',
          existingLessonId: lessioneEsistente.id,
        });
      }

      console.log(`📌 Aggiungendo ${studentiNuovi.length} nuovi studenti alla lezione esistente`);

      // Aggiungi studenti alla lezione esistente
      const result = await prisma.$transaction(async (tx) => {
        const studentiAggiornati = [];
        
        // BATCH READS
        const studentIds = studentiNuovi.map(s => s.studentId);
        
        const allCandidatePackages = await tx.package.findMany({
          where: { studentId: { in: studentIds } },
          orderBy: { createdAt: 'asc' },
        });

        const dataInizio = new Date(data);
        dataInizio.setHours(0, 0, 0, 0);
        const dataFine = new Date(data);
        dataFine.setHours(23, 59, 59, 999);

        const lezioniOggiGrouped = await tx.lessonStudent.groupBy({
          by: ['studentId'],
          where: {
            studentId: { in: studentIds },
            lesson: { data: { gte: dataInizio, lte: dataFine } },
          },
          _count: { studentId: true }
        });
        
        const lezioniOggiMap = {};
        lezioniOggiGrouped.forEach(l => {
          lezioniOggiMap[l.studentId] = l._count.studentId;
        });

        for (const studentData of studentiNuovi) {
          const { studentId, mezzaLezione = false } = studentData;

          // PRE-FETCH (spostato prima del loop)

          const candidatePackages = allCandidatePackages.filter(p => p.studentId === studentId);

          let pacchetto = null;
          for (const pkg of candidatePackages) {
            if (isPacchettoValidoPerLezioni(pkg)) {
              pacchetto = pkg;
              break;
            }
          }

          if (!pacchetto) {
            throw new Error(`Nessun pacchetto valido per studente ${studentId}`);
          }

          const lezioniEsistentiOggi = lezioniOggiMap[studentId] || 0;
          const isPrimaLezioneOggi = lezioniEsistentiOggi === 0;

          // Scala ore
          let oreResiduo = parseFloat(pacchetto.oreResiduo) - 1.0;
          let giorniResiduo = pacchetto.giorniResiduo ? parseInt(pacchetto.giorniResiduo) : null;

          if (pacchetto.tipo === 'MENSILE' && isPrimaLezioneOggi && giorniResiduo !== null) {
            giorniResiduo = Math.max(0, giorniResiduo - 1);
          }

          const updatedPackage = await tx.package.update({
            where: { id: pacchetto.id },
            data: {
              oreResiduo: parseFloat(oreResiduo.toFixed(2)),
              giorniResiduo,
            },
          });

          // Crea LessonStudent
          await tx.lessonStudent.create({
            data: {
              lessonId: lessioneEsistente.id,
              studentId,
              packageId: pacchetto.id,
              oreScalate: 1.0,
              mezzaLezione,
            },
          });

          studentiAggiornati.push({
            studentId,
            packageId: pacchetto.id,
            oreResiduo: updatedPackage.oreResiduo,
            giorniResiduo: updatedPackage.giorniResiduo,
          });
        }

        // ✅ Ricalcola tipo e compenso della lezione
        const totalStudents = studentiEsistentiIds.length + studentiNuovi.length;
        const nuovoForzaGruppo = forzaGruppo || lessioneEsistente.forzaGruppo;
        const tipoLezione = determinaTipoLezione(totalStudents, nuovoForzaGruppo);
        const primaMezza = studenti[0]?.mezzaLezione || lessioneEsistente.lessonStudents[0]?.mezzaLezione || false;
        const compensoTutor = calcolaCompensoTutor(tipoLezione, primaMezza);

        await tx.lesson.update({
          where: { id: lessioneEsistente.id },
          data: {
            tipo: tipoLezione,
            compensoTutor,
            forzaGruppo: nuovoForzaGruppo,
            note: note || lessioneEsistente.note,
          },
        });

        return { lessonId: lessioneEsistente.id, studentiAggiornati };
      });

      // Aggiorna stati pacchetti
      for (const student of result.studentiAggiornati) {
        await updatePackageStates(student.packageId);
      }

      // Recupera lezione completa
      const lessonCompleta = await prisma.lesson.findUnique({
        where: { id: result.lessonId },
        include: {
          tutor: true,
          timeSlot: true,
          lessonStudents: {
            include: {
              student: true,
              package: true,
            },
          },
        },
      });

      return res.status(200).json({
        message: `Studenti aggiunti alla lezione esistente`,
        lesson: lessonCompleta,
        studentiAggiornati: result.studentiAggiornati,
        wasExisting: true,
      });
    }

    // ✅ STEP 1: Calcola tipo lezione e compenso (nuova lezione)
    const numeroStudenti = studenti.length;
    const tipoLezione = determinaTipoLezione(numeroStudenti, forzaGruppo);
    const primaMezzaLezione = studenti[0]?.mezzaLezione || false;
    const compensoTutor = calcolaCompensoTutor(tipoLezione, primaMezzaLezione);

    // ✅ STEP 2: Crea lezione + scala ore in transazione atomica
    const result = await prisma.$transaction(async (tx) => {
      // Crea lezione
      const newLesson = await tx.lesson.create({
        data: {
          tutorId,
          timeSlotId,
          data: new Date(data),
          tipo: tipoLezione,
          compensoTutor,
          forzaGruppo,
          note,
        },
      });

      const studentiAggiornati = [];

      // BATCH READS
      const studentIds = studenti.map(s => s.studentId);
      
      const allCandidatePackages = await tx.package.findMany({
        where: { studentId: { in: studentIds } },
        orderBy: { createdAt: 'asc' },
      });

      const dataInizio = new Date(data);
      dataInizio.setHours(0, 0, 0, 0);
      const dataFine = new Date(data);
      dataFine.setHours(23, 59, 59, 999);

      const lezioniOggiGrouped = await tx.lessonStudent.groupBy({
        by: ['studentId'],
        where: {
          studentId: { in: studentIds },
          lesson: { data: { gte: dataInizio, lte: dataFine } },
        },
        _count: { studentId: true }
      });
      
      const lezioniOggiMap = {};
      lezioniOggiGrouped.forEach(l => {
        lezioniOggiMap[l.studentId] = l._count.studentId;
      });

      // Per ogni studente: controlla se ha già lezioni nello stesso giorno
      for (const studentData of studenti) {
        const { studentId, mezzaLezione = false } = studentData;

        const candidatePackages = allCandidatePackages.filter(p => p.studentId === studentId);

        let pacchetto = null;
        for (const pkg of candidatePackages) {
          if (isPacchettoValidoPerLezioni(pkg)) {
            pacchetto = pkg;
            break;
          }
        }

        if (!pacchetto) {
          throw new Error(`Nessun pacchetto valido trovato per studente ${studentId} (tutti i pacchetti sono chiusi o sospesi)`);
        }

        const lezioniEsistentiOggi = lezioniOggiMap[studentId] || 0;
        const isPrimaLezioneOggi = lezioniEsistentiOggi === 0;

        // Scala ore (sempre -1h)
        let oreResiduo = parseFloat(pacchetto.oreResiduo) - 1.0;
        let giorniResiduo = pacchetto.giorniResiduo ? parseInt(pacchetto.giorniResiduo) : null;

        // Se pacchetto MENSILE: scala -1 giorno SOLO se prima lezione del giorno
        if (pacchetto.tipo === 'MENSILE' && isPrimaLezioneOggi && giorniResiduo !== null) {
          giorniResiduo = Math.max(0, giorniResiduo - 1);
          console.log(`✅ Prima lezione del giorno per studente ${studentId}: -1 giorno → giorniResiduo=${giorniResiduo}`);
        }

        // Aggiorna pacchetto
        const updatedPackage = await tx.package.update({
          where: { id: pacchetto.id },
          data: {
            oreResiduo: parseFloat(oreResiduo.toFixed(2)),
            giorniResiduo,
          },
        });

        // Crea relazione LessonStudent
        await tx.lessonStudent.create({
          data: {
            lessonId: newLesson.id,
            studentId,
            packageId: pacchetto.id,
            oreScalate: 1.0,
            mezzaLezione,
          },
        });

        studentiAggiornati.push({
          studentId,
          packageId: pacchetto.id,
          oreResiduo: updatedPackage.oreResiduo,
          giorniResiduo: updatedPackage.giorniResiduo,
        });
      }

      return { newLesson, studentiAggiornati };
    });

    // ✅ STEP 3: Aggiorna stati pacchetti
    for (const student of result.studentiAggiornati) {
      await updatePackageStates(student.packageId);
    }

    // ✅ STEP 4: Recupera lezione completa
    const lessonCompleta = await prisma.lesson.findUnique({
      where: { id: result.newLesson.id },
      include: {
        tutor: true,
        timeSlot: true,
        lessonStudents: {
          include: {
            student: true,
            package: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Lezione creata con successo',
      lesson: lessonCompleta,
      studentiAggiornati: result.studentiAggiornati,
    });
  } catch (error) {
    console.error('Errore creazione lezione:', error);
    next(error);
  }
};

// ============================================
// AGGIORNA LEZIONE
// ============================================

/**
 * PUT /api/lessons/:id
 * Aggiorna lezione esistente (ricalcola scalamento)
 */
const updateLesson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      studenti,
      forzaGruppo,
      note,
    } = req.body;

    // Recupera lezione esistente
    const lessonEsistente = await prisma.lesson.findUnique({
      where: { id },
      include: {
        lessonStudents: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!lessonEsistente) {
      return res.status(404).json({ error: 'Lezione non trovata' });
    }

    // ✅ STEP 1: Ripristina ore dei vecchi studenti
    await prisma.$transaction(async (tx) => {
      for (const oldStudent of lessonEsistente.lessonStudents) {
        const pacchetto = await tx.package.findUnique({
          where: { id: oldStudent.packageId },
        });

        if (pacchetto) {
          const ripristino = ripristinaValoriPacchetto(pacchetto, oldStudent.mezzaLezione);
          await tx.package.update({
            where: { id: oldStudent.packageId },
            data: {
              oreResiduo: ripristino.oreResiduo,
              giorniResiduo: ripristino.giorniResiduo,
            },
          });
        }
      }

      // Elimina vecchie relazioni
      await tx.lessonStudent.deleteMany({
        where: { lessonId: id },
      });
    });

    // ✅ STEP 2: Ricalcola tipo lezione e compenso
    const numeroStudenti = studenti.length;
    const tipoLezione = determinaTipoLezione(numeroStudenti, forzaGruppo);
    const primaMezzaLezione = studenti[0]?.mezzaLezione || false;
    const compensoTutor = calcolaCompensoTutor(tipoLezione, primaMezzaLezione);

    // ✅ STEP 3: Scala ore nuovi studenti
    const newPackageIds = []; // Track new package IDs for state updates

    await prisma.$transaction(async (tx) => {
      await tx.lesson.update({
        where: { id },
        data: {
          tipo: tipoLezione,
          compensoTutor,
          forzaGruppo,
          note,
        },
      });

      // BATCH READ: Precarica tutti i pacchetti per tutti gli studenti coinvolti
      const studentIds = studenti.map(s => s.studentId);
      const allCandidatePackages = await tx.package.findMany({
        where: { studentId: { in: studentIds } },
        orderBy: { createdAt: 'asc' },
      });

      for (const studentData of studenti) {
        const { studentId, mezzaLezione = false } = studentData;

        // Filtra i pacchetti dello studente dal batch
        const candidatePackages = allCandidatePackages.filter(p => p.studentId === studentId);

        let pacchetto = null;

        for (const pkg of candidatePackages) {
          // ✅ FIX: Usa isPacchettoValidoPerLezioni per selezionare solo pacchetti ATTIVI
          if (isPacchettoValidoPerLezioni(pkg)) {
            pacchetto = pkg;
            break;
          }
        }

        if (!pacchetto) {
          console.warn(`Nessun pacchetto valido per studente ${studentId}`);
          continue;
        }

        const nuoviValori = calcolaNuoviValoriPacchetto(pacchetto, mezzaLezione);

        await tx.package.update({
          where: { id: pacchetto.id },
          data: {
            oreResiduo: nuoviValori.oreResiduo,
            giorniResiduo: nuoviValori.giorniResiduo,
          },
        });

        await tx.lessonStudent.create({
          data: {
            lessonId: id,
            studentId,
            packageId: pacchetto.id,
            oreScalate: 1.0,
            mezzaLezione,
          },
        });

        // Track the package ID for state updates
        newPackageIds.push(pacchetto.id);
      }
    });

    // ✅ STEP 4: Aggiorna stati pacchetti
    const allPackageIds = [
      ...lessonEsistente.lessonStudents.map(s => s.packageId),
      ...newPackageIds, // Use tracked package IDs instead of undefined values
    ];
    const uniquePackageIds = [...new Set(allPackageIds)].filter(id => id !== undefined);

    for (const pkgId of uniquePackageIds) {
      await updatePackageStates(pkgId);
    }

    // Recupera lezione aggiornata
    const lessonAggiornata = await prisma.lesson.findUnique({
      where: { id },
      include: {
        tutor: true,
        timeSlot: true,
        lessonStudents: {
          include: {
            student: true,
            package: true,
          },
        },
      },
    });

    res.json({
      message: 'Lezione aggiornata con successo',
      lesson: lessonAggiornata,
    });
  } catch (error) {
    console.error('Errore aggiornamento lezione:', error);
    next(error);
  }
};

// ============================================
// ELIMINA LEZIONE
// ============================================

/**
 * DELETE /api/lessons/:id
 * Elimina lezione e ripristina ore
 */
const deleteLesson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        lessonStudents: {
          include: {
            package: true,
          },
        },
      },
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lezione non trovata' });
    }

    // ✅ Ripristina ore pacchetti
    await prisma.$transaction(async (tx) => {
      for (const student of lesson.lessonStudents) {
        const pacchetto = await tx.package.findUnique({
          where: { id: student.packageId },
        });

        if (pacchetto) {
          const ripristino = ripristinaValoriPacchetto(pacchetto, student.mezzaLezione);
          await tx.package.update({
            where: { id: student.packageId },
            data: {
              oreResiduo: ripristino.oreResiduo,
              giorniResiduo: ripristino.giorniResiduo,
            },
          });
        }
      }

      await tx.lessonStudent.deleteMany({
        where: { lessonId: id },
      });

      await tx.lesson.delete({
        where: { id },
      });
    });

    // ✅ Aggiorna stati pacchetti
    for (const student of lesson.lessonStudents) {
      await updatePackageStates(student.packageId);
    }

    res.json({
      message: 'Lezione eliminata con successo',
      deletedLessonId: id,
    });
  } catch (error) {
    console.error('Errore eliminazione lezione:', error);
    next(error);
  }
};

// ============================================
// ✅ ELIMINA TUTTE LE LEZIONI TUTOR/DATA
// ============================================

/**
 * DELETE /api/lessons/bulk/by-tutor-date
 * Elimina tutte le lezioni di un tutor in una data
 * ✅ FIX: Ripristina +1 giorno PER STUDENTE (non per lezione)
 */
const deleteLessonsByTutorAndDate = async (req, res, next) => {
  try {
    const { tutorId, data } = req.query;

    if (!tutorId || !data) {
      return res.status(400).json({
        error: 'Parametri obbligatori: tutorId, data (YYYY-MM-DD)',
      });
    }

    const dataInizio = new Date(data);
    dataInizio.setHours(0, 0, 0, 0);
    const dataFine = new Date(data);
    dataFine.setHours(23, 59, 59, 999);

    // Trova tutte le lezioni
    const lessons = await prisma.lesson.findMany({
      where: {
        tutorId: tutorId,
        data: {
          gte: dataInizio,
          lte: dataFine,
        },
      },
      include: {
        lessonStudents: {
          include: {
            package: true,
            student: true,
          },
        },
      },
    });

    if (lessons.length === 0) {
      return res.status(404).json({
        error: 'Nessuna lezione trovata',
      });
    }

    // ✅ Raggruppa per studente
    const studentiMap = new Map();

    lessons.forEach(lesson => {
      lesson.lessonStudents.forEach(ls => {
        const studentId = ls.studentId;

        if (!studentiMap.has(studentId)) {
          studentiMap.set(studentId, {
            studentId,
            packageId: ls.packageId,
            packageTipo: ls.package?.tipo,
            oreRipristinare: 0,
            giorniRipristinare: 0,
            studentName: `${ls.student.firstName} ${ls.student.lastName}`,
          });
        }

        const studentData = studentiMap.get(studentId);
        studentData.oreRipristinare += 1.0;

        // ✅ +1 giorno PER STUDENTE (non per lezione)
        if (studentData.packageTipo === 'MENSILE' && studentData.giorniRipristinare === 0) {
          studentData.giorniRipristinare = 1;
        }
      });
    });

    console.log('📊 Studenti da ripristinare:', Array.from(studentiMap.values()));

    const deletedLessonIds = [];
    const affectedPackageIds = new Set();

    await prisma.$transaction(async (tx) => {
      // Ripristina ore e giorni
      for (const [studentId, studentData] of studentiMap) {
        const pacchetto = await tx.package.findUnique({
          where: { id: studentData.packageId },
        });

        if (!pacchetto) continue;

        const nuoveOreResiduo = parseFloat(pacchetto.oreResiduo) + studentData.oreRipristinare;
        const nuoviGiorniResiduo = pacchetto.giorniResiduo
          ? parseInt(pacchetto.giorniResiduo) + studentData.giorniRipristinare
          : null;

        await tx.package.update({
          where: { id: studentData.packageId },
          data: {
            oreResiduo: parseFloat(nuoveOreResiduo.toFixed(2)),
            giorniResiduo: nuoviGiorniResiduo,
          },
        });

        console.log(`✅ ${studentData.studentName}: +${studentData.oreRipristinare}h, +${studentData.giorniRipristinare} giorni`);

        affectedPackageIds.add(studentData.packageId);
      }

      // Elimina lezioni
      for (const lesson of lessons) {
        await tx.lessonStudent.deleteMany({
          where: { lessonId: lesson.id },
        });

        await tx.lesson.delete({
          where: { id: lesson.id },
        });

        deletedLessonIds.push(lesson.id);
      }
    });

    // Aggiorna stati pacchetti
    for (const packageId of affectedPackageIds) {
      await updatePackageStates(packageId);
    }

    res.json({
      message: `${lessons.length} lezioni eliminate`,
      deletedCount: lessons.length,
      deletedLessonIds,
      studentiAggiornati: Array.from(studentiMap.values()),
    });
  } catch (error) {
    console.error('Errore eliminazione bulk:', error);
    next(error);
  }
};

// ============================================
// CALENDARIO - GIORNI MESE
// ============================================

/**
 * GET /api/lessons/calendar/giorni
 * Ritorna giorni del mese con contatori e margini
 */
const getCalendarDays = async (req, res, next) => {
  try {
    const { anno, mese, tutorId } = req.query;

    if (!anno || !mese) {
      return res.status(400).json({ error: 'Parametri obbligatori: anno, mese' });
    }

    // ✅ FIX: Use UTC dates to avoid timezone issues
    const dataInizio = new Date(Date.UTC(parseInt(anno), parseInt(mese) - 1, 1, 0, 0, 0));
    const dataFine = new Date(Date.UTC(parseInt(anno), parseInt(mese), 0, 23, 59, 59));

    console.log('📅 Calendar Query DEBUG:');
    console.log('  - anno:', anno, 'mese:', mese);
    console.log('  - dataInizio:', dataInizio.toISOString());
    console.log('  - dataFine:', dataFine.toISOString());

    const where = {
      data: {
        gte: dataInizio,
        lte: dataFine,
      },
    };

    if (tutorId) where.tutorId = tutorId;

    const lessons = await prisma.lesson.findMany({
      where,
      include: {
        tutor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        timeSlot: true,
        lessonStudents: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            package: {
              select: {
                id: true,
                prezzoTotale: true,
                importoPagato: true,
                oreAcquistate: true,
              },
            },
          },
        },
      },
      orderBy: [
        { data: 'asc' },
        { timeSlot: { oraInizio: 'asc' } },
      ],
    });

    console.log('  - Lessons trovate:', lessons.length);
    lessons.forEach(l => console.log('    → Lesson:', l.id, 'data:', l.data.toISOString()));

    const giorniMap = new Map();

    lessons.forEach(lesson => {
      const dataStr = lesson.data.toISOString().split('T')[0];

      if (!giorniMap.has(dataStr)) {
        giorniMap.set(dataStr, {
          data: dataStr,
          lezioni: [],
          numeroLezioni: 0,
          studentiUnici: new Set(),
          compensoTotale: 0,
        });
      }

      const giorno = giorniMap.get(dataStr);
      giorno.lezioni.push(lesson);
      giorno.numeroLezioni++;

      lesson.lessonStudents?.forEach(ls => {
        giorno.studentiUnici.add(ls.student.id);
      });

      giorno.compensoTotale += parseFloat(lesson.compensoTutor || 0);
    });

    const giorni = Array.from(giorniMap.values()).map(giorno => {
      const spese = giorno.compensoTotale;
      let entrate = 0;

      giorno.lezioni.forEach((lesson) => {
        lesson.lessonStudents?.forEach((ls) => {
          const pacchetto = ls.package;
          if (!pacchetto) return;

          const importoPagato = parseFloat(pacchetto.prezzoTotale || 0);
          const oreAcquistate = parseFloat(pacchetto.oreAcquistate || 1);
          const prezzoOra = importoPagato / oreAcquistate;

          entrate += prezzoOra;
        });
      });

      const margine = entrate - spese;

      return {
        data: giorno.data,
        lezioni: giorno.lezioni,
        numeroLezioni: giorno.numeroLezioni,
        numeroStudenti: giorno.studentiUnici.size,
        entrate: parseFloat(entrate.toFixed(2)),
        spese: parseFloat(spese.toFixed(2)),
        margine: parseFloat(margine.toFixed(2)),
      };
    });

    res.json({
      anno: parseInt(anno),
      mese: parseInt(mese),
      giorni,
    });
  } catch (error) {
    console.error('Errore getCalendarDays:', error);
    next(error);
  }
};

// ============================================
// ALUNNI DISPONIBILI
// ============================================

/**
 * GET /api/lessons/calendar/alunni-disponibili
 * Ritorna alunni con pacchetti per la selezione lezioni
 * ✅ FIX: Mostra solo pacchetti ATTIVI, non quelli scaduti
 * Include flag _allPackagesClosed per studenti con tutti pacchetti chiusi
 */
const getAvailableStudents = async (req, res, next) => {
  try {
    const { search } = req.query;

    // Trova studenti attivi
    let whereStudent = { active: true };

    if (search) {
      whereStudent.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where: whereStudent,
      include: {
        pacchetti: {
          select: {
            id: true,
            nome: true,
            tipo: true,
            oreResiduo: true,
            giorniResiduo: true,
            stati: true,
            dataScadenza: true, // ✅ Includi data scadenza per il frontend
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    const { isPacchettoClosed } = require('../utils/packageStates');

    // ✅ Filtra pacchetti: mostra solo quelli ATTIVI
    const filteredStudents = students
      .filter(student => student.pacchetti.length > 0)
      .map(student => {
        // Identifica pacchetti attivi (non scaduti, non esauriti)
        const pacchettiAttivi = student.pacchetti.filter(pkg =>
          isPacchettoValidoPerLezioni(pkg)
        );

        // Check se TUTTI i pacchetti sono chiusi
        const allPackagesClosed = student.pacchetti.length > 0 &&
          student.pacchetti.every(pkg => isPacchettoClosed(pkg));

        // Check se ha un pacchetto SCADUTO DA_PAGARE
        const hasScadutoDaPagare = student.pacchetti.some(pkg => 
          pkg.stati && pkg.stati.includes('SCADUTO') && pkg.stati.includes('DA_PAGARE')
        );

        return {
          ...student,
          // ✅ Mostra solo pacchetti attivi
          pacchetti: pacchettiAttivi,
          // Flag per il frontend: tutti pacchetti chiusi
          _allPackagesClosed: allPackagesClosed,
          _hasScadutoDaPagare: hasScadutoDaPagare,
        };
      });

    console.log(`✅ getAvailableStudents: ${filteredStudents.length} studenti con pacchetti`);

    res.json({ students: filteredStudents });
  } catch (error) {
    console.error('Errore getAvailableStudents:', error);
    next(error);
  }
};

// ============================================
// CHECK TUTOR SLOT DUPLICATE
// ============================================

/**
 * GET /api/lessons/check-duplicate
 * Verifica se esistono studenti già presenti nello slot
 * Query params: tutorId, date, timeSlotId, studentIds (comma-separated)
 */
const checkTutorSlotDuplicate = async (req, res, next) => {
  try {
    const { tutorId, date, timeSlotId, studentIds } = req.query;

    if (!tutorId || !date || !timeSlotId) {
      return res.status(400).json({
        error: 'Parametri obbligatori: tutorId, date, timeSlotId'
      });
    }

    // Crea range data per il giorno
    const dataInizio = new Date(date);
    dataInizio.setHours(0, 0, 0, 0);
    const dataFine = new Date(date);
    dataFine.setHours(23, 59, 59, 999);

    // Cerca lezione esistente per questo tutor+slot+data
    const existingLesson = await prisma.lesson.findFirst({
      where: {
        tutorId,
        timeSlotId,
        data: {
          gte: dataInizio,
          lte: dataFine,
        },
      },
      include: {
        timeSlot: true,
        lessonStudents: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    // Se non esiste lezione per questo slot, tutto ok
    if (!existingLesson) {
      return res.json({
        isDuplicate: false,
        existingStudentIds: [],
        existingStudentNames: []
      });
    }

    // Se esiste, restituisci gli studenti già presenti
    const existingStudentIds = existingLesson.lessonStudents.map(ls => ls.student.id);
    const existingStudentNames = existingLesson.lessonStudents.map(
      ls => `${ls.student.firstName} ${ls.student.lastName}`
    );

    // Se sono stati passati studentIds, verifica quali sono già presenti
    if (studentIds) {
      const requestedIds = studentIds.split(',');
      const duplicateIds = requestedIds.filter(id => existingStudentIds.includes(id));
      const duplicateNames = existingLesson.lessonStudents
        .filter(ls => duplicateIds.includes(ls.student.id))
        .map(ls => `${ls.student.firstName} ${ls.student.lastName}`);

      if (duplicateIds.length > 0) {
        return res.json({
          isDuplicate: true,
          message: `Studenti già presenti in questo slot: ${duplicateNames.join(', ')}`,
          existingLessonId: existingLesson.id,
          slot: `${existingLesson.timeSlot.oraInizio}-${existingLesson.timeSlot.oraFine}`,
          existingStudentIds,
          existingStudentNames,
          duplicateStudentIds: duplicateIds,
          duplicateStudentNames: duplicateNames
        });
      }
    }

    // Lo slot è occupato ma gli studenti richiesti non sono duplicati
    res.json({
      isDuplicate: false,
      existingLessonId: existingLesson.id,
      existingStudentIds,
      existingStudentNames,
      message: `Slot già ha: ${existingStudentNames.join(', ')} - puoi aggiungere altri studenti`
    });
  } catch (error) {
    console.error('Errore checkTutorSlotDuplicate:', error);
    next(error);
  }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  deleteLessonsByTutorAndDate,
  getCalendarDays,
  getAvailableStudents,
  checkTutorSlotDuplicate,
};

