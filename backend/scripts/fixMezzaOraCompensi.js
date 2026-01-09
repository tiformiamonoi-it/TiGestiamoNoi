const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tariffe corrette
const TARIFFE = {
    SINGOLA: { intera: 5.00, mezza: 2.50 },
    GRUPPO: { intera: 8.00, mezza: 4.00 },
    MAXI: { intera: 8.50, mezza: 4.00 },
};

async function fixCompensiMezzaOra() {
    console.log('🔧 Correzione compensi mezza ora...\n');

    // Trova TUTTE le lezioni che hanno almeno uno studente con mezzaLezione=true
    const lezioni = await prisma.lesson.findMany({
        where: {
            lessonStudents: {
                some: { mezzaLezione: true }
            }
        },
        include: {
            lessonStudents: true,
            tutor: true
        }
    });

    console.log(`Trovate ${lezioni.length} lezioni con mezzaLezione\n`);

    let corrette = 0;
    let giaCorratte = 0;

    for (const l of lezioni) {
        const compensoAttuale = parseFloat(l.compensoTutor);
        const compensoCorretto = TARIFFE[l.tipo]?.mezza;
        const compensoIntero = TARIFFE[l.tipo]?.intera;
        const tutorName = `${l.tutor?.firstName} ${l.tutor?.lastName}`;
        const data = l.data.toISOString().split('T')[0];

        // Se il compenso è quello intero invece di quello dimezzato, correggi
        if (Math.abs(compensoAttuale - compensoIntero) < 0.01 && compensoCorretto) {
            console.log(`❌ ${data} ${tutorName} ${l.tipo}: €${compensoAttuale} → €${compensoCorretto}`);

            await prisma.lesson.update({
                where: { id: l.id },
                data: { compensoTutor: compensoCorretto }
            });
            corrette++;
        } else if (Math.abs(compensoAttuale - compensoCorretto) < 0.01) {
            giaCorratte++;
        } else {
            console.log(`⚠️ ${data} ${tutorName} ${l.tipo}: €${compensoAttuale} (valore inatteso)`);
        }
    }

    console.log('\n=== REPORT ===');
    console.log(`✅ Corrette: ${corrette}`);
    console.log(`✓ Già corrette: ${giaCorratte}`);

    await prisma.$disconnect();
}

fixCompensiMezzaOra();
