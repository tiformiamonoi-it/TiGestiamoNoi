<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEdit ? '✏️ Modifica Utente' : '👤 Nuovo Utente' }}</h3>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nome <span class="required">*</span></label>
              <input v-model="form.firstName" type="text" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Cognome <span class="required">*</span></label>
              <input v-model="form.lastName" type="text" class="form-input" required />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <input v-model="form.email" type="email" class="form-input" required placeholder="email@esempio.com" />
          </div>

          <div class="form-group">
            <label class="form-label">Ruolo <span class="required">*</span></label>
            <select v-model="form.role" class="form-select" required>
              <option value="ADMIN">👑 Admin (accesso completo)</option>
              <option value="TUTOR">👨‍🏫 Tutor</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Telefono</label>
            <input v-model="form.phone" type="tel" class="form-input" placeholder="Opzionale" />
          </div>

          <div v-if="!isEdit" class="form-group">
            <label class="form-label">Password Temporanea <span class="required">*</span></label>
            <input v-model="form.password" type="text" class="form-input" required minlength="8" placeholder="Minimo 8 caratteri" />
            <span class="help-text">L'utente potrà cambiarla al primo accesso</span>
          </div>

          <div class="form-group">
            <label class="toggle-option">
              <input type="checkbox" v-model="form.active" />
              <span class="toggle-label">{{ form.active ? '🟢 Attivo' : '🔴 Non attivo' }}</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="$emit('close')">Annulla</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Salvataggio...' : '💾 Salva' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { authAPI } from '@/services/api';

const props = defineProps({
  user: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

const isEdit = computed(() => !!props.user);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'TUTOR',
  phone: '',
  password: '',
  active: true
});

const submitting = ref(false);

async function handleSubmit() {
  submitting.value = true;

  try {
    const payload = {
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      email: form.value.email,
      role: form.value.role,
      phone: form.value.phone || null,
      active: form.value.active
    };

    if (!isEdit.value) {
      payload.password = form.value.password;
    }

    if (isEdit.value) {
      await authAPI.updateUser(props.user.id, payload);
    } else {
      await authAPI.createUser(payload);
    }

    emit('saved');
  } catch (error) {
    console.error('Errore salvataggio utente:', error);
    const message = error.response?.data?.error || 'Errore durante il salvataggio';
    alert(`❌ ${message}`);
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (props.user) {
    form.value = {
      firstName: props.user.firstName || '',
      lastName: props.user.lastName || '',
      email: props.user.email || '',
      role: props.user.role || 'TUTOR',
      phone: props.user.phone || '',
      password: '',
      active: props.user.active !== false
    };
  }
});
</script>

<style scoped>
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

.modal-container {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
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
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.form-input, .form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.help-text {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
  display: block;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle-option input {
  width: 18px;
  height: 18px;
  accent-color: #5e72e4;
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

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
