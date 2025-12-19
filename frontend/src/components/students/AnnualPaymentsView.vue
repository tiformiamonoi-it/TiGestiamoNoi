<template>
  <div class="annual-payments">
    <!-- Header con selettore anno -->
    <div class="payments-header">
      <h2>📅 Pagamenti Annuali {{ selectedYear }}</h2>
      <div class="year-selector">
        <button 
          class="year-btn" 
          @click="selectedYear--"
          :disabled="selectedYear <= 2020"
        >
          ←
        </button>
        <span class="current-year">{{ selectedYear }}</span>
        <button 
          class="year-btn" 
          @click="selectedYear++"
          :disabled="selectedYear >= 2030"
        >
          →
        </button>
      </div>
      
      <!-- Filtri rapidi -->
      <div class="quick-filters">
        <button 
          :class="['filter-btn', { active: filter === 'all' }]"
          @click="filter = 'all'"
        >
          Tutti
        </button>
        <button 
          :class="['filter-btn', { active: filter === 'unpaid' }]"
          @click="filter = 'unpaid'"
        >
          🔴 Non Saldati
        </button>
        <button 
          :class="['filter-btn', { active: filter === 'active' }]"
          @click="filter = 'active'"
        >
          Solo Attivi
        </button>
      </div>
    </div>

    <!-- Legenda -->
    <div class="legend">
      <div class="legend-item">
        <span class="legend-dot paid"></span>
        <span>Saldato</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot unpaid"></span>
        <span>Non Saldato</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot future"></span>
        <span>Previsto</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot empty"></span>
        <span>Nessun Pacchetto</span>
      </div>
    </div>

    <!-- Tabella -->
    <div class="table-container" v-if="!loading">
      <table class="payments-table">
        <thead>
          <tr>
            <th class="student-col">Alunno</th>
            <th v-for="month in months" :key="month.num" class="month-col">
              {{ month.short }}
            </th>
            <th class="total-col">Totale</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredPayments" :key="row.studentId">
            <td class="student-cell">
              <router-link :to="`/students/${row.studentId}`" class="student-name">
                {{ row.studentName }}
              </router-link>
            </td>
            <td 
              v-for="cell in row.months" 
              :key="cell.month"
              :class="['month-cell', cell.status]"
              @click="cell.status !== 'empty' && openPaymentDetail(cell)"
            >
              <template v-if="cell.status === 'paid'">
                <span class="cell-icon">✅</span>
                <span class="cell-amount">{{ cell.amount }}€</span>
              </template>
              <template v-else-if="cell.status === 'unpaid'">
                <span class="cell-icon">🔴</span>
                <span class="cell-amount">{{ cell.amount }}€</span>
              </template>
              <template v-else-if="cell.status === 'future'">
                <span class="cell-amount future-amount">{{ cell.amount }}€</span>
              </template>
              <template v-else>
                <span class="cell-empty">-</span>
              </template>
            </td>
            <td class="total-cell">
              <div class="total-paid">✅ {{ row.totalPaid }}€</div>
              <div class="total-unpaid" v-if="row.totalUnpaid > 0">🔴 {{ row.totalUnpaid }}€</div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredPayments.length === 0" class="no-data">
        <p>Nessun dato per l'anno {{ selectedYear }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="loading-container">
      <div class="loader"></div>
      <p>Caricamento pagamenti...</p>
    </div>

    <!-- Sommario -->
    <div class="summary-bar" v-if="!loading && paymentsData.length > 0">
      <div class="summary-item">
        <span class="summary-label">Totale Incassato:</span>
        <span class="summary-value success">{{ totalPaidYear }}€</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Da Incassare:</span>
        <span class="summary-value danger">{{ totalUnpaidYear }}€</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">Alunni con Sospesi:</span>
        <span class="summary-value warning">{{ studentsWithUnpaid }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { studentsAPI } from '@/services/api';

const loading = ref(false);
const selectedYear = ref(new Date().getFullYear());
const filter = ref('all');
const paymentsData = ref([]);

const months = [
  { num: 1, short: 'GEN' },
  { num: 2, short: 'FEB' },
  { num: 3, short: 'MAR' },
  { num: 4, short: 'APR' },
  { num: 5, short: 'MAG' },
  { num: 6, short: 'GIU' },
  { num: 7, short: 'LUG' },
  { num: 8, short: 'AGO' },
  { num: 9, short: 'SET' },
  { num: 10, short: 'OTT' },
  { num: 11, short: 'NOV' },
  { num: 12, short: 'DIC' }
];

// Recupera dati
async function fetchAnnualPayments() {
  loading.value = true;
  try {
    const response = await studentsAPI.getAnnualPayments(selectedYear.value);
    paymentsData.value = response.data || [];
  } catch (e) {
    console.error('Errore caricamento pagamenti annuali:', e);
    paymentsData.value = [];
  } finally {
    loading.value = false;
  }
}

// Filtra in base al filtro selezionato
const filteredPayments = computed(() => {
  if (filter.value === 'all') return paymentsData.value;
  
  if (filter.value === 'unpaid') {
    return paymentsData.value.filter(row => row.totalUnpaid > 0);
  }
  
  if (filter.value === 'active') {
    return paymentsData.value.filter(row => row.isActive);
  }
  
  return paymentsData.value;
});

// Calcoli sommario
const totalPaidYear = computed(() => {
  return paymentsData.value.reduce((sum, row) => sum + (row.totalPaid || 0), 0);
});

const totalUnpaidYear = computed(() => {
  return paymentsData.value.reduce((sum, row) => sum + (row.totalUnpaid || 0), 0);
});

const studentsWithUnpaid = computed(() => {
  return paymentsData.value.filter(row => row.totalUnpaid > 0).length;
});

function openPaymentDetail(cell) {
  // Per ora alert, in futuro modal dettaglio
  if (cell.status === 'paid') {
    alert(`Pagamento saldato: ${cell.amount}€\nData: ${cell.paidDate || 'N/D'}`);
  } else if (cell.status === 'unpaid') {
    alert(`Da pagare: ${cell.amount}€\nScadenza: ${cell.dueDate || 'N/D'}`);
  }
}

// Watch per cambi anno
watch(selectedYear, () => {
  fetchAnnualPayments();
});

onMounted(() => {
  fetchAnnualPayments();
});
</script>

<style scoped>
.annual-payments {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.payments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.payments-header h2 {
  margin: 0;
  font-size: 20px;
  color: #344767;
}

.year-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.year-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.year-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #5e72e4;
}

.year-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.current-year {
  font-size: 18px;
  font-weight: 700;
  color: #5e72e4;
}

.quick-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 8px 14px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #8392ab;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #5e72e4;
  color: #5e72e4;
}

