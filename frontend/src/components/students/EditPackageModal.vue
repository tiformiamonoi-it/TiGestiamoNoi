<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container modal-edit-package">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>✏️ Modifica Pacchetto</h3>
            <p class="package-name">{{ packageData.nome }}</p>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <form @submit.prevent="submitUpdate" class="edit-package-form">
            <!-- ✅ Selezione Pacchetto Standard -->
            <div class="form-group">
              <label class="form-label">Pacchetto Standard *</label>
              <select 
                v-model="form.standardPackageId" 
                @change="onStandardPackageChange"
                class="form-control" 
                required
              >
                <option value="">Seleziona pacchetto standard</option>
                <option
                  v-for="stdPkg in standardPackages"
                  :key="stdPkg.id"
                  :value="stdPkg.id"
                >
                  {{ stdPkg.nome }} ({{ stdPkg.categoria }}) - €{{ parseFloat(stdPkg.prezzoStandard).toFixed(2) }}
                </option>
              </select>
              <small class="form-hint">
                Il pacchetto corrente: <strong>{{ packageData.standardPackage?.nome || 'Nessuno' }}</strong>
              </small>
            </div>

            <!-- Nome (auto-generato dal pacchetto standard, read-only) -->
            <div class="form-group">
              <label class="form-label">Nome Pacchetto</label>
              <input
                :value="selectedStandardPackage?.nome || packageData.nome"
                type="text"
                class="form-control"
                disabled
              />
              <small class="form-hint">Il nome viene dal pacchetto standard selezionato</small>
            </div>

            <!-- Tipo (auto dal pacchetto standard) -->
            <div class="form-group">
              <label class="form-label">Tipo</label>
              <input
                :value="getTypeLabel(selectedStandardPackage?.tipo || packageData.tipo)"
                type="text"
                class="form-control"
                disabled
              />
            </div>

            <!-- ✅ NUOVA SEZIONE: Giorni E Ore (entrambi visibili con ricalcolo) -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Giorni Acquistati *</label>
                <input
                  v-model.number="form.giorniAcquistati"
                  type="number"
                  step="1"
                  min="0"
                  class="form-control"
                  @input="onGiorniChange"
                  :disabled="selectedStandardPackage?.tipo === 'ORE'"
                  required
                />
                <small class="form-hint">
                  {{ selectedStandardPackage?.tipo === 'ORE' ? 'Non applicabile per pacchetti ORE' : 'Numero di giorni disponibili' }}
                </small>
              </div>

              <div class="form-group">
                <label class="form-label">Ore Totali *</label>
                <input
                  v-model.number="form.oreAcquistate"
                  type="number"
                  step="0.5"
                  min="0"
                  class="form-control"
                  @input="onOreChange"
                  required
                />
                <small class="form-hint">
                  Ore totali disponibili (calcolate automaticamente per MENSILE)
                </small>
              </div>
            </div>

            <!-- Orario Giornaliero (solo per MENSILE) -->
            <div v-if="(selectedStandardPackage?.tipo || packageData.tipo) === 'MENSILE'" class="form-group">
              <label class="form-label">Ore al Giorno *</label>
              <input
                v-model.number="form.orarioGiornaliero"
                type="number"
                step="0.5"
                min="0.5"
                class="form-control"
                @input="onOrarioGiornalieroChange"
                required
              />
              <small class="form-hint">
                Ore disponibili per ogni giorno (es: 3 ore/giorno)
              </small>
            </div>

            <!-- Prezzo Totale -->
            <div class="form-group">
              <label class="form-label">Prezzo Totale *</label>
              <input
                v-model.number="form.prezzoTotale"
                type="number"
                step="0.01"
                min="0"
                class="form-control"
                required
              />
              <small class="form-hint warning">
                ⚠️ Attenzione: Modificare il prezzo influenzerà l'importo residuo
              </small>
            </div>

            <!-- Date -->
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Data Inizio *</label>
                <input
                  v-model="form.dataInizio"
                  type="date"
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Data Scadenza</label>
                <input
                  v-model="form.dataScadenza"
                  type="date"
                  class="form-control"
                />
              </div>
            </div>

            <!-- Note -->
            <div class="form-group">
              <label class="form-label">Note</label>
              <textarea
                v-model="form.note"
                class="form-control"
                rows="3"
                placeholder="Note aggiuntive sul pacchetto..."
              ></textarea>
            </div>

            <!-- Info Importante -->
            <div class="info-box">
              <strong>ℹ️ Nota Importante:</strong>
              <ul>
                <li><strong>Ricalcolo automatico:</strong> Cambiando giorni o ore/giorno, le ore totali vengono ricalcolate</li>
                <li>Le ore/giorni residui verranno ricalcolati automaticamente dal backend</li>
                <li>I pagamenti e le lezioni associate non saranno modificati</li>
                <li>L'importo residuo verrà aggiornato in base al nuovo prezzo</li>
              </ul>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="button" @click="$emit('close')" class="btn-secondary">
                Annulla
              </button>
              <button type="submit" class="btn-primary" :disabled="submitting">
                <span v-if="submitting">Salvataggio...</span>
                <span v-else>💾 Salva Modifiche</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { packagesAPI, standardPackagesAPI } from '@/services/api';

