<template>
  <div class="table-container">
    <table class="students-table">
      <thead>
        <tr>
          <th>Alunno</th>
          <th>Pacchetto</th>
          <th>Ore/Giorni Residui</th>
          <th>Stati</th>
          <th>Azioni</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading && students.length === 0">
          <td colspan="5" class="loading-cell">
            <div class="loader"></div>
            Caricamento studenti...
          </td>
        </tr>

        <tr v-else-if="students.length === 0">
          <td colspan="5" class="empty-cell">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>Nessuno studente trovato</p>
          </td>
        </tr>

        <tr
          v-else
          v-for="student in students"
          :key="student.id"
          class="student-row"
        >
          <!-- Colonna Alunno -->
          <td>
            <div class="student-cell">
              <div class="student-avatar">
                {{ getInitials(student) }}
              </div>
              <div class="student-info">
                <div class="student-name">
                  {{ student.lastName }} {{ student.firstName }}
                </div>
                <div class="student-meta">
                  <span class="school-badge">{{ student.scuola }}</span>
                  <span class="parent-name">{{ student.parentName }}</span>
                </div>
              </div>
            </div>
          </td>

          <!-- Colonna Pacchetto -->
          <td>
            <div v-if="student.pacchettoAttivo" class="package-cell">
              <div class="package-name">
                {{ student.pacchettoAttivo.nome || 'Pacchetto' }}
              </div>
              <div class="package-type">
                {{ getPackageTypeLabel(student.pacchettoAttivo.tipo) }}
              </div>
            </div>
            <span v-else class="text-muted">Nessun pacchetto</span>
          </td>

          <!-- Colonna Ore/Giorni -->
          <td>
            <div v-if="student.pacchettoAttivo" class="progress-cell">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{ width: `${getProgress(student.pacchettoAttivo)}%` }"
                  :class="getProgressClass(student.pacchettoAttivo)"
                ></div>
              </div>
              <div class="progress-text">
                {{ getProgressText(student.pacchettoAttivo) }}
              </div>
            </div>
            <span v-else class="text-muted">-</span>
          </td>

          <!-- Colonna Stati -->
          <td>
            <div class="states-cell">
              <span
                v-for="state in getStates(student)"
                :key="state.type"
                :class="`state-badge state-${state.type}`"
              >
                {{ state.label }}
              </span>
            </div>
          </td>

          <!-- Colonna Azioni -->
          <td>
            <div class="actions-cell">
              <button
                @click="$emit('view-details', student.id)"
                class="btn-icon"
                title="Dettagli"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>

              <button
                @click="$emit('manage-packages', student)"
                class="btn-icon"
                title="Gestisci Pacchetti"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Loading more -->
    <div v-if="loading && students.length > 0" class="loading-more">
      <div class="loader"></div>
      Caricamento altri studenti...
    </div>

    <!-- Scroll trigger -->
    <div ref="scrollTrigger" class="scroll-trigger"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  students: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['view-details', 'manage-packages', 'load-more']);

const scrollTrigger = ref(null);

// Helper functions
const getInitials = (student) => {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;
};

const getPackageTypeLabel = (tipo) => {
  const labels = {
    MENSILE: 'Mensile',
    ORARIO: 'Orario',
  };
  return labels[tipo] || tipo;
};

const getProgress = (pacchetto) => {
  if (!pacchetto) return 0;
  
  if (pacchetto.tipo === 'MENSILE') {
    const totale = pacchetto.giorniTotali || 20;
    const residui = pacchetto.giorniResiduo || 0;
    
    // Se residui negativi, barra PIENA al 100% (rossa)
    if (residui < 0) return 100;
    
    return Math.min(Math.max((residui / totale) * 100, 0), 100);
  } else {
    const totale = pacchetto.oreTotali || pacchetto.oreAcquistate || 0;
    const residui = pacchetto.oreResiduo || 0;
    
    // Se residui negativi, barra PIENA al 100% (rossa)
    if (residui < 0) return 100;
    
    return Math.min(Math.max((residui / totale) * 100, 0), 100);
  }
};



