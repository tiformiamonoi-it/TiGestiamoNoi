<!-- frontend/src/components/calendar/AddQuickLessonModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2>⚡ Aggiungi Lezione Rapida</h2>
        <button @click="$emit('close')" class="btn-close">✖</button>
      </div>

      <div class="modal-body">
        <!-- Data (readonly) -->
        <div class="form-group">
          <label class="form-label">📅 Data</label>
          <input
            :value="formatDate(date)"
            type="text"
            class="form-input"
            readonly
          />
        </div>

        <!-- Tutor -->
        <div class="form-group">
          <label class="form-label">👤 Tutor</label>
          <select 
            v-model="formData.tutorId" 
            class="form-select" 
            required
          >
            <option value="">Seleziona tutor...</option>
            <option v-for="tutor in tutors" :key="tutor.id" :value="tutor.id">
              {{ tutor.firstName }} {{ tutor.lastName }}
            </option>
          </select>
        </div>

        <!-- Slot Orario -->
        <div class="form-group">
          <label class="form-label">🕐 Slot Orario</label>
          <select 
            v-model="formData.timeSlotId" 
            class="form-select" 
            required
          >
            <option value="">Seleziona orario...</option>
            <option v-for="slot in timeSlots" :key="slot.id" :value="slot.id">
              {{ slot.oraInizio.substring(0, 5) }} - {{ slot.oraFine.substring(0, 5) }}
            </option>
          </select>
          <div v-if="existingStudentsInfo" class="info-message">
            ℹ️ {{ existingStudentsInfo }}
          </div>
        </div>

        <!-- Studenti -->
        <div class="form-group">
          <label class="form-label">👥 Studenti</label>
          
          <div v-if="formData.studenti.length > 0" class="students-list">
            <div 
              v-for="(student, index) in formData.studenti" 
              :key="student.id"
              class="student-item"
            >
              <span class="student-name">
                📚 {{ student.firstName }} {{ student.lastName }}
              </span>
              <button 
                @click="removeStudent(index)" 
                class="btn-remove"
                type="button"
              >
                ✖
              </button>
            </div>
          </div>

          <button 
            @click="showStudentSearch = true" 
            class="btn-add-students"
            type="button"
          >
            + {{ formData.studenti.length === 0 ? 'Aggiungi studenti (obbligatorio)' : 'Aggiungi altro studente' }}
          </button>
        </div>

        <!-- Opzioni -->
        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="formData.mezzaLezione"
            />
            <span>Mezza lezione (30 min)</span>
          </label>

          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="formData.forzaGruppo"
            />
            <span>Forza tipo gruppo</span>
          </label>
        </div>

        <!-- Note -->
        <div class="form-group">
          <label class="form-label">📝 Note (opzionale)</label>
          <textarea
            v-model="formData.note"
            class="form-textarea"
            rows="2"
            placeholder="Es: Lezione di recupero..."
          ></textarea>
        </div>

        <!-- Preview -->
        <div v-if="formData.studenti.length > 0" class="preview-box">
          <div class="preview-item">
            <span class="label">💰 Compenso tutor:</span>
            <span class="value">€{{ formatCurrency(compensoTutor) }}</span>
          </div>
          <div class="preview-item">
            <span class="label">🏷️ Tipo lezione:</span>
            <span class="value" :class="`type-${tipoLezione.toLowerCase()}`">
              {{ tipoLezione }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">
          Annulla
        </button>
        <button
          @click="handleSave"
          class="btn-primary"
          :disabled="!canSave || saving"
        >
          <span v-if="saving">Salvataggio...</span>
          <span v-else>💾 Salva Lezione</span>
        </button>
      </div>

      <!-- Modal Ricerca Studenti -->
      <StudentSearchModal
        v-if="showStudentSearch"
        :selected-ids="[...formData.studenti.map(s => s.id), ...existingStudentIds]"
        @add-students="handleAddStudents"
        @close="showStudentSearch = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import StudentSearchModal from './StudentSearchModal.vue';
import { timeslotsAPI, tutorsAPI, lessonsAPI } from '@/services/api';

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close', 'saved']);

// ========================================
// STATE
// ========================================

const formData = ref({
  tutorId: '',
  timeSlotId: '',
  studenti: [],
  mezzaLezione: false,
  forzaGruppo: false,
  note: '',
});

const tutors = ref([]);
const timeSlots = ref([]);
const showStudentSearch = ref(false);
const saving = ref(false);
const duplicateError = ref(null);
const existingStudentsInfo = ref(null);
const existingStudentIds = ref([]);
const existingLessonId = ref(null);

// ========================================
// WATCH - Carica info slot esistente
// ========================================

watch(
  () => [formData.value.tutorId, formData.value.timeSlotId],
  async ([tutorId, timeSlotId]) => {
    existingStudentsInfo.value = null;
    existingStudentIds.value = [];
    existingLessonId.value = null;
    duplicateError.value = null;
    
    if (!tutorId || !timeSlotId) return;
    
    try {
      const response = await lessonsAPI.checkDuplicate(tutorId, props.date, timeSlotId);
      if (response.data.existingStudentIds?.length > 0) {
        existingStudentIds.value = response.data.existingStudentIds;
        existingLessonId.value = response.data.existingLessonId;
        existingStudentsInfo.value = `Slot già ha: ${response.data.existingStudentNames.join(', ')}`;
      }
    } catch (error) {
      console.error('Errore verifica slot:', error);
    }
  }
);

// ========================================
// COMPUTED
// ========================================

const tipoLezione = computed(() => {
  const num = formData.value.studenti.length;
  if (num === 0) return '';
  if (num === 1) return formData.value.forzaGruppo ? 'GRUPPO' : 'SINGOLA';
  if (num <= 3) return 'GRUPPO';
  return 'MAXI';
});

const compensoTutor = computed(() => {
  const tipo = tipoLezione.value;
  const mezza = formData.value.mezzaLezione;
  
  const tariffe = {
    SINGOLA: mezza ? 2.50 : 5.00,
    GRUPPO: mezza ? 4.00 : 8.00,
    MAXI: mezza ? 4.00 : 8.50,
  };
  
  return tariffe[tipo] || 0;
});

const canSave = computed(() => {
  return (
    formData.value.tutorId &&
    formData.value.timeSlotId &&
    formData.value.studenti.length > 0 &&
    !duplicateError.value
  );
});

// ========================================
// FUNCTIONS
// ========================================

const loadTutors = async () => {
  try {
    const response = await tutorsAPI.getAll();
    tutors.value = response.data.data || response.data.tutors || [];
  } catch (error) {
    console.error('Errore caricamento tutor:', error);
  }
};

const loadTimeSlots = async () => {
  try {
    const response = await timeslotsAPI.getAll({ attivo: true });
    timeSlots.value = response.data.timeSlots || [];
  } catch (error) {
    console.error('Errore caricamento slot:', error);
  }
};

const handleAddStudents = (students) => {
  // Filtra studenti già presenti nello slot
  const duplicates = students.filter(s => existingStudentIds.value.includes(s.id));
  const validStudents = students.filter(s => !existingStudentIds.value.includes(s.id));
  
  if (duplicates.length > 0) {
    const duplicateNames = duplicates.map(s => `${s.firstName} ${s.lastName}`).join(', ');
    duplicateError.value = `Studenti già presenti in questo slot: ${duplicateNames}`;
    
    // Aggiungi comunque gli studenti validi
    if (validStudents.length > 0) {
      formData.value.studenti.push(...validStudents);
    }
  } else {
    formData.value.studenti.push(...students);
    duplicateError.value = null;
  }
  
  showStudentSearch.value = false;
};

const removeStudent = (index) => {
  formData.value.studenti.splice(index, 1);
};

const handleSave = async () => {
  if (!canSave.value) {
    alert('⚠️ Compila tutti i campi obbligatori:\n- Tutor\n- Slot orario\n- Almeno 1 studente');
    return;
  }

  saving.value = true;

  try {
    // Prepara i dati degli studenti - combina quelli nuovi con quelli esistenti
    const newStudentiData = formData.value.studenti.map(student => ({
      studentId: student.id,
      mezzaLezione: formData.value.mezzaLezione,
    }));

    const payload = {
      tutorId: formData.value.tutorId,
      timeSlotId: formData.value.timeSlotId,
      data: props.date,
      forzaGruppo: formData.value.forzaGruppo,
      note: formData.value.note,
    };

    if (existingLessonId.value) {
      // Lezione esistente: combina studenti esistenti con nuovi e fai UPDATE
      const existingStudentiData = existingStudentIds.value.map(id => ({
        studentId: id,
        mezzaLezione: formData.value.mezzaLezione,
      }));
      payload.studenti = [...existingStudentiData, ...newStudentiData];
      
      await lessonsAPI.update(existingLessonId.value, payload);
      alert('✅ Studenti aggiunti alla lezione esistente!');
    } else {
      // Nuova lezione: crea
      payload.studenti = newStudentiData;
      await lessonsAPI.create(payload);
      alert('✅ Lezione creata con successo!');
    }

    emit('saved');
  } catch (error) {
    console.error('Errore salvataggio:', error);
    alert('❌ Errore durante il salvataggio della lezione');
  } finally {
    saving.value = false;
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const formatter = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return formatter.format(date);
};

const formatCurrency = (value) => {
  return parseFloat(value).toFixed(2);
};

onMounted(() => {
  loadTutors();
  loadTimeSlots();
});
</script>

<style scoped>
/* ======================================== 
   MODAL BASE
======================================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* ======================================== 
   HEADER
======================================== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #111827;
}

/* ======================================== 
   BODY
======================================== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

/* ======================================== 
   FORM
======================================== */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-input[readonly] {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
}

/* ======================================== 
   STUDENTS LIST
======================================== */
.students-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.student-name {
  color: #374151;
  font-weight: 500;
}

.btn-remove {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #dc2626;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 4px 8px;
}

.btn-remove:hover {
  opacity: 1;
}

.btn-add-students {
  width: 100%;
  padding: 12px;
  background: #f3f4f6;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-students:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
  color: #374151;
}

/* ======================================== 
   CHECKBOX
======================================== */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  margin-bottom: 8px;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* ======================================== 
   PREVIEW
======================================== */
.preview-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  margin-bottom: 8px;
}

.preview-item:last-child {
  margin-bottom: 0;
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

/* ======================================== 
   FOOTER
======================================== */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 32px;
  border-top: 2px solid #e5e7eb;
}

.btn-secondary,
.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ======================================== 
   ERROR STATES
======================================== */
.form-select.error {
  border-color: #dc2626;
  background-color: #fef2f2;
}

.error-message {
  color: #dc2626;
  font-size: 13px;
  margin-top: 6px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 6px;
  border: 1px solid #fecaca;
}

.info-message {
  color: #1d4ed8;
  font-size: 13px;
  margin-top: 6px;
  padding: 8px 12px;
  background: #eff6ff;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}
</style>
