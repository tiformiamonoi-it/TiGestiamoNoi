// backend/src/controllers/auth.controller.js
// Controller per login e autenticazione

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Login utente
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validazione input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' });
    }

    // Cerca utente
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tutorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Verifica password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Verifica account attivo
    if (!user.active) {
      return res.status(403).json({ error: 'Account disattivato' });
    }

    // Genera JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Rimuovi password dalla risposta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login effettuato con successo',
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ottieni utente corrente (tramite token)
 * GET /api/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // req.user è già popolato dal middleware authenticateToken
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getCurrentUser,
};
