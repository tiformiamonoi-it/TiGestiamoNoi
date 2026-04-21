// backend/src/routes/packages.routes.js
// Routes per pacchetti studenti

const express = require('express');
const router = express.Router();
const controller = require('../controllers/packages.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticateToken);

const validation = [
  body('studentId').trim().notEmpty(),
  body('nome').trim().notEmpty(),
  body('tipo').isIn(['ORE', 'MENSILE']),
  body('oreAcquistate').isFloat({ min: 0.01 }),
  body('prezzoTotale').isFloat({ min: 0 }),
  body('dataInizio').isISO8601(),
];

router.get('/', controller.getPackages);
// Endpoint per refresh manuale di tutti gli stati pacchetti
router.post('/refresh-all', requireRole(['ADMIN']), controller.refreshAllStates);

router.post('/', requireRole(['ADMIN']), validation, controller.createPackage);
router.get('/:id', controller.getPackageById);
router.put('/:id', requireRole(['ADMIN']), controller.updatePackage);
router.delete('/:id', requireRole(['ADMIN']), controller.deletePackage);

module.exports = router;
