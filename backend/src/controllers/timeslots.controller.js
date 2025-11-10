// backend/src/controllers/timeslots.controller.js
/**
 * Controller per gestione slot orari
 * Gestisce CRUD slot orari standard per calendario
 */

const prisma = require('../config/prisma');

/**
 * GET /api/timeslots
 * Lista slot orari attivi ordinati per oraInizio
 */
const getTimeSlots = async (req, res, next) => {
  try {
    const { attivo } = req.query;

    const where = {};
    
    // Filtro solo slot attivi (default: tutti)
    if (attivo !== undefined) {
      where.active = attivo === 'true';
    }

    const timeSlots = await prisma.timeSlot.findMany({
      where,
      orderBy: {
        oraInizio: 'asc',
      },
    });

    res.json({ timeSlots });
  } catch (error) {
    console.error('Errore recupero time slots:', error);
    next(error);
  }
};

/**
 * POST /api/timeslots
 * Crea nuovo slot orario (solo admin)
 */
const createTimeSlot = async (req, res, next) => {
  try {
    const { oraInizio, oraFine, attivo = true } = req.body;

    // Validazione
    if (!oraInizio || !oraFine) {
      return res.status(400).json({ error: 'oraInizio e oraFine sono obbligatori' });
    }

    // Controlla duplicati
    const esistente = await prisma.timeSlot.findFirst({
      where: {
        oraInizio,
        oraFine,
      },
    });

    if (esistente) {
      return res.status(400).json({ error: 'Slot orario già esistente' });
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        oraInizio,
        oraFine,
        active,
      },
    });

    res.status(201).json({
      message: 'Slot orario creato con successo',
      timeSlot,
    });
  } catch (error) {
    console.error('Errore creazione time slot:', error);
    next(error);
  }
};

/**
 * PATCH /api/timeslots/:id
 * Attiva/disattiva slot orario
 */
const toggleTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { attivo } = req.body;

    const timeSlot = await prisma.timeSlot.update({
      where: { id },
      data: { active: attivo },
    });

    res.json({
      message: 'Slot orario aggiornato',
      timeSlot,
    });
  } catch (error) {
    console.error('Errore aggiornamento time slot:', error);
    next(error);
  }
};

module.exports = {
  getTimeSlots,
  createTimeSlot,
  toggleTimeSlot,
};
