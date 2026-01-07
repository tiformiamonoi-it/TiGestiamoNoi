// backend/src/controllers/standardPackages.controller.js
// Controller per pacchetti standard (template)

const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');

/**
 * GET /api/standard-packages
 * Lista pacchetti standard
 */
const getStandardPackages = async (req, res, next) => {
  try {
    const { active, categoria, tipo } = req.query;

    const where = {};
    if (active !== undefined) where.active = active === 'true';
    if (categoria) where.categoria = categoria;
    if (tipo) where.tipo = tipo;

    const packages = await prisma.standardPackage.findMany({
      where,
      orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
      include: {
        _count: { select: { pacchetti: true } },
      },
    });

    res.json({ packages });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/standard-packages/:id
 * Dettaglio pacchetto standard
 */
const getStandardPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const package_ = await prisma.standardPackage.findUnique({
      where: { id },
      include: {
        pacchetti: {
          include: {
            student: { select: { firstName: true, lastName: true } },
          },
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!package_) {
      return res.status(404).json({ error: 'Pacchetto standard non trovato' });
    }

    res.json({ package: package_ });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/standard-packages
 * Crea pacchetto standard
 */
const createStandardPackage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const package_ = await prisma.standardPackage.create({
      data: req.body,
    });

    res.status(201).json({
      message: 'Pacchetto standard creato con successo',
      package: package_
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/standard-packages/:id
 * Aggiorna pacchetto standard
 */
const updateStandardPackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const package_ = await prisma.standardPackage.update({
      where: { id },
      data: req.body,
    });

    res.json({
      message: 'Pacchetto standard aggiornato con successo',
      package: package_
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/standard-packages/:id
 * Elimina pacchetto standard (solo se non usato da nessun alunno)
 */
const deleteStandardPackage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verifica se il pacchetto è usato da qualche alunno
    const package_ = await prisma.standardPackage.findUnique({
      where: { id },
      include: {
        _count: { select: { pacchetti: true } }
      }
    });

    if (!package_) {
      return res.status(404).json({ error: 'Pacchetto standard non trovato' });
    }

    if (package_._count.pacchetti > 0) {
      return res.status(400).json({
        error: `Impossibile eliminare: questo pacchetto è presente nella storia di ${package_._count.pacchetti} alunno/i. Puoi solo disattivarlo.`
      });
    }

    // Elimina definitivamente solo se non è usato
    await prisma.standardPackage.delete({
      where: { id }
    });

    res.json({
      message: 'Pacchetto standard eliminato con successo'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStandardPackages,
  getStandardPackageById,
  createStandardPackage,
  updateStandardPackage,
  deleteStandardPackage,
};
