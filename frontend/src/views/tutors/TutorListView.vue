<template>
  <div class="tutors-page">
    <!-- Stat Cards -->
    <TutorStatsCards :stats="stats" />

    <!-- Header & Filters -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">👨‍🏫 Gestione Tutor</h1>
        <p class="page-subtitle">Gestisci collaboratori, compensi e pagamenti</p>
      </div>
      
      <!-- Period Filter -->
      <div class="period-filter">
        <select v-model="filters.periodo.mese" class="filter-select">
          <option v-for="m in 12" :key="m" :value="m">{{ getMonthName(m) }}</option>
        </select>
        <select v-model="filters.periodo.anno" class="filter-select">
          <option v-for="y in [2023, 2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="actions-bar">
      <!-- Search -->
      <div class="search-container">
        <input 
          v-model="filters.search" 
          type="text" 
          placeholder="🔍 Cerca tutor..." 
          class="search-input"
        />
      </div>

      <!-- Actions -->
      <div class="actions-group">
        <button 
          v-if="selectedIds.length > 0"
          @click="openBulkPayment"
          class="btn-primary"
        >
          💰 Paga Selezionati ({{ selectedIds.length }})
        </button>
        
        <!-- Filter Checkbox -->
        <label class="filter-checkbox">
          <input type="checkbox" v-model="filters.conPagamentiSospesi" />
          <span>Solo da pagare</span>
        </label>
      </div>
    </div>

    <!-- Table -->
    <TutorTable 
      :tutors="tutors" 
      v-model="selectedIds"
      @view="goToDetail"
      @pay="openSinglePayment"
    />

    <!-- Pagination -->
    <div class="pagination-container">
      <span class="pagination-info">
        Mostrando {{ tutors.length }} di {{ pagination.total }} risultati
      </span>
      <div class="pagination-controls">
        <button 
          :disabled="pagination.page === 1"
          @click="changePage(pagination.page - 1)"
          class="btn-pagination"
        >
          Precedente
        </button>
        <button 
          :disabled="pagination.page * pagination.limit >= pagination.total"
          @click="changePage(pagination.page + 1)"
          class="btn-pagination"
        >
          Successivo
        </button>
      </div>
    </div>

    <!-- Modals -->
    <PaymentModal 
      :is-open="isPaymentModalOpen"
      :tutors-to-pay="tutorsForPayment"
      @close="isPaymentModalOpen = false"
      @confirm="handlePaymentConfirm"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useTutorStore } from '@/stores/tutor';
import TutorStatsCards from '@/components/tutors/TutorStatsCards.vue';
import TutorTable from '@/components/tutors/TutorTable.vue';
import PaymentModal from '@/components/tutors/PaymentModal.vue';

const router = useRouter();
const tutorStore = useTutorStore();
const { tutors, stats, filters, pagination } = storeToRefs(tutorStore);

const selectedIds = ref([]);
const isPaymentModalOpen = ref(false);
const tutorsForPayment = ref([]);

// Init
onMounted(() => {
  tutorStore.fetchTutors();
  tutorStore.fetchStats();
});

// Watch filters to refresh
watch(filters, () => {
  // Reset page when filters change
  tutorStore.pagination.page = 1;
  tutorStore.fetchTutors();
  tutorStore.fetchStats();
}, { deep: true });

// Helpers
function getMonthName(m) {
  return new Date(2025, m - 1, 1).toLocaleDateString('it-IT', { month: 'long' });
}

function changePage(p) {
  tutorStore.setPage(p);
}

function goToDetail(id) {
  router.push(`/tutors/${id}`);
}

// Payment Logic
function openSinglePayment(tutor) {
  tutorsForPayment.value = [tutor];
  isPaymentModalOpen.value = true;
}

function openBulkPayment() {
  const selectedTutors = tutors.value.filter(t => selectedIds.value.includes(t.id));
  // Filtra solo quelli che hanno qualcosa da pagare
  const validTutors = selectedTutors.filter(t => t.mesiNonPagati && t.mesiNonPagati.length > 0);
  
  if (validTutors.length === 0) {
    alert('Nessuno dei tutor selezionati ha pagamenti in sospeso per questo periodo.');
    return;
  }
  
  tutorsForPayment.value = validTutors;
  isPaymentModalOpen.value = true;
}

async function handlePaymentConfirm(payload) {
  try {
    await tutorStore.payTutors(
      payload.pagamenti,
      payload.dataPagamento,
      payload.metodoPagamento,
      payload.note
    );
    isPaymentModalOpen.value = false;
    selectedIds.value = []; // Reset selection
    alert('Pagamenti registrati con successo!');
  } catch (e) {
    alert('Errore durante il pagamento: ' + e.message);
  }
}
</script>

<style scoped>
.tutors-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #344767;
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #8392ab;
  margin: 4px 0 0 0;
}

/* Period Filter */
.period-filter {
  display: flex;
  gap: 8px;
  background: white;
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-select {
  border: none;
  background: transparent;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #344767;
  cursor: pointer;
  outline: none;
}

.filter-select:focus {
  background: #f8f9fa;
  border-radius: 6px;
}

/* Actions Bar */
.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.search-container {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
  outline: none;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #2dce89, #2dcecc);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 206, 137, 0.3);
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #344767;
  cursor: pointer;
  user-select: none;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px;
  border-radius: 12px;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination-info {
  font-size: 14px;
  color: #8392ab;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.btn-pagination {
  padding: 6px 12px;
  border: 1px solid #e9ecef;
  background: white;
  border-radius: 6px;
  color: #8392ab;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-pagination:hover:not(:disabled) {
  background: #f8f9fa;
  color: #344767;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
