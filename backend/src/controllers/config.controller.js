// backend/src/controllers/config.controller.js
// Controller per configurazioni sistema

const prisma = require('../config/prisma');

/**
 * GET /api/config
 * Ottieni tutte le configurazioni (opzionale per categoria)
 */
const getConfigs = async (req, res, next) => {
  try {
    const { category } = req.query;

    const where = {};
    if (category) where.category = category;

    const configs = await prisma.systemConfig.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    res.json({ configs });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/config/:key
 * Ottieni singola configurazione per chiave
 */
const getConfigByKey = async (req, res, next) => {
  try {
    const { key } = req.params;

    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      return res.status(404).json({ error: 'Configurazione non trovata' });
    }

    res.json({ config });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/config/:key
 * Aggiorna configurazione (o crea se non esiste - upsert)
 */
const updateConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value è obbligatorio' });
    }

    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: {
        key,
        value: String(value),
        category: req.body.category || 'generale',
        description: req.body.description || null
      },
    });

    res.json({
      message: 'Configurazione aggiornata con successo',
      config,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/config
 * Crea nuova configurazione
 */
const createConfig = async (req, res, next) => {
  try {
    const { key, value, category, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key e value sono obbligatori' });
    }

    // Verifica che non esista già
    const existing = await prisma.systemConfig.findUnique({ where: { key } });
    if (existing) {
      return res.status(400).json({ error: 'Configurazione con questa chiave esiste già' });
    }

    const config = await prisma.systemConfig.create({
      data: {
        key,
        value: String(value),
        category: category || 'generale',
        description: description || null,
      },
    });

    res.status(201).json({
      message: 'Configurazione creata con successo',
      config,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/config/:key
 * Elimina configurazione
 */
const deleteConfig = async (req, res, next) => {
  try {
    const { key } = req.params;

    await prisma.systemConfig.delete({
      where: { key },
    });

    res.json({ message: 'Configurazione eliminata con successo' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConfigs,
  getConfigByKey,
  updateConfig,
  createConfig,
  deleteConfig,
};
