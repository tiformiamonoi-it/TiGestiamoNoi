<template>
  <div class="calendar-page">
    <!-- Header con navigazione mese -->
    <div class="calendar-header">
      <div class="header-left">
        <h1>📅 Calendario Lezioni</h1>
        <p class="subtitle">Registra e gestisci le lezioni giornaliere</p>
      </div>
      
      <!-- Navigazione Mese -->
      <div class="month-navigation">
        <button @click="previousMonth" class="btn-nav">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        
        <div class="current-month">
          <h2>{{ nomeMesseAnno }}</h2>
          <button @click="goToToday" class="btn-today">Oggi</button>
        </div>
        
        <button @click="nextMonth" class="btn-nav">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <!-- Filtri -->
    <div class="calendar-filters">
      <div class="filter-group">
        <label class="filter-label">Tutor</label>
        <select v-model="filtroTutor" @change="loadGiorni" class="filter-select">
          <option value="">Tutti i tutor</option>
          <option v-for="tutor in tutors" :key="tutor.id" :value="tutor.id">
            {{ tutor.firstName }} {{ tutor.lastName }}
          </option>
        </select>
      </div>

      <div class="filter-actions">
         <button @click="openCreateModal()" class="btn-primary">
           ➕ Nuova Lezione
         </button>
        <button @click="toggleAllDays" class="btn-secondary">
          {{ allExpanded ? '⬆️ Chiudi Tutti' : '⬇️ Espandi Tutti' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loader"></div>
      Caricamento calendario...
    </div>

    <!-- Empty State -->
    <div v-else-if="giorniWithTutorRecap.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
      <h3>Nessuna lezione in questo mese</h3>
      <p>Inizia a registrare le lezioni giornaliere</p>
    </div>

    <!-- Lista Giorni -->
    <div v-else class="days-list">
      <div
        v-for="giorno in giorniWithTutorRecap"
        :key="giorno.data"
        class="day-card"
        :class="{ 'day-expanded': isDayExpanded(giorno.data), 'day-today': isToday(giorno.data) }"
      >
        <!-- Header Giorno -->
        <div class="day-header" @click="toggleDay(giorno.data)">
          <div class="day-info">
            <div class="day-date">
              <span class="day-number">{{ getDayNumber(giorno.data) }}</span>
              <span class="day-name">{{ getDayName(giorno.data) }}</span>
            </div>
            
            <div class="day-stats">
              <span class="stat">
                <strong>{{ giorno.numeroLezioni }}</strong> lezioni
              </span>
              <span class="stat">
                <strong>{{ giorno.numeroStudenti }}</strong> studenti
              </span>
            </div>
          </div>

          <div class="day-right">
            <div class="day-margine">
              <span class="label">Margine:</span>
              <span class="value" :class="getMargineClass(giorno.margine)">
                €{{ formatCurrency(giorno.margine) }}
              </span>
            </div>

            <button class="btn-expand">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline :points="isDayExpanded(giorno.data) ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <!-- Corpo Giorno Espanso -->
        <div v-if="isDayExpanded(giorno.data)" class="day-body">
          <!-- Recap per Tutor -->
          <div v-if="giorno.tutorsRecap && giorno.tutorsRecap.length > 0" class="tutors-recap">
            <h4 class="recap-title">👨‍🏫 Riepilogo Tutor</h4>
            
            <div class="tutor-recap-list">
              <div
                v-for="tutorData in giorno.tutorsRecap"
                :key="tutorData.tutor.id"
                class="tutor-recap-item"
              >
                <div class="tutor-name">
                  {{ tutorData.tutor.firstName }} {{ tutorData.tutor.lastName }}
                </div>
                
                <div class="tutor-stats">
                  <span class="stat-item">
                    <strong>{{ tutorData.numeroLezioni }}</strong> lezioni
                  </span>
                  <span class="stat-item">
                    <strong>{{ tutorData.numeroStudenti }}</strong> studenti
                  </span>
                  <span class="stat-item">
                    <strong>€{{ formatCurrency(tutorData.compensoTotale) }}</strong> compenso
                  </span>
                </div>
              </div>
            </div>
          </div>

          <p class="coming-soon">🚧 Griglia dettagliata tutor×slot in arrivo...</p>
        </div>
      </div>
    </div>
  </div>

   <CreateLessonModal
    v-if="showCreateModal"
    :initial-date="selectedDate"
    @close="showCreateModal = false"
    @saved="handleLessonSaved"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { calendarAPI } from '@/services/api';
import CreateLessonModal from '@/components/calendar/CreateLessonModal.vue';

// ========================================
// STATE
// ========================================

const loading = ref(false);
const giorni = ref([]);
const expandedDays = ref(new Set());
const allExpanded = ref(false);

// Filtri
const filtroTutor = ref('');
const tutors = ref([]);

// Data corrente
const currentMonth = ref(new Date().getMonth() + 1); // 1-12
const currentYear = ref(new Date().getFullYear());

// Modal Nuova Lezione
const showCreateModal = ref(false);
const selectedDate = ref(null);

// ========================================
// COMPUTED
// ========================================

const nomeMesseAnno = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value - 1);
  const formatter = new Intl.DateTimeFormat('it-IT', {
    month: 'long',
    year: 'numeric',
  });
  return formatter.format(date).charAt(0).toUpperCase() + formatter.format(date).slice(1);
});

