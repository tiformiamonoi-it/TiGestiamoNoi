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
// Validazioni per creazione/aggiornamento studente
const studentValidation = [
  body('firstName').trim().notEmpty().withMessage('Nome è obbligatorio'),
  body('lastName').trim().notEmpty().withMessage('Cognome è obbligatorio'),
  
  // ✅ CORRETTO: valida solo se presente E non vuota
  body('parentEmail')
    .optional({ values: 'falsy' }) // Ignora se null, undefined, ''
    .isEmail()
    .withMessage('Email genitore non valida'),
  
  // ✅ CORRETTO: valida lunghezza solo se presente E non vuota
  body('parentCF')
    .optional({ values: 'falsy' })
    .isLength({ min: 16, max: 16 })
    .withMessage('Codice fiscale deve essere di 16 caratteri'),
];

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

module.exports = router;
