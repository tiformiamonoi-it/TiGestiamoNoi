// backend/src/routes/standardPackages.routes.js
// Routes per pacchetti standard

const express = require('express');
const router = express.Router();
const controller = require('../controllers/standardPackages.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

router.use(authenticateToken);

const validation = [
  body('nome').trim().notEmpty(),
  body('tipo').isIn(['ORE', 'MENSILE']),
  body('categoria').trim().notEmpty(),
  body('oreIncluse').isFloat({ min: 0 }),
  body('prezzoStandard').isFloat({ min: 0 }),
];

router.get('/', controller.getStandardPackages);
router.get('/:id', controller.getStandardPackageById);
router.post('/', requireRole(['ADMIN']), validation, controller.createStandardPackage);
router.put('/:id', requireRole(['ADMIN']), validation, controller.updateStandardPackage);
router.delete('/:id', requireRole(['ADMIN']), controller.deleteStandardPackage);

module.exports = router;
