// backend/src/routes/dashboard.routes.js
// Routes per dashboard

const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/stats', controller.getDashboardStats);

module.exports = router;
