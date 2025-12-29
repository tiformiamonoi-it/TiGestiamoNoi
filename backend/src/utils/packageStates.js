// backend/src/utils/packageStates.js
/**
 * Utility per calcolare dinamicamente gli stati dei pacchetti
 * VERSIONE 2.0 - Stati semplificati e allineati
 * 
 * STATI DISPONIBILI:
 * - ATTIVO: pacchetto utilizzabile (ore > 0 e non scaduto)
 * - DA_RINNOVARE: avviso rinnovo (< 20% residuo O <= 3 giorni a scadenza)
 * - SCADUTO: data scadenza superata
 * - ESAURITO: ore/giorni = 0
 * - NEGATIVO: ore/giorni < 0 (debito)
 * - DA_PAGARE: importoResiduo > 0
 * - PAGATO: importoResiduo = 0
 * - CHIUSO: PAGATO + (SCADUTO o ESAURITO)
 */

/**
 * Calcola gli stati di un pacchetto
 * @param {Object} pkg - Pacchetto con tutti i campi
 * @returns {Array} - Array di stati (enum PackageStatus)
 */
function calculatePackageStates(pkg) {
  const stati = [];
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  // ============================================
  // VARIABILI BASE
  // ============================================

  const tipo = pkg.tipo; // 'ORE' o 'MENSILE'
  const oreResidue = parseFloat(pkg.oreResiduo || 0);
  const giorniResidui = parseInt(pkg.giorniResiduo || 0);
  const oreAcquistate = parseFloat(pkg.oreAcquistate || 0);
  const giorniAcquistati = parseInt(pkg.giorniAcquistati || 0);
  const importoResiduo = parseFloat(pkg.importoResiduo || 0);

  // Determina il residuo in base al tipo di pacchetto
  const residuo = tipo === 'MENSILE' ? giorniResidui : oreResidue;
  const totale = tipo === 'MENSILE' ? giorniAcquistati : oreAcquistate;

  // Calcola percentuale residuo
  const percentualeResiduo = totale > 0 ? (residuo / totale) * 100 : 0;

  // Calcola giorni alla scadenza
  let giorniAllaScadenza = null;
  let isScaduto = false;

  if (pkg.dataScadenza) {
    const dataScadenza = new Date(pkg.dataScadenza);
    dataScadenza.setHours(0, 0, 0, 0);
    giorniAllaScadenza = Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24));
    isScaduto = giorniAllaScadenza < 0;
  }

  // ============================================
  // REGOLA 1: STATI ORE/GIORNI
  // ============================================

  if (residuo < 0) {
    // Ore/giorni in debito
    stati.push('NEGATIVO');
  } else if (residuo === 0) {
    // Ore/giorni esauriti
    stati.push('ESAURITO');
  }

  // ============================================
  // REGOLA 2: STATO SCADENZA
  // ============================================

  if (isScaduto) {
    stati.push('SCADUTO');
  }

  // ============================================
  // REGOLA 3: STATO ATTIVO
  // Solo se: residuo > 0 E non scaduto
  // ============================================

  const isNegativoOEsaurito = stati.includes('NEGATIVO') || stati.includes('ESAURITO');
  if (!isNegativoOEsaurito && !isScaduto && residuo > 0) {
    stati.push('ATTIVO');
  }

  // ============================================
  // REGOLA 4: DA_RINNOVARE
  // Condizioni: ATTIVO + (residuo < 20% OPPURE <= 3 giorni a scadenza)
  // ============================================

  if (stati.includes('ATTIVO')) {
    const sonoSottoSoglia = percentualeResiduo > 0 && percentualeResiduo < 20;
    const scadenzaVicina = giorniAllaScadenza !== null && giorniAllaScadenza >= 0 && giorniAllaScadenza <= 3;

    if (sonoSottoSoglia || scadenzaVicina) {
      stati.push('DA_RINNOVARE');
    }
  }

  // ============================================
  // REGOLA 5: STATI PAGAMENTO
  // Sempre uno dei due, mai entrambi
  // ============================================

  if (importoResiduo > 0) {
    stati.push('DA_PAGARE');
  } else {
    stati.push('PAGATO');
  }

  // ============================================
  // REGOLA 6: STATO CHIUSO
  // PAGATO + (SCADUTO o ESAURITO) = CHIUSO
  // ============================================

  const isPagato = stati.includes('PAGATO');
  const isFinito = stati.includes('SCADUTO') || stati.includes('ESAURITO');

  if (isPagato && isFinito) {
    stati.push('CHIUSO');
  }

  return stati;
}

