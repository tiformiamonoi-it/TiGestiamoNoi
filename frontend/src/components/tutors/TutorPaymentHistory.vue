<template>
  <div class="payment-history">
    <!-- Filters -->
    <div class="filters-bar">
      <select v-model="filterPeriod" class="filter-select">
        <option value="12">Ultimo anno</option>
        <option value="6">Ultimi 6 mesi</option>
        <option value="all">Tutto lo storico</option>
      </select>
    </div>

    <!-- Summary -->
    <div class="summary-cards">
      <div class="summary-card">
        <span class="label">💰 Totale Pagato</span>
        <span class="value">€{{ formatCurrency(totalPaid) }}</span>
      </div>
      <div class="summary-card danger">
        <span class="label">🔴 Da Pagare</span>
        <span class="value">€{{ formatCurrency(totalUnpaid) }}</span>
        <span class="sub-value">{{ unpaidCount }} mesi</span>
      </div>
      <div class="summary-card info">
        <span class="label">🎁 Pro Bono</span>
        <span class="value">{{ proBonoCount }} mesi</span>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="history-table">
        <thead>
          <tr>
            <th>Mese</th>
            <th>Totale</th>
            <th>Pagato</th>
            <th>Rimanente</th>
            <th>Stato</th>
            <th>Dettagli</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td class="font-bold">{{ formatMonth(item.mese) }}</td>
            <td>€{{ formatCurrency(item.totalAmount) }}</td>
            <td class="text-success">€{{ formatCurrency(item.paidAmount) }}</td>
            <td class="text-danger">€{{ formatCurrency(item.remainingAmount) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(item)]">
                {{ getStatusLabel(item) }}
              </span>
            </td>
            <td>
              <div v-if="item.payments && item.payments.length > 0" class="payment-details-list">
                <div v-for="p in item.payments" :key="p.id" class="payment-detail-item">
                  <span class="detail-date">{{ formatDate(p.dataPagamento) }}</span>
                  <span class="detail-amount">€{{ formatCurrency(p.importo) }}</span>
                  <span class="detail-method">{{ p.metodo }}</span>
                  <button 
                    class="btn-icon-small btn-danger-text" 
                    title="Elimina Pagamento"
                    @click="$emit('delete-payment', p)"
                  >🗑️</button>
                </div>
              </div>
              <span v-else class="text-muted">-</span>
            </td>
            <td>
              <div class="actions">
                <button 
                  v-if="item.remainingAmount > 0.01" 
                  class="btn-icon btn-pay" 
                  title="Paga Rimanente"
                  @click="$emit('pay', { mese: item.mese, importo: item.remainingAmount })"
                >💰</button>
                <button 
                  class="btn-icon" 
                  title="Dettagli"
                  @click="openDetails(item)"
                >👁️</button>
                <button 
                  v-if="item.paidAmount === 0"
                  class="btn-icon" 
                  title="Modifica Importo"
                  @click="$emit('modify-amount', item)"
                >✏️</button>
                <button 
                  class="btn-icon" 
                  title="Export"
                  @click="$emit('export', item)"
                >📤</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Details Modal -->
    <Teleport to="body">
      <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
        <div class="modal-container">
          <div class="modal-header">
            <h3>Dettagli Compenso - {{ formatMonth(selectedDetailItem?.mese) }}</h3>
            <button class="btn-close" @click="closeDetailsModal">✕</button>
          </div>
          <div class="modal-body">
            <div class="breakdown-list">
              <!-- Singole -->
              <div class="breakdown-item">
                <span>Ore Singole</span>
                <span class="font-bold">{{ selectedDetailItem?.breakdown?.singole?.ore || 0 }}h</span>
                <span class="text-muted">({{ formatCurrency(selectedDetailItem?.breakdown?.singole?.oreImporto) }}€)</span>
              </div>
              <div class="breakdown-item sub-item" v-if="selectedDetailItem?.breakdown?.singole?.mezzeOre > 0">
                <span>Mezze Ore Singole</span>
                <span class="font-bold">{{ selectedDetailItem?.breakdown?.singole?.mezzeOre || 0 }}</span>
                <span class="text-muted">({{ formatCurrency(selectedDetailItem?.breakdown?.singole?.mezzeOreImporto) }}€)</span>
              </div>

              <!-- Gruppo -->
              <div class="breakdown-item">
                <span>Ore Gruppo</span>
                <span class="font-bold">{{ selectedDetailItem?.breakdown?.gruppo?.ore || 0 }}h</span>
                <span class="text-muted">({{ formatCurrency(selectedDetailItem?.breakdown?.gruppo?.oreImporto) }}€)</span>
              </div>
              <div class="breakdown-item sub-item" v-if="selectedDetailItem?.breakdown?.gruppo?.mezzeOre > 0">
                <span>Mezze Ore Gruppo</span>
                <span class="font-bold">{{ selectedDetailItem?.breakdown?.gruppo?.mezzeOre || 0 }}</span>
                <span class="text-muted">({{ formatCurrency(selectedDetailItem?.breakdown?.gruppo?.mezzeOreImporto) }}€)</span>
              </div>

              <!-- Maxi -->
              <div class="breakdown-item">
                <span>Ore Maxi Gruppo</span>
                <span class="font-bold">{{ selectedDetailItem?.breakdown?.maxi?.ore || 0 }}h</span>
                <span class="text-muted">({{ formatCurrency(selectedDetailItem?.breakdown?.maxi?.oreImporto) }}€)</span>
              </div>
              <div class="breakdown-item sub-item" v-if="selectedDetailItem?.breakdown?.maxi?.mezzeOre > 0">
                <span>Mezze Ore Maxi</span>
                <span class="font-bold">{{ selectedDetailItem?.breakdown?.maxi?.mezzeOre || 0 }}</span>
                <span class="text-muted">({{ formatCurrency(selectedDetailItem?.breakdown?.maxi?.mezzeOreImporto) }}€)</span>
              </div>

              <div class="breakdown-divider"></div>
              <div class="breakdown-total">
                <span>Totale Calcolato</span>
                <span class="font-bold text-primary">{{ formatCurrency(selectedDetailItem?.calculatedTotal || selectedDetailItem?.totalAmount) }}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  payments: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['pay', 'details', 'edit', 'reset', 'delete-payment', 'modify-amount', 'export']);

