<template>
  <div class="tab-slot-orari">
    <div class="tab-header">
      <div>
        <h2>🕐 Slot Orari</h2>
        <p>Gestisci gli slot orari disponibili per le lezioni</p>
      </div>
      <button class="btn-primary" @click="showAddModal = true">
        + Nuovo Slot
      </button>
    </div>

    <!-- Lista Slot -->
    <div class="slots-grid">
      <div v-if="loading" class="loading-state">
        <div class="loader"></div>
        <span>Caricamento...</span>
      </div>

      <div v-else-if="slots.length === 0" class="empty-state">
        <span class="empty-icon">🕐</span>
        <p>Nessuno slot orario configurato</p>
        <button class="btn-primary" @click="showAddModal = true">Aggiungi il primo slot</button>
      </div>

      <div v-else class="slots-list">
        <div 
          v-for="slot in slots" 
          :key="slot.id"
          :class="['slot-card', { inactive: !slot.active }]"
        >
          <div class="slot-time">
            <span class="time-start">{{ slot.oraInizio }}</span>
            <span class="time-separator">→</span>
            <span class="time-end">{{ slot.oraFine }}</span>
          </div>
          <div class="slot-actions">
            <button 
              :class="['btn-toggle', slot.active ? 'active' : 'inactive']"
              @click="toggleSlot(slot)"
              :title="slot.active ? 'Disattiva' : 'Attiva'"
            >
              {{ slot.active ? '🟢' : '🔴' }}
            </button>
            <button 
              class="btn-icon danger" 
              @click="deleteSlot(slot)" 
              title="Elimina"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div class="info-box">
      <h4>ℹ️ Come funzionano gli slot orari</h4>
      <ul>
        <li>Gli slot definiscono gli orari disponibili per le lezioni nel calendario</li>
        <li>Puoi disattivare uno slot senza eliminarlo (es. pause estive)</li>
        <li>Gli slot disattivati non appariranno nella creazione lezioni</li>
      </ul>
    </div>

    <!-- Modal Nuovo Slot -->
    <Teleport to="body" v-if="showAddModal">
      <div class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🕐 Nuovo Slot Orario</h3>
            <button class="btn-close" @click="showAddModal = false">✕</button>
          </div>
          <form @submit.prevent="createSlot" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Ora Inizio <span class="required">*</span></label>
                <input 
                  v-model="newSlot.oraInizio" 
                  type="time" 
                  class="form-input" 
                  required 
                />
              </div>
              <div class="form-group">
                <label class="form-label">Ora Fine <span class="required">*</span></label>
                <input 
                  v-model="newSlot.oraFine" 
                  type="time" 
                  class="form-input" 
                  required 
                />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="showAddModal = false">Annulla</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Salvataggio...' : '💾 Salva' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { timeslotsAPI } from '@/services/api';

const slots = ref([]);
const loading = ref(false);
const showAddModal = ref(false);
const saving = ref(false);

const newSlot = ref({
  oraInizio: '14:00',
  oraFine: '15:00'
});

async function loadSlots() {
  loading.value = true;
  try {
    const response = await timeslotsAPI.getAll();
    slots.value = response.data.timeSlots || [];
  } catch (error) {
    console.error('Errore caricamento slots:', error);
  } finally {
    loading.value = false;
  }
}

async function createSlot() {
  if (!newSlot.value.oraInizio || !newSlot.value.oraFine) return;
  
  saving.value = true;
  
  try {
    await timeslotsAPI.create({
      oraInizio: newSlot.value.oraInizio,
      oraFine: newSlot.value.oraFine
    });
    
    showAddModal.value = false;
    newSlot.value = { oraInizio: '14:00', oraFine: '15:00' };
    loadSlots();
  } catch (error) {
    console.error('Errore creazione slot:', error);
    const message = error.response?.data?.error || 'Errore durante la creazione';
    alert(`❌ ${message}`);
  } finally {
    saving.value = false;
  }
}

async function toggleSlot(slot) {
  try {
    await timeslotsAPI.toggle(slot.id, !slot.active);
    loadSlots();
  } catch (error) {
    console.error('Errore toggle slot:', error);
    alert('❌ Errore durante l\'aggiornamento');
  }
}

async function deleteSlot(slot) {
  if (!confirm(`Sei sicuro di voler eliminare lo slot ${slot.oraInizio} - ${slot.oraFine}?`)) return;
  
  try {
    await timeslotsAPI.delete(slot.id);
    loadSlots();
  } catch (error) {
    console.error('Errore eliminazione slot:', error);
    alert('❌ Errore durante l\'eliminazione');
  }
}

onMounted(() => {
  loadSlots();
});
</script>

<style scoped>
.tab-slot-orari {
  padding: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.tab-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #1e293b;
}

.tab-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Slots Grid */
.slots-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.slot-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s;
}

.slot-card:hover {
  border-color: #5e72e4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.slot-card.inactive {
  opacity: 0.6;
  background: #f1f5f9;
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-start, .time-end {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.time-separator {
  color: #94a3b8;
}

.slot-actions {
  display: flex;
  gap: 4px;
}

.btn-toggle {
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: #f1f5f9;
}

.btn-icon {
  padding: 6px 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.btn-icon.danger:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

/* Loading & Empty States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #64748b;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5e72e4;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0 0 16px;
}

/* Info Box */
.info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 16px 20px;
}

.info-box h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #0369a1;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #0c4a6e;
}

.info-box li {
  margin-bottom: 6px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.modal-container.small {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  padding: 6px 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
