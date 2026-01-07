<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <div class="modal-header">
          <h3>{{ isEdit ? '✏️ Modifica Pacchetto' : '📦 Nuovo Pacchetto' }}</h3>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <!-- Nome -->
          <div class="form-group">
            <label class="form-label">Nome Pacchetto <span class="required">*</span></label>
            <input v-model="form.nome" type="text" class="form-input" required placeholder="Es: Mensile Superiori 36h" />
          </div>

          <!-- Descrizione -->
          <div class="form-group">
            <label class="form-label">Descrizione</label>
            <textarea v-model="form.descrizione" class="form-textarea" rows="2" placeholder="Descrizione opzionale..."></textarea>
          </div>

          <!-- Tipo -->
          <div class="form-group">
            <label class="form-label">Tipo <span class="required">*</span></label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="form.tipo" value="ORE" />
                <span class="radio-label">⏱️ Orario (ore acquistate)</span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="form.tipo" value="MENSILE" />
                <span class="radio-label">📅 Mensile (giorni × ore/giorno)</span>
              </label>
            </div>
          </div>

          <!-- Categoria -->
          <div class="form-group">
            <label class="form-label">Categoria <span class="required">*</span></label>
            <select v-model="form.categoria" class="form-input" required>
              <option value="" disabled>Seleziona categoria...</option>
              <option value="Elementari">Elementari</option>
              <option value="Medie">Medie</option>
              <option value="Superiori">Superiori</option>
              <option value="Università">Università</option>
              <option value="Concorsi">Concorsi</option>
              <option value="Altro">Altro</option>
            </select>
          </div>

          <!-- Ore (per tipo ORE) -->
          <div v-if="form.tipo === 'ORE'" class="form-group">
            <label class="form-label">Ore Incluse <span class="required">*</span></label>
            <input v-model.number="form.oreIncluse" type="number" step="0.5" min="1" class="form-input" required />
          </div>

          <!-- Giorni + Ore/Giorno (per tipo MENSILE) -->
          <div v-if="form.tipo === 'MENSILE'" class="form-row">
            <div class="form-group">
              <label class="form-label">Giorni Inclusi <span class="required">*</span></label>
              <input v-model.number="form.giorniInclusi" type="number" min="1" class="form-input" required />
            </div>
            <div class="form-group">
              <label class="form-label">Ore/Giorno <span class="required">*</span></label>
              <input v-model.number="form.orarioGiornaliero" type="number" step="0.5" min="0.5" class="form-input" required />
            </div>
          </div>

          <!-- Ore Totali (calcolate per MENSILE) -->
          <div v-if="form.tipo === 'MENSILE'" class="calc-info">
            <span>Ore totali calcolate: <strong>{{ oreTotali }}h</strong></span>
          </div>

          <!-- Prezzo -->
          <div class="form-group">
            <label class="form-label">Prezzo Standard (€) <span class="required">*</span></label>
            <input v-model.number="form.prezzoStandard" type="number" step="0.01" min="0.01" class="form-input" required />
          </div>

          <!-- Stato -->
          <div class="form-group">
            <label class="form-label">Stato</label>
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
import { standardPackagesAPI } from '@/services/api';

const props = defineProps({
  package: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'saved']);

const isEdit = computed(() => !!props.package);

const form = ref({
  nome: '',
  descrizione: '',
  tipo: 'ORE',
  categoria: '',
  oreIncluse: 10,
  giorniInclusi: 20,
  orarioGiornaliero: 3,
  prezzoStandard: 100,
  active: true
});

const submitting = ref(false);

const oreTotali = computed(() => {
  if (form.value.tipo === 'MENSILE') {
    return (form.value.giorniInclusi || 0) * (form.value.orarioGiornaliero || 0);
  }
  return form.value.oreIncluse || 0;
});

async function handleSubmit() {
  submitting.value = true;

  try {
    const payload = {
      nome: form.value.nome,
      descrizione: form.value.descrizione || null,
      tipo: form.value.tipo,
      categoria: form.value.categoria,
      prezzoStandard: form.value.prezzoStandard,
      active: form.value.active
    };

    if (form.value.tipo === 'ORE') {
      payload.oreIncluse = form.value.oreIncluse;
      payload.giorniInclusi = null;
      payload.orarioGiornaliero = null;
    } else {
      payload.giorniInclusi = form.value.giorniInclusi;
      payload.orarioGiornaliero = form.value.orarioGiornaliero;
      payload.oreIncluse = oreTotali.value;
    }

    if (isEdit.value) {
      await standardPackagesAPI.update(props.package.id, payload);
    } else {
      await standardPackagesAPI.create(payload);
    }

    emit('saved');
  } catch (error) {
    console.error('Errore salvataggio:', error);
    alert('❌ Errore durante il salvataggio');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (props.package) {
    form.value = {
      nome: props.package.nome || '',
      descrizione: props.package.descrizione || '',
      tipo: props.package.tipo || 'ORE',
      categoria: props.package.categoria || '',
      oreIncluse: parseFloat(props.package.oreIncluse) || 10,
      giorniInclusi: props.package.giorniInclusi || 20,
      orarioGiornaliero: parseFloat(props.package.orarioGiornaliero) || 3,
      prezzoStandard: parseFloat(props.package.prezzoStandard) || 100,
      active: props.package.active !== false
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
  max-width: 550px;
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
  color: #1e293b;
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

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.radio-option:has(input:checked) {
  border-color: #5e72e4;
  background: rgba(94, 114, 228, 0.05);
}

.radio-option input {
  accent-color: #5e72e4;
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

.calc-info {
  padding: 10px 12px;
  background: #f0f9ff;
  border-radius: 8px;
  font-size: 13px;
  color: #0369a1;
  margin-bottom: 16px;
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
