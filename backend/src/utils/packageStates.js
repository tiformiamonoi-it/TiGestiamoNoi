// backend/src/utils/packageStates.js
/**
 * Utility per calcolare dinamicamente gli stati dei pacchetti
 * Centralizza la logica che prima era solo nel frontend
 */

/**
 * Calcola gli stati di un pacchetto basandosi sui suoi dati
 * @param {Object} pkg - Pacchetto con tutti i campi
 * @returns {Array<string>} - Array di stati (enum PackageStatus)
 */
function calculatePackageStates(pkg) {
  const stati = [];
  const oggi = new Date();
  
  // Converti campi a numeri
  const oreResidue = parseFloat(pkg.oreResiduo || 0);
  const importoResiduo = parseFloat(pkg.importoResiduo || 0);
  const oreAcquistate = parseFloat(pkg.oreAcquistate || 0);
  
  // ============================================
  // PRIORITÀ 1: PAGAMENTO
  // ============================================
  
  // DA_PAGARE (se non completamente saldato)
  if (importoResiduo > 0) {
    stati.push('DA_PAGARE');
  }
  
  // PAGATO (se completamente saldato)
  if (importoResiduo <= 0) {
    stati.push('PAGATO');
  }
  
  // ============================================
  // PRIORITÀ 2: ORE/GIORNI
  // ============================================
  
  // ORE_NEGATIVE (se ha sforato il limite)
  if (oreResidue < 0) {
    stati.push('ORE_NEGATIVE');
  }
  
  // ESAURITO (se ore finite ma non negative)
  if (oreResidue === 0) {
    stati.push('ESAURITO');
  }
  
  // IN_SCADENZA (se meno del 20% ore rimanenti)
  if (oreResidue > 0 && oreAcquistate > 0) {
    const percentuale = (oreResidue / oreAcquistate) * 100;
    if (percentuale < 20) {
      stati.push('IN_SCADENZA');
    }
  }
  
  // ============================================
  // PRIORITÀ 3: SCADENZA TEMPORALE
  // ============================================
  
  if (pkg.dataScadenza) {
    const dataScadenza = new Date(pkg.dataScadenza);
    
    // SCADUTO (se data passata)
    if (dataScadenza < oggi) {
      stati.push('SCADUTO');
    }
    
    // DA_RINNOVARE (se scade entro 7 giorni)
    const giorniRimasti = Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24));
    if (giorniRimasti > 0 && giorniRimasti <= 7) {
      stati.push('DA_RINNOVARE');
    }
  }
  
  // ============================================
  // PRIORITÀ 4: STATO ATTIVO
  // ============================================
  
  // ATTIVO (se nessuno stato negativo)
  const statiNegativi = ['SCADUTO', 'ESAURITO', 'ORE_NEGATIVE', 'PAG_SOSPESO'];
  const hasStatiNegativi = stati.some(s => statiNegativi.includes(s));
  
  if (!hasStatiNegativi && oreResidue > 0) {
    stati.push('ATTIVO');
  }
  
  // Se array vuoto, almeno ATTIVO
  if (stati.length === 0) {
    stati.push('ATTIVO');
  }
  
  return stati;
}

/**
 * Aggiorna gli stati di un pacchetto nel database
 * @param {Object} prisma - Istanza Prisma
 * @param {string} packageId - ID del pacchetto
 * @returns {Promise<Object>} - Pacchetto aggiornato
 */
async function updatePackageStates(prisma, packageId) {
  // Recupera pacchetto con tutti i dati
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
  });
  
  if (!pkg) {
    throw new Error(`Pacchetto ${packageId} non trovato`);
  }
  
  // Calcola nuovi stati
  const nuoviStati = calculatePackageStates(pkg);
  
  // Aggiorna nel database
  const updated = await prisma.package.update({
    where: { id: packageId },
    data: { stati: nuoviStati },
  });
  
  return updated;
}

/**
 * Aggiorna gli stati di tutti i pacchetti di uno studente
 * @param {Object} prisma - Istanza Prisma
 * @param {string} studentId - ID dello studente
 */
async function updateAllStudentPackageStates(prisma, studentId) {
  const packages = await prisma.package.findMany({
    where: { studentId },
  });
  
  for (const pkg of packages) {
    const nuoviStati = calculatePackageStates(pkg);
    await prisma.package.update({
      where: { id: pkg.id },
      data: { stati: nuoviStati },
    });
  }
}

module.exports = {
  calculatePackageStates,
  updatePackageStates,
  updateAllStudentPackageStates,
};
