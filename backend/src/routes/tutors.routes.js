const express = require('express');
const router = express.Router();
const tutorsController = require('../controllers/tutors.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Tutte le route protette
router.use(authenticateToken);

// ============================================
// ROUTES STATICHE (PRIMA di :id)
// ============================================

// GET /api/tutors/check-duplicate - Verifica duplicati
router.get('/check-duplicate', requireRole(['ADMIN']), tutorsController.checkDuplicateTutor);

// GET /api/tutors/stats - Statistiche dashboard
router.get('/stats', requireRole(['ADMIN']), tutorsController.getTutorStats);

// POST /api/tutors/pay - Registra pagamenti
router.post('/pay', requireRole(['ADMIN']), tutorsController.payTutors);

// PUT /api/tutors/payments/:id - Aggiorna pagamento
router.put('/payments/:id', requireRole(['ADMIN']), tutorsController.updatePayment);

// DELETE /api/tutors/payments/:id - Elimina pagamento (Reset)
router.delete('/payments/:id', requireRole(['ADMIN']), tutorsController.deletePayment);

// ============================================
// ROUTES DINAMICHE
// ============================================

// GET /api/tutors - Lista tutor con filtri
router.get('/', tutorsController.getTutors);

// POST /api/tutors - Crea nuovo tutor
router.post('/', requireRole(['ADMIN']), tutorsController.createStudentValidation || [], tutorsController.createTutor);

// GET /api/tutors/:id - Dettaglio tutor
router.get('/:id', tutorsController.getTutorDetail);

// PUT /api/tutors/:id - Aggiorna tutor
router.put('/:id', requireRole(['ADMIN']), tutorsController.updateTutor);

// DELETE /api/tutors/:id - Elimina tutor
router.delete('/:id', requireRole(['ADMIN']), tutorsController.deleteTutor);

// GET /api/tutors/:id/monthly-performance - Performance mensile
router.get('/:id/monthly-performance', tutorsController.getMonthlyPerformance);

// PUT /api/tutors/:id/compenso-mensile - Modifica compenso mese
router.put('/:id/compenso-mensile', requireRole(['ADMIN']), tutorsController.updateCompensoMensile);

// GET /api/tutors/:id/detailed-stats - Statistiche dettagliate
router.get('/:id/detailed-stats', requireRole(['ADMIN']), tutorsController.getDetailedStats);

module.exports = router;
