// backend/src/utils/packageStates.js
/**
 * Utility per calcolare dinamicamente gli stati dei pacchetti
 * Centralizza la logica che prima era solo nel frontend
 */


/**
 * ✅ CORRETTA: Calcola gli stati di un pacchetto
 * @param {Object} pkg - Pacchetto con tutti i campi
 * @returns {Array} - Array di stati (enum PackageStatus)
 */
function calculatePackageStates(pkg) {
  const stati = [];
  const oggi = new Date();

  // Converti campi a numeri
  const oreResidue = parseFloat(pkg.oreResiduo || 0);
  const importoResiduo = parseFloat(pkg.importoResiduo || 0);
  const oreAcquistate = parseFloat(pkg.oreAcquistate || 0);

  // ============================================
  // PRIORITÀ 1: SCADENZA TEMPORALE
  // ============================================
  let isScaduto = false;
  if (pkg.dataScadenza) {
    const dataScadenza = new Date(pkg.dataScadenza);
    
    // SCADUTO (se data passata)
    if (dataScadenza < oggi) {
      stati.push('SCADUTO');
      isScaduto = true;
    } else {
      // DA_RINNOVARE (se scade entro 7 giorni)
      const giorniRimasti = Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24));
      if (giorniRimasti > 0 && giorniRimasti <= 7) {
        stati.push('DA_RINNOVARE');
      }
    }
  }

  // ============================================
  // PRIORITÀ 2: ORE/GIORNI
  // ============================================
  let isEsaurito = false;
  
  // ORE_NEGATIVE (se ha sforato il limite)
  if (oreResidue < 0) {
    stati.push('ORE_NEGATIVE');
  }
  
  // ESAURITO (se ore finite ma non negative)
  if (oreResidue === 0) {
    stati.push('ESAURITO');
    isEsaurito = true;
  }
  
  // IN_SCADENZA (se meno del 20% ore rimanenti e non esaurito)
  if (oreResidue > 0 && oreAcquistate > 0) {
    const percentuale = (oreResidue / oreAcquistate) * 100;
    if (percentuale < 20) {
      stati.push('IN_SCADENZA');
    }
  }

  // ============================================
  // PRIORITÀ 3: STATO ATTIVO
  // ============================================
  // ATTIVO: ore disponibili E non scaduto E non esaurito
  if (oreResidue > 0 && !isScaduto && !isEsaurito) {
    stati.push('ATTIVO');
  }

  // ============================================
  // PRIORITÀ 4: PAGAMENTO (INDIPENDENTE)
  // ============================================
  // PAGATO/DA_PAGARE sono INDIPENDENTI dallo stato ATTIVO
  if (importoResiduo > 0) {
    stati.push('DA_PAGARE');
  } else {
    stati.push('PAGATO');
  }

  // Fallback: almeno uno stato
  if (stati.length === 0) {
    stati.push('ATTIVO');
  }

  return stati;
}


/**
 * ✅ AGGIORNATA: Aggiorna gli stati di un pacchetto e calcola ore perse
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
  
  // ============================================
  // ✅ LOGICA ORE PERSE
  // ============================================
  
  let orePerse = parseFloat(pkg.orePerse || 0);
  const oreResidue = parseFloat(pkg.oreResiduo || 0);
  const giorniResidui = pkg.giorniResiduo ? parseInt(pkg.giorniResiduo) : null;
  const statiPrecedenti = pkg.stati || [];
  
  // CASO 1: Pacchetto diventa SCADUTO (data superata) con ore positive
  const diventaScaduto = nuoviStati.includes('SCADUTO') && !statiPrecedenti.includes('SCADUTO');
  
  if (diventaScaduto && oreResidue > 0) {
    orePerse += oreResidue;
    console.log(`📉 Pacchetto ${pkg.id} SCADUTO: ${oreResidue}h aggiunte a orePerse (totale: ${orePerse}h)`);
  }
  
  // CASO 2: Pacchetto MENSILE con giorni esauriti ma ore rimanenti
  const isPacchettoDiventaEsauritoGiorni = (
    pkg.tipo === 'MENSILE' && 
    giorniResidui === 0 && 
    oreResidue > 0 &&
    !statiPrecedenti.includes('ESAURITO') // Non contare due volte
  );
  
  if (isPacchettoDiventaEsauritoGiorni && !diventaScaduto) {
    // Solo se non è già stato conteggiato come scaduto
    orePerse += oreResidue;
    console.log(`📉 Pacchetto ${pkg.id} MENSILE esaurito giorni: ${oreResidue}h aggiunte a orePerse (totale: ${orePerse}h)`);
  }
  
  // Aggiorna nel database
  const updated = await prisma.package.update({
    where: { id: packageId },
    data: { 
      stati: nuoviStati,
      orePerse: parseFloat(orePerse.toFixed(2)), // ✅ Aggiorna ore perse
    },
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
    await updatePackageStates(prisma, pkg.id);
  }
}

module.exports = {
  calculatePackageStates,
  updatePackageStates,
  updateAllStudentPackageStates,
};
