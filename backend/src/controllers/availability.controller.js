// backend/src/controllers/availability.controller.js
/**
 * Controller per disponibilità tutor (pagina pubblica)
 */

const prisma = require('../config/prisma');

/**
 * POST /api/availability/public/check
 * Verifica se il telefono corrisponde a un tutor registrato
 */
const checkTutorPhone = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Numero di telefono richiesto' });
        }

        // Cerca tutor con questo telefono
        const tutor = await prisma.user.findFirst({
            where: {
                phone: phone.trim(),
                role: 'TUTOR',
                active: true
            },
            select: {
                id: true,
                firstName: true,
                lastName: true
            }
        });

        if (!tutor) {
            return res.status(404).json({
                found: false,
                error: 'Numero non registrato come tutor'
            });
        }

        res.json({
            found: true,
            tutor: {
                id: tutor.id,
                name: `${tutor.firstName} ${tutor.lastName}`
            }
        });
    } catch (error) {
        console.error('Errore check telefono tutor:', error);
        next(error);
    }
};

/**
 * POST /api/availability/public/get
 * Ottieni le disponibilità attuali del tutor
 */
const getTutorAvailability = async (req, res, next) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ error: 'Numero di telefono richiesto' });
        }

        // Trova tutor
        const tutor = await prisma.user.findFirst({
            where: {
                phone: phone.trim(),
                role: 'TUTOR',
                active: true
            }
        });

        if (!tutor) {
            return res.status(404).json({ error: 'Tutor non trovato' });
        }

        // Ottieni disponibilità da oggi in poi
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const availabilities = await prisma.tutorAvailability.findMany({
            where: {
                userId: tutor.id,
                date: { gte: today }
            },
            orderBy: { date: 'asc' }
        });

        // Ritorna array con date e note (formato locale YYYY-MM-DD)
        const formattedAvailabilities = availabilities.map(a => {
            // Format date in local timezone
            const d = a.date;
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return {
                date: `${year}-${month}-${day}`,
                notes: a.notes || ''
            };
        });

        res.json({
            tutor: {
                id: tutor.id,
                name: `${tutor.firstName} ${tutor.lastName}`
            },
            availabilities: formattedAvailabilities
        });
    } catch (error) {
        console.error('Errore get disponibilità:', error);
        next(error);
    }
};

/**
 * POST /api/availability/public/save
 * Salva le disponibilità del tutor (data: array di { date, notes })
 */
const saveTutorAvailability = async (req, res, next) => {
    try {
        const { phone, data } = req.body;

        if (!phone || !Array.isArray(data)) {
            return res.status(400).json({ error: 'Parametri non validi' });
        }

        // Trova tutor
        const tutor = await prisma.user.findFirst({
            where: {
                phone: phone.trim(),
                role: 'TUTOR',
                active: true
            }
        });

        if (!tutor) {
            return res.status(404).json({ error: 'Tutor non trovato' });
        }

        // Ottieni data di oggi (inizio giornata)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Converti dati in formato database (parse manuale per evitare UTC)
        const availabilityData = data.map(item => {
            // Parse YYYY-MM-DD manually to avoid UTC interpretation
            const [year, month, day] = item.date.split('-').map(Number);
            const date = new Date(year, month - 1, day, 12, 0, 0); // Mezzogiorno per sicurezza
            return {
                date,
                notes: item.notes?.trim() || null
            };
        }).filter(item => item.date >= today); // Solo date future o oggi

        // Transazione: elimina vecchie disponibilità future e inserisci nuove
        await prisma.$transaction(async (tx) => {
            // Elimina disponibilità future
            await tx.tutorAvailability.deleteMany({
                where: {
                    userId: tutor.id,
                    date: { gte: today }
                }
            });

            // Inserisci nuove disponibilità con note individuali
            if (availabilityData.length > 0) {
                await tx.tutorAvailability.createMany({
                    data: availabilityData.map(item => ({
                        userId: tutor.id,
                        date: item.date,
                        notes: item.notes
                    }))
                });
            }
        });

        res.json({
            message: 'Disponibilità salvata con successo!',
            savedDates: availabilityData.length
        });
    } catch (error) {
        console.error('Errore salvataggio disponibilità:', error);
        next(error);
    }
};

/**
 * GET /api/availability
 * Lista disponibilità per admin (per futuro matching)
 */
