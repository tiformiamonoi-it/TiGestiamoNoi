<template>
  <div class="booking-page">
    <!-- Header con Logo -->
    <header class="booking-header">
      <img src="/logo.png" alt="Ti Formiamo Noi" class="logo" />
      <h1>Prenota la tua lezione</h1>
    </header>

    <!-- Progress Bar -->
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressWidth }"></div>
      </div>
      <div class="step-indicators">
        <div v-for="s in 4" :key="s" :class="['step-dot', { active: s <= currentStep, completed: s < currentStep }]">
          <span>{{ s }}</span>
        </div>
      </div>
      <p class="step-label">Step {{ currentStep }}/4 - {{ stepLabels[currentStep - 1] }}</p>
    </div>

    <!-- Step Content -->
    <div class="step-content">
      <!-- Step 1: Dati Personali -->
      <div v-if="currentStep === 1" class="step step-1">
        <h2>📝 I tuoi dati</h2>
        <div class="form-group">
          <label>Nome <span class="required">*</span></label>
          <input type="text" v-model="form.studentName" placeholder="Il tuo nome" class="form-input" />
        </div>
        <div class="form-group">
          <label>Cognome <span class="required">*</span></label>
          <input type="text" v-model="form.studentSurname" placeholder="Il tuo cognome" class="form-input" />
        </div>
        <div class="form-group">
          <label>Telefono <span class="required">*</span></label>
          <input type="tel" v-model="form.studentPhone" placeholder="+39 333 1234567" class="form-input" />
        </div>
      </div>

      <!-- Step 2: Calendario -->
      <div v-if="currentStep === 2 && !isDuplicate" class="step step-2">
        <h2>📅 Quando vuoi venire?</h2>
        
        <!-- Calendario -->
        <div class="calendar">
          <div class="calendar-header">
            <button class="nav-btn" @click="prevMonth" :disabled="!canGoPrev">◀</button>
            <span class="month-label">{{ monthLabel }}</span>
            <button class="nav-btn" @click="nextMonth">▶</button>
          </div>
          <div class="calendar-weekdays">
            <span v-for="day in weekdays" :key="day">{{ day }}</span>
          </div>
          <div class="calendar-days">
            <button
              v-for="(day, index) in calendarDays"
              :key="index"
              :class="['day-btn', { 
                empty: !day, 
                disabled: day && !isDateSelectable(day),
                selected: day && isSelectedDate(day),
                today: day && isToday(day),
                'late-today': day && isTodayLate(day)
              }]"
              :disabled="!day || !isDateSelectable(day) || checkingDuplicate"
              @click="selectDate(day)"
            >
              {{ day?.getDate() || '' }}
            </button>
          </div>
        </div>

        <div v-if="checkingDuplicate" class="checking-msg">
          ⏳ Verifico disponibilità...
        </div>

        <div v-if="form.requestedDate && !checkingDuplicate" class="selected-date">
          📌 Hai selezionato: <strong>{{ formatSelectedDate }}</strong>
        </div>

        <div class="form-group">
          <label>📝 Note (opzionale)</label>
          <textarea v-model="form.notes" placeholder="Es: Arrivo alle 16:30" class="form-textarea" rows="2"></textarea>
        </div>
      </div>

      <!-- Step Comunicazione (se già prenotato o oggi dopo 11:30) -->
      <div v-if="currentStep === 2 && isDuplicate" class="step step-communication">
        <div class="duplicate-alert" :class="{ 'late-alert': isLateTodayMode }">
          <span class="alert-icon">{{ isLateTodayMode ? '⌛' : '📋' }}</span>
          <h3>{{ isLateTodayMode ? 'Sono passate le 11:30' : 'Hai già una prenotazione!' }}</h3>
          <p v-if="isLateTodayMode">Per oggi puoi solo inviare una comunicazione.</p>
          <p v-else>Materie: <strong>{{ existingBooking?.subjects?.join(', ') || '-' }}</strong></p>
        </div>

        <p class="hint">Scrivi la tua comunicazione qui sotto:</p>
        
        <div class="form-group">
          <label>📝 La tua comunicazione <span class="required">*</span></label>
          <textarea v-model="form.notes" placeholder="Es: Oggi arrivo alle 16:30" class="form-textarea" rows="4"></textarea>
        </div>
      </div>

      <!-- Step 3: Materie -->
      <div v-if="currentStep === 3" class="step step-3">
        <h2>📚 Di cosa hai bisogno?</h2>
        
        <!-- Barra di ricerca -->
        <div class="search-box">
          <input type="text" v-model="searchMaterie" placeholder="🔍 Cerca materia..." class="form-input" />
        </div>

        <p class="hint">Seleziona una o più materie:</p>
        
        <div class="materie-grid">
          <button
            v-for="materia in filteredMaterie"
            :key="materia"
            :class="['materia-btn', { selected: form.subjects.includes(materia) }]"
            @click="toggleMateria(materia)"
          >
            <span class="check">{{ form.subjects.includes(materia) ? '✓' : '' }}</span>
            {{ materia }}
          </button>
        </div>

        <div v-if="form.subjects.length > 0" class="selected-subjects">
          Selezionate: <strong>{{ form.subjects.join(', ') }}</strong>
        </div>
      </div>

      <!-- Step 4: Conferma -->
      <div v-if="currentStep === 4" class="step step-4">
        <div v-if="!submitted" class="confirm-content">
          <h2>✅ Conferma prenotazione</h2>
          <div class="summary-card">
            <div class="summary-row">
              <span class="label">👤 Studente:</span>
              <span class="value">{{ form.studentName }} {{ form.studentSurname }}</span>
            </div>
            <div class="summary-row">
              <span class="label">📱 Telefono:</span>
              <span class="value">{{ form.studentPhone }}</span>
            </div>
            <div class="summary-row">
              <span class="label">📅 Giorno:</span>
              <span class="value">{{ formatSelectedDate }}</span>
            </div>
            <div class="summary-row">
              <span class="label">📚 Materie:</span>
              <span class="value">{{ form.subjects.join(', ') }}</span>
            </div>
            <div v-if="form.notes" class="summary-row">
              <span class="label">📝 Note:</span>
              <span class="value">{{ form.notes }}</span>
            </div>
          </div>
        </div>

        <div v-else class="success-content">
          <div class="success-icon">✅</div>
          <h2>{{ isDuplicate ? 'Comunicazione inviata!' : 'Prenotazione inviata!' }}</h2>
          <p>Ti contatteremo al più presto per confermare.</p>
          <button class="btn-primary" @click="resetForm">🏠 Nuova Prenotazione</button>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="navigation" v-if="!submitted">
      <button v-if="currentStep > 1" class="btn-secondary" @click="prevStep">
        ← Indietro
      </button>
      <div v-else></div>
      
      <!-- Bottone Comunicazione (se duplicato) -->
      <button 
        v-if="currentStep === 2 && isDuplicate" 
        class="btn-primary btn-communicate" 
        @click="submitCommunication"
        :disabled="submitting || !form.notes"
      >
        {{ submitting ? 'Invio...' : '📨 Invia Comunicazione' }}
      </button>
      
      <!-- Bottone Avanti normale -->
      <button 
        v-else-if="currentStep < 4" 
        class="btn-primary" 
        @click="nextStep"
        :disabled="!canProceed || checkingDuplicate"
      >
        Avanti →
      </button>
      
      <!-- Bottone Conferma finale -->
      <button 
        v-else 
        class="btn-primary btn-confirm" 
        @click="submitBooking"
        :disabled="submitting"
      >
        {{ submitting ? 'Invio...' : '🎉 Conferma Prenotazione' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { bookingAPI } from '@/services/api';

// State
const currentStep = ref(1);
const submitted = ref(false);
const submitting = ref(false);
const materie = ref([]);
const searchMaterie = ref('');
const isDuplicate = ref(false);
const existingBooking = ref(null);
const checkingDuplicate = ref(false);

const form = ref({
  studentName: '',
  studentSurname: '',
  studentPhone: '',
  requestedDate: null,
  subjects: [],
  notes: ''
});

// Calendar state
const currentMonth = ref(new Date());
const weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const stepLabels = ['Dati Personali', 'Scegli il Giorno', 'Scegli le Materie', 'Conferma'];

// Computed
const progressWidth = computed(() => `${(currentStep.value / 4) * 100}%`);

const monthLabel = computed(() => {
  return currentMonth.value.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;
  
  const days = [];
  
  // Empty slots before first day
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  
  // Days of month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  
  return days;
});

const canGoPrev = computed(() => {
  const today = new Date();
  return currentMonth.value.getMonth() > today.getMonth() || 
         currentMonth.value.getFullYear() > today.getFullYear();
});

const formatSelectedDate = computed(() => {
  if (!form.value.requestedDate) return '';
  return form.value.requestedDate.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
});

const filteredMaterie = computed(() => {
  if (!searchMaterie.value) return materie.value;
  const search = searchMaterie.value.toLowerCase();
  return materie.value.filter(m => m.toLowerCase().includes(search));
});

// Check if we're in late-today mode (forced communication)
const isLateTodayMode = computed(() => {
  if (!form.value.requestedDate) return false;
  return isTodayLate(form.value.requestedDate) && isDuplicate.value;
});

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return form.value.studentName && form.value.studentSurname && form.value.studentPhone;
    case 2:
      return form.value.requestedDate !== null;
    case 3:
      return form.value.subjects.length > 0;
    default:
      return true;
  }
});

