// backend/src/controllers/students.controller.js
// Controller per gestione studenti

const prisma = require('../config/prisma');
const { validationResult } = require('express-validator');

/**
 * GET /api/students
 * Lista tutti gli studenti (con paginazione)
 */
const getStudents = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      active,
      scuola,
      stato,
      pacchetto,
      oreNegative,
      pagamentoSospeso
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Costruisci filtri BASE
    const where = {};
    
    if (active !== undefined) {
      where.active = active === 'true';
    }

    // Filtro ricerca
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro scuola (usa contains per match parziale)
    // FILTRO LIVELLO SCOLASTICO (usa campo classe)
    if (scuola) {
      where.classe = {
        contains: scuola,
        mode: 'insensitive',
      };
    }

    // Query database CON tutti gli include
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
        include: {
          pacchetti: {
              where: { 
                stati: { 
                  hasSome: ['ATTIVO', 'DA_PAGARE', 'IN_SCADENZA', 'ESAURITO', 'SCADUTO']
                },
              },
              select: {
                id: true,
                nome: true,
                tipo: true,
                stati: true,
                oreAcquistate: true,
                oreResiduo: true,
                giorniAcquistati: true,
                giorniResiduo: true,
                orarioGiornaliero: true,
                prezzoTotale: true,
                importoPagato: true,
                importoResiduo: true,
                dataInizio: true,
                dataScadenza: true,
                lessonStudents: {
                  select: {
                    id: true,
                    lesson: {
                      select: {
                        id: true,
                        data: true,
                      }
                    }
                  },
                },
              },
              orderBy: { createdAt: 'asc' }, // ✅ PIÙ VECCHIO
              take: 1,
            },
          _count: {
            select: { 
              lessonStudents: true  // ✅ CAMBIATO da lezioni a lessonStudents
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    // Formatta e FILTRA studenti
    let studentsFormatted = students.map((student) => {
      const pacchettoAttivo = student.pacchetti[0] || null;

      if (!pacchettoAttivo) {
        return {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          parentName: student.parentName,
          scuola: student.scuola,
          classe: student.classe,
          phone: student.parentPhone,
          email: student.parentEmail,
          active: student.active,
          createdAt: student.createdAt,
          totalLessons: student._count.lessonStudents, // ✅ CAMBIATO
          pacchettoAttivo: null,
        };
      }

      // CALCOLA GIORNI USATI
      let giorniUsati = 0;
      // ✅ CAMBIATO da pacchettoAttivo.lezioni a lessonStudents
      if (pacchettoAttivo.tipo === 'MENSILE' && pacchettoAttivo.lessonStudents) {
        const dateUniche = new Set(
          pacchettoAttivo.lessonStudents.map(ls => ls.lesson.data.toISOString().split('T')[0])
        );
        giorniUsati = dateUniche.size;
      }

      const oreUsate = pacchettoAttivo.tipo === 'ORE'
        ? parseFloat(pacchettoAttivo.oreAcquistate || 0) - parseFloat(pacchettoAttivo.oreResiduo || 0)
        : 0;

      const giorniResiduoDB = pacchettoAttivo.giorniResiduo || 0;
      const giorniTotali = pacchettoAttivo.giorniAcquistati || 0;

      // CORREGGI giorni usati se residuo negativo
      if (pacchettoAttivo.tipo === 'MENSILE' && giorniResiduoDB < 0) {
        giorniUsati = giorniTotali + Math.abs(giorniResiduoDB);
      }

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        parentName: student.parentName,
        scuola: student.scuola,
        classe: student.classe,
        phone: student.parentPhone,
        email: student.parentEmail,
        active: student.active,
        createdAt: student.createdAt,
        totalLessons: student._count.lessonStudents, // ✅ CAMBIATO
        pacchettoAttivo: {
          id: pacchettoAttivo.id,
          nome: pacchettoAttivo.nome,
          tipo: pacchettoAttivo.tipo,
          stati: pacchettoAttivo.stati,
          oreAcquistate: parseFloat(pacchettoAttivo.oreAcquistate || 0),
          oreResiduo: parseFloat(pacchettoAttivo.oreResiduo || 0),
          oreUsate: oreUsate,
          oreTotali: parseFloat(pacchettoAttivo.oreAcquistate || 0),
          giorniAcquistati: pacchettoAttivo.giorniAcquistati || 0,
          giorniUsati: giorniUsati,
          giorniResiduo: giorniResiduoDB,
          giorniTotali: giorniTotali,
          importoTotale: parseFloat(pacchettoAttivo.prezzoTotale || 0),
          importoPagato: parseFloat(pacchettoAttivo.importoPagato || 0),
          importoResiduo: parseFloat(pacchettoAttivo.importoResiduo || 0),
          dataAcquisto: pacchettoAttivo.dataInizio,
          dataScadenza: pacchettoAttivo.dataScadenza,
          pagamentoSaldato: parseFloat(pacchettoAttivo.importoResiduo || 0) === 0,
        },
      };
    });

    // ====================================
    // APPLICA FILTRI POST-QUERY
    // ====================================

    // Filtro TIPO PACCHETTO (mensile/orario)
    if (pacchetto) {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return false;
        if (pacchetto === 'mensile') return s.pacchettoAttivo.tipo === 'MENSILE';
        if (pacchetto === 'orario') return s.pacchettoAttivo.tipo === 'ORE';
        return true;
      });
    }

    // Filtro ORE NEGATIVE
    if (oreNegative === 'true') {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return false;
        const residuo = s.pacchettoAttivo.tipo === 'MENSILE'
          ? s.pacchettoAttivo.giorniResiduo
          : s.pacchettoAttivo.oreResiduo;
        return residuo < 0;
      });
    }

    // Filtro PAGAMENTO SOSPESO
    if (pagamentoSospeso === 'true') {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return false;
        return s.pacchettoAttivo.importoResiduo > 0;
      });
    }

    // Filtro STATO (calcolato dinamicamente)
    if (stato) {
      studentsFormatted = studentsFormatted.filter(s => {
        if (!s.pacchettoAttivo) return stato === 'inattivo';

        const pacchetto = s.pacchettoAttivo;
        const oggi = new Date();
        oggi.setHours(0, 0, 0, 0);

        const dataScadenza = pacchetto.dataScadenza ? new Date(pacchetto.dataScadenza) : null;
        if (dataScadenza) dataScadenza.setHours(0, 0, 0, 0);

        const giorniAllaScadenza = dataScadenza
          ? Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24))
          : null;

        const isPagato = pacchetto.importoResiduo === 0;
        const isScaduto = dataScadenza && oggi > dataScadenza;
        const isInScadenza = dataScadenza && giorniAllaScadenza >= 0 && giorniAllaScadenza <= 2;

        const quantitaResidua = pacchetto.tipo === 'MENSILE'
          ? pacchetto.giorniResiduo
          : pacchetto.oreResiduo;

        const isEsaurito = quantitaResidua <= 0;

        // Mappa stati (con esclusioni per Pagato)
        if (stato === 'attivo' && !isScaduto && !isEsaurito && quantitaResidua > 0 && !isPagato) return true;
        if (stato === 'scaduto' && isScaduto && !isPagato) return true;
        if (stato === 'ore_negative' && quantitaResidua < 0) return true;
        if (stato === 'in_scadenza' && isInScadenza && !isScaduto && !isPagato) return true;
        if (stato === 'esaurito' && isEsaurito && !isPagato) return true;

        return false;
      });
    }

    res.json({
      students: studentsFormatted,
      total: studentsFormatted.length, // Total dopo filtri
      pagination: {
        total: studentsFormatted.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(studentsFormatted.length / limit),
      },
    });
  } catch (error) {
    console.error('Errore getStudents:', error);
    next(error);
  }
};

