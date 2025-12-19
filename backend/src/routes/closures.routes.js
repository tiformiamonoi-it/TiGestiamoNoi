// backend/src/routes/closures.routes.js
const express = require('express');
const router = express.Router();
const {
    getClosures,
    getAllClosures,
    addClosure,
    deleteClosure,
    checkClosure
} = require('../controllers/closures.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ========================================
// ROUTES PUBBLICHE
// ========================================

// GET /api/closures/check/:date - Verifica se data è chiusura
router.get('/check/:date', checkClosure);

// ========================================
// ROUTES ADMIN (auth required)
// ========================================

// GET /api/closures - Lista chiusure future
router.get('/', authenticateToken, requireRole(['ADMIN']), getClosures);

// GET /api/closures/all - Lista tutte le chiusure
router.get('/all', authenticateToken, requireRole(['ADMIN']), getAllClosures);

// POST /api/closures - Aggiungi chiusura
router.post('/', authenticateToken, requireRole(['ADMIN']), addClosure);

// DELETE /api/closures/:id - Rimuovi chiusura
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteClosure);

module.exports = router;