// Check if same-day booking is allowed (before 11:30)
function isTodayBookingAllowed() {
  const now = new Date();
  const cutoffHour = 11;
  const cutoffMinute = 30;
  return now.getHours() < cutoffHour || (now.getHours() === cutoffHour && now.getMinutes() < cutoffMinute);
}

// Methods
function isDateSelectable(date) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Past dates
  if (date < today) return false;
  
  // Today after 11:30 - STILL selectable but will force communication mode
  // (removed the return false block)
  
  // Weekends (Saturday = 6, Sunday = 0)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  return true;
}

// Check if a date is today and after 11:30 (late mode)
function isTodayLate(date) {
  if (!date) return false;
  const today = new Date();
  if (date.toDateString() !== today.toDateString()) return false;
  return !isTodayBookingAllowed();
}

function isSelectedDate(date) {
  if (!form.value.requestedDate || !date) return false;
  return form.value.requestedDate.toDateString() === date.toDateString();
}

function isToday(date) {
  if (!date) return false;
  return date.toDateString() === new Date().toDateString();
}

async function selectDate(date) {
  if (!isDateSelectable(date)) return;
  
  form.value.requestedDate = date;
  isDuplicate.value = false;
  existingBooking.value = null;
  
  // Force communication mode if today after 11:30
  const isLateToday = isTodayLate(date);
  if (isLateToday) {
    isDuplicate.value = true;
    existingBooking.value = { subjects: ['Comunicazione tardiva'] };
    return;
  }
  
  // Check for duplicate if we have surname and phone
  if (form.value.studentSurname && form.value.studentPhone) {
    checkingDuplicate.value = true;
    try {
      const response = await bookingAPI.checkDuplicate({
        studentSurname: form.value.studentSurname,
        studentPhone: form.value.studentPhone,
        requestedDate: date.toISOString()
      });
      
      if (response.data.isDuplicate) {
        isDuplicate.value = true;
        existingBooking.value = response.data.existingBooking;
      }
    } catch (error) {
      console.error('Errore check duplicato:', error);
    } finally {
      checkingDuplicate.value = false;
    }
  }
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
}

