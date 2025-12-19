<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>🔄 Rinnovo Bulk</h3>
            <p class="subtitle">{{ packages.length }} pacchetti selezionati</p>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Warning Multi-Package -->
        <div v-if="studentsWithMultiplePackages.length > 0" class="warning-section">
          <div class="warning-header">
            <span class="warning-icon">⚠️</span>
            <span>Attenzione: {{ studentsWithMultiplePackages.length }} studenti hanno già più pacchetti attivi</span>
          </div>
          <ul class="warning-list">
            <li v-for="student in studentsWithMultiplePackages" :key="student.id">
              {{ student.name }} ({{ student.activeCount }} pacchetti attivi)
            </li>
          </ul>
          <label class="confirm-checkbox">
            <input type="checkbox" v-model="confirmMultiPackage" />
            <span>Confermo di voler procedere con questi studenti</span>
          </label>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Step 1: Choose Mode -->
          <div v-if="step === 1" class="step-content">
            <h4>Scegli modalità di rinnovo</h4>
            
            <div class="mode-options">
              <label 
                class="mode-option" 
                :class="{ selected: selectedMode === 'same' }"
              >
                <input type="radio" v-model="selectedMode" value="same" />
                <div class="mode-content">
                  <div class="mode-icon">📋</div>
                  <div class="mode-text">
                    <div class="mode-title">Stesso Pacchetto</div>
                    <div class="mode-desc">Ogni studente riceverà lo stesso tipo di pacchetto che ha ora</div>
                  </div>
                </div>
              </label>

              <label 
                class="mode-option" 
                :class="{ selected: selectedMode === 'standard' }"
              >
                <input type="radio" v-model="selectedMode" value="standard" />
                <div class="mode-content">
                  <div class="mode-icon">📦</div>
                  <div class="mode-text">
                    <div class="mode-title">Pacchetto Standard</div>
                    <div class="mode-desc">Scegli un pacchetto standard da applicare a tutti</div>
                  </div>
                </div>
              </label>

              <label 
                class="mode-option" 
                :class="{ selected: selectedMode === 'individual' }"
              >
                <input type="radio" v-model="selectedMode" value="individual" />
                <div class="mode-content">
                  <div class="mode-icon">👤</div>
                  <div class="mode-text">
                    <div class="mode-title">Singolarmente</div>
                    <div class="mode-desc">Configura ogni rinnovo individualmente (prezzo, sconto, ecc.)</div>
                  </div>
                </div>
              </label>
            </div>
          </div>

          <!-- Step 2a: Same Package -->
          <div v-if="step === 2 && selectedMode === 'same'" class="step-content">
            <h4>Rinnovo con stesso pacchetto</h4>
            
            <div class="form-group">
              <label class="form-label">Data Inizio</label>
              <input type="date" v-model="commonStartDate" class="form-input" />
            </div>

            <div class="summary-section">
              <h5>Riepilogo</h5>
              <div class="summary-table">
                <div 
                  v-for="pkg in packages" 
                  :key="pkg.id"
                  class="summary-row"
                >
                  <span class="student-name">{{ pkg.student?.lastName }} {{ pkg.student?.firstName }}</span>
                  <span class="package-name">{{ pkg.standardPackage?.nome || pkg.nome }}</span>
                  <span class="package-price">€{{ formatCurrency(pkg.prezzoTotale) }}</span>
                </div>
              </div>
              <div class="summary-total">
                Totale: <strong>€{{ formatCurrency(totalAmount) }}</strong>
              </div>
            </div>
          </div>

          <!-- Step 2b: Standard Package -->
          <div v-if="step === 2 && selectedMode === 'standard'" class="step-content">
            <h4>Scegli pacchetto standard</h4>
            
            <div class="form-group">
              <label class="form-label">Pacchetto Standard</label>
              <select v-model="selectedStandardPackage" class="form-select">
                <option :value="null">-- Seleziona --</option>
                <optgroup label="📅 Pacchetti Mensili">
                  <option 
                    v-for="pkg in standardPackages.filter(p => p.tipo === 'MENSILE')" 
                    :key="pkg.id" 
                    :value="pkg"
                  >
                    {{ pkg.nome }} - €{{ formatCurrency(pkg.prezzoStandard) }}
                  </option>
                </optgroup>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Data Inizio</label>
              <input type="date" v-model="commonStartDate" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">Prezzo (opzionale)</label>
              <input 
                type="number" 
                v-model.number="customPrice" 
                class="form-input"
                :placeholder="selectedStandardPackage ? `Default: €${formatCurrency(selectedStandardPackage.prezzoStandard)}` : ''"
              />
            </div>

            <div class="summary-section" v-if="selectedStandardPackage">
              <h5>Riepilogo</h5>
              <p>{{ packages.length }} studenti riceveranno: <strong>{{ selectedStandardPackage.nome }}</strong></p>
              <p>Prezzo unitario: <strong>€{{ formatCurrency(customPrice || selectedStandardPackage.prezzoStandard) }}</strong></p>
              <p>Totale: <strong>€{{ formatCurrency((customPrice || selectedStandardPackage.prezzoStandard) * packages.length) }}</strong></p>
            </div>
          </div>

          <!-- Step 2c: Individual -->
          <div v-if="step === 2 && selectedMode === 'individual'" class="step-content individual-mode">
            <h4>Configura singolarmente</h4>
            
            <div class="individual-list">
              <div 
                v-for="(item, index) in individualConfigs" 
                :key="item.package.id"
                class="individual-item"
              >
                <div class="individual-header">
                  <span class="individual-number">{{ index + 1 }}</span>
                  <span class="individual-student">{{ item.package.student?.lastName }} {{ item.package.student?.firstName }}</span>
                </div>
                
                <div class="individual-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label class="form-label">Pacchetto</label>
                      <select v-model="item.standardPackageId" class="form-select">
                        <option :value="null">-- Stesso pacchetto --</option>
                        <optgroup label="📅 Mensili">
                          <option 
                            v-for="pkg in standardPackages.filter(p => p.tipo === 'MENSILE')" 
                            :key="pkg.id" 
                            :value="pkg.id"
                          >
                            {{ pkg.nome }} - €{{ formatCurrency(pkg.prezzoStandard) }}
                          </option>
                        </optgroup>
                      </select>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Prezzo</label>
                      <input 
                        type="number" 
                        v-model.number="item.price" 
                        class="form-input"
                        step="0.01"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Sconto %</label>
                      <input 
                        type="number" 
                        v-model.number="item.discount" 
                        class="form-input"
                        min="0"
                        max="100"
                        @input="applyDiscount(item)"
                      />
                    </div>
                  </div>
                  <div class="individual-final">
                    Prezzo finale: <strong>€{{ formatCurrency(item.finalPrice) }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div class="summary-total">
              Totale: <strong>€{{ formatCurrency(individualTotal) }}</strong>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button 
            v-if="step > 1" 
            class="btn btn-secondary" 
            @click="step--"
          >
            ← Indietro
          </button>
          <button 
            v-else 
            class="btn btn-secondary" 
            @click="$emit('close')"
          >
            Annulla
          </button>

          <button 
            v-if="step === 1" 
            class="btn btn-primary" 
            @click="goToStep2"
            :disabled="!selectedMode || (studentsWithMultiplePackages.length > 0 && !confirmMultiPackage)"
          >
            Continua →
          </button>
          <button 
            v-else 
            class="btn btn-primary" 
            @click="handleSubmit"
            :disabled="submitting || !canSubmit"
          >
            <span v-if="submitting">Creazione in corso...</span>
            <span v-else>✓ Crea {{ packages.length }} Pacchetti</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { packagesAPI, standardPackagesAPI, studentsAPI } from '@/services/api';

const props = defineProps({
  packages: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['close', 'renewed']);

// State
const step = ref(1);
const selectedMode = ref('same');
const submitting = ref(false);
const standardPackages = ref([]);
const loadingStandard = ref(false);

// Common config
const commonStartDate = ref('');
const selectedStandardPackage = ref(null);
const customPrice = ref(null);
const confirmMultiPackage = ref(false);

// Individual config
const individualConfigs = ref([]);

// Computed
const studentsWithMultiplePackages = computed(() => {
  // Check if any student has 2+ active packages
  const studentCounts = {};
  
  props.packages.forEach(pkg => {
    if (!studentCounts[pkg.studentId]) {
      studentCounts[pkg.studentId] = {
        id: pkg.studentId,
        name: `${pkg.student?.lastName} ${pkg.student?.firstName}`,
        activeCount: 0
      };
    }
    if (pkg.stati?.includes('ATTIVO')) {
      studentCounts[pkg.studentId].activeCount++;
    }
  });

  return Object.values(studentCounts).filter(s => s.activeCount >= 2);
});

const totalAmount = computed(() => {
  return props.packages.reduce((sum, pkg) => sum + parseFloat(pkg.prezzoTotale || 0), 0);
});

const individualTotal = computed(() => {
  return individualConfigs.value.reduce((sum, item) => sum + (item.finalPrice || 0), 0);
});

const canSubmit = computed(() => {
  if (selectedMode.value === 'same') {
    return commonStartDate.value;
  }
  if (selectedMode.value === 'standard') {
    return commonStartDate.value && selectedStandardPackage.value;
  }
  if (selectedMode.value === 'individual') {
    return individualConfigs.value.every(item => item.finalPrice > 0);
  }
  return false;
});

// Methods
async function loadStandardPackages() {
  loadingStandard.value = true;
  try {
    const response = await standardPackagesAPI.getAll();
    standardPackages.value = response.data.packages || [];
  } catch (error) {
    console.error('Errore caricamento pacchetti standard:', error);
  } finally {
    loadingStandard.value = false;
  }
}

function initIndividualConfigs() {
  individualConfigs.value = props.packages.map(pkg => ({
    package: pkg,
    standardPackageId: null,
    price: parseFloat(pkg.prezzoTotale || 0),
    discount: 0,
    finalPrice: parseFloat(pkg.prezzoTotale || 0)
  }));
}

function applyDiscount(item) {
  const basePrice = item.price || 0;
  const discount = item.discount || 0;
  item.finalPrice = basePrice * (1 - discount / 100);
}

function goToStep2() {
  if (selectedMode.value === 'individual') {
    initIndividualConfigs();
  }
  step.value = 2;
}

function formatCurrency(value) {
  return parseFloat(value || 0).toFixed(2);
}

async function handleSubmit() {
  submitting.value = true;

  try {
    const promises = [];

    if (selectedMode.value === 'same') {
      // Create packages with same type as original
      for (const pkg of props.packages) {
        const payload = buildPayload(pkg, {
          standardPackageId: pkg.standardPackageId,
          dataInizio: commonStartDate.value,
          prezzoTotale: pkg.prezzoTotale
        });
        promises.push(packagesAPI.create(payload));
      }
    } else if (selectedMode.value === 'standard') {
      // Create packages with selected standard package
      const stdPkg = selectedStandardPackage.value;
      const price = customPrice.value || stdPkg.prezzoStandard;
      
      for (const pkg of props.packages) {
        const payload = buildPayload(pkg, {
          standardPackageId: stdPkg.id,
          dataInizio: commonStartDate.value,
          prezzoTotale: price,
          oreAcquistate: stdPkg.tipo === 'ORE' ? stdPkg.oreIncluse : (stdPkg.giorniInclusi * stdPkg.orarioGiornaliero),
          giorniAcquistati: stdPkg.giorniInclusi,
          orarioGiornaliero: stdPkg.orarioGiornaliero,
          nome: `${pkg.student?.lastName} ${pkg.student?.firstName} - ${stdPkg.nome}`
        });
        promises.push(packagesAPI.create(payload));
      }
    } else if (selectedMode.value === 'individual') {
      // Create packages with individual configs
      for (const item of individualConfigs.value) {
        const pkg = item.package;
        let stdPkg = null;
        
        if (item.standardPackageId) {
          stdPkg = standardPackages.value.find(p => p.id === item.standardPackageId);
        }
        
        const payload = buildPayload(pkg, {
          standardPackageId: item.standardPackageId || pkg.standardPackageId,
          dataInizio: commonStartDate.value || getTomorrow(),
          prezzoTotale: item.finalPrice,
          oreAcquistate: stdPkg ? 
            (stdPkg.tipo === 'ORE' ? stdPkg.oreIncluse : (stdPkg.giorniInclusi * stdPkg.orarioGiornaliero)) 
            : pkg.oreAcquistate,
          giorniAcquistati: stdPkg?.giorniInclusi || pkg.giorniAcquistati,
          orarioGiornaliero: stdPkg?.orarioGiornaliero || pkg.orarioGiornaliero,
          nome: stdPkg ? 
            `${pkg.student?.lastName} ${pkg.student?.firstName} - ${stdPkg.nome}` 
            : pkg.nome
        });
        promises.push(packagesAPI.create(payload));
      }
    }

    await Promise.all(promises);
    
    alert(`✅ ${props.packages.length} pacchetti creati con successo!`);
    emit('renewed');
  } catch (error) {
    console.error('Errore rinnovo bulk:', error);
    alert('❌ Errore durante la creazione dei pacchetti');
  } finally {
    submitting.value = false;
  }
}

function buildPayload(originalPkg, overrides) {
  return {
    studentId: originalPkg.studentId,
    standardPackageId: overrides.standardPackageId || originalPkg.standardPackageId,
    nome: overrides.nome || originalPkg.nome,
    tipo: originalPkg.tipo,
    dataInizio: new Date(overrides.dataInizio).toISOString(),
    prezzoTotale: parseFloat(overrides.prezzoTotale),
    oreAcquistate: overrides.oreAcquistate || originalPkg.oreAcquistate,
    giorniAcquistati: overrides.giorniAcquistati || originalPkg.giorniAcquistati,
    orarioGiornaliero: overrides.orarioGiornaliero || originalPkg.orarioGiornaliero,
    note: `Rinnovo bulk del ${new Date().toLocaleDateString('it-IT')}`
  };
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// Watch for standard package selection to update price
watch(selectedStandardPackage, (newPkg) => {
  if (newPkg) {
    customPrice.value = newPkg.prezzoStandard;
  }
});

// Initialize
onMounted(() => {
  loadStandardPackages();
  commonStartDate.value = getTomorrow();
});
</script>

<style scoped>
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
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 700px;
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
  padding: 20px 24px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.modal-title h3 {
  margin: 0;
  font-size: 20px;
}

.subtitle {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.btn-close {
  padding: 6px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: white;
}

/* Warning Section */
.warning-section {
  padding: 16px 24px;
  background: #fff3cd;
  border-bottom: 1px solid #ffc107;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #856404;
  margin-bottom: 8px;
}

.warning-icon {
  font-size: 18px;
}

.warning-list {
  margin: 8px 0;
  padding-left: 24px;
  font-size: 13px;
  color: #856404;
}

.confirm-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  font-size: 13px;
  cursor: pointer;
}

.confirm-checkbox input {
  width: 18px;
  height: 18px;
  accent-color: #5e72e4;
}

/* Body */
.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.step-content h4 {
  margin: 0 0 20px;
  color: #344767;
}

/* Mode Options */
.mode-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mode-option {
  display: block;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-option:hover {
  border-color: #5e72e4;
  background: rgba(94, 114, 228, 0.02);
}

.mode-option.selected {
  border-color: #5e72e4;
  background: rgba(94, 114, 228, 0.05);
}

.mode-option input {
  display: none;
}

.mode-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mode-icon {
  font-size: 28px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 10px;
}

.mode-title {
  font-weight: 600;
  color: #344767;
  margin-bottom: 4px;
}

.mode-desc {
  font-size: 13px;
  color: #8392ab;
}

/* Form */
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

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 12px;
}

/* Summary */
.summary-section {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.summary-section h5 {
  margin: 0 0 12px;
  color: #344767;
}

.summary-table {
  max-height: 200px;
  overflow-y: auto;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
  font-size: 13px;
}

.summary-row:last-child {
  border-bottom: none;
}

.student-name {
  font-weight: 600;
  color: #344767;
}

.package-name {
  color: #8392ab;
}

.package-price {
  font-weight: 600;
  color: #5e72e4;
}

.summary-total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #e9ecef;
  text-align: right;
  font-size: 16px;
}

/* Individual Mode */
.individual-list {
  max-height: 400px;
  overflow-y: auto;
}

.individual-item {
  padding: 16px;
  margin-bottom: 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.individual-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.individual-number {
  width: 28px;
  height: 28px;
  background: #5e72e4;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.individual-student {
  font-weight: 600;
  color: #344767;
}

.individual-form .form-group {
  margin-bottom: 8px;
}

.individual-final {
  text-align: right;
  font-size: 14px;
  color: #5e72e4;
  margin-top: 8px;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: white;
  border: 1px solid #e9ecef;
  color: #344767;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.btn-primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
