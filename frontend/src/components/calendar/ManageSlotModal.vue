<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <div class="modal-title">
          <span class="icon">🕐</span>
          <div>
            <h2>Gestisci Slot</h2>
            <p class="subtitle">
              {{ formatDate(date) }} • {{ slotLabel }} • {{ tutorName }}
            </p>
          </div>
        </div>
        <button @click="closeModal" class="btn-close">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Caricamento...</p>
        </div>

        <!-- Contenuto -->
        <div v-else>
          <!-- Informazioni Lezione Esistente -->
          <div v-if="existingLesson" class="lesson-info">
            <div class="info-badge">
              <span class="label">Tipo:</span>
              <span class="value" :class="`type-${existingLesson.tipo.toLowerCase()}`">
                {{ existingLesson.tipo }}
              </span>
            </div>
            <div class="info-badge">
              <span class="label">Compenso tutor:</span>
              <span class="value">€{{ formatCurrency(existingLesson.compensoTutor) }}</span>
            </div>
            <div v-if="existingLesson.forzaGruppo" class="info-badge warning">
              <span class="label">⚠️ Gruppo forzato</span>
            </div>
          </div>

          <!-- Lista Studenti -->
          <div class="students-section">
            <h3 class="section-title">👥 Studenti nello slot</h3>

            <!-- Studenti aggiunti -->
            <div v-if="students.length > 0" class="students-list">
              <div
                v-for="(student, index) in students"
                :key="student.tempId || student.id"
                class="student-item"
              >
                <div class="student-info">
                  <span class="student-name">
                    📚 {{ student.firstName }} {{ student.lastName }}
                  </span>
                </div>

                <div class="student-actions">
                  <!-- Checkbox Mezza Lezione -->
                  <label class="checkbox-label">
                    <input
                      type="checkbox"
                      v-model="student.mezzaLezione"
                      @change="updateCalculations"
                    />
                    <span>½ Lezione</span>
                  </label>

                  <!-- Bottone Rimuovi -->
                  <button
                    @click="removeStudent(index)"
                    class="btn-remove"
                    title="Rimuovi studente"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-students">
              <p>Nessuno studente nello slot</p>
            </div>

            <!-- Bottone Aggiungi Studente -->
            <button @click="showStudentSearch = true" class="btn-add-student">
              + Aggiungi studente
            </button>
          </div>

          <!-- Opzioni Lezione -->
          <div class="options-section">
            <h3 class="section-title">⚙️ Opzioni</h3>

            <label class="checkbox-option">
              <input
                type="checkbox"
                v-model="forzaGruppo"
                :disabled="students.length < 2"
                @change="updateCalculations"
              />
              <span>Forza tipo GRUPPO (anche con 1 studente)</span>
            </label>
          </div>

          <!-- Preview Calcoli -->
          <div v-if="students.length > 0" class="calculations-preview">
            <h3 class="section-title">💰 Anteprima</h3>

            <div class="calc-grid">
              <div class="calc-item">
                <span class="calc-label">Tipo lezione:</span>
                <span class="calc-value" :class="`type-${calculatedType.toLowerCase()}`">
                  {{ calculatedType }}
                </span>
              </div>
              <div class="calc-item">
                <span class="calc-label">Compenso tutor:</span>
                <span class="calc-value">€{{ formatCurrency(calculatedCompenso) }}</span>
              </div>
              <div class="calc-item">
                <span class="calc-label">Numero studenti:</span>
                <span class="calc-value">{{ students.length }}</span>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="notes-section">
            <label for="note" class="notes-label">📝 Note (opzionale)</label>
            <textarea
              id="note"
              v-model="note"
              placeholder="Aggiungi note sulla lezione..."
              rows="3"
              class="notes-textarea"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="closeModal" class="btn-cancel">Annulla</button>

        <!-- Bottone Elimina (solo se lezione esistente) -->
        <button
          v-if="existingLesson"
          @click="deleteLesson"
          class="btn-delete"
          :disabled="saving"
        >
          🗑️ Elimina
        </button>

        <!-- Bottone Salva -->
        <button
          @click="saveLesson"
          class="btn-save"
          :disabled="saving || students.length === 0"
        >
          {{ saving ? 'Salvataggio...' : existingLesson ? '💾 Aggiorna' : '💾 Crea Lezione' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal Ricerca Studenti -->
  <StudentSearchModal
    v-if="showStudentSearch"
    :selected-ids="students.map(s => s.id)"
    @add-students="addStudents"
    @close="showStudentSearch = false"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { lessonsAPI } from '@/services/api';
import StudentSearchModal from './StudentSearchModal.vue';

// ========================================
// PROPS & EMITS
// ========================================

const props = defineProps({
  date: {
    type: String,
    required: true,
  },
  tutorId: {
    type: String,
    required: true,
  },
  tutorName: {
    type: String,
    required: true,
  },
  slotStart: {
    type: String,
    required: true,
  },
  slotEnd: {
    type: String,
    required: true,
  },
  timeSlotId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close', 'saved']);

// ========================================
// STATE
// ========================================

const loading = ref(true);
const saving = ref(false);
const existingLesson = ref(null);

const students = ref([]);
const forzaGruppo = ref(false);
const note = ref('');

const showStudentSearch = ref(false);

// ========================================
// COMPUTED
// ========================================

const slotLabel = computed(() => {
  return `${props.slotStart.substring(0, 5)}-${props.slotEnd.substring(0, 5)}`;
});

// Calcolo tipo lezione
const calculatedType = computed(() => {
  const num = students.value.length;
  if (num === 0) return '';
  if (num === 1) return 'SINGOLA';
  if (forzaGruppo.value || num <= 3) return 'GRUPPO';
  return 'MAXI';
});

// Calcolo compenso
const calculatedCompenso = computed(() => {
  const tipo = calculatedType.value;
  const hasMezza = students.value.some(s => s.mezzaLezione);

  const tariffe = {
    SINGOLA: hasMezza ? 2.50 : 5.00,
    GRUPPO: hasMezza ? 4.00 : 8.00,
    MAXI: hasMezza ? 4.00 : 8.50,
  };

  return tariffe[tipo] || 0;
});

// ========================================
// FUNCTIONS
// ========================================



// Carica lezione esistente
const loadExistingLesson = async () => {
  loading.value = true;
  try {
    // Cerca lezione esistente per data + tutor + slot
    const response = await lessonsAPI.getAll({
      tutorId: props.tutorId,
      dataInizio: props.date,
      dataFine: props.date,
    });

    // Trova lezione nello slot specifico
    const lesson = response.data.lessons.find(
      l => l.timeSlot?.oraInizio === props.slotStart
    );

    if (lesson) {
      existingLesson.value = lesson;
      forzaGruppo.value = lesson.forzaGruppo || false;
      note.value = lesson.note || '';

      // Popola studenti
      students.value = lesson.lessonStudents.map(ls => ({
        id: ls.student.id,
        firstName: ls.student.firstName,
        lastName: ls.student.lastName,
        mezzaLezione: ls.mezzaLezione || false,
      }));
    }
  } catch (error) {
    console.error('Errore caricamento lezione:', error);
  } finally {
    loading.value = false;
  }
};

// Aggiungi studenti dalla ricerca
const addStudents = (newStudents) => {
  newStudents.forEach(student => {
    // Evita duplicati
    if (!students.value.some(s => s.id === student.id)) {
      students.value.push({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        mezzaLezione: false,
        tempId: Date.now() + Math.random(), // ID temporaneo per v-for key
      });
    }
  });

  updateCalculations();
  showStudentSearch.value = false;
};

// Rimuovi studente
const removeStudent = (index) => {
  students.value.splice(index, 1);
  updateCalculations();
};

// Aggiorna calcoli
const updateCalculations = () => {
  // Forza re-render computed properties
  students.value = [...students.value];
};

// Salva lezione
const saveLesson = async () => {
  if (students.value.length === 0) {
    alert('Aggiungi almeno uno studente');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      tutorId: props.tutorId,
      timeSlotId: props.timeSlotId,
      data: props.date,
      studenti: students.value.map(s => ({
        studentId: s.id,
        mezzaLezione: s.mezzaLezione,
      })),
      forzaGruppo: forzaGruppo.value,
      note: note.value,
    };

    if (existingLesson.value) {
      // Aggiorna lezione esistente
      await lessonsAPI.update(existingLesson.value.id, payload);
    } else {
      // Crea nuova lezione
      await lessonsAPI.create(payload);
    }

    emit('saved');
    closeModal();
  } catch (error) {
    console.error('Errore salvataggio lezione:', error);
    alert('Errore durante il salvataggio della lezione');
  } finally {
    saving.value = false;
  }
};

// Elimina lezione
const deleteLesson = async () => {
  if (!confirm('Sei sicuro di voler eliminare questa lezione?')) return;

  saving.value = true;
  try {
    await lessonsAPI.delete(existingLesson.value.id);
    emit('saved');
    closeModal();
  } catch (error) {
    console.error('Errore eliminazione lezione:', error);
    alert('Errore durante l\'eliminazione della lezione');
  } finally {
    saving.value = false;
  }
};

// Chiudi modal
const closeModal = () => {
  emit('close');
};

// Formattazione
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
};



const formatCurrency = (value) => {
  return parseFloat(value).toFixed(2);
};

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
  loadExistingLesson();
});
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

