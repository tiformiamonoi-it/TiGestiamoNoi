<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>💳 Registra Pagamento</h3>
            <p class="package-name">{{ packageData.nome }}</p>
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
          <!-- Info Pacchetto -->
          <div class="package-info-box">
            <div class="info-row">
              <span class="label">Costo Totale:</span>
              <span class="value">€{{ formatCurrency(packageData.prezzoTotale) }}</span>
            </div>
            <div class="info-row">
              <span class="label">Già Pagato:</span>
              <span class="value paid">€{{ formatCurrency(packageData.importoPagato) }}</span>
            </div>
            <div class="info-row highlight">
              <span class="label">Residuo da Pagare:</span>
              <span class="value unpaid">€{{ formatCurrency(packageData.importoResiduo) }}</span>
            </div>
          </div>

          <!-- Alert se già saldato -->
          <div v-if="parseFloat(packageData.importoResiduo) <= 0" class="alert alert-success">
            ✅ Il pacchetto è già completamente saldato
          </div>

          <!-- Form Pagamento -->
          <form v-else @submit.prevent="handleSubmit" class="payment-form">
           <!-- Tipo Pagamento -->
                <div class="form-group">
                <label class="form-label">
                    Tipo Pagamento <span class="required">*</span>
                </label>
                <select v-model="form.tipoPagamento" class="form-select" required>
                    <option value="">Seleziona...</option>
                    <option 
                    v-for="option in tipoOptions" 
                    :key="option.value" 
                    :value="option.value"
                    >
                    {{ option.label }}
                    </option>
                </select>
                
                <!-- ✅ Messaggio di aiuto dinamico -->
                <div v-if="helpMessage" class="help-message">
                    {{ helpMessage }}
                </div>
                </div>


            <!-- Importo -->
            <div class="form-group">
              <label class="form-label">
                Importo (€) <span class="required">*</span>
              </label>
              <input
                v-model.number="form.importo"
                type="number"
                step="0.01"
                min="0.01"
                :max="parseFloat(packageData.importoResiduo)"
                class="form-input"
                placeholder="Es: 50.00"
                required
              />
              <small class="form-hint">
                Max: €{{ formatCurrency(packageData.importoResiduo) }}
              </small>
            </div>

            <!-- Metodo Pagamento -->
            <div class="form-group">
              <label class="form-label">
                Metodo Pagamento <span class="required">*</span>
              </label>
              <select v-model="form.metodoPagamento" class="form-select" required>
                <option value="">Seleziona...</option>
                <option value="CONTANTI">Contanti</option>
                <option value="BONIFICO">Bonifico</option>
                <option value="POS">POS/Carta</option>
                <option value="ASSEGNO">Assegno</option>
                <option value="ALTRO">Altro</option>
              </select>
            </div>

            <!-- Data Pagamento -->
            <div class="form-group">
              <label class="form-label">
                Data Pagamento <span class="required">*</span>
              </label>
              <input
                v-model="form.dataPagamento"
                type="date"
                class="form-input"
                :max="today"
                required
              />
            </div>

            <!-- Richiede Fattura -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input
                  v-model="form.richiedeFattura"
                  type="checkbox"
                  class="form-checkbox"
                />
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
                placeholder="Eventuali annotazioni sul pagamento..."
              ></textarea>
            </div>

            <!-- Riepilogo Pre-Salvataggio -->
            <div class="summary-box">
              <h4>📊 Riepilogo</h4>
              <div class="summary-item">
                <span>Importo da pagare:</span>
                <strong>€{{ formatCurrency(form.importo || 0) }}</strong>
              </div>
              <div class="summary-item">
                <span>Residuo dopo pagamento:</span>
                <strong class="residuo-finale">
                  €{{ formatCurrency(Math.max(0, parseFloat(packageData.importoResiduo) - (form.importo || 0))) }}
                </strong>
              </div>
              <div v-if="willBePaid" class="summary-item success">
                <span>✅ Il pacchetto sarà completamente saldato</span>
              </div>
            </div>

            <!-- Buttons -->
            <div class="modal-footer">
              <button type="button" @click="$emit('close')" class="btn-secondary">
                Annulla
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                <span v-if="submitting">Salvataggio...</span>
                <span v-else>💾 Salva Pagamento</span>
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
import { paymentsAPI } from '@/services/api';

