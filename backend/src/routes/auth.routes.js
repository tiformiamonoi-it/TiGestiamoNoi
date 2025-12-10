// backend/src/routes/auth.routes.js
// Routes per autenticazione

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, requireRole } = require('../middleware/auth');

// POST /api/auth/login - Login utente
router.post('/login', authController.login);

// GET /api/auth/me - Ottieni utente corrente (richiede autenticazione)
router.get('/me', authenticateToken, authController.getCurrentUser);

// ===== User Management (Admin only) =====
router.get('/users', authenticateToken, requireRole(['ADMIN']), authController.getUsers);
router.post('/users', authenticateToken, requireRole(['ADMIN']), authController.createUser);
router.put('/users/:id', authenticateToken, requireRole(['ADMIN']), authController.updateUser);
router.post('/users/:id/reset-password', authenticateToken, requireRole(['ADMIN']), authController.resetPassword);

module.exports = router;
