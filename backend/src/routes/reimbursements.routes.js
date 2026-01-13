const express = require('express');
const router = express.Router();
const reimbursementsController = require('../controllers/reimbursements.controller');
const { authenticateToken } = require('../middleware/auth');

// Tutte le route protette
router.use(authenticateToken);

// GET /api/reimbursements/tutor/:tutorId - Lista rimborsi per tutor
router.get('/tutor/:tutorId', reimbursementsController.getByTutor);

// POST /api/reimbursements - Crea nuovo rimborso
router.post('/', reimbursementsController.create);

// PUT /api/reimbursements/:id - Aggiorna rimborso
router.put('/:id', reimbursementsController.update);

// PUT /api/reimbursements/:id/pay - Paga rimborso
router.put('/:id/pay', reimbursementsController.pay);

// DELETE /api/reimbursements/:id - Elimina rimborso
router.delete('/:id', reimbursementsController.remove);

// DELETE /api/reimbursements/:id/payments/:paymentId - Elimina un pagamento specifico
router.delete('/:id/payments/:paymentId', reimbursementsController.deletePayment);

module.exports = router;
