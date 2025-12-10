// backend/src/routes/booking.routes.js
const express = require('express');
const router = express.Router();
const {
    createPublicBooking,
    getPublicMaterie,
    checkDuplicateBooking,
    addCommunication,
    getBookings,
    updateBookingStatus,
    deleteBooking
} = require('../controllers/booking.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// ROUTES PUBBLICHE (no auth)
// ========================================

// POST /api/bookings/public - Crea prenotazione
router.post('/public', createPublicBooking);

// GET /api/bookings/public/materie - Lista materie
router.get('/public/materie', getPublicMaterie);

// POST /api/bookings/public/check-duplicate - Verifica duplicato
router.post('/public/check-duplicate', checkDuplicateBooking);

// POST /api/bookings/public/communication - Invia solo comunicazione
router.post('/public/communication', addCommunication);

// ========================================
// ROUTES ADMIN (auth required)
// ========================================

// GET /api/bookings - Lista prenotazioni
router.get('/', authenticateToken, requireRole(['ADMIN']), getBookings);

// PATCH /api/bookings/:id/status - Aggiorna stato
router.patch('/:id/status', authenticateToken, requireRole(['ADMIN']), updateBookingStatus);

// DELETE /api/bookings/:id - Elimina prenotazione
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteBooking);

module.exports = router;

