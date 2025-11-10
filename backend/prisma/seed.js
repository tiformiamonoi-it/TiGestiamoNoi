// backend/prisma/seed.js
// Script per popolare il database con dati di test - VERSIONE 2.0
// Esegui con: npm run db:seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Inizio seeding del database...\n');

  // ============================================
  // 1. CONFIGURAZIONI SISTEMA (Tariffe globali)
  // ============================================
  
  console.log('⚙️  Creazione configurazioni sistema...');

  await prisma.systemConfig.upsert({
    where: { key: 'school_name' },
    update: {},
    create: {
      key: 'school_name',
      value: 'Doposcuola Ti Formiamo Noi',
      description: 'Nome della scuola/centro',
      category: 'generale',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'tariffa_individuale' },
    update: {},
    create: {
      key: 'tariffa_individuale',
      value: '5.00',
      description: 'Tariffa oraria lezione individuale (€/h)',
      category: 'tariffe',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'tariffa_gruppo' },
    update: {},
    create: {
      key: 'tariffa_gruppo',
      value: '8.00',
      description: 'Tariffa oraria lezione gruppo 2-4 studenti (€/h)',
      category: 'tariffe',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'tariffa_maxi_gruppo' },
    update: {},
    create: {
      key: 'tariffa_maxi_gruppo',
      value: '8.50',
      description: 'Tariffa oraria lezione maxi gruppo 5+ studenti (€/h)',
      category: 'tariffe',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'tariffa_maxi_mezza' },
    update: {},
    create: {
      key: 'tariffa_maxi_mezza',
      value: '4.00',
      description: 'Tariffa mezza ora maxi gruppo (€/0.5h)',
      category: 'tariffe',
    },
  });

  await prisma.systemConfig.upsert({
    where: { key: 'currency' },
    update: {},
    create: {
      key: 'currency',
      value: 'EUR',
      description: 'Valuta utilizzata',
      category: 'generale',
    },
  });

  console.log('✅ 6 configurazioni sistema create\n');

  // ============================================
  // 2. UTENTI E TUTOR
  // ============================================
  
  console.log('👤 Creazione utenti...');

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tiformiamonoi.it' },
    update: {},
    create: {
      email: 'admin@tiformiamonoi.it',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Mario',
      lastName: 'Rossi',
      role: 'ADMIN',
      phone: '+39 340 1234567',
      active: true,
    },
  });
  console.log('✅ Admin creato:', admin.email);

  // Tutor 1 - Maria Bianchi
  const tutor1 = await prisma.user.upsert({
    where: { email: 'maria.bianchi@example.com' },
    update: {},
    create: {
      email: 'maria.bianchi@example.com',
      password: await bcrypt.hash('tutor123', 10),
      firstName: 'Maria',
      lastName: 'Bianchi',
      role: 'TUTOR',
      phone: '+39 340 2345678',
      active: true,
      tutorProfile: {
        create: {
          indirizzo: 'Via Roma 10',
          citta: 'Milano',
          cap: '20100',
          codiceFiscale: 'BNCMRA80A01F205X',
          partitaIva: '12345678901',
          materie: ['Matematica', 'Fisica', 'Inglese'],
          noteInterne: 'Specializzata in matematica per scuole medie',
        },
      },
    },
  });
  console.log('✅ Tutor creato:', tutor1.email);

  // Tutor 2 - Luca Verdi
  const tutor2 = await prisma.user.upsert({
    where: { email: 'luca.verdi@example.com' },
    update: {},
    create: {
      email: 'luca.verdi@example.com',
      password: await bcrypt.hash('tutor123', 10),
      firstName: 'Luca',
      lastName: 'Verdi',
      role: 'TUTOR',
      phone: '+39 340 3456789',
      active: true,
      tutorProfile: {
        create: {
          indirizzo: 'Corso Buenos Aires 15',
          citta: 'Milano',
          cap: '20124',
          codiceFiscale: 'VRDLCA85B12F839W',
          materie: ['Italiano', 'Storia', 'Latino'],
          noteInterne: 'Esperto in materie umanistiche',
        },
      },
    },
  });
  console.log('✅ Tutor creato:', tutor2.email);

  // Tutor 3 - Sofia Russo
  const tutor3 = await prisma.user.upsert({
    where: { email: 'sofia.russo@example.com' },
    update: {},
    create: {
      email: 'sofia.russo@example.com',
      password: await bcrypt.hash('tutor123', 10),
      firstName: 'Sofia',
      lastName: 'Russo',
      role: 'TUTOR',
      phone: '+39 340 4567890',
      active: true,
      tutorProfile: {
        create: {
          citta: 'Milano',
          cap: '20125',
          codiceFiscale: 'RSSSFO88C45F205T',
          materie: ['Scienze', 'Chimica', 'Biologia'],
          noteInterne: 'Ottima con studenti DSA',
        },
      },
    },
  });
  console.log('✅ Tutor creato:', tutor3.email);

  // ============================================
  // 3. STUDENTI
  // ============================================
  
  console.log('\n👨‍🎓 Creazione studenti...');

  const studente1 = await prisma.student.create({
    data: {
      firstName: 'Marco',
      lastName: 'Ferrari',
      parentName: 'Giuseppe Ferrari',
      parentEmail: 'g.ferrari@example.com',
      parentPhone: '+39 340 5678901',
      parentIndirizzo: 'Via Verdi 7',
      parentCitta: 'Milano',
      parentCap: '20123',
      parentCF: 'FRRGPP70A01F205X',
      classe: '3° Media',
      scuola: 'IC Dante Alighieri',
      active: true,
      note: 'Buono in matematica, necessita aiuto in inglese',
    },
  });
  console.log('✅ Studente creato:', `${studente1.firstName} ${studente1.lastName}`);

  const studente2 = await prisma.student.create({
    data: {
      firstName: 'Giulia',
      lastName: 'Romano',
      parentName: 'Anna Romano',
      parentEmail: 'a.romano@example.com',
      parentPhone: '+39 340 6789012',
      parentIndirizzo: 'Via Mazzini 12',
      parentCitta: 'Milano',
      parentCap: '20125',
      parentCF: 'RMNNNA80A01F839W',
      classe: '1° Superiore',
      scuola: 'Liceo Scientifico Galilei',
      active: true,
      note: 'DSA certificato - dislessia',
    },
  });
  console.log('✅ Studente creato:', `${studente2.firstName} ${studente2.lastName}`);

  const studente3 = await prisma.student.create({
    data: {
      firstName: 'Alessandro',
      lastName: 'Conti',
      parentName: 'Laura Conti',
      parentEmail: 'l.conti@example.com',
      parentPhone: '+39 340 7890123',
      parentIndirizzo: 'Piazza Duomo 5',
      parentCitta: 'Milano',
      parentCap: '20121',
      parentCF: 'CNTLRA75D55F205K',
      classe: '2° Media',
      scuola: 'IC Manzoni',
      active: true,
    },
  });
  console.log('✅ Studente creato:', `${studente3.firstName} ${studente3.lastName}`);

  // ============================================
  // 4. PACCHETTI STANDARD
  // ============================================
  
  console.log('\n📦 Creazione pacchetti standard...');

  const stdPkgMedieMensile = await prisma.standardPackage.create({
    data: {
      nome: 'Medie - Mensile',
      descrizione: 'Pacchetto mensile per studenti scuole medie',
      tipo: 'MENSILE',
      categoria: 'Medie',
      oreIncluse: 60.00,
      giorniInclusi: 20,
      orarioGiornaliero: 3.00,
      prezzoStandard: 450.00,
      durataGiorni: 30,
      active: true,
    },
  });
  console.log('✅ StandardPackage creato:', stdPkgMedieMensile.nome);

  const stdPkgSuperiori10 = await prisma.standardPackage.create({
    data: {
      nome: 'Superiori - 10 Ore',
      descrizione: 'Pacchetto 10 ore per studenti superiori',
      tipo: 'ORE',
      categoria: 'Superiori',
      oreIncluse: 10.00,
      prezzoStandard: 150.00,
      durataGiorni: 60,
      active: true,
    },
  });
  console.log('✅ StandardPackage creato:', stdPkgSuperiori10.nome);

  const stdPkgElementari = await prisma.standardPackage.create({
    data: {
      nome: 'Elementari - Mensile',
      descrizione: 'Pacchetto mensile per studenti elementari',
      tipo: 'MENSILE',
      categoria: 'Elementari',
      oreIncluse: 40.00,
      giorniInclusi: 20,
      orarioGiornaliero: 2.00,
      prezzoStandard: 300.00,
      durataGiorni: 30,
      active: true,
    },
  });
  console.log('✅ StandardPackage creato:', stdPkgElementari.nome);

  // ============================================
  // 5. SLOT ORARI
  // ============================================
  
  console.log('\n⏰ Creazione slot orari...');

  const slot1 = await prisma.timeSlot.create({
    data: {
      oraInizio: '15:30',
      oraFine: '16:30',
      descrizione: 'Pomeriggio - Primo turno',
      active: true,
    },
  });
  console.log('✅ Slot creato:', `${slot1.oraInizio}-${slot1.oraFine}`);

  const slot2 = await prisma.timeSlot.create({
    data: {
      oraInizio: '16:30',
      oraFine: '17:30',
      descrizione: 'Pomeriggio - Secondo turno',
      active: true,
    },
  });
  console.log('✅ Slot creato:', `${slot2.oraInizio}-${slot2.oraFine}`);

  const slot3 = await prisma.timeSlot.create({
    data: {
      oraInizio: '17:30',
      oraFine: '18:30',
      descrizione: 'Pomeriggio - Terzo turno',
      active: true,
    },
  });
  console.log('✅ Slot creato:', `${slot3.oraInizio}-${slot3.oraFine}`);

  // ============================================
  // 6. PACCHETTI STUDENTI
  // ============================================
  
  console.log('\n📦 Creazione pacchetti studenti...');

  // Pacchetto 1 - Marco (da template Medie Mensile, personalizzato)
  const pacchetto1 = await prisma.package.create({
    data: {
      studentId: studente1.id,
      standardPackageId: stdPkgMedieMensile.id,
      nome: 'Marco - Medie Mensile Personalizzato',
      tipo: 'MENSILE',
      oreAcquistate: 60.00,
      oreResiduo: 56.00, // Già consumate 4 ore
      giorniAcquistati: 20,
      giorniResiduo: 18,
      orarioGiornaliero: 3.00,
      prezzoTotale: 450.00,
      importoPagato: 200.00,
      importoResiduo: 250.00,
      dataInizio: new Date('2025-11-01'),
      dataScadenza: new Date('2025-11-30'),
      stati: ['ATTIVO'],
    },
  });
  console.log('✅ Pacchetto creato per Marco Ferrari');

  // Pacchetto 2 - Giulia (da template Superiori 10 Ore)
  const pacchetto2 = await prisma.package.create({
    data: {
      studentId: studente2.id,
      standardPackageId: stdPkgSuperiori10.id,
      nome: 'Giulia - Superiori 10 Ore',
      tipo: 'ORE',
      oreAcquistate: 10.00,
      oreResiduo: 7.00, // Già consumate 3 ore
      prezzoTotale: 150.00,
      importoPagato: 150.00,
      importoResiduo: 0.00,
      dataInizio: new Date('2025-10-15'),
      dataScadenza: new Date('2025-12-15'),
      stati: ['ATTIVO'],
    },
  });
  console.log('✅ Pacchetto creato per Giulia Romano');

  // Pacchetto 3 - Alessandro (nuovo, non ancora iniziato)
  const pacchetto3 = await prisma.package.create({
    data: {
      studentId: studente3.id,
      standardPackageId: stdPkgElementari.id,
      nome: 'Alessandro - Elementari Mensile',
      tipo: 'MENSILE',
      oreAcquistate: 40.00,
      oreResiduo: 40.00,
      giorniAcquistati: 20,
      giorniResiduo: 20,
      orarioGiornaliero: 2.00,
      prezzoTotale: 300.00,
      importoPagato: 100.00,
      importoResiduo: 200.00,
      dataInizio: new Date('2025-11-06'),
      dataScadenza: new Date('2025-12-06'),
      stati: ['ATTIVO'],
    },
  });
  console.log('✅ Pacchetto creato per Alessandro Conti');

  // ============================================
  // 7. PAGAMENTI
  // ============================================
  
  console.log('\n💰 Creazione pagamenti...');

  // Pagamento 1 - Acconto Marco
  const payment1 = await prisma.payment.create({
    data: {
      packageId: pacchetto1.id,
      importo: 200.00,
      tipoPagamento: 'ACCONTO',
      metodoPagamento: 'BONIFICO',
      dataPagamento: new Date('2025-11-01'),
      riferimento: 'BON-2025-001',
      note: 'Acconto pacchetto mensile',
    },
  });
  console.log('✅ Pagamento acconto creato per Marco');

  // Pagamento 2 - Saldo Giulia
  const payment2 = await prisma.payment.create({
    data: {
      packageId: pacchetto2.id,
      importo: 150.00,
      tipoPagamento: 'SALDO',
      metodoPagamento: 'CONTANTI',
      dataPagamento: new Date('2025-10-15'),
      riferimento: 'RIC-2025-001',
      note: 'Pagamento completo',
    },
  });
  console.log('✅ Pagamento saldo creato per Giulia');

  // Pagamento 3 - Acconto Alessandro
  const payment3 = await prisma.payment.create({
    data: {
      packageId: pacchetto3.id,
      importo: 100.00,
      tipoPagamento: 'ACCONTO',
      metodoPagamento: 'POS',
      dataPagamento: new Date('2025-11-06'),
      riferimento: 'POS-2025-001',
    },
  });
  console.log('✅ Pagamento acconto creato per Alessandro');

  // ============================================
  // 8. LEZIONI
  // ============================================
  
  console.log('\n📚 Creazione lezioni...');

  // Lezione 1 - Marco con Maria (completata)
  const lezione1 = await prisma.lesson.create({
    data: {
      studentId: studente1.id,
      packageId: pacchetto1.id,
      tutorId: tutor1.id,
      data: new Date('2025-11-04'),
      timeSlotId: slot1.id,
      tipo: 'INDIVIDUALE',
      costoTutor: 5.00,
      note: 'Equazioni di secondo grado',
    },
  });
  console.log('✅ Lezione creata: Marco - 15:30-16:30');

  // Lezione 2 - Marco con Maria (completata)
  const lezione2 = await prisma.lesson.create({
    data: {
      studentId: studente1.id,
      packageId: pacchetto1.id,
      tutorId: tutor1.id,
      data: new Date('2025-11-05'),
      timeSlotId: slot2.id,
      tipo: 'INDIVIDUALE',
      costoTutor: 5.00,
      note: 'Geometria - Teorema di Pitagora',
    },
  });
  console.log('✅ Lezione creata: Marco - 16:30-17:30');

  // Lezione 3 - Giulia con Sofia (completata)
  const lezione3 = await prisma.lesson.create({
    data: {
      studentId: studente2.id,
      packageId: pacchetto2.id,
      tutorId: tutor3.id,
      data: new Date('2025-11-04'),
      timeSlotId: slot3.id,
      tipo: 'INDIVIDUALE',
      costoTutor: 5.00,
      note: 'Chimica organica',
    },
  });
  console.log('✅ Lezione creata: Giulia - 17:30-18:30');

  // Lezione 4 - Giulia con Sofia (completata)
  const lezione4 = await prisma.lesson.create({
    data: {
      studentId: studente2.id,
      packageId: pacchetto2.id,
      tutorId: tutor3.id,
      data: new Date('2025-11-05'),
      timeSlotId: slot3.id,
      tipo: 'INDIVIDUALE',
      costoTutor: 5.00,
      note: 'Biologia cellulare',
    },
  });
  console.log('✅ Lezione creata: Giulia - 17:30-18:30');

  // ============================================
  // 9. MOVIMENTI CONTABILI
  // ============================================
  
  console.log('\n💼 Creazione movimenti contabili...');

  // Entrate - Pagamenti pacchetti
  await prisma.accountingEntry.create({
    data: {
      tipo: 'ENTRATA',
      importo: 200.00,
      descrizione: 'Acconto pacchetto Marco Ferrari',
      categoria: 'Pacchetto',
      data: new Date('2025-11-01'),
      packageId: pacchetto1.id,
      paymentId: payment1.id,
    },
  });

  await prisma.accountingEntry.create({
    data: {
      tipo: 'ENTRATA',
      importo: 150.00,
      descrizione: 'Saldo pacchetto Giulia Romano',
      categoria: 'Pacchetto',
      data: new Date('2025-10-15'),
      packageId: pacchetto2.id,
      paymentId: payment2.id,
    },
  });

  await prisma.accountingEntry.create({
    data: {
      tipo: 'ENTRATA',
      importo: 100.00,
      descrizione: 'Acconto pacchetto Alessandro Conti',
      categoria: 'Pacchetto',
      data: new Date('2025-11-06'),
      packageId: pacchetto3.id,
      paymentId: payment3.id,
    },
  });

  console.log('✅ 3 entrate create (pagamenti)');

  // Uscite - Compensi tutor
  await prisma.accountingEntry.create({
    data: {
      tipo: 'USCITA',
      importo: 5.00,
      descrizione: 'Compenso Maria Bianchi - Lezione Marco 04/11',
      categoria: 'Compenso Tutor',
      data: new Date('2025-11-04'),
      lessonId: lezione1.id,
    },
  });

  await prisma.accountingEntry.create({
    data: {
      tipo: 'USCITA',
      importo: 5.00,
      descrizione: 'Compenso Maria Bianchi - Lezione Marco 05/11',
      categoria: 'Compenso Tutor',
      data: new Date('2025-11-05'),
      lessonId: lezione2.id,
    },
  });

  await prisma.accountingEntry.create({
    data: {
      tipo: 'USCITA',
      importo: 5.00,
      descrizione: 'Compenso Sofia Russo - Lezione Giulia 04/11',
      categoria: 'Compenso Tutor',
      data: new Date('2025-11-04'),
      lessonId: lezione3.id,
    },
  });

  await prisma.accountingEntry.create({
    data: {
      tipo: 'USCITA',
      importo: 5.00,
      descrizione: 'Compenso Sofia Russo - Lezione Giulia 05/11',
      categoria: 'Compenso Tutor',
      data: new Date('2025-11-05'),
      lessonId: lezione4.id,
    },
  });

  console.log('✅ 4 uscite create (compensi tutor)');

  // ============================================
  // RIEPILOGO
  // ============================================
  
  console.log('\n✅ ========================================');
  console.log('✅ SEEDING COMPLETATO CON SUCCESSO!');
  console.log('✅ ========================================\n');
  
  console.log('📊 Dati creati:');
  console.log('  ⚙️  Configurazioni: 6');
  console.log('  👤 Utenti: 4 (1 admin + 3 tutor)');
  console.log('  👨‍🎓 Studenti: 3');
  console.log('  📋 Pacchetti Standard: 3');
  console.log('  📦 Pacchetti Studenti: 3');
  console.log('  ⏰ Slot Orari: 3');
  console.log('  💰 Pagamenti: 3');
  console.log('  📚 Lezioni: 4');
  console.log('  💼 Movimenti Contabili: 7\n');
  
  console.log('🔐 Credenziali di accesso:');
  console.log('  Admin:');
  console.log('    📧 Email: admin@tiformiamonoi.it');
  console.log('    🔑 Password: admin123\n');
  console.log('  Tutor:');
  console.log('    📧 maria.bianchi@example.com - 🔑 tutor123');
  console.log('    📧 luca.verdi@example.com - 🔑 tutor123');
  console.log('    📧 sofia.russo@example.com - 🔑 tutor123\n');
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
