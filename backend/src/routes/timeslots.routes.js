// backend/src/routes/timeslots.routes.js
const express = require('express');
const router = express.Router();
const {
  getTimeSlots,
  createTimeSlot,
  toggleTimeSlot,
  deleteTimeSlot,
} = require('../controllers/timeslots.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Tutte le route protette
router.use(authenticateToken);

// GET /api/timeslots - Lista slot orari
router.get('/', getTimeSlots);

// POST /api/timeslots - Crea slot (solo admin)
router.post('/', requireRole(['ADMIN']), createTimeSlot);

// PATCH /api/timeslots/:id - Attiva/disattiva
router.patch('/:id', requireRole(['ADMIN']), toggleTimeSlot);

// DELETE /api/timeslots/:id - Elimina slot
router.delete('/:id', requireRole(['ADMIN']), deleteTimeSlot);

module.exports = router;
