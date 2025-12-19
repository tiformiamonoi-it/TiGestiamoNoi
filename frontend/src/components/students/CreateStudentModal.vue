<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="handleClose">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <h2>{{ isEditMode ? '✏️ Modifica Alunno' : '➕ Nuovo Alunno' }}</h2>
          <button @click="handleClose" class="btn-close">✖</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <!-- Sezione Dati Alunno -->
            <div class="section">
              <h3 class="section-title">👤 Dati Alunno</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Nome <span class="required">*</span></label>
                  <input
                    v-model="formData.firstName"
                    type="text"
                    class="form-input"
                    placeholder="Es: Mario"
                    required
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Cognome <span class="required">*</span></label>
                  <input
                    v-model="formData.lastName"
                    type="text"
                    class="form-input"
                    placeholder="Es: Rossi"
                    required
                  />
                </div>
              </div>

                        <!-- ✅ AGGIUNGI QUESTO -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Telefono Alunno (opzionale)</label>
                <input
                  v-model="formData.studentPhone"
                  type="tel"
                  class="form-input"
                  placeholder="Es: 333 1234567"
                />
              </div>

               <div class="form-group">
                    <label class="form-label">Email Alunno (opzionale)</label>
                    <input
                      v-model="formData.studentEmail"
                      type="email"
                      class="form-input"
                      placeholder="mario@email.com"
                    />
                  </div>
                </div>

              <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Classe</label>
                        <select
                        v-model="formData.classe"
                        class="form-select"
                        >
                        <option value="">Seleziona classe...</option>
                        <optgroup label="Elementari">
                            <option value="1° Elementare">1° Elementare</option>
                            <option value="2° Elementare">2° Elementare</option>
                            <option value="3° Elementare">3° Elementare</option>
                            <option value="4° Elementare">4° Elementare</option>
                            <option value="5° Elementare">5° Elementare</option>
                        </optgroup>
                        <optgroup label="Medie">
                            <option value="1° Media">1° Media</option>
                            <option value="2° Media">2° Media</option>
                            <option value="3° Media">3° Media</option>
                        </optgroup>
                        <optgroup label="Superiori">
                            <option value="1° Superiore">1° Superiore</option>
                            <option value="2° Superiore">2° Superiore</option>
                            <option value="3° Superiore">3° Superiore</option>
                            <option value="4° Superiore">4° Superiore</option>
                            <option value="5° Superiore">5° Superiore</option>
                        </optgroup>
                        <optgroup label="Altro">
                            <option value="Università">Università</option>
                            <option value="Concorsi">Concorsi</option>
                        </optgroup>
                        </select>
                    </div>

                <div class="form-group">
                  <label class="form-label">Scuola</label>
                  <input
                    v-model="formData.scuola"
                    type="text"
                    class="form-input"
                    placeholder="Es: IC Manzoni"
                  />
                </div>
              </div>
            </div>

            <!-- Sezione Dati Genitore (Opzionali) -->
            <div class="section">
              <h3 class="section-title">👨‍👩‍👦 Dati Genitore/Tutore (opzionali)</h3>
              
              <div class="form-group">
                <label class="form-label">Nome Genitore</label>
                <input
                  v-model="formData.parentName"
                  type="text"
                  class="form-input"
                  placeholder="Es: Laura Conti"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input
                    v-model="formData.parentEmail"
                    type="email"
                    class="form-input"
                    placeholder="laura.conti@email.com"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Telefono</label>
                  <input
                    v-model="formData.parentPhone"
                    type="tel"
                    class="form-input"
                    placeholder="333 1234567"
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Indirizzo</label>
                <input
                  v-model="formData.parentIndirizzo"
                  type="text"
                  class="form-input"
                  placeholder="Via Roma, 123"
                />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Città</label>
                  <input
                    v-model="formData.parentCitta"
                    type="text"
                    class="form-input"
                    placeholder="Milano"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">CAP</label>
                  <input
                    v-model="formData.parentCap"
                    type="text"
                    class="form-input"
                    placeholder="20100"
                    maxlength="5"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Codice Fiscale</label>
                  <input
                    v-model="formData.parentCF"
                    type="text"
                    class="form-input"
                    placeholder="RSSMRA80A01H501Z"
                    maxlength="16"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">Partita IVA (opzionale)</label>
                  <input
                    v-model="formData.parentPIva"
                    type="text"
                    class="form-input"
                    placeholder="12345678901"
                    maxlength="11"
                  />
                </div>
              </div>
            </div>

            <!-- Sezione Note e BES -->
            <div class="section">
              <h3 class="section-title">📝 Note e Bisogni Speciali</h3>
              
              <div class="form-group">
                <label class="form-label">Bisogni Speciali / BES (opzionale)</label>
                <input
                  v-model="formData.bisogniSpeciali"
                  type="text"
                  class="form-input"
                  placeholder="Es: DSA, discalculia, ADHD..."
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Note</label>
                <textarea
                  v-model="formData.note"
                  class="form-textarea"
                  rows="3"
                  placeholder="Eventuali note o informazioni aggiuntive..."
                ></textarea>
              </div>
              
              <div v-if="!isEditMode" class="referral-note">
                ℹ️ Il campo <strong>Referral</strong> (chi ha portato questo alunno) può essere compilato nel dettaglio alunno dopo la creazione.
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="handleClose" class="btn-secondary" type="button">
            Annulla
          </button>
          <button
            @click="handleSubmit"
            class="btn-primary"
            :disabled="saving || !canSave"
          >
            <span v-if="saving">Salvataggio...</span>
            <span v-else>{{ isEditMode ? '💾 Salva Modifiche' : '➕ Crea Alunno' }}</span>
          </button>
        </div>
      </div>
      
      <!-- Modale Conferma Duplicato -->
      <div v-if="showDuplicateModal" class="duplicate-modal-overlay" @click.self="showDuplicateModal = false">
        <div class="duplicate-modal">
          <h3>⚠️ Attenzione - Possibile Duplicato</h3>
          <p>Esiste già un alunno con nome <strong>{{ formData.firstName }} {{ formData.lastName }}</strong>:</p>
          <ul class="duplicate-list">
            <li v-for="dup in duplicateStudents" :key="dup.id">
              {{ dup.firstName }} {{ dup.lastName }}
              <span v-if="dup.classe"> - {{ dup.classe }}</span>
              <span v-if="dup.scuola"> ({{ dup.scuola }})</span>
              <span :class="dup.active ? 'badge-active' : 'badge-inactive'">
                {{ dup.active ? 'Attivo' : 'Inattivo' }}
              </span>
            </li>
          </ul>
          <p>Vuoi continuare comunque e creare un nuovo alunno?</p>
          <div class="duplicate-modal-actions">
            <button @click="showDuplicateModal = false" class="btn-secondary">Annulla</button>
            <button @click="confirmCreateDespiteDuplicate" class="btn-warning">Crea Comunque</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { studentsAPI } from '@/services/api';

