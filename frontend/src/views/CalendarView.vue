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
          <!-- Griglia Tutor × Slot -->
          <div class="day-grid-section">
            <div class="grid-header">
              <h4 class="grid-title">📅 Lezioni per Slot</h4>
            </div>

            <!-- Tabella Griglia -->
            <div class="slot-grid-wrapper">
              <table class="slot-grid">
                <thead>
                  <tr>
                    <th class="col-tutor">Tutor</th>
                    <th v-for="slot in getActiveSlotsForDay(giorno)" :key="slot.id" class="col-slot">
                      {{ slot.label }}
                    </th>
                    <th class="col-actions">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- ✅ Se ci sono tutor, mostra le loro righe -->
                  <tr v-for="tutorData in giorno.tutorsRecap" :key="tutorData.tutor.id">
                    <!-- Colonna Tutor -->
                    <td class="tutor-name-cell">
                      {{ tutorData.tutor.firstName }} {{ tutorData.tutor.lastName.charAt(0) }}.
                    </td>

                    <!-- Celle Slot -->
                    <td 
                      v-for="slot in getActiveSlotsForDay(giorno)" 
                      :key="slot.id"
                      class="slot-cell"
                      :class="getSlotCellClass(giorno, tutorData.tutor.id, slot.start)"
                      @click="openManageSlotModal(giorno.data, tutorData.tutor.id, slot.start, slot.end)"
                    >
                      <!-- Badge Mezza Lezione -->
                      <span 
                        v-if="isHalfLessonSlot(giorno, tutorData.tutor.id, slot.start)" 
                        class="badge-half-slot"
                      >
                        ½
                      </span>

                      <div class="slot-content">
                        <!-- Alunni nello slot -->
                        <div
                          v-for="student in getStudentsInSlot(giorno, tutorData.tutor.id, slot.start)"
                          :key="student.id"
                          class="student-chip"
                        >
                          {{ student.firstName }} {{ student.lastName.charAt(0) }}.
                        </div>

                        <!-- Slot vuoto -->
                        <div v-if="getStudentsInSlot(giorno, tutorData.tutor.id, slot.start).length === 0" class="empty-slot">
                          +
                        </div>
                      </div>
                    </td>

                    <!-- ✅ NUOVA COLONNA AZIONI: Pulsante Elimina Riga -->
                    <td class="actions-cell">
                      <button 
                        @click.stop="confirmDeleteTutorRow(giorno.data, tutorData.tutor.id, tutorData.tutor.firstName, tutorData.tutor.lastName)"
                        class="btn-delete-row"
                        title="Elimina tutte le lezioni del tutor"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>

                  <!-- ✅ Se NON ci sono tutor, mostra riga placeholder con slot standard -->
                  <tr v-if="giorno.tutorsRecap.length === 0">
                    <td class="tutor-name-cell empty-day">
                      <em style="color: #9ca3af;">Nessuna lezione</em>
                    </td>
                    <td 
                      v-for="slot in getActiveSlotsForDay(giorno)" 
                      :key="slot.id"
                      class="slot-cell empty"
                      @click="openManageSlotModal(giorno.data, null, slot.start, slot.end)"
                    >
                      <div class="slot-content">
                        <div class="empty-slot">+</div>
                      </div>
                    </td>
                    <td class="actions-cell"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Bottone Aggiungi Tutor -->
            <button class="btn-add-tutor" @click="openAddTutorModal(giorno.data)">
              + Aggiungi Tutor
            </button>
          </div>

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

  <!-- Modal Gestione Slot -->
  <ManageSlotModal
    v-if="showManageSlotModal && selectedSlot"
    :date="selectedSlot.date"
    :tutor-id="selectedSlot.tutorId"
    :tutor-name="selectedSlot.tutorName"
    :slot-start="selectedSlot.slotStart"
    :slot-end="selectedSlot.slotEnd"
    :time-slot-id="selectedSlot.timeSlotId"
    @close="showManageSlotModal = false"
    @saved="handleSlotSaved"
  />

  <AddQuickLessonModal
  v-if="showAddTutorModal && selectedDateForTutor"
  :date="selectedDateForTutor"
  @close="showAddTutorModal = false"
  @saved="handleTutorAdded"
