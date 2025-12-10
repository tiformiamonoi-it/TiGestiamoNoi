// backend/src/routes/students.routes.js
// Routes per gestione studenti

const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/students.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// Tutte le routes richiedono autenticazione
router.use(authenticateToken);

// Validazioni per creazione/aggiornamento studente
const studentValidation = [
  body('firstName').trim().notEmpty().withMessage('Nome è obbligatorio'),
  body('lastName').trim().notEmpty().withMessage('Cognome è obbligatorio'),

  body('parentEmail')
    .optional({ values: 'falsy' })
    .isEmail()
    .withMessage('Email genitore non valida'),

  body('parentCF')
    .optional({ values: 'falsy' })
    .isLength({ min: 16, max: 16 })
    .withMessage('Codice fiscale deve essere di 16 caratteri'),
];

// ============================================
// ROUTES STATICHE (PRIMA di :id)
// ============================================

// GET /api/students/check-duplicate - Verifica duplicati
router.get('/check-duplicate', studentsController.checkDuplicate);

// GET /api/students/search-for-referral - Cerca studenti per referral autocomplete
router.get('/search-for-referral', studentsController.searchStudentsForReferral);

// GET /api/students/annual-payments - Pagamenti annuali per vista calendario
router.get('/annual-payments', studentsController.getAnnualPayments);

// ============================================
// ROUTES DINAMICHE
// ============================================

// GET /api/students - Lista studenti
router.get('/', studentsController.getStudents);

// GET /api/students/:id - Dettaglio studente
router.get('/:id', studentsController.getStudentById);

// POST /api/students - Crea studente (solo ADMIN)
router.post('/',
  requireRole(['ADMIN']),
  studentValidation,
  studentsController.createStudent
);

// PUT /api/students/:id - Aggiorna studente (solo ADMIN)
router.put('/:id',
  requireRole(['ADMIN']),
  studentValidation,
  studentsController.updateStudent
);

// DELETE /api/students/:id - Elimina studente (solo ADMIN)
router.delete('/:id',
  requireRole(['ADMIN']),
  studentsController.deleteStudent
);

// ============================================
// REFERRAL ROUTES
// ============================================

// POST /api/students/:id/referrals - Aggiunge referral
router.post('/:id/referrals',
  requireRole(['ADMIN']),
  studentsController.addReferral
);

// DELETE /api/students/:id/referrals/:referrerId - Rimuove referral
router.delete('/:id/referrals/:referrerId',
  requireRole(['ADMIN']),
  studentsController.removeReferral
);

// ============================================
// HARD DELETE ROUTES
// ============================================

// GET /api/students/:id/delete-info - Info prima dell'eliminazione
router.get('/:id/delete-info',
  requireRole(['ADMIN']),
  studentsController.getDeleteInfo
);

// DELETE /api/students/:id/hard-delete - Eliminazione definitiva
router.delete('/:id/hard-delete',
  requireRole(['ADMIN']),
  studentsController.hardDeleteStudent
);

module.exports = router;

