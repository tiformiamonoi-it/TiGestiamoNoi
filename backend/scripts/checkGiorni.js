const prisma = require('./src/config/prisma');

(async () => {
    const pkgs = await prisma.package.findMany({
        where: { tipo: 'MENSILE' },
        take: 5,
        select: {
            nome: true,
            giorniAcquistati: true,
            giorniResiduo: true,
            stati: true,
            student: { select: { firstName: true, lastName: true } }
        }
    });
    console.log(JSON.stringify(pkgs, null, 2));
    await prisma.$disconnect();
})();
