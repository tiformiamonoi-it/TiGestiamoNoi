// backend/src/routes/config.routes.js
// Routes per configurazioni sistema

const express = require('express');
const router = express.Router();
const controller = require('../controllers/config.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.use(authenticateToken);

// Tutti possono leggere configurazioni
router.get('/', controller.getConfigs);
router.get('/:key', controller.getConfigByKey);

// Solo admin può modificare
router.post('/', requireRole(['ADMIN']), controller.createConfig);
router.put('/:key', requireRole(['ADMIN']), controller.updateConfig);
router.delete('/:key', requireRole(['ADMIN']), controller.deleteConfig);

module.exports = router;
