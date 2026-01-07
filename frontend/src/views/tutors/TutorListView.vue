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
      
      <!-- New Tutor Button -->
      <button @click="openCreateTutorModal" class="btn-new-tutor">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Nuovo Tutor
      </button>
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
      @toggle-active="handleToggleActive"
      @delete="handleDeleteTutor"
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
    
    <!-- Create/Edit Tutor Modal -->
    <TutorEditModal
      :is-open="isCreateTutorModalOpen"
      :tutor="tutorToEdit"
      @close="closeCreateTutorModal"
      @save="handleTutorSave"
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
import TutorEditModal from '@/components/tutors/TutorEditModal.vue';
import api from '@/services/api';

const router = useRouter();
const tutorStore = useTutorStore();
const { tutors, stats, filters, pagination } = storeToRefs(tutorStore);

const selectedIds = ref([]);
const isPaymentModalOpen = ref(false);
const tutorsForPayment = ref([]);

// Create/Edit Tutor Modal
const isCreateTutorModalOpen = ref(false);
const tutorToEdit = ref(null);

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

// Create Tutor Functions
function openCreateTutorModal() {
  tutorToEdit.value = null;
  isCreateTutorModalOpen.value = true;
}

function closeCreateTutorModal() {
  isCreateTutorModalOpen.value = false;
  tutorToEdit.value = null;
}

async function handleTutorSave(tutorData) {
  try {
    if (tutorToEdit.value) {
      // Edit existing
      await api.put(`/tutors/${tutorToEdit.value.id}`, tutorData);
      alert('✅ Tutor aggiornato con successo!');
    } else {
      // Create new
      await api.post('/tutors', tutorData);
      alert('✅ Tutor creato con successo!');
    }
    closeCreateTutorModal();
    tutorStore.fetchTutors();
    tutorStore.fetchStats();
  } catch (e) {
    console.error('Errore salvataggio tutor:', e);
    alert('❌ Errore: ' + (e.response?.data?.error || e.message));
  }
}

// Toggle Active/Inactive
async function handleToggleActive(tutor) {
  const newState = !tutor.active;
  const action = newState ? 'attivare' : 'disattivare';
  
  if (!confirm(`Sei sicuro di voler ${action} ${tutor.firstName} ${tutor.lastName}?`)) return;
  
  try {
    await api.put(`/tutors/${tutor.id}`, { active: newState });
    tutorStore.fetchTutors();
    tutorStore.fetchStats();
  } catch (e) {
    console.error('Errore toggle stato:', e);
    alert('❌ Errore: ' + (e.response?.data?.error || e.message));
  }
}

// Delete Tutor
async function handleDeleteTutor(tutor) {
  if (!confirm(`Sei sicuro di voler eliminare ${tutor.firstName} ${tutor.lastName}?\n\nQuesta azione è irreversibile.`)) return;
  
  try {
    await api.delete(`/tutors/${tutor.id}`);
    tutorStore.fetchTutors();
    tutorStore.fetchStats();
    alert('✅ Tutor eliminato con successo!');
  } catch (e) {
    console.error('Errore eliminazione:', e);
    const errorMsg = e.response?.data?.error || 'Errore durante l\'eliminazione';
    alert(`❌ ${errorMsg}`);
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
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.filter-select {
  border: none;
  background: #f8f9fa;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #344767;
  cursor: pointer;
  outline: none;
  border-radius: 6px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238392ab' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 32px;
}

.filter-select:hover {
  background: #e9ecef;
}

.filter-select:focus {
  background: #e9ecef;
  box-shadow: 0 0 0 2px rgba(94, 114, 228, 0.2);
}

/* New Tutor Button */
.btn-new-tutor {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-new-tutor:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.4);
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

/* Checkbox styling */
.filter-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #5e72e4;
  cursor: pointer;
  border-radius: 4px;
}

/* Remove default focus outline on select */
.filter-select:focus-visible {
  outline: none;
}

/* Option styling */
.filter-select option {
  padding: 8px;
  background: white;
  color: #344767;
}
</style>
