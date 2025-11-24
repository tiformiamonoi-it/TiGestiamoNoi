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
const { updatePackageStates } = require('../utils/packageStates');

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
 * Crea nuova lezione con scalamento automatico
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

    // ✅ STEP 1: Calcola tipo lezione e compenso
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

      // ✅ Per ogni studente: controlla se ha già lezioni nello stesso giorno
      for (const studentData of studenti) {
        const { studentId, mezzaLezione = false } = studentData;

        // Trova pacchetto attivo
        // ✅ LOGICA CORRETTA: Escludi solo pacchetti SCADUTI o ESAURITI
            // ✅ VERSIONE CORRETTA con NOT
            const pacchetto = await tx.package.findFirst({
              where: {
                studentId: studentId,
                stati: {
                  has: 'ATTIVO', // Deve avere ATTIVO
                },
                // ✅ E NON deve avere questi stati
                NOT: [
                  { stati: { has: 'SCADUTO' } },
                  { stati: { has: 'ESAURITO' } },
                  { stati: { has: 'PAG_SOSPESO' } },
                ],
              },
              orderBy: { createdAt: 'asc' }, // Più vecchio prima
            });



        if (!pacchetto) {
          throw new Error(`Nessun pacchetto attivo trovato per studente ${studentId}`);
        }

        // ✅ Verifica se studente ha già lezioni in questa data
        const dataInizio = new Date(data);
        dataInizio.setHours(0, 0, 0, 0);
        const dataFine = new Date(data);
        dataFine.setHours(23, 59, 59, 999);

        const lezioniEsistentiOggi = await tx.lesson.count({
          where: {
            data: {
              gte: dataInizio,
              lte: dataFine,
            },
            lessonStudents: {
              some: {
                studentId: studentId,
              },
            },
          },
        });

        const isPrimaLezioneOggi = lezioniEsistentiOggi === 0;

        // ✅ Scala ore (sempre -1h)
        let oreResiduo = parseFloat(pacchetto.oreResiduo) - 1.0;
        let giorniResiduo = pacchetto.giorniResiduo ? parseInt(pacchetto.giorniResiduo) : null;

        // ✅ Se pacchetto MENSILE: scala -1 giorno SOLO se prima lezione del giorno
        if (pacchetto.tipo === 'MENSILE' && isPrimaLezioneOggi && giorniResiduo !== null) {
          giorniResiduo = Math.max(0, giorniResiduo - 1);
          console.log(`✅ Prima lezione del giorno per studente ${studentId}: -1 giorno → giorniResiduo=${giorniResiduo}`);
        }

        // Aggiorna pacchetto
        const updatedPackage = await tx.package.update({
          where: { id: pacchetto.id },
          data: {
            oreResiduo: parseFloat(oreResiduo.toFixed(2)),
            giorniResiduo: giorniResiduo,
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
      await updatePackageStates(prisma, student.packageId);
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

      for (const studentData of studenti) {
        const { studentId, mezzaLezione = false } = studentData;

        // ✅ LOGICA CORRETTA: Escludi solo pacchetti SCADUTI o ESAURITI
          // ✅ VERSIONE CORRETTA con NOT
            const pacchetto = await tx.package.findFirst({
              where: {
                studentId: studentId,
                stati: {
                  has: 'ATTIVO', // Deve avere ATTIVO
                },
                // ✅ E NON deve avere questi stati
                NOT: [
                  { stati: { has: 'SCADUTO' } },
                  { stati: { has: 'ESAURITO' } },
                  { stati: { has: 'PAG_SOSPESO' } },
                ],
              },
              orderBy: { createdAt: 'asc' }, // Più vecchio prima
            });



        if (!pacchetto) {
          console.warn(`Nessun pacchetto attivo per studente ${studentId}`);
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
      }
    });

    // ✅ STEP 4: Aggiorna stati pacchetti
    const allPackageIds = [
      ...lessonEsistente.lessonStudents.map(s => s.packageId),
      ...studenti.map(s => s.packageId),
    ];
    const uniquePackageIds = [...new Set(allPackageIds)];

    for (const pkgId of uniquePackageIds) {
      await updatePackageStates(prisma, pkgId);
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
      await updatePackageStates(prisma, student.packageId);
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
      await updatePackageStates(prisma, packageId);
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

    const dataInizio = new Date(parseInt(anno), parseInt(mese) - 1, 1);
    const dataFine = new Date(parseInt(anno), parseInt(mese), 0, 23, 59, 59);

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
 * Ritorna alunni con pacchetto attivo
 */
const getAvailableStudents = async (req, res, next) => {
  try {
    const { search } = req.query;

    const where = {
      active: true,
      pacchetti: {
        some: {
          stati: {
            has: 'ATTIVO',
          },
        },
      },
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        pacchetti: {
          where: {
            stati: {
              has: 'ATTIVO',
            },
          },
          select: {
            id: true,
            nome: true,
            tipo: true,
            oreResiduo: true,
            giorniResiduo: true,
          },
        },
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    res.json({ students });
  } catch (error) {
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
};
