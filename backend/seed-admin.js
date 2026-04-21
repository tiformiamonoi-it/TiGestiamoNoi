const bcrypt = require('bcryptjs');
const prisma = require('./src/config/prisma'); // Usa la tua configurazione esistente

async function seed() {
    const email = 'admin@tiformiamonoi.it';
    const passwordChiara = 'password123';

    console.log('--- Inizio Reset Admin ---');

    // Generiamo l'hash con la stessa logica del tuo createUser
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordChiara, salt);

    try {
        const user = await prisma.user.upsert({
            where: { email: email },
            update: {
                password: hashedPassword,
                active: true, // FONDAMENTALE: il tuo controller lo richiede
            },
            create: {
                email: email,
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'Locale',
                role: 'ADMIN', // Assicurati che il tuo enum/stringa sia ADMIN o admin
                active: true,
            },
        });

        console.log('✅ Successo!');
        console.log(`Utente: ${user.email}`);
        console.log(`Stato: ${user.active ? 'ATTIVO' : 'DISATTIVATO'}`);
        console.log(`Nuova Password: ${passwordChiara}`);
    } catch (error) {
        console.error('❌ Errore durante il reset:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seed();