<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>🔄 Nuovo Pacchetto</h3>
            <p class="student-name">{{ student.firstName }} {{ student.lastName }}</p>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Form Creazione Pacchetto -->
          <form @submit.prevent="handleSubmit" class="package-form">
            
            <!-- Seleziona Pacchetto Standard -->
            <div class="form-group">
              <label class="form-label">
                Seleziona Pacchetto <span class="required">*</span>
              </label>
              
              <div v-if="loadingStandardPackages" class="loading-state">
                <div class="spinner"></div>
                <span>Caricamento...</span>
              </div>
              
              <select 
                v-else
                v-model="selectedStandardPackage" 
                class="form-select" 
                required
              >
                <option :value="null">-- Seleziona un pacchetto --</option>
                <optgroup 
                  v-for="(packages, tipo) in groupedPackages" 
                  :key="tipo" 
                  :label="tipo === 'ORE' ? '⏱️ Pacchetti Ore' : '📅 Pacchetti Mensili'"
                >
                  <option 
                    v-for="pkg in packages" 
                    :key="pkg.id" 
                    :value="pkg"
                  >
                    {{ pkg.nome }} - €{{ formatCurrency(pkg.prezzoStandard) }}
                  </option>
                </optgroup>
              </select>
            </div>

            <!-- Info Pacchetto Selezionato -->
            <div v-if="selectedStandardPackage" class="package-preview">
              <div class="preview-header">
                <span class="preview-label">Pacchetto selezionato</span>
                <span class="preview-type">{{ selectedStandardPackage.tipo }}</span>
              </div>
              <div class="preview-details">
                <div class="detail-item">
                  <span class="detail-label">Nome</span>
                  <span class="detail-value">{{ selectedStandardPackage.nome }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Quantità</span>
                  <span class="detail-value">
                    <template v-if="selectedStandardPackage.tipo === 'ORE'">
                      {{ selectedStandardPackage.oreIncluse }}h
                    </template>
                    <template v-else>
                      {{ selectedStandardPackage.giorniInclusi }} giorni 
                      ({{ (selectedStandardPackage.giorniInclusi * selectedStandardPackage.orarioGiornaliero).toFixed(1) }}h totali)
                    </template>
                  </span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Prezzo</span>
                  <span class="detail-value price">€{{ formatCurrency(selectedStandardPackage.prezzoStandard) }}</span>
                </div>
              </div>
            </div>

            <!-- Data Inizio -->
            <div class="form-group">
              <label class="form-label">
                Data Inizio <span class="required">*</span>
              </label>
              <input
                v-model="form.dataInizio"
                type="date"
                class="form-input"
                :min="minStartDate"
                required
              />
            </div>

            <!-- Prezzo Personalizzato (opzionale) -->
            <div class="form-group">
              <label class="form-label">
                Prezzo (€)
              </label>
              <input
                v-model.number="form.prezzoTotale"
                type="number"
                step="0.01"
                min="0.01"
                class="form-input"
                placeholder="Modifica prezzo se necessario"
              />
            </div>

            <!-- Pagamento Immediato -->
            <div class="payment-toggle">
              <label class="toggle-label">
                <input
                  v-model="form.registraPagamentoImmediato"
                  type="checkbox"
                  class="toggle-checkbox"
                />
                <span class="toggle-text">💳 Registra pagamento immediato</span>
              </label>
            </div>

            <!-- Dettagli Pagamento -->
            <div v-if="form.registraPagamentoImmediato" class="payment-details">
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Importo (€)</label>
                  <input
                    v-model.number="form.importoPagamento"
                    type="number"
                    step="0.01"
                    min="0.01"
                    :max="form.prezzoTotale"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Metodo</label>
                  <select v-model="form.metodoPagamento" class="form-select">
                    <option value="CONTANTI">Contanti</option>
                    <option value="BONIFICO">Bonifico</option>
                    <option value="POS">POS</option>
                    <option value="ASSEGNO">Assegno</option>
                  </select>
                </div>
              </div>
              <label class="checkbox-inline">
                <input v-model="form.richiedeFattura" type="checkbox" />
                <span>Richiede fattura</span>
              </label>
            </div>

            <!-- Note -->
            <div class="form-group">
              <label class="form-label">Note (opzionale)</label>
              <textarea
                v-model="form.note"
                class="form-textarea"
                rows="3"
                placeholder="Eventuali annotazioni..."
              ></textarea>
            </div>

            <!-- Riepilogo -->
            <div v-if="selectedStandardPackage" class="summary">
              <div class="summary-row">
                <span>Periodo validità</span>
                <strong>{{ formatDate(form.dataInizio) }} - {{ formatDate(dataScadenzaCalcolata) }}</strong>
              </div>
              <div class="summary-row total">
                <span>Totale</span>
                <strong>€{{ formatCurrency(form.prezzoTotale) }}</strong>
              </div>
              <div v-if="form.registraPagamentoImmediato" class="summary-row payment">
                <span>Pagamento iniziale</span>
                <strong>€{{ formatCurrency(form.importoPagamento) }}</strong>
              </div>
              <div v-if="form.registraPagamentoImmediato && residuoDopoPagamento > 0" class="summary-row residuo">
                <span>Residuo</span>
                <strong>€{{ formatCurrency(residuoDopoPagamento) }}</strong>
              </div>
            </div>

            <!-- Buttons -->
            <div class="modal-actions">
              <button type="button" @click="$emit('close')" class="btn btn-secondary">
                Annulla
              </button>
              <button type="submit" class="btn btn-primary" :disabled="submitting || !selectedStandardPackage">
                <span v-if="submitting">Creazione...</span>
                <span v-else>✓ Crea Pacchetto</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>



<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { packagesAPI, standardPackagesAPI } from '@/services/api';

// ========================================
// PROPS & EMITS
// ========================================

const props = defineProps({
  packageData: {
    type: Object,
    required: false,
    default: null
  },
  student: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'renewed']);

// ========================================
// STATE
// ========================================

const submitting = ref(false);
const loadingStandardPackages = ref(false);
const standardPackages = ref([]);
const selectedStandardPackage = ref(null);

const form = ref({
  dataInizio: '',
  prezzoTotale: 0,
  registraPagamentoImmediato: false,
  importoPagamento: 0,
  metodoPagamento: 'CONTANTI',
  richiedeFattura: false,
  note: ''
});

// ========================================
// COMPUTED
// ========================================

const minStartDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});