/>
</template>

<script setup>
// Vue 3 Composition API
import { ref, computed, onMounted } from 'vue';
import { calendarAPI, timeslotsAPI, tutorsAPI, lessonsAPI, closuresAPI } from '@/services/api';
import CreateLessonModal from '@/components/calendar/CreateLessonModal.vue';
import ManageSlotModal from '@/components/calendar/ManageSlotModal.vue';
import AddQuickLessonModal from '@/components/calendar/AddQuickLessonModal.vue'; // ✅ NUOVO


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
const currentMonth = ref(new Date().getMonth() + 1);
const currentYear = ref(new Date().getFullYear());

// Modal Nuova Lezione
const showCreateModal = ref(false);
const selectedDate = ref(null);

// TimeSlots dal database
const timeSlots = ref([]);

// ✅ Slot STANDARD che devono sempre comparire
const STANDARD_SLOTS = ['15:30', '16:30', '17:30'];

const showManageSlotModal = ref(false);
const selectedSlot = ref(null);

// ✅ NUOVO: Modal Aggiungi Tutor
const showAddTutorModal = ref(false);
const selectedDateForTutor = ref(null);

// ✅ CHIUSURE: Date in cui non si possono aggiungere lezioni
const closures = ref([]);

// Verifica se una data è chiusura
function isClosureDate(dateStr) {
  return closures.value.some(c => c.date === dateStr);
}

// Carica chiusure
async function loadClosures() {
  try {
    const response = await closuresAPI.getAll();
    closures.value = response.data.closures || [];
  } catch (err) {
    console.error('Errore caricamento chiusure:', err);
  }
}

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

// Raggruppa lezioni per tutor con studenti unici
const giorniWithTutorRecap = computed(() => {
  return giorni.value.map(giorno => {
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
    
    // Converti Set in count
    let tutorsRecap = Array.from(tutorsMap.values()).map(tutorData => ({
      tutor: tutorData.tutor,
      numeroLezioni: tutorData.numeroLezioni,
      numeroStudenti: tutorData.studentiUnici.size,
      compensoTotale: tutorData.compensoTotale,
      lezioni: tutorData.lezioni,
    }));

    // ✅ Se non ci sono tutor (giorno senza lezioni), crea lista vuota
    // per permettere comunque il rendering della griglia con slot standard
    if (tutorsRecap.length === 0) {
      tutorsRecap = [];
    }
    
    return {
      ...giorno,
      tutorsRecap,
    };
  });
});

// ========================================
// FUNCTIONS
// ========================================

const loadTimeSlots = async () => {
  try {
    const response = await timeslotsAPI.getAll({ attivo: 'true' });
    timeSlots.value = response.data.timeSlots.map(slot => ({
      id: slot.id,
      start: slot.oraInizio,
      end: slot.oraFine,
      label: `${slot.oraInizio.substring(0, 5)}-${slot.oraFine.substring(0, 5)}`,
      isStandard: STANDARD_SLOTS.includes(slot.oraInizio),
    }));
    
    console.log('🕒 TimeSlots caricati:', timeSlots.value);
    console.log('🎯 Slot standard:', STANDARD_SLOTS);
    
  } catch (error) {
    console.error('Errore caricamento slot orari:', error);
    timeSlots.value = [
      { id: 'fallback-1', start: '15:30:00', end: '16:30:00', label: '15:30-16:30', isStandard: true },
      { id: 'fallback-2', start: '16:30:00', end: '17:30:00', label: '16:30-17:30', isStandard: true },
      { id: 'fallback-3', start: '17:30:00', end: '18:30:00', label: '17:30-18:30', isStandard: true },
    ];
  }
};