const filterPeriod = ref('12');
const showDetailsModal = ref(false);
const selectedDetailItem = ref(null);

// Mock Data
const history = computed(() => {
  // TODO: Implementare filtri lato client o server se necessario
  return props.payments;
});

const totalPaid = computed(() => history.value.reduce((sum, h) => sum + h.paidAmount, 0));
const totalUnpaid = computed(() => history.value.reduce((sum, h) => sum + h.remainingAmount, 0));
const unpaidCount = computed(() => history.value.filter(h => h.remainingAmount > 0).length);
const proBonoCount = computed(() => history.value.filter(h => h.status === 'PRO_BONO').length);

function formatCurrency(val) {
  return Number(val || 0).toFixed(2);
}

function formatMonth(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT');
}

function getStatusClass(item) {
  if (item.status === 'PRO_BONO' || item.proBono) return 'status-probono';
  if (item.status === 'PARZIALE') return 'status-partial';
  if (item.pagato || item.status === 'PAGATO') return 'status-paid-blue';
  return 'status-unpaid';
}

function getStatusLabel(item) {
  if (item.status === 'PRO_BONO' || item.proBono) return '🎁 Pro Bono';
  if (item.status === 'PARZIALE') return '⚠️ Parziale';
  if (item.pagato || item.status === 'PAGATO') return '✅ Pagato';
  return '🔴 Non Pagato';
}

function openDetails(item) {
  selectedDetailItem.value = item;
  showDetailsModal.value = true;
}

function closeDetailsModal() {
  showDetailsModal.value = false;
  selectedDetailItem.value = null;
}
</script>

<style scoped>
.payment-history {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters-bar {
  display: flex;
  justify-content: flex-end;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #344767;
  font-size: 14px;
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
.summary-card.info { border-left: 4px solid #11cdef; }

.summary-card .label { font-size: 12px; color: #8392ab; font-weight: 600; text-transform: uppercase; }
.summary-card .value { font-size: 20px; font-weight: 700; color: #344767; }
.summary-card .sub-value { font-size: 12px; color: #f5365c; }

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  overflow: hidden;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th {
  background: #f6f9fc;
  padding: 12px 16px;
  text-align: left;
  font-size: 12px;
  color: #8392ab;
  text-transform: uppercase;
  font-weight: 600;
}

.history-table td {
  padding: 16px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
  color: #344767;
}

.history-table tr:last-child td { border-bottom: none; }

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-paid { background: rgba(45, 206, 137, 0.1); color: #2dce89; }
.status-paid-blue { background: rgba(94, 114, 228, 0.1); color: #5e72e4; }
.status-unpaid { background: rgba(245, 54, 92, 0.1); color: #f5365c; }
.status-probono { background: rgba(17, 205, 239, 0.1); color: #11cdef; }
.status-partial { background: rgba(251, 99, 64, 0.1); color: #fb6340; }

.text-xs { font-size: 11px; }
.text-muted { color: #8392ab; }

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
.text-success { color: #2dce89; font-weight: 600; }
.text-danger { color: #f5365c; font-weight: 600; }

.payment-details-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
}

.payment-detail-item {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #525f7f;
}

.detail-date { color: #8898aa; }
.detail-amount { font-weight: 600; }
.detail-method { font-style: italic; color: #8898aa; }

.btn-icon-small {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
  margin-left: auto; /* Push to right */
}

.btn-icon-small:hover {
  opacity: 1;
}

.btn-danger-text {
  color: #f5365c;
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
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 { margin: 0; font-size: 18px; color: #344767; }

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #8392ab;
}

.breakdown-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #525f7f;
}

.breakdown-divider {
  height: 1px;
  background: #e9ecef;
  margin: 8px 0;
}

.breakdown-total {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
  font-size: 16px;
  color: #344767;
}

.breakdown-values {
  display: flex;
  align-items: center;
}

.ml-1 { margin-left: 4px; }

.sub-item {
  padding-left: 12px;
  font-size: 13px;
  color: #8898aa;
  border-left: 2px solid #e9ecef;
}

.text-primary { color: #5e72e4; }
.font-bold { font-weight: 600; }
</style>
