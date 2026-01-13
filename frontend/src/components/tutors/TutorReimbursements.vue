<template>
  <div class="reimbursements-section">
    <!-- Header -->
    <div class="section-header">
      <h3>💼 Rimborsi</h3>
      <button class="btn-primary btn-small" @click="openCreateModal">
        ➕ Nuovo Rimborso
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <div class="summary-card">
        <span class="label">💰 Totale Rimborsato</span>
        <span class="value">€{{ formatCurrency(totalPaid) }}</span>
      </div>
      <div class="summary-card danger">
        <span class="label">🔴 Da Rimborsare</span>
        <span class="value">€{{ formatCurrency(totalPending) }}</span>
        <span class="sub-value" v-if="pendingCount > 0">{{ pendingCount }} rimborsi</span>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="reimbursements-table" v-if="reimbursements.length > 0">
        <thead>
          <tr>
            <th>Data</th>
            <th>Descrizione</th>
            <th>Importo</th>
            <th>Pagato</th>
            <th>Residuo</th>
            <th>Stato</th>
            <th>Pagamenti</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in reimbursements" :key="item.id">
            <td>{{ formatDate(item.dataRichiesta) }}</td>
            <td class="font-bold">{{ item.descrizione }}</td>
            <td>€{{ formatCurrency(item.importo) }}</td>
            <td class="text-success">€{{ formatCurrency(item.importoPagato) }}</td>
            <td class="text-danger">€{{ formatCurrency(getResiduo(item)) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(item.stato)]">
                {{ getStatusLabel(item.stato) }}
              </span>
            </td>
            <td>
              <!-- Lista pagamenti (movimenti contabili) -->
              <div v-if="getPayments(item).length > 0" class="payments-list">
                <div v-for="payment in getPayments(item)" :key="payment.id" class="payment-item">
                  <span class="payment-date">{{ formatDate(payment.data) }}</span>
                  <span class="payment-amount">€{{ formatCurrency(payment.importo) }}</span>
                  <span class="payment-method">{{ payment.metodoPagamento }}</span>
                  <button 
                    class="btn-icon-small btn-danger-small" 
                    title="Elimina pagamento"
                    @click="deletePaymentItem(item, payment)"
                  >🗑️</button>
                </div>
              </div>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <div class="actions">
                <button 
                  v-if="item.stato !== 'PAGATO'" 
                  class="btn-icon btn-pay" 
                  title="Paga"
                  @click="openPayModal(item)"
                >💰</button>
                <button 
                  v-if="item.stato === 'DA_PAGARE'" 
                  class="btn-icon" 
                  title="Modifica"
                  @click="openEditModal(item)"
                >✏️</button>
                <button 
                  class="btn-icon btn-danger" 
                  title="Elimina rimborso"
                  @click="deleteReimbursement(item)"
                >🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <p>Nessun rimborso registrato</p>
        <button class="btn-outline btn-small" @click="openCreateModal">
          Aggiungi il primo rimborso
        </button>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ isEditing ? '✏️ Modifica Rimborso' : '➕ Nuovo Rimborso' }}</h3>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Importo (€) *</label>
              <input 
                type="number" 
                v-model="form.importo" 
                step="0.01" 
                min="0"
                placeholder="50.00"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Descrizione *</label>
              <input 
                type="text" 
                v-model="form.descrizione" 
                placeholder="Es: Trasferta Milano, Materiale didattico..."
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Note</label>
              <textarea 
                v-model="form.note" 
                placeholder="Note aggiuntive (opzionale)"
                class="form-input"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeModal">Annulla</button>
            <button 
              class="btn-primary" 
              @click="saveReimbursement"
              :disabled="!isFormValid"
            >
              {{ isEditing ? 'Salva' : 'Crea Rimborso' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Pay Modal -->
    <Teleport to="body">
      <div v-if="showPayModal" class="modal-overlay" @click.self="closePayModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>💰 Paga Rimborso</h3>
            <button class="btn-close" @click="closePayModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="pay-info">
              <span class="label">Rimborso:</span>
              <span class="value">{{ selectedItem?.descrizione }}</span>
            </div>
            <div class="pay-info">
              <span class="label">Totale:</span>
              <span class="value">€{{ formatCurrency(selectedItem?.importo) }}</span>
            </div>
            <div class="pay-info">
              <span class="label">Già pagato:</span>
              <span class="value text-success">€{{ formatCurrency(selectedItem?.importoPagato) }}</span>
            </div>
            <div class="pay-info highlight">
              <span class="label">Residuo:</span>
              <span class="value text-danger">€{{ formatCurrency(getResiduo(selectedItem)) }}</span>
            </div>
            <hr />
            <div class="form-group">
              <label>Importo da pagare (€)</label>
              <input 
                type="number" 
                v-model="payForm.importo" 
                step="0.01" 
                :max="getResiduo(selectedItem)"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Metodo Pagamento</label>
              <select v-model="payForm.metodo" class="form-input">
                <option value="BONIFICO">Bonifico</option>
                <option value="CONTANTI">Contanti</option>
                <option value="POS">POS</option>
                <option value="ALTRO">Altro</option>
              </select>
            </div>
            <div class="form-group">
              <label>Data Pagamento</label>
              <input 
                type="date" 
                v-model="payForm.dataPagamento" 
                class="form-input"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closePayModal">Annulla</button>
            <button 
              class="btn-primary" 
              @click="confirmPay"
              :disabled="payForm.importo <= 0 || payLoading"
            >
              {{ payLoading ? 'Salvataggio...' : 'Conferma Pagamento' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';

const props = defineProps({
  tutorId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['refresh']);

const reimbursements = ref([]);
const loading = ref(false);
const showModal = ref(false);
const showPayModal = ref(false);
const isEditing = ref(false);
const selectedItem = ref(null);
const payLoading = ref(false);

const form = ref({
  importo: '',
  descrizione: '',
  note: ''
});

const payForm = ref({
  importo: 0,
  metodo: 'CONTANTI',
  dataPagamento: new Date().toISOString().split('T')[0]
});

// Computed
const totalPaid = computed(() => 
  reimbursements.value.reduce((sum, r) => sum + parseFloat(r.importoPagato || 0), 0)
);

const totalPending = computed(() => 
  reimbursements.value.reduce((sum, r) => sum + getResiduo(r), 0)
);

const pendingCount = computed(() => 
  reimbursements.value.filter(r => r.stato !== 'PAGATO').length
);

const isFormValid = computed(() => 
  form.value.importo > 0 && form.value.descrizione.trim().length > 0
);

// Methods
async function fetchReimbursements() {
  loading.value = true;
  try {
    const response = await api.get(`/reimbursements/tutor/${props.tutorId}`);
    reimbursements.value = response.data.data || [];
  } catch (error) {
    console.error('Errore caricamento rimborsi:', error);
  } finally {
    loading.value = false;
  }
}

function getResiduo(item) {
  if (!item) return 0;
  return parseFloat(item.importo) - parseFloat(item.importoPagato || 0);
}

function formatCurrency(val) {
  return Number(val || 0).toFixed(2);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('it-IT');
}

function getStatusClass(stato) {
  switch (stato) {
    case 'PAGATO': return 'status-paid';
    case 'PARZIALE': return 'status-partial';
    default: return 'status-unpaid';
  }
}

function getStatusLabel(stato) {
  switch (stato) {
    case 'PAGATO': return '✅ Pagato';
    case 'PARZIALE': return '⚠️ Parziale';
    default: return '🔴 Da Pagare';
  }
}

function openCreateModal() {
  isEditing.value = false;
  form.value = { importo: '', descrizione: '', note: '' };
  showModal.value = true;
}

function openEditModal(item) {
  isEditing.value = true;
  selectedItem.value = item;
  form.value = {
    importo: item.importo,
    descrizione: item.descrizione,
    note: item.note || ''
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedItem.value = null;
}

function openPayModal(item) {
  selectedItem.value = item;
  payForm.value = {
    importo: getResiduo(item),
    metodo: 'CONTANTI',
    dataPagamento: new Date().toISOString().split('T')[0]
  };
  showPayModal.value = true;
}

function closePayModal() {
  showPayModal.value = false;
  selectedItem.value = null;
}

async function saveReimbursement() {
  try {
    if (isEditing.value) {
      await api.put(`/reimbursements/${selectedItem.value.id}`, form.value);
    } else {
      await api.post('/reimbursements', {
        tutorId: props.tutorId,
        ...form.value
      });
    }
    closeModal();
    await fetchReimbursements();
    emit('refresh');
  } catch (error) {
    alert('Errore: ' + (error.response?.data?.error || error.message));
  }
}

async function confirmPay() {
  // Previeni click multipli
  if (payLoading.value) return;
  payLoading.value = true;
  
  try {
    await api.put(`/reimbursements/${selectedItem.value.id}/pay`, {
      importoPagato: payForm.value.importo,
      metodo: payForm.value.metodo,
      dataPagamento: payForm.value.dataPagamento
    });
    closePayModal();
    await fetchReimbursements();
    emit('refresh');
    alert('✅ Pagamento registrato con successo!');
  } catch (error) {
    alert('Errore: ' + (error.response?.data?.error || error.message));
  } finally {
    payLoading.value = false;
  }
}

async function deleteReimbursement(item) {
  // Controlla se ci sono pagamenti guardando importoPagato
  const hasPayments = parseFloat(item.importoPagato || 0) > 0;
  
  let confirmMessage = `Eliminare il rimborso "${item.descrizione}"?`;
  if (hasPayments) {
    confirmMessage = `⚠️ ATTENZIONE: Il rimborso "${item.descrizione}" ha €${Number(item.importoPagato).toFixed(2)} già pagati.\n\nEliminando il rimborso verranno eliminati anche tutti i pagamenti dalla contabilità.\n\nContinuare?`;
  }
  
  if (!confirm(confirmMessage)) return;
  
  try {
    // Usa sempre force=true per permettere eliminazione in qualsiasi stato
    await api.delete(`/reimbursements/${item.id}?force=true`);
    await fetchReimbursements();
    emit('refresh');
    alert(hasPayments 
      ? '✅ Rimborso e tutti i pagamenti eliminati!' 
      : '✅ Rimborso eliminato!');
  } catch (error) {
    alert('Errore: ' + (error.response?.data?.error || error.message));
  }
}

// Ottieni i pagamenti (movimenti contabili) per un rimborso
function getPayments(item) {
  // I pagamenti sono i movimenti contabili associati al rimborso
  // Il backend ora include movimentiContabili come array (relazione 1:many)
  return item.movimentiContabili || [];
}

// Elimina un singolo pagamento (movimento contabile)
async function deletePaymentItem(reimbursement, payment) {
  if (!confirm(`Eliminare il pagamento di €${Number(payment.importo).toFixed(2)} del ${formatDate(payment.data)}?`)) return;
  
  try {
    await api.delete(`/reimbursements/${reimbursement.id}/payments/${payment.id}`);
    await fetchReimbursements();
    emit('refresh');
    alert('✅ Pagamento eliminato e rimborso aggiornato!');
  } catch (error) {
    alert('Errore: ' + (error.response?.data?.error || error.message));
  }
}

onMounted(() => {
  fetchReimbursements();
});
</script>

<style scoped>
.reimbursements-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  color: #344767;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-card.danger { border-left: 4px solid #f5365c; }
.summary-card .label { font-size: 12px; color: #8392ab; font-weight: 600; text-transform: uppercase; }
.summary-card .value { font-size: 20px; font-weight: 700; color: #344767; }
.summary-card .sub-value { font-size: 12px; color: #f5365c; }

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

.reimbursements-table {
  width: 100%;
  border-collapse: collapse;
}

.reimbursements-table th {
  background: #f6f9fc;
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  color: #8392ab;
  text-transform: uppercase;
  font-weight: 600;
}

.reimbursements-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  color: #344767;
}

.reimbursements-table tr:last-child td { border-bottom: none; }

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-paid { background: rgba(45, 206, 137, 0.1); color: #2dce89; }
.status-unpaid { background: rgba(245, 54, 92, 0.1); color: #f5365c; }
.status-partial { background: rgba(251, 99, 64, 0.1); color: #fb6340; }

.font-bold { font-weight: 600; }
.text-success { color: #2dce89; font-weight: 600; }
.text-danger { color: #f5365c; font-weight: 600; }

.actions { display: flex; gap: 8px; }

.btn-icon {
  background: none;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover { background: #f8f9fa; }
.btn-pay { border-color: #2dce89; color: #2dce89; }
.btn-danger { border-color: #f5365c; color: #f5365c; }
.btn-danger:hover { background: rgba(245, 54, 92, 0.1); }

/* Payments List */
.payments-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.payment-date { color: #8898aa; }
.payment-amount { font-weight: 600; color: #2dce89; }
.payment-method { color: #8898aa; font-style: italic; }

.btn-icon-small {
  background: none;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
  margin-left: auto;
}

.btn-icon-small:hover { opacity: 1; }
.btn-danger-small { color: #f5365c; }

.text-muted { color: #8392ab; }

.empty-state {
  padding: 48px;
  text-align: center;
  color: #8392ab;
}

.empty-state p { margin-bottom: 16px; }

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #5e72e4 0%, #825ee4 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(94, 114, 228, 0.4); }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.btn-secondary {
  background: white;
  color: #344767;
  border: 1px solid #e9ecef;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-small { padding: 8px 16px; font-size: 13px; }

.btn-outline {
  background: transparent;
  border: 1px solid #5e72e4;
  color: #5e72e4;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-container {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 { margin: 0; font-size: 18px; color: #344767; }

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #8392ab;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #344767;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  color: #344767;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #5e72e4;
}

.pay-info {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.pay-info .label { color: #8392ab; }
.pay-info .value { font-weight: 600; color: #344767; }
.pay-info.highlight { background: #f6f9fc; padding: 12px; border-radius: 8px; margin: 8px 0; }

hr { border: none; border-top: 1px solid #e9ecef; margin: 16px 0; }
</style>