const loadTutors = async () => {
  try {
    const response = await tutorsAPI.getAll();
    tutors.value = response.data.data || [];
    console.log('✅ Tutor caricati:', tutors.value.length);
  } catch (error) {
    console.error('Errore caricamento tutor:', error);
    tutors.value = [];
  }
};

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

// ========================================
// FUNCTIONS GRIGLIA
// ========================================

const getActiveSlotsForDay = (giorno) => {
  console.log('🔍 getActiveSlotsForDay chiamata per:', giorno.data);
  console.log('📋 Lezioni nel giorno:', giorno.lezioni);
  
  // 1. Se non ci sono lezioni, mostra solo gli slot standard
  if (!giorno.lezioni || giorno.lezioni.length === 0) {
    const standardSlots = timeSlots.value.filter(slot => STANDARD_SLOTS.includes(slot.start));
    console.log('✅ Nessuna lezione → Slot standard:', standardSlots);
    return standardSlots;
  }

  // 2. Trova slot usati nelle lezioni
  const usedSlotIds = new Set();
  
  giorno.lezioni.forEach(lezione => {
    if (lezione.timeSlot?.oraInizio) {
      usedSlotIds.add(lezione.timeSlot.oraInizio);
      console.log('🕒 Slot usato:', lezione.timeSlot.oraInizio);
    }
  });
  
  // 3. Filtra slot da mostrare: STANDARD oppure con lezioni
  const result = timeSlots.value.filter(slot => {
    const isStandard = STANDARD_SLOTS.includes(slot.start);
    const hasLesson = usedSlotIds.has(slot.start);
    
    if (isStandard) console.log(`✅ Slot ${slot.start} è STANDARD → mostra`);
    if (hasLesson) console.log(`📌 Slot ${slot.start} ha lezioni → mostra`);
    
    return isStandard || hasLesson;
  });
  
  console.log('🎯 Slot finali da mostrare:', result);
  return result;
};

// Ottieni studenti in uno slot specifico
const getStudentsInSlot = (giorno, tutorId, slotStart) => {
  // ✅ FIX: Trova TUTTE le lezioni nello slot (non solo la prima!)
  const lessons = giorno.lezioni.filter(
    l => l.tutor?.id === tutorId && l.timeSlot?.oraInizio === slotStart
  );

  if (!lessons || lessons.length === 0) return [];

  // ✅ Unisci tutti gli studenti da tutte le lezioni nello slot
  const studentsMap = new Map();
  lessons.forEach(lesson => {
    lesson.lessonStudents?.forEach(ls => {
      if (!studentsMap.has(ls.student.id)) {
        studentsMap.set(ls.student.id, {
          id: ls.student.id,
          firstName: ls.student.firstName,
          lastName: ls.student.lastName,
          mezzaLezione: ls.mezzaLezione || false,
        });
      }
    });
  });

  return Array.from(studentsMap.values());
};

// Class per cella slot
const getSlotCellClass = (giorno, tutorId, slotStart) => {
  const students = getStudentsInSlot(giorno, tutorId, slotStart);
  return {
    'has-students': students.length > 0,
    'empty': students.length === 0,
  };
};

// Verifica se lo slot ha almeno uno studente con mezza lezione
const isHalfLessonSlot = (giorno, tutorId, slotStart) => {
  // ✅ FIX: Controlla TUTTE le lezioni nello slot
  const lessons = giorno.lezioni.filter(
    l => l.tutor?.id === tutorId && l.timeSlot?.oraInizio === slotStart
  );

  if (!lessons || lessons.length === 0) return false;

  // Ritorna true se ALMENO uno studente in qualsiasi lezione ha mezzaLezione = true
  return lessons.some(lesson => 
    lesson.lessonStudents?.some(ls => ls.mezzaLezione === true)
  );
};

