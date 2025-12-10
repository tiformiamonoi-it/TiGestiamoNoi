// backend/src/routes/accounting.routes.js
const express = require('express');
const router = express.Router();
const {
    getMovimenti,
    getStats,
    createMovimento,
    updateMovimento,
    deleteMovimento,
    getCategories
} = require('../controllers/accounting.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Tutte le route protette
router.use(authenticateToken);

// GET /api/accounting - Lista movimenti
router.get('/', getMovimenti);

// GET /api/accounting/stats - Statistiche panoramica
router.get('/stats', getStats);

// GET /api/accounting/categories - Lista categorie
router.get('/categories', getCategories);

// POST /api/accounting - Crea movimento manuale (admin/segreteria)
router.post('/', requireRole(['ADMIN', 'SEGRETERIA']), createMovimento);

// PUT /api/accounting/:id - Modifica movimento
router.put('/:id', requireRole(['ADMIN', 'SEGRETERIA']), updateMovimento);

// DELETE /api/accounting/:id - Elimina movimento
router.delete('/:id', requireRole(['ADMIN', 'SEGRETERIA']), deleteMovimento);

module.exports = router;
