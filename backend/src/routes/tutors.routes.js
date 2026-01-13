const express = require('express');
const router = express.Router();
const tutorsController = require('../controllers/tutors.controller');
const { authenticateToken } = require('../middleware/auth');

// Tutte le route protette
router.use(authenticateToken);

// GET /api/tutors - Lista tutor con filtri
router.get('/', tutorsController.getTutors);

// POST /api/tutors - Crea nuovo tutor
router.post('/', tutorsController.createTutor);

// GET /api/tutors/check-duplicate - Verifica duplicati
router.get('/check-duplicate', tutorsController.checkDuplicateTutor);

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

// GET /api/tutors/:id/monthly-performance - Performance mensile
router.get('/:id/monthly-performance', tutorsController.getMonthlyPerformance);

// PUT /api/tutors/:id/compenso-mensile - Modifica compenso mese
router.put('/:id/compenso-mensile', tutorsController.updateCompensoMensile);

// GET /api/tutors/:id/detailed-stats - Statistiche dettagliate (distribuzione ore, top alunni, preferenze)
router.get('/:id/detailed-stats', tutorsController.getDetailedStats);

// DELETE /api/tutors/:id - Elimina tutor
router.delete('/:id', tutorsController.deleteTutor);

module.exports = router;