const props = defineProps({
  student: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'saved']);

// ========================================
// STATE
// ========================================

const saving = ref(false);
const showDuplicateModal = ref(false);
const duplicateStudents = ref([]);
const skipDuplicateCheck = ref(false);

const formData = ref({
  firstName: '',
  lastName: '',
  classe: '',
  scuola: '',
  studentPhone: '',
  studentEmail: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  parentIndirizzo: '',
  parentCitta: '',
  parentCap: '',
  parentCF: '',
  parentPIva: '',
  note: '',
  bisogniSpeciali: '',
  active: true,
});

// ========================================
// COMPUTED
// ========================================

const isEditMode = computed(() => !!props.student);

const canSave = computed(() => {
  return formData.value.firstName.trim() && formData.value.lastName.trim();
});

// ========================================
// WATCH
// ========================================

// Precompila form in modalità modifica
watch(
  () => props.student,
  (student) => {
    if (student) {
      formData.value = {
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        classe: student.classe || '',
        scuola: student.scuola || '',
        studentPhone: student.studentPhone || '',
        studentEmail: student.studentEmail || '',
        parentName: student.parentName || '',
        parentEmail: student.parentEmail || '',
        parentPhone: student.phone || student.parentPhone || '',
        parentIndirizzo: student.parentIndirizzo || '',
        parentCitta: student.parentCitta || '',
        parentCap: student.parentCap || '',
        parentCF: student.parentCF || '',
        parentPIva: student.parentPIva || '',
        note: student.note || '',
        bisogniSpeciali: student.bisogniSpeciali || '',
        active: student.active !== undefined ? student.active : true,
      };
    }
  },
  { immediate: true }
);

