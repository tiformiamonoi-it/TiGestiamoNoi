<template>
  <div class="annual-payments">
    <!-- Header con selettore anno -->
    <div class="payments-header">
      <div class="title-section">
        <h2>📅 Pagamenti {{ selectedYear }}</h2>
        <p class="subtitle">Riepilogo scadenze e incassi mensili</p>
      </div>
      
      <div class="header-actions">
        <div class="year-selector">
          <button 
            class="year-btn" 
            @click="selectedYear--"
            :disabled="selectedYear <= 2020"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <span class="current-year">{{ selectedYear }}</span>
          <button 
            class="year-btn" 
            @click="selectedYear++"
            :disabled="selectedYear >= 2030"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        <div class="filter-group">
          <button 
            v-for="f in ['all', 'unpaid', 'active']" 
            :key="f"
            :class="['filter-btn', { active: filter === f }]"
            @click="filter = f"
          >
            {{ filterLabels[f] }}
          </button>
        </div>
      </div>
    </div>

    <!-- Legenda Minimal -->
    <div class="legend">
      <div class="legend-item" v-for="l in legendItems" :key="l.label">
        <span :class="['legend-dot', l.class]"></span>
        <span>{{ l.label }}</span>
      </div>
    </div>

    <!-- Tabella Modern -->
    <div class="table-card" v-if="!loading">
      <div class="table-wrapper">
        <table class="payments-table">
          <thead>
            <tr>
              <th class="student-col">Alunno</th>
              <th v-for="month in months" :key="month.num" class="month-header">
                {{ month.short }}
              </th>
              <th class="total-col">Totale</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in filteredPayments" :key="row.studentId" class="student-row">
              <td class="student-cell">
                <router-link :to="`/students/${row.studentId}`" class="name-link">
                  {{ row.studentName }}
                </router-link>
              </td>
              
              <td 
                v-for="cell in row.months" 
                :key="cell.month"
                :class="['month-cell', cell.status]"
                @click="cell.status !== 'empty' && openPaymentDetail(cell)"
              >
                <div class="cell-content">
                  <div v-if="cell.status !== 'empty'" class="status-dot"></div>
                  <span class="amount" v-if="cell.amount">{{ cell.amount }}€</span>
                  <span class="empty-dash" v-else>•</span>
                </div>
              </td>

              <td class="total-cell">
                <div class="total-stats">
                  <span class="paid">€{{ row.totalPaid }}</span>
                  <span class="unpaid" v-if="row.totalUnpaid > 0">€{{ row.totalUnpaid }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredPayments.length === 0" class="empty-state">
        <div class="empty-icon">📂</div>
        <p>Nessun dato relativo all'anno {{ selectedYear }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-else class="loading-state">
      <div class="spinner"></div>
      <p>Caricamento dati in corso...</p>
    </div>

    <!-- Summary Widgets -->
    <div class="summary-grid" v-if="!loading && paymentsData.length > 0">
      <div class="summary-card success">
        <span class="label">Incassato Totale</span>
        <span class="value">{{ totalPaidYear }}€</span>
      </div>
      <div class="summary-card danger">
        <span class="label">Pendenze Totali</span>
        <span class="value">{{ totalUnpaidYear }}€</span>
      </div>
      <div class="summary-card warning">
        <span class="label">Studenti con Sospesi</span>
        <span class="value">{{ studentsWithUnpaid }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from "vue-toastification";
import { studentsAPI } from '@/services/api';

const loading = ref(false);
const selectedYear = ref(new Date().getFullYear());
const filter = ref('all');
const paymentsData = ref([]);
const toast = useToast();

const months = [
  { num: 1, short: 'GEN' }, { num: 2, short: 'FEB' }, { num: 3, short: 'MAR' },
  { num: 4, short: 'APR' }, { num: 5, short: 'MAG' }, { num: 6, short: 'GIU' },
  { num: 7, short: 'LUG' }, { num: 8, short: 'AGO' }, { num: 9, short: 'SET' },
  { num: 10, short: 'OTT' }, { num: 11, short: 'NOV' }, { num: 12, short: 'DIC' }
];

const filterLabels = {
  all: 'Tutti',
  unpaid: 'Non Saldati',
  active: 'Solo Attivi'
};

const legendItems = [
  { label: 'Saldato', class: 'paid' },
  { label: 'Parziale', class: 'partial' },
  { label: 'Non Saldato', class: 'unpaid' },
  { label: 'Previsto', class: 'future' },
  { label: 'Nessun Pacchetto', class: 'empty' }
];

async function fetchAnnualPayments() {
  loading.value = true;
  try {
    const response = await studentsAPI.getAnnualPayments(selectedYear.value);
    paymentsData.value = response.data || [];
  } catch (e) {
    console.error('Errore caricamento pagamenti:', e);
  } finally {
    loading.value = false;
  }
}

const filteredPayments = computed(() => {
  if (filter.value === 'all') return paymentsData.value;
  return paymentsData.value.filter(row => 
    filter.value === 'unpaid' ? row.totalUnpaid > 0 : row.isActive
  );
});

const totalPaidYear = computed(() => paymentsData.value.reduce((sum, r) => sum + (r.totalPaid || 0), 0));
const totalUnpaidYear = computed(() => paymentsData.value.reduce((sum, r) => sum + (r.totalUnpaid || 0), 0));
const studentsWithUnpaid = computed(() => paymentsData.value.filter(r => r.totalUnpaid > 0).length);

function openPaymentDetail(cell) {
  if (cell.status === 'paid') {
    toast.success(`Saldato: ${cell.amount}€\nData: ${cell.paidDate || 'N/D'}`);
  } else if (cell.status === 'partial') {
    toast.warning(`Parziale: Ricevuti ${cell.paidAmount}€ su ${cell.amount}€`);
  } else if (cell.status === 'unpaid') {
    toast.error(`Mancante: ${cell.amount}€`);
  } else if (cell.status === 'future') {
    toast.info(`Previsto: ${cell.amount}€ per il mese di ${months[cell.month - 1].short}`);
  }
}

watch(selectedYear, fetchAnnualPayments);
onMounted(fetchAnnualPayments);
</script>

<style scoped>
.annual-payments {
  padding: 10px;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.payments-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 30px;
}

.title-section h2 {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.5px;
}

.subtitle {
  color: #64748b;
  font-size: 13px;
  margin: 4px 0 0;
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.year-selector {
  display: flex;
  align-items: center;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
  gap: 8px;
}

.year-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: white;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.year-btn:hover:not(:disabled) {
  background: #5e72e4;
  color: white;
}

.current-year {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  padding: 0 8px;
}

.filter-group {
  display: flex;
  background: #f1f5f9;
  padding: 4px;
  border-radius: 10px;
}

.filter-btn {
  padding: 6px 14px;
  border: none;
  background: transparent;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-radius: 7px;
  transition: all 0.2s;
}

.filter-btn.active {
  background: white;
  color: #5e72e4;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.legend {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.paid { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
.legend-dot.partial { background: #f59e0b; box-shadow: 0 0 8px rgba(245, 158, 11, 0.4); }
.legend-dot.unpaid { background: #ef4444; box-shadow: 0 0 8px rgba(239, 68, 68, 0.4); }
.legend-dot.future { background: #334155; }
.legend-dot.empty { background: #e2e8f0; }

.table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
  overflow: hidden;
  border: 1px solid #f1f5f9;
}

.table-wrapper {
  overflow-x: auto;
}

.payments-table {
  width: 100%;
  border-collapse: collapse;
}

.payments-table th {
  padding: 16px 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #f1f5f9;
  text-align: center;
}

.student-col { text-align: left !important; padding-left: 24px !important; width: 220px; }

.student-row:hover { background: #f8fafc; }

.student-cell {
  padding: 14px 24px;
  text-align: left;
}

.name-link {
  color: #475569;
  font-weight: 700;
  text-decoration: none;
  font-size: 13px;
  transition: color 0.2s;
}

.name-link:hover { color: #5e72e4; }

.month-cell {
  padding: 10px 4px;
  cursor: pointer;
  position: relative;
  transition: background 0.2s;
}

.cell-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.paid .status-dot { background: #10b981; }
.partial .status-dot { background: #f59e0b; }
.unpaid .status-dot { background: #ef4444; }
.future .status-dot { background: #334155; }

.amount {
  font-size: 10px;
  font-weight: 700;
  color: #475569;
}

.future .amount { color: #94a3b8; font-weight: 500; }

.empty-dash { color: #e2e8f0; font-size: 18px; line-height: 1; }

.total-cell {
  background: #f8fafc;
}

.total-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 16px;
  align-items: flex-end;
}

.total-stats span {
  font-size: 10px;
  font-weight: 800;
}

.total-stats .paid { color: #059669; }
.total-stats .unpaid { color: #dc2626; }

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #94a3b8;
}

.empty-icon { font-size: 40px; margin-bottom: 12px; }

.loading-state {
  padding: 60px;
  text-align: center;
  color: #64748b;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #5e72e4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.summary-card {
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: white;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.summary-card .label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; }
.summary-card .value { font-size: 20px; font-weight: 800; color: #1e293b; }

.summary-card.success { border-bottom: 3px solid #10b981; }
.summary-card.danger { border-bottom: 3px solid #ef4444; }
.summary-card.warning { border-bottom: 3px solid #f59e0b; }

@media (max-width: 1024px) {
  .payments-header { flex-direction: column; align-items: flex-start; gap: 20px; }
  .header-actions { width: 100%; flex-wrap: wrap; }
}
</style>