const getAvailabilitiesAdmin = async (req, res, next) => {
    try {
        const { date } = req.query;

        const where = {};

        if (date) {
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(targetDate);
            nextDay.setDate(nextDay.getDate() + 1);

            where.date = {
                gte: targetDate,
                lt: nextDay
            };
        }

        const availabilities = await prisma.tutorAvailability.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                }
            },
            orderBy: { date: 'asc' }
        });

        res.json({ availabilities });
    } catch (error) {
        console.error('Errore get disponibilità admin:', error);
        next(error);
    }
};

/**
 * GET /api/availability/matching/:date
 * Dati per pagina matching: tutor disponibili + prenotazioni del giorno
 */
const getMatchingData = async (req, res, next) => {
    try {
        const { date } = req.params;

        // Parse date
        const [year, month, day] = date.split('-').map(Number);
        const targetDate = new Date(year, month - 1, day, 12, 0, 0);
        const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
        const endOfDay = new Date(year, month - 1, day, 23, 59, 59);

        // 1. Tutor disponibili per questa data
        const tutorAvailabilities = await prisma.tutorAvailability.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                        tutorProfile: {
                            select: {
                                materie: true
                            }
                        }
                    }
                }
            }
        });

        // Formatta tutor con materie
        const tutors = tutorAvailabilities.map(a => {
            // Formatta materie: "Matematica (Superiori), Fisica (Medie)"
            const materie = a.user.tutorProfile?.materie || [];
            const materieFormatted = materie.map(m => {
                // Formato: "Matematica|Medie,Superiori" o solo "Matematica"
                if (m.includes('|')) {
                    const [nome, livelli] = m.split('|');
                    // Se entrambi i livelli, mostra Superiori
                    if (livelli.includes('Superiori')) {
                        return `${nome} (Sup)`;
                    } else if (livelli.includes('Medie')) {
                        return `${nome} (Med)`;
                    }
                    return nome;
                }
                return m;
            });

            return {
                id: a.user.id,
                name: `${a.user.firstName} ${a.user.lastName}`,
                phone: a.user.phone,
                notes: a.notes || '',
                subjects: materieFormatted
            };
        });

        // 2. Prenotazioni del giorno (non ancora assegnate o assegnate)
        const bookings = await prisma.booking.findMany({
            where: {
                requestedDate: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: { not: 'CANCELLED' }
            },
            include: {
                assignedTutor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Formatta prenotazioni: 1 badge per ogni materia
        const badges = [];
        bookings.forEach(b => {
            b.subjects.forEach(subject => {
                badges.push({
                    bookingId: b.id,
                    studentName: b.studentName,
                    studentSurname: b.studentSurname,
                    studentPhone: b.studentPhone,
                    subject,
                    notes: b.notes,
                    assignedTutorId: b.assignedTutorId,
                    assignedSlot: b.assignedSlot,
                    isAssigned: !!b.assignedTutorId && !!b.assignedSlot
                });
            });
        });

        // 3. Slot orari standard
        const slots = [
            { id: '15:30-16:30', label: '15:30 - 16:30' },
            { id: '16:30-17:30', label: '16:30 - 17:30' },
            { id: '17:30-18:30', label: '17:30 - 18:30' }
        ];

        res.json({
            date: date,
            tutors,
            badges,
            slots
        });
    } catch (error) {
        console.error('Errore get matching data:', error);
        next(error);
    }
};

/**
 * POST /api/availability/assign
 * Assegna una prenotazione a un tutor/slot
 */
const assignBooking = async (req, res, next) => {
    try {
        const { bookingId, tutorId, slot } = req.body;

        if (!bookingId) {
            return res.status(400).json({ error: 'bookingId richiesto' });
        }

        // Se tutorId e slot sono null, rimuovi assegnazione
        const updateData = {
            assignedTutorId: tutorId || null,
            assignedSlot: slot || null,
            assignedAt: tutorId && slot ? new Date() : null
        };

        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: updateData,
            include: {
                assignedTutor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                }
            }
        });

        res.json({
            message: tutorId ? 'Assegnazione salvata' : 'Assegnazione rimossa',
            booking
        });
    } catch (error) {
        console.error('Errore assegnazione:', error);
        next(error);
    }
};

module.exports = {
    checkTutorPhone,
    getTutorAvailability,
    saveTutorAvailability,
    getAvailabilitiesAdmin,
    getMatchingData,
    assignBooking
};
