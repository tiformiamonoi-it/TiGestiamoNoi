<template>
    <div class="students-page">
      <!-- Stat Cards -->
      <StudentStatsCards :stats="stats" />

      <!-- Header con tab -->
      <div class="page-header">
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'alunni' }]"
            @click="activeTab = 'alunni'"
          >
            📚 Alunni
          </button>
          <button
            :class="['tab', { active: activeTab === 'pagamenti' }]"
            @click="activeTab = 'pagamenti'"
          >
            💰 Pagamenti Annuale
          </button>
        </div>

        <button class="btn-primary" @click="openCreateModal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nuovo Alunno
        </button>
      </div>

      <!-- Tab Alunni -->
      <div v-if="activeTab === 'alunni'" class="tab-content">
        <!-- Filtri -->
        <StudentFilters
          v-model:filters="filters"
          @update:filters="handleFiltersChange"
          @clear="clearFilters"
        />

        <!-- Tabella -->
        <StudentsTable
          :students="students"
          :loading="loading"
          :has-more="hasMore"
          @view-details="viewStudentDetails"
          @manage-packages="openManagePackagesModal"
          @load-more="loadMore"
        />
      </div>

      <!-- Tab Pagamenti Annuale -->
      <div v-else class="tab-content">
        <div class="coming-soon">
          <h3>📅 Vista Pagamenti Annuale</h3>
          <p>Calendario GEN-DIC con tutti i pagamenti - In sviluppo</p>
        </div>
      </div>

      <!-- Modal Gestisci Pacchetti -->
      <ManagePackagesModal
        v-if="showManagePackagesModal"
        :student="selectedStudent"
        @close="closeManagePackagesModal"
        @refresh="loadStudents(true)"
      />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { studentsAPI } from '@/services/api';
import StudentStatsCards from '@/components/students/StudentStatsCards.vue';
import StudentFilters from '@/components/students/StudentFilters.vue';
import StudentsTable from '@/components/students/StudentsTable.vue';
import ManagePackagesModal from '@/components/students/ManagePackagesModal.vue';

const router = useRouter();

// Tab attivo
const activeTab = ref('alunni');

// Stati
const students = ref([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);

// Stats
const stats = ref({
  totale: 0,
  attivi: 0,
  alertePagamenti: 0,
});

// Filtri
const filters = ref({
  search: '',
  scuola: '',
  stato: '',
  pacchetto: '',
  oreNegative: false,
  pagamentoSospeso: false,
});

// Modal Pacchetti
const showManagePackagesModal = ref(false);
const selectedStudent = ref(null);

const loadStats = async () => {
  try {
    // Calcola allerte pagamenti: studenti con "Pag. Sospeso"
    const alertePagamenti = students.value.filter(student => {
      if (!student.pacchettoAttivo) return false;

      const pacchetto = student.pacchettoAttivo;
      const oggi = new Date();
      oggi.setHours(0, 0, 0, 0);

      const dataScadenza = pacchetto.dataScadenza ? new Date(pacchetto.dataScadenza) : null;
      if (dataScadenza) dataScadenza.setHours(0, 0, 0, 0);

      const giorniAllaScadenza = dataScadenza
        ? Math.ceil((dataScadenza - oggi) / (1000 * 60 * 60 * 24))
        : null;

      const isScaduto = dataScadenza && oggi > dataScadenza;
      const isInScadenza = dataScadenza && giorniAllaScadenza >= 0 && giorniAllaScadenza <= 2;

      const quantitaResidua = pacchetto.tipo === 'MENSILE'
        ? pacchetto.giorniResiduo
        : pacchetto.oreResiduo;

      const isEsaurito = quantitaResidua <= 0;

      // Stessa logica del badge "Pag. Sospeso"
      return pacchetto.importoResiduo > 0 && (isInScadenza || isScaduto || isEsaurito);
    }).length;

    stats.value = {
      totale: students.value.length,
      attivi: students.value.filter(s => s.pacchettoAttivo && s.pacchettoAttivo.importoResiduo >= 0).length,
      alertePagamenti: alertePagamenti,
    };
  } catch (error) {
    console.error('Errore caricamento stats:', error);
  }
};


// Carica studenti
const loadStudents = async (reset = false) => {
  if (loading.value || (!hasMore.value && !reset)) return;

  loading.value = true;

  try {
    if (reset) {
      page.value = 1;
      students.value = [];
      hasMore.value = true;
    }

    const params = {
      limit: 20,
      offset: (page.value - 1) * 20,
      ...filters.value,
    };

    const response = await studentsAPI.getAll(params);
    const newStudents = response.data.students || [];

    if (reset) {
      students.value = newStudents;
    } else {
      students.value.push(...newStudents);
    }

    hasMore.value = newStudents.length === 20;
    page.value++;

    // Aggiorna stats
    await loadStats();

  } catch (error) {
    console.error('Errore caricamento studenti:', error);
  } finally {
    loading.value = false;
  }
};

// Handler cambio filtri
const handleFiltersChange = () => {
  loadStudents(true);
};

// Pulisci filtri
const clearFilters = () => {
  filters.value = {
    search: '',
    scuola: '',
    stato: '',
    pacchetto: '',
    oreNegative: false,
    pagamentoSospeso: false,
  };
  loadStudents(true);
};

// Load more (infinite scroll)
const loadMore = () => {
  loadStudents(false);
};

// Azioni
const viewStudentDetails = (studentId) => {
  router.push(`/students/${studentId}`);
};

const openManagePackagesModal = (student) => {
  selectedStudent.value = student;
  showManagePackagesModal.value = true;
};

const closeManagePackagesModal = () => {
  showManagePackagesModal.value = false;
  selectedStudent.value = null;
};

const openCreateModal = () => {
  router.push('/students/new');
};

onMounted(() => {
  loadStudents();
});
</script>

<style scoped>
.students-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header con Tab */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  background: #f8f9fa;
  padding: 4px;
  border-radius: 10px;
}

.tab {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #8392ab;
  cursor: pointer;
  transition: all 0.2s;
}

.tab:hover {
  color: #344767;
}

.tab.active {
  background: white;
  color: #5e72e4;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.coming-soon {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.coming-soon h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  color: #344767;
}

.coming-soon p {
  margin: 0;
  color: #8392ab;
  font-size: 16px;
}
</style>