const getProgressClass = (pacchetto) => {
  // Controlla se residui sono negativi (ore extra usate)
  const residui = pacchetto.tipo === 'MENSILE' 
    ? pacchetto.giorniResiduo 
    : pacchetto.oreResiduo;
  
  if (residui < 0) {
    return 'progress-danger'; // ROSSO per negativi
  }
  
  const progress = getProgress(pacchetto);
  
  if (progress < 20) return 'progress-danger';   // Rosso sotto 20%
  if (progress < 50) return 'progress-warning';  // Giallo sotto 50%
  return 'progress-success';                     // Verde sopra 50%
};


const getProgressText = (pacchetto) => {
  if (pacchetto.tipo === 'MENSILE') {
    const totale = pacchetto.giorniTotali || 20;
    const residui = pacchetto.giorniResiduo || 0;
    return `${residui} / ${totale} giorni`;
  } else {
    const totale = pacchetto.oreTotali || pacchetto.oreAcquistate || 0;
    const residui = pacchetto.oreResiduo || 0;
    return `${residui.toFixed(1)} / ${totale} ore`;
  }
};


const getStates = (student) => {
  const states = [];
  
  if (!student.pacchettoAttivo) {
    states.push({ type: 'inactive', label: 'Inattivo' });
    return states;
  }

  const pacchetto = student.pacchettoAttivo;
  const oggi = new Date();
  oggi.setHours(0, 0, 0, 0);
  
  const dataScadenza = pacchetto.dataScadenza ? new Date(pacchetto.dataScadenza) : null;
  if (dataScadenza) {
    dataScadenza.setHours(0, 0, 0, 0);
  }

  const giorniAllaScadenza = dataScadenza 
    ? Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24))
    : null;

  const isPagato = pacchetto.importoResiduo === 0;
  const isScaduto = dataScadenza && oggi > dataScadenza;
  const isInScadenza = dataScadenza && giorniAllaScadenza >= 0 && giorniAllaScadenza <= 2;
  
  const quantitaResidua = pacchetto.tipo === 'MENSILE' 
    ? pacchetto.giorniResiduo 
    : pacchetto.oreResiduo;
  
  const quantitaUsata = pacchetto.tipo === 'MENSILE'
    ? pacchetto.giorniUsati
    : pacchetto.oreUsate;

  const quantitaTotale = pacchetto.tipo === 'MENSILE'
    ? pacchetto.giorniTotali
    : pacchetto.oreTotali;

  const isEsaurito = quantitaResidua <= 0;
  
  // FIX: haUsatoExtra controlla se usato > totale (NON usato > acquistati)
  const haUsatoExtra = quantitaUsata > quantitaTotale;

  // REGOLA 1: PAGATO (priorità massima, esclude molti altri)
  if (isPagato) {
    states.push({ type: 'success', label: 'Pagato' });
    
    // Pagato + ore extra = DA RINNOVARE (ROSSO)
    if (haUsatoExtra) {
      states.push({ type: 'renew', label: 'Da Rinnovare' });
    }

    // Pagato + scaduto oggi + ore disponibili = ATTIVO
    if (isScaduto && giorniAllaScadenza === 0 && quantitaResidua > 0) {
      states.push({ type: 'success', label: 'Attivo' });
    }

    return states;
  }

  // REGOLA 2: SCADUTO (priorità alta)
  if (isScaduto) {
    states.push({ type: 'danger', label: 'Scaduto' });
  }

  // REGOLA 3: IN SCADENZA
  if (isInScadenza && !isScaduto) {
    states.push({ type: 'warning', label: 'In Scadenza' });
  }

  // REGOLA 4: ESAURITO
  if (isEsaurito) {
    states.push({ type: 'danger', label: 'Esaurito' });
  }

  // REGOLA 5: DA RINNOVARE (ore extra usate) - ROSSO
  if (haUsatoExtra) {
    states.push({ type: 'renew', label: 'Da Rinnovare' });
  }

  // REGOLA 6: PAG. SOSPESO (importo residuo + (in scadenza o scaduto o esaurito)) - GIALLO
    if (pacchetto.importoResiduo > 0 && (isInScadenza || isScaduto || isEsaurito)) {
    states.push({ type: 'payment-pending', label: 'Pag. Sospeso' });
    }

  // REGOLA 7: ATTIVO (default se nessun problema grave)
  if (!isScaduto && !isEsaurito && quantitaResidua > 0) {
    states.push({ type: 'success', label: 'Attivo' });
  }

  // Se nessuno stato, mostra almeno "Inattivo"
  if (states.length === 0) {
    states.push({ type: 'inactive', label: 'Inattivo' });
  }

  return states;
};



