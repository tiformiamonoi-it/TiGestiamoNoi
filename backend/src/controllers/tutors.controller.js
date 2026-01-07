const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');

// ============================================
// GET TUTORS (con filtri e stats)
// ============================================

/**
 * GET /api/tutors
 * Lista tutor con filtri e stato pagamenti per il periodo
 */
const getTutors = async (req, res, next) => {
  try {
    const {
      search,
      stato, // 'attivo', 'inattivo', 'disattivato'
      periodo, // JSON string: { tipo: 'mese'|'anno', mese: 1-12, anno: 2025 }
      conPagamentiSospesi,
      page = 1,
      limit = 50,
    } = req.query;

    const skip = (page - 1) * limit;
    const where = {
      role: 'TUTOR',
    };

    // Filtro Ricerca
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro Stato (basato su active per ora, o campo custom se aggiunto)
    if (stato) {
      const stati = Array.isArray(stato) ? stato : [stato];
      // Mappatura stato frontend -> backend (User.active)
      // TODO: Se si vuole gestire 'inattivo' vs 'disattivato', servirebbe un campo status enum su User o TutorProfile
      // Per ora usiamo active: true = attivo/inattivo (da logica business), false = disattivato
      if (stati.includes('disattivato')) {
        where.active = false;
      } else {
        where.active = true;
      }
    }

    // Recupera tutor
    const [tutors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          active: true,
          tutorProfile: true,
          createdAt: true,
        },
        orderBy: { lastName: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    // Parsing periodo
    let periodoObj = { tipo: 'mese', mese: new Date().getMonth() + 1, anno: new Date().getFullYear() };
    if (periodo) {
      try {
        periodoObj = JSON.parse(periodo);
      } catch (e) {
        console.error('Errore parsing periodo:', e);
      }
    }

    // Arricchisci tutor con dati calcolati (mesi non pagati, ecc.)
    const enrichedTutors = await Promise.all(tutors.map(async (tutor) => {
      const stats = await calcolaStatsTutor(tutor.id, periodoObj);
      return {
        ...tutor,
        ...stats,
      };
    }));

    // Filtro post-calcolo per pagamenti sospesi
    let result = enrichedTutors;
    if (conPagamentiSospesi === 'true') {
      result = result.filter(t => t.mesiNonPagati.length > 0);
    }

    res.json({
      data: result,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// CREATE TUTOR
// ============================================

/**
 * POST /api/tutors
 * Crea un nuovo tutor
 */
const createTutor = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, active = true } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Nome e cognome sono obbligatori' });
    }

    // Check if email already exists (only if email is provided)
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Email già in uso' });
      }
    }

    // Create user with TUTOR role and TutorProfile
    const newTutor = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: email || `tutor_${Date.now()}@placeholder.local`, // Email placeholder se non fornita
        phone: phone || null,
        role: 'TUTOR',
        active,
        password: '', // Empty password - tutors don't login via password
        tutorProfile: {
          create: {
            materie: []
          }
        }
      },
      include: {
        tutorProfile: true
      }
    });

    res.status(201).json(newTutor);
  } catch (error) {
    next(error);
  }
};

// ============================================
// CHECK DUPLICATE TUTOR
// ============================================

/**
 * GET /api/tutors/check-duplicate
 * Verifica se esiste già un tutor con lo stesso nome
 */
