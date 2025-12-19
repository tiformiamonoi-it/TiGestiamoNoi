<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ tutor ? '✏️ Modifica Dati Tutor' : '➕ Nuovo Tutor' }}</h3>
          <button class="btn-close" @click="close">×</button>
        </div>

        <div class="modal-body">
          <!-- Duplicate Warning -->
          <div v-if="duplicateWarning" class="duplicate-warning">
            <span>⚠️</span>
            <div>
              <strong>Possibile duplicato trovato!</strong>
              <p>{{ duplicateWarning }}</p>
              <label class="confirm-duplicate">
                <input type="checkbox" v-model="confirmDuplicate" />
                Procedi comunque con la creazione
              </label>
            </div>
          </div>

          <form @submit.prevent="save" class="edit-form">
            <div class="form-group">
              <label>Nome *</label>
              <input 
                v-model="form.firstName" 
                type="text" 
                required 
                @blur="checkDuplicate"
                placeholder="Mario"
              />
            </div>
            <div class="form-group">
              <label>Cognome *</label>
              <input 
                v-model="form.lastName" 
                type="text" 
                required 
                @blur="checkDuplicate"
                placeholder="Rossi"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" placeholder="email@esempio.it" />
            </div>
            <div class="form-group">
              <label>Telefono</label>
              <input v-model="form.phone" type="tel" placeholder="+39 333 1234567" />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="form.active" type="checkbox" />
                Attivo
              </label>
            </div>
          </form>

          <!-- Note about subjects -->
          <div v-if="!tutor" class="info-note">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <span>Le materie potranno essere aggiunte nel dettaglio del tutor dopo la creazione.</span>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn-secondary">Annulla</button>
          <button 
            @click="save" 
            class="btn-primary"
            :disabled="!canSave"
          >
            {{ tutor ? 'Salva Modifiche' : 'Crea Tutor' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import api from '@/services/api';

const props = defineProps({
  isOpen: Boolean,
  tutor: Object
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  active: true
});

const duplicateWarning = ref('');
const confirmDuplicate = ref(false);

const canSave = computed(() => {
  if (!form.value.firstName || !form.value.lastName) return false;
  if (duplicateWarning.value && !confirmDuplicate.value) return false;
  return true;
});

watch(() => props.isOpen, (val) => {
  if (val) {
    duplicateWarning.value = '';
    confirmDuplicate.value = false;
    if (props.tutor) {
      form.value = { ...props.tutor };
    } else {
      form.value = {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        active: true
      };
    }
  }
});

async function checkDuplicate() {
  if (!form.value.firstName || !form.value.lastName || props.tutor) return;
  
  try {
    const response = await api.get('/tutors/check-duplicate', {
      params: {
        firstName: form.value.firstName,
        lastName: form.value.lastName
      }
    });
    
    if (response.data.exists) {
      duplicateWarning.value = `Esiste già un tutor con nome "${response.data.tutor.firstName} ${response.data.tutor.lastName}"`;
    } else {
      duplicateWarning.value = '';
    }
  } catch (e) {
    console.error('Errore check duplicato:', e);
  }
}

function close() {
  emit('close');
}

function save() {
  if (!canSave.value) return;
  emit('save', form.value);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}

.modal-container {
  background: white; border-radius: 12px; width: 90%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-header {
  padding: 20px; border-bottom: 1px solid #e9ecef;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-header h3 { margin: 0; font-size: 18px; color: #344767; }

.btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #8392ab; }

.modal-body { padding: 24px; }

.edit-form { display: flex; flex-direction: column; gap: 16px; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

.form-group label { font-size: 13px; font-weight: 600; color: #344767; }

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"] {
  padding: 10px; border: 1px solid #e9ecef; border-radius: 8px; font-size: 14px;
}

.form-group input:focus { outline: none; border-color: #5e72e4; }

.checkbox-group label {
  display: flex; align-items: center; gap: 8px; cursor: pointer; flex-direction: row;
}

.checkbox-group input[type="checkbox"] {
  width: 18px; height: 18px; accent-color: #5e72e4;
}

.duplicate-warning {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  margin-bottom: 16px;
}

.duplicate-warning span { font-size: 20px; }
.duplicate-warning strong { color: #856404; }
.duplicate-warning p { margin: 4px 0 8px 0; font-size: 13px; color: #856404; }

.confirm-duplicate {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 500; color: #856404; cursor: pointer;
}

.info-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #e7f3ff;
  border-radius: 8px;
  font-size: 13px;
  color: #0066cc;
}

.info-note svg { flex-shrink: 0; }

.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e9ecef;
  display: flex; justify-content: flex-end; gap: 12px;
  background: #f8f9fa; border-radius: 0 0 12px 12px;
}

.btn-primary { 
  padding: 10px 20px; background: linear-gradient(135deg, #5e72e4, #825ee4); 
  color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3); }

.btn-secondary { padding: 10px 20px; background: white; color: #344767; border: 1px solid #e9ecef; border-radius: 8px; font-weight: 600; cursor: pointer; }
</style>

