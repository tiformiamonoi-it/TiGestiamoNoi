// backend/src/routes/lessons.routes.js
/**
 * Routes per gestione lezioni
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getCalendarDays,
  getAvailableStudents,
} = require('../controllers/lessons.controller');

// ============================================
// ✅ CALENDARIO (PRIMA - route statiche)
// ============================================

/**
 * GET /api/lessons/calendar/giorni
 * Giorni del mese con contatori
 */
router.get('/calendar/giorni', getCalendarDays);

/**
 * GET /api/lessons/calendar/alunni-disponibili
 * Alunni con pacchetto attivo
 */
router.get('/calendar/alunni-disponibili', getAvailableStudents);

// ============================================
// CRUD LEZIONI (DOPO - route dinamiche)
// ============================================

/**
 * GET /api/lessons
 * Lista lezioni con filtri
 */
router.get('/', getLessons);

/**
 * GET /api/lessons/:id
 * Singola lezione
 */
router.get('/:id', getLessonById);

/**
 * POST /api/lessons
 * Crea nuova lezione
 */
router.post(
  '/',
  [
    body('tutorId').notEmpty().withMessage('tutorId obbligatorio'),
    body('timeSlotId').notEmpty().withMessage('timeSlotId obbligatorio'),
    body('data').isISO8601().withMessage('Data non valida'),
    body('studenti').isArray({ min: 1 }).withMessage('Almeno uno studente richiesto'),
    body('studenti.*.studentId').notEmpty().withMessage('studentId obbligatorio'),
    body('studenti.*.packageId').notEmpty().withMessage('packageId obbligatorio'),
  ],
  createLesson
);

/**
 * PUT /api/lessons/:id
 * Aggiorna lezione
 */
router.put(
  '/:id',
  [
    body('studenti').isArray({ min: 1 }).withMessage('Almeno uno studente richiesto'),
  ],
  updateLesson
);

/**
 * DELETE /api/lessons/:id
 * Elimina lezione
 */
router.delete('/:id', deleteLesson);

module.exports = router;