const checkDuplicateTutor = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.query;

    if (!firstName || !lastName) {
      return res.json({ exists: false });
    }

    const existingTutor = await prisma.user.findFirst({
      where: {
        role: 'TUTOR',
        firstName: { equals: firstName, mode: 'insensitive' },
        lastName: { equals: lastName, mode: 'insensitive' }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true
      }
    });

    res.json({
      exists: !!existingTutor,
      tutor: existingTutor
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET TUTOR STATS (Dashboard)
// ============================================

/**
 * GET /api/tutors/stats
 * Statistiche globali per le card
 */
const getTutorStats = async (req, res, next) => {
  try {
    const { periodo } = req.query;
    let periodoObj = { tipo: 'mese', mese: new Date().getMonth() + 1, anno: new Date().getFullYear() };
    if (periodo) {
      try {
        periodoObj = JSON.parse(periodo);
      } catch (e) {
        // ignore
      }
    }

    const tutors = await prisma.user.findMany({
      where: { role: 'TUTOR', active: true },
      select: { id: true },
    });

    let activeTutors = 0;
    let tutorsToPay = 0;
    let totalDue = 0;

    for (const tutor of tutors) {
      const stats = await calcolaStatsTutor(tutor.id, periodoObj);

      if (stats.hasLezioniInPeriod) activeTutors++;
      if (stats.mesiNonPagati.length > 0) {
        tutorsToPay++;
        totalDue += stats.totaleDovuto;
      }
    }

    res.json({
      activeTutors,
      tutorsToPay,
      totalDue,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// PAY TUTOR (Single & Bulk)
// ============================================

/**
 * POST /api/tutors/pay
 * Registra pagamenti per uno o più tutor
 */
const payTutors = async (req, res, next) => {
  try {
    const { pagamenti, dataPagamento, metodoPagamento, note } = req.body;
    // pagamenti: [{ tutorId: '...', mesi: ['2025-11-01', '2025-10-01'] }]

    if (!pagamenti || !Array.isArray(pagamenti) || pagamenti.length === 0) {
      return res.status(400).json({ error: 'Nessun pagamento specificato' });
    }

    const results = [];

    await prisma.$transaction(async (tx) => {
      for (const p of pagamenti) {
        const { tutorId, mesi } = p;

        for (const meseItem of mesi) {
          // Handle both string (old) and object (new) formats
          let meseStr, importoOverride, statusOverride;

          if (typeof meseItem === 'string') {
            meseStr = meseItem;
          } else {
            meseStr = meseItem.date;
            importoOverride = meseItem.importo;
            statusOverride = meseItem.status;
          }

          // Force UTC midnight for consistency
          const d = new Date(meseStr);
          const meseDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));

          // Calcola importo dovuto per quel mese (sicurezza/default)
          const compenso = await calcolaCompensoMese(tx, tutorId, meseDate);

          // Determine final amount and status
          // If override provided, use it. Otherwise use calculated.
          const finalImporto = importoOverride !== undefined ? parseFloat(importoOverride) : compenso.totaleArrotondato;

          // Determine status
          let status = statusOverride || 'PAGATO';
          // Auto-detect partial if not specified and amount < calculated? 
          // User explicitly selects status in UI now, so trust UI.

          if (finalImporto > 0) {
            const payment = await tx.tutorPayment.create({
              data: {
                tutorId,
                mese: meseDate,
                importo: finalImporto,
                dataPagamento: new Date(dataPagamento),
                metodo: metodoPagamento,
                note,
                status,
                // Create Accounting Entry
                movimentoContabile: {
                  create: {
                    tipo: 'USCITA',
                    importo: finalImporto,
                    descrizione: `Compenso Tutor ${meseDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })} (${status})`,
                    categoria: 'Compenso Tutor',
                    data: new Date(dataPagamento)
                  }
                }
              },
            });
            results.push(payment);
          }
        }
      }
    });

    res.json({ message: 'Pagamenti registrati con successo', count: results.length });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE PAYMENT
// ============================================

/**
 * PUT /api/tutors/payments/:id
 * Aggiorna un pagamento esistente
 */
const updatePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { importo, note, proBono, status } = req.body;

    // Determine new status
    let newStatus = status || 'PAGATO';
    if (proBono) newStatus = 'PRO_BONO';

    const payment = await prisma.tutorPayment.update({
      where: { id },
      data: {
        importo: parseFloat(importo),
        note,
        status: newStatus,
        // Update associated accounting entry if exists
        movimentoContabile: {
          update: {
            importo: parseFloat(importo),
            // If pro-bono, maybe set importo to 0 in accounting too? 
            // Usually Pro Bono means 0 cost.
          }
        }
      },
      include: { movimentoContabile: true }
    });

    // If Pro Bono, ensure importo is 0? Or keep tracked amount but status PRO_BONO?
    // User said "Pro Bono (0€ - non in contabilità)".
    // If Pro Bono, we should probably DELETE the accounting entry or set it to 0.
    if (newStatus === 'PRO_BONO') {
      // Set importo to 0
      await prisma.tutorPayment.update({
        where: { id },
        data: {
          importo: 0,
          movimentoContabile: {
            delete: true // Remove from accounting
          }
        }
      });
    }

    res.json(payment);
  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE PAYMENT (Reset)
// ============================================

/**
 * DELETE /api/tutors/payments/:id
 * Elimina un pagamento e il movimento contabile associato
 */
const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Deleting TutorPayment will cascade delete AccountingEntry if configured, 
    // but our schema says SetNull on delete. 
    // Actually schema says: tutorPayment TutorPayment? @relation(..., onDelete: SetNull)
    // So we need to manually delete accounting entry or update schema to Cascade.
    // Let's manually delete for safety.

    const payment = await prisma.tutorPayment.findUnique({
      where: { id },
      include: { movimentoContabile: true }
    });

    if (payment && payment.movimentoContabile) {
      await prisma.accountingEntry.delete({
        where: { id: payment.movimentoContabile.id }
      });
    }

    await prisma.tutorPayment.delete({
      where: { id }
    });

    res.json({ message: 'Pagamento eliminato' });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE TUTOR
// ============================================

/**
 * PUT /api/tutors/:id
 * Aggiorna dati tutor (anagrafica, materie, rating)
 */
const updateTutor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, active, rating, subjects } = req.body;

    // Aggiorna User
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone,
        active,
      },
    });

    // Aggiorna TutorProfile (crea se non esiste)
    // Nota: Rating e Subjects potrebbero essere nel profilo o altrove.
    // Qui assumiamo che subjects siano nel profilo come string array o JSON.
    // Se rating è su User o Profile, aggiorniamo lì.
    // Per ora salviamo subjects in TutorProfile.materie

    if (subjects || rating) {
      await prisma.tutorProfile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          materie: subjects ? subjects.map(s => {
            const levels = [];
            if (s.levels?.medie) levels.push('Medie');
            if (s.levels?.superiori) levels.push('Superiori');
            return levels.length > 0 ? `${s.name} (${levels.join(', ')})` : s.name;
          }) : [],
          // rating: rating // Se esistesse nel modello
        },
        update: {
          // Store subjects as JSON string to preserve levels if needed, or just names if schema is strict
          // Schema says String[], so we can't easily store objects unless we encode them.
          // For now, let's store "Name|Levels" string format or just names.
          // User wants levels. Let's try to encode: "Matematica (Medie, Superiori)"
          materie: subjects ? subjects.map(s => {
            const levels = [];
            if (s.levels?.medie) levels.push('Medie');
            if (s.levels?.superiori) levels.push('Superiori');
            return levels.length > 0 ? `${s.name} (${levels.join(', ')})` : s.name;
          }) : [],
        }
      });
    }

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET TUTOR DETAIL
// ============================================

