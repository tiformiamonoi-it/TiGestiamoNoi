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

/**
 * Lista tutti gli utenti
 * GET /api/auth/users
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        active: true,
        createdAt: true,
      },
    });

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

/**
 * Crea nuovo utente
 * POST /api/auth/users
 */
const createUser = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role, phone, active } = req.body;

    // Validazione
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, nome e cognome sono obbligatori' });
    }

    // Verifica email unica
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email già registrata' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        firstName,
        lastName,
        role: role || 'TUTOR',
        phone: phone || null,
        active: active !== false,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      message: 'Utente creato con successo',
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Aggiorna utente
 * PUT /api/auth/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, role, phone, active } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        role,
        phone: phone || null,
        active,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Utente aggiornato con successo',
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password utente
 * POST /api/auth/users/:id/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'La password deve essere di almeno 8 caratteri' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: { password: passwordHash },
    });

    res.json({ message: 'Password resettata con successo' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  getCurrentUser,
  getUsers,
  createUser,
  updateUser,
  resetPassword,
};
