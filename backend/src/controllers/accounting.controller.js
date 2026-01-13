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
            metodo,
            origine,
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
        // Usiamo un array per combinare i filtri che richiedono OR
        const andConditions = [...(where.AND || [])];

        // Filtro metodo pagamento (deve controllare sia il campo diretto che i pagamenti collegati)
        if (metodo && metodo !== 'tutti') {
            const metodoUpper = metodo.toUpperCase();
            andConditions.push({
                OR: [
                    { metodoPagamento: metodoUpper },
                    { payment: { metodoPagamento: metodoUpper } },
                    { tutorPayment: { metodo: metodoUpper } }
                ]
            });
        }

        // Filtro origine (automatico/manuale)
        if (origine === 'automatico') {
            andConditions.push({
                OR: [
                    { paymentId: { not: null } },
                    { tutorPaymentId: { not: null } }
                ]
            });
        } else if (origine === 'manuale') {
            andConditions.push({ paymentId: null });
            andConditions.push({ tutorPaymentId: null });
        }

        // Ricerca testuale
        if (search) {
            andConditions.push({
                OR: [
                    { descrizione: { contains: search, mode: 'insensitive' } },
                    { categoria: { contains: search, mode: 'insensitive' } },
                    { note: { contains: search, mode: 'insensitive' } }
                ]
            });
        }

        // Applica le condizioni AND se ce ne sono
        if (andConditions.length > 0) {
            where.AND = andConditions;
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

        // Arricchisci movimenti con metodo pagamento (da payment o tutorPayment se automatico)
        const movimentiArricchiti = movimenti.map(mov => {
            let metodoEffettivo = mov.metodoPagamento;
            // Se non c'è metodo e c'è un pagamento collegato, usa il suo metodo
            if (!metodoEffettivo && mov.payment) {
                metodoEffettivo = mov.payment.metodoPagamento;
            }
            if (!metodoEffettivo && mov.tutorPayment) {
                metodoEffettivo = mov.tutorPayment.metodo;
            }
            return {
                ...mov,
                metodoPagamentoEffettivo: metodoEffettivo || 'ALTRO'
            };
        });

        // Calcola totali per la pagina
        const totals = await prisma.accountingEntry.groupBy({
            by: ['tipo'],
            where,
            _sum: { importo: true }
        });

        res.json({
            movimenti: movimentiArricchiti,
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

        // Breakdown Banca/Contanti per entrate e uscite
        // Per calcolare questo dobbiamo recuperare tutti i movimenti e sommare per metodo
        const allMovimenti = await prisma.accountingEntry.findMany({
            where,
            select: {
                tipo: true,
                importo: true,
                metodoPagamento: true,
                payment: { select: { metodoPagamento: true } },
                tutorPayment: { select: { metodo: true } }
            }
        });

        // Calcola totali per metodo
        let entrateBanca = 0, entrateContanti = 0;
        let usciteBanca = 0, usciteContanti = 0;

        for (const mov of allMovimenti) {
            const importo = parseFloat(mov.importo || 0);
            // Determina metodo effettivo
            let metodo = mov.metodoPagamento;
            if (!metodo && mov.payment) metodo = mov.payment.metodoPagamento;
            if (!metodo && mov.tutorPayment) metodo = mov.tutorPayment.metodo;

            const isBanca = metodo === 'BONIFICO' || metodo === 'POS';

            if (mov.tipo === 'ENTRATA') {
                if (isBanca) entrateBanca += importo;
                else entrateContanti += importo;
            } else if (mov.tipo === 'USCITA') {
                if (isBanca) usciteBanca += importo;
                else usciteContanti += importo;
            }
        }

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

        // ===== Break-even Point =====
        // Recupera le spese fisse dalla configurazione
        const speseFisseConfigs = await prisma.systemConfig.findMany({
            where: { category: 'spese_fisse' }
        });

        let costiFissiMensili = 0;
        for (const config of speseFisseConfigs) {
            costiFissiMensili += parseFloat(config.value) || 0;
        }

        // Proporziona i costi fissi in base al periodo selezionato
        // Se il periodo è 15 giorni, i costi sono la metà di quelli mensili
        // Formula: costiFissiPeriodo = costiFissiMensili × (giorniPeriodo / 30)
        const costiFissiProporzionati = costiFissiMensili * (giorniPeriodo / 30);

        // Calcola Break-even (usa MARGINE LORDO = entrate - costi tutor)
        // Il margine lordo non include le spese fisse, così non le contiamo due volte
        let breakEvenRaggiunto = false;
        let breakEvenMancante = 0;
        let breakEvenPercentuale = 0;

        if (costiFissiProporzionati > 0) {
            if (margineLordo >= costiFissiProporzionati) {
                breakEvenRaggiunto = true;
                breakEvenMancante = 0;
                breakEvenPercentuale = 100;
            } else {
                breakEvenRaggiunto = false;
                breakEvenMancante = costiFissiProporzionati - margineLordo;
                breakEvenPercentuale = Math.round((margineLordo / costiFissiProporzionati) * 100);
            }
        }

        res.json({
            entrateTotali,
            usciteTotali,
            bilancio,
            margineLordo,
            cashflowMedio: Math.round(cashflowMedio * 100) / 100,
            margineNetto: Math.round(margineNetto * 10) / 10,
            giorniPeriodo,
            countMovimenti,
            // Breakdown Banca/Contanti
            entrateBanca,
            entrateContanti,
            usciteBanca,
            usciteContanti,
            // Break-even Point
            costiFissiMensili,
            costiFissiProporzionati: Math.round(costiFissiProporzionati * 100) / 100,
            breakEven: {
                raggiunto: breakEvenRaggiunto,
                mancante: Math.round(breakEvenMancante * 100) / 100,
                percentuale: breakEvenPercentuale
            },
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
        const { tipo, importo, descrizione, categoria, data, note, metodoPagamento, fatturaEmessa } = req.body;

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
                note,
                metodoPagamento: metodoPagamento?.toUpperCase() || null,
                fatturaEmessa: fatturaEmessa || false
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
        const { tipo, importo, descrizione, categoria, data, note, metodoPagamento, fatturaEmessa } = req.body;

        const existing = await prisma.accountingEntry.findUnique({
            where: { id }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Movimento non trovato' });
        }

        // Verifica se è un movimento automatico
        const isAutomatic = existing.paymentId || existing.tutorPaymentId;

        // Per movimenti automatici, blocca modifica importo (non si può modificare importo pacchetto da qui)
        if (isAutomatic && importo && parseFloat(importo) !== parseFloat(existing.importo)) {
            return res.status(403).json({
                error: 'Non è possibile modificare l\'importo di un pagamento pacchetto dalla contabilità. Modifica il pagamento dalla scheda alunno.'
            });
        }

        // Solo admin può modificare altri campi dei movimenti automatici
        if (isAutomatic && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Solo admin può modificare movimenti automatici' });
        }

        // Prepara i dati per l'aggiornamento
        const nuovaData = data ? new Date(data) : existing.data;
        const nuovoMetodo = metodoPagamento?.toUpperCase() || existing.metodoPagamento;

        const movimento = await prisma.accountingEntry.update({
            where: { id },
            data: {
                tipo: tipo?.toUpperCase() || existing.tipo,
                // Per movimenti automatici non permettiamo modifica importo
                importo: isAutomatic ? existing.importo : (importo ? parseFloat(importo) : existing.importo),
                descrizione: descrizione || existing.descrizione,
                categoria: categoria || existing.categoria,
                data: nuovaData,
                note: note !== undefined ? note : existing.note,
                metodoPagamento: nuovoMetodo,
                fatturaEmessa: fatturaEmessa !== undefined ? fatturaEmessa : existing.fatturaEmessa
            }
        });

        // Se è collegato a un pagamento pacchetto, sincronizza data e metodo
        if (existing.paymentId) {
            await prisma.payment.update({
                where: { id: existing.paymentId },
                data: {
                    dataPagamento: nuovaData,
                    metodoPagamento: nuovoMetodo
                }
            });
        }

        // Se è collegato a un pagamento tutor, sincronizza data e metodo
        if (existing.tutorPaymentId) {
            await prisma.tutorPayment.update({
                where: { id: existing.tutorPaymentId },
                data: {
                    dataPagamento: nuovaData,
                    metodo: nuovoMetodo
                }
            });
        }

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
            where: { id },
            include: {
                payment: {
                    include: { package: true }
                },
                reimbursement: true
            }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Movimento non trovato' });
        }

        // Solo admin può eliminare movimenti automatici
        const isAutomatic = existing.paymentId || existing.tutorPaymentId || existing.reimbursementId;
        if (isAutomatic && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Solo admin può eliminare movimenti automatici' });
        }

        // Se è collegato a un pagamento pacchetto, elimina anche il pagamento e aggiorna il pacchetto
        if (existing.paymentId && existing.payment) {
            const payment = existing.payment;
            const packageData = payment.package;

            if (packageData) {
                // Aggiorna gli importi del pacchetto
                const importoPagamento = parseFloat(payment.importo);
                const nuovoImportoPagato = parseFloat(packageData.importoPagato) - importoPagamento;
                const nuovoImportoResiduo = parseFloat(packageData.importoResiduo) + importoPagamento;

                await prisma.package.update({
                    where: { id: packageData.id },
                    data: {
                        importoPagato: nuovoImportoPagato,
                        importoResiduo: nuovoImportoResiduo
                    }
                });
            }

            // Elimina il pagamento (che eliminerà a cascata l'accounting entry grazie alla relazione)
            await prisma.payment.delete({
                where: { id: existing.paymentId }
            });

            return res.json({
                message: 'Movimento e pagamento pacchetto eliminati con successo. Residuo pacchetto aggiornato.'
            });
        }

        // Se è collegato a un rimborso, aggiorna il rimborso
        if (existing.reimbursementId && existing.reimbursement) {
            const reimbursement = existing.reimbursement;
            const importoPagamento = parseFloat(existing.importo);
            const importoPagatoAttuale = parseFloat(reimbursement.importoPagato);
            const nuovoImportoPagato = Math.max(0, importoPagatoAttuale - importoPagamento);
            const importoTotale = parseFloat(reimbursement.importo);

            // Determina il nuovo stato
            let nuovoStato = 'DA_PAGARE';
            if (nuovoImportoPagato <= 0.01) {
                nuovoStato = 'DA_PAGARE';
            } else if (nuovoImportoPagato >= importoTotale - 0.01) {
                nuovoStato = 'PAGATO';
            } else {
                nuovoStato = 'PARZIALE';
            }

            // Transazione per eliminare movimento e aggiornare rimborso
            await prisma.$transaction(async (tx) => {
                // Elimina il movimento contabile
                await tx.accountingEntry.delete({
                    where: { id }
                });

                // Aggiorna il rimborso
                await tx.tutorReimbursement.update({
                    where: { id: existing.reimbursementId },
                    data: {
                        importoPagato: nuovoImportoPagato,
                        stato: nuovoStato,
                        dataPagamento: nuovoStato === 'PAGATO' ? reimbursement.dataPagamento : null
                    }
                });
            });

            return res.json({
                message: `Movimento eliminato. Rimborso aggiornato: nuovo stato ${nuovoStato}, importo pagato €${nuovoImportoPagato.toFixed(2)}`
            });
        }

        // Per movimenti manuali o tutor payments, elimina solo il movimento
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
