<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>💰 Paga Compenso</h3>
            <p class="modal-subtitle">Registra pagamenti per i tutor selezionati</p>
          </div>
          <button class="btn-close" @click="close">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Lista Tutor/Mesi -->
          <div v-if="pagamenti.length > 0" class="payment-list-container">
            <div v-for="(p, index) in pagamenti" :key="index" class="payment-group">
              <h4 class="tutor-name">{{ p.tutorName }}</h4>
              <div class="months-list">
                <div v-for="mese in p.mesiDettaglio" :key="mese.date.toString()" class="month-item">
                  <div class="month-row-main">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="mese.selected" />
                      <span>{{ formatMese(mese.date) }}</span>
                    </label>
                    <div class="amount-controls" v-if="mese.selected">
                       <select v-model="mese.status" class="status-select">
                         <option value="PAGATO">Completo</option>
                         <option value="PARZIALE">Parziale</option>
                       </select>
                       <input 
                         type="number" 
                         v-model.number="mese.importo" 
                         class="amount-input" 
                         step="0.01"
                         min="0"
                       />
                       <span class="currency">€</span>
                    </div>
                    <span v-else class="month-amount">{{ mese.importo }}€</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Totale -->
          <div class="total-section">
            <span class="total-label">TOTALE DA PAGARE:</span>
            <span class="total-amount">{{ totaleSelezionato.toFixed(2) }}€</span>
          </div>

          <!-- Form Dati -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Data Pagamento *</label>
              <input type="date" v-model="formData.dataPagamento" class="form-control" />
            </div>
            <div class="form-group">
              <label class="form-label">Metodo Pagamento *</label>
              <select v-model="formData.metodoPagamento" class="form-control">
                <option value="BONIFICO">Bonifico</option>
                <option value="CONTANTI">Contanti</option>
                <option value="ASSEGNO">Assegno</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label class="form-label">Note (opzionale)</label>
              <textarea v-model="formData.note" rows="2" class="form-control"></textarea>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="close" class="btn-secondary">
            Annulla
          </button>
          <button 
            @click="confirmPayment" 
            :disabled="totaleSelezionato <= 0 || isSubmitting"
            class="btn-primary"
          >
            <span v-if="isSubmitting">Salvataggio...</span>
            <span v-else>💾 Registra Pagamenti</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  tutorsToPay: Array, // [{ id, firstName, lastName, mesiNonPagati: [{ date, importo }] }]
});

const emit = defineEmits(['close', 'confirm']);

const isSubmitting = ref(false);

const formData = ref({
  dataPagamento: new Date().toISOString().split('T')[0],
  metodoPagamento: 'BONIFICO',
  note: '',
});

// Struttura interna per gestire selezione
const pagamenti = ref([]);

watch(() => props.tutorsToPay, (newVal) => {
  if (newVal) {
    pagamenti.value = newVal.map(t => ({
      tutorId: t.id,
      tutorName: `${t.firstName} ${t.lastName}`,
      mesiDettaglio: t.mesiNonPagati.map(m => ({
        date: m.date, // Date object
        importo: m.importo,
        originalImporto: m.importo, // Keep track of original
        status: 'PAGATO',
        selected: true, // Default selected
      })),
    }));
  }
}, { immediate: true });

const totaleSelezionato = computed(() => {
  let sum = 0;
  pagamenti.value.forEach(p => {
    p.mesiDettaglio.forEach(m => {
      if (m.selected) sum += Number(m.importo);
    });
  });
  return sum;
});

function formatMese(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}

function close() {
  emit('close');
}

async function confirmPayment() {
  isSubmitting.value = true;
  try {
    // Prepara payload
    const payload = pagamenti.value.map(p => ({
      tutorId: p.tutorId,
      mesi: p.mesiDettaglio.filter(m => m.selected).map(m => ({
        date: m.date,
        importo: m.importo,
        status: m.status
      })),
    })).filter(p => p.mesi.length > 0);

    emit('confirm', {
      pagamenti: payload,
      ...formData.value,
    });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalSlideIn 0.3s ease-out;
  position: relative;
  z-index: 10000;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #344767;
}

.modal-subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #8392ab;
}

.btn-close {
  background: transparent;
  border: none;
  color: #8392ab;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f8f9fa;
  color: #344767;
}

/* Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
}

/* Payment List */
.payment-list-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #e9ecef;
}

.payment-group {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e9ecef;
}

.payment-group:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.tutor-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #344767;
}

.months-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.month-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.month-row-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.amount-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-select {
  padding: 4px 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 12px;
  color: #344767;
}

.amount-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  text-align: right;
  font-family: monospace;
}

.currency {
  font-weight: 600;
  color: #344767;
}

.month-amount {
  font-family: monospace;
  font-weight: 600;
  color: #344767;
}

/* Total Section */
.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 2px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 24px;
}

.total-label {
  font-size: 16px;
  font-weight: 700;
  color: #344767;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #5e72e4;
}

/* Form Styles */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 0;
}

.full-width {
  grid-column: span 2;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 13px;
  color: #344767;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  color: #344767;
}

.form-control:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #344767;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #5e72e4;
}

/* Footer */
.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f8f9fa;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  color: #344767;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8f9fa;
}
</style>