// Raggruppa pacchetti per tipo
const groupedPackages = computed(() => {
  const groups = {
    'ORE': [],
    'MENSILE': []
  };

  standardPackages.value.forEach(pkg => {
    if (pkg.tipo === 'ORE' || pkg.tipo === 'MENSILE') {
      groups[pkg.tipo].push(pkg);
    }
  });

  return groups;
});

const dataScadenzaCalcolata = computed(() => {
  if (!form.value.dataInizio || !selectedStandardPackage.value) return '';

  const dataInizio = new Date(form.value.dataInizio);
  let durataGiorni = 0;

  if (selectedStandardPackage.value.tipo === 'ORE') {
    durataGiorni = parseInt(selectedStandardPackage.value.durataGiorni || 30);
  } else if (selectedStandardPackage.value.tipo === 'MENSILE') {
    durataGiorni = parseInt(selectedStandardPackage.value.giorniInclusi || 30);
  }

  const dataScadenza = new Date(dataInizio);
  dataScadenza.setDate(dataScadenza.getDate() + durataGiorni);

  return dataScadenza.toISOString().split('T')[0];
});

const residuoDopoPagamento = computed(() => {
  if (!form.value.registraPagamentoImmediato) return 0;
  return Math.max(0, form.value.prezzoTotale - form.value.importoPagamento);
});

// ========================================
// WATCHERS
// ========================================

watch(selectedStandardPackage, (newPackage) => {
  if (!newPackage) return;

  // Auto-compila prezzo
  form.value.prezzoTotale = parseFloat(newPackage.prezzoStandard || 0);
  form.value.importoPagamento = form.value.prezzoTotale;
});

// ========================================
// FUNCTIONS
// ========================================

