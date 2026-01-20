// backend/src/controllers/booking.controller.js
/**
 * Controller per prenotazioni pubbliche studenti
 */

const prisma = require('../config/prisma');
const { sendBookingNotification, sendCommunicationNotification } = require('../services/email.service');

/**
 * Normalizza un numero di telefono rimuovendo spazi, trattini e prefisso +39
 * Es: "+39 329 413 4509" -> "3294134509"
 *     "329-413-4509" -> "3294134509"
 *     "3294134509" -> "3294134509"
 */
function normalizePhone(phone) {
    if (!phone) return '';
    // Rimuove spazi, trattini, punti e parentesi
    let normalized = phone.replace(/[\s\-\.\(\)]/g, '');
    // Rimuove prefisso +39 o 0039
    normalized = normalized.replace(/^(\+39|0039)/, '');
    return normalized;
}

/**
 * POST /api/bookings/public/verify-student
 * Verifica se lo studente è iscritto controllando telefono + cognome/nome
 */
const verifyStudent = async (req, res, next) => {
    try {
        const { studentName, studentSurname, studentPhone } = req.body;

        if (!studentPhone || !studentSurname) {
            return res.status(400).json({
                authorized: false,
                error: 'Cognome e telefono sono obbligatori'
            });
        }

        const normalizedInput = normalizePhone(studentPhone);

        if (!normalizedInput || normalizedInput.length < 9) {
            return res.status(400).json({
                authorized: false,
                error: 'Numero di telefono non valido'
            });
        }

        // Cerca tutti gli studenti attivi
        const students = await prisma.student.findMany({
            where: {
                active: true
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                studentPhone: true,
                parentPhone: true
            }
        });

        // Cerca uno studente con numero di telefono corrispondente (normalizzato)
        const matchingStudent = students.find(student => {
            const normalizedStudentPhone = normalizePhone(student.studentPhone);
            const normalizedParentPhone = normalizePhone(student.parentPhone);
            return normalizedStudentPhone === normalizedInput || normalizedParentPhone === normalizedInput;
        });

        if (!matchingStudent) {
            return res.json({
                authorized: false,
                error: 'Non sei iscritto. Se vuoi prenotarti, chiama o scrivi al +39 351 400 2510 e fissa un appuntamento.'
            });
        }

        // Numero trovato! Ora verifica cognome (case-insensitive)
        const surnameMatches = matchingStudent.lastName.toLowerCase() === studentSurname.trim().toLowerCase();

        if (surnameMatches) {
            return res.json({
                authorized: true,
                studentId: matchingStudent.id,
                studentName: matchingStudent.firstName,
                studentSurname: matchingStudent.lastName
            });
        }

        // Cognome non corrisponde, verifica nome (case-insensitive)
        if (studentName && matchingStudent.firstName.toLowerCase() === studentName.trim().toLowerCase()) {
            return res.json({
                authorized: true,
                studentId: matchingStudent.id,
                studentName: matchingStudent.firstName,
                studentSurname: matchingStudent.lastName
            });
        }

        // Né cognome né nome corrispondono
        return res.json({
            authorized: false,
            error: 'I dati inseriti non corrispondono. Verifica nome e cognome e riprova.'
        });

    } catch (error) {
        console.error('Errore verifica studente:', error);
        next(error);
    }
};

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

        // Verifica se esiste già una prenotazione per questo telefono+data
        const normalizedPhone = normalizePhone(studentPhone);
        const date = new Date(requestedDate);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        const existingBooking = await prisma.booking.findFirst({
            where: {
                requestedDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: { not: 'CANCELLED' }
            }
        });

        // Controlla se il telefono corrisponde (normalizzato)
        if (existingBooking && normalizePhone(existingBooking.studentPhone) === normalizedPhone) {
            return res.status(400).json({
                error: 'Hai già una prenotazione per questo giorno. Clicca sul giorno nel calendario per modificarla.'
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

        // Invia email notifica admin (await per serverless)
        try {
            await sendBookingNotification(booking);
        } catch (emailErr) {
            console.error('Errore invio email:', emailErr);
            // Non blocca la prenotazione se l'email fallisce
        }

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

            // Invia email notifica (await per serverless)
            try {
                await sendCommunicationNotification({
                    studentName, studentSurname, studentPhone, requestedDate, notes
                });
            } catch (emailErr) {
                console.error('Errore invio email:', emailErr);
            }

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

/**
 * POST /api/bookings/public/my-bookings
 * Ottiene le prenotazioni attive di un utente (per telefono)
 */
const getMyBookings = async (req, res, next) => {
    try {
        const { studentPhone } = req.body;

        if (!studentPhone) {
            return res.status(400).json({ error: 'Telefono richiesto' });
        }

        const normalizedInput = normalizePhone(studentPhone);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Trova tutte le prenotazioni future per questo telefono
        const allBookings = await prisma.booking.findMany({
            where: {
                requestedDate: { gte: today },
                status: { not: 'CANCELLED' }
            },
            orderBy: { requestedDate: 'asc' }
        });

        // Filtra per telefono normalizzato
        const userBookings = allBookings.filter(b =>
            normalizePhone(b.studentPhone) === normalizedInput
        );

        res.json({
            bookings: userBookings.map(b => ({
                id: b.id,
                requestedDate: b.requestedDate,
                subjects: b.subjects,
                status: b.status
            }))
        });
    } catch (error) {
        console.error('Errore recupero prenotazioni utente:', error);
        next(error);
    }
};

/**
 * PATCH /api/bookings/public/:id/subjects
 * Modifica le materie di una prenotazione (o cancella se vuote)
 */
const { sendModificationNotification } = require('../services/email.service');

const updateBookingSubjects = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { subjects, studentPhone } = req.body;

        if (!studentPhone) {
            return res.status(400).json({ error: 'Telefono richiesto per verifica' });
        }

        // Trova la prenotazione
        const booking = await prisma.booking.findUnique({
            where: { id }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Prenotazione non trovata' });
        }

        // Verifica che il telefono corrisponda
        if (normalizePhone(booking.studentPhone) !== normalizePhone(studentPhone)) {
            return res.status(403).json({ error: 'Non sei autorizzato a modificare questa prenotazione' });
        }

        const originalSubjects = booking.subjects || [];
        const newSubjects = subjects || [];
        const removedSubjects = originalSubjects.filter(s => !newSubjects.includes(s));
        const addedSubjects = newSubjects.filter(s => !originalSubjects.includes(s));
        const isCancelled = newSubjects.length === 0;

        // Costruisci nota di modifica
        let modificationNote = `[Modifica ${new Date().toLocaleString('it-IT')}]:`;
        if (addedSubjects.length > 0) {
            modificationNote += ` Aggiunte: ${addedSubjects.join(', ')}.`;
        }
        if (removedSubjects.length > 0) {
            modificationNote += ` Rimosse: ${removedSubjects.join(', ')}.`;
        }
        if (addedSubjects.length === 0 && removedSubjects.length === 0) {
            modificationNote += ' Nessuna modifica.';
        }

        // Aggiorna la prenotazione
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                subjects: newSubjects,
                status: isCancelled ? 'CANCELLED' : booking.status,
                notes: booking.notes
                    ? `${booking.notes}\n---\n${modificationNote}`
                    : modificationNote
            }
        });

        // Invia email di notifica
        try {
            await sendModificationNotification({
                studentName: booking.studentName,
                studentSurname: booking.studentSurname,
                studentPhone: booking.studentPhone,
                requestedDate: booking.requestedDate,
                addedSubjects,
                removedSubjects,
                remainingSubjects: newSubjects,
                isCancelled
            });
        } catch (emailErr) {
            console.error('Errore invio email modifica:', emailErr);
        }

        res.json({
            message: isCancelled ? 'Prenotazione annullata' : 'Prenotazione modificata',
            booking: {
                id: updatedBooking.id,
                subjects: updatedBooking.subjects,
                status: updatedBooking.status
            }
        });
    } catch (error) {
        console.error('Errore modifica prenotazione:', error);
        next(error);
    }
};

module.exports = {
    createPublicBooking,
    getPublicMaterie,
    checkDuplicateBooking,
    addCommunication,
    verifyStudent,
    getMyBookings,
    updateBookingSubjects,
    getBookings,
    updateBookingStatus,
    deleteBooking
};
