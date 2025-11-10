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
 * Aggiorna configurazione
 */
const updateConfig = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Value è obbligatorio' });
    }

    const config = await prisma.systemConfig.update({
      where: { key },
      data: { value },
    });

    res.json({
      message: 'Configurazione aggiornata con successo',
      config,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConfigs,
  getConfigByKey,
  updateConfig,
};
