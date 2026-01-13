const prisma = require('../config/prisma');

// ============================================
// GET REIMBURSEMENTS BY TUTOR
// ============================================

// GET /api/reimbursements/tutor/:tutorId
async function getByTutor(req, res, next) {
    try {
        const { tutorId } = req.params;

        const reimbursements = await prisma.tutorReimbursement.findMany({
            where: { tutorId },
            orderBy: { dataRichiesta: 'desc' },
            include: {
                tutor: {
                    select: { firstName: true, lastName: true }
                },
                movimentiContabili: {
                    orderBy: { data: 'desc' }
                }
            }
        });

        res.json({ data: reimbursements });
    } catch (error) {
        next(error);
    }
}

// ============================================
// CREATE REIMBURSEMENT
// ============================================

// POST /api/reimbursements
async function create(req, res, next) {
    try {
        const { tutorId, importo, descrizione, note } = req.body;

        if (!tutorId || !importo || !descrizione) {
            return res.status(400).json({ error: 'tutorId, importo e descrizione sono obbligatori' });
        }

        const reimbursement = await prisma.tutorReimbursement.create({
            data: {
                tutorId,
                importo: parseFloat(importo),
                descrizione,
                note: note || null,
                stato: 'DA_PAGARE'
            },
            include: {
                tutor: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        res.status(201).json({ data: reimbursement });
    } catch (error) {
        next(error);
    }
}

// ============================================
// PAY REIMBURSEMENT
// ============================================

// PUT /api/reimbursements/:id/pay
async function pay(req, res, next) {
    try {
        const { id } = req.params;
        const { importoPagato, metodo, dataPagamento } = req.body;

        // Trova il rimborso con i dati del tutor
        const reimbursement = await prisma.tutorReimbursement.findUnique({
            where: { id },
            include: {
                tutor: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        if (!reimbursement) {
            return res.status(404).json({ error: 'Rimborso non trovato' });
        }

        const importoTotale = parseFloat(reimbursement.importo);
        const importoGiaPagato = parseFloat(reimbursement.importoPagato);
        const nuovoImportoPagato = parseFloat(importoPagato);
        const totalePagato = importoGiaPagato + nuovoImportoPagato;
        const residuo = importoTotale - totalePagato;

        // Determina lo stato
        let nuovoStato = 'DA_PAGARE';
        if (residuo <= 0.01) {
            nuovoStato = 'PAGATO';
        } else if (totalePagato > 0) {
            nuovoStato = 'PARZIALE';
        }

        // Prepara la descrizione per contabilità
        const tutorName = `${reimbursement.tutor.firstName} ${reimbursement.tutor.lastName}`;
        const descrizioneContabile = `Rimborso: ${reimbursement.descrizione} - ${tutorName}`;

        // Transazione per aggiornare rimborso e creare movimento contabile
        const result = await prisma.$transaction(async (tx) => {
            // Aggiorna il rimborso
            const updatedReimbursement = await tx.tutorReimbursement.update({
                where: { id },
                data: {
                    importoPagato: totalePagato,
                    stato: nuovoStato,
                    metodo: metodo || 'BONIFICO',
                    dataPagamento: nuovoStato === 'PAGATO' ? new Date(dataPagamento || Date.now()) : null
                }
            });

            // Crea il movimento contabile (USCITA)
            const accountingEntry = await tx.accountingEntry.create({
                data: {
                    tipo: 'USCITA',
                    importo: nuovoImportoPagato,
                    descrizione: descrizioneContabile,
                    categoria: 'Rimborso Tutor',
                    data: new Date(dataPagamento || Date.now()),
                    metodoPagamento: metodo || 'BONIFICO',
                    reimbursementId: id
                }
            });

            return { reimbursement: updatedReimbursement, accountingEntry };
        });

        res.json({
            message: 'Pagamento registrato con successo',
            data: result.reimbursement,
            accountingEntry: result.accountingEntry
        });
    } catch (error) {
        next(error);
    }
}

// ============================================
// DELETE REIMBURSEMENT
// ============================================

// DELETE /api/reimbursements/:id
// Query param: ?force=true per eliminare anche se pagato
async function remove(req, res, next) {
    try {
        const { id } = req.params;
        const { force } = req.query;

        // Trova il rimborso con i movimenti contabili
        const reimbursement = await prisma.tutorReimbursement.findUnique({
            where: { id },
            include: {
                movimentiContabili: true
            }
        });

        if (!reimbursement) {
            return res.status(404).json({ error: 'Rimborso non trovato' });
        }

        // Se non è force e ha pagamenti, blocca l'eliminazione
        if (!force && (reimbursement.stato === 'PAGATO' || reimbursement.stato === 'PARZIALE')) {
            return res.status(400).json({
                error: 'Impossibile eliminare un rimborso già pagato. Usa ?force=true per forzare eliminazione con tutti i pagamenti.'
            });
        }

        // Transazione per eliminare movimenti contabili e rimborso
        await prisma.$transaction(async (tx) => {
            // Prima elimina tutti i movimenti contabili associati
            if (reimbursement.movimentiContabili && reimbursement.movimentiContabili.length > 0) {
                await tx.accountingEntry.deleteMany({
                    where: { reimbursementId: id }
                });
            }

            // Poi elimina il rimborso
            await tx.tutorReimbursement.delete({
                where: { id }
            });
        });

        const deletedPayments = reimbursement.movimentiContabili?.length || 0;
        res.json({
            message: `Rimborso eliminato con successo${deletedPayments > 0 ? ` insieme a ${deletedPayments} pagamento/i` : ''}`
        });
    } catch (error) {
        next(error);
    }
}

// ============================================
// UPDATE REIMBURSEMENT
// ============================================

// PUT /api/reimbursements/:id
async function update(req, res, next) {
    try {
        const { id } = req.params;
        const { importo, descrizione, note } = req.body;

        // Trova il rimborso
        const reimbursement = await prisma.tutorReimbursement.findUnique({
            where: { id }
        });

        if (!reimbursement) {
            return res.status(404).json({ error: 'Rimborso non trovato' });
        }

        // Non permettere modifica se già pagato
        if (reimbursement.stato === 'PAGATO') {
            return res.status(400).json({
                error: 'Impossibile modificare un rimborso già saldato'
            });
        }

        const updateData = {};
        if (importo !== undefined) updateData.importo = parseFloat(importo);
        if (descrizione !== undefined) updateData.descrizione = descrizione;
        if (note !== undefined) updateData.note = note;

        const updated = await prisma.tutorReimbursement.update({
            where: { id },
            data: updateData,
            include: {
                tutor: {
                    select: { firstName: true, lastName: true }
                }
            }
        });

        res.json({ data: updated });
    } catch (error) {
        next(error);
    }
}

// ============================================
// DELETE PAYMENT (Movimento contabile)
// ============================================

// DELETE /api/reimbursements/:id/payments/:paymentId
async function deletePayment(req, res, next) {
    try {
        const { id, paymentId } = req.params;

        // Trova il rimborso
        const reimbursement = await prisma.tutorReimbursement.findUnique({
            where: { id }
        });

        if (!reimbursement) {
            return res.status(404).json({ error: 'Rimborso non trovato' });
        }

        // Trova il movimento contabile
        const accountingEntry = await prisma.accountingEntry.findUnique({
            where: { id: paymentId }
        });

        if (!accountingEntry) {
            return res.status(404).json({ error: 'Pagamento non trovato' });
        }

        // Verifica che il movimento sia associato a questo rimborso
        if (accountingEntry.reimbursementId !== id) {
            return res.status(400).json({ error: 'Il pagamento non appartiene a questo rimborso' });
        }

        const importoPagamento = parseFloat(accountingEntry.importo);
        const importoPagatoAttuale = parseFloat(reimbursement.importoPagato);
        const nuovoImportoPagato = Math.max(0, importoPagatoAttuale - importoPagamento);
        const importoTotale = parseFloat(reimbursement.importo);

        // Determina il nuovo stato
        let nuovoStato = 'DA_PAGARE';
        if (nuovoImportoPagato <= 0.01) {
            // Nessun pagamento rimasto
            nuovoStato = 'DA_PAGARE';
        } else if (nuovoImportoPagato >= importoTotale - 0.01) {
            // Tutto pagato
            nuovoStato = 'PAGATO';
        } else {
            // Pagamento parziale
            nuovoStato = 'PARZIALE';
        }

        // Transazione per eliminare movimento e aggiornare rimborso
        await prisma.$transaction(async (tx) => {
            // Elimina il movimento contabile
            await tx.accountingEntry.delete({
                where: { id: paymentId }
            });

            // Aggiorna il rimborso
            await tx.tutorReimbursement.update({
                where: { id },
                data: {
                    importoPagato: nuovoImportoPagato,
                    stato: nuovoStato,
                    dataPagamento: nuovoStato === 'PAGATO' ? reimbursement.dataPagamento : null
                }
            });
        });

        res.json({
            message: 'Pagamento eliminato con successo',
            nuovoStato,
            nuovoImportoPagato
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getByTutor,
    create,
    pay,
    remove,
    update,
    deletePayment
};
