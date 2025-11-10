// backend/src/controllers/tutors.controller.js
/**
 * Controller per gestione tutor
 * Ritorna lista tutor attivi per dropdown/filtri
 */

const prisma = require('../config/prisma');

/**
 * GET /api/tutors
 * Lista tutor attivi ordinati per cognome
 */
const getTutors = async (req, res, next) => {
  try {
    const { active = 'true' } = req.query;

    const where = {
      role: 'TUTOR',
    };

    if (active === 'true') {
      where.active = true;
    }

    const tutors = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        active: true,
      },
      orderBy: [
        { lastName: 'asc' },
        { firstName: 'asc' },
      ],
    });

    res.json({ tutors });
  } catch (error) {
    console.error('Errore recupero tutors:', error);
    next(error);
  }
};

module.exports = {
  getTutors,
};