// ========================================
// COMPUTED - Raggruppa lezioni per tutor
// ========================================

const giorniWithTutorRecap = computed(() => {
  return giorni.value.map(giorno => {
    // Raggruppa lezioni per tutor
    const tutorsMap = new Map();
    
    giorno.lezioni.forEach(lezione => {
      const tutorId = lezione.tutor?.id;
      if (!tutorId) return;
      
      if (!tutorsMap.has(tutorId)) {
        tutorsMap.set(tutorId, {
          tutor: lezione.tutor,
          numeroLezioni: 0,
          studentiUnici: new Set(),
          compensoTotale: 0,
          lezioni: [],
        });
      }
      
      const tutorData = tutorsMap.get(tutorId);
      tutorData.numeroLezioni++;
       lezione.lessonStudents?.forEach(ls => {
        tutorData.studentiUnici.add(ls.student.id);
      });
      tutorData.compensoTotale += parseFloat(lezione.compensoTutor || 0);
      tutorData.lezioni.push(lezione);
    });
    
    return {
      ...giorno,
      tutorsRecap: Array.from(tutorsMap.values()),
    };
  });
});

// ========================================
// FUNCTIONS
// ========================================

const loadGiorni = async () => {
  loading.value = true;
  try {
    const params = {
      anno: currentYear.value,
      mese: currentMonth.value,
    };

    if (filtroTutor.value) {
      params.tutorId = filtroTutor.value;
    }

    const response = await calendarAPI.getGiorni(params);
    giorni.value = response.data.giorni || [];
  } catch (error) {
    console.error('Errore caricamento giorni:', error);
    alert('Errore durante il caricamento del calendario');
  } finally {
    loading.value = false;
  }
};

const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12;
    currentYear.value--;
  } else {
    currentMonth.value--;
  }
  loadGiorni();
};

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1;
    currentYear.value++;
  } else {
    currentMonth.value++;
  }
  loadGiorni();
};

const goToToday = () => {
  const today = new Date();
  currentMonth.value = today.getMonth() + 1;
  currentYear.value = today.getFullYear();
  loadGiorni();
};

const toggleDay = (dataStr) => {
  if (expandedDays.value.has(dataStr)) {
    expandedDays.value.delete(dataStr);
  } else {
    expandedDays.value.add(dataStr);
  }
};

const isDayExpanded = (dataStr) => {
  return expandedDays.value.has(dataStr);
};

const toggleAllDays = () => {
  if (allExpanded.value) {
    expandedDays.value.clear();
  } else {
    giorniWithTutorRecap.value.forEach(g => expandedDays.value.add(g.data));
  }
  allExpanded.value = !allExpanded.value;
};