// ========================================
// FUNCTIONS
// ========================================

const handleSubmit = async () => {
  if (!canSave.value || saving.value) return;

  // Check duplicati solo in creazione e se non abbiamo già saltato
  if (!isEditMode.value && !skipDuplicateCheck.value) {
    try {
      const { data } = await studentsAPI.checkDuplicate(
        formData.value.firstName.trim(),
        formData.value.lastName.trim()
      );
      
      if (data.hasDuplicate) {
        duplicateStudents.value = data.duplicates;
        showDuplicateModal.value = true;
        return;
      }
    } catch (error) {
      console.error('Errore check duplicati:', error);
      // Continua comunque se il check fallisce
    }
  }

  await performSave();
};

const confirmCreateDespiteDuplicate = async () => {
  showDuplicateModal.value = false;
  skipDuplicateCheck.value = true;
  await performSave();
};

const performSave = async () => {
  saving.value = true;

  try {
    const payload = {
      firstName: formData.value.firstName.trim(),
      lastName: formData.value.lastName.trim(),
      classe: formData.value.classe.trim() || null,
      scuola: formData.value.scuola.trim() || null,
      studentPhone: formData.value.studentPhone.trim() || null,
      studentEmail: formData.value.studentEmail.trim() || null,
      parentName: formData.value.parentName.trim() || null,
      parentEmail: formData.value.parentEmail.trim() || null,
      parentPhone: formData.value.parentPhone.trim() || null,
      parentIndirizzo: formData.value.parentIndirizzo.trim() || null,
      parentCitta: formData.value.parentCitta.trim() || null,
      parentCap: formData.value.parentCap.trim() || null,
      parentCF: formData.value.parentCF.trim() || null,
      parentPIva: formData.value.parentPIva.trim() || null,
      note: formData.value.note.trim() || null,
      bisogniSpeciali: formData.value.bisogniSpeciali.trim() || null,
      active: formData.value.active,
    };

    if (isEditMode.value) {
      await studentsAPI.update(props.student.id, payload);
      alert('✅ Alunno modificato con successo!');
    } else {
      await studentsAPI.create(payload);
      alert('✅ Alunno creato con successo!');
    }

    emit('saved');
    handleClose();
  } catch (error) {
    console.error('Errore salvataggio studente:', error);
    alert('❌ Errore durante il salvataggio');
  } finally {
    saving.value = false;
    skipDuplicateCheck.value = false;
  }
};

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
/* Modal Overlay */
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
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Header */
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #111827;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

/* Sections */
.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

/* Form Elements */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-input,
.form-textarea {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #5e72e4;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Footer */
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
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  border: none;
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}


.form-select {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.form-select:focus {
  outline: none;
  border-color: #5e72e4;
}

.form-select optgroup {
  font-weight: 600;
  color: #374151;
}

.form-select option {
  padding: 8px;
}

/* Referral Note */
.referral-note {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  font-size: 13px;
  color: #0369a1;
  line-height: 1.5;
}

/* Duplicate Modal */
.duplicate-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2100;
}

.duplicate-modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.duplicate-modal h3 {
  margin: 0 0 16px 0;
  color: #b45309;
  font-size: 18px;
}

.duplicate-modal p {
  margin: 0 0 12px 0;
  color: #374151;
  font-size: 14px;
}

.duplicate-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
}

.duplicate-list li {
  padding: 10px 12px;
  background: #fef3c7;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #92400e;
}

.badge-active {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.badge-inactive {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.duplicate-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-warning {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  background: #f59e0b;
  border: none;
  color: white;
  transition: all 0.2s;
}

.btn-warning:hover {
  background: #d97706;
}

</style>
