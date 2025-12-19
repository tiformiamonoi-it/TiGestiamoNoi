<template>
  <div class="availability-page">
    <!-- Header con Logo -->
    <header class="availability-header">
      <img src="/logo.png" alt="Ti Formiamo Noi" class="logo" />
      <h1>Disponibilità Tutor</h1>
    </header>

    <!-- Step 1: Verifica Telefono -->
    <div v-if="!tutorVerified" class="step-container">
      <div class="step-card">
        <h2>📱 Inserisci il tuo numero</h2>
        <p class="hint">Inserisci il numero di telefono registrato nel sistema</p>
        
        <div class="form-group">
          <input 
            type="tel" 
            v-model="phone" 
            placeholder="+39 333 1234567" 
            class="form-input"
            @keyup.enter="checkPhone"
          />
        </div>

        <button 
          class="btn-primary" 
          @click="checkPhone" 
          :disabled="!phone || checking"
        >
          {{ checking ? 'Verifico...' : '🔍 Verifica' }}
        </button>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>
    </div>

    <!-- Step 2: Calendario Disponibilità -->
    <div v-else-if="!saved" class="step-container">
      <div class="step-card">
        <div class="tutor-info">
          <h2>👋 Ciao {{ tutorName }}!</h2>
          <p>Seleziona i giorni in cui sei disponibile</p>
        </div>

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
                selected: day && isDateSelected(day),
                today: day && isToday(day)
              }]"
              :disabled="!day || !isDateSelectable(day)"
              @click="toggleDate(day)"
            >
              {{ day?.getDate() || '' }}
            </button>
        </div>
        </div>

        <!-- Lista giorni selezionati con note -->
        <div v-if="selectedDatesArray.length > 0" class="selected-days-list">
          <h3>📅 Giorni selezionati ({{ selectedDatesArray.length }})</h3>
          <div v-for="dateKey in selectedDatesArray" :key="dateKey" class="selected-day-item">
            <div class="selected-day-header">
              <span class="day-label">{{ formatDisplayDate(dateKey) }}</span>
              <button class="remove-btn" @click="removeDate(dateKey)">✕</button>
            </div>
            <input
              type="text"
              v-model="dayData[dateKey].notes"
              :placeholder="'Note per ' + formatDisplayDate(dateKey)"
              class="day-notes-input"
            />
          </div>
        </div>

        <div v-else class="no-selection">
          <p>👆 Clicca sui giorni per selezionarli, oppure conferma per rimuovere tutte le disponibilità</p>
        </div>

        <button 
          class="btn-primary btn-confirm" 
          @click="saveAvailability" 
          :disabled="saving"
        >
          {{ saving ? 'Salvataggio...' : (selectedDatesArray.length > 0 ? '✅ Conferma Disponibilità' : '❌ Rimuovi Disponibilità') }}
        </button>

        <button class="btn-link" @click="resetForm">
          ← Cambia numero
        </button>
      </div>
    </div>

    <!-- Step 3: Conferma -->
    <div v-else class="step-container">
      <div class="step-card success-card">
        <div class="success-icon">{{ savedCount > 0 ? '✅' : '🗑️' }}</div>
        <h2>{{ savedCount > 0 ? 'Disponibilità salvata!' : 'Disponibilità rimosse!' }}</h2>
        <p>{{ savedCount > 0 ? `Hai confermato ${savedCount} giorni di disponibilità.` : 'Tutte le disponibilità sono state rimosse.' }}</p>
        <button class="btn-primary" @click="resetForm">🔄 Modifica Disponibilità</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { availabilityAPI } from '@/services/api';

// State
const phone = ref('');
const tutorVerified = ref(false);
const tutorName = ref('');
const dayData = ref({}); // Object: { "2025-12-10": { notes: "..." }, ... }
const saved = ref(false);
const savedCount = ref(0); // Contatore per messaggio successo
const checking = ref(false);
const saving = ref(false);
const error = ref('');

// Calendar state
const currentMonth = ref(new Date());
const weekdays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

// Computed
const selectedDatesArray = computed(() => Object.keys(dayData.value).sort());

const monthLabel = computed(() => {
  return currentMonth.value.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
});

const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Adjust for Monday start
  let startDayOfWeek = firstDay.getDay() - 1;
  if (startDayOfWeek < 0) startDayOfWeek = 6;
  
  const days = [];
  
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  
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

// Methods
// Format date as YYYY-MM-DD using LOCAL timezone (not UTC)
function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Check if today's availability can still be set (before 13:00)
function isTodayAvailabilityAllowed() {
  const now = new Date();
  return now.getHours() < 13;
}

