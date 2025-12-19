<template>
  <div class="matching-page">
    <!-- Header con navigazione data -->
    <div class="page-header">
      <div class="header-top">
        <h1>📋 Matching Tutor-Studenti</h1>
        <div class="quick-links">
          <button @click="exportPDF" class="quick-btn export" :disabled="assignedBadges.length === 0">
            📊 Esporta CSV
          </button>
          <a href="/prenota" target="_blank" class="quick-btn prenota">
            📚 Prenota
          </a>
          <a href="/disponibilita" target="_blank" class="quick-btn disponibilita">
            📅 Disponibilità
          </a>
        </div>
      </div>
      
      <!-- Calendario Mensile Scorrevole -->
      <div class="calendar-nav">
        <div class="month-selector">
          <button class="month-btn" @click="prevMonth">◀</button>
          <span class="month-label">{{ formatMonthYear(currentMonth) }}</span>
          <button class="month-btn" @click="nextMonth">▶</button>
        </div>
        <div class="days-scroll">
          <div class="days-row">
            <button
              v-for="day in calendarDays"
              :key="day.date"
              class="day-btn"
              :class="{
                'selected': day.date === currentDate,
                'today': day.isToday,
                'weekend': day.isWeekend,
                'closed': day.isClosed,
                'disabled': day.isWeekend || day.isClosed
              }"
              @click="selectDay(day)"
              :disabled="day.isWeekend || day.isClosed"
              :title="day.isClosed ? day.closureDesc : ''"
            >
              <span class="day-weekday">{{ day.weekday }}</span>
              <span class="day-number">{{ day.dayNum }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Caricamento...</p>
    </div>

    <!-- Content -->
    <div v-else class="matching-content">
      <!-- Colonna Sinistra: Tutor -->
      <div class="tutors-column">
        <h2>👨‍🏫 Tutor Disponibili ({{ tutors.length }})</h2>
        
        <div v-if="tutors.length === 0" class="empty-state">
          <p>Nessun tutor disponibile per questa data</p>
        </div>
        
        <div v-else class="tutors-list">
          <div v-for="tutor in tutors" :key="tutor.id" class="tutor-card">
            <div class="tutor-header">
              <span class="tutor-name">👤 {{ tutor.name }}</span>
              <span class="tutor-phone">{{ tutor.phone }}</span>
            </div>
            <div v-if="tutor.notes" class="tutor-notes">📝 {{ tutor.notes }}</div>
            <div v-if="tutor.subjects?.length" class="tutor-subjects">
              <span v-for="(subj, i) in tutor.subjects" :key="i" class="subject-tag">{{ subj }}</span>
            </div>
            
            <!-- Slot orari -->
            <div class="slots-grid">
              <div
                v-for="slot in slots"
                :key="slot.id"
                class="slot-box"
                :class="{ 'has-badges': getAssignedBadges(tutor.id, slot.id).length > 0 }"
                @dragover.prevent
                @drop="handleDrop($event, tutor.id, slot.id)"
              >
                <div class="slot-label">{{ slot.label }}</div>
                <div class="slot-content">
                  <!-- Badge assegnati (multipli) -->
                  <div v-if="getAssignedBadges(tutor.id, slot.id).length > 0" class="mini-badges">
                    <div 
                      v-for="badge in getAssignedBadges(tutor.id, slot.id)" 
                      :key="`${badge.bookingId}-${badge.subject}`"
                      class="mini-badge"
                      draggable="true"
                      @dragstart="handleDragStart($event, badge)"
                    >
                      <span class="mini-name">{{ badge.studentName }} {{ badge.studentSurname }}</span>
                      <span class="mini-subject">{{ badge.subject }}</span>
                      <button class="mini-remove" @click="removeAssignment(badge)">✕</button>
                    </div>
                  </div>
                  <!-- Placeholder -->
                  <div v-else class="slot-placeholder">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonna Destra: Prenotazioni -->
      <div class="bookings-column">
        <h2>📋 Prenotazioni ({{ unassignedBadges.length }})</h2>
        
        <div v-if="unassignedBadges.length === 0 && assignedBadges.length === 0" class="empty-state">
          <p>Nessuna prenotazione per questa data</p>
        </div>
        
        <!-- Filtri ordinamento -->
        <div v-if="unassignedBadges.length > 0" class="sort-filters">
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'student' }"
            @click="sortBy = 'student'"
          >
            👤 Per Studente
          </button>
          <button 
            class="sort-btn" 
            :class="{ active: sortBy === 'subject' }"
            @click="sortBy = 'subject'"
          >
            📚 Per Materia
          </button>
        </div>
        
        <!-- Filtro materia specifica -->
        <div v-if="unassignedBadges.length > 0" class="subject-filter">
          <label>Filtra materia:</label>
          <select v-model="filterSubject">
            <option value="">Tutte ({{ unassignedBadges.length }})</option>
            <option v-for="subj in uniqueSubjects" :key="subj" :value="subj">
              {{ subj }} ({{ countBySubject(subj) }})
            </option>
          </select>
        </div>
        
        <!-- Badge non assegnati -->
        <div class="badges-section" v-if="unassignedBadges.length > 0">
          <h3>Da assegnare</h3>
          <div class="badges-list">
            <div
              v-for="badge in sortedUnassignedBadges"
              :key="`${badge.bookingId}-${badge.subject}`"
              class="badge unassigned"
              draggable="true"
              @dragstart="handleDragStart($event, badge)"
            >
              <span class="badge-name">{{ badge.studentName }} {{ badge.studentSurname }}</span>
              <span class="badge-subject">{{ badge.subject }}</span>
            </div>
          </div>
        </div>
        
        <!-- Badge già assegnati (riepilogo) -->
        <div class="badges-section assigned-section" v-if="assignedBadges.length > 0">
          <h3>✅ Già assegnati</h3>
          <div class="assigned-list">
            <div v-for="badge in assignedBadges" :key="`assigned-${badge.bookingId}-${badge.subject}`" class="assigned-item">
              <span>{{ badge.studentName }} {{ badge.studentSurname }} - {{ badge.subject }}</span>
              <span class="assigned-to">→ {{ getTutorName(badge.assignedTutorId) }} ({{ badge.assignedSlot }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { availabilityAPI, closuresAPI } from '@/services/api';

// State
const currentDate = ref(formatDateKey(new Date()));
const currentMonth = ref(new Date()); // Mese corrente visualizzato
const loading = ref(true);
const tutors = ref([]);
const badges = ref([]);
const slots = ref([]);
const sortBy = ref('student'); // 'student' o 'subject'
const filterSubject = ref(''); // Filtro materia specifica
const closures = ref([]); // Lista date chiusure

// Computed
const isToday = computed(() => currentDate.value === formatDateKey(new Date()));

// Genera giorni del mese per calendario
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = formatDateKey(new Date());
  const weekdays = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dateStr = formatDateKey(date);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const closure = closures.value.find(c => c.date === dateStr);
    
    days.push({
      date: dateStr,
      dayNum: d,
      weekday: weekdays[dayOfWeek],
      isToday: dateStr === todayStr,
      isWeekend,
      isClosed: !!closure,
      closureDesc: closure?.description || 'Chiusura'
    });
  }
  return days;
});