/**
 * Filtra stati per la visualizzazione frontend
 * Se CHIUSO presente, mostra solo CHIUSO
 * @param {Array} stati - Array di stati
 * @returns {Array} - Stati filtrati per visualizzazione
 */
function getDisplayStates(stati) {
  if (!Array.isArray(stati)) return [];
  if (stati.includes('CHIUSO')) {
    return ['CHIUSO'];
  }
  return stati;
}

/**
 * Verifica se un pacchetto è chiuso (non utilizzabile)
 * @param {Object} pkg - Pacchetto
 * @returns {boolean}
 */
function isPacchettoClosed(pkg) {
  if (!pkg) return true;

  // Se abbiamo già gli stati calcolati
  if (Array.isArray(pkg.stati) && pkg.stati.includes('CHIUSO')) {
    return true;
  }

  // Altrimenti calcola
  const isPagato = parseFloat(pkg.importoResiduo || 0) === 0;
  const tipo = pkg.tipo;
  const residuo = tipo === 'MENSILE'
    ? parseInt(pkg.giorniResiduo || 0)
    : parseFloat(pkg.oreResiduo || 0);
  const hasNoResiduo = residuo <= 0;

  // Check if expired
  let isScaduto = false;
  if (pkg.dataScadenza) {
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const dataScadenza = new Date(pkg.dataScadenza);
    dataScadenza.setHours(0, 0, 0, 0);
    isScaduto = dataScadenza < oggi;
  }

  // Closed if Paid AND (No Residuo OR Expired)
  return isPagato && (hasNoResiduo || isScaduto);
}

/**
 * Verifica se un pacchetto è attivo (utilizzabile per lezioni)
 * @param {Object} pkg - Pacchetto
 * @returns {boolean}
 */
function isPacchettoAttivo(pkg) {
  if (!pkg) return false;

  if (Array.isArray(pkg.stati)) {
    // Se CHIUSO, non è attivo
    if (pkg.stati.includes('CHIUSO')) return false;
    // Altrimenti check ATTIVO
    return pkg.stati.includes('ATTIVO');
  }

  // Fallback: calcola manualmente
  return !isPacchettoClosed(pkg);
}

/**
 * Aggiorna gli stati di un pacchetto e calcola ore perse
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

  // ============================================
  // CALCOLO ORE PERSE SE SCADUTO
  // ============================================
  let orePerse = parseFloat(pkg.orePerse || 0);

  if (nuoviStati.includes('SCADUTO')) {
    const oreResiduo = parseFloat(pkg.oreResiduo || 0);

    if (pkg.tipo === 'MENSILE') {
      // Per MENSILE: Ore Perse = (Giorni Totali * Orario Giornaliero) - Ore Usate
      const giorniAcquistati = parseFloat(pkg.giorniAcquistati || 0);
      const orarioGiornaliero = parseFloat(pkg.orarioGiornaliero || 0);
      const oreAcquistate = parseFloat(pkg.oreAcquistate || 0);
      const oreUsate = oreAcquistate - oreResiduo;
      const oreTeoriche = giorniAcquistati * orarioGiornaliero;
      orePerse = Math.max(0, oreTeoriche - oreUsate);
    } else {
      // Per ORE: Ore Perse = Ore Residue (positive)
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

/**
 * Aggiorna gli stati di TUTTI i pacchetti non chiusi
 * Usato per refresh manuale completo
 * @returns {Promise<number>} - Numero di pacchetti aggiornati
 */
async function refreshAllPackageStates() {
  const prisma = require('../config/prisma');

  const packages = await prisma.package.findMany({
    where: {
      NOT: {
        stati: { has: 'CHIUSO' }
      }
    }
  });

  for (const pkg of packages) {
    await updatePackageStates(pkg.id);
  }

  return packages.length;
}


module.exports = {
  calculatePackageStates,
  getDisplayStates,
  updatePackageStates,
  updateAllStudentPackageStates,
  refreshAllPackageStates,
  isPacchettoClosed,
  isPacchettoAttivo,
};
