// backend/src/controllers/packages.controller.js
// Controller per pacchetti studenti

const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');
const { updatePackageStates, isPacchettoClosed, refreshAllPackageStates } = require('../utils/packageStates');
const { calcolaScadenzaPacchetto } = require('../utils/dateHelpers'); // ✅ NUOVO


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

    // ✅ LAZY UPDATE: Aggiorna stati se necessario
    // Eseguiamo in parallelo per non rallentare troppo
    await Promise.all(packages.map(async (pkg) => {
      // Ottimizzazione: aggiorna solo se c'è data scadenza e non è già scaduto/chiuso
      // Oppure, per sicurezza, aggiorniamo sempre (più sicuro, leggermente più lento)
      // Dato che updatePackageStates fa controlli interni, lo chiamiamo direttamente.
      // Per evitare troppe write, updatePackageStates dovrebbe controllare se cambia qualcosa?
      // Al momento updatePackageStates fa sempre una write.
      // Per ora lo facciamo per tutti i pacchetti visualizzati (pagina corrente).
      try {
        const updatedPkg = await updatePackageStates(pkg.id);
        // Aggiorniamo l'oggetto in memoria per la risposta
        pkg.stati = updatedPkg.stati;
        pkg.oreResiduo = updatedPkg.oreResiduo; // In caso cambi
      } catch (e) {
        console.error(`Errore lazy update pacchetto ${pkg.id}:`, e);
      }
    }));

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

    // ✅ LAZY UPDATE: Aggiorna stati prima di restituire
    try {
      const updatedPkg = await updatePackageStates(id);
      // Aggiorna oggetto in memoria
      package_.stati = updatedPkg.stati;
      package_.oreResiduo = updatedPkg.oreResiduo;
    } catch (e) {
      console.error(`Errore lazy update pacchetto ${id}:`, e);
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
      note,
      pagamentoIniziale, // Opzionale
      recuperaOreNegative = false // ✅ NUOVO: recupera ore negative da altri pacchetti
    } = req.body;

    // ✅ NUOVO: Verifica se ci sono pacchetti con ore negative
    let oreNegativeDaRecuperare = 0;
    let pacchettiDaAzzerare = [];

    if (recuperaOreNegative) {
      const pacchettiNegativi = await prisma.package.findMany({
        where: {
          studentId,
          oreResiduo: { lt: 0 }
        }
      });

      if (pacchettiNegativi.length > 0) {
        oreNegativeDaRecuperare = pacchettiNegativi.reduce(
          (sum, p) => sum + parseFloat(p.oreResiduo),
          0
        );
        pacchettiDaAzzerare = pacchettiNegativi.map(p => p.id);
      }
    }

    // ✅ NUOVO: Calcola automaticamente dataScadenza in base al tipo
    const dataScadenza = calcolaScadenzaPacchetto(dataInizio, tipo);

    // Calcola ore residuo iniziale (con eventuale recupero ore negative)
    const oreResiduoIniziale = parseFloat(oreAcquistate) + oreNegativeDaRecuperare;

    // Prepara dati pacchetto
    const packageData = {
      studentId,
      standardPackageId: standardPackageId || null,
      nome,
      tipo,
      oreAcquistate: parseFloat(oreAcquistate),
      oreResiduo: oreResiduoIniziale, // ✅ Può partire da negativo se recupera
      orePerse: 0,
      prezzoTotale: parseFloat(prezzoTotale),
      importoPagato: 0,
      importoResiduo: parseFloat(prezzoTotale),
      dataInizio: new Date(dataInizio),
      dataScadenza: dataScadenza, // ✅ Calcolata automaticamente
      stati: ['ATTIVO'], // Stato iniziale, verrà aggiornato dopo
      note: note || null,
    };

    // Campi specifici per tipo MENSILE
    if (tipo === 'MENSILE') {
      packageData.giorniAcquistati = parseInt(giorniAcquistati);
      packageData.giorniResiduo = parseInt(giorniAcquistati);
      packageData.orarioGiornaliero = parseFloat(orarioGiornaliero);
    }

    // Crea pacchetto in transaction
    const newPackage = await prisma.$transaction(async (tx) => {
      // 1. Crea pacchetto
      const pkg = await tx.package.create({ data: packageData });

      // 2. Se c'è un pagamento iniziale, crealo
      if (pagamentoIniziale) {
        const importoPagamento = parseFloat(pagamentoIniziale.importo);

        await tx.payment.create({
          data: {
            packageId: pkg.id,
            importo: importoPagamento,
            tipoPagamento: pagamentoIniziale.tipoPagamento || 'ACCONTO',
            metodoPagamento: pagamentoIniziale.metodoPagamento,
            dataPagamento: new Date(pagamentoIniziale.dataPagamento || new Date()),
            richiedeFattura: pagamentoIniziale.richiedeFattura || false,
            note: pagamentoIniziale.note || null,
          },
        });

        // Aggiorna importi pacchetto
        const nuovoImportoPagato = importoPagamento;
        const nuovoImportoResiduo = parseFloat(prezzoTotale) - nuovoImportoPagato;

        await tx.package.update({
          where: { id: pkg.id },
          data: {
            importoPagato: nuovoImportoPagato,
            importoResiduo: nuovoImportoResiduo,
          },
        });
      }

      // 3. ✅ NUOVO: Azzera ore negative nei vecchi pacchetti
      if (pacchettiDaAzzerare.length > 0) {
        await tx.package.updateMany({
          where: { id: { in: pacchettiDaAzzerare } },
          data: { oreResiduo: 0 }
        });

        // Ricalcola stati dei pacchetti azzerati
        for (const pkgId of pacchettiDaAzzerare) {
          await updatePackageStates(pkgId);
        }
      }

      return pkg;
    });

    // Ricalcola stati del nuovo pacchetto
    await updatePackageStates(newPackage.id);

    // Ricarica pacchetto con relazioni
    const packageComplete = await prisma.package.findUnique({
      where: { id: newPackage.id },
      include: {
        student: { select: { firstName: true, lastName: true } },
        standardPackage: { select: { nome: true, categoria: true } },
        pagamenti: {
          orderBy: { dataPagamento: 'asc' },
          select: {
            id: true,
            importo: true,
            tipoPagamento: true,
            metodoPagamento: true,
            richiedeFattura: true,
            dataPagamento: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pacchetto creato con successo',
      package: packageComplete,
    });
  } catch (error) {
    console.error('Errore creazione pacchetto:', error);
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
    const {
      standardPackageId,
      nome,
      tipo,
      oreAcquistate,
      giorniAcquistati,
      orarioGiornaliero,
      prezzoTotale,
      dataInizio,
      dataScadenza: reqDataScadenza,
      note,
    } = req.body;

    // Carica pacchetto esistente
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      return res.status(404).json({ error: 'Pacchetto non trovato' });
    }

    // Verifica se pacchetto è chiuso (PAGATO + ore ≤ 0)
    if (isPacchettoClosed(existingPackage)) {
      return res.status(400).json({
        error: 'Impossibile modificare un pacchetto chiuso (pagato e senza ore disponibili)'
      });
    }

    // Helper per conversione sicura da Decimal/String a Number
    const safeNum = (val) => {
      if (val === null || val === undefined || val === '') return 0;
      return Number(val.toString());
    };

    // Calcola delta ore per aggiornare residuo
    const vecchieOreAcquistate = safeNum(existingPackage.oreAcquistate);
    const nuoveOreAcquistate = safeNum(oreAcquistate);
    const deltaOre = nuoveOreAcquistate - vecchieOreAcquistate;

    // Aggiorna ore residuo
    const nuovoOreResiduo = safeNum(existingPackage.oreResiduo) + deltaOre;

    // Calcola delta giorni (solo MENSILE)
    let nuovoGiorniResiduo = existingPackage.giorniResiduo;
    if (tipo === 'MENSILE') {
      const vecchiGiorniAcquistati = parseInt(existingPackage.giorniAcquistati || 0);
      const nuoviGiorniAcquistati = parseInt(giorniAcquistati || 0);
      const deltaGiorni = nuoviGiorniAcquistati - vecchiGiorniAcquistati;
      nuovoGiorniResiduo = (existingPackage.giorniResiduo || 0) + deltaGiorni;
    }

    // Calcola nuovo importo residuo
    const nuovoImportoResiduo = safeNum(prezzoTotale) - safeNum(existingPackage.importoPagato);

    // Gestione Data Scadenza
    let dataScadenza = existingPackage.dataScadenza;

    // Se fornita manualmente, usa quella
    if (reqDataScadenza) {
      const d = new Date(reqDataScadenza);
      if (!isNaN(d.getTime())) {
        dataScadenza = d;
      }
    }
    // Altrimenti ricalcola se cambia dataInizio
    else if (dataInizio !== existingPackage.dataInizio.toISOString().split('T')[0]) {
      dataScadenza = calcolaScadenzaPacchetto(dataInizio, tipo);
    }

    // Prepara dati aggiornamento
    const updateData = {
      standardPackageId: standardPackageId || null,
      nome,
      tipo,
      oreAcquistate: nuoveOreAcquistate,
      oreResiduo: nuovoOreResiduo,
      prezzoTotale: parseFloat(prezzoTotale),
      importoResiduo: nuovoImportoResiduo,
      dataInizio: new Date(dataInizio),
      dataScadenza: dataScadenza,
      note: note || null,
    };

    // Campi specifici MENSILE
    if (tipo === 'MENSILE') {
      updateData.giorniAcquistati = parseInt(giorniAcquistati);
      updateData.giorniResiduo = nuovoGiorniResiduo;
      updateData.orarioGiornaliero = parseFloat(orarioGiornaliero);
    }

    // Aggiorna pacchetto
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: updateData,
    });

    // Ricalcola stati
    await updatePackageStates(id);

    // Ricarica con relazioni
    const packageComplete = await prisma.package.findUnique({
      where: { id },
      include: {
        student: { select: { firstName: true, lastName: true } },
        standardPackage: { select: { nome: true, categoria: true } },
        pagamenti: {
          orderBy: { dataPagamento: 'asc' },
          select: {
            id: true,
            importo: true,
            tipoPagamento: true,
            metodoPagamento: true,
            richiedeFattura: true,
            dataPagamento: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Pacchetto aggiornato con successo',
      package: packageComplete,
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
        throw new Error('Impossibile eliminare un pacchetto con pagamenti associati. Elimina prima i pagamenti.');
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

/**
 * POST /api/packages/refresh-all
 * Aggiorna tutti gli stati dei pacchetti non chiusi
 * Usato per refresh manuale completo
 */
const refreshAllStates = async (req, res, next) => {
  try {
    const count = await refreshAllPackageStates();

    res.json({
      success: true,
      message: `Stati aggiornati per ${count} pacchetti`,
      count
    });
  } catch (error) {
    console.error('Errore refresh stati:', error);
    next(error);
  }
};

module.exports = {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  refreshAllStates,
};
