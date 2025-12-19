<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>📚 Gestisci Materie</h3>
            <p class="modal-subtitle">Seleziona le materie e i livelli di competenza</p>
          </div>
          <button class="btn-close" @click="close">×</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <div class="subjects-list">
            <div v-for="subject in subjects" :key="subject.id" class="subject-item">
              <div class="subject-main">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="subject.selected" />
                  <span class="subject-name">{{ subject.name }}</span>
                </label>
              </div>
              
              <div v-if="subject.selected" class="levels-group">
                <label class="level-chip">
                  <input type="checkbox" v-model="subject.levels.medie" />
                  <span>Medie</span>
                </label>
                <label class="level-chip">
                  <input type="checkbox" v-model="subject.levels.superiori" />
                  <span>Superiori</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Add New -->
          <div class="add-subject-section">
            <select v-model="newSubject" class="form-control">
              <option value="">Seleziona materia...</option>
              <option v-for="s in availableSubjects" :key="s" :value="s">{{ s }}</option>
            </select>
            <button class="btn-icon-add" @click="addSubject" :disabled="!newSubject">+</button>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="close" class="btn-secondary">Annulla</button>
          <button @click="save" class="btn-primary">💾 Salva</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { configAPI } from '@/services/api';

const props = defineProps({
  isOpen: Boolean,
  initialSubjects: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

const subjects = ref([]);
const newSubject = ref('');
const configMaterie = ref([]);
const loadingMaterie = ref(false);

// Load subjects from settings
async function loadMaterieFromConfig() {
  loadingMaterie.value = true;
  try {
    const response = await configAPI.getAll({ category: 'materie' });
    configMaterie.value = response.data.configs || [];
  } catch (error) {
    console.error('Errore caricamento materie:', error);
  } finally {
    loadingMaterie.value = false;
  }
}

// Available subjects from config (not already added)
const availableSubjects = computed(() => {
  const addedNames = subjects.value.map(s => s.name.toLowerCase());
  return configMaterie.value
    .map(c => c.value)
    .filter(name => !addedNames.includes(name.toLowerCase()));
});

watch(() => props.isOpen, async (val) => {
  if (val) {
    // Load materie from config if not already loaded
    if (configMaterie.value.length === 0) {
      await loadMaterieFromConfig();
    }
    
    // Clone initial subjects and ensure structure
    subjects.value = props.initialSubjects.map(s => ({
      ...s,
      levels: s.levels || { medie: true, superiori: true }
    }));
  }
});

onMounted(() => {
  loadMaterieFromConfig();
});

function addSubject() {
  if (!newSubject.value) return;
  
  // Check if already exists
  if (subjects.value.some(s => s.name.toLowerCase() === newSubject.value.toLowerCase())) {
    alert('Materia già presente in lista');
    return;
  }

  subjects.value.push({
    id: newSubject.value.toLowerCase().replace(/\s+/g, '_'),
    name: newSubject.value,
    selected: true,
    levels: { medie: true, superiori: true }
  });
  
  newSubject.value = '';
}

function close() {
  emit('close');
}

function save() {
  const selected = subjects.value.filter(s => s.selected);
  emit('save', selected);
  close();
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
  max-height: 85vh;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex; justify-content: space-between; align-items: flex-start;
}

.modal-title h3 { margin: 0; font-size: 18px; color: #344767; }
.modal-subtitle { margin: 4px 0 0 0; font-size: 13px; color: #8392ab; }

.btn-close {
  background: none; border: none; font-size: 24px; color: #8392ab; cursor: pointer;
}

.modal-body { padding: 24px; overflow-y: auto; }

.subjects-list { display: flex; flex-direction: column; gap: 16px; }

.subject-item {
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s;
}

.subject-item:hover { border-color: #5e72e4; }

.subject-main { margin-bottom: 8px; }

.checkbox-label {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px; height: 18px; accent-color: #5e72e4;
}

.subject-name { font-weight: 600; color: #344767; }

.levels-group {
  display: flex; gap: 8px; padding-left: 28px;
}

.level-chip {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #e9ecef;
}

.level-chip:has(input:checked) {
  background: rgba(94, 114, 228, 0.1);
  border-color: #5e72e4;
  color: #5e72e4;
  font-weight: 600;
}

.add-subject-section {
  margin-top: 24px; padding-top: 24px; border-top: 1px solid #e9ecef;
  display: flex; gap: 8px;
}

.form-control {
  flex: 1; padding: 8px; border: 1px solid #e9ecef; border-radius: 6px;
}

.btn-icon-add {
  width: 36px; height: 36px; background: #5e72e4; color: white;
  border: none; border-radius: 6px; font-size: 20px; cursor: pointer;
}

.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e9ecef;
  display: flex; justify-content: flex-end; gap: 12px;
  background: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
}

.btn-primary {
  padding: 10px 20px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
}

.btn-secondary {
  padding: 10px 20px; background: white; color: #344767; border: 1px solid #e9ecef; border-radius: 8px; font-weight: 600; cursor: pointer;
}
</style>
