/**
 * Script per ricalcolare il tipo delle lezioni di dicembre
 * Corregge le lezioni con 4 studenti da MAXI a GRUPPO
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tariffe
const TARIFFE = {
    GRUPPO: { intera: 8.00, mezza: 4.00 },
    MAXI: { intera: 8.50, mezza: 4.00 },
};

async function ricalcolaLezioniDicembre() {
    console.log('🔄 Ricalcolo tipo lezioni dicembre...\n');

    // Trova tutte le lezioni di dicembre 2025 con tipo MAXI
    const dataInizio = new Date('2025-12-01');
    const dataFine = new Date('2025-12-31T23:59:59');

    const lezioniMaxi = await prisma.lesson.findMany({
        where: {
            tipo: 'MAXI',
            data: {
                gte: dataInizio,
                lte: dataFine,
            },
        },
        include: {
            lessonStudents: true,
            tutor: true,
        },
    });

    console.log(`📚 Trovate ${lezioniMaxi.length} lezioni MAXI in dicembre\n`);

    let corrette = 0;
    let giaCorratte = 0;

    for (const lezione of lezioniMaxi) {
        const numStudenti = lezione.lessonStudents.length;

        // Se ha esattamente 4 studenti, deve essere GRUPPO (non MAXI)
        if (numStudenti === 4) {
            // Verifica se è mezza lezione
            const mezzaLezione = lezione.lessonStudents.some(ls => ls.mezzaLezione);
            const nuovoCompenso = mezzaLezione ? TARIFFE.GRUPPO.mezza : TARIFFE.GRUPPO.intera;

            await prisma.lesson.update({
                where: { id: lezione.id },
                data: {
                    tipo: 'GRUPPO',
                    compensoTutor: nuovoCompenso,
                },
            });

            corrette++;
            console.log(`✅ Lezione ${lezione.data.toISOString().split('T')[0]} - ${lezione.tutor?.firstName} ${lezione.tutor?.lastName}: ${numStudenti} studenti → GRUPPO (€${nuovoCompenso})`);
        } else if (numStudenti >= 5) {
            giaCorratte++;
        }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Lezioni corrette (4 studenti): ${corrette}`);
    console.log(`✓ Lezioni già corrette (5+ studenti): ${giaCorratte}`);
    console.log(`📚 Totale lezioni MAXI analizzate: ${lezioniMaxi.length}`);

    await prisma.$disconnect();
}

ricalcolaLezioniDicembre().catch(async (error) => {
    console.error('❌ Errore:', error);
    await prisma.$disconnect();
    process.exit(1);
});
