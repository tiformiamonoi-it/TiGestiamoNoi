// backend/src/utils/lessonCalculations.js
/**
 * Utility per calcoli lezioni
 * ✅ Scalamento giorni per pacchetti MENSILI gestito nel controller
 */

// ============================================
// COSTANTI TARIFFE
// ============================================

const TARIFFE = {
  oraSingola: 5.00,
  oraGruppo: 8.00,
  oraMaxi: 8.50,
  mezzaOraSingola: 2.50,
  mezzaOraGruppo: 4.00,
  mezzaOraMaxi: 4.00,
};

// ============================================
// TIPO LEZIONE
// ============================================

function determinaTipoLezione(numeroStudenti, forzaGruppo = false) {
  if (forzaGruppo && numeroStudenti === 1) {
    return 'GRUPPO';
  }
  
  if (numeroStudenti === 1) return 'SINGOLA';
  if (numeroStudenti >= 2 && numeroStudenti <= 3) return 'GRUPPO';
  if (numeroStudenti >= 4) return 'MAXI';
  
  return 'SINGOLA';
}

// ============================================
// COMPENSO TUTOR
// ============================================

function calcolaCompensoTutor(tipoLezione, mezzaLezione = false) {
  if (mezzaLezione) {
    switch (tipoLezione) {
      case 'SINGOLA': return TARIFFE.mezzaOraSingola;
      case 'GRUPPO': return TARIFFE.mezzaOraGruppo;
      case 'MAXI': return TARIFFE.mezzaOraMaxi;
      default: return TARIFFE.mezzaOraSingola;
    }
  } else {
    switch (tipoLezione) {
      case 'SINGOLA': return TARIFFE.oraSingola;
      case 'GRUPPO': return TARIFFE.oraGruppo;
      case 'MAXI': return TARIFFE.oraMaxi;
      default: return TARIFFE.oraSingola;
    }
  }
}

// ============================================
// SCALAMENTO ORE
// ============================================

function calcolaScalamentoOre(mezzaLezione = false) {
  return 1.0; // ✅ Sempre -1h
}

function calcolaScalamentoOreMensile(mezzaLezione = false) {
  return 1.0; // ✅ Sempre -1h
}

function deveScalareGiorno(oreResiduoGiorno, orarioGiornaliero) {
  return oreResiduoGiorno <= 0;
}

// ============================================
// CALCOLO MARGINE
// ============================================

function calcolaMargineGiornaliero(lezioni) {
  let incasso = 0;
  let spese = 0;
  
  lezioni.forEach(lezione => {
    spese += parseFloat(lezione.compensoTutor || 0);
  });
  
  const margine = incasso - spese;
  
  return {
    incasso: parseFloat(incasso.toFixed(2)),
    spese: parseFloat(spese.toFixed(2)),
    margine: parseFloat(margine.toFixed(2)),
  };
}

// ============================================
// UTILITY PACCHETTO (DEPRECATE - usare controller)
// ============================================

/**
 * @deprecated Usare logica nel controller per gestire correttamente i giorni
 */
function calcolaNuoviValoriPacchetto(pacchetto, mezzaLezione = false) {
  let oreResiduo = parseFloat(pacchetto.oreResiduo) - 1.0;
  let giorniResiduo = pacchetto.giorniResiduo ? parseInt(pacchetto.giorniResiduo) : null;
  
  // NON scalare giorni qui, lo fa il controller
  
  return {
    oreResiduo: parseFloat(oreResiduo.toFixed(2)),
    giorniResiduo: giorniResiduo,
    needsUpdate: true,
  };
}

/**
 * @deprecated Usare logica nel controller per ripristino bulk
 */
function ripristinaValoriPacchetto(pacchetto, mezzaLezione = false) {
  let oreResiduo = parseFloat(pacchetto.oreResiduo) + 1.0;
  let giorniResiduo = pacchetto.giorniResiduo ? parseInt(pacchetto.giorniResiduo) : null;
  
  // ✅ Ripristina +1 giorno solo per MENSILE
  if (pacchetto.tipo === 'MENSILE' && giorniResiduo !== null) {
    giorniResiduo += 1;
  }
  
  return {
    oreResiduo: parseFloat(oreResiduo.toFixed(2)),
    giorniResiduo: giorniResiduo,
    needsUpdate: true,
  };
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  TARIFFE,
  determinaTipoLezione,
  calcolaCompensoTutor,
  calcolaScalamentoOre,
  calcolaScalamentoOreMensile,
  deveScalareGiorno,
  calcolaMargineGiornaliero,
  calcolaNuoviValoriPacchetto,
  ripristinaValoriPacchetto,
};
