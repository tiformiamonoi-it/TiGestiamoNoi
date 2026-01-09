const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificaSharon() {
    // Trova Sharon
    const sharon = await prisma.user.findFirst({
        where: {
            firstName: { contains: 'Sharon', mode: 'insensitive' },
            role: 'TUTOR'
        }
    });

    if (!sharon) {
        console.log('Sharon non trovata');
        await prisma.$disconnect();
        return;
    }

    console.log(`Tutor: ${sharon.firstName} ${sharon.lastName}\n`);

    // Lezioni di dicembre
    const lezioni = await prisma.lesson.findMany({
        where: {
            tutorId: sharon.id,
            data: {
                gte: new Date('2025-12-01'),
                lte: new Date('2025-12-31')
            }
        },
        include: { lessonStudents: true, timeSlot: true },
        orderBy: { data: 'asc' }
    });

    console.log(`Totale lezioni dicembre: ${lezioni.length}\n`);

    let gruppoIntere = 0, gruppoIntereImporto = 0;
    let gruppoMezze = 0, gruppoMezzeImporto = 0;
    let maxiIntere = 0, maxiImporto = 0;

    for (const l of lezioni) {
        const hasMezza = l.lessonStudents.some(ls => ls.mezzaLezione);
        const compenso = parseFloat(l.compensoTutor);
        const slot = l.timeSlot ? `${l.timeSlot.oraInizio}-${l.timeSlot.oraFine}` : 'N/A';
        const data = l.data.toISOString().split('T')[0];

        if (l.tipo === 'GRUPPO') {
            if (hasMezza) {
                gruppoMezze++;
                gruppoMezzeImporto += compenso;
                console.log(`[MEZZA] ${data} ${slot} GRUPPO €${compenso}`);
            } else {
                gruppoIntere++;
                gruppoIntereImporto += compenso;
            }
        } else if (l.tipo === 'MAXI') {
            maxiIntere++;
            maxiImporto += compenso;
        }
    }

    console.log('\n--- RIEPILOGO ---');
    console.log(`Ore Gruppo INTERE: ${gruppoIntere} (€${gruppoIntereImporto})`);
    console.log(`Ore Gruppo MEZZE: ${gruppoMezze} (€${gruppoMezzeImporto})`);
    console.log(`Ore Maxi: ${maxiIntere} (€${maxiImporto})`);
    console.log(`TOTALE DB: €${gruppoIntereImporto + gruppoMezzeImporto + maxiImporto}`);

    await prisma.$disconnect();
}

verificaSharon();