function isDateSelectable(date) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Past dates not selectable
  if (date < today) return false;
  
  // Today after 13:00 - not selectable
  if (date.toDateString() === today.toDateString() && !isTodayAvailabilityAllowed()) {
    return false;
  }
  
  // Weekends not selectable
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;
  
  return true;
}

function isDateSelected(date) {
  if (!date) return false;
  return dayData.value.hasOwnProperty(formatDateKey(date));
}

function isToday(date) {
  if (!date) return false;
  return date.toDateString() === new Date().toDateString();
}

function toggleDate(date) {
  if (!isDateSelectable(date)) return;
  
  const key = formatDateKey(date);
  if (dayData.value[key]) {
    delete dayData.value[key];
  } else {
    dayData.value[key] = { notes: '' };
  }
}

function removeDate(dateKey) {
  delete dayData.value[dateKey];
}

function formatDisplayDate(dateKey) {
  const date = new Date(dateKey + 'T00:00:00');
  return date.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
}

function prevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1);
}

async function checkPhone() {
  if (!phone.value) return;
  
  error.value = '';
  checking.value = true;
  
  try {
    const response = await availabilityAPI.checkPhone(phone.value);
    
    if (response.data.found) {
      tutorName.value = response.data.tutor.name;
      
      // Carica disponibilità esistenti
      const availResponse = await availabilityAPI.get(phone.value);
      const existingData = availResponse.data.availabilities || [];
      
      // Popola dayData con le disponibilità esistenti
      dayData.value = {};
      existingData.forEach(item => {
        dayData.value[item.date] = { notes: item.notes || '' };
      });
      
      // Pre-seleziona oggi se non già selezionato
      const todayKey = formatDateKey(new Date());
      if (!dayData.value[todayKey] && isDateSelectable(new Date())) {
        dayData.value[todayKey] = { notes: '' };
      }
      
      tutorVerified.value = true;
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Numero non trovato';
  } finally {
    checking.value = false;
  }
}

async function saveAvailability() {
  saving.value = true;
  
  try {
    // Prepara dati: array di { date, notes }
    const dataToSave = Object.entries(dayData.value).map(([date, data]) => ({
      date,
      notes: data.notes || ''
    }));
    
    // Salva il conteggio prima di inviare
    savedCount.value = dataToSave.length;
    
    await availabilityAPI.save(phone.value, dataToSave);
    saved.value = true;
  } catch (err) {
    console.error('Errore salvataggio:', err);
    alert('Errore durante il salvataggio. Riprova.');
  } finally {
    saving.value = false;
  }
}

function resetForm() {
  tutorVerified.value = false;
  saved.value = false;
  dayData.value = {};
  currentMonth.value = new Date();
}
</script>

<style scoped>
.availability-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* Header */
.availability-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo {
  max-width: 150px;
  height: auto;
  margin-bottom: 12px;
}

.availability-header h1 {
  color: #1e293b;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

/* Step Container */
.step-container {
  flex: 1;
  display: flex;
  justify-content: center;
}

.step-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.step-card h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1e293b;
}

.hint {
  color: #64748b;
  font-size: 14px;
  margin: 0 0 20px;
}

/* Form */
.form-group {
  margin-bottom: 16px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  box-sizing: border-box;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

/* Tutor info */
.tutor-info {
  margin-bottom: 20px;
}

.tutor-info p {
  color: #64748b;
  margin: 4px 0 0;
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
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 700;
}

.day-btn.today:not(.selected) {
  border: 2px solid #5e72e4;
}

/* Summary */
.selected-summary {
  background: #f0fdf4;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  color: #16a34a;
  font-size: 14px;
}

/* Buttons */
.btn-primary {
  width: 100%;
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

.btn-link {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
}

.btn-link:hover {
  color: #5e72e4;
}

/* Error */
.error-msg {
  color: #ef4444;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
}

/* Success */
.success-card {
  text-align: center;
}

.success-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.success-card h2 {
  color: #10b981;
}

.success-card p {
  color: #64748b;
  margin-bottom: 20px;
}

/* Responsive */
@media (min-width: 768px) {
  .availability-page {
    max-width: 500px;
    margin: 0 auto;
    padding: 40px 20px;
  }
}

/* Textarea */
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

/* Selected days list with per-day notes */
.selected-days-list {
  margin-bottom: 20px;
}

.selected-days-list h3 {
  font-size: 16px;
  color: #1e293b;
  margin: 0 0 12px;
}

.selected-day-item {
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 10px;
}

.selected-day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-label {
  font-weight: 600;
  color: #1e293b;
  text-transform: capitalize;
}

.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
}

.day-notes-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.day-notes-input:focus {
  outline: none;
  border-color: #5e72e4;
}

.no-selection {
  background: #f8fafc;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 16px;
}

.no-selection p {
  color: #64748b;
  margin: 0;
}
</style>
