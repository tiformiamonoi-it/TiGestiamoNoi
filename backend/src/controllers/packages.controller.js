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
    const { studentId, stati, tipo, page = 1, limit = 20, latestOnly } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (studentId) where.studentId = studentId;
    if (tipo) where.tipo = tipo;
    if (stati) {
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
          // ✅ FIX: Include lessonStudents per calcolo dinamico giorni
          lessonStudents: {
            select: {
              id: true,
              lesson: {
                select: {
                  data: true,
                }
              }
            }
          },
          _count: {
            select: {
              lessonStudents: true,
              pagamenti: true
            }
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.package.count({ where }),
    ]);

    // ✅ LAZY UPDATE + CALCOLO DINAMICO GIORNI PER MENSILI
    await Promise.all(packages.map(async (pkg) => {
      try {
        const updatedPkg = await updatePackageStates(pkg);
        pkg.stati = updatedPkg.stati;
        pkg.oreResiduo = updatedPkg.oreResiduo;
        pkg.orePerse = updatedPkg.orePerse;

        if (pkg.tipo === 'MENSILE') {
          const giorniTotali = pkg.giorniAcquistati || 0;
          const dateUniche = new Set(
            (pkg.lessonStudents || []).map(ls =>
              ls.lesson.data.toISOString().split('T')[0]
            )
          );
          const giorniUsati = dateUniche.size;
          pkg.giorniResiduo = Math.max(0, giorniTotali - giorniUsati);
          pkg.giorniUsati = giorniUsati;
          pkg.giorniTotali = giorniTotali;
        } else {
          pkg.giorniResiduo = updatedPkg.giorniResiduo;
        }

        delete pkg.lessonStudents;

      } catch (e) {
        console.error(`Errore lazy update pacchetto ${pkg.id}:`, e);
      }
    }));

    // ✅ Se latestOnly=true: teniamo solo il pacchetto più recente per ogni studente
    let finalPackages = packages;
    if (latestOnly === 'true') {
      const byStudent = new Map();
      for (const pkg of packages) {
        const sid = pkg.studentId;
        if (!byStudent.has(sid)) {
          byStudent.set(sid, pkg); // già ordinato per createdAt desc
        }
      }
      finalPackages = Array.from(byStudent.values());
    }

    res.json({
      packages: finalPackages,
      pagination: {
        total: latestOnly === 'true' ? finalPackages.length : total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil((latestOnly === 'true' ? finalPackages.length : total) / limit),
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
    } = req.body;

    // ✅ NUOVO: Validazione standardPackageId e oreAcquistate
    if (standardPackageId) {
      const sp = await prisma.standardPackage.findUnique({ where: { id: standardPackageId } });
      if (!sp) return res.status(400).json({ error: 'Pacchetto standard non trovato' });
    }

    if (parseFloat(oreAcquistate) <= 0) {
      return res.status(400).json({ error: 'Le ore acquistate devono essere maggiori di zero' });
    }



    // ✅ NUOVO: Calcola automaticamente dataScadenza in base al tipo
    const dataScadenza = calcolaScadenzaPacchetto(dataInizio, tipo);

    // Calcola ore residuo iniziale
    const oreResiduoIniziale = parseFloat(oreAcquistate);

    // Prepara dati pacchetto
    const packageData = {
      studentId,
      standardPackageId: standardPackageId || null,
      nome,
      tipo,
      oreAcquistate: parseFloat(oreAcquistate),
      oreResiduo: oreResiduoIniziale,
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
      updateData.orarioGiornaliero = parseFloat(orarioGiornaliero);
      
      // ✅ NUOVO: Se il tipo è cambiato da ORE a MENSILE, calcola giorni residui
      if (existingPackage.tipo === 'ORE') {
        const lessonStudents = await prisma.lessonStudent.findMany({
          where: { packageId: id },
          include: { lesson: { select: { data: true } } }
        });
        const dateUniche = new Set(lessonStudents.map(ls => ls.lesson.data.toISOString().split('T')[0]));
        const giorniUsati = dateUniche.size;
        updateData.giorniResiduo = Math.max(0, parseInt(giorniAcquistati) - giorniUsati);
      } else {
        updateData.giorniResiduo = nuovoGiorniResiduo;
      }
    } else {
      // ✅ NUOVO: Se il tipo è cambiato da MENSILE a ORE, azzera campi giorni
      updateData.giorniAcquistati = null;
      updateData.giorniResiduo = null;
      updateData.orarioGiornaliero = null;
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
      // 1. Blocca se ci sono pagamenti
      if (paymentCount > 0) {
        throw new Error('Impossibile eliminare un pacchetto con pagamenti associati. Elimina prima i pagamenti.');
      }

      // 2. Gestione lezioni associate
      if (lessonCount > 0) {
        // Trova le lezioni coinvolte prima di eliminare i collegamenti
        const lessonStudents = await tx.lessonStudent.findMany({
          where: { packageId: id },
          select: { lessonId: true }
        });
        const lessonIds = [...new Set(lessonStudents.map(ls => ls.lessonId))];

        // Elimina i collegamenti studente-lezione
        await tx.lessonStudent.deleteMany({
          where: { packageId: id },
        });

        // Elimina le lezioni che sono rimaste senza studenti
        for (const lessonId of lessonIds) {
          const remainingStudents = await tx.lessonStudent.count({
            where: { lessonId }
          });
          if (remainingStudents === 0) {
            await tx.lesson.delete({
              where: { id: lessonId }
            });
          }
        }
      }

      // 3. Elimina il pacchetto
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
