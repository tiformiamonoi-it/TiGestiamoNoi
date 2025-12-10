// backend/src/routes/availability.routes.js
const express = require('express');
const router = express.Router();
const {
    checkTutorPhone,
    getTutorAvailability,
    saveTutorAvailability,
    getAvailabilitiesAdmin,
    getMatchingData,
    assignBooking
} = require('../controllers/availability.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// ROUTES PUBBLICHE (no auth)
// ========================================

// POST /api/availability/public/check - Verifica telefono tutor
router.post('/public/check', checkTutorPhone);

// POST /api/availability/public/get - Ottieni disponibilità tutor
router.post('/public/get', getTutorAvailability);

// POST /api/availability/public/save - Salva disponibilità
router.post('/public/save', saveTutorAvailability);

// ========================================
// ROUTES ADMIN (auth required)
// ========================================

// GET /api/availability - Lista disponibilità (per matching)
router.get('/', authenticateToken, requireRole(['ADMIN']), getAvailabilitiesAdmin);

// GET /api/availability/matching/:date - Dati per pagina matching
router.get('/matching/:date', authenticateToken, requireRole(['ADMIN']), getMatchingData);

// POST /api/availability/assign - Assegna prenotazione a tutor/slot
router.post('/assign', authenticateToken, requireRole(['ADMIN']), assignBooking);

module.exports = router;
