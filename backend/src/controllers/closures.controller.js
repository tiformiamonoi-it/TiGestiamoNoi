// backend/src/controllers/closures.controller.js
/**
 * Controller per gestione chiusure
 */

const prisma = require('../config/prisma');

/**
 * GET /api/closures
 * Lista tutte le chiusure (future)
 */
const getClosures = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const closures = await prisma.closureDate.findMany({
            where: {
                date: { gte: today }
            },
            orderBy: { date: 'asc' }
        });

        // Formatta date
        const formatted = closures.map(c => {
            const d = c.date;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return {
                id: c.id,
                date: `${year}-${month}-${day}`,
                description: c.description || ''
            };
        });

        res.json({ closures: formatted });
    } catch (error) {
        console.error('Errore get chiusure:', error);
        next(error);
    }
};

/**
 * GET /api/closures/all
 * Lista tutte le chiusure (anche passate)
 */
const getAllClosures = async (req, res, next) => {
    try {
        const closures = await prisma.closureDate.findMany({
            orderBy: { date: 'desc' }
        });

        const formatted = closures.map(c => {
            const d = c.date;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return {
                id: c.id,
                date: `${year}-${month}-${day}`,
                description: c.description || ''
            };
        });

        res.json({ closures: formatted });
    } catch (error) {
        console.error('Errore get tutte chiusure:', error);
        next(error);
    }
};

/**
 * POST /api/closures
 * Aggiungi una chiusura
 */
const addClosure = async (req, res, next) => {
    try {
        const { date, description } = req.body;

        if (!date) {
            return res.status(400).json({ error: 'Data richiesta' });
        }

        // Parse data
        const [year, month, day] = date.split('-').map(Number);
        const closureDate = new Date(year, month - 1, day, 12, 0, 0);

        const closure = await prisma.closureDate.create({
            data: {
                date: closureDate,
                description: description?.trim() || null
            }
        });

        res.status(201).json({
            message: 'Chiusura aggiunta',
            closure: {
                id: closure.id,
                date,
                description: closure.description || ''
            }
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Questa data è già una chiusura' });
        }
        console.error('Errore aggiunta chiusura:', error);
        next(error);
    }
};

/**
 * DELETE /api/closures/:id
 * Rimuovi una chiusura
 */
const deleteClosure = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.closureDate.delete({
            where: { id }
        });

        res.json({ message: 'Chiusura rimossa' });
    } catch (error) {
        console.error('Errore rimozione chiusura:', error);
        next(error);
    }
};

/**
 * GET /api/closures/check/:date
 * Verifica se una data è chiusura (pubblico)
 */
const checkClosure = async (req, res, next) => {
    try {
        const { date } = req.params;
        const [year, month, day] = date.split('-').map(Number);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

        const closure = await prisma.closureDate.findFirst({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        res.json({
            isClosed: !!closure,
            description: closure?.description || null
        });
    } catch (error) {
        console.error('Errore check chiusura:', error);
        next(error);
    }
};

module.exports = {
    getClosures,
    getAllClosures,
    addClosure,
    deleteClosure,
    checkClosure
};