/**
 * GET /api/students/:id
 * Dettaglio studente con pacchetti e lezioni
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        pacchetti: {
          include: {
            standardPackage: true,
            pagamenti: true,
            // ✅ CAMBIATO da lezioni a lessonStudents
            _count: { select: { lessonStudents: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        // ✅ CAMBIATO da lezioni a lessonStudents
        lessonStudents: {
          include: {
            lesson: {
              include: {
                tutor: { select: { firstName: true, lastName: true } },
                timeSlot: true,
              }
            }
          },
          orderBy: { lesson: { data: 'desc' } },
          take: 10,
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Studente non trovato' });
    }

    res.json({ student });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/students
 * Crea nuovo studente
 */
const createStudent = async (req, res, next) => {
  try {
    // Validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await prisma.student.create({
      data: req.body,
    });

    res.status(201).json({ 
      message: 'Studente creato con successo',
      student 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/students/:id
 * Aggiorna studente
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validazione
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const student = await prisma.student.update({
      where: { id },
      data: req.body,
    });

    res.json({ 
      message: 'Studente aggiornato con successo',
      student 
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/students/:id
 * Elimina studente (soft delete - disattiva)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Soft delete: disattiva invece di eliminare
    const student = await prisma.student.update({
      where: { id },
      data: { active: false },
    });

    res.json({ 
      message: 'Studente disattivato con successo',
      student 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
