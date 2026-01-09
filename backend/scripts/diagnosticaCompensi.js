/**
 * Script per diagnosticare il problema dei compensi
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnostica() {
    console.log('🔍 Diagnostica lezioni dicembre...\n');

    // Trova esempio: lezioni con mezzaLezione per un tutor specifico
    const lezioni = await prisma.lesson.findMany({
        where: {
            data: {
                gte: new Date('2025-12-01'),
                lte: new Date('2025-12-31'),
            },
            lessonStudents: {
                some: {
                    mezzaLezione: true
                }
            }
        },
        include: {
            lessonStudents: true,
            tutor: true,
            timeSlot: true,
        },
        orderBy: { data: 'asc' }
    });

    console.log(`Lezioni con mezzaLezione in dicembre: ${lezioni.length}\n`);

    for (const l of lezioni.slice(0, 10)) { // Solo primi 10
        const tutorName = `${l.tutor?.firstName} ${l.tutor?.lastName}`;
        const data = l.data.toISOString().split('T')[0];
        const slot = l.timeSlot ? `${l.timeSlot.oraInizio}-${l.timeSlot.oraFine}` : 'N/A';

        console.log(`📅 ${data} ${slot} - ${tutorName}`);
        console.log(`   Tipo: ${l.tipo}, Compenso: €${l.compensoTutor}`);
        console.log(`   Studenti (${l.lessonStudents.length}):`);
        for (const ls of l.lessonStudents) {
            console.log(`     - ID: ${ls.studentId}, mezzaLezione: ${ls.mezzaLezione}`);
        }
        console.log('');
    }

    // Verifica totale lezioni per un tutor specifico
    const tutors = await prisma.user.findMany({
        where: { role: 'TUTOR' },
        take: 1
    });

    if (tutors.length > 0) {
        const tutorId = tutors[0].id;
        const tutorName = `${tutors[0].firstName} ${tutors[0].lastName}`;

        const tutorLessons = await prisma.lesson.findMany({
            where: {
                tutorId,
                data: {
                    gte: new Date('2025-12-01'),
                    lte: new Date('2025-12-31'),
                }
            },
            include: { lessonStudents: true }
        });

        console.log(`\n📊 Riepilogo per ${tutorName}:`);

        let oreGruppoIntere = 0;
        let oreGruppoMezze = 0;
        let importoGruppoIntero = 0;
        let importoGruppoMezzo = 0;

        for (const l of tutorLessons) {
            if (l.tipo === 'GRUPPO') {
                const hasMezza = l.lessonStudents.some(ls => ls.mezzaLezione);
                if (hasMezza) {
                    oreGruppoMezze++;
                    importoGruppoMezzo += parseFloat(l.compensoTutor);
                } else {
                    oreGruppoIntere++;
                    importoGruppoIntero += parseFloat(l.compensoTutor);
                }
            }
        }

        console.log(`   Ore gruppo intere: ${oreGruppoIntere} (€${importoGruppoIntero})`);
        console.log(`   Ore gruppo mezze: ${oreGruppoMezze} (€${importoGruppoMezzo})`);
        console.log(`   Totale gruppo: ${oreGruppoIntere + oreGruppoMezze} ore, €${importoGruppoIntero + importoGruppoMezzo}`);
    }

    await prisma.$disconnect();
}

diagnostica().catch(async (error) => {
    console.error('❌ Errore:', error);
    await prisma.$disconnect();
    process.exit(1);
});
