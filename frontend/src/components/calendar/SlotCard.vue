<!-- frontend/src/components/calendar/SlotCard.vue -->
<template>
  <div class="slot-card">
    <div class="slot-header">
      <span class="slot-time">🕐 {{ slotData.oraInizio }}-{{ slotData.oraFine }}</span>
      
      <button 
        v-if="studenti.length > 0" 
        @click="$emit('duplicate')" 
        class="btn-duplicate"
        title="Duplica in slot successivo"
      >
        🔄
      </button>
    </div>

    <!-- Lista studenti aggiunti -->
    <div v-if="studenti.length > 0" class="students-list">
      <div 
        v-for="(studente, index) in studenti" 
        :key="studente.id"
        class="student-item"
      >
        <span class="student-name">📚 {{ studente.firstName }} {{ studente.lastName }}</span>
        <button 
          @click="$emit('remove-student', index)" 
          class="btn-remove"
          title="Rimuovi"
        >
          ✖️
        </button>
      </div>
    </div>

    <!-- Bottone aggiungi studenti -->
    <button 
      @click="showSearch = true" 
      class="btn-add-student"
    >
      + {{ studenti.length === 0 ? 'Aggiungi studenti' : 'Aggiungi altro' }}
    </button>

    <!-- Opzioni -->
    <div class="slot-options">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="mezzaLezione"
          @change="$emit('update:mezzaLezione', $event.target.checked)"
        />
        <span>Mezza lezione</span>
      </label>

      <label class="checkbox-label">
        <input 
          type="checkbox" 
          :checked="forzaGruppo"
          @change="$emit('update:forzaGruppo', $event.target.checked)"
        />
        <span>Forza gruppo</span>
      </label>
    </div>

    <!-- Preview calcoli -->
    <div v-if="studenti.length > 0" class="slot-preview">
      <div class="preview-item">
        <span class="label">💰 Compenso:</span>
        <span class="value">€{{ formatCurrency(compenso) }}</span>
      </div>
      <div class="preview-item">
        <span class="label">🏷️ Tipo:</span>
        <span class="value" :class="`type-${tipo.toLowerCase()}`">{{ tipo }}</span>
      </div>
    </div>

    <!-- Modal ricerca studenti -->
    <StudentSearchModal
      v-if="showSearch"
      :selected-ids="studenti.map(s => s.id)"
      @add-students="handleAddStudents"
      @close="showSearch = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import StudentSearchModal from './StudentSearchModal.vue';

const props = defineProps({
  slotData: {
    type: Object,
    required: true,
  },
  studenti: {
    type: Array,
    default: () => [],
  },
  mezzaLezione: {
    type: Boolean,
    default: false,
  },
  forzaGruppo: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'add-students',
  'remove-student',
  'update:mezzaLezione',
  'update:forzaGruppo',
  'duplicate',
]);

const showSearch = ref(false);

// Calcolo tipo lezione
const tipo = computed(() => {
  const num = props.studenti.length;
  if (num === 0) return '';
  if (num === 1) return 'SINGOLA';
  if (props.forzaGruppo || num <= 3) return 'GRUPPO';
  return 'MAXI';
});

// Calcolo compenso
const compenso = computed(() => {
  const tipoLezione = tipo.value;
  const mezza = props.mezzaLezione;
  
  const tariffe = {
    SINGOLA: mezza ? 2.50 : 5.00,
    GRUPPO: mezza ? 4.00 : 8.00,
    MAXI: mezza ? 4.00 : 8.50,
  };
  
  return tariffe[tipoLezione] || 0;
});

const handleAddStudents = (students) => {
  emit('add-students', students);
  showSearch.value = false;
};

const formatCurrency = (value) => {
  return parseFloat(value).toFixed(2);
};
</script>

<style scoped>
.slot-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 200px;
}

.slot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.slot-time {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.btn-duplicate {
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-duplicate:hover {
  background: #dbeafe;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
}

.student-name {
  color: #374151;
}

.btn-remove {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-remove:hover {
  opacity: 1;
}

.btn-add-student {
  width: 100%;
  padding: 10px;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-student:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.slot-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.slot-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  margin-top: auto;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.preview-item .label {
  color: #6b7280;
}

.preview-item .value {
  font-weight: 600;
  color: #111827;
}

.type-singola { color: #3b82f6; }
.type-gruppo { color: #10b981; }
.type-maxi { color: #f59e0b; }
</style>
