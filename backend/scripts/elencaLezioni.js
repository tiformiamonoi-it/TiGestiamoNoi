const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function elencaLezioni() {
    const sharon = await prisma.user.findFirst({
        where: {
            firstName: { contains: 'Sharon', mode: 'insensitive' },
            role: 'TUTOR'
        }
    });

    const lezioni = await prisma.lesson.findMany({
        where: {
            tutorId: sharon.id,
            data: { gte: new Date('2025-12-01'), lte: new Date('2025-12-31') }
        },
        include: { lessonStudents: true },
        orderBy: { data: 'asc' }
    });

    let totale = 0;
    const righe = [];

    for (const l of lezioni) {
        const c = parseFloat(l.compensoTutor);
        const hm = l.lessonStudents.some(s => s.mezzaLezione);
        totale += c;
        righe.push({
            data: l.data.toISOString().split('T')[0],
            tipo: l.tipo,
            compenso: c,
            mezzaLezione: hm
        });
    }

    const report = { lezioni: righe, totale, count: lezioni.length };
    fs.writeFileSync(__dirname + '/sharon-report.json', JSON.stringify(report, null, 2));
    console.log('Report salvato in sharon-report.json');
    console.log('Totale:', totale, 'Lezioni:', lezioni.length);

    await prisma.$disconnect();
}

elencaLezioni();
