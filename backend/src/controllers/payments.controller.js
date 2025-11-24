// backend/src/controllers/payments.controller.js
const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');
const { updatePackageStates } = require('../utils/packageStates');

const getPayments = async (req, res, next) => {
  try {
    const { packageId, metodoPagamento, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (packageId) where.packageId = packageId;
    if (metodoPagamento) where.metodoPagamento = metodoPagamento;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          package: {
            include: {
              student: { select: { firstName: true, lastName: true } },
            },
          },
        },
        orderBy: { dataPagamento: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      payments,
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

const createPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // ✅ AGGIUNTO: richiedeFattura nella destructuring
    const { packageId, importo, tipoPagamento, metodoPagamento, richiedeFattura, dataPagamento, riferimento, note } = req.body;

    const package_ = await prisma.package.findUnique({
      where: { id: packageId },
      include: { student: true },
    });

    if (!package_) {
      return res.status(404).json({ error: 'Pacchetto non trovato' });
    }

    const [payment, updatedPackage] = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          packageId,
          importo,
          tipoPagamento,
          metodoPagamento,
          richiedeFattura: richiedeFattura || false, // ✅ AGGIUNTO: campo richiedeFattura con default false
          dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
          riferimento,
          note,
        },
        include: {
          package: {
            include: { student: true },
          },
        },
      });

      const newImportoPagato = parseFloat(package_.importoPagato) + parseFloat(importo);
      const newImportoResiduo = parseFloat(package_.importoResiduo) - parseFloat(importo);

      const pkg = await tx.package.update({
        where: { id: packageId },
        data: {
          importoPagato: newImportoPagato,
          importoResiduo: newImportoResiduo,
        },
      });

      await tx.accountingEntry.create({
        data: {
          tipo: 'ENTRATA',
          importo,
          descrizione: `Pagamento pacchetto - ${package_.student.firstName} ${package_.student.lastName}`,
          categoria: 'Pacchetto',
          data: dataPagamento ? new Date(dataPagamento) : new Date(),
          packageId,
          paymentId: newPayment.id,
        },
      });

      return [newPayment, pkg];
    });

    // ✅ NUOVO: Aggiorna stati dopo pagamento
    await updatePackageStates(prisma, packageId);
    
    // Recupera pacchetto con stati aggiornati
    const finalPackage = await prisma.package.findUnique({
      where: { id: packageId },
      include: { student: true },
    });

    res.status(201).json({
      message: 'Pagamento registrato con successo',
      payment,
      package: updatedPackage,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/payments/:id
 * Elimina pagamento con validazione
 */
const deletePayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Trova il pagamento da eliminare
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { 
        package: {
          include: {
            pagamenti: { orderBy: { dataPagamento: 'asc' } }
          }
        }
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento non trovato' });
    }

    // ⚠️ VALIDAZIONE: NON eliminare ACCONTO se esiste un SALDO
    if (payment.tipoPagamento === 'ACCONTO') {
      const hasSaldo = payment.package.pagamenti.some(
        p => p.id !== id && p.tipoPagamento === 'SALDO'
      );
      
      if (hasSaldo) {
        return res.status(400).json({ 
          error: 'Impossibile eliminare un acconto se esiste un saldo. Elimina prima il saldo.' 
        });
      }
    }

    // Transazione atomica
    await prisma.$transaction(async (tx) => {
      // 1. Aggiorna importi pacchetto
      await tx.package.update({
        where: { id: payment.packageId },
        data: {
          importoPagato: parseFloat(payment.package.importoPagato) - parseFloat(payment.importo),
          importoResiduo: parseFloat(payment.package.importoResiduo) + parseFloat(payment.importo),
        },
      });

      // 2. Elimina movimento contabile associato
      await tx.accountingEntry.deleteMany({
        where: { paymentId: id },
      });

      // 3. Elimina il pagamento
      await tx.payment.delete({
        where: { id },
      });
    });

    // 4. Ricalcola stati del pacchetto
    await updatePackageStates(prisma, payment.packageId);

    res.json({ 
      message: 'Pagamento eliminato con successo',
      deletedPaymentId: id,
      importoRipristinato: parseFloat(payment.importo),
    });
  } catch (error) {
    console.error('Errore eliminazione pagamento:', error);
    next(error);
  }
};

module.exports = {
  getPayments,
  createPayment,
  deletePayment,
};