// Modal gestione slot
const openManageSlotModal = (date, tutorId, slotStart, slotEnd) => {
  // ✅ Blocca se è una chiusura
  if (isClosureDate(date)) {
    alert('❌ Non è possibile aggiungere lezioni in questa data: è una giornata di chiusura.');
    return;
  }
  
  // Trova tutor
  const giorno = giorniWithTutorRecap.value.find(g => g.data === date);
  const tutorData = giorno?.tutorsRecap.find(t => t.tutor.id === tutorId);
  
  if (!tutorData) {
    console.error('Tutor non trovato');
    return;
  }

  // Trova timeSlot ID
  const slot = timeSlots.value.find(s => s.start === slotStart);
  if (!slot) {
    console.error('TimeSlot non trovato');
    return;
  }

  selectedSlot.value = {
    date,
    tutorId,
    tutorName: `${tutorData.tutor.firstName} ${tutorData.tutor.lastName}`,
    slotStart,
    slotEnd,
    timeSlotId: slot.id,
  };

  showManageSlotModal.value = true;
};

const handleSlotSaved = () => {
  showManageSlotModal.value = false;
  selectedSlot.value = null;
  loadGiorni(); // Ricarica calendario
};

// Modal aggiungi tutor
const openAddTutorModal = (date) => {
  // ✅ Blocca se è una chiusura
  if (isClosureDate(date)) {
    alert('❌ Non è possibile aggiungere lezioni in questa data: è una giornata di chiusura.');
    return;
  }
  
  selectedDateForTutor.value = date;
  showAddTutorModal.value = true;
};

const handleTutorAdded = () => {
  showAddTutorModal.value = false;
  selectedDateForTutor.value = null;
  loadGiorni(); // Ricarica calendario
};

const openCreateModal = (date = null) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  // ✅ Blocca se è una chiusura
  if (isClosureDate(targetDate)) {
    alert('❌ Non è possibile aggiungere lezioni in questa data: è una giornata di chiusura.');
    return;
  }
  
  selectedDate.value = targetDate;
  showCreateModal.value = true;
};

const handleLessonSaved = () => {
  showCreateModal.value = false;
  loadGiorni();
};

// ========================================
// ✅ NUOVE FUNZIONI: ELIMINA RIGA TUTOR
// ========================================

/**
 * Conferma eliminazione tutte le lezioni del tutor
 */
const confirmDeleteTutorRow = (date, tutorId, tutorFirstName, tutorLastName) => {
  const tutorName = `${tutorFirstName} ${tutorLastName}`;
  const formattedDate = formatDate(date);
  
  const confirmed = confirm(
    `⚠️ ATTENZIONE!\n\n` +
    `Stai per eliminare TUTTE le lezioni di ${tutorName} del ${formattedDate}.\n\n` +
    `Questa azione:\n` +
    `• Eliminerà tutte le lezioni del tutor in questa giornata\n` +
    `• Ripristinerà le ore nei pacchetti degli studenti\n` +
    `• NON può essere annullata\n\n` +
    `Sei sicuro di voler continuare?`
  );
  
  if (confirmed) {
    deleteTutorLessons(date, tutorId, tutorName);
  }
};

/**
 * Elimina tutte le lezioni del tutor nella data specificata
 */
const deleteTutorLessons = async (date, tutorId, tutorName) => {
  try {
    loading.value = true;
    
    const response = await lessonsAPI.deleteBulkByTutorDate(tutorId, date);
    
    alert(
      `✅ Successo!\n\n` +
      `${response.data.deletedCount} lezioni di ${tutorName} eliminate.\n` +
      `Le ore sono state ripristinate nei pacchetti degli studenti.`
    );
    
    // Ricarica calendario
    await loadGiorni();
    
  } catch (error) {
    console.error('Errore eliminazione lezioni tutor:', error);
    alert(
      `❌ Errore!\n\n` +
      `Non è stato possibile eliminare le lezioni.\n` +
      `Dettaglio: ${error.response?.data?.error || error.message}`
    );
  } finally {
    loading.value = false;
  }
};

/**
 * Formatta data per visualizzazione
 */
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatter.format(date);
};

