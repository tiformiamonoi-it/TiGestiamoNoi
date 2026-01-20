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
          <input type="tel" v-model="form.studentPhone" placeholder="+39 333 1234567" class="form-input" @input="verifyError = ''" />
        </div>

        <!-- Messaggio errore verifica -->
        <div v-if="verifyError" class="verify-error">
          <span class="error-icon">⚠️</span>
          <p>{{ verifyError }}</p>
        </div>

        <div v-if="verifyingStudent" class="verifying-msg">
          ⏳ Verifico i tuoi dati...
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
                'late-today': day && isTodayLate(day),
                'has-booking': day && hasBookingOnDate(day)
              }]"
              :disabled="!day || !isDateSelectable(day) || checkingDuplicate"
              @click="handleDateClick(day)"
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

      <!-- Step Modifica Prenotazione Esistente (quando ha una prenotazione e può modificare) -->
      <div v-if="currentStep === 2 && isDuplicate && !isLateTodayMode" class="step step-edit-booking">
        <div class="edit-booking-header">
          <span class="alert-icon">📝</span>
          <h3>Hai già una prenotazione per il {{ formatSelectedDate }}</h3>
        </div>
        
        <p class="hint">Le tue materie prenotate:</p>
        
        <div class="editable-subjects">
          <div 
            v-for="subject in editableSubjects" 
            :key="subject" 
            class="editable-subject"
          >
            <span>{{ subject }}</span>
            <button class="remove-btn" @click="removeSubjectFromEdit(subject)" :disabled="savingChanges">
              🗑️
            </button>
          </div>
          <div v-if="editableSubjects.length === 0" class="no-subjects">
            ⚠️ Tutte le materie rimosse - la prenotazione verrà annullata
          </div>
        </div>

        <!-- Aggiungi altre materie -->
        <div class="add-subjects-section">
          <p class="hint">➕ Aggiungi altre materie:</p>
          <div class="available-subjects-grid">
            <button
              v-for="materia in availableSubjectsToAdd"
              :key="materia"
              class="subject-add-btn"
              @click="addSubjectToEdit(materia)"
              :disabled="savingChanges"
            >
              {{ materia }}
            </button>
          </div>
          <p v-if="availableSubjectsToAdd.length === 0" class="all-added-msg">
            ✅ Hai già aggiunto tutte le materie disponibili
          </p>
        </div>
        
        <div class="edit-actions">
          <button class="btn-secondary" @click="cancelEditAndGoBack" :disabled="savingChanges">
            ← Scegli altro giorno
          </button>
          <button 
            class="btn-primary" 
            @click="saveBookingChanges" 
            :disabled="savingChanges"
          >
            {{ savingChanges ? 'Salvataggio...' : (editableSubjects.length === 0 ? '🗑️ Conferma Annullamento' : '✅ Salva Modifiche') }}
          </button>
        </div>
      </div>

      <!-- Step Comunicazione Tardiva - SOLO quando è oggi dopo le 11:00 -->
      <div v-if="currentStep === 2 && isLateTodayMode" class="step step-communication">
        <div class="duplicate-alert late-alert">
          <span class="alert-icon">⌛</span>
          <h3>Sono passate le 11:00</h3>
          <p>Per prenotazioni in giornata, puoi solo inviare una comunicazione.</p>
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
      
      <!-- Bottone Comunicazione (solo se oggi dopo le 11:00) -->
      <button 
        v-if="currentStep === 2 && isLateTodayMode" 
        class="btn-primary btn-communicate" 
        @click="submitCommunication"
        :disabled="submitting || !form.notes"
      >
        {{ submitting ? 'Invio...' : '📨 Invia Comunicazione' }}
      </button>
      
      <!-- Bottone Avanti normale (nascondi in modalità modifica - le materie si gestiscono nel pannello) -->
      <button 
        v-else-if="currentStep < 4 && !(currentStep === 2 && isDuplicate && !isLateTodayMode)" 
        class="btn-primary" 
        @click="nextStep"
        :disabled="!canProceed || checkingDuplicate || verifyingStudent"
      >
        {{ verifyingStudent ? 'Verifico...' : 'Avanti →' }}
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
const verifyingStudent = ref(false);
const verifyError = ref('');

