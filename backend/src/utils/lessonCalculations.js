// backend/src/utils/lessonCalculations.js
/**
 * Utility per calcoli lezioni
 * Centralizza tutta la logica di calcolo per tipo lezione, compensi tutor, scalamento ore
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

/**
 * Determina il tipo di lezione in base al numero di studenti
 * @param {number} numeroStudenti - Numero di studenti nella lezione
 * @param {boolean} forzaGruppo - Se true, forza tipo GRUPPO anche con 1 studente
 * @returns {string} - 'SINGOLA' | 'GRUPPO' | 'MAXI'
 */
function determinaTipoLezione(numeroStudenti, forzaGruppo = false) {
  // Eccezione: forza gruppo con 1 studente
  if (forzaGruppo && numeroStudenti === 1) {
    return 'GRUPPO';
  }
  
  if (numeroStudenti === 1) return 'SINGOLA';
  if (numeroStudenti >= 2 && numeroStudenti <= 3) return 'GRUPPO';
  if (numeroStudenti >= 4) return 'MAXI';
  
  return 'SINGOLA'; // Fallback
}

// ============================================
// COMPENSO TUTOR
// ============================================

/**
 * Calcola il compenso del tutor per la lezione
 * @param {string} tipoLezione - 'SINGOLA' | 'GRUPPO' | 'MAXI'
 * @param {boolean} mezzaLezione - Se true, lezione di mezza ora
 * @returns {number} - Compenso in euro
 */
function calcolaCompensoTutor(tipoLezione, mezzaLezione = false) {
  if (mezzaLezione) {
    switch (tipoLezione) {
      case 'SINGOLA':
        return TARIFFE.mezzaOraSingola;
      case 'GRUPPO':
        return TARIFFE.mezzaOraGruppo;
      case 'MAXI':
        return TARIFFE.mezzaOraMaxi;
      default:
        return TARIFFE.mezzaOraSingola;
    }
  } else {
    switch (tipoLezione) {
      case 'SINGOLA':
        return TARIFFE.oraSingola;
      case 'GRUPPO':
        return TARIFFE.oraGruppo;
      case 'MAXI':
        return TARIFFE.oraMaxi;
      default:
        return TARIFFE.oraSingola;
    }
  }
}

// ============================================
// SCALAMENTO ORE PACCHETTO
// ============================================

/**
 * Calcola lo scalamento ore per un pacchetto ORE
 * @param {boolean} mezzaLezione - Se true, mezza lezione
 * @returns {number} - Ore da scalare (sempre -1)
 */
function calcolaScalamentoOre(mezzaLezione = false) {
  // Sempre -1h, indipendentemente da mezza lezione
  return 1.0;
}

/**
 * Calcola lo scalamento ore per un pacchetto MENSILE
 * @param {boolean} mezzaLezione - Se true, mezza lezione
 * @returns {number} - Ore da scalare
 */
function calcolaScalamentoOreMensile(mezzaLezione = false) {
  if (mezzaLezione) {
    return 0.5; // Mezza lezione: -0.5h
  }
  return 1.0; // Lezione intera: -1h
}

/**
 * Verifica se bisogna scalare un giorno intero (pacchetto MENSILE)
 * @param {number} oreResiduoGiorno - Ore rimanenti nel giorno corrente
 * @param {number} orarioGiornaliero - Ore disponibili per giorno (es: 3h)
 * @returns {boolean} - True se bisogna scalare il giorno
 */
function deveScalareGiorno(oreResiduoGiorno, orarioGiornaliero) {
  // Se le ore residue del giorno sono finite o negative, scala il giorno
  return oreResiduoGiorno <= 0;
}

// ============================================
// CALCOLO MARGINE GIORNALIERO
// ============================================

/**
 * Calcola il margine totale di un giorno
 * @param {Array} lezioni - Array di lezioni del giorno
 * @returns {Object} - { incasso, spese, margine }
 */
function calcolaMargineGiornaliero(lezioni) {
  let incasso = 0;
  let spese = 0;
  
  lezioni.forEach(lezione => {
    // Incasso: numero studenti × prezzo lezione (da definire, per ora non calcolato)
    // Per ora consideriamo solo le spese tutor
    
    // Spese: compenso tutor
    spese += parseFloat(lezione.compensoTutor || 0);
  });
  
  // Incasso sarà calcolato in futuro con prezzo per studente
  // Per ora: margine = -spese (solo costi)
  const margine = incasso - spese;
  
  return {
    incasso: parseFloat(incasso.toFixed(2)),
    spese: parseFloat(spese.toFixed(2)),
    margine: parseFloat(margine.toFixed(2)),
  };
}

// ============================================
// UTILITY AGGIORNAMENTO PACCHETTO
// ============================================

/**
 * Calcola i nuovi valori del pacchetto dopo una lezione
 * @param {Object} pacchetto - Pacchetto corrente
 * @param {boolean} mezzaLezione - Se true, mezza lezione
 * @returns {Object} - { oreResiduo, giorniResiduo, needsUpdate }
 */
function calcolaNuoviValoriPacchetto(pacchetto, mezzaLezione = false) {
  const tipo = pacchetto.tipo;
  let oreResiduo = parseFloat(pacchetto.oreResiduo);
  let giorniResiduo = pacchetto.giorniResiduo ? parseInt(pacchetto.giorniResiduo) : null;
  
  if (tipo === 'MENSILE') {
    // ✅ PACCHETTO MENSILE
    // Regola: Scala sempre -1h (anche se mezza lezione) + -1 giorno
    
    // Scala sempre 1 ora (mai mezz'ora)
    oreResiduo -= 1.0;
    
    // Scala sempre 1 giorno (indipendentemente dalle ore fatte)
    giorniResiduo = Math.max(0, (giorniResiduo || 0) - 1);
    
  } else {
    // ✅ PACCHETTO ORARIO
    // Regola: Scala sempre -1h (indipendentemente da mezza lezione)
    oreResiduo -= 1.0;
  }
  
  return {
    oreResiduo: parseFloat(oreResiduo.toFixed(2)),
    giorniResiduo: giorniResiduo,
    needsUpdate: true,
  };
}


/**
 * Ripristina ore pacchetto dopo eliminazione lezione
 * @param {Object} pacchetto - Pacchetto corrente
 * @param {boolean} mezzaLezione - Se true, mezza lezione
 * @returns {Object} - { oreResiduo, giorniResiduo, needsUpdate }
 */
function ripristinaValoriPacchetto(pacchetto, mezzaLezione = false) {
  const tipo = pacchetto.tipo;
  let oreResiduo = parseFloat(pacchetto.oreResiduo);
  let giorniResiduo = pacchetto.giorniResiduo ? parseInt(pacchetto.giorniResiduo) : null;
  
  if (tipo === 'MENSILE') {
    const oreScalate = calcolaScalamentoOreMensile(mezzaLezione);
    oreResiduo += oreScalate;
    // Nota: ripristino giorni è più complesso, per ora solo ore
  } else {
    const oreScalate = calcolaScalamentoOre(mezzaLezione);
    oreResiduo += oreScalate;
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
  // Costanti
  TARIFFE,
  
  // Funzioni calcolo
  determinaTipoLezione,
  calcolaCompensoTutor,
  calcolaScalamentoOre,
  calcolaScalamentoOreMensile,
  deveScalareGiorno,
  calcolaMargineGiornaliero,
  
  // Funzioni pacchetto
  calcolaNuoviValoriPacchetto,
  ripristinaValoriPacchetto,
};
