<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h3>✏️ Modifica Dati Tutor</h3>
          <button class="btn-close" @click="close">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="save" class="edit-form">
            <div class="form-group">
              <label>Nome</label>
              <input v-model="form.firstName" type="text" required />
            </div>
            <div class="form-group">
              <label>Cognome</label>
              <input v-model="form.lastName" type="text" required />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="form.email" type="email" required />
            </div>
            <div class="form-group">
              <label>Telefono</label>
              <input v-model="form.phone" type="tel" />
            </div>
            <div class="form-group checkbox-group">
              <label>
                <input v-model="form.active" type="checkbox" />
                Attivo
              </label>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn-secondary">Annulla</button>
          <button @click="save" class="btn-primary">Salva Modifiche</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

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

watch(() => props.isOpen, (val) => {
  if (val && props.tutor) {
    form.value = { ...props.tutor };
  }
});

function close() {
  emit('close');
}

function save() {
  emit('save', form.value);
  close();
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

.form-group input {
  padding: 10px; border: 1px solid #e9ecef; border-radius: 8px; font-size: 14px;
}

.form-group input:focus { outline: none; border-color: #5e72e4; }

.checkbox-group label {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
}

.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e9ecef;
  display: flex; justify-content: flex-end; gap: 12px;
  background: #f8f9fa; border-radius: 0 0 12px 12px;
}

.btn-primary { padding: 10px 20px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 10px 20px; background: white; color: #344767; border: 1px solid #e9ecef; border-radius: 8px; font-weight: 600; cursor: pointer; }
</style>