// ========================================
// PROPS & EMITS
// ========================================

const props = defineProps({
  packageData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'saved']);

// ========================================
// STATE
// ========================================

const submitting = ref(false);

const form = ref({
  tipoPagamento: '',
  importo: parseFloat(props.packageData.importoResiduo) || 0,
  metodoPagamento: '',
  dataPagamento: new Date().toISOString().split('T')[0],
  richiedeFattura: false,
  note: ''
});

// ========================================
// COMPUTED
// ========================================

const today = computed(() => {
  return new Date().toISOString().split('T')[0];
});

const willBePaid = computed(() => {
  const residuo = parseFloat(props.packageData.importoResiduo);
  const importo = parseFloat(form.value.importo || 0);
  return residuo - importo <= 0;
});

// ✅ Numero di pagamenti già registrati
const existingPaymentsCount = computed(() => {
  return props.packageData.pagamenti?.length || 0;
});

// ✅ È il primo pagamento?
const isFirstPayment = computed(() => {
  return existingPaymentsCount.value === 0;
});

// ✅ Suggerimento intelligente del tipo
const suggestedType = computed(() => {
  const residuo = parseFloat(props.packageData.importoResiduo);
  const importo = parseFloat(form.value.importo || 0);

  // Se l'importo è uguale al residuo → SALDO
  if (Math.abs(importo - residuo) < 0.01) {
    return 'SALDO';
  }

  // Se è il primo pagamento e importo < residuo → ACCONTO
  if (isFirstPayment.value && importo < residuo) {
    return 'ACCONTO';
  }

  // Se ci sono già pagamenti e importo < residuo → INTEGRAZIONE
  if (!isFirstPayment.value && importo < residuo) {
    return 'INTEGRAZIONE';
  }

  return 'SALDO';
});

// ✅ Opzioni tipo pagamento dinamiche
const tipoOptions = computed(() => {
  const residuo = parseFloat(props.packageData.importoResiduo);
  const importo = parseFloat(form.value.importo || 0);

  const options = [];

  // Se importo < residuo → mostra sia Acconto che Integrazione
  if (importo < residuo) {
    options.push({ value: 'ACCONTO', label: 'Acconto' });
    options.push({ value: 'INTEGRAZIONE', label: 'Integrazione' });
  }

  // Se importo == residuo (sempre disponibile SALDO)
  if (Math.abs(importo - residuo) < 0.01) {
    options.push({ value: 'SALDO', label: 'Saldo' });
  }

  return options;
});

// ✅ Messaggio di aiuto dinamico
const helpMessage = computed(() => {
  const residuo = parseFloat(props.packageData.importoResiduo);
  const importo = parseFloat(form.value.importo || 0);

  if (Math.abs(importo - residuo) < 0.01) {
    return '✅ L\'importo corrisponde al residuo totale (Saldo finale)';
  }

  if (importo < residuo) {
    if (isFirstPayment.value) {
      return '💡 Consigliato "Acconto" per il primo pagamento parziale';
    } else {
      return '💡 Consigliato "Integrazione" per i pagamenti successivi';
    }
  }

  return '';
});

// ========================================
// WATCHERS
// ========================================

// ✅ Auto-imposta tipo pagamento in base all'importo
watch(() => form.value.importo, (newImporto) => {
  if (newImporto && newImporto > 0) {
    // Auto-seleziona il tipo suggerito
    form.value.tipoPagamento = suggestedType.value;
  }
});

// ========================================
// FUNCTIONS
// ========================================

