const express = require('express');
const router = express.Router();
const tutorsController = require('../controllers/tutors.controller');

// GET /api/tutors - Lista tutor con filtri
router.get('/', tutorsController.getTutors);

// GET /api/tutors/stats - Statistiche dashboard
router.get('/stats', tutorsController.getTutorStats);

// GET /api/tutors/:id - Dettaglio tutor
router.get('/:id', tutorsController.getTutorDetail);

// PUT /api/tutors/:id - Aggiorna tutor
router.put('/:id', tutorsController.updateTutor);

// POST /api/tutors/pay - Registra pagamenti
router.post('/pay', tutorsController.payTutors);

// PUT /api/tutors/payments/:id - Aggiorna pagamento
router.put('/payments/:id', tutorsController.updatePayment);

// DELETE /api/tutors/payments/:id - Elimina pagamento (Reset)
router.delete('/payments/:id', tutorsController.deletePayment);

module.exports = router;
