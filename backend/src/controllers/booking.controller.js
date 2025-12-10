// backend/src/controllers/booking.controller.js
/**
 * Controller per prenotazioni pubbliche studenti
 */

const prisma = require('../config/prisma');
const { sendBookingNotification, sendCommunicationNotification } = require('../services/email.service');

/**
 * POST /api/bookings/public
 * Crea una nuova prenotazione (endpoint pubblico)
 */
const createPublicBooking = async (req, res, next) => {
    try {
        const { studentName, studentSurname, studentPhone, requestedDate, subjects, notes } = req.body;

        // Validazione
        if (!studentName || !studentSurname || !studentPhone || !requestedDate || !subjects?.length) {
            return res.status(400).json({
                error: 'Tutti i campi obbligatori devono essere compilati'
            });
        }

        // Crea prenotazione
        const booking = await prisma.booking.create({
            data: {
                studentName: studentName.trim(),
                studentSurname: studentSurname.trim(),
                studentPhone: studentPhone.trim(),
                requestedDate: new Date(requestedDate),
                subjects,
                notes: notes?.trim() || null,
                status: 'PENDING'
            }
        });

        // Invia email notifica admin (async, non blocca la risposta)
        sendBookingNotification(booking).catch(err =>
            console.error('Errore invio email:', err)
        );

        res.status(201).json({
            message: 'Prenotazione inviata con successo!',
            booking: {
                id: booking.id,
                studentName: booking.studentName,
                studentSurname: booking.studentSurname,
                requestedDate: booking.requestedDate,
                subjects: booking.subjects
            }
        });
    } catch (error) {
        console.error('Errore creazione prenotazione:', error);
        next(error);
    }
};

/**
 * GET /api/bookings/public/materie
 * Lista materie disponibili (endpoint pubblico)
 */
const getPublicMaterie = async (req, res, next) => {
    try {
        // Recupera materie dalle impostazioni globali
        const materieConfig = await prisma.systemConfig.findMany({
            where: { category: 'materie' },
            select: { value: true }
        });

        const materie = materieConfig.map(m => m.value).sort();

        res.json({ materie });
    } catch (error) {
        console.error('Errore recupero materie:', error);
        next(error);
    }
};

/**
 * POST /api/bookings/public/check-duplicate
 * Verifica se esiste già una prenotazione per lo stesso cognome+telefono e giorno
 */
const checkDuplicateBooking = async (req, res, next) => {
    try {
        const { studentSurname, studentPhone, requestedDate } = req.body;

        if (!studentSurname || !studentPhone || !requestedDate) {
            return res.status(400).json({ error: 'Cognome, telefono e data richiesti' });
        }

        const date = new Date(requestedDate);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        const existing = await prisma.booking.findFirst({
            where: {
                studentSurname: { equals: studentSurname.trim(), mode: 'insensitive' },
                studentPhone: studentPhone.trim(),
                requestedDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: { not: 'CANCELLED' }
            }
        });

        res.json({
            isDuplicate: !!existing,
            existingBooking: existing ? {
                id: existing.id,
                subjects: existing.subjects,
                createdAt: existing.createdAt
            } : null
        });
    } catch (error) {
        console.error('Errore check duplicato:', error);
        next(error);
    }
};

/**
 * POST /api/bookings/public/communication
 * Aggiunge solo una comunicazione/nota a una prenotazione esistente
 */
const addCommunication = async (req, res, next) => {
    try {
        const { studentName, studentSurname, studentPhone, requestedDate, notes } = req.body;

        if (!studentPhone || !notes) {
            return res.status(400).json({ error: 'Telefono e nota sono obbligatori' });
        }

        // Trova la prenotazione esistente
        const date = new Date(requestedDate);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        const existing = await prisma.booking.findFirst({
            where: {
                studentPhone: studentPhone.trim(),
                requestedDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: { not: 'CANCELLED' }
            }
        });

        if (existing) {
            // Aggiorna le note della prenotazione esistente
            const updatedBooking = await prisma.booking.update({
                where: { id: existing.id },
                data: {
                    notes: existing.notes
                        ? `${existing.notes}\n---\n[Comunicazione ${new Date().toLocaleString('it-IT')}]: ${notes}`
                        : `[Comunicazione ${new Date().toLocaleString('it-IT')}]: ${notes}`
                }
            });

            // Invia email notifica (async)
            sendCommunicationNotification({
                studentName, studentSurname, studentPhone, requestedDate, notes
            }).catch(err => console.error('Errore invio email:', err));

            res.json({
                message: 'Comunicazione aggiunta alla prenotazione esistente',
                booking: updatedBooking
            });
        } else {
            // Crea una nuova prenotazione con solo la nota (tipo COMMUNICATION)
            const booking = await prisma.booking.create({
                data: {
                    studentName: studentName?.trim() || 'Comunicazione',
                    studentSurname: studentSurname?.trim() || '',
                    studentPhone: studentPhone.trim(),
                    requestedDate: date,
                    subjects: [],
                    notes: `[Comunicazione]: ${notes}`,
                    status: 'PENDING'
                }
            });

            res.status(201).json({
                message: 'Comunicazione inviata',
                booking
            });
        }
    } catch (error) {
        console.error('Errore invio comunicazione:', error);
        next(error);
    }
};

/**
 * GET /api/bookings
 * Lista prenotazioni (admin)
 */
const getBookings = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.booking.count({ where })
        ]);

        res.json({
            bookings,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Errore recupero prenotazioni:', error);
        next(error);
    }
};

/**
 * PATCH /api/bookings/:id/status
 * Aggiorna stato prenotazione (admin)
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
            return res.status(400).json({ error: 'Stato non valido' });
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: { status }
        });

        res.json({
            message: 'Stato aggiornato',
            booking
        });
    } catch (error) {
        console.error('Errore aggiornamento stato:', error);
        next(error);
    }
};

/**
 * DELETE /api/bookings/:id
 * Elimina prenotazione (admin)
 */
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.booking.delete({
            where: { id }
        });

        res.json({ message: 'Prenotazione eliminata' });
    } catch (error) {
        console.error('Errore eliminazione prenotazione:', error);
        next(error);
    }
};

module.exports = {
    createPublicBooking,
    getPublicMaterie,
    checkDuplicateBooking,
    addCommunication,
    getBookings,
    updateBookingStatus,
    deleteBooking
};