const isToday = (dataStr) => {
  const today = new Date().toISOString().split('T')[0];
  return dataStr === today;
};

const getDayNumber = (dataStr) => {
  const date = new Date(dataStr);
  return date.getDate();
};

const getDayName = (dataStr) => {
  const date = new Date(dataStr);
  const formatter = new Intl.DateTimeFormat('it-IT', { weekday: 'long' });
  const name = formatter.format(date);
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const formatCurrency = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const getMargineClass = (margine) => {
  const num = parseFloat(margine);
  if (num > 0) return 'positive';
  if (num < 0) return 'negative';
  return 'neutral';
};

const loadTutors = async () => {
  try {
    // TODO: Implementare endpoint tutors
    tutors.value = [];
  } catch (error) {
    console.error('Errore caricamento tutor:', error);
  }
};

const openCreateModal = (date = null) => {
  selectedDate.value = date || new Date().toISOString().split('T')[0];
  showCreateModal.value = true;
};

const handleLessonSaved = () => {
  showCreateModal.value = false;
  loadGiorni(); // Ricarica il calendario mantenendo il mese corrente
};

onMounted(() => {
  loadGiorni();
  loadTutors();
});
</script>


<style scoped>
/* ========================================
   LAYOUT BASE
   ======================================== */
.calendar-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.header-left h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

/* Navigazione Mese */
.month-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-month {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 200px;
}

.current-month h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.btn-nav {
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.btn-nav:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-today {
  padding: 6px 16px;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-today:hover {
  background: #dbeafe;
}

/* Filtri */
.calendar-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
}

.btn-secondary {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 80px 24px;
  color: #6b7280;
}

.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state svg {
  margin-bottom: 16px;
  color: #d1d5db;
}

/* ========================================
   GIORNI
   ======================================== */
.days-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.day-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.day-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.day-today {
  border-left: 4px solid #3b82f6;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.day-header:hover {
  background: #f9fafb;
}

.day-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.day-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.day-number {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
  line-height: 1;
}

.day-name {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.day-stats {
  display: flex;
  gap: 20px;
}

.stat {
  font-size: 14px;
  color: #6b7280;
}

.stat strong {
  color: #111827;
  font-weight: 600;
}

.day-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.day-margine {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.day-margine .label {
  font-size: 12px;
  color: #6b7280;
}

.day-margine .value {
  font-size: 18px;
  font-weight: 600;
}

.value.positive {
  color: #16a34a;
}

.value.negative {
  color: #dc2626;
}

.value.neutral {
  color: #6b7280;
}

.btn-expand {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #6b7280;
  transition: transform 0.2s;
}

.day-expanded .btn-expand {
  transform: rotate(180deg);
}

/* Day Body */
.day-body {
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.coming-soon {
  text-align: center;
  padding: 40px;
  color: #6b7280;
  font-size: 16px;
}

.lessons-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lesson-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.lesson-time {
  font-weight: 600;
  color: #111827;
  min-width: 60px;
}

.lesson-tutor {
  color: #6b7280;
  min-width: 120px;
}

.lesson-students {
  color: #6b7280;
}

.lesson-type {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.type-singola {
  background: #dbeafe;
  color: #1e40af;
}

.type-gruppo {
  background: #dcfce7;
  color: #166534;
}

.type-maxi {
  background: #fef3c7;
  color: #92400e;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
  }
  
  .day-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}

/* ... stili esistenti ... */

/* Bottone Nuova Lezione */
.btn-primary {
  padding: 10px 20px;
  background: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.filter-actions {
  display: flex;
  gap: 12px;
}
/* Recap Tutor */
.tutors-recap {
  margin-bottom: 20px;
}

.recap-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.tutor-recap-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tutor-recap-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.tutor-recap-item:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.tutor-name {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.tutor-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  font-size: 14px;
  color: #6b7280;
}

.stat-item strong {
  color: #111827;
  font-weight: 600;
}

</style>