// Formatta mese/anno per visualizzazione
function formatMonthYear(date) {
  return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}

// Navigazione mese
function prevMonth() {
  const d = new Date(currentMonth.value);
  d.setMonth(d.getMonth() - 1);
  currentMonth.value = d;
}

function nextMonth() {
  const d = new Date(currentMonth.value);
  d.setMonth(d.getMonth() + 1);
  currentMonth.value = d;
}

// Seleziona giorno
function selectDay(day) {
  if (day.isWeekend || day.isClosed) return;
  currentDate.value = day.date;
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

const unassignedBadges = computed(() => badges.value.filter(b => !b.isAssigned));
const assignedBadges = computed(() => badges.value.filter(b => b.isAssigned));

// Lista materie uniche
const uniqueSubjects = computed(() => {
  const subjects = new Set(unassignedBadges.value.map(b => b.subject));
  return Array.from(subjects).sort();
});

// Conta badge per materia
function countBySubject(subject) {
  return unassignedBadges.value.filter(b => b.subject === subject).length;
}

const sortedUnassignedBadges = computed(() => {
  // Prima filtra per materia se selezionata
  let list = [...unassignedBadges.value];
  if (filterSubject.value) {
    list = list.filter(b => b.subject === filterSubject.value);
  }
  
  // Poi ordina
  if (sortBy.value === 'student') {
    // Ordina per cognome, poi nome, poi materia
    return list.sort((a, b) => {
      const nameA = `${a.studentSurname} ${a.studentName}`.toLowerCase();
      const nameB = `${b.studentSurname} ${b.studentName}`.toLowerCase();
      if (nameA !== nameB) return nameA.localeCompare(nameB);
      return a.subject.localeCompare(b.subject);
    });
  } else {
    // Ordina per materia, poi cognome
    return list.sort((a, b) => {
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
      return `${a.studentSurname} ${a.studentName}`.localeCompare(`${b.studentSurname} ${b.studentName}`);
    });
  }
});

// Methods
function formatDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('it-IT', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

function prevDay() {
  const [year, month, day] = currentDate.value.split('-').map(Number);
  const date = new Date(year, month - 1, day - 1);
  currentDate.value = formatDateKey(date);
}

function nextDay() {
  const [year, month, day] = currentDate.value.split('-').map(Number);
  const date = new Date(year, month - 1, day + 1);
  currentDate.value = formatDateKey(date);
}

function goToToday() {
  currentDate.value = formatDateKey(new Date());
}

function getAssignedBadges(tutorId, slotId) {
  return badges.value.filter(b => b.assignedTutorId === tutorId && b.assignedSlot === slotId);
}

function getTutorName(tutorId) {
  const tutor = tutors.value.find(t => t.id === tutorId);
  return tutor ? tutor.name : 'N/A';
}

// Drag & Drop
let draggedBadge = null;

function handleDragStart(event, badge) {
  draggedBadge = badge;
  event.dataTransfer.effectAllowed = 'move';
}

async function handleDrop(event, tutorId, slotId) {
  event.preventDefault();
  if (!draggedBadge) return;
  
  try {
    await availabilityAPI.assign(draggedBadge.bookingId, tutorId, slotId);
    
    // Aggiorna stato locale
    const badge = badges.value.find(b => 
      b.bookingId === draggedBadge.bookingId && b.subject === draggedBadge.subject
    );
    if (badge) {
      badge.assignedTutorId = tutorId;
      badge.assignedSlot = slotId;
      badge.isAssigned = true;
    }
  } catch (err) {
    console.error('Errore assegnazione:', err);
    alert('Errore durante l\'assegnazione');
  }
  
  draggedBadge = null;
}

async function removeAssignment(badge) {
  try {
    await availabilityAPI.assign(badge.bookingId, null, null);
    
    // Aggiorna stato locale
    const b = badges.value.find(x => 
      x.bookingId === badge.bookingId && x.subject === badge.subject
    );
    if (b) {
      b.assignedTutorId = null;
      b.assignedSlot = null;
      b.isAssigned = false;
    }
  } catch (err) {
    console.error('Errore rimozione:', err);
    alert('Errore durante la rimozione');
  }
}

// Esporta CSV (formato foglio di calcolo)
function exportPDF() {
  // Formatta data
  const [year, month, day] = currentDate.value.split('-');
  const dateFormatted = `${day}/${month}/${year}`;
  const filename = `lezioni_${day}-${month}-${year}.csv`;
  
  // Header CSV
  let csv = 'Data;Alunno;Tutor;Ora\n';
  
  // Aggiungi righe per ogni assegnazione
  assignedBadges.value
    .sort((a, b) => {
      // Ordina per slot, poi tutor, poi alunno
      if (a.assignedSlot !== b.assignedSlot) return a.assignedSlot.localeCompare(b.assignedSlot);
      const tutorA = getTutorName(a.assignedTutorId);
      const tutorB = getTutorName(b.assignedTutorId);
      if (tutorA !== tutorB) return tutorA.localeCompare(tutorB);
      return `${a.studentSurname} ${a.studentName}`.localeCompare(`${b.studentSurname} ${b.studentName}`);
    })
    .forEach(badge => {
      const alunno = `${badge.studentName} ${badge.studentSurname} - ${badge.subject}`;
      const tutor = getTutorName(badge.assignedTutorId);
      const ora = badge.assignedSlot;
      csv += `${dateFormatted};${alunno};${tutor};${ora}\n`;
    });
  
  // Download CSV
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function loadData() {
  loading.value = true;
  try {
    const response = await availabilityAPI.getMatching(currentDate.value);
    tutors.value = response.data.tutors || [];
    badges.value = response.data.badges || [];
    slots.value = response.data.slots || [];
  } catch (err) {
    console.error('Errore caricamento:', err);
  } finally {
    loading.value = false;
  }
}

// Watch date changes
watch(currentDate, () => {
  loadData();
});

// Initial load
onMounted(async () => {
  await loadClosures();
  loadData();
});
</script>

<style scoped>
.matching-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #1e293b;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  gap: 12px;
}

.quick-links {
  display: flex;
  gap: 8px;
}

.quick-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.quick-btn.prenota {
  background: #ecfdf5;
  color: #10b981;
}

.quick-btn.prenota:hover {
  background: #10b981;
  color: white;
}

.quick-btn.disponibilita {
  background: #eff6ff;
  color: #3b82f6;
}

.quick-btn.disponibilita:hover {
  background: #3b82f6;
  color: white;
}

.quick-btn.export {
  background: #fef3c7;
  color: #d97706;
  border: none;
  cursor: pointer;
}

.quick-btn.export:hover:not(:disabled) {
  background: #d97706;
  color: white;
}

.quick-btn.export:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Calendario Mensile Scorrevole */
.calendar-nav {
  margin-top: 16px;
  max-width: 100%;
  overflow: hidden;
}

.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.month-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f1f5f9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.month-btn:hover {
  background: #e2e8f0;
}

.month-label {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
  min-width: 150px;
  text-align: center;
}

.days-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 8px;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
}

.days-scroll::-webkit-scrollbar {
  height: 6px;
}

.days-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.days-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.days-row {
  display: inline-flex;
  gap: 6px;
}

.day-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 10px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 48px;
}

