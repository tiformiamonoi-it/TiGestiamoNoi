/**
 * Script di importazione lezioni da file SQL
 * 
 * Questo script:
 * 1. Legge il file lezioni.sql
 * 2. Raggruppa le lezioni per tutor+data+slot
 * 3. Cerca tutor e studenti nel database
 * 4. Crea le lezioni e scala le ore dai pacchetti
 * 
 * Eseguire con: node scripts/importLessons.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// ============================================
// CONFIGURAZIONE
// ============================================

const SQL_FILE_PATH = path.join(__dirname, '../../lezioni.sql');

// Tariffe compenso tutor
const TARIFFE = {
    SINGOLA: { intera: 5.00, mezza: 2.50 },
    GRUPPO: { intera: 8.00, mezza: 4.00 },
    MAXI: { intera: 8.50, mezza: 4.00 },
};

// ============================================
// FUNZIONI UTILITY
// ============================================

/**
 * Parsa il file SQL ed estrae le righe di dati
 */
function parseSqlFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Regex per estrarre le tuple di INSERT
    const regex = /\('([^']+)',\s*'([^']+)',\s*(\d),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)/g;

    const rows = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        rows.push({
            data: match[1],           // '2025-12-02'
            slotOrario: match[2],     // '15:30-16:30'
            durata: parseInt(match[3]), // 0 o 1
            tipo: match[4],           // 'singolo', 'gruppo', 'maxi-gruppo'
            nomeTutor: match[5],      // 'Alessandro Barone'
            nomeAlunno: match[6],     // 'Andrea Candela'
        });
    }

    return rows;
}

/**
 * Raggruppa le righe per lezione unica (tutor+data+slot)
 */
function raggruppaPerLezione(rows) {
    const lezioniMap = new Map();

    rows.forEach(row => {
        const key = `${row.nomeTutor}|${row.data}|${row.slotOrario}`;

        if (!lezioniMap.has(key)) {
            lezioniMap.set(key, {
                data: row.data,
                slotOrario: row.slotOrario,
                nomeTutor: row.nomeTutor,
                tipo: row.tipo,
                mezzaLezione: row.durata === 1,
                studenti: [],
            });
        }

        const lezione = lezioniMap.get(key);
        lezione.studenti.push({
            nome: row.nomeAlunno,
            mezzaLezione: row.durata === 1,
        });

        // Se almeno uno ha mezza lezione, tutti devono averla
        if (row.durata === 1) {
            lezione.mezzaLezione = true;
        }
    });

    return Array.from(lezioniMap.values());
}

/**
 * Mappa il tipo dal file SQL al tipo nel database
 */
function mapTipo(tipoSql, numStudenti) {
    if (tipoSql === 'singolo' || numStudenti === 1) return 'SINGOLA';
    if (tipoSql === 'maxi-gruppo' || numStudenti >= 4) return 'MAXI';
    return 'GRUPPO';
}

/**
 * Calcola il compenso tutor
 */
function calcolaCompenso(tipo, mezzaLezione) {
    const tariffa = TARIFFE[tipo];
    if (!tariffa) return 0;
    return mezzaLezione ? tariffa.mezza : tariffa.intera;
}

/**
 * Cerca un tutor per nome (gestisce nomi composti)
 * Es: "Maria Sofia Biondo" → firstName="Maria Sofia", lastName="Biondo"
 */
async function cercaTutor(nomeTutor) {
    const parti = nomeTutor.trim().split(' ');

    // Prova diverse combinazioni di nome/cognome
    for (let i = 1; i < parti.length; i++) {
        const firstName = parti.slice(0, i).join(' ');
        const lastName = parti.slice(i).join(' ');

        const tutor = await prisma.user.findFirst({
            where: {
                role: 'TUTOR',
                firstName: { equals: firstName, mode: 'insensitive' },
                lastName: { equals: lastName, mode: 'insensitive' },
            },
        });

        if (tutor) return tutor;
    }

    return null;
}

/**
 * Cerca uno studente per nome (gestisce nomi composti)
 * Es: "Antonino Federico Messina" → firstName="Antonino Federico", lastName="Messina"
 */
