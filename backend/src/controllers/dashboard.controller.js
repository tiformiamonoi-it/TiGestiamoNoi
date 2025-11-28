// backend/src/controllers/dashboard.controller.js
// Controller per statistiche dashboard

const prisma = require('../config/prisma');

/**
 * GET /api/dashboard/stats
 * Restituisce statistiche aggregate per dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    console.log('📊 Dashboard Stats - Periodo Tutor:', req.query.periodoTutor);
    console.log('💰 Dashboard Stats - Periodo Finanze:', req.query.periodoFinanze);

    // Calcola date BASE
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Periodi configurabili
    const periodoTutor = req.query.periodoTutor || 'settimana';
    const periodoFinanze = req.query.periodoFinanze || 'mese_corrente';

    // Calcola date per finanze
    let startFinanze, endFinanze, labelPeriodo;

    if (periodoFinanze === '30_giorni') {
      startFinanze = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      endFinanze = new Date();
      labelPeriodo = 'Ultimi 30 giorni';
    } else if (periodoFinanze === 'custom') {
      startFinanze = req.query.startDate ? new Date(req.query.startDate) : startOfMonth;
      endFinanze = req.query.endDate ? new Date(req.query.endDate) : endOfMonth;
      labelPeriodo = 'Periodo personalizzato';
    } else {
      // Default: mese corrente
      startFinanze = startOfMonth;
      endFinanze = endOfMonth;
      const nomiMesi = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
        'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
      labelPeriodo = `${nomiMesi[today.getMonth()]} ${today.getFullYear()}`;
    }

    // Calcola date per performance tutor
    const dataInizioTutor = periodoTutor === 'mese'
      ? startOfMonth
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // 1. Studenti attivi (con pacchetti attivi)
    console.log('👉 1. Calcolo studenti attivi...');
    const studentiAttivi = await prisma.student.count({
      where: {
        active: true,
        pacchetti: {
          some: {
            stati: {
              has: 'ATTIVO',
            },
          },
        },
      },
    });

    // Studenti attivi mese scorso
    const studentiAttiviLastMonth = await prisma.student.count({
      where: {
        active: true,
        createdAt: {
          lte: endOfLastMonth,
        },
      },
    });

    const studentiTrend = studentiAttiviLastMonth > 0
      ? Math.round(((studentiAttivi - studentiAttiviLastMonth) / studentiAttiviLastMonth) * 100)
      : 0;

    // 2. Pacchetti attivi
    console.log('👉 2. Calcolo pacchetti attivi...');
    const pacchettiAttivi = await prisma.package.count({
      where: {
        stati: {
          has: 'ATTIVO',
        },
      },
    });

    const pacchettiNuoviSettimana = await prisma.package.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const pacchettiTrend = pacchettiNuoviSettimana;

    // 3. Lezioni oggi
    console.log('👉 3. Calcolo lezioni oggi...');
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    const lezioniOggi = await prisma.lesson.count({
      where: {
        data: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const lezioniProgrammate = lezioniOggi;

    // 4. Saldo periodo finanze (entrate - uscite)
    console.log('👉 4. Calcolo finanze...');
    const entrateResult = await prisma.accountingEntry.aggregate({
      where: {
        tipo: 'ENTRATA',
        data: {
          gte: startFinanze,
          lte: endFinanze,
        },
      },
      _sum: {
        importo: true,
      },
    });

    const usciteResult = await prisma.accountingEntry.aggregate({
      where: {
        tipo: 'USCITA',
        data: {
          gte: startFinanze,
          lte: endFinanze,
        },
      },
      _sum: {
        importo: true,
      },
    });

    const entrate = entrateResult._sum.importo || 0;
    const uscite = usciteResult._sum.importo || 0;
    const saldoMese = entrate - uscite;

    // Saldo mese scorso (per trend)
    const entrateLastMonthResult = await prisma.accountingEntry.aggregate({
      where: {
        tipo: 'ENTRATA',
        data: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        importo: true,
      },
    });

    const usciteLastMonthResult = await prisma.accountingEntry.aggregate({
      where: {
        tipo: 'USCITA',
        data: {
          gte: lastMonth,
          lte: endOfLastMonth,
        },
      },
      _sum: {
        importo: true,
      },
    });

    const saldoLastMonth = (entrateLastMonthResult._sum.importo || 0) - (usciteLastMonthResult._sum.importo || 0);
    const saldoTrend = saldoLastMonth > 0
      ? Math.round(((saldoMese - saldoLastMonth) / saldoLastMonth) * 100)
      : 0;

    const trendEntrate = (entrateLastMonthResult._sum.importo || 0) > 0
      ? Math.round(((entrate - (entrateLastMonthResult._sum.importo || 0)) / (entrateLastMonthResult._sum.importo || 0)) * 100)
      : 0;

    const trendUscite = (usciteLastMonthResult._sum.importo || 0) > 0
      ? Math.round(((uscite - (usciteLastMonthResult._sum.importo || 0)) / (usciteLastMonthResult._sum.importo || 0)) * 100)
      : 0;

    // Grafico settimanale (dividi periodo in settimane)
    const giorni = Math.ceil((endFinanze - startFinanze) / (24 * 60 * 60 * 1000));
    const numeroSettimane = Math.min(Math.ceil(giorni / 7), 4); // Max 4 settimane

    const graficoSettimane = [];

    for (let i = 0; i < numeroSettimane; i++) {
      const inizioSettimana = new Date(startFinanze.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
      const fineSettimana = new Date(Math.min(
        inizioSettimana.getTime() + (7 * 24 * 60 * 60 * 1000),
        endFinanze.getTime()
      ));

      const entrateSettimana = await prisma.accountingEntry.aggregate({
        where: {
          tipo: 'ENTRATA',
          data: {
            gte: inizioSettimana,
            lt: fineSettimana,
          },
        },
        _sum: { importo: true },
      });

      const usciteSettimana = await prisma.accountingEntry.aggregate({
        where: {
          tipo: 'USCITA',
          data: {
            gte: inizioSettimana,
            lt: fineSettimana,
          },
        },
        _sum: { importo: true },
      });

      graficoSettimane.push({
        settimana: i + 1,
        label: `Sett. ${i + 1}`,
        entrate: parseFloat((entrateSettimana._sum.importo || 0).toFixed(2)),
        uscite: parseFloat((usciteSettimana._sum.importo || 0).toFixed(2)),
      });
    }

    // 5. Azioni prioritarie
    console.log('👉 5. Calcolo azioni prioritarie...');
    const tuttiPacchetti = await prisma.package.findMany({
      where: {
        stati: {
          has: 'ATTIVO',
        },
      },
      select: {
        id: true,
        oreAcquistate: true,
        oreResiduo: true,
        importoResiduo: true,
      },
    });

    const pacchettiDaRinnovare = tuttiPacchetti.filter(
      (p) => parseFloat(p.oreResiduo) <= parseFloat(p.oreAcquistate) * 0.2
    ).length;

    const pagamentiPendenti = tuttiPacchetti.filter(
      (p) => parseFloat(p.importoResiduo) > 0
    ).length;

    const studentiDebitoOre = await prisma.package.count({
      where: {
        oreResiduo: {
          lt: 0,
        },
      },
    });

    const oreExtraDaGestire = tuttiPacchetti.filter(
      (p) => parseFloat(p.oreResiduo) > parseFloat(p.oreAcquistate)
    ).length;

    // 6. Finanze dettagliate
    console.log('👉 6. Calcolo finanze dettagliate...');
    const nuoviPacchetti = await prisma.package.count({
      where: {
        createdAt: {
          gte: startFinanze,
          lte: endFinanze,
        },
      },
    });

    const rinnovi = nuoviPacchetti; // TODO: logica rinnovi

    const compensiPagati = uscite;

    // 7. Attività di oggi
    console.log('👉 7. Calcolo attività oggi...');
    const lezioniOggiList = await prisma.lesson.findMany({
      where: {
        data: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const oreErogate = lezioniOggiList.length;
    const oreProgrammate = lezioniOggi;

    // ✅ CORRETTO: compensoTutor invece di costoTutor
    const costoTutorOggi = lezioniOggiList.reduce((sum, lesson) => sum + parseFloat(lesson.compensoTutor || 0), 0);

    const guadagnoStimato = oreErogate * 13.33;
    const margineNetto = guadagnoStimato - costoTutorOggi;
    const percentualeMargine = guadagnoStimato > 0
      ? Math.round((margineNetto / guadagnoStimato) * 100)
      : 0;

    const percentualePresenza = oreProgrammate > 0
      ? Math.round((oreErogate / oreProgrammate) * 100)
      : 0;

    // 8. Performance Tutor
    console.log('👉 8. Calcolo performance tutor...');
    const lezioniPerTutor = await prisma.lesson.groupBy({
      by: ['tutorId'],
      where: {
        data: {
          gte: dataInizioTutor,
        },
      },
      _count: {
        id: true,
      },
      _sum: {
        compensoTutor: true, // ✅ CORRETTO: compensoTutor invece di costoTutor
      },
    });

    // Prendi top 3 tutor più attivi
    const performanceTutor = await Promise.all(
      lezioniPerTutor
        .sort((a, b) => b._count.id - a._count.id)
        .slice(0, 3)
        .map(async (item) => {
          const tutor = await prisma.user.findUnique({
            where: { id: item.tutorId },
            include: {
              tutorProfile: true,
            },
          });

          if (!tutor) return null;

          const oreLavorate = item._count.id;

          // Calcola ore disponibili in base al periodo
          const oreDisponibiliSettimanali = tutor.tutorProfile?.oreDisponibiliSettimanali || 15;
          const oreDisponibili = periodoTutor === 'mese'
            ? oreDisponibiliSettimanali * 4
            : oreDisponibiliSettimanali;

          const percentualeCapacita = Math.round((oreLavorate / oreDisponibili) * 100);
          // ✅ CORRETTO: compensoTutor invece di costoTutor
          const guadagnoPeriodo = parseFloat((item._sum.compensoTutor || 0).toFixed(2));

          return {
            id: tutor.id,
            nome: tutor.firstName,
            cognome: tutor.lastName,
            oreLavorate,
            oreDisponibili,
            percentualeCapacita,
            guadagnoPeriodo,
          };
        })
    );

    // 9. Ripartizione Pacchetti per tipologia
    console.log('👉 9. Calcolo ripartizione pacchetti...');
    const pacchetti = await prisma.package.findMany({
      where: {
        stati: {
          has: 'ATTIVO',
        },
      },
      select: {
        id: true,
        nome: true,
        importoPagato: true,
        oreAcquistate: true,
      },
    });

    // Raggruppa per nome pacchetto
    const raggruppamento = {};
    let totaleAttivi = pacchetti.length;

    pacchetti.forEach((p) => {
      const nomeTipo = p.nome || 'Altro';

      if (!raggruppamento[nomeTipo]) {
        raggruppamento[nomeTipo] = {
          nome: nomeTipo,
          count: 0,
          guadagnoTotale: 0,
        };
      }

      raggruppamento[nomeTipo].count += 1;
      raggruppamento[nomeTipo].guadagnoTotale += parseFloat(p.importoPagato || 0);
    });

    // Converti in array e calcola guadagno medio
    const ripartizionePacchetti = Object.values(raggruppamento).map((tipo) => {
      const percentuale = totaleAttivi > 0
        ? Math.round((tipo.count / totaleAttivi) * 100)
        : 0;

      const guadagnoMedio = tipo.count > 0
        ? parseFloat((tipo.guadagnoTotale / tipo.count).toFixed(2))
        : 0;

      return {
        nome: tipo.nome,
        count: tipo.count,
        percentuale,
        guadagnoMedio,
        guadagnoTotale: parseFloat(tipo.guadagnoTotale.toFixed(2)),
      };
    });

    // Ordina per count decrescente
    ripartizionePacchetti.sort((a, b) => b.count - a.count);

    // Trova pacchetto più redditizio
    const pacchettoRedditizio = ripartizionePacchetti.reduce(
      (max, tipo) => (tipo.guadagnoMedio > max.guadagnoMedio ? tipo : max),
      ripartizionePacchetti[0] || { nome: 'N/A', guadagnoMedio: 0 }
    );

    // Rimuovi eventuali null
    const performanceTutorFiltered = performanceTutor.filter((t) => t !== null);

    // Risposta
    console.log('👉 Invio risposta...');
    res.json({
      stats: {
        studentiAttivi,
        studentiTrend,
        pacchettiAttivi,
        pacchettiTrend,
        lezioniOggi,
        lezioniProgrammate,
        saldoMese: parseFloat(saldoMese.toFixed(2)),
        saldoTrend,
      },
      azioniPrioritarie: {
        pacchettiDaRinnovare,
        pagamentiPendenti,
        studentiDebitoOre,
        oreExtraDaGestire,
      },
      finanze: {
        periodo: labelPeriodo,
        entrate: parseFloat(entrate.toFixed(2)),
        uscite: parseFloat(uscite.toFixed(2)),
        saldo: parseFloat(saldoMese.toFixed(2)),
        trendEntrate,
        trendUscite,
        nuoviPacchetti,
        rinnovi,
        compensiPagati: parseFloat(compensiPagati.toFixed(2)),
        graficoSettimane,
      },
      attivita: {
        oreErogate,
        oreProgrammate,
        percentualePresenza,
        costoTutor: parseFloat(costoTutorOggi.toFixed(2)),
        guadagnoStimato: parseFloat(guadagnoStimato.toFixed(2)),
        margineNetto: parseFloat(margineNetto.toFixed(2)),
        percentualeMargine,
      },
      performanceTutor: performanceTutorFiltered,
      ripartizionePacchetti: {
        totaleAttivi,
        tipologie: ripartizionePacchetti,
        pacchettoRedditizio: {
          nome: pacchettoRedditizio.nome,
          guadagnoMedio: pacchettoRedditizio.guadagnoMedio,
        },
      },
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
