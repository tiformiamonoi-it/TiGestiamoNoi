// backend/src/controllers/students.controller.js
// Controller per gestione studenti

const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');

/**
 * GET /api/students
 * Lista tutti gli studenti (con paginazione)
 */
const getStudents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      offset,
      search,
      active,
      scuola,
      stato,
      pacchetto,
      oreNegative,
      pagamentoSospeso
    } = req.query;

    // Usa offset se fornito, altrimenti calcola da page
    const skip = offset !== undefined ? parseInt(offset) : (page - 1) * limit;

    // Costruisci filtri BASE
    const where = {};

    if (active !== undefined) {
      if (active === 'true') {
        // Mostra solo attivi: active=true E almeno un pacchetto
        where.active = true;
        where.pacchetti = {
          some: {}
        };
      } else {
        where.active = false;
      }
    }

    // Filtro ricerca
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro scuola (usa contains per match parziale)
    // FILTRO LIVELLO SCOLASTICO (usa campo classe)
    if (scuola) {
      where.classe = {
        contains: scuola,
        mode: 'insensitive',
      };
    }

    // Query database CON tutti gli include
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          pacchetti: {
            where: {
              stati: {
                hasSome: ['ATTIVO', 'DA_PAGARE', 'DA_RINNOVARE', 'ESAURITO', 'SCADUTO', 'NEGATIVO']
              },
            },
            select: {
              id: true,
              nome: true,
              tipo: true,
              stati: true,
              oreAcquistate: true,
              oreResiduo: true,
              giorniAcquistati: true,
              giorniResiduo: true,
              orarioGiornaliero: true,
              prezzoTotale: true,
              importoPagato: true,
              importoResiduo: true,
              dataInizio: true,
              dataScadenza: true,
              lessonStudents: {
                select: {
                  id: true,
                  lesson: {
                    select: {
                      id: true,
                      data: true,
                    }
                  }
                },
              },
            },
            orderBy: { createdAt: 'asc' }, // ✅ PIÙ VECCHIO
            take: 1,
          },
          _count: {
            select: {
              lessonStudents: true  // ✅ CAMBIATO da lezioni a lessonStudents
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    // Formatta e FILTRA studenti
    let studentsFormatted = students.map((student) => {
      const pacchettoAttivo = student.pacchetti[0] || null;

      if (!pacchettoAttivo) {
        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          parentName: student.parentName,
          scuola: student.scuola,
          classe: student.classe,
          phone: student.parentPhone,
          email: student.parentEmail,
          active: student.active,
          createdAt: student.createdAt,
          totalLessons: student._count.lessonStudents, // ✅ CAMBIATO
          pacchettoAttivo: null,
        };
      }

      // CALCOLA GIORNI USATI
      let giorniUsati = 0;
      // ✅ CAMBIATO da pacchettoAttivo.lezioni a lessonStudents
      if (pacchettoAttivo.tipo === 'MENSILE' && pacchettoAttivo.lessonStudents) {
        const dateUniche = new Set(
          pacchettoAttivo.lessonStudents.map(ls => ls.lesson.data.toISOString().split('T')[0])
        );
        giorniUsati = dateUniche.size;
      }

      const oreUsate = pacchettoAttivo.tipo === 'ORE'
        ? parseFloat(pacchettoAttivo.oreAcquistate || 0) - parseFloat(pacchettoAttivo.oreResiduo || 0)
        : 0;

      const giorniResiduoDB = pacchettoAttivo.giorniResiduo || 0;
      const giorniTotali = pacchettoAttivo.giorniAcquistati || 0;

      // CORREGGI giorni usati se residuo negativo
      if (pacchettoAttivo.tipo === 'MENSILE' && giorniResiduoDB < 0) {
        giorniUsati = giorniTotali + Math.abs(giorniResiduoDB);
      }

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        parentName: student.parentName,
        scuola: student.scuola,
        classe: student.classe,
        phone: student.parentPhone,
        email: student.parentEmail,
        active: student.active,
        createdAt: student.createdAt,
        totalLessons: student._count.lessonStudents, // ✅ CAMBIATO
        pacchettoAttivo: {
          id: pacchettoAttivo.id,
          nome: pacchettoAttivo.nome,
          tipo: pacchettoAttivo.tipo,
          stati: pacchettoAttivo.stati,
          oreAcquistate: parseFloat(pacchettoAttivo.oreAcquistate || 0),
          oreResiduo: parseFloat(pacchettoAttivo.oreResiduo || 0),
          oreUsate: oreUsate,
          oreTotali: parseFloat(pacchettoAttivo.oreAcquistate || 0),
          giorniAcquistati: pacchettoAttivo.giorniAcquistati || 0,
          giorniUsati: giorniUsati,
          giorniResiduo: giorniResiduoDB,
          giorniTotali: giorniTotali,
          importoTotale: parseFloat(pacchettoAttivo.prezzoTotale || 0),
          importoPagato: parseFloat(pacchettoAttivo.importoPagato || 0),
          importoResiduo: parseFloat(pacchettoAttivo.importoResiduo || 0),
          dataAcquisto: pacchettoAttivo.dataInizio,
          dataScadenza: pacchettoAttivo.dataScadenza,
          pagamentoSaldato: parseFloat(pacchettoAttivo.importoResiduo || 0) === 0,
        },
      };
    });

    // ====================================
    // APPLICA FILTRI POST-QUERY
    // ====================================

    // Filtro TIPO PACCHETTO (mensile/orario)
    if (pacchetto) {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return false;
        if (pacchetto === 'mensile') return s.pacchettoAttivo.tipo === 'MENSILE';
        if (pacchetto === 'orario') return s.pacchettoAttivo.tipo === 'ORE';
        return true;
      });
    }

    // Filtro ORE NEGATIVE
    if (oreNegative === 'true') {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return false;
        const residuo = s.pacchettoAttivo.tipo === 'MENSILE'
          ? s.pacchettoAttivo.giorniResiduo
          : s.pacchettoAttivo.oreResiduo;
        return residuo < 0;
      });
    }

    // Filtro PAGAMENTO SOSPESO
    if (pagamentoSospeso === 'true') {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return false;
        return s.pacchettoAttivo.importoResiduo > 0;
      });
    }

    // Filtro STATO (calcolato dinamicamente)
    if (stato) {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return stato === 'inattivo';

        const pacchetto = s.pacchettoAttivo;
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        const dataScadenza = pacchetto.dataScadenza ? new Date(pacchetto.dataScadenza) : null;
        if (dataScadenza) dataScadenza.setHours(0, 0, 0, 0);

        const giorniAllaScadenza = dataScadenza
          ? Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24))
          : null;

        const isPagato = pacchetto.importoResiduo === 0;
        const isScaduto = dataScadenza && oggi > dataScadenza;
        const isInScadenza = dataScadenza && giorniAllaScadenza >= 0 && giorniAllaScadenza <= 2;

        const quantitaResidua = pacchetto.tipo === 'MENSILE'
          ? pacchetto.giorniResiduo
          : pacchetto.oreResiduo;

        const isEsaurito = quantitaResidua <= 0;

        // Mappa stati (con esclusioni per Pagato)
        if (stato === 'attivo' && !isScaduto && !isEsaurito && quantitaResidua > 0 && !isPagato) return true;
        if (stato === 'scaduto' && isScaduto && !isPagato) return true;
        if (stato === 'ore_negative' && quantitaResidua < 0) return true;
        if (stato === 'in_scadenza' && isInScadenza && !isScaduto && !isPagato) return true;
        if (stato === 'esaurito' && isEsaurito && !isPagato) return true;

        return false;
      });
    }

    res.json({
      students: studentsFormatted,
      total: studentsFormatted.length, // Total dopo filtri
      pagination: {
        total: studentsFormatted.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(studentsFormatted.length / limit),
      },
    });
  } catch (error) {
    console.error('Errore getStudents:', error);
    next(error);
  }
};