.day-btn:hover:not(.disabled) {
  border-color: #5e72e4;
}

.day-btn.selected {
  background: #5e72e4;
  border-color: #5e72e4;
  color: white;
}

.day-btn.today:not(.selected) {
  border-color: #10b981;
}

.day-btn.weekend {
  background: #f1f5f9;
  color: #94a3b8;
}

.day-btn.closed {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.day-btn.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.day-weekday {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 500;
}

.day-number {
  font-size: 16px;
  font-weight: 700;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #5e72e4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.matching-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

@media (max-width: 1024px) {
  .matching-content {
    grid-template-columns: 1fr;
  }
}

.tutors-column, .bookings-column {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.tutors-column h2, .bookings-column h2 {
  margin: 0 0 16px;
  font-size: 18px;
  color: #1e293b;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #64748b;
  background: #f8fafc;
  border-radius: 12px;
}

.tutors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tutor-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
}

.tutor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.tutor-name {
  font-weight: 600;
  color: #1e293b;
}

.tutor-phone {
  color: #64748b;
  font-size: 14px;
}

.tutor-notes {
  color: #64748b;
  font-size: 13px;
  font-style: italic;
  margin-bottom: 12px;
}

.tutor-subjects {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.subject-tag {
  background: #e0e7ff;
  color: #4338ca;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.slot-box {
  background: white;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 6px;
  min-height: 60px;
  transition: all 0.2s;
}

.slot-box:hover {
  border-color: #5e72e4;
}

.slot-box.has-badges {
  border-style: solid;
  border-color: #10b981;
  background: #ecfdf5;
}

.mini-badges {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mini-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #10b981;
  color: white;
  padding: 3px 6px;
  border-radius: 4px;
  font-size: 10px;
  cursor: grab;
}

.mini-badge:active {
  cursor: grabbing;
}

.mini-name {
  font-weight: 600;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-subject {
  opacity: 0.85;
  font-size: 9px;
}

.mini-remove {
  margin-left: auto;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 10px;
  opacity: 0.7;
}

.mini-remove:hover {
  opacity: 1;
}

.slot-label {
  font-size: 11px;
  color: #64748b;
  text-align: center;
  margin-bottom: 6px;
}

.slot-content {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slot-placeholder {
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

/* Badges */
.sort-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.subject-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.subject-filter label {
  font-size: 13px;
  color: #64748b;
}

.subject-filter select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13px;
  background: white;
  cursor: pointer;
}

.sort-btn {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.sort-btn:hover {
  background: #f8fafc;
}

.sort-btn.active {
  background: #5e72e4;
  color: white;
  border-color: #5e72e4;
}

.badges-section {
  margin-bottom: 20px;
}

.badges-section h3 {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px;
}

.badges-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.badge {
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: grab;
  position: relative;
  transition: all 0.2s;
}

.badge:active {
  cursor: grabbing;
}

.badge.unassigned {
  background: linear-gradient(135deg, #5e72e4 0%, #825ee4 100%);
  color: white;
}

.badge.assigned {
  background: #10b981;
  color: white;
}

.badge-name {
  font-weight: 600;
  font-size: 13px;
}

.badge-subject {
  font-size: 11px;
  opacity: 0.9;
}

.remove-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #ef4444;
  color: white;
  font-size: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.assigned-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.assigned-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assigned-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #ecfdf5;
  border-radius: 8px;
  font-size: 13px;
}

.assigned-to {
  color: #10b981;
  font-weight: 500;
}
</style>
