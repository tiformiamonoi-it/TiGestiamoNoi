<template>
  <div class="tab-chiusure">
    <div class="section-header">
      <h2>🚫 Giorni di Chiusura</h2>
      <p class="section-desc">Gestisci i giorni in cui non si effettuano lezioni (festività, vacanze, ecc.)</p>
    </div>

    <!-- Form Aggiungi -->
    <div class="add-form">
      <div class="form-row">
        <div class="form-group">
          <label>Data</label>
          <input type="date" v-model="newDate" :min="todayDate" />
        </div>
        <div class="form-group flex-grow">
          <label>Descrizione (opzionale)</label>
          <input type="text" v-model="newDescription" placeholder="Es: Natale, Pasqua, Vacanze estive..." />
        </div>
        <button class="add-btn" @click="addClosure" :disabled="!newDate || saving">
          {{ saving ? 'Salvataggio...' : '+ Aggiungi' }}
        </button>
      </div>
    </div>

    <!-- Lista chiusure -->
    <div class="closures-list">
      <div v-if="loading" class="loading">Caricamento...</div>
      
      <div v-else-if="closures.length === 0" class="empty-state">
        Nessuna chiusura programmata
      </div>
      
      <div v-else class="closures-grid">
        <div v-for="closure in closures" :key="closure.id" class="closure-card" :class="{ past: isPast(closure.date) }">
          <div class="closure-date">
            <span class="day">{{ formatDay(closure.date) }}</span>
            <span class="month">{{ formatMonth(closure.date) }}</span>
            <span class="year">{{ formatYear(closure.date) }}</span>
          </div>
          <div class="closure-info">
            <span class="closure-desc">{{ closure.description || 'Chiusura' }}</span>
            <span class="closure-weekday">{{ formatWeekday(closure.date) }}</span>
          </div>
          <button class="delete-btn" @click="deleteClosure(closure.id)" title="Rimuovi">
            🗑️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { closuresAPI } from '@/services/api';

// State
const closures = ref([]);
const loading = ref(true);
const saving = ref(false);
const newDate = ref('');
const newDescription = ref('');

// Computed
const todayDate = computed(() => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
});

// Methods
function formatDay(dateStr) {
  return dateStr.split('-')[2];
}

function formatMonth(dateStr) {
  const months = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const month = parseInt(dateStr.split('-')[1]) - 1;
  return months[month];
}

function formatYear(dateStr) {
  return dateStr.split('-')[0];
}

function formatWeekday(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('it-IT', { weekday: 'long' });
}

function isPast(dateStr) {
  return dateStr < todayDate.value;
}

async function loadClosures() {
  loading.value = true;
  try {
    const response = await closuresAPI.getAll();
    closures.value = response.data.closures || [];
  } catch (err) {
    console.error('Errore caricamento chiusure:', err);
  } finally {
    loading.value = false;
  }
}

async function addClosure() {
  if (!newDate.value) return;
  
  saving.value = true;
  try {
    await closuresAPI.add(newDate.value, newDescription.value);
    newDate.value = '';
    newDescription.value = '';
    await loadClosures();
  } catch (err) {
    console.error('Errore aggiunta chiusura:', err);
    alert(err.response?.data?.error || 'Errore durante l\'aggiunta');
  } finally {
    saving.value = false;
  }
}

async function deleteClosure(id) {
  if (!confirm('Rimuovere questa chiusura?')) return;
  
  try {
    await closuresAPI.delete(id);
    await loadClosures();
  } catch (err) {
    console.error('Errore rimozione chiusura:', err);
    alert('Errore durante la rimozione');
  }
}

onMounted(() => {
  loadClosures();
});
</script>

<style scoped>
.tab-chiusure {
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1e293b;
}

.section-desc {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.add-form {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group.flex-grow {
  flex: 1;
}

.form-group label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.add-btn {
  padding: 10px 20px;
  background: #5e72e4;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.add-btn:hover:not(:disabled) {
  background: #4c5fd7;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
  background: #f8fafc;
  border-radius: 12px;
}

.closures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.closure-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.2s;
}

.closure-card:hover {
  border-color: #5e72e4;
}

.closure-card.past {
  opacity: 0.5;
}

.closure-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px;
  padding: 8px;
  background: #fef3c7;
  border-radius: 8px;
}

.closure-date .day {
  font-size: 20px;
  font-weight: 700;
  color: #d97706;
  line-height: 1;
}

.closure-date .month {
  font-size: 11px;
  font-weight: 600;
  color: #d97706;
  text-transform: uppercase;
}

.closure-date .year {
  font-size: 10px;
  color: #92400e;
}

.closure-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.closure-desc {
  font-weight: 600;
  color: #1e293b;
}

.closure-weekday {
  font-size: 12px;
  color: #64748b;
  text-transform: capitalize;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-btn:hover {
  opacity: 1;
}

@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .add-btn {
    margin-top: 8px;
  }
}
</style>