// ========================================
// PROPS & EMITS
// ========================================

const props = defineProps({
  packageData: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'updated']);

// ========================================
// STATE
// ========================================

const submitting = ref(false);
const standardPackages = ref([]);
const selectedStandardPackage = ref(null);

const form = ref({
  standardPackageId: '',
  giorniAcquistati: 0,
  oreAcquistate: 0,
  orarioGiornaliero: 3, // Default 3h/giorno
  prezzoTotale: 0,
  dataInizio: '',
  dataScadenza: '',
  note: '',
});

// ========================================
// HELPER FUNCTIONS
// ========================================

const getTypeLabel = (tipo) => {
  return tipo === 'MENSILE' ? 'Mensile' : 'Orario';
};

// ========================================
// FUNCTIONS
// ========================================

/**
 * Carica i pacchetti standard disponibili dal backend
 */
const loadStandardPackages = async () => {
  try {
    const response = await standardPackagesAPI.getAll({ active: true });
    standardPackages.value = response.data.packages || response.data || [];
  } catch (error) {
    console.error('Errore caricamento pacchetti standard:', error);
    if (error.response?.status === 401) {
      alert('Sessione scaduta. Effettua nuovamente il login.');
      return;
    }
    alert('Impossibile caricare i pacchetti standard.');
  }
};

/**
 * ✅ AGGIORNATA: Gestisce cambio pacchetto standard
 */
const onStandardPackageChange = () => {
  const stdPkg = standardPackages.value.find(p => p.id === form.value.standardPackageId);
  if (!stdPkg) return;
  
  selectedStandardPackage.value = stdPkg;
  
  // Auto-compila campi dal pacchetto standard
  if (stdPkg.tipo === 'MENSILE') {
    form.value.giorniAcquistati = stdPkg.giorniInclusi || 20;
    form.value.orarioGiornaliero = parseFloat(stdPkg.orarioGiornaliero) || 3;
    // Calcola ore totali: giorni × ore/giorno
    form.value.oreAcquistate = form.value.giorniAcquistati * form.value.orarioGiornaliero;
  } else {
    form.value.giorniAcquistati = 0;
    form.value.oreAcquistate = parseFloat(stdPkg.oreIncluse) || 0;
    form.value.orarioGiornaliero = 0;
  }
  
  form.value.prezzoTotale = parseFloat(stdPkg.prezzoStandard) || 0;
};

/**
 * ✅ NUOVA: Ricalcola ore quando cambiano i giorni (solo MENSILE)
 */
const onGiorniChange = () => {
  const tipo = selectedStandardPackage.value?.tipo || props.packageData.tipo;
  if (tipo === 'MENSILE') {
    form.value.oreAcquistate = form.value.giorniAcquistati * form.value.orarioGiornaliero;
  }
};

/**
 * ✅ NUOVA: Ricalcola ore quando cambia orario giornaliero (solo MENSILE)
 */