const formatCurrency = (value) => {
  return parseFloat(value || 0).toFixed(2);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const loadStandardPackages = async () => {
  loadingStandardPackages.value = true;
  try {
    const response = await standardPackagesAPI.getAll();
    standardPackages.value = response.data.packages || [];
  } catch (error) {
    console.error('Errore caricamento pacchetti standard:', error);
    alert('❌ Errore durante il caricamento dei pacchetti');
  } finally {
    loadingStandardPackages.value = false;
  }
};

const handleSubmit = async () => {
  if (!selectedStandardPackage.value) {
    alert('⚠️ Seleziona un pacchetto');
    return;
  }

  if (!form.value.dataInizio) {
    alert('⚠️ Seleziona la data di inizio');
    return;
  }

  if (!form.value.prezzoTotale || form.value.prezzoTotale <= 0) {
    alert('⚠️ Inserisci un prezzo valido');
    return;
  }

  if (form.value.registraPagamentoImmediato) {
    if (!form.value.importoPagamento || form.value.importoPagamento <= 0) {
      alert('⚠️ Inserisci un importo pagamento valido');
      return;
    }
    if (form.value.importoPagamento > form.value.prezzoTotale) {
      alert('⚠️ L\'importo non può superare il prezzo totale');
      return;
    }
  }

  submitting.value = true;

  try {
    const pkg = selectedStandardPackage.value;
    const studentName = `${props.student.firstName} ${props.student.lastName}`;
    const nomePacchetto = `${studentName} - ${pkg.nome}`;

    // Payload base
    const payload = {
      studentId: props.student.id,
      standardPackageId: pkg.id,
      nome: nomePacchetto,
      tipo: pkg.tipo,
      dataInizio: new Date(form.value.dataInizio).toISOString(),
      prezzoTotale: parseFloat(form.value.prezzoTotale),
      note: form.value.note || null,
    };

    // Campi specifici per tipo
    if (pkg.tipo === 'ORE') {
      payload.oreAcquistate = parseFloat(pkg.oreIncluse);
      payload.durataGiorni = parseInt(pkg.durataGiorni || 30);
      payload.oreResiduo = parseFloat(pkg.oreIncluse);
    } else if (pkg.tipo === 'MENSILE') {
      payload.giorniAcquistati = parseInt(pkg.giorniInclusi);
      payload.orarioGiornaliero = parseFloat(pkg.orarioGiornaliero);
      payload.giorniResiduo = parseInt(pkg.giorniInclusi);
      const oreTotali = payload.giorniAcquistati * payload.orarioGiornaliero;
      payload.oreAcquistate = oreTotali;
      payload.oreResiduo = oreTotali;
    }

    // Calcola data scadenza
    const dataInizio = new Date(form.value.dataInizio);
    const durataGiorni = pkg.tipo === 'ORE' 
      ? parseInt(pkg.durataGiorni || 30)
      : parseInt(pkg.giorniInclusi);
    const dataScadenza = new Date(dataInizio);
    dataScadenza.setDate(dataScadenza.getDate() + durataGiorni);
    payload.dataScadenza = dataScadenza.toISOString();

    // Aggiungi pagamento se richiesto
    if (form.value.registraPagamentoImmediato) {
      const importoPagamento = parseFloat(form.value.importoPagamento);
      const prezzoTotale = parseFloat(form.value.prezzoTotale);
      
      payload.pagamentoIniziale = {
        importo: importoPagamento,
        metodoPagamento: form.value.metodoPagamento,
        tipoPagamento: importoPagamento >= prezzoTotale ? 'SALDO' : 'ACCONTO',
        dataPagamento: new Date().toISOString(),
        richiedeFattura: form.value.richiedeFattura
      };
    }

    await packagesAPI.create(payload);
    
    alert('✅ Pacchetto creato con successo!');
    emit('renewed');
    emit('close');
  } catch (error) {
    console.error('Errore creazione pacchetto:', error);
    alert('❌ Errore durante la creazione del pacchetto');
  } finally {
    submitting.value = false;
  }
};

// ========================================
// LIFECYCLE
// ========================================

onMounted(async () => {
  await loadStandardPackages();

  // Se c'è un pacchetto precedente, imposta data dopo scadenza
  if (props.packageData?.dataScadenza) {
    const scadenza = new Date(props.packageData.dataScadenza);
    const domaniDopoScadenza = new Date(scadenza);
    domaniDopoScadenza.setDate(domaniDopoScadenza.getDate() + 1);
    form.value.dataInizio = domaniDopoScadenza.toISOString().split('T')[0];
  } else {
    // Altrimenti domani
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    form.value.dataInizio = domani.toISOString().split('T')[0];
  }
});
</script>



<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
}

.modal-title h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
}

.student-name {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

.btn-close {
  padding: 6px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Form */
.package-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top-color: #4f46e5;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Package Preview */
.package-preview {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(124, 58, 237, 0.05));
  border: 1px solid rgba(79, 70, 229, 0.2);
  border-radius: 10px;
  padding: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(79, 70, 229, 0.1);
}

.preview-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.preview-type {
  padding: 4px 12px;
  background: #4f46e5;
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.preview-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #111827;
  font-weight: 600;
}

.detail-value.price {
  color: #4f46e5;
  font-size: 16px;
}

/* Payment Toggle */
.payment-toggle {
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4f46e5;
}

.toggle-text {
  user-select: none;
}

/* Payment Details */
.payment-details {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkbox-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}

.checkbox-inline input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #4f46e5;
}

/* Summary */
.summary {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05), rgba(124, 58, 237, 0.05));
  padding: 16px;
  border-radius: 10px;
  border: 1px solid rgba(79, 70, 229, 0.2);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #374151;
}

.summary-row strong {
  color: #111827;
  font-weight: 600;
}

.summary-row.total {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid rgba(79, 70, 229, 0.1);
  font-size: 15px;
}

.summary-row.total strong {
  color: #4f46e5;
  font-size: 18px;
}

.summary-row.payment {
  color: #059669;
}

.summary-row.payment strong {
  color: #059669;
}

.summary-row.residuo {
  color: #dc2626;
}

.summary-row.residuo strong {
  color: #dc2626;
}

/* Modal Actions */
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-body {
    padding: 16px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>