onMounted(async () => {
  await loadClosures(); // ✅ Carica chiusure per blocco
  loadTimeSlots();
  loadTutors();
  loadGiorni();
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

.filter-actions {
  display: flex;
  gap: 12px;
}

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

/* ======================================== 
   GRIGLIA TUTOR × SLOT 
======================================== */
.day-grid-section {
  margin-bottom: 32px;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.grid-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}

.slot-grid-wrapper {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.slot-grid {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Header Tabella */
.slot-grid thead th {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 16px 12px;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 3px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.slot-grid .col-tutor {
  text-align: left;
  padding-left: 20px;
  min-width: 140px;
  font-size: 14px;
}

.slot-grid .col-slot {
  min-width: 160px;
  border-left: 2px solid #e2e8f0;
}

.slot-grid .col-actions {
  min-width: 80px;
  text-align: center;
}

/* Riga Tutor */
.slot-grid tbody tr {
  transition: background 0.2s;
}

.slot-grid tbody tr:hover {
  background: #fafbfc;
}

.slot-grid tbody tr + tr {
  border-top: 2px solid #e2e8f0;
}

/* Colonna Nome Tutor */
.tutor-name-cell {
  padding: 20px;
  font-weight: 700;
  font-size: 15px;
  color: #1e293b;
  background: linear-gradient(135deg, #fafbfc, #f8fafc);
  border-right: 3px solid #cbd5e1;
  position: sticky;
  left: 0;
  z-index: 5;
}

/* Celle Slot */
.slot-cell {
  padding: 12px;
  border-left: 2px solid #e2e8f0;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.2s;
  vertical-align: top;
  min-height: 80px;
  position: relative;
}

.slot-cell.empty {
  background: #fafbfc;
}

.slot-cell.has-students {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.slot-cell:hover {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-color: #3b82f6;
  transform: scale(1.02);
  box-shadow: inset 0 0 0 2px #3b82f6;
  z-index: 2;
}

/* Badge Mezza Lezione a livello SLOT (in alto a destra) */
.badge-half-slot {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  box-shadow: 0 2px 4px rgba(146, 64, 14, 0.3);
  z-index: 1;
}

/* Contenuto Slot */
.slot-content {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Chip Studente */
.student-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1.5px solid #cbd5e1;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.student-chip:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
  transform: translateY(-1px);
}

/* Slot Vuoto (CENTRATO) */
.empty-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 60px;
  color: #cbd5e1;
  font-size: 32px;
  font-weight: 200;
  transition: all 0.2s;
}

.slot-cell:hover .empty-slot {
  color: #3b82f6;
  transform: scale(1.1);
}

/* ✅ COLONNA AZIONI: Pulsante Elimina Riga */
.actions-cell {
  padding: 12px;
  text-align: center;
  vertical-align: middle;
  border-left: 2px solid #e2e8f0;
}

.btn-delete-row {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1.5px solid #ef4444;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}

.btn-delete-row:hover {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  border-color: #dc2626;
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.4);
}

.btn-delete-row:active {
  transform: scale(0.95);
}

/* Bottone Aggiungi Tutor */
.btn-add-tutor {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 2px dashed #cbd5e1;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-add-tutor:hover {
  background: #f8fafc;
  border-color: #64748b;
  border-style: solid;
  color: #334155;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* ======================================== 
   RECAP TUTOR 
======================================== */
.tutors-recap {
  margin-top: 24px;
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

/* ======================================== 
   RESPONSIVE 
======================================== */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
  }
  
  .day-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .tutor-name-cell {
    padding: 12px;
    font-size: 14px;
  }
  
  .slot-cell {
    padding: 8px;
    min-height: 60px;
  }
  
  .slot-content {
    min-height: 50px;
  }
  
  .slot-grid .col-slot {
    min-width: 120px;
  }
}

/* Cella tutor per giorni senza lezioni */
.tutor-name-cell.empty-day {
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
  color: #9ca3af;
  font-style: italic;
  font-weight: 500;
}
</style>
