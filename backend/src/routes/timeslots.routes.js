// backend/src/routes/timeslots.routes.js
const express = require('express');
const router = express.Router();
const {
  getTimeSlots,
  createTimeSlot,
  toggleTimeSlot,
} = require('../controllers/timeslots.controller');

// Middleware autenticazione (assumo tu l'abbia già)
const { protect } = require('../middleware/auth');

// Tutte le route protette
//router.use(protect);

// GET /api/timeslots - Lista slot orari
router.get('/', getTimeSlots);

// POST /api/timeslots - Crea slot (solo admin)
router.post('/', createTimeSlot);

// PATCH /api/timeslots/:id - Attiva/disattiva
router.patch('/:id', toggleTimeSlot);

module.exports = router;