async function cercaStudente(nomeStudente) {
    // Gestione casi speciali come "Michele / Davide Garaffa"
    const nomeNormalizzato = nomeStudente.replace(' / ', ' ').trim();
    const parti = nomeNormalizzato.split(' ');

    if (parti.length < 2) {
        return null;
    }

    // Prova diverse combinazioni di nome/cognome
    for (let i = 1; i < parti.length; i++) {
        const firstName = parti.slice(0, i).join(' ');
        const lastName = parti.slice(i).join(' ');

        const studente = await prisma.student.findFirst({
            where: {
                firstName: { equals: firstName, mode: 'insensitive' },
                lastName: { equals: lastName, mode: 'insensitive' },
            },
            include: {
                pacchetti: true,
            },
        });

        if (studente) return studente;
    }

    return null;
}

/**
 * Trova un pacchetto valido per lo studente
 */
function trovaPacchettoValido(studente) {
    if (!studente.pacchetti || studente.pacchetti.length === 0) {
        return null;
    }

    // Prendi il primo pacchetto che non è chiuso
    for (const pkg of studente.pacchetti) {
        if (!pkg.stati.includes('CHIUSO')) {
            return pkg;
        }
    }

    // Se tutti sono chiusi, prendi comunque il primo
    return studente.pacchetti[0];
}

/**
 * Cerca lo slot orario nel database
 */
async function cercaTimeSlot(slotOrario) {
    const [oraInizio] = slotOrario.split('-');

    const timeSlot = await prisma.timeSlot.findFirst({
        where: {
            oraInizio: oraInizio,
        },
    });

    return timeSlot;
}

// ============================================
// FUNZIONE PRINCIPALE
// ============================================

