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
              <!-- ✅ Pallina rossa se ci sono pagamenti in sospeso -->
              <span 
                v-if="hasPendingPayment(student)" 
                class="payment-dot"
                title="Pagamento in sospeso"
              ></span>
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


// ============================================
// NUOVA LOGICA: Usa stati dal database
// ============================================
const getStates = (student) => {
  const states = [];
  
  if (!student.pacchettoAttivo) {
    states.push({ type: 'inactive', label: 'Nessun Pacchetto' });
    return states;
  }

  const pacchetto = student.pacchettoAttivo;
  
  // Usa gli stati dal database
  let statiDb = pacchetto.stati || [];
  
  // Se non ci sono stati nel DB, mostra "Sconosciuto"
  if (!Array.isArray(statiDb) || statiDb.length === 0) {
    states.push({ type: 'inactive', label: 'Stato Sconosciuto' });
    return states;
  }
  
  // LOGICA CHIUSO: se presente, mostra SOLO "Chiuso"
  if (statiDb.includes('CHIUSO')) {
    states.push({ type: 'closed', label: 'Chiuso' });
    return states;
  }
  
  // Mapping stati DB -> label e type per CSS
  const statoMapping = {
    'ATTIVO': { type: 'success', label: 'Attivo' },
    'DA_RINNOVARE': { type: 'warning', label: 'Da Rinnovare' },
    'SCADUTO': { type: 'danger', label: 'Scaduto' },
    'ESAURITO': { type: 'danger', label: 'Esaurito' },
    'NEGATIVO': { type: 'danger', label: 'Negativo' },
    'DA_PAGARE': { type: 'payment', label: 'Da Pagare' },
    'PAGATO': { type: 'paid', label: 'Pagato' },
  };
  
  // Converti ogni stato DB in oggetto per template
  for (const stato of statiDb) {
    const mapped = statoMapping[stato];
    if (mapped) {
      states.push(mapped);
    }
  }
  
  // Fallback se nessuno stato mappato
  if (states.length === 0) {
    states.push({ type: 'inactive', label: 'Sconosciuto' });
  }
  
  return states;
};

// ✅ Pallino rosso se QUALCHE pacchetto è SCADUTO + DA_PAGARE
const hasPendingPayment = (student) => {
  return student.hasPacchettoScadutoDaPagare === true;
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

/* ATTIVO - Verde */
.state-success {
  background: rgba(45, 206, 137, 0.15);
  color: #2dce89;
}

/* DA_RINNOVARE - Arancione */
.state-warning {
  background: rgba(251, 99, 64, 0.15);
  color: #fb6340;
}

/* SCADUTO, ESAURITO, NEGATIVO - Rosso */
.state-danger {
  background: rgba(245, 54, 92, 0.15);
  color: #f5365c;
}

/* Nessun Pacchetto / Sconosciuto - Grigio chiaro */
.state-inactive {
  background: rgba(131, 146, 171, 0.15);
  color: #8392ab;
}

/* CHIUSO - Grigio scuro */
.state-closed {
  background: rgba(52, 71, 103, 0.15);
  color: #344767;
}

/* DA_PAGARE - Giallo */
.state-payment {
  background: rgba(251, 191, 36, 0.15);
  color: #d97706;
}

/* PAGATO - Blu */
.state-paid {
  background: rgba(94, 114, 228, 0.15);
  color: #5e72e4;
}

/* ✅ Pallina rossa per pacchetti scaduti e da pagare */
.payment-dot {
  width: 10px;
  height: 10px;
  background: #f5365c;
  border-radius: 50%;
  display: inline-block;
  margin-left: 6px;
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
