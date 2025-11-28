// backend/src/utils/dateHelpers.js

/**
 * Utility per gestione date pacchetti
 */

/**
 * Calcola la data di scadenza di un pacchetto in base al tipo
 * @param {Date|string} dataInizio - Data inizio pacchetto
 * @param {string} tipo - Tipo pacchetto ('ORE' o 'MENSILE')
 * @returns {Date|null} - Data scadenza calcolata
 */
function calcolaScadenzaPacchetto(dataInizio, tipo) {
  const data = new Date(dataInizio);
  
  if (tipo === 'ORE') {
    // Fine anno scolastico: 15 giugno
    // Se inizia da settembre in poi → giugno anno successivo
    // Se inizia prima di settembre → giugno stesso anno
    const meseInizio = data.getMonth(); // 0-11 (0=gennaio, 8=settembre)
    
    const annoScadenza = meseInizio >= 8 // >= Settembre
      ? data.getFullYear() + 1  // Anno successivo
      : data.getFullYear();     // Anno corrente
    
    // 15 giugno (mese 5 perché 0-indexed)
    return new Date(annoScadenza, 5, 15, 23, 59, 59);
  }
  
  if (tipo === 'MENSILE') {
    const scadenza = new Date(data);
    scadenza.setDate(scadenza.getDate() + 30);
    return scadenza;
  }
  
  // Fallback (non dovrebbe mai succedere)
  return null;
}

/**
 * Calcola l'anno scolastico di una data
 * @param {Date|string} data - Data da analizzare
 * @returns {string} - Anno scolastico (es: "2025/2026")
 */
function getAnnoScolastico(data) {
  const d = new Date(data);
  const anno = d.getFullYear();
  const mese = d.getMonth(); // 0-11
  
  // Se da settembre a dicembre → anno corrente/successivo
  // Se da gennaio a agosto → anno precedente/corrente
  if (mese >= 8) { // >= Settembre
    return `${anno}/${anno + 1}`;
  } else {
    return `${anno - 1}/${anno}`;
  }
}

/**
 * Verifica se una data è scaduta
 * @param {Date|string} dataScadenza - Data di scadenza
 * @returns {boolean} - true se scaduta
 */
function isScaduto(dataScadenza) {
  if (!dataScadenza) return false;
  return new Date(dataScadenza) < new Date();
}

module.exports = {
  calcolaScadenzaPacchetto,
  getAnnoScolastico,
  isScaduto
};
