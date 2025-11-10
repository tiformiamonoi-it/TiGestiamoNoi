// backend/src/controllers/packages.controller.js
// Controller per pacchetti studenti

const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');
const { updatePackageStates } = require('../utils/packageStates'); // ✅ NUOVO

/**
 * GET /api/packages
 * Lista pacchetti con filtri
 */
const getPackages = async (req, res, next) => {
  try {
    const { studentId, stati, tipo, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (tipo) where.tipo = tipo;
    if (stati) {
      // Filtra per stati (può essere array: "ATTIVO,SCADUTO")
      const statiArray = stati.split(',');
      where.stati = { hasSome: statiArray };
    }

    const [packages, total] = await Promise.all([
      prisma.package.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          student: { select: { firstName: true, lastName: true } },
          standardPackage: { select: { nome: true, categoria: true } },
          // ✅ AGGIUNTO: Include array pagamenti completo
          pagamenti: {
            orderBy: { dataPagamento: 'asc' },
            select: {
              id: true,
              importo: true,
              tipoPagamento: true,
              metodoPagamento: true,
              richiedeFattura: true,
              dataPagamento: true,
              riferimento: true,
              note: true,
            },
          },
          _count: { 
            select: { 
              lessonStudents: true,  // ✅ CAMBIATO da lezioni a lessonStudents
              pagamenti: true 
            } 
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.package.count({ where }),
    ]);

    res.json({
      packages,
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
 * GET /api/packages/:id
 * Dettaglio pacchetto con lezioni e pagamenti
 */
const getPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const package_ = await prisma.package.findUnique({
      where: { id },
      include: {
        student: true,
        standardPackage: true,
        pagamenti: {
          orderBy: { dataPagamento: 'desc' },
        },
        // ✅ CAMBIATO da lezioni a lessonStudents
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
        },
      },
    });

    if (!package_) {
      return res.status(404).json({ error: 'Pacchetto non trovato' });
    }

    res.json({ package: package_ });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/packages
 * Crea nuovo pacchetto per studente
 */
const createPackage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      studentId,
      standardPackageId,
      nome,
      tipo,
      oreAcquistate,
      giorniAcquistati,
      orarioGiornaliero,
      prezzoTotale,
      dataInizio,
      dataScadenza,
      note,
    } = req.body;

    // Calcola valori iniziali
    const oreResiduo = oreAcquistate;
    const giorniResiduo = giorniAcquistati || null;
    const importoPagato = 0;
    const importoResiduo = prezzoTotale;

    const package_ = await prisma.package.create({
      data: {
        studentId,
        standardPackageId,
        nome,
        tipo,
        oreAcquistate,
        oreResiduo,
        giorniAcquistati,
        giorniResiduo,
        orarioGiornaliero,
        prezzoTotale,
        importoPagato,
        importoResiduo,
        dataInizio: new Date(dataInizio),
        dataScadenza: dataScadenza ? new Date(dataScadenza) : null,
        stati: ['ATTIVO'], // Temporaneo
        note,
      },
      include: {
        student: true,
        standardPackage: true,
      },
    });

    // ✅ NUOVO: Aggiorna stati dinamicamente dopo creazione
    await updatePackageStates(prisma, package_.id);
    
    // Recupera pacchetto con stati aggiornati
    const updatedPackage = await prisma.package.findUnique({
      where: { id: package_.id },
      include: {
        student: true,
        standardPackage: true,
      },
    });

    res.status(201).json({
      message: 'Pacchetto creato con successo',
      package: updatedPackage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/packages/:id
 * Aggiorna pacchetto
 */
const updatePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Estrai solo i campi permessi
    const {
      nome,
      oreAcquistate,
      giorniAcquistati,
      orarioGiornaliero,
      prezzoTotale,
      importoResiduo,
      dataInizio,
      dataScadenza,
      note,
    } = req.body;

    const updateData = {};
    
    if (nome !== undefined) updateData.nome = nome;
    if (oreAcquistate !== undefined) {
      updateData.oreAcquistate = parseFloat(oreAcquistate);
      const pkg = await prisma.package.findUnique({ where: { id } });
      if (pkg) {
        const oreUsate = parseFloat(pkg.oreAcquistate) - parseFloat(pkg.oreResiduo);
        updateData.oreResiduo = parseFloat(oreAcquistate) - oreUsate;
      }
    }
    if (giorniAcquistati !== undefined) {
      updateData.giorniAcquistati = parseInt(giorniAcquistati);
      const pkg = await prisma.package.findUnique({ where: { id } });
      if (pkg) {
        const giorniUsati = (pkg.giorniAcquistati || 0) - (pkg.giorniResiduo || 0);
        updateData.giorniResiduo = parseInt(giorniAcquistati) - giorniUsati;
      }
    }
    if (orarioGiornaliero !== undefined) updateData.orarioGiornaliero = orarioGiornaliero;
    if (prezzoTotale !== undefined) updateData.prezzoTotale = parseFloat(prezzoTotale);
    if (importoResiduo !== undefined) updateData.importoResiduo = parseFloat(importoResiduo);
    if (dataInizio !== undefined) updateData.dataInizio = new Date(dataInizio);
    if (dataScadenza !== undefined) updateData.dataScadenza = dataScadenza ? new Date(dataScadenza) : null;
    if (note !== undefined) updateData.note = note;

    // Esegui update
    const package_ = await prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        student: true,
        standardPackage: true,
      },
    });

    // ✅ NUOVO: Aggiorna stati dinamicamente dopo modifica
    await updatePackageStates(prisma, id);
    
    // Recupera pacchetto con stati aggiornati
    const updatedPackage = await prisma.package.findUnique({
      where: { id },
      include: {
        student: true,
        standardPackage: true,
      },
    });

    res.json({
      message: 'Pacchetto aggiornato con successo',
      package: updatedPackage,
    });
  } catch (error) {
    console.error('Errore aggiornamento pacchetto:', error);
    next(error);
  }
};

/**
 * DELETE /api/packages/:id
 * Elimina pacchetto con controllo forte
 */
const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ STEP 1: Verifica che il pacchetto esista
    const package_ = await prisma.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            lessonStudents: true,  // ✅ CAMBIATO da lezioni a lessonStudents
            pagamenti: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!package_) {
      return res.status(404).json({ error: 'Pacchetto non trovato' });
    }

    // ✅ STEP 2: Conta lezioni e pagamenti associati
    const lessonCount = package_._count.lessonStudents;  // ✅ CAMBIATO
    const paymentCount = package_._count.pagamenti;

    // ✅ STEP 3: Elimina tutto in transazione (atomicità garantita)
    await prisma.$transaction(async (tx) => {
      // 1. Elimina AccountingEntry collegate ai pagamenti
      if (paymentCount > 0) {
        await tx.accountingEntry.deleteMany({
          where: { packageId: id },
        });
      }

      // 2. Elimina tutte le LessonStudent associate (non più Lesson diretta)
      if (lessonCount > 0) {
        await tx.lessonStudent.deleteMany({
          where: { packageId: id },
        });
      }

      // 3. Elimina tutti i pagamenti
      if (paymentCount > 0) {
        await tx.payment.deleteMany({
          where: { packageId: id },
        });
      }

      // 4. Elimina il pacchetto
      await tx.package.delete({
        where: { id },
      });
    });

    res.json({
      message: 'Pacchetto eliminato con successo',
      deleted: {
        package: package_.nome,
        student: `${package_.student.firstName} ${package_.student.lastName}`,
        lessonsDeleted: lessonCount,
        paymentsDeleted: paymentCount,
      },
    });
  } catch (error) {
    console.error('Errore eliminazione pacchetto:', error);
    next(error);
  }
};

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  updatePackageStates,
};
