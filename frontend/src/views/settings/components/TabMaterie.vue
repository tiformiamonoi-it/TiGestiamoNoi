<template>
  <div class="tab-materie">
    <div class="tab-header">
      <div>
        <h2>📚 Materie</h2>
        <p>Gestisci le materie insegnate</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        + Nuova Materia
      </button>
    </div>

    <!-- Lista Materie -->
    <div class="materie-grid">
      <div v-if="loading" class="loading-state">
        <div class="loader"></div>
        <span>Caricamento...</span>
      </div>

      <div v-else-if="materie.length === 0" class="empty-state">
        <span class="empty-icon">📚</span>
        <p>Nessuna materia configurata</p>
        <button class="btn-primary" @click="openModal()">Aggiungi la prima materia</button>
      </div>

      <div v-else class="materie-list">
        <div 
          v-for="materia in materie" 
          :key="materia.key"
          class="materia-card"
        >
          <div class="materia-info">
            <span class="materia-name">{{ materia.value }}</span>
          </div>
          <div class="materia-actions">
            <button class="btn-icon" @click="editMateria(materia)" title="Modifica">✏️</button>
            <button class="btn-icon danger" @click="deleteMateria(materia)" title="Elimina">🗑️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuova/Modifica Materia -->
    <Teleport to="body" v-if="showModal">
      <div class="modal-overlay" @click.self="closeModal">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>{{ editingMateria ? '✏️ Modifica Materia' : '📚 Nuova Materia' }}</h3>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>
          <form @submit.prevent="saveMateria" class="modal-body">
            <div class="form-group">
              <label class="form-label">Nome Materia <span class="required">*</span></label>
              <input 
                v-model="formMateria" 
                type="text" 
                class="form-input" 
                required 
                placeholder="Es: Matematica, Inglese..."
                ref="inputRef"
              />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">Annulla</button>
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
import { ref, onMounted, nextTick } from 'vue';
import { configAPI } from '@/services/api';

const materie = ref([]);
const loading = ref(false);
const showModal = ref(false);
const editingMateria = ref(null);
const formMateria = ref('');
const saving = ref(false);
const inputRef = ref(null);

async function loadMaterie() {
  loading.value = true;
  try {
    const response = await configAPI.getAll({ category: 'materie' });
    materie.value = response.data.configs || [];
  } catch (error) {
    console.error('Errore caricamento materie:', error);
  } finally {
    loading.value = false;
  }
}

function openModal() {
  formMateria.value = '';
  editingMateria.value = null;
  showModal.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function editMateria(materia) {
  formMateria.value = materia.value;
  editingMateria.value = materia;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  formMateria.value = '';
  editingMateria.value = null;
}

async function saveMateria() {
  if (!formMateria.value.trim()) return;
  
  saving.value = true;
  
  try {
    if (editingMateria.value) {
      // Modifica esistente
      await configAPI.update(editingMateria.value.key, { 
        value: formMateria.value.trim() 
      });
    } else {
      // Nuova materia - crea con chiave unica
      const key = `materia_${Date.now()}`;
      await configAPI.create({
        key,
        value: formMateria.value.trim(),
        category: 'materie',
        description: 'Materia insegnata'
      });
    }
    
    closeModal();
    loadMaterie();
  } catch (error) {
    console.error('Errore salvataggio materia:', error);
    alert('❌ Errore durante il salvataggio');
  } finally {
    saving.value = false;
  }
}

async function deleteMateria(materia) {
  // TODO: Controllare se materia è assegnata a tutor/alunni
  
  if (!confirm(`Sei sicuro di voler eliminare "${materia.value}"?`)) return;
  
  try {
    await configAPI.delete(materia.key);
    loadMaterie();
  } catch (error) {
    console.error('Errore eliminazione materia:', error);
    alert('❌ Errore durante l\'eliminazione');
  }
}

onMounted(() => {
  loadMaterie();
});
</script>

<style scoped>
.tab-materie {
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

/* Materie Grid */
.materie-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.materia-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  transition: all 0.2s;
}

.materia-card:hover {
  border-color: #5e72e4;
  background: #fafaff;
}

.materia-name {
  font-weight: 600;
  color: #1e293b;
}

.materia-actions {
  display: flex;
  gap: 4px;
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