/**
 * GET /api/tutors/:id
 * Dettaglio completo tutor: anagrafica, stats, pagamenti, studenti
 */
const getTutorDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { periodo } = req.query; // Opzionale, per filtrare stats/pagamenti

    const tutor = await prisma.user.findUnique({
      where: { id },
      include: {
        tutorProfile: true,
      },
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor non trovato' });
    }

    // 1. Recupera Storico Pagamenti
    const payments = await prisma.tutorPayment.findMany({
      where: { tutorId: id },
      orderBy: { mese: 'desc' },
    });

    // 2. Recupera Studenti seguiti (distinct da lezioni)
    // Prisma non ha distinct su relazione deep facile, facciamo query raw o raggruppata
    const lessons = await prisma.lesson.findMany({
      where: { tutorId: id },
      include: {
        lessonStudents: {
          include: {
            student: true
          }
        },
        timeSlot: true, // Include timeSlot for duration calculation
      },
      orderBy: { data: 'desc' }
    });

    // Elabora studenti unici
    const studentsMap = new Map();
    let totalHours = 0;
    let lastLessonDate = null;

    for (const lesson of lessons) {
      // Calcolo ore totali (approssimato basato su durata slot o default 1h)
      // Qui assumiamo 1h per semplicità se non c'è durata, o calcoliamo da orari
      // TODO: Migliorare calcolo durata esatta
      const duration = 1; // Placeholder, idealmente (end - start)
      totalHours += duration;

      if (!lastLessonDate) lastLessonDate = lesson.data;

      for (const ls of lesson.lessonStudents) {
        if (ls.student) {
          if (!studentsMap.has(ls.student.id)) {
            studentsMap.set(ls.student.id, {
              id: ls.student.id,
              nome: `${ls.student.firstName} ${ls.student.lastName}`,
              lezioni: 0,
              ore: 0,
              ultima: lesson.data,
            });
          }
          const s = studentsMap.get(ls.student.id);
          s.lezioni++;
          s.ore += duration;
          // Aggiorna ultima se questa lezione è più recente (ma stiamo iterando desc)
        }
      }
    }

    const studentsList = Array.from(studentsMap.values());

    // 3. Calcola Stats Globali
    const stats = {
      oreTotali: totalHours,
      compensoTotale: payments.reduce((sum, p) => sum + Number(p.importo), 0),
      lezioniTotali: lessons.length,
      alunniSeguiti: studentsList.length,
      mediaMensile: 0, // TODO: Calcolare
    };

    // 4. Calcola Stats Periodo Corrente (se richiesto o default)
    let periodoObj = { tipo: 'mese', mese: new Date().getMonth() + 1, anno: new Date().getFullYear() };
    if (periodo) {
      try { periodoObj = JSON.parse(periodo); } catch (e) { }
    }
    const currentPeriodStats = await calcolaStatsTutor(id, periodoObj);

    res.json({
      tutor: {
        id: tutor.id,
        firstName: tutor.firstName,
        lastName: tutor.lastName,
        email: tutor.email,
        phone: tutor.phone,
        active: tutor.active,
        rating: 5.0, // Placeholder o da DB se aggiunto
        subjects: tutor.tutorProfile?.materie?.map(m => {
          // Parse "Name (Medie, Superiori)"
          const match = m.match(/^(.*?) \((.*?)\)$/);
          if (match) {
            const name = match[1];
            const levelsStr = match[2];
            return {
              name,
              selected: true,
              levels: {
                medie: levelsStr.includes('Medie'),
                superiori: levelsStr.includes('Superiori')
              }
            };
          }
          return { name: m, selected: true, levels: { medie: true, superiori: true } };
        }) || [],
      },
      stats,
      currentPeriodStats,
      payments,
      currentPeriodStats,
      payments,
      students: studentsList,
      lessons, // Add lessons to response for frontend calculations
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// HELPERS
// ============================================

// Tariffe Globali (Hardcoded per ora, poi da DB SystemConfig)
const TARIFFE = {
  oraSingola: 5.00,
  oraGruppo: 8.00,
  oraMaxiGruppo: 8.50,
  mezzaOraSingola: 2.50,
  mezzaOraGruppo: 4.00,
  mezzaOraMaxiGruppo: 4.00,
};

async function calcolaStatsTutor(tutorId, periodo) {
  const { start, end } = getDateRange(periodo);

  // 1. Check lezioni nel periodo (per stato Attivo)
  const lezioniCount = await prisma.lesson.count({
    where: {
      tutorId,
      data: { gte: start, lte: end },
    },
  });

  // 2. Calcola TUTTI i mesi non pagati (da prima lezione tutor a oggi)
  // Trova la prima lezione del tutor
  const firstLesson = await prisma.lesson.findFirst({
    where: { tutorId },
    orderBy: { data: 'asc' },
    select: { data: true }
  });

  const mesiNonPagati = [];
  let totaleDovuto = 0;

  if (firstLesson) {
    // Genera lista mesi dalla prima lezione fino a fine mese SCORSO (non includiamo mese corrente se incompleto)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start from first lesson month
    const current = new Date(firstLesson.data.getFullYear(), firstLesson.data.getMonth(), 1);

    // Itera tutti i mesi fino al mese scorso (incluso)
    while (current < currentMonthStart) {
      const meseStart = new Date(current.getFullYear(), current.getMonth(), 1);

      // Calcola compenso mese
      const compenso = await calcolaCompensoMese(prisma, tutorId, meseStart);

      // Check se pagato (UTC comparison)
      const meseStartUTC = new Date(Date.UTC(meseStart.getFullYear(), meseStart.getMonth(), 1));

      // Fetch all payments for this month (UTC)
      const payments = await prisma.tutorPayment.findMany({
        where: {
          tutorId,
          mese: meseStartUTC,
        },
      });

      const totalePagato = payments.reduce((sum, p) => sum + Number(p.importo), 0);
      const rimanente = compenso.totaleArrotondato - totalePagato;

      // If there is a remaining amount AND there were lessons this month, add to unpaid list
      if (rimanente > 0.01 && compenso.totaleArrotondato > 0) {
        mesiNonPagati.push({
          date: meseStartUTC,
          importo: rimanente
        });
        totaleDovuto += rimanente;
      }

      current.setMonth(current.getMonth() + 1);
    }
  }

  return {
    hasLezioniInPeriod: lezioniCount > 0,
    mesiNonPagati,
    totaleDovuto,
  };
}

async function calcolaCompensoMese(tx, tutorId, meseDate) {
  const start = new Date(meseDate.getFullYear(), meseDate.getMonth(), 1);
  const end = new Date(meseDate.getFullYear(), meseDate.getMonth() + 1, 0, 23, 59, 59);

  const lezioni = await tx.lesson.findMany({
    where: {
      tutorId,
      data: { gte: start, lte: end },
    },
    include: { lessonStudents: true },
  });

  let totaleGrezzo = 0;

  // Logica calcolo (semplificata basata su tipo lezione salvato)
  // TODO: Affinare se servono dettagli ore singole/gruppo specifici per UI
  for (const lezione of lezioni) {
    // Usa compenso salvato se esiste, altrimenti ricalcola (fallback)
    if (lezione.compensoTutor) {
      totaleGrezzo += parseFloat(lezione.compensoTutor);
    } else {
      // Fallback calcolo al volo
      // ... logica complessa lessonCalculations.js ...
    }
  }

  return {
    totaleGrezzo,
    totaleArrotondato: Math.floor(totaleGrezzo),
  };
}

function getDateRange(periodo) {
  if (periodo.tipo === 'anno') {
    return {
      start: new Date(periodo.anno, 0, 1),
      end: new Date(periodo.anno, 11, 31, 23, 59, 59),
    };
  } else {
    return {
      start: new Date(periodo.anno, periodo.mese - 1, 1),
      end: new Date(periodo.anno, periodo.mese, 0, 23, 59, 59),
    };
  }
}

// ============================================
// DELETE TUTOR
// ============================================

/**
 * DELETE /api/tutors/:id
 * Elimina un tutor (solo se non ha pagamenti associati)
 */
const deleteTutor = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verifica se il tutor esiste
    const tutor = await prisma.user.findUnique({
      where: { id },
      include: {
        tutorPayments: true,
        tutorProfile: true
      }
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor non trovato' });
    }

    // Non permettere eliminazione se ci sono pagamenti associati
    if (tutor.tutorPayments && tutor.tutorPayments.length > 0) {
      return res.status(400).json({
        error: `Impossibile eliminare: questo tutor ha ${tutor.tutorPayments.length} pagamento/i associati. Puoi solo disattivarlo.`
      });
    }

    // Elimina in transazione: prima profilo, poi utente
    await prisma.$transaction(async (tx) => {
      // Elimina TutorProfile se esiste
      if (tutor.tutorProfile) {
        await tx.tutorProfile.delete({
          where: { userId: id }
        });
      }

      // Elimina User
      await tx.user.delete({
        where: { id }
      });
    });

    res.json({ message: 'Tutor eliminato con successo' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTutors,
  createTutor,
  getTutorStats,
  getTutorDetail,
  updateTutor,
  deleteTutor,
  payTutors,
  updatePayment,
  deletePayment,
  checkDuplicateTutor,
};
