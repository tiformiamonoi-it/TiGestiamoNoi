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

        // Recupera nome tutor per la descrizione
        const tutorData = await tx.user.findUnique({
          where: { id: tutorId },
          select: { firstName: true, lastName: true }
        });
        const tutorName = tutorData ? `${tutorData.firstName} ${tutorData.lastName}` : 'Tutor';

        for (const meseItem of mesi) {
          // Handle both string (old) and object (new) formats
          let meseStr, importoOverride, statusOverride, proBono;

          if (typeof meseItem === 'string') {
            meseStr = meseItem;
          } else {
            meseStr = meseItem.date;
            importoOverride = meseItem.importo;
            statusOverride = meseItem.status;
            proBono = meseItem.proBono || false;
          }

          // Force UTC midnight for consistency
          const d = new Date(meseStr);
          const meseDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));

          // Calcola importo dovuto per quel mese (sicurezza/default)
          const compenso = await calcolaCompensoMese(tx, tutorId, meseDate);

          // Determine final amount and status
          let finalImporto;
          let status;

          if (proBono) {
            // Pro Bono: importo = 0, status = PRO_BONO, NO accounting entry
            finalImporto = 0;
            status = 'PRO_BONO';
          } else {
            // Normal payment
            finalImporto = importoOverride !== undefined ? parseFloat(importoOverride) : compenso.totaleArrotondato;
            status = statusOverride || 'PAGATO';
          }

          // Create payment record (even for Pro Bono, but with importo=0)
          const meseLabel = meseDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

          // Build payment data
          const paymentData = {
            tutorId,
            mese: meseDate,
            importo: finalImporto,
            dataPagamento: new Date(dataPagamento),
            metodo: metodoPagamento,
            note: proBono ? (note ? `${note} [PRO BONO]` : '[PRO BONO]') : note,
            status,
          };

          // Only create accounting entry if NOT Pro Bono and importo > 0
          if (!proBono && finalImporto > 0) {
            paymentData.movimentoContabile = {
              create: {
                tipo: 'USCITA',
                importo: finalImporto,
                descrizione: `Compenso ${tutorName} - ${meseLabel} (${status})`,
                categoria: 'Compenso Tutor',
                data: new Date(dataPagamento)
              }
            };
          }

          const payment = await tx.tutorPayment.create({
            data: paymentData,
          });
          results.push(payment);
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
    // Genera lista mesi dalla prima lezione fino al mese corrente (incluso)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start from first lesson month
    const current = new Date(firstLesson.data.getFullYear(), firstLesson.data.getMonth(), 1);

    // Itera tutti i mesi fino al mese corrente (incluso)
    while (current <= currentMonthStart) {
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

      // Check if there's a Pro Bono payment - if so, month is considered fully paid
      const hasProBono = payments.some(p => p.status === 'PRO_BONO');

      if (hasProBono) {
        // Pro Bono = fully covered, don't add to unpaid list
        current.setMonth(current.getMonth() + 1);
        continue;
      }

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

// ============================================
// GET MONTHLY PERFORMANCE
// ============================================

/**
 * GET /api/tutors/:id/monthly-performance
 * Calcola performance mensile: margine, ricavo, compenso, media per lezione
 */
const getMonthlyPerformance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mesi = 6 } = req.query;

    const numMesi = parseInt(mesi);
    const now = new Date();
    const results = [];

    // Calcola per ogni mese (dal più recente al più vecchio)
    for (let i = 0; i < numMesi; i++) {
      const meseDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const meseEnd = new Date(meseDate.getFullYear(), meseDate.getMonth() + 1, 0, 23, 59, 59);

      // Recupera lezioni del tutor per questo mese
      const lezioni = await prisma.lesson.findMany({
        where: {
          tutorId: id,
          data: { gte: meseDate, lte: meseEnd }
        },
        include: {
          lessonStudents: {
            include: {
              student: {
                include: {
                  packages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      // Calcoli
      const numLezioni = lezioni.length;
      let oreTotali = 0;
      let compensoTutor = 0;
      let ricavoGenerato = 0;
      const studentiSet = new Set();

      for (const lezione of lezioni) {
        // Ore (assumiamo 1h per lezione come default, o calcoliamo da durata)
        oreTotali += lezione.durata || 1;

        // Compenso tutor
        compensoTutor += parseFloat(lezione.compensoTutor || 0);

        // Studenti unici
        for (const ls of lezione.lessonStudents) {
          if (ls.student) {
            studentiSet.add(ls.student.id);

            // Ricavo: calcoliamo quanto vale questa lezione dal pacchetto studente
            // Tariffa oraria = prezzo pacchetto / ore pacchetto
            const pkg = ls.student.packages?.[0];
            if (pkg && pkg.oreIncluse > 0) {
              const tariffaOraria = parseFloat(pkg.prezzoTotale) / pkg.oreIncluse;
              const durata = ls.mezzaLezione ? 0.5 : (lezione.durata || 1);
              ricavoGenerato += tariffaOraria * durata;
            } else {
              // Fallback: usa prezzo medio lezione (25€/h)
              const durata = ls.mezzaLezione ? 0.5 : (lezione.durata || 1);
              ricavoGenerato += 25 * durata;
            }
          }
        }
      }

      // Margine
      const margine = ricavoGenerato - compensoTutor;
      const marginePercentuale = ricavoGenerato > 0 ? (margine / ricavoGenerato) * 100 : 0;
      const mediaEntrateLezione = numLezioni > 0 ? ricavoGenerato / numLezioni : 0;

      results.push({
        mese: meseDate.toISOString(),
        meseLabel: meseDate.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' }),
        numLezioni,
        oreTotali: Math.round(oreTotali * 10) / 10,
        numStudenti: studentiSet.size,
        ricavoGenerato: Math.round(ricavoGenerato * 100) / 100,
        compensoTutor: Math.round(compensoTutor * 100) / 100,
        margine: Math.round(margine * 100) / 100,
        marginePercentuale: Math.round(marginePercentuale),
        mediaEntrateLezione: Math.round(mediaEntrateLezione * 100) / 100
      });
    }

    // Calcola totali/medie
    const totali = {
      lezioni: results.reduce((sum, r) => sum + r.numLezioni, 0),
      ore: results.reduce((sum, r) => sum + r.oreTotali, 0),
      ricavo: results.reduce((sum, r) => sum + r.ricavoGenerato, 0),
      compenso: results.reduce((sum, r) => sum + r.compensoTutor, 0),
      margine: results.reduce((sum, r) => sum + r.margine, 0)
    };
    totali.marginePercentuale = totali.ricavo > 0 ? Math.round((totali.margine / totali.ricavo) * 100) : 0;
    totali.mediaMargineMensile = results.length > 0 ? Math.round(totali.margine / results.length) : 0;

    res.json({
      performance: results.reverse(), // Dal più vecchio al più recente per il grafico
      totali
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE COMPENSO MENSILE (Override)
// ============================================

/**
 * PUT /api/tutors/:id/compenso-mensile
 * Modifica l'importo del compenso per un mese specifico
 * Crea un record TutorPaymentAdjustment o aggiorna il compenso calcolato
 */
const updateCompensoMensile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mese, nuovoImporto, note } = req.body;

    if (!mese || nuovoImporto === undefined) {
      return res.status(400).json({ error: 'mese e nuovoImporto sono obbligatori' });
    }

    // Parse mese
    const meseDate = new Date(mese);
    const meseStartUTC = new Date(Date.UTC(meseDate.getFullYear(), meseDate.getMonth(), 1));

    // Verifica che il mese sia terminato
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    if (meseStartUTC >= currentMonthStart) {
      return res.status(400).json({ error: 'Non puoi modificare il compenso di un mese non ancora terminato' });
    }

    // Trova tutor
    const tutor = await prisma.user.findUnique({
      where: { id },
      select: { firstName: true, lastName: true }
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor non trovato' });
    }

    // Calcola il compenso originale del mese
    const compensoOriginale = await calcolaCompensoMese(prisma, id, meseDate);
    const differenza = parseFloat(nuovoImporto) - compensoOriginale.totaleArrotondato;

    // Verifica se esiste già un adjustment per questo mese
    // Cerchiamo un pagamento con status='ADJUSTMENT' per questo mese
    const existingAdjustment = await prisma.tutorPayment.findFirst({
      where: {
        tutorId: id,
        mese: meseStartUTC,
        status: 'ADJUSTMENT'
      }
    });

    const tutorName = `${tutor.firstName} ${tutor.lastName}`;
    const meseLabel = meseDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    if (existingAdjustment) {
      // Aggiorna adjustment esistente
      await prisma.$transaction(async (tx) => {
        // Aggiorna il pagamento
        await tx.tutorPayment.update({
          where: { id: existingAdjustment.id },
          data: {
            importo: differenza,
            note: note || `Modifica compenso ${meseLabel}: da €${compensoOriginale.totaleArrotondato} a €${nuovoImporto}`
          }
        });

        // Aggiorna movimento contabile se esiste
        if (existingAdjustment.movimentoContabileId) {
          await tx.accountingEntry.update({
            where: { tutorPaymentId: existingAdjustment.id },
            data: {
              importo: Math.abs(differenza),
              tipo: differenza >= 0 ? 'USCITA' : 'ENTRATA', // Se differenza negativa = riduzione costo = entrata
              descrizione: `Adjustment Compenso ${meseLabel} - ${tutorName}`
            }
          });
        }
      });

      res.json({
        message: `Compenso ${meseLabel} aggiornato a €${nuovoImporto}`,
        adjustment: 'updated'
      });
    } else if (Math.abs(differenza) > 0.01) {
      // Crea nuovo adjustment solo se c'è differenza
      const adjustment = await prisma.tutorPayment.create({
        data: {
          tutorId: id,
          mese: meseStartUTC,
          importo: differenza,
          dataPagamento: new Date(),
          metodo: 'ALTRO',
          status: 'ADJUSTMENT',
          note: note || `Modifica compenso ${meseLabel}: da €${compensoOriginale.totaleArrotondato} a €${nuovoImporto}`,
          // Crea movimento contabile solo se differenza significativa
          movimentoContabile: {
            create: {
              tipo: differenza >= 0 ? 'USCITA' : 'ENTRATA',
              importo: Math.abs(differenza),
              descrizione: `Adjustment Compenso ${meseLabel} - ${tutorName}`,
              categoria: 'Adjustment Compenso',
              data: new Date()
            }
          }
        }
      });

      res.json({
        message: `Compenso ${meseLabel} aggiornato a €${nuovoImporto}`,
        adjustment: 'created',
        differenza
      });
    } else {
      // Nessuna differenza, rimuovi adjustment se esiste
      res.json({
        message: `Nessuna modifica necessaria, importo già €${nuovoImporto}`,
        adjustment: 'no_change'
      });
    }
  } catch (error) {
    next(error);
  }
};

// ============================================
// GET DETAILED STATS (Distributions, Top Students, Preferences)
// ============================================

/**
 * GET /api/tutors/:id/detailed-stats
 * Returns: ore distribution by type, top 5 students, preferred days/hours
 * Query: mesi (default 6), includeCurrent (default true)
 */
const getDetailedStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { mesi = 6, includeCurrent = 'true' } = req.query;

    const numMesi = parseInt(mesi);
    const includeCurrentMonth = includeCurrent === 'true';
    const now = new Date();

    // Calculate date range
    // If mesi=0, only include current month
    // Otherwise, go back X months from current or previous month
    let startDate, endDate;

    if (numMesi === 0) {
      // Only current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else {
      // Last X months
      const startOffset = includeCurrentMonth ? numMesi - 1 : numMesi;
      const endOffset = includeCurrentMonth ? 0 : 1;
      startDate = new Date(now.getFullYear(), now.getMonth() - startOffset, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() - endOffset + 1, 0, 23, 59, 59);
    }

    // Fetch all lessons in period with related data
    const lezioni = await prisma.lesson.findMany({
      where: {
        tutorId: id,
        data: { gte: startDate, lte: endDate }
      },
      include: {
        lessonStudents: {
          include: {
            student: true
          }
        },
        timeSlot: true
      },
      orderBy: { data: 'desc' }
    });

    // 1. DISTRIBUZIONE ORE PER TIPO
    const distribuzione = {
      singole: { ore: 0, lezioni: 0 },
      gruppo: { ore: 0, lezioni: 0 },
      maxi: { ore: 0, lezioni: 0 }
    };

    for (const l of lezioni) {
      const tipo = (l.tipo || 'SINGOLA').toLowerCase();
      const durata = l.durata || 1;

      if (tipo === 'singola') {
        distribuzione.singole.ore += durata;
        distribuzione.singole.lezioni++;
      } else if (tipo === 'gruppo') {
        distribuzione.gruppo.ore += durata;
        distribuzione.gruppo.lezioni++;
      } else if (tipo === 'maxi') {
        distribuzione.maxi.ore += durata;
        distribuzione.maxi.lezioni++;
      }
    }

    // Calculate totals and percentages
    const totalOre = distribuzione.singole.ore + distribuzione.gruppo.ore + distribuzione.maxi.ore;
    distribuzione.singole.percentuale = totalOre > 0 ? Math.round((distribuzione.singole.ore / totalOre) * 100) : 0;
    distribuzione.gruppo.percentuale = totalOre > 0 ? Math.round((distribuzione.gruppo.ore / totalOre) * 100) : 0;
    distribuzione.maxi.percentuale = totalOre > 0 ? Math.round((distribuzione.maxi.ore / totalOre) * 100) : 0;

    // 2. TOP 5 ALUNNI (by hours with this tutor)
    const studentStats = new Map();

    for (const l of lezioni) {
      for (const ls of l.lessonStudents) {
        if (!ls.student) continue;

        const studentId = ls.student.id;
        if (!studentStats.has(studentId)) {
          studentStats.set(studentId, {
            id: studentId,
            nome: `${ls.student.firstName} ${ls.student.lastName}`,
            ore: 0,
            lezioni: 0,
            ultima: l.data
          });
        }

        const stats = studentStats.get(studentId);
        const durata = ls.mezzaLezione ? 0.5 : (l.durata || 1);
        stats.ore += durata;
        stats.lezioni++;
        if (l.data > stats.ultima) stats.ultima = l.data;
      }
    }

    const top5Alunni = Array.from(studentStats.values())
      .sort((a, b) => b.ore - a.ore)
      .slice(0, 5)
      .map(s => ({
        ...s,
        ore: Math.round(s.ore * 10) / 10
      }));

    // 3. GIORNI/ORARI PREFERITI
    const giorniCount = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const orariCount = new Map();
    const giorniNomi = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

    for (const l of lezioni) {
      const giorno = new Date(l.data).getDay();
      giorniCount[giorno]++;

      if (l.timeSlot) {
        const fascia = `${l.timeSlot.oraInizio}-${l.timeSlot.oraFine}`;
        orariCount.set(fascia, (orariCount.get(fascia) || 0) + 1);
      }
    }

    // Sort and get top days
    const giorniPreferiti = Object.entries(giorniCount)
      .filter(([_, count]) => count > 0)
      .map(([giorno, count]) => ({
        giorno: giorniNomi[parseInt(giorno)],
        count,
        percentuale: lezioni.length > 0 ? Math.round((count / lezioni.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Sort and get top time slots
    const orariPreferiti = Array.from(orariCount.entries())
      .map(([fascia, count]) => ({
        fascia,
        count,
        percentuale: lezioni.length > 0 ? Math.round((count / lezioni.length) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      periodo: {
        da: startDate.toISOString(),
        a: endDate.toISOString(),
        mesi: numMesi || 1,
        totalLezioni: lezioni.length,
        totalOre: Math.round(totalOre * 10) / 10
      },
      distribuzioneOre: distribuzione,
      top5Alunni,
      giorniPreferiti,
      orariPreferiti
    });
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
  updateCompensoMensile,
  getMonthlyPerformance,
  getDetailedStats,
};