async function importaLezioni() {
    console.log('🚀 Inizio importazione lezioni...\n');

    // 1. Leggi e parsa il file SQL
    console.log(`📂 Leggendo file: ${SQL_FILE_PATH}`);
    const rows = parseSqlFile(SQL_FILE_PATH);
    console.log(`   → ${rows.length} righe trovate\n`);

    // 2. Raggruppa per lezione
    const lezioni = raggruppaPerLezione(rows);
    console.log(`📚 ${lezioni.length} lezioni uniche da importare\n`);

    // 3. Validazione preliminare
    console.log('🔍 Validazione preliminare...\n');

    const errori = {
        tutorNonTrovati: new Set(),
        studentiNonTrovati: new Set(),
        studentiSenzaPacchetto: new Set(),
        slotNonTrovati: new Set(),
    };

    // Cache per evitare ricerche ripetute
    const tutorCache = new Map();
    const studenteCache = new Map();
    const slotCache = new Map();

    for (const lezione of lezioni) {
        // Verifica tutor
        if (!tutorCache.has(lezione.nomeTutor)) {
            const tutor = await cercaTutor(lezione.nomeTutor);
            tutorCache.set(lezione.nomeTutor, tutor);
            if (!tutor) {
                errori.tutorNonTrovati.add(lezione.nomeTutor);
            }
        }

        // Verifica slot
        if (!slotCache.has(lezione.slotOrario)) {
            const slot = await cercaTimeSlot(lezione.slotOrario);
            slotCache.set(lezione.slotOrario, slot);
            if (!slot) {
                errori.slotNonTrovati.add(lezione.slotOrario);
            }
        }

        // Verifica studenti
        for (const studente of lezione.studenti) {
            if (!studenteCache.has(studente.nome)) {
                const studenteDb = await cercaStudente(studente.nome);
                studenteCache.set(studente.nome, studenteDb);

                if (!studenteDb) {
                    errori.studentiNonTrovati.add(studente.nome);
                } else {
                    const pacchetto = trovaPacchettoValido(studenteDb);
                    if (!pacchetto) {
                        errori.studentiSenzaPacchetto.add(studente.nome);
                    }
                }
            }
        }
    }

    // 4. Report errori
    let hasErrors = false;

    // Salva report su file JSON per debug
    const reportPath = path.join(__dirname, 'import-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        tutorNonTrovati: Array.from(errori.tutorNonTrovati),
        studentiNonTrovati: Array.from(errori.studentiNonTrovati),
        studentiSenzaPacchetto: Array.from(errori.studentiSenzaPacchetto),
        slotNonTrovati: Array.from(errori.slotNonTrovati),
    }, null, 2));
    console.log(`Report salvato in: ${reportPath}`);

    if (errori.tutorNonTrovati.size > 0) {
        hasErrors = true;
        console.log('TUTOR NON TROVATI:');
        errori.tutorNonTrovati.forEach(nome => console.log(`   - ${nome}`));
        console.log();
    }

    if (errori.studentiNonTrovati.size > 0) {
        hasErrors = true;
        console.log('STUDENTI NON TROVATI:');
        errori.studentiNonTrovati.forEach(nome => console.log(`   - ${nome}`));
        console.log();
    }

    if (errori.studentiSenzaPacchetto.size > 0) {
        hasErrors = true;
        console.log('STUDENTI SENZA PACCHETTO VALIDO:');
        errori.studentiSenzaPacchetto.forEach(nome => console.log(`   - ${nome}`));
        console.log();
    }

    if (errori.slotNonTrovati.size > 0) {
        hasErrors = true;
        console.log('SLOT ORARI NON TROVATI:');
        errori.slotNonTrovati.forEach(slot => console.log(`   - ${slot}`));
        console.log();
    }

    if (hasErrors) {
        console.log('Correggere gli errori prima di procedere.');
        await prisma.$disconnect();
        return;
    }

    console.log('✅ Validazione completata senza errori!\n');

    // 5. Importazione effettiva
    console.log('📥 Avvio importazione lezioni...\n');

    let lezioniCreate = 0;
    let oreScalate = 0;
    const erroriImport = [];

    for (const lezione of lezioni) {
        try {
            const tutor = tutorCache.get(lezione.nomeTutor);
            const timeSlot = slotCache.get(lezione.slotOrario);

            // Prepara studenti
            const studentiData = [];
            for (const studente of lezione.studenti) {
                const studenteDb = studenteCache.get(studente.nome);
                if (!studenteDb) continue;

                const pacchetto = trovaPacchettoValido(studenteDb);
                if (!pacchetto) continue;

                studentiData.push({
                    studentId: studenteDb.id,
                    packageId: pacchetto.id,
                    mezzaLezione: lezione.mezzaLezione,
                });
            }

            if (studentiData.length === 0) {
                erroriImport.push(`Lezione ${lezione.data} ${lezione.slotOrario} ${lezione.nomeTutor}: nessuno studente valido`);
                continue;
            }

            // Calcola tipo e compenso
            const tipo = mapTipo(lezione.tipo, studentiData.length);
            const compenso = calcolaCompenso(tipo, lezione.mezzaLezione);

            // Crea lezione in transazione
            await prisma.$transaction(async (tx) => {
                // Crea la lezione
                const nuovaLezione = await tx.lesson.create({
                    data: {
                        tutorId: tutor.id,
                        timeSlotId: timeSlot.id,
                        data: new Date(lezione.data),
                        tipo: tipo,
                        compensoTutor: compenso,
                        forzaGruppo: false,
                        note: `Importato da SQL - ${lezione.tipo}`,
                    },
                });

                // Crea LessonStudent e scala ore
                for (const studenteData of studentiData) {
                    // Crea relazione
                    await tx.lessonStudent.create({
                        data: {
                            lessonId: nuovaLezione.id,
                            studentId: studenteData.studentId,
                            packageId: studenteData.packageId,
                            mezzaLezione: lezione.mezzaLezione,
                            oreScalate: 1.0,
                        },
                    });

                    // Scala ore dal pacchetto
                    await tx.package.update({
                        where: { id: studenteData.packageId },
                        data: {
                            oreResiduo: {
                                decrement: 1.0,
                            },
                        },
                    });

                    oreScalate++;
                }
            });

            lezioniCreate++;

            // Log progresso ogni 50 lezioni
            if (lezioniCreate % 50 === 0) {
                console.log(`   → ${lezioniCreate}/${lezioni.length} lezioni create...`);
            }

        } catch (error) {
            erroriImport.push(`Lezione ${lezione.data} ${lezione.slotOrario} ${lezione.nomeTutor}: ${error.message}`);
        }
    }

    // 6. Report finale
    console.log('\n' + '='.repeat(50));
    console.log('📊 REPORT IMPORTAZIONE');
    console.log('='.repeat(50));
    console.log(`✅ Lezioni create: ${lezioniCreate}/${lezioni.length}`);
    console.log(`📉 Ore scalate totali: ${oreScalate}`);

    if (erroriImport.length > 0) {
        console.log(`\n⚠️ Errori durante importazione: ${erroriImport.length}`);
        erroriImport.forEach(err => console.log(`   - ${err}`));
    }

    console.log('\n✨ Importazione completata!');

    await prisma.$disconnect();
}

// Esegui
importaLezioni().catch(async (error) => {
    console.error('❌ Errore fatale:', error);
    await prisma.$disconnect();
    process.exit(1);
});