// Prenotazioni esistenti dell'utente
const userBookings = ref([]);
const editingBooking = ref(null);
const editableSubjects = ref([]);
const savingChanges = ref(false);

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

// Check if we're in late-today mode (today after 11:00 - only for NEW bookings today)
const isLateTodayMode = computed(() => {
  if (!form.value.requestedDate) return false;
  // Late mode solo per OGGI dopo le 11:00
  const date = form.value.requestedDate;
  const today = new Date();
  if (date.toDateString() !== today.toDateString()) return false;
  return !isTodayBookingAllowed();
});

// Check if booking can still be modified (until 11:00 on the booking day)
const canEditBooking = computed(() => {
  if (!form.value.requestedDate || !editingBooking.value) return false;
  
  const bookingDate = form.value.requestedDate;
  const today = new Date();
  
  // Se la prenotazione è per un giorno futuro: sempre modificabile
  if (bookingDate.toDateString() !== today.toDateString()) {
    return true;
  }
  
  // Se la prenotazione è per oggi: modificabile solo prima delle 11:00
  const cutoffHour = 11;
  return today.getHours() < cutoffHour;
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

// Check if same-day booking is allowed (before 11:00)
function isTodayBookingAllowed() {
  const now = new Date();
  const cutoffHour = 11;
  return now.getHours() < cutoffHour;
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
  editingBooking.value = null;
  editableSubjects.value = [];
  
  // Force communication mode if today after 11:30
  const isLateToday = isTodayLate(date);
  if (isLateToday) {
    isDuplicate.value = true;
    existingBooking.value = { subjects: ['Comunicazione tardiva'] };
    return;
  }
  
  // Check for existing booking in userBookings (loaded after verification)
  const existingInUserBookings = getBookingForDate(date);
  if (existingInUserBookings) {
    isDuplicate.value = true;
    existingBooking.value = existingInUserBookings;
    editingBooking.value = existingInUserBookings;
    editableSubjects.value = [...existingInUserBookings.subjects];
    return;
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

async function nextStep() {
  if (!canProceed.value || currentStep.value >= 4) return;
  
  // Step 1 → 2: verifica studente prima di procedere
  if (currentStep.value === 1) {
    verifyingStudent.value = true;
    verifyError.value = '';
    
    try {
      const response = await bookingAPI.verifyStudent({
        studentName: form.value.studentName,
        studentSurname: form.value.studentSurname,
        studentPhone: form.value.studentPhone
      });
      
      if (response.data.authorized) {
        // Verifica OK - carica prenotazioni esistenti
        try {
          const bookingsRes = await bookingAPI.getMyBookings(form.value.studentPhone);
          userBookings.value = bookingsRes.data.bookings || [];
        } catch (e) {
          console.error('Errore caricamento prenotazioni:', e);
          userBookings.value = [];
        }
        currentStep.value++;
      } else {
        // Verifica fallita - mostra errore
        verifyError.value = response.data.error || 'Errore durante la verifica';
      }
    } catch (error) {
      console.error('Errore verifica studente:', error);
      verifyError.value = error.response?.data?.error || 'Errore di connessione. Riprova.';
    } finally {
      verifyingStudent.value = false;
    }
  } else {
    // Altri step: procedi normalmente
    currentStep.value++;
  }
}

// Controlla se c'è una prenotazione in una data
function hasBookingOnDate(date) {
  if (!date) return false;
  return userBookings.value.some(b => {
    const bookingDate = new Date(b.requestedDate);
    return bookingDate.toDateString() === date.toDateString();
  });
}

// Ottieni la prenotazione per una data
function getBookingForDate(date) {
  if (!date) return null;
  return userBookings.value.find(b => {
    const bookingDate = new Date(b.requestedDate);
    return bookingDate.toDateString() === date.toDateString();
  });
}

// Modifica funzione selectDate per gestire prenotazioni esistenti
async function handleDateClick(date) {
  if (!isDateSelectable(date)) return;
  await selectDate(date);
}

// Annulla modifica e torna a selezionare un altro giorno
function cancelEditAndGoBack() {
  editingBooking.value = null;
  editableSubjects.value = [];
  existingBooking.value = null;
  isDuplicate.value = false;
  form.value.requestedDate = null;
}

// Rimuovi materia dalla lista modificabile
function removeSubjectFromEdit(subject) {
  editableSubjects.value = editableSubjects.value.filter(s => s !== subject);
}

// Aggiungi materia alla lista modificabile
function addSubjectToEdit(subject) {
  if (!editableSubjects.value.includes(subject)) {
    editableSubjects.value.push(subject);
  }
}

// Materie disponibili da aggiungere (escluse quelle già selezionate)
const availableSubjectsToAdd = computed(() => {
  return materie.value.filter(m => !editableSubjects.value.includes(m));
});

// Salva modifiche prenotazione
async function saveBookingChanges() {
  if (!editingBooking.value) return;
  
  savingChanges.value = true;
  try {
    await bookingAPI.updateSubjects(
      editingBooking.value.id,
      editableSubjects.value,
      form.value.studentPhone
    );
    
    // Aggiorna lista prenotazioni
    const bookingsRes = await bookingAPI.getMyBookings(form.value.studentPhone);
    userBookings.value = bookingsRes.data.bookings || [];
    
    // Mostra messaggio di successo
    const wasCancelled = editableSubjects.value.length === 0;
    alert(wasCancelled ? '✅ Prenotazione annullata!' : '✅ Modifiche salvate!');
    
    // Reset completo e torna allo step 1
    resetForm();
  } catch (error) {
    console.error('Errore salvataggio:', error);
    alert(error.response?.data?.error || 'Errore durante il salvataggio');
  } finally {
    savingChanges.value = false;
  }
}

// Annulla modifica (chiudi pannello)
function cancelEdit() {
  editingBooking.value = null;
  editableSubjects.value = [];
  form.value.requestedDate = null;
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
  editingBooking.value = null;
  editableSubjects.value = [];
  userBookings.value = [];
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

/* Verification Error */
.verify-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
  border: 2px solid #ef4444;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.verify-error .error-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.verify-error p {
  margin: 0;
  color: #dc2626;
  font-size: 14px;
  line-height: 1.5;
}

/* Verifying message */
.verifying-msg {
  background: #eef2ff;
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 16px;
  color: #6366f1;
  font-size: 14px;
  text-align: center;
}

/* Calendar - Has existing booking (light pastel blue) */
.day-btn.has-booking {
  background: rgba(147, 197, 253, 0.4);
  border: 2px solid #93c5fd;
  color: #1e40af;
  font-weight: 600;
}

.day-btn.has-booking:hover:not(:disabled) {
  background: rgba(147, 197, 253, 0.6);
}

/* Edit Booking Panel */
.edit-booking-panel {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1));
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
}

.edit-booking-panel h3 {
  margin: 0 0 8px;
  color: #1e40af;
  font-size: 18px;
}

.editable-subjects {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0;
}

.editable-subject {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.editable-subject span {
  font-weight: 500;
  color: #1e293b;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.remove-btn:hover:not(:disabled) {
  background: #fef2f2;
}

.remove-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-subjects {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
  padding: 12px 16px;
  color: #dc2626;
  font-size: 14px;
  text-align: center;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Edit Booking Header */
.edit-booking-header {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(99, 102, 241, 0.15));
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
}

.edit-booking-header .alert-icon {
  font-size: 28px;
}

.edit-booking-header h3 {
  margin: 0;
  color: #1e40af;
  font-size: 16px;
}

.step-edit-booking {
  /* Inherits from .step */
}

/* Add Subjects Section */
.add-subjects-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #cbd5e1;
}

.available-subjects-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.subject-add-btn {
  padding: 8px 14px;
  border: 2px solid #22c55e;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 20px;
  color: #16a34a;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.subject-add-btn:hover:not(:disabled) {
  background: rgba(34, 197, 94, 0.2);
  transform: scale(1.02);
}

.subject-add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.all-added-msg {
  color: #16a34a;
  font-size: 13px;
  margin-top: 12px;
  text-align: center;
}
</style>

