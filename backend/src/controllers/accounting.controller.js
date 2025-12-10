// backend/src/controllers/accounting.controller.js
/**
 * Controller per gestione contabilità
 * Visualizzazione movimenti, statistiche e CRUD movimenti manuali
 */

const prisma = require('../config/prisma');

/**
 * GET /api/accounting
 * Lista movimenti contabili con filtri
 */
const getMovimenti = async (req, res, next) => {
    try {
        const {
            dataInizio,
            dataFine,
            tipo,
            categoria,
            page = 1,
            limit = 50,
            search
        } = req.query;

        const skip = (page - 1) * limit;
        const where = {};

        // Filtro date
        if (dataInizio || dataFine) {
            where.data = {};
            if (dataInizio) where.data.gte = new Date(dataInizio);
            if (dataFine) {
                const endDate = new Date(dataFine);
                endDate.setHours(23, 59, 59, 999);
                where.data.lte = endDate;
            }
        }

        // Filtro tipo
        if (tipo && tipo !== 'tutti') {
            where.tipo = tipo.toUpperCase();
        }

        // Filtro categoria
        if (categoria && categoria !== 'tutte') {
            where.categoria = categoria;
        }

        // Ricerca testuale
        if (search) {
            where.OR = [
                { descrizione: { contains: search, mode: 'insensitive' } },
                { categoria: { contains: search, mode: 'insensitive' } },
                { note: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [movimenti, total] = await Promise.all([
            prisma.accountingEntry.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { data: 'desc' },
                include: {
                    payment: {
                        include: {
                            package: {
                                include: {
                                    student: { select: { firstName: true, lastName: true } }
                                }
                            }
                        }
                    },
                    tutorPayment: {
                        include: {
                            tutor: { select: { firstName: true, lastName: true } }
                        }
                    }
                }
            }),
            prisma.accountingEntry.count({ where })
        ]);

        // Calcola totali per la pagina
        const totals = await prisma.accountingEntry.groupBy({
            by: ['tipo'],
            where,
            _sum: { importo: true }
        });

        res.json({
            movimenti,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            },
            totals: {
                entrate: totals.find(t => t.tipo === 'ENTRATA')?._sum.importo || 0,
                uscite: totals.find(t => t.tipo === 'USCITA')?._sum.importo || 0
            }
        });
    } catch (error) {
        console.error('Errore recupero movimenti:', error);
        next(error);
    }
};

/**
 * GET /api/accounting/stats
 * Statistiche panoramica contabile
 */
const getStats = async (req, res, next) => {
    try {
        const { dataInizio, dataFine } = req.query;

        const where = {};
        if (dataInizio || dataFine) {
            where.data = {};
            if (dataInizio) where.data.gte = new Date(dataInizio);
            if (dataFine) {
                const endDate = new Date(dataFine);
                endDate.setHours(23, 59, 59, 999);
                where.data.lte = endDate;
            }
        }

        // Totali per tipo
        const totaliTipo = await prisma.accountingEntry.groupBy({
            by: ['tipo'],
            where,
            _sum: { importo: true }
        });

        const entrateTotali = parseFloat(totaliTipo.find(t => t.tipo === 'ENTRATA')?._sum.importo || 0);
        const usciteTotali = parseFloat(totaliTipo.find(t => t.tipo === 'USCITA')?._sum.importo || 0);
        const bilancio = entrateTotali - usciteTotali;

        // Breakdown per categoria entrate
        const entratePerCategoria = await prisma.accountingEntry.groupBy({
            by: ['categoria'],
            where: { ...where, tipo: 'ENTRATA' },
            _sum: { importo: true }
        });

        // Breakdown per categoria uscite  
        const uscitePerCategoria = await prisma.accountingEntry.groupBy({
            by: ['categoria'],
            where: { ...where, tipo: 'USCITA' },
            _sum: { importo: true }
        });

        // Costi tutor (per margine lordo)
        const costiTutor = parseFloat(
            uscitePerCategoria.find(c => c.categoria === 'Compenso Tutor')?._sum.importo || 0
        );
        const margineLordo = entrateTotali - costiTutor;

        // Calcolo giorni periodo per cashflow medio
        let giorniPeriodo = 30;
        if (dataInizio && dataFine) {
            const start = new Date(dataInizio);
            const end = new Date(dataFine);
            giorniPeriodo = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        }
        const cashflowMedio = giorniPeriodo > 0 ? bilancio / giorniPeriodo : 0;

        // Margine netto %
        const margineNetto = entrateTotali > 0 ? (bilancio / entrateTotali) * 100 : 0;

        // Conteggio movimenti
        const countMovimenti = await prisma.accountingEntry.count({ where });

        res.json({
            entrateTotali,
            usciteTotali,
            bilancio,
            margineLordo,
            cashflowMedio: Math.round(cashflowMedio * 100) / 100,
            margineNetto: Math.round(margineNetto * 10) / 10,
            giorniPeriodo,
            countMovimenti,
            entratePerCategoria: entratePerCategoria.map(c => ({
                categoria: c.categoria || 'Altro',
                totale: parseFloat(c._sum.importo || 0)
            })),
            uscitePerCategoria: uscitePerCategoria.map(c => ({
                categoria: c.categoria || 'Altro',
                totale: parseFloat(c._sum.importo || 0)
            }))
        });
    } catch (error) {
        console.error('Errore calcolo stats contabilità:', error);
        next(error);
    }
};