.filter-btn.active {
  background: #5e72e4;
  color: white;
  border-color: #5e72e4;
}

.legend {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8392ab;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.paid { background: #2dce89; }
.legend-dot.unpaid { background: #f5365c; }
.legend-dot.future { background: #344767; }
.legend-dot.empty { background: #e9ecef; }

.table-container {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.payments-table th {
  padding: 12px 8px;
  background: #f8f9fa;
  font-weight: 600;
  color: #344767;
  text-align: center;
  border-bottom: 2px solid #e9ecef;
}

.payments-table th.student-col {
  text-align: left;
  min-width: 180px;
}

.payments-table th.month-col {
  min-width: 60px;
}

.payments-table th.total-col {
  min-width: 100px;
}

.payments-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #f1f3f5;
  text-align: center;
  vertical-align: middle;
}

.student-cell {
  text-align: left;
}

.student-name {
  color: #344767;
  text-decoration: none;
  font-weight: 600;
}

.student-name:hover {
  color: #5e72e4;
}

.month-cell {
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.month-cell:hover:not(.empty) {
  background: #f8f9fa;
  transform: scale(1.05);
}

.month-cell.paid {
  background: rgba(45, 206, 137, 0.1);
}

.month-cell.unpaid {
  background: rgba(245, 54, 92, 0.1);
}

.month-cell.future {
  background: rgba(52, 71, 103, 0.05);
}

.cell-icon {
  display: block;
  font-size: 14px;
}

.cell-amount {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: #344767;
}

.future-amount {
  color: #8392ab;
}

.cell-empty {
  color: #d1d5db;
}

.total-cell {
  font-weight: 600;
}

.total-paid {
  color: #2dce89;
  font-size: 12px;
}

.total-unpaid {
  color: #f5365c;
  font-size: 11px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #8392ab;
}

.loading-container {
  text-align: center;
  padding: 60px;
  color: #8392ab;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5e72e4;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.summary-bar {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-top: 24px;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-radius: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-label {
  font-size: 12px;
  color: #8392ab;
  text-transform: uppercase;
  font-weight: 600;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
}

.summary-value.success { color: #2dce89; }
.summary-value.danger { color: #f5365c; }
.summary-value.warning { color: #fb6340; }

@media (max-width: 768px) {
  .payments-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .quick-filters {
    flex-wrap: wrap;
  }
  
  .legend {
    flex-wrap: wrap;
  }
  
  .summary-bar {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