function toggleMateria(materia) {
  const index = form.value.subjects.indexOf(materia);
  if (index === -1) {
    form.value.subjects.push(materia);
  } else {
    form.value.subjects.splice(index, 1);
  }
}

function nextStep() {
  if (canProceed.value && currentStep.value < 4) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    // Reset duplicate state when going back from step 2
    if (currentStep.value === 2) {
      isDuplicate.value = false;
      existingBooking.value = null;
    }
    currentStep.value--;
  }
}

async function submitCommunication() {
  if (!form.value.notes) {
    alert('Inserisci una comunicazione');
    return;
  }
  
  submitting.value = true;
  try {
    await bookingAPI.sendCommunication({
      studentName: form.value.studentName,
      studentSurname: form.value.studentSurname,
      studentPhone: form.value.studentPhone,
      requestedDate: form.value.requestedDate.toISOString(),
      notes: form.value.notes
    });
    alert('✅ Comunicazione inviata con successo!');
    resetForm();
  } catch (error) {
    console.error('Errore invio comunicazione:', error);
    alert('Errore durante l\'invio. Riprova.');
  } finally {
    submitting.value = false;
  }
}

async function submitBooking() {
  submitting.value = true;
  try {
    await bookingAPI.create({
      studentName: form.value.studentName,
      studentSurname: form.value.studentSurname,
      studentPhone: form.value.studentPhone,
      requestedDate: form.value.requestedDate.toISOString(),
      subjects: form.value.subjects,
      notes: form.value.notes
    });
    submitted.value = true;
  } catch (error) {
    console.error('Errore invio prenotazione:', error);
    alert('Errore durante l\'invio. Riprova.');
  } finally {
    submitting.value = false;
  }
}

function resetForm() {
  currentStep.value = 1;
  submitted.value = false;
  isDuplicate.value = false;
  existingBooking.value = null;
  form.value = {
    studentName: '',
    studentSurname: '',
    studentPhone: '',
    requestedDate: null,
    subjects: [],
    notes: ''
  };
}

