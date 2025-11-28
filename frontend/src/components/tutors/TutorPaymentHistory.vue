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
            <th>Stato</th>
            <th>Data Pagamento</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td class="font-bold">{{ formatMonth(item.mese) }}</td>
            <td>€{{ formatCurrency(item.importo) }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(item)]">
                {{ getStatusLabel(item) }}
              </span>
            </td>
            <td>
              <div v-if="item.dataPagamento">
                <div>{{ formatDate(item.dataPagamento) }}</div>
                <div class="text-xs text-muted">{{ item.metodo }}</div>
              </div>
              <span v-else>-</span>
            </td>
            <td>
              <div class="actions">
                <button 
                  v-if="!item.pagato" 
                  class="btn-icon btn-pay" 
                  title="Paga"
                  @click="$emit('pay', item)"
                >💰</button>
                <button 
                  class="btn-icon" 
                  title="Dettagli"
                  @click="$emit('details', item)"
                >👁️</button>
                <button 
                  class="btn-icon" 
                  title="Modifica"
                  @click="$emit('edit', item)"
                >✏️</button>
                <button 
                  v-if="item.pagato" 
                  class="btn-icon btn-danger" 
                  title="Reset (Elimina)"
                  @click="$emit('reset', item)"
                >🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
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

const emit = defineEmits(['pay', 'details', 'edit', 'reset']);

const filterPeriod = ref('12');

// Mock Data
const history = computed(() => {
  // TODO: Implementare filtri lato client o server se necessario
  return props.payments;
});

const totalPaid = computed(() => history.value.filter(h => h.pagato && !h.proBono).reduce((sum, h) => sum + Number(h.importo), 0));
const totalUnpaid = computed(() => history.value.filter(h => !h.pagato).reduce((sum, h) => sum + Number(h.importo), 0));
const unpaidCount = computed(() => history.value.filter(h => !h.pagato).length);
const proBonoCount = computed(() => history.value.filter(h => h.proBono).length);

function formatCurrency(val) {
  return Number(val || 0).toFixed(2);
}

function formatMonth(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('it-IT');
}

function getStatusClass(item) {
  if (item.status === 'PRO_BONO' || item.proBono) return 'status-probono';
  if (item.status === 'PARZIALE') return 'status-partial';
  if (item.pagato) return 'status-paid';
  return 'status-unpaid';
}

function getStatusLabel(item) {
  if (item.status === 'PRO_BONO' || item.proBono) return '🎁 Pro Bono';
  if (item.status === 'PARZIALE') return '⚠️ Parziale';
  if (item.pagato) return '✅ Pagato';
  return '🔴 Non Pagato';
}
</script>

<style scoped>
/* ... existing styles ... */
.status-partial { background: rgba(251, 99, 64, 0.1); color: #fb6340; }
.btn-danger { border-color: #f5365c; color: #f5365c; }
.btn-danger:hover { background: #fee2e2; }

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
.status-unpaid { background: rgba(245, 54, 92, 0.1); color: #f5365c; }
.status-probono { background: rgba(17, 205, 239, 0.1); color: #11cdef; }

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
</style>