/* Modal Container */
.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  display: flex;
  gap: 12px;
}

.modal-title .icon {
  font-size: 32px;
}

.modal-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #6b7280;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Lesson Info */
.lesson-info {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.info-badge {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
}

.info-badge .label {
  color: #6b7280;
}

.info-badge .value {
  font-weight: 600;
  color: #111827;
}

.info-badge.warning {
  background: #fef3c7;
  border-color: #fbbf24;
  color: #92400e;
}

/* Sections */
.students-section,
.options-section,
.calculations-preview,
.notes-section {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* Students List */
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
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.student-package {
  font-size: 13px;
  color: #6b7280;
}

.student-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  white-space: nowrap;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.btn-remove {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s;
  padding: 4px;
}

.btn-remove:hover {
  opacity: 1;
}

/* Empty State */
.empty-students {
  text-align: center;
  padding: 32px;
  color: #9ca3af;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
}

/* Add Student Button */
.btn-add-student {
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

.btn-add-student:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

/* Options */
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
}

.checkbox-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-option input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Calculations Preview */
.calc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.calc-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.calc-label {
  font-size: 13px;
  color: #6b7280;
}

.calc-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* Type Colors */
.type-singola { color: #3b82f6; }
.type-gruppo { color: #10b981; }
.type-maxi { color: #f59e0b; }

/* Notes */
.notes-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.notes-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.notes-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel,
.btn-delete,
.btn-save {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-delete {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.btn-delete:hover:not(:disabled) {
  background: #fecaca;
}

.btn-save {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
  flex: 1;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
}

.btn-save:disabled,
.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .student-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .student-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