/**
 * GET /api/students/:id
 * Dettaglio studente con pacchetti e lezioni
 */
const { updateAllStudentPackageStates } = require('../utils/packageStates');

/**
 * GET /api/students/:id
 * Dettaglio studente con pacchetti e lezioni
 */
/**
 * GET /api/students/:id
 * Dettaglio studente con pacchetti e lezioni
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ LAZY UPDATE: Aggiorna stati pacchetti prima di restituire
    await updateAllStudentPackageStates(id);

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        pacchetti: {
          include: {
            standardPackage: true,
            pagamenti: true,
            _count: { select: { lessonStudents: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        lessonStudents: {
          include: {
            lesson: {
              include: {
                tutor: { select: { firstName: true, lastName: true } },
                timeSlot: true,
              }
            }
          },
          orderBy: { lesson: { data: 'desc' } },
          take: 10,
        },
        // Includi referral relations
        referredBy: {
          include: {
            referrer: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Studente non trovato' });
    }

    res.json({ student });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/students
 * Crea nuovo studente
 */
const createStudent = async (req, res, next) => {
  try {
    // Validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await prisma.student.create({
      data: req.body,
    });

    res.status(201).json({
      message: 'Studente creato con successo',
      student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/students/:id
 * Aggiorna studente
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await prisma.student.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: 'Studente aggiornato con successo',
      student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/students/:id
 * Elimina studente (soft delete - disattiva)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete: disattiva invece di eliminare
    const student = await prisma.student.update({
      where: { id },
      data: { active: false },
    });

    res.json({
      message: 'Studente disattivato con successo',
      student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/check-duplicate
 * Controlla se esiste già uno studente con stesso nome e cognome
 */
const checkDuplicate = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.query;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName e lastName sono obbligatori' });
    }

    const existingStudents = await prisma.student.findMany({
      where: {
        firstName: { equals: firstName.trim(), mode: 'insensitive' },
        lastName: { equals: lastName.trim(), mode: 'insensitive' },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        classe: true,
        scuola: true,
        active: true,
      },
    });

    res.json({
      hasDuplicate: existingStudents.length > 0,
      duplicates: existingStudents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/students/search-for-referral
 * Cerca studenti per autocomplete referral (esclude lo studente corrente)
 */
const searchStudentsForReferral = async (req, res, next) => {
  try {
    const { query, excludeId } = req.query;

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { firstName: { contains: query || '', mode: 'insensitive' } },
          { lastName: { contains: query || '', mode: 'insensitive' } },
        ],
        NOT: excludeId ? { id: excludeId } : undefined,
        active: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        classe: true,
      },
      take: 10,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });

    res.json({ students });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/students/:id/referrals
 * Aggiunge un referral allo studente
 */
const addReferral = async (req, res, next) => {
  try {
    const { id } = req.params; // ID dello studente che è stato portato
    const { referrerId } = req.body; // ID dello studente che ha portato

    if (!referrerId) {
      return res.status(400).json({ error: 'referrerId è obbligatorio' });
    }

    if (id === referrerId) {
      return res.status(400).json({ error: 'Uno studente non può essere referral di se stesso' });
    }

    const referral = await prisma.studentReferral.create({
      data: {
        referredId: id,
        referrerId: referrerId,
      },
      include: {
        referrer: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    res.status(201).json({
      message: 'Referral aggiunto con successo',
      referral
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Questo referral esiste già' });
    }
    next(error);
  }
};

/**
 * DELETE /api/students/:id/referrals/:referrerId
 * Rimuove un referral dallo studente
 */
const removeReferral = async (req, res, next) => {
  try {
    const { id, referrerId } = req.params;

    await prisma.studentReferral.delete({
      where: {
        referredId_referrerId: {
          referredId: id,
          referrerId: referrerId,
        }
      }
    });

    res.json({ message: 'Referral rimosso con successo' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Referral non trovato' });
    }
    next(error);
  }
};

/**
 * GET /api/students/:id/delete-info
 * Ottiene informazioni su cosa verrà eliminato con lo studente
 */
const getDeleteInfo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        pacchetti: {
          include: {
            pagamenti: true,
            lessonStudents: {
              include: {
                lesson: {
                  select: { data: true }
                }
              }
            }
          }
        },
        lessonStudents: {
          include: {
            lesson: {
              select: { id: true, data: true }
            }
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Studente non trovato' });
    }

    // Calcola le info
    const packagesCount = student.pacchetti.length;
    const paymentsCount = student.pacchetti.reduce((sum, pkg) => sum + pkg.pagamenti.length, 0);

    // Lezioni uniche (uno studente può avere più lessonStudents per la stessa lesson)
    const uniqueLessons = new Map();
    student.lessonStudents.forEach(ls => {
      if (!uniqueLessons.has(ls.lesson.id)) {
        uniqueLessons.set(ls.lesson.id, ls.lesson.data);
      }
    });

    const lessonsCount = uniqueLessons.size;
    const lessonDates = Array.from(uniqueLessons.values())
      .sort((a, b) => new Date(b) - new Date(a))
      .slice(0, 10); // Ultime 10 date

    res.json({
      studentName: `${student.firstName} ${student.lastName}`,
      packagesCount,
      paymentsCount,
      lessonsCount,
      lessonDates,
      hasMoreLessons: lessonsCount > 10
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/students/:id/hard-delete
 * Elimina definitivamente lo studente e tutti i dati collegati
 */
const hardDeleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verifica che lo studente esista
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        pacchetti: {
          include: {
            pagamenti: true
          }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Studente non trovato' });
    }

    // Transazione per eliminare tutto in modo atomico
    await prisma.$transaction(async (tx) => {
      // 1. Elimina movimenti contabili legati ai pagamenti
      for (const pkg of student.pacchetti) {
        for (const pag of pkg.pagamenti) {
          await tx.accountingEntry.deleteMany({
            where: { paymentId: pag.id }
          });
        }
      }

      // 2. Elimina movimenti contabili legati ai pacchetti
      for (const pkg of student.pacchetti) {
        await tx.accountingEntry.deleteMany({
          where: { packageId: pkg.id }
        });
      }

      // 3. Elimina pagamenti (cascade da Package dovrebbe gestirlo, ma per sicurezza)
      for (const pkg of student.pacchetti) {
        await tx.payment.deleteMany({
          where: { packageId: pkg.id }
        });
      }

      // 4. Elimina lessonStudents (la relazione studente-lezione)
      await tx.lessonStudent.deleteMany({
        where: { studentId: id }
      });

      // 5. Elimina pacchetti
      await tx.package.deleteMany({
        where: { studentId: id }
      });

      // 6. Elimina referral (sia come referred che come referrer)
      await tx.studentReferral.deleteMany({
        where: {
          OR: [
            { referredId: id },
            { referrerId: id }
          ]
        }
      });

      // 7. Elimina lo studente
      await tx.student.delete({
        where: { id }
      });
    });

    res.json({
      message: 'Studente eliminato definitivamente con tutti i dati collegati',
      deleted: {
        student: `${student.firstName} ${student.lastName}`,
        packages: student.pacchetti.length,
        payments: student.pacchetti.reduce((sum, pkg) => sum + pkg.pagamenti.length, 0)
      }
    });
  } catch (error) {
    console.error('Errore hard delete studente:', error);
    next(error);
  }
};

// ============================================
// ANNUAL PAYMENTS - Vista calendario pagamenti
// ============================================

const getAnnualPayments = async (req, res, next) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const yearNum = parseInt(year);

    // Get all students with their packages and payments for the given year
    const students = await prisma.student.findMany({
      include: {
        pacchetti: {
          include: {
            pagamenti: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    const result = students.map(student => {
      // For each student, create monthly cells
      const months = [];
      let totalPaid = 0;
      let totalUnpaid = 0;
      let isActive = false;

      for (let month = 1; month <= 12; month++) {
        const monthStart = new Date(yearNum, month - 1, 1);
        const monthEnd = new Date(yearNum, month, 0, 23, 59, 59);

        // Find packages active in this month
        const activePackages = student.pacchetti.filter(pkg => {
          const pkgStart = new Date(pkg.dataInizio);
          const pkgEnd = pkg.dataFine ? new Date(pkg.dataFine) : null;

          // Package overlaps with this month
          return pkgStart <= monthEnd && (!pkgEnd || pkgEnd >= monthStart);
        });

        if (activePackages.length === 0) {
          months.push({
            month,
            status: 'empty',
            amount: null
          });
          continue;
        }

        isActive = true;

        // Calculate total amount due for this month from active packages
        const monthlyPackages = activePackages.filter(pkg => pkg.tipo === 'MENSILE');
        const totalDue = monthlyPackages.reduce((sum, pkg) => sum + Number(pkg.prezzo || pkg.prezzoTotale || 0), 0);

        // Find payments made for this month
        const monthPayments = activePackages.flatMap(pkg =>
          (pkg.pagamenti || []).filter(pmt => {
            const pmtDate = new Date(pmt.dataPagamento || pmt.createdAt);
            // Consider payment for this month if it was made within the month period
            // or if the package is for this month
            const pkgMonth = new Date(pkg.dataInizio).getMonth() + 1;
            const pkgYear = new Date(pkg.dataInizio).getFullYear();
            return (pkgYear === yearNum && pkgMonth === month) ||
              (pmtDate.getMonth() + 1 === month && pmtDate.getFullYear() === yearNum);
          })
        );

        const paidAmount = monthPayments.reduce((sum, pmt) => sum + Number(pmt.importo || 0), 0);

        // Determine status
        const oggi = new Date();
        let status = 'empty';

        if (totalDue > 0 || paidAmount > 0) {
          if (monthEnd > oggi) {
            status = 'future';
          } else if (paidAmount >= totalDue && totalDue > 0) {
            status = 'paid';
            totalPaid += paidAmount;
          } else if (totalDue > 0) {
            status = 'unpaid';
            totalUnpaid += (totalDue - paidAmount);
            totalPaid += paidAmount;
          }
        }

        months.push({
          month,
          status,
          amount: status === 'paid' ? paidAmount : (totalDue > 0 ? totalDue : null),
          paidDate: monthPayments.length > 0 ?
            new Date(monthPayments[0].dataPagamento || monthPayments[0].createdAt).toLocaleDateString('it-IT') : null,
          packageId: activePackages[0]?.id
        });
      }

      return {
        studentId: student.id,
        studentName: `${student.lastName} ${student.firstName}`,
        months,
        totalPaid: Math.round(totalPaid),
        totalUnpaid: Math.round(totalUnpaid),
        isActive
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Errore getAnnualPayments:', error);
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  checkDuplicate,
  searchStudentsForReferral,
  addReferral,
  removeReferral,
  getDeleteInfo,
  hardDeleteStudent,
  getAnnualPayments,
};

