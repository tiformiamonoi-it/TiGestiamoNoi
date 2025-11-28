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

  // ============================================
  // PRIORITÀ 1: ORE/GIORNI
  // ============================================

  if (oreResidue < 0) {
    stati.push('ORE_NEGATIVE');
  } else if (oreResidue === 0) {
    stati.push('ESAURITO');
  } else if (oreResidue > 0) {
    stati.push('ATTIVO');
  }

  // ============================================
  // PRIORITÀ 2: SCADENZA (solo per pacchetti ORE)
  // ============================================

  if (pkg.dataScadenza) {
    const dataScadenza = new Date(pkg.dataScadenza);

    // Se scaduto, rimuovi ATTIVO e aggiungi SCADUTO
    if (dataScadenza < oggi) {
      stati.push('SCADUTO');

      // Rimuovi ATTIVO se presente
      const indexAttivo = stati.indexOf('ATTIVO');
      if (indexAttivo > -1) {
        stati.splice(indexAttivo, 1);
      }
    }
  }

  // ============================================
  // PRIORITÀ 3: PAGAMENTO
  // ============================================

  if (importoResiduo > 0) {
    stati.push('DA_PAGARE');
  } else {
    stati.push('PAGATO');
  }

  return stati;
}

function isPacchettoClosed(pkg) {
  const isPagato = parseFloat(pkg.importoResiduo || 0) === 0;
  const hasNoOre = parseFloat(pkg.oreResiduo || 0) <= 0;

  // Check if expired
  let isScaduto = false;
  if (pkg.dataScadenza) {
    const oggi = new Date();
    const dataScadenza = new Date(pkg.dataScadenza);
    isScaduto = dataScadenza < oggi;
  }

  // Closed if Paid AND (No Hours OR Expired)
  return isPagato && (hasNoOre || isScaduto);
}


/**
 * ✅ AGGIORNATA: Aggiorna gli stati di un pacchetto e calcola ore perse
 * @param {Object} prisma - Istanza Prisma
 * @param {string} packageId - ID del pacchetto
 * @returns {Promise<Object>} - Pacchetto aggiornato
 */
async function updatePackageStates(packageId) {
  const prisma = require('../config/prisma');

  // Carica pacchetto
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
  });

  if (!pkg) {
    throw new Error('Pacchetto non trovato');
  }

  // Calcola nuovi stati
  const nuoviStati = calculatePackageStates(pkg);

  // ✅ CALCOLO ORE PERSE SE SCADUTO
  let orePerse = parseFloat(pkg.orePerse || 0);

  if (nuoviStati.includes('SCADUTO')) {
    const oreResiduo = parseFloat(pkg.oreResiduo || 0);

    if (pkg.tipo === 'MENSILE') {
      // Per MENSILE: Ore Perse = (Giorni Totali * Orario Giornaliero) - Ore Usate
      // Se scaduto, consideriamo tutti i giorni come "passati"
      const giorniAcquistati = parseFloat(pkg.giorniAcquistati || 0);
      const orarioGiornaliero = parseFloat(pkg.orarioGiornaliero || 0);
      const oreAcquistate = parseFloat(pkg.oreAcquistate || 0);
      const oreUsate = oreAcquistate - oreResiduo;

      const oreTeoriche = giorniAcquistati * orarioGiornaliero;

      // Ore perse totali (include sia inefficienza che residuo non usato)
      orePerse = Math.max(0, oreTeoriche - oreUsate);
    } else {
      // Per ORE (e altri): Ore Perse = Ore Residue
      orePerse = Math.max(0, oreResiduo);
    }
  }

  // Aggiorna nel database
  return await prisma.package.update({
    where: { id: packageId },
    data: {
      stati: nuoviStati,
      orePerse: orePerse
    },
  });
}
/**
 * Aggiorna gli stati di tutti i pacchetti di uno studente
 * @param {Object} prisma - Istanza Prisma
 * @param {string} studentId - ID dello studente
 */
async function updateAllStudentPackageStates(studentId) {
  const prisma = require('../config/prisma');

  const packages = await prisma.package.findMany({
    where: { studentId },
  });

  for (const pkg of packages) {
    await updatePackageStates(pkg.id);
  }
}


module.exports = {
  calculatePackageStates,
  updatePackageStates,
  updateAllStudentPackageStates,
  isPacchettoClosed,
};