const onOrarioGiornalieroChange = () => {
  const tipo = selectedStandardPackage.value?.tipo || props.packageData.tipo;
  if (tipo === 'MENSILE') {
    form.value.oreAcquistate = form.value.giorniAcquistati * form.value.orarioGiornaliero;
  }
};

/**
 * ✅ NUOVA: Quando cambiano le ore manualmente (per pacchetti ORE)
 */
const onOreChange = () => {
  const tipo = selectedStandardPackage.value?.tipo || props.packageData.tipo;
  if (tipo === 'ORE') {
    // Nessun ricalcolo necessario
  }
};

/**
 * Inizializza il form con i dati del pacchetto corrente
 */
const initForm = () => {
  form.value = {
    standardPackageId: props.packageData.standardPackageId || '',
    giorniAcquistati: parseFloat(props.packageData.giorniAcquistati) || 0,
    oreAcquistate: parseFloat(props.packageData.oreAcquistate) || 0,
    orarioGiornaliero: parseFloat(props.packageData.orarioGiornaliero) || 3,
    prezzoTotale: parseFloat(props.packageData.prezzoTotale) || 0,
    dataInizio: props.packageData.dataInizio ? props.packageData.dataInizio.split('T')[0] : '',
    dataScadenza: props.packageData.dataScadenza ? props.packageData.dataScadenza.split('T')[0] : '',
    note: props.packageData.note || '',
  };
  
  // Imposta il pacchetto standard selezionato iniziale
  if (props.packageData.standardPackage) {
    selectedStandardPackage.value = props.packageData.standardPackage;
  }
};

/**
 * ✅ AGGIORNATA: Invia l'aggiornamento con giorni E ore
 */
const submitUpdate = async () => {
  submitting.value = true;
  try {
    const selectedStdPkg = standardPackages.value.find(p => p.id === form.value.standardPackageId);
    
    if (!selectedStdPkg) {
      alert('Seleziona un pacchetto standard valido');
      submitting.value = false;
      return;
    }

    // Prepara i dati per l'update
    const updateData = {
      standardPackageId: form.value.standardPackageId,
      nome: selectedStdPkg.nome,
      tipo: selectedStdPkg.tipo,
      
      // ✅ Invia SEMPRE entrambi i campi
      giorniAcquistati: form.value.giorniAcquistati,
      oreAcquistate: form.value.oreAcquistate,
      orarioGiornaliero: selectedStdPkg.tipo === 'MENSILE' ? form.value.orarioGiornaliero : null,
      
      prezzoTotale: form.value.prezzoTotale,
      dataInizio: form.value.dataInizio,
      dataScadenza: form.value.dataScadenza || null,
      note: form.value.note,
    };

    // Ricalcola importo residuo in base al nuovo prezzo
    const nuovoImportoResiduo = form.value.prezzoTotale - parseFloat(props.packageData.importoPagato || 0);
    updateData.importoResiduo = nuovoImportoResiduo;

    // Invia aggiornamento
    await packagesAPI.update(props.packageData.id, updateData);

    alert('Pacchetto aggiornato con successo!');
    emit('updated');
    emit('close');
  } catch (error) {
    console.error('Errore aggiornamento pacchetto:', error);
    alert('Errore durante l\'aggiornamento del pacchetto. Riprova.');
  } finally {
    submitting.value = false;
  }
};

// ========================================
// LIFECYCLE
// ========================================

onMounted(async () => {
  await loadStandardPackages();
  initForm();
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-edit-package {
  max-width: 600px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.package-name {
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0 0;
}

.btn-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 6px;
}

.btn-close:hover {
  color: #111827;
  background: #f3f4f6;
}

.modal-body {
  padding: 24px;
  max-height: calc(90vh - 150px);
  overflow-y: auto;
}

/* Form */
.edit-package-form {
  display: flex;
  flex-direction: column;
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

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-control:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.form-hint.warning {
  color: #f59e0b;
  font-weight: 500;
}

/* Info Box */
.info-box {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
}

.info-box strong {
  display: block;
  margin-bottom: 8px;
  color: #1e40af;
  font-weight: 600;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  margin-bottom: 4px;
  color: #374151;
}

/* Actions */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