async function loadMaterie() {
  try {
    const response = await bookingAPI.getMaterie();
    materie.value = response.data.materie || [];
  } catch (error) {
    console.error('Errore caricamento materie:', error);
    // Fallback materie
    materie.value = ['Matematica', 'Fisica', 'Chimica', 'Italiano', 'Inglese', 'Storia', 'Geografia'];
  }
}

onMounted(() => {
  loadMaterie();
});
</script>

<style scoped>
.booking-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* Header */
.booking-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  max-width: 150px;
  height: auto;
  margin-bottom: 12px;
}

.booking-header h1 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

/* Progress */
.progress-container {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.progress-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 16px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #5e72e4, #825ee4);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.step-indicators {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: #94a3b8;
  transition: all 0.3s;
}

.step-dot.active {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.step-dot.completed {
  background: #10b981;
  color: white;
}

.step-label {
  text-align: center;
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Step Content */
.step-content {
  background: white;
  border-radius: 16px;
  padding: 24px;
  flex: 1;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.step h2 {
  margin: 0 0 20px;
  font-size: 20px;
  color: #1e293b;
}

/* Form */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

/* Calendar */
.calendar {
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-label {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  text-transform: capitalize;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s;
}

.nav-btn:hover:not(:disabled) {
  background: #5e72e4;
  color: white;
}

.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.calendar-weekdays span {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  padding: 8px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-btn {
  aspect-ratio: 1;
  border: none;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.2s;
}

.day-btn:hover:not(:disabled):not(.empty) {
  background: #5e72e4;
  color: white;
}

.day-btn.empty {
  background: transparent;
  cursor: default;
}

.day-btn.disabled {
  color: #cbd5e1;
  cursor: not-allowed;
  background: #f1f5f9;
}

.day-btn.selected {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  font-weight: 700;
}

.day-btn.today:not(.selected) {
  border: 2px solid #5e72e4;
}

.selected-date {
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.1), rgba(130, 94, 228, 0.1));
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  color: #5e72e4;
  font-size: 14px;
}

/* Search Box */
.search-box {
  margin-bottom: 16px;
}

.hint {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 12px;
}

/* Materie Grid */
.materie-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.materia-btn {
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.materia-btn:hover {
  border-color: #5e72e4;
}

.materia-btn.selected {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  border-color: transparent;
  color: white;
}

.check {
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.materia-btn.selected .check {
  background: white;
  color: #5e72e4;
  border-color: white;
}

.selected-subjects {
  background: #f0fdf4;
  padding: 12px 16px;
  border-radius: 10px;
  color: #16a34a;
  font-size: 14px;
}

/* Confirm Step */
.summary-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row .label {
  color: #64748b;
  font-size: 14px;
}

.summary-row .value {
  color: #1e293b;
  font-weight: 600;
  font-size: 14px;
  text-align: right;
}

/* Success */
.success-content {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-content h2 {
  color: #10b981;
}

.success-content p {
  color: #64748b;
  margin-bottom: 24px;
}

/* Navigation */
.navigation {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.btn-primary {
  flex: 1;
  padding: 16px 24px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-confirm {
  background: linear-gradient(135deg, #10b981, #059669);
}

.btn-secondary {
  flex: 1;
  padding: 16px 24px;
  background: white;
  color: #64748b;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #f8fafc;
}

/* Responsive */
@media (min-width: 768px) {
  .booking-page {
    max-width: 500px;
    margin: 0 auto;
    padding: 40px 20px;
  }
  
  .materie-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Duplicate Alert */
.duplicate-alert {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15));
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 20px;
}

.duplicate-alert .alert-icon {
  font-size: 40px;
  display: block;
  margin-bottom: 12px;
}

.duplicate-alert h3 {
  margin: 0 0 8px;
  color: #b45309;
  font-size: 18px;
}

.duplicate-alert p {
  margin: 0;
  color: #92400e;
  font-size: 14px;
}

/* Communication button */
.btn-communicate {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

/* Checking message */
.checking-msg {
  background: #eef2ff;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  color: #6366f1;
  font-size: 14px;
  text-align: center;
}

/* Late today (after 11:30) */
.day-btn.late-today {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
  border: 2px dashed #6366f1;
}

.duplicate-alert.late-alert {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
  border-color: #6366f1;
}

.duplicate-alert.late-alert h3 {
  color: #4f46e5;
}

.duplicate-alert.late-alert p {
  color: #6366f1;
}
</style>

