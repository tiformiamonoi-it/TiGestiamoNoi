// backend/src/routes/payments.routes.js
// Routes per pagamenti

const express = require('express');
const router = express.Router();
const controller = require('../controllers/payments.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticateToken);

const validation = [
  body('packageId').trim().notEmpty(),
  body('importo').isFloat({ min: 0.01 }),
  body('tipoPagamento').isIn(['ACCONTO', 'SALDO', 'RATA', 'INTEGRAZIONE']),
  body('metodoPagamento').isIn(['CONTANTI', 'BONIFICO', 'POS', 'ASSEGNO', 'ALTRO']),
];

router.get('/', controller.getPayments);
router.post('/', requireRole(['ADMIN']), validation, controller.createPayment);
router.delete('/:id', requireRole(['ADMIN']), controller.deletePayment);

module.exports = router;
