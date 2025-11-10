// backend/src/middleware/auth.js
// Middleware per autenticazione JWT

const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

/**
 * Middleware per verificare JWT token
 * Aggiunge req.user con i dati dell'utente autenticato
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Ottieni token dall'header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token di autenticazione mancante' });
    }

    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Cerca utente nel database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tutorProfile: true,
      },
    });

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Utente non valido o disattivato' });
    }

    // Aggiungi utente alla request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Token non valido' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token scaduto' });
    }
    return res.status(500).json({ error: 'Errore autenticazione' });
  }
};

/**
 * Middleware per verificare ruolo utente
 * @param {Array<string>} roles - Array di ruoli consentiti (es: ['ADMIN', 'TUTOR'])
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Utente non autenticato' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permessi insufficienti' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
};
