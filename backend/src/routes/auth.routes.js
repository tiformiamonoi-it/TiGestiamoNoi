// backend/src/routes/auth.routes.js
// Routes per autenticazione

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login - Login utente
router.post('/login', authController.login);

// GET /api/auth/me - Ottieni utente corrente (richiede autenticazione)
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
