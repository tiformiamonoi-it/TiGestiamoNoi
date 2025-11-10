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
 * Body: { tutorId, timeSlotId, data, studenti: [{studentId, packageId, mezzaLezione}], forzaGruppo, note }
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
      studenti, // Array: [{ studentId, packageId, mezzaLezione }]
      forzaGruppo = false,
      note,
    } = req.body;

    // Validazione base
    if (!tutorId || !timeSlotId || !data || !studenti || studenti.length === 0) {
      return res.status(400).json({
        error: 'Campi obbligatori: tutorId, timeSlotId, data, studenti',
      });
    }

    // ✅ STEP 1: Calcola tipo lezione e compenso
    const numeroStudenti = studenti.length;
    const tipoLezione = determinaTipoLezione(numeroStudenti, forzaGruppo);
    
    // Per calcolo compenso, usa la prima mezza lezione (se presente)
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

      // Array per studenti aggiornati
      const studentiAggiornati = [];

      // Per ogni studente: scala ore pacchetto
      for (const studentData of studenti) {
        const { studentId, packageId, mezzaLezione = false } = studentData;

        // Recupera pacchetto
        const pacchetto = await tx.package.findUnique({
          where: { id: packageId },
        });

        if (!pacchetto) {
          throw new Error(`Pacchetto ${packageId} non trovato`);
        }

        // Calcola nuovi valori pacchetto
        const nuoviValori = calcolaNuoviValoriPacchetto(pacchetto, mezzaLezione);

        // Aggiorna pacchetto con ore scalate
        const updatedPackage = await tx.package.update({
          where: { id: packageId },
          data: {
            oreResiduo: nuoviValori.oreResiduo,
            giorniResiduo: nuoviValori.giorniResiduo,
          },
        });

        // Crea relazione LessonStudent
        await tx.lessonStudent.create({
          data: {
            lessonId: newLesson.id,
            studentId,
            packageId,
            oreScalate: 1.0, // Sempre -1h
            mezzaLezione,
          },
        });

        studentiAggiornati.push({
          studentId,
          packageId,
          oreResiduo: updatedPackage.oreResiduo,
        });
      }

      return { newLesson, studentiAggiornati };
    });

    // ✅ STEP 3: Aggiorna stati pacchetti (fuori transazione)
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
      studenti, // Nuovo array studenti
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
      // Aggiorna lezione
      await tx.lesson.update({
        where: { id },
        data: {
          tipo: tipoLezione,
          compensoTutor,
          forzaGruppo,
          note,
        },
      });

      // Scala ore per nuovi studenti
      for (const studentData of studenti) {
        const { studentId, packageId, mezzaLezione = false } = studentData;

        const pacchetto = await tx.package.findUnique({
          where: { id: packageId },
        });

        if (!pacchetto) continue;

        const nuoviValori = calcolaNuoviValoriPacchetto(pacchetto, mezzaLezione);

        await tx.package.update({
          where: { id: packageId },
          data: {
            oreResiduo: nuoviValori.oreResiduo,
            giorniResiduo: nuoviValori.giorniResiduo,
          },
        });

        await tx.lessonStudent.create({
          data: {
            lessonId: id,
            studentId,
            packageId,
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

    // Recupera lezione con studenti
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

    // ✅ STEP 1: Ripristina ore pacchetti
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

      // Elimina relazioni studenti (cascade dovrebbe farlo automaticamente)
      await tx.lessonStudent.deleteMany({
        where: { lessonId: id },
      });

      // Elimina lezione
      await tx.lesson.delete({
        where: { id },
      });
    });

    // ✅ STEP 2: Aggiorna stati pacchetti
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

    // Calcola inizio e fine mese
    const dataInizio = new Date(parseInt(anno), parseInt(mese) - 1, 1);
    const dataFine = new Date(parseInt(anno), parseInt(mese), 0, 23, 59, 59);

    const where = {
      data: {
        gte: dataInizio,
        lte: dataFine,
      },
    };

    if (tutorId) where.tutorId = tutorId;

    // ✅ Recupera tutte le lezioni del mese CON dati pacchetto per calcolo entrate
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

    // Raggruppa per giorno
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
      
      // Aggiungi studenti unici
      lesson.lessonStudents?.forEach(ls => {
        giorno.studentiUnici.add(ls.student.id);
      });
      
      giorno.compensoTotale += parseFloat(lesson.compensoTutor || 0);
    });

    // Converti Map in array con calcolo margini
    const giorni = Array.from(giorniMap.values()).map(giorno => {
      // ✅ Calcola USCITE (compenso tutor)
      const spese = giorno.compensoTotale;

      // ✅ Calcola ENTRATE (ricavo studenti)
      let entrate = 0;

      giorno.lezioni.forEach(lesson => {
        lesson.lessonStudents?.forEach(ls => {
          // Calcola prezzo/ora del pacchetto dello studente
          const pacchetto = ls.package;
          if (!pacchetto) return;

          const importoPagato = parseFloat(pacchetto.importoPagato || 0);
          const oreAcquistate = parseFloat(pacchetto.oreAcquistate || 1); // Evita divisione per 0
          const prezzoOra = importoPagato / oreAcquistate;

          // Ogni studente in ogni lezione genera entrate pari al suo prezzo/ora
          // (indipendentemente da mezza lezione, perché scalamento è sempre 1h)
          entrate += prezzoOra;
        });
      });

      // ✅ Margine = Entrate - Uscite
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
  getCalendarDays,
  getAvailableStudents,
};