// Infinite scroll observer
const observerCallback = (entries) => {
  const [entry] = entries;
  if (entry.isIntersecting && props.hasMore && !props.loading) {
    emit('load-more');
  }
};

let observer;

onMounted(() => {
  observer = new IntersectionObserver(observerCallback, {
    root: null,
    threshold: 0.1,
  });

  if (scrollTrigger.value) {
    observer.observe(scrollTrigger.value);
  }
});

onUnmounted(() => {
  if (observer && scrollTrigger.value) {
    observer.unobserve(scrollTrigger.value);
  }
});
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.students-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #8392ab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.student-row {
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.2s;
}

.student-row:hover {
  background: #f8f9fa;
}

.student-row td {
  padding: 16px;
  vertical-align: middle;
}

/* Alunno Cell */
.student-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.student-info {
  flex: 1;
  min-width: 0;
}

.student-name {
  font-weight: 600;
  color: #344767;
  font-size: 14px;
  margin-bottom: 4px;
}

.student-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.school-badge {
  padding: 2px 8px;
  background: #e9ecef;
  color: #344767;
  border-radius: 4px;
  font-weight: 600;
  font-size: 11px;
}

.parent-name {
  color: #8392ab;
}

/* Package Cell */
.package-cell {
  min-width: 140px;
}

.package-name {
  font-weight: 600;
  color: #344767;
  font-size: 14px;
  margin-bottom: 2px;
}

.package-type {
  font-size: 12px;
  color: #8392ab;
}

/* Progress Cell */
.progress-cell {
  min-width: 180px;
}

.progress-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s, background 0.3s;
  border-radius: 4px;
}

.progress-success {
  background: linear-gradient(90deg, #2dce89, #2dcecc);
}

.progress-warning {
  background: linear-gradient(90deg, #fb6340, #fbb140);
}

.progress-danger {
  background: linear-gradient(90deg, #f5365c, #fb6340);
}

.progress-text {
  font-size: 13px;
  color: #344767;
  font-weight: 500;
}

/* States Cell */
.states-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 140px;
}

.state-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.state-success {
  background: rgba(45, 206, 137, 0.15);
  color: #2dce89;
}

.state-warning {
  background: rgba(251, 99, 64, 0.15);
  color: #fb6340;
}

.state-danger {
  background: rgba(245, 54, 92, 0.15);
  color: #f5365c;
}

.state-inactive {
  background: rgba(131, 146, 171, 0.15);
  color: #8392ab;
}

/* Badge "Da Rinnovare" - ROSSO */
.state-renew {
  background: rgba(245, 54, 92, 0.15);
  color: #f5365c;
}

/* Badge "Pag. Sospeso" - GIALLO */
.state-payment-pending {
  background: rgba(251, 191, 36, 0.15);
  color: #fb6340;
}

/* Mantieni "info" per altri casi */
.state-info {
  background: rgba(94, 114, 228, 0.15);
  color: #5e72e4;
}


/* Actions Cell */
.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  background: transparent;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8392ab;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f8f9fa;
  color: #5e72e4;
  border-color: #5e72e4;
}

.text-muted {
  color: #8392ab;
  font-size: 14px;
}

/* Loading & Empty States */
.loading-cell,
.empty-cell {
  padding: 60px 20px;
  text-align: center;
  color: #8392ab;
}

.empty-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-cell svg {
  color: #cbd5e0;
}

.empty-cell p {
  margin: 0;
  font-size: 16px;
}

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid #e9ecef;
  border-top-color: #5e72e4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-more {
  padding: 20px;
  text-align: center;
  color: #8392ab;
  font-size: 14px;
}

.scroll-trigger {
  height: 20px;
}
</style>
