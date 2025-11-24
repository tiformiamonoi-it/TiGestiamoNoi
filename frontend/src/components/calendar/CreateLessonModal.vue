<!-- frontend/src/components/calendar/CreateLessonModal.vue -->
<template>
  <div class="modal-overlay" @click.self="handleClose">
    <div class="modal-container">
      <!-- Header -->
      <div class="modal-header">
        <h2>📚 Nuova Lezione</h2>
        <button @click="handleClose" class="btn-close">✖</button>
      </div>

      <div class="modal-body">
        <!-- Sezione 1: Data e Tutor -->
        <div class="section">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">📅 Data</label>
              <input
                v-model="formData.data"
                type="date"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">👤 Tutor</label>
              <select v-model="formData.tutorId" class="form-select" required>
                <option value="">Seleziona tutor...</option>
                <option v-for="tutor in tutors" :key="tutor.id" :value="tutor.id">
                  {{ tutor.firstName }} {{ tutor.lastName }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Sezione 2: Slot Orari Fissi -->
        <div class="section">
          <h3 class="section-title">⏰ Slot Orari Principali</h3>
          
          <div class="slots-grid">
            <SlotCard
              v-for="(slot, index) in mainSlots"
              :key="slot.id"
              :slotData="slot"
              :studenti="slot.studenti"
              :mezza-lezione="slot.mezzaLezione"
              :forza-gruppo="slot.forzaGruppo"
              @add-students="handleAddStudents(index, $event)"
              @remove-student="handleRemoveStudent(index, $event)"
              @update:mezzaLezione="slot.mezzaLezione = $event"
              @update:forzaGruppo="slot.forzaGruppo = $event"
              @duplicate="handleDuplicate(index)"
            />
          </div>
        </div>

        <!-- Sezione 3: Slot Extra -->
        <div v-if="extraSlots.length > 0" class="section">
          <h3 class="section-title">➕ Slot Extra</h3>
          
          <div class="slots-grid">
            <SlotCard
              v-for="(slot, index) in extraSlots"
              :key="slot.id"
              :slotData="slot"
              :studenti="slot.studenti"
              :mezza-lezione="slot.mezzaLezione"
              :forza-gruppo="slot.forzaGruppo"
              @add-students="handleAddExtraStudents(index, $event)"
              @remove-student="handleRemoveExtraStudent(index, $event)"
              @update:mezzaLezione="slot.mezzaLezione = $event"
              @update:forzaGruppo="slot.forzaGruppo = $event"
            />
          </div>
        </div>

        <!-- Bottone Aggiungi Slot Extra -->
        <button @click="showExtraSlotSelector = true" class="btn-add-slot">
          ➕ Aggiungi Slot Extra
        </button>

        <!-- Sezione 4: Note -->
        <div class="section">
          <label class="form-label">📝 Note (opzionale)</label>
          <textarea
            v-model="formData.note"
            class="form-textarea"
            rows="3"
            placeholder="Es: Lezione di recupero..."
          ></textarea>
        </div>

        <!-- Sezione 5: Riepilogo -->
        <div class="section summary-section">
          <h3 class="section-title">📊 Riepilogo Totale</h3>
          
          <div class="summary-card">
            <div class="summary-item">
              <span class="summary-label">Slot orari compilati:</span>
              <span class="summary-value">{{ totalSlots }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Studenti totali:</span>
              <span class="summary-value">{{ totalStudents }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Compenso totale tutor:</span>
              <span class="summary-value compensation">€{{ formatCurrency(totalCompenso) }}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Ore totali scalate:</span>
              <span class="summary-value">{{ totalHours }}h</span>
            </div>
          </div>

          <!-- Warning studenti con 0h -->
          <div v-if="studentiCon0h.length > 0" class="warning-box">
            <div class="warning-header">⚠️ Alunni con ore residue a 0h:</div>
            <div class="warning-list">
              <div v-for="item in studentiCon0h" :key="item.studentId" class="warning-item">
                • {{ item.studentName }} ({{ item.packageName }}) - 0h residue
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="handleClose" class="btn-secondary">
          Annulla
        </button>
        <button
          @click="handleSave"
          class="btn-primary"
          :disabled="!canSave || saving"
        >
          <span v-if="saving">Salvataggio...</span>
          <span v-else>💾 Salva Tutte le Lezioni</span>
        </button>
      </div>

      <!-- Modal Selettore Slot Extra -->
      <div v-if="showExtraSlotSelector" class="mini-modal-overlay" @click.self="showExtraSlotSelector = false">
        <div class="mini-modal">
          <h4>Seleziona Slot Orario</h4>
          <div class="extra-slots-list">
            <button
              v-for="slot in availableExtraSlots"
              :key="slot.id"
              @click="addExtraSlot(slot)"
              class="extra-slot-btn"
            >
              {{ slot.oraInizio }}-{{ slot.oraFine }}
            </button>
          </div>
          <button @click="showExtraSlotSelector = false" class="btn-secondary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import SlotCard from './SlotCard.vue';
import { timeslotsAPI, tutorsAPI, lessonsAPI } from '@/services/api';

const props = defineProps({
  initialDate: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
});

const emit = defineEmits(['close', 'saved']);

// ========================================
// STATE
// ========================================

const formData = ref({
  data: props.initialDate,
  tutorId: '',
  note: '',
});

const tutors = ref([]);
const allTimeSlots = ref([]);
const mainSlots = ref([]);
const extraSlots = ref([]);
const showExtraSlotSelector = ref(false);
const saving = ref(false);

// ========================================
// COMPUTED
// ========================================

const totalSlots = computed(() => {
  return [...mainSlots.value, ...extraSlots.value].filter(s => s.studenti.length > 0).length;
});

const totalStudents = computed(() => {
  let total = 0;
  mainSlots.value.forEach(slot => {
    total += slot.studenti.length;
  });
  extraSlots.value.forEach(slot => {
    total += slot.studenti.length;
  });
  return total;
});

const totalCompenso = computed(() => {
  let total = 0;
  
  const calcCompenso = (slot) => {
    const numStudenti = slot.studenti.length;
    if (numStudenti === 0) return 0;
    
    let tipo = 'SINGOLA';
    if (numStudenti > 1) {
      tipo = slot.forzaGruppo || numStudenti <= 3 ? 'GRUPPO' : 'MAXI';
    }
    
    const tariffe = {
      SINGOLA: slot.mezzaLezione ? 2.50 : 5.00,
      GRUPPO: slot.mezzaLezione ? 4.00 : 8.00,
      MAXI: slot.mezzaLezione ? 4.00 : 8.50,
    };
    
    return tariffe[tipo];
  };
  
  mainSlots.value.forEach(slot => {
    total += calcCompenso(slot);
  });
  
  extraSlots.value.forEach(slot => {
    total += calcCompenso(slot);
  });
  
  return total;
});

const totalHours = computed(() => {
  return totalStudents.value; // Ogni studente = 1h scalata
});

const studentiCon0h = computed(() => {
  const warnings = [];
  
  const checkSlot = (slot) => {
    slot.studenti.forEach(student => {
      const pacchetto = student.pacchetti?.find(p => p.tipo === 'ORE');
      if (pacchetto && parseFloat(pacchetto.oreResiduo) <= 0) {
        warnings.push({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          packageName: pacchetto.nome,
        });
      }
    });
  };
  
  mainSlots.value.forEach(checkSlot);
  extraSlots.value.forEach(checkSlot);
  
  return warnings;
});

const canSave = computed(() => {
  return (
    formData.value.data &&
    formData.value.tutorId &&
    totalSlots.value > 0
  );
});

const availableExtraSlots = computed(() => {
  const usedIds = [
    ...mainSlots.value.map(s => s.id),
    ...extraSlots.value.map(s => s.id),
  ];
  return allTimeSlots.value.filter(slot => !usedIds.includes(slot.id));
});

// ========================================
// FUNCTIONS
// ========================================

const loadTutors = async () => {
  try {
    const response = await tutorsAPI.getAll();
    tutors.value = response.data.tutors || [];
  } catch (error) {
    console.error('Errore caricamento tutor:', error);
  }
};

const loadTimeSlots = async () => {
  try {
    const response = await timeslotsAPI.getAll({ attivo: true });
    allTimeSlots.value = response.data.timeSlots || [];
    
    // Imposta i 3 slot principali fissi
    const fixedTimes = ['15:30', '16:30', '17:30'];
    mainSlots.value = fixedTimes.map(time => {
      const slot = allTimeSlots.value.find(s => s.oraInizio === time);
      return {
        ...slot,
        studenti: [],
        mezzaLezione: false,
        forzaGruppo: false,
      };
    }).filter(s => s.id); // Rimuovi null se slot non trovato
  } catch (error) {
    console.error('Errore caricamento slot:', error);
  }
};

const handleAddStudents = (slotIndex, students) => {
  mainSlots.value[slotIndex].studenti.push(...students);
};

const handleRemoveStudent = (slotIndex, studentIndex) => {
  mainSlots.value[slotIndex].studenti.splice(studentIndex, 1);
};

const handleAddExtraStudents = (slotIndex, students) => {
  extraSlots.value[slotIndex].studenti.push(...students);
};

const handleRemoveExtraStudent = (slotIndex, studentIndex) => {
  extraSlots.value[slotIndex].studenti.splice(studentIndex, 1);
};

const handleDuplicate = (slotIndex) => {
  if (slotIndex >= mainSlots.value.length - 1) {
    alert('Non ci sono slot successivi disponibili');
    return;
  }
  
  const currentSlot = mainSlots.value[slotIndex];
  const nextSlot = mainSlots.value[slotIndex + 1];
  
  nextSlot.studenti = [...currentSlot.studenti];
  nextSlot.mezzaLezione = currentSlot.mezzaLezione;
  nextSlot.forzaGruppo = currentSlot.forzaGruppo;
  
  alert(`✅ Studenti duplicati in ${nextSlot.oraInizio}-${nextSlot.oraFine}`);
};

const addExtraSlot = (slot) => {
  extraSlots.value.push({
    ...slot,
    studenti: [],
    mezzaLezione: false,
    forzaGruppo: false,
  });
  showExtraSlotSelector.value = false;
};

const handleSave = async () => {
  if (!canSave.value) return;
  
  saving.value = true;
  
  try {
    const allSlots = [...mainSlots.value, ...extraSlots.value]
      .filter(slot => slot.studenti.length > 0);
    
    // ✅ SEQUENZIALE: crea le lezioni una alla volta
    const results = [];
    for (const slot of allSlots) {
      const studentiData = slot.studenti.map(student => ({
        studentId: student.id,
        mezzaLezione: slot.mezzaLezione,
      }));
      
      const result = await lessonsAPI.create({
        tutorId: formData.value.tutorId,
        timeSlotId: slot.id,
        data: formData.value.data,
        studenti: studentiData,
        forzaGruppo: slot.forzaGruppo,
        note: formData.value.note,
      });
      
      results.push(result);
      
      console.log(`✅ Lezione ${results.length}/${allSlots.length} creata per slot ${slot.oraInizio}-${slot.oraFine}`);
    }
    
    alert(`✅ ${results.length} lezioni create con successo!`);
    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Errore salvataggio lezioni:', error);
    alert('❌ Errore durante il salvataggio delle lezioni');
  } finally {
    saving.value = false;
  }
};



const handleClose = () => {
  emit('close');
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
   MODAL OVERLAY & CONTAINER 
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
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* ======================================== 
   MODAL HEADER 
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
  font-size: 24px;
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
   MODAL BODY 
======================================== */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

/* ======================================== 
   SECTIONS 
======================================== */
.section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
}

/* ======================================== 
   FORM ELEMENTS 
======================================== */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
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

.form-textarea {
  resize: vertical;
}

/* ======================================== 
   SLOTS GRID 
======================================== */
.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 1024px) {
  .slots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .slots-grid {
    grid-template-columns: 1fr;
  }
}

/* ======================================== 
   ADD SLOT BUTTON 
======================================== */
.btn-add-slot {
  width: 100%;
  padding: 14px;
  background: #f3f4f6;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;
}

.btn-add-slot:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
  color: #374151;
}

/* ======================================== 
   SUMMARY SECTION 
======================================== */
.summary-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 0;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.summary-value.compensation {
  color: #10b981;
}

/* ======================================== 
   WARNING BOX 
======================================== */
.warning-box {
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.warning-header {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 12px;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.warning-item {
  font-size: 13px;
  color: #78350f;
}

/* ======================================== 
   MODAL FOOTER 
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
   MINI MODAL (EXTRA SLOT SELECTOR) 
======================================== */
.mini-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

.mini-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 400px;
}

.mini-modal h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #111827;
}

.extra-slots-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.extra-slot-btn {
  padding: 12px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.extra-slot-btn:hover {
  background: #e5e7eb;
  border-color: #3b82f6;
}
</style>
