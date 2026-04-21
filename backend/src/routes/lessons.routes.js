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
  deleteLessonsByTutorAndDate,
  getCalendarDays,
  getAvailableStudents,
  checkTutorSlotDuplicate,
} = require('../controllers/lessons.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Tutte le route protette
router.use(authenticateToken);

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

/**
 * GET /api/lessons/check-duplicate
 * Verifica se esiste già lezione per tutor+data+slot
 */
router.get('/check-duplicate', checkTutorSlotDuplicate);

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
    body('data').isISO8601().withMessage('Data non valida').custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (inputDate > today) {
        throw new Error('Non è possibile inserire lezioni in date future');
      }
      return true;
    }),
    body('studenti').isArray({ min: 1 }).withMessage('Almeno uno studente richiesto'),
    body('studenti.*.studentId').notEmpty().withMessage('studentId obbligatorio'),
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
 * DELETE /api/lessons/bulk/by-tutor-date
 * ✅ Elimina tutte le lezioni di un tutor in una data
 * ⚠️ DEVE STARE PRIMA DI DELETE /:id
 */
router.delete('/bulk/by-tutor-date', requireRole(['ADMIN']), deleteLessonsByTutorAndDate);

/**
 * DELETE /api/lessons/:id
 * Elimina singola lezione
 */
router.delete('/:id', deleteLesson);

module.exports = router;