/**
 * POST /api/accounting
 * Crea movimento manuale
 */
const createMovimento = async (req, res, next) => {
    try {
        const { tipo, importo, descrizione, categoria, data, note } = req.body;

        if (!tipo || !importo || !descrizione) {
            return res.status(400).json({ error: 'tipo, importo e descrizione sono obbligatori' });
        }

        const movimento = await prisma.accountingEntry.create({
            data: {
                tipo: tipo.toUpperCase(),
                importo: parseFloat(importo),
                descrizione,
                categoria: categoria || 'Altro',
                data: data ? new Date(data) : new Date(),
                note
            }
        });

        res.status(201).json({
            message: 'Movimento creato con successo',
            movimento
        });
    } catch (error) {
        console.error('Errore creazione movimento:', error);
        next(error);
    }
};

/**
 * PUT /api/accounting/:id
 * Modifica movimento (solo manuali o admin)
 */
const updateMovimento = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tipo, importo, descrizione, categoria, data, note } = req.body;

        const existing = await prisma.accountingEntry.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Movimento non trovato' });
        }

        // Solo admin può modificare movimenti automatici
        const isAutomatic = existing.paymentId || existing.tutorPaymentId;
        if (isAutomatic && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Solo admin può modificare movimenti automatici' });
        }

        const movimento = await prisma.accountingEntry.update({
            where: { id },
            data: {
                tipo: tipo?.toUpperCase() || existing.tipo,
                importo: importo ? parseFloat(importo) : existing.importo,
                descrizione: descrizione || existing.descrizione,
                categoria: categoria || existing.categoria,
                data: data ? new Date(data) : existing.data,
                note: note !== undefined ? note : existing.note
            }
        });

        res.json({
            message: 'Movimento aggiornato con successo',
            movimento
        });
    } catch (error) {
        console.error('Errore aggiornamento movimento:', error);
        next(error);
    }
};

/**
 * DELETE /api/accounting/:id
 * Elimina movimento (solo admin per automatici)
 */
const deleteMovimento = async (req, res, next) => {
    try {
        const { id } = req.params;

        const existing = await prisma.accountingEntry.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Movimento non trovato' });
        }

        // Solo admin può eliminare movimenti automatici
        const isAutomatic = existing.paymentId || existing.tutorPaymentId;
        if (isAutomatic && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Solo admin può eliminare movimenti automatici' });
        }

        await prisma.accountingEntry.delete({
            where: { id }
        });

        res.json({
            message: 'Movimento eliminato con successo'
        });
    } catch (error) {
        console.error('Errore eliminazione movimento:', error);
        next(error);
    }
};

/**
 * GET /api/accounting/categories
 * Lista categorie disponibili
 */
const getCategories = async (req, res, next) => {
    try {
        const categories = await prisma.accountingEntry.groupBy({
            by: ['categoria'],
            _count: true
        });

        res.json({
            categories: categories
                .map(c => c.categoria)
                .filter(Boolean)
                .sort()
        });
    } catch (error) {
        console.error('Errore recupero categorie:', error);
        next(error);
    }
};

module.exports = {
    getMovimenti,
    getStats,
    createMovimento,
    updateMovimento,
    deleteMovimento,
    getCategories
};