const formatCurrency = (value) => {
  return parseFloat(value || 0).toFixed(2);
};

const handleSubmit = async () => {
  // Validazione importo
  if (!form.value.importo || form.value.importo <= 0) {
    alert('⚠️ Inserisci un importo valido');
    return;
  }

  const residuo = parseFloat(props.packageData.importoResiduo);
  const importo = parseFloat(form.value.importo);

  if (importo > residuo) {
    alert('⚠️ L\'importo non può superare il residuo da pagare');
    return;
  }

  // ✅ Validazione tipo pagamento in base all'importo
  if (form.value.tipoPagamento === 'SALDO' && importo < residuo) {
    alert('⚠️ Non puoi selezionare "Saldo" se l\'importo è inferiore al residuo');
    return;
  }

  if (form.value.tipoPagamento === 'ACCONTO' && Math.abs(importo - residuo) < 0.01) {
    alert('⚠️ Non puoi selezionare "Acconto" se l\'importo corrisponde al saldo totale');
    return;
  }

  if (form.value.tipoPagamento === 'INTEGRAZIONE' && Math.abs(importo - residuo) < 0.01) {
    alert('⚠️ Non puoi selezionare "Integrazione" se l\'importo corrisponde al saldo totale');
    return;
  }

  submitting.value = true;

  try {
    const payload = {
      packageId: props.packageData.id,
      tipoPagamento: form.value.tipoPagamento,
      importo: parseFloat(form.value.importo),
      metodoPagamento: form.value.metodoPagamento,
      dataPagamento: new Date(form.value.dataPagamento).toISOString(),
      richiedeFattura: form.value.richiedeFattura,
      note: form.value.note || null
    };

    await paymentsAPI.create(payload);
    
    alert('✅ Pagamento registrato con successo!');
    emit('saved');
    emit('close');
  } catch (error) {
    console.error('Errore registrazione pagamento:', error);
    alert('❌ Errore durante la registrazione del pagamento');
  } finally {
    submitting.value = false;
  }
};

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
  // Precompila importo con residuo
  form.value.importo = parseFloat(props.packageData.importoResiduo);
  // Auto-seleziona tipo suggerito
  form.value.tipoPagamento = suggestedType.value;
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

/* Modal Container */
.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 2px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-title h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 700;
}

.package-name {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.btn-close {
  padding: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Modal Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* Package Info Box */
.package-info-box {
  background: #f9fafb;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  border-left: 4px solid #5e72e4;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-row.highlight {
  padding-top: 12px;
  margin-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.info-row .label {
  color: #6b7280;
}

.info-row .value {
  font-weight: 600;
  color: #111827;
}

.info-row .value.paid {
  color: #2dce89;
}

.info-row .value.unpaid {
  color: #f5365c;
  font-size: 18px;
}

/* Alert */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-success {
  background: rgba(45, 206, 137, 0.1);
  border: 1px solid #2dce89;
  color: #2dce89;
  font-weight: 600;
}

/* Payment Form */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #f5365c;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.form-hint {
  font-size: 12px;
  color: #9ca3af;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* Summary Box */
.summary-box {
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.05), rgba(118, 75, 162, 0.05));
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(94, 114, 228, 0.2);
}

.summary-box h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #111827;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.summary-item strong {
  font-size: 16px;
  color: #111827;
}

.residuo-finale {
  color: #5e72e4;
}

.summary-item.success {
  color: #2dce89;
  font-weight: 600;
  border-top: 1px solid rgba(45, 206, 137, 0.2);
  margin-top: 8px;
  padding-top: 12px;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 12px 24px;
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
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
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

  .modal-footer {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
/* Help Message */
.help-message {
  margin-top: 8px;
  padding: 10px 12px;
  background: rgba(94, 114, 228, 0.1);
  border-left: 3px solid #5e72e4;
  border-radius: 6px;
  font-size: 13px;
  color: #5e72e4;
  font-weight: 500;
}

</style>
