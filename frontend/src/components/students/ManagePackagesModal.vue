<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>Gestisci Pacchetti</h3>
            <p class="student-name">
              {{ student.firstName }} {{ student.lastName }}
            </p>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="modal-tabs">
          <button
            :class="['tab', { active: activeTab === 'storico' }]"
            @click="activeTab = 'storico'"
          >
            📋 Storico Pacchetti
          </button>
          <button
            :class="['tab', { active: activeTab === 'pagamento' }]"
            @click="activeTab = 'pagamento'"
          >
            💳 Registra Pagamento
          </button>
          <button
            :class="['tab', { active: activeTab === 'rinnovo' }]"
            @click="activeTab = 'rinnovo'"
          >
            🔄 Rinnova Pacchetto
          </button>
        </div>

        <!-- Tab Content -->
        <div class="modal-body">
          <!-- Tab 1: Storico Pacchetti -->
          <div v-if="activeTab === 'storico'" class="tab-content">
            <!-- ✅ RIEPILOGO AGGIORNATO -->
            <div v-if="packages.length > 0" class="summary-box">
              <h4>📊 Riepilogo</h4>
              <div class="summary-stats">
                <div class="summary-item">
                  <span class="summary-label">Totale Pacchetti:</span>
                  <span class="summary-value">{{ packages.length }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Totale Speso:</span>
                  <span class="summary-value">€{{ formatCurrency(totalSpent) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Ore Totali:</span>
                  <span class="summary-value">{{ totalHours.toFixed(1) }}h</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Utilizzate:</span>
                  <span class="summary-value">{{ usedHours.toFixed(1) }}h</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Perse:</span>
                  <span class="summary-value lost">{{ lostHours.toFixed(1) }}h</span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loadingPackages" class="loading-state">
              <div class="loader"></div>
              Caricamento pacchetti...
            </div>

            <!-- Empty State -->
            <div v-else-if="packages.length === 0" class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
              <p>Nessun pacchetto trovato</p>
            </div>

            <!-- Lista Pacchetti -->
            <div v-else class="packages-list">
              <div
                v-for="pkg in packages"
                :key="pkg.id"
                class="package-card"
                :class="{ 'package-active': isActive(pkg) }"
              >
                <!-- Badge Pacchetto Attivo -->
                <div v-if="isActive(pkg)" class="badge-active">
                  🟢 PACCHETTO ATTIVO
                </div>

                <!-- Header Pacchetto -->
                <div class="package-header">
                  <div class="package-info">
                    <h4>{{ pkg.nome || 'Pacchetto' }}</h4>
                    <div class="package-meta">
                      <span class="package-type">{{ getTypeLabel(pkg.tipo) }}</span>
                      <span v-if="pkg.dataInizio && pkg.dataScadenza" class="package-period">
                        Periodo: {{ formatDate(pkg.dataInizio) }} - {{ formatDate(pkg.dataScadenza) }}
                      </span>
                    </div>
                  </div>
                  
                  <!-- ✅ BADGE STATI MULTIPLI CORRETTI -->
                  <div class="package-states">
                    <span
                    v-for="stato in pkg.stati"
                    :key="stato"
                    :class="`state-badge state-${stato.toLowerCase().replace('_', '-')}`"
                    >
                    {{ getStateLabelFormatted(stato) }}
                    </span>
                  </div>
                </div>

                <!-- ✅ PROGRESS BAR AGGIORNATA (rossa se ore <= 0) -->
                <div class="package-progress">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${getProgressPercent(pkg)}%` }"
                      :class="getProgressClass(pkg)"
                    ></div>
                  </div>
                  <div class="progress-text">
                    {{ getProgressText(pkg) }}
                  </div>
                </div>

                <div v-if="pkg.tipo === 'MENSILE' && pkg.stati?.includes('ATTIVO') && getPackageLostHours(pkg) > 0" class="package-hours-detail">
  
                <!-- Ore Perse -->
                <div class="hours-detail-item lost">
                  <span class="icon">⚠️</span>
                  <div class="detail-content">
                    <span class="label">Ore perse:</span>
                    <span class="value">{{ getPackageLostHours(pkg).toFixed(1) }}h</span>
                  </div>
                  <span class="info-tooltip" title="Ore teoriche non utilizzate dei giorni consumati">ℹ️</span>
                </div>
                
                <!-- Ore Effettive Rimanenti -->
                <div class="hours-detail-item effective">
                  <span class="icon">✅</span>
                  <div class="detail-content">
                    <span class="label">Ore effettive rimanenti:</span>
                    <span class="value">{{ getEffectiveRemainingHours(pkg).toFixed(1) }}h</span>
                  </div>
                  <span class="formula">({{ parseFloat(pkg.oreResiduo || 0).toFixed(1) }}h - {{ getPackageLostHours(pkg).toFixed(1) }}h)</span>
                </div>
              </div>

                <!-- Dettagli Economici -->
                <div class="package-details">
                  <!-- Costo Pacchetto -->
                  <div class="detail-row">
                    <span class="label">Costo pacchetto:</span>
                    <span class="value price-value">€{{ formatCurrency(pkg.prezzoTotale) }}</span>
                  </div>

                  <!-- Elenco Pagamenti -->
                  <div class="detail-row payments-section">
                    <span class="label">Pagamenti:</span>
                    <div class="payments-container">
                      <div v-if="pkg.pagamenti && pkg.pagamenti.length > 0" class="payments-list">
                       <div v-for="pag in pkg.pagamenti" :key="pag.id" class="payment-item">
                            <span class="payment-label">{{ getPaymentTypeLabel(pag.tipoPagamento) }}</span>
                            <span class="payment-amount">{{ formatCurrency(pag.importo) }}</span>
                            <span class="payment-method">{{ getPaymentMethodLabel(pag.metodoPagamento) }}</span>
                            <span v-if="pag.richiedeFattura" class="invoice-icon" title="Richiede fattura">📄</span>
                            
                            <!-- ✅ NUOVO: Pulsante Elimina -->
                            <button 
                              @click.stop="confirmDeletePayment(pag.id)" 
                              class="btn-delete-payment" 
                              title="Elimina pagamento"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                              </svg>
                            </button>
                          </div>

                        <div class="payment-total">
                          = <strong>Pagato: €{{ formatCurrency(pkg.importoPagato) }}</strong>
                        </div>
                      </div>
                      <div v-else class="no-payments">
                        Nessun pagamento registrato
                      </div>
                    </div>
                  </div>

                  <!-- Stato Pagamento -->
                  <div class="detail-row">
                    <span class="label">Stato Pagamento:</span>
                    <span v-if="parseFloat(pkg.importoResiduo) <= 0" class="value status-paid">
                      ✓ Saldato
                    </span>
                    <span v-else class="value status-unpaid">
                      ✗ Da saldare (€{{ formatCurrency(pkg.importoResiduo) }})
                    </span>
                  </div>

                  <!-- Stato Fattura -->
                  <div class="detail-row">
                    <span class="label">Fattura:</span>
                    <span :class="['value', getInvoiceStatusClass(pkg)]">
                      {{ getInvoiceStatus(pkg) }}
                    </span>
                  </div>
                </div>

                <!-- Azioni -->
                <div class="package-actions">
                  <!-- Pacchetto NON saldato -->
                  <button
                    v-if="parseFloat(pkg.importoResiduo) > 0"
                    @click="selectPackageForPayment(pkg)"
                    class="btn-action btn-primary"
                  >
                    💳 Paga
                  </button>

                  <!-- Pacchetto Attivo -->
                  <button
                    v-if="isActive(pkg)"
                    @click="selectPackageForRenewal(pkg)"
                    class="btn-action btn-secondary"
                  >
                    🔄 Rinnova
                  </button>

                  <!-- Vedi Lezioni -->
                  <button
                    @click="viewLessons(pkg)"
                    class="btn-action btn-outline"
                  >
                    📚 Vedi Lezioni
                  </button>

                  <!-- Scarica Fattura -->
                  <button
                    v-if="hasInvoiceIssued(pkg)"
                    @click="downloadInvoice(pkg)"
                    class="btn-action btn-outline"
                  >
                    📄 Scarica Fattura
                  </button>

                  <!-- ✅ MODIFICA: Disabilitato se saldato -->
                  <button
                    @click="editPackage(pkg)"
                    class="btn-action btn-icon"
                    :disabled="isSaldato(pkg)"
                    :title="isSaldato(pkg) ? 'Pacchetto saldato, non modificabile' : 'Modifica'"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>

                  <!-- Elimina -->
                  <button
                    @click="confirmDelete(pkg)"
                    class="btn-action btn-icon btn-danger"
                    title="Elimina"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 2: Registra Pagamento -->
          <div v-if="activeTab === 'pagamento'" class="tab-content">
            <form @submit.prevent="submitPayment" class="payment-form">
              <div class="form-group">
                <label class="form-label">Pacchetto *</label>
                <select v-model="paymentForm.packageId" class="form-control" required>
                  <option value="">Seleziona pacchetto</option>
                  <option
                    v-for="pkg in unpaidPackages"
                    :key="pkg.id"
                    :value="pkg.id"
                  >
                    {{ pkg.nome }} - Residuo: €{{ formatCurrency(pkg.importoResiduo) }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Importo Pagato *</label>
                <input
                  v-model.number="paymentForm.importo"
                  type="number"
                  step="0.01"
                  min="0.01"
                  class="form-control"
                  placeholder="0.00"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Tipo Pagamento *</label>
                <select v-model="paymentForm.tipoPagamento" class="form-control" required>
                  <option value="">Seleziona tipo</option>
                  <option value="ACCONTO">Acconto</option>
                  <option value="SALDO">Saldo</option>
                  <option value="RATA">Rata</option>
                  <option value="INTEGRAZIONE">Integrazione</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Metodo di Pagamento *</label>
                <select v-model="paymentForm.metodoPagamento" class="form-control" required>
                  <option value="">Seleziona metodo</option>
                  <option value="CONTANTI">Contanti</option>
                  <option value="BONIFICO">Bonifico</option>
                  <option value="POS">POS/Carta</option>
                  <option value="ASSEGNO">Assegno</option>
                  <option value="ALTRO">Altro</option>
                </select>
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input
                    v-model="paymentForm.richiedeFattura"
                    type="checkbox"
                  />
                  <span>Richiede emissione fattura</span>
                </label>
                <small class="form-hint">
                  Seleziona se il cliente richiede fattura per questo pagamento
                </small>
              </div>

              <div class="form-group">
                <label class="form-label">Data Pagamento *</label>
                <input
                  v-model="paymentForm.data"
                  type="date"
                  class="form-control"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">Riferimento</label>
                <input
                  v-model="paymentForm.riferimento"
                  type="text"
                  class="form-control"
                  placeholder="Es: Numero ricevuta, CRO bonifico..."
                />
              </div>

              <div class="form-group">
                <label class="form-label">Note</label>
                <textarea
                  v-model="paymentForm.note"
                  class="form-control"
                  rows="3"
                  placeholder="Note aggiuntive sul pagamento..."
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="button" @click="$emit('close')" class="btn-secondary">
                  Annulla
                </button>
                <button type="submit" class="btn-primary" :disabled="submitting">
                  <span v-if="submitting">Salvataggio...</span>
                  <span v-else>💾 Salva Pagamento</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Tab 3: Rinnova Pacchetto -->
          <div v-if="activeTab === 'rinnovo'" class="tab-content">
            <form @submit.prevent="submitRenewal" class="renewal-form">
              <div class="form-group">
  <label class="form-label">📦 Pacchetto Standard *</label>
  <select v-model="renewalForm.standardPackageId" @change="onStandardPackageChangeRenewal" class="form-control" required>
    <option value="">Seleziona pacchetto standard...</option>
    <option
      v-for="stdPkg in standardPackages"
      :key="stdPkg.id"
      :value="stdPkg.id"
    >
      {{ stdPkg.nome }} - {{ stdPkg.categoria }} ({{ stdPkg.tipo }}) - €{{ parseFloat(stdPkg.prezzoStandard).toFixed(2) }}
    </option>
  </select>
</div>

<div v-if="renewalForm.standardPackageId">
  <div class="form-group">
    <label class="form-label">Nome Pacchetto *</label>
    <input
      v-model="renewalForm.nome"
      type="text"
      class="form-control"
      readonly
      required
    />
  </div>

  <div class="form-row">
    <div v-if="renewalForm.tipo === 'MENSILE'" class="form-group">
      <label class="form-label">Giorni Acquistati *</label>
      <input
        v-model.number="renewalForm.giorniAcquistati"
        type="number"
        step="1"
        min="1"
        class="form-control"
        @input="updateTotalHours"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">
        {{ renewalForm.tipo === 'MENSILE' ? 'Ore Totali *' : 'Ore Acquistate *' }}
      </label>
      <input
        v-model.number="renewalForm.oreAcquistate"
        type="number"
        step="0.5"
        min="1"
        class="form-control"
        :readonly="renewalForm.tipo === 'MENSILE'"
        required
      />
    </div>
  </div>

  <div v-if="renewalForm.tipo === 'MENSILE'" class="form-group">
    <label class="form-label">Ore per Giorno *</label>
    <input
      v-model.number="renewalForm.orarioGiornaliero"
      type="number"
      step="0.5"
      min="0.5"
      class="form-control"
      @input="updateTotalHours"
      required
    />
  </div>

  <div class="form-group">
    <label class="form-label">Importo Totale *</label>
    <input
      v-model.number="renewalForm.prezzoTotale"
      type="number"
      step="0.01"
      min="0.01"
      class="form-control"
      required
    />
  </div>

  <div class="form-row">
    <div class="form-group">
      <label class="form-label">Data Inizio *</label>
      <input
        v-model="renewalForm.dataInizio"
        type="date"
        class="form-control"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">Data Scadenza</label>
      <input
        v-model="renewalForm.dataScadenza"
        type="date"
        class="form-control"
      />
    </div>
  </div>

  <div class="form-group">
    <label class="form-label">Note</label>
    <textarea
      v-model="renewalForm.note"
      class="form-control"
      rows="3"
    ></textarea>
  </div>

  <div class="form-actions">
    <button type="button" @click="resetRenewalForm" class="btn-secondary">
      Annulla
    </button>
    <button type="submit" class="btn-primary" :disabled="submittingRenewal">
      <span v-if="submittingRenewal">Creazione...</span>
      <span v-else>💾 Crea Nuovo Pacchetto</span>
    </button>
  </div>
</div>

<div v-else class="empty-state">
  <p>👆 Seleziona un pacchetto standard per iniziare</p>
</div>

            </form>
          </div>




        </div>
      </div>
    </div>

    <!-- Modal Modifica Pacchetto -->
    <EditPackageModal
      v-if="showEditModal && packageToEdit"
      :package-data="packageToEdit"
      @close="showEditModal = false"
      @updated="onPackageUpdated"
    />
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { packagesAPI, paymentsAPI, standardPackagesAPI } from '@/services/api';
import EditPackageModal from './EditPackageModal.vue';

const props = defineProps({
  student: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'refresh']);

// ========================================
// STATE
// ========================================

const activeTab = ref('storico');
const packages = ref([]);
const loadingPackages = ref(false);
const submitting = ref(false);
const submittingRenewal = ref(false);
const showEditModal = ref(false);
const packageToEdit = ref(null);
const standardPackages = ref([]);
// Form Pagamento
const paymentForm = ref({
  packageId: '',
  importo: 0,
  tipoPagamento: '',
  metodoPagamento: '',
  richiedeFattura: false,
  data: new Date().toISOString().split('T')[0],
  riferimento: '',
  note: '',
});

// Form Rinnovo
const renewalForm = ref({
  standardPackageId: '',
  nome: '',
  tipo: 'MENSILE',
  giorniAcquistati: 0,        // ✅ NON quantita
  oreAcquistate: 0,           // ✅ NON quantita
  orarioGiornaliero: 3,
  prezzoTotale: 0,
  dataInizio: new Date().toISOString().split('T')[0],
  dataScadenza: '',
  note: '',
});

// ========================================
// COMPUTED
// ========================================


const unpaidPackages = computed(() => {
  return packages.value.filter(pkg => parseFloat(pkg.importoResiduo || 0) > 0);
});

const totalSpent = computed(() => {
  return packages.value.reduce((sum, pkg) => sum + parseFloat(pkg.importoPagato || 0), 0);
});

/**
 * ✅ Ore Totali (sempre in ore, anche per MENSILE)
 */
const totalHours = computed(() => {
  return packages.value.reduce((sum, pkg) => {
    return sum + parseFloat(pkg.oreAcquistate || 0);
  }, 0);
});

/**
 * ✅ Ore Utilizzate (ore effettive dalle lezioni)
 */
const usedHours = computed(() => {
  return packages.value.reduce((sum, pkg) => {
    const acquired = parseFloat(pkg.oreAcquistate || 0);
    const residuo = parseFloat(pkg.oreResiduo || 0);
    const used = acquired - residuo;
    return sum + Math.max(0, used);
  }, 0);
});

/**
 * ✅ Ore Perse (ore teoriche non utilizzate)
 * Formula: (Giorni usati × 3h) - Ore effettivamente fatte
 */
const lostHours = computed(() => {
  return packages.value.reduce((sum, pkg) => {
    // ✅ Usa il campo orePerse dal database (già calcolato e salvato)
    return sum + parseFloat(pkg.orePerse || 0);
  }, 0);
});



/**
 * Calcola ore perse dinamicamente per un singolo pacchetto
 * - Per pacchetti ATTIVI: calcolo dinamico in tempo reale
 * - Per pacchetti SCADUTI: usa il valore salvato nel database
 */
/**
 * Calcola ore perse dinamicamente per un singolo pacchetto
 * ORE PERSE = Ore teoriche che dovevano essere usate - Ore effettivamente usate
 */
const getPackageLostHours = (pkg) => {
  const isScaduto = pkg.stati?.includes('SCADUTO');
  const isEsaurito = pkg.stati?.includes('ESAURITO');
  
  // ✅ Se SCADUTO o ESAURITO: usa valore dal database
  if (isScaduto || isEsaurito) {
    return parseFloat(pkg.orePerse || 0);
  }
  
  // ✅ CALCOLO DINAMICO per pacchetti MENSILI ATTIVI
  if (pkg.tipo === 'MENSILE') {
    const giorniAcquistati = parseFloat(pkg.giorniAcquistati || 0);
    const giorniResidui = parseFloat(pkg.giorniResiduo || 0);
    const giorniUsati = giorniAcquistati - giorniResidui;
    
    const oreAcquistate = parseFloat(pkg.oreAcquistate || 0);
    const oreResiduo = parseFloat(pkg.oreResiduo || 0);
    const oreUsate = oreAcquistate - oreResiduo;
    
    const orarioGiornaliero = parseFloat(pkg.orarioGiornaliero || 3);
    
    // ✅ DEBUG: Stampa i valori
    console.log('🔍 DEBUG Pacchetto:', pkg.nome);
    console.log('  giorniAcquistati:', giorniAcquistati);
    console.log('  giorniResidui:', giorniResidui);
    console.log('  giorniUsati:', giorniUsati);
    console.log('  oreAcquistate:', oreAcquistate);
    console.log('  oreResiduo:', oreResiduo);
    console.log('  oreUsate:', oreUsate);
    console.log('  orarioGiornaliero:', orarioGiornaliero);
    
    // ✅ FORMULA: (giorniUsati × orarioGiornaliero) - oreUsate
    const oreTeoriche = giorniUsati * orarioGiornaliero;
    const orePerse = oreTeoriche - oreUsate;
    
    console.log('  oreTeoriche:', oreTeoriche);
    console.log('  orePerse:', orePerse);
    console.log('---');
    
    return Math.max(0, orePerse);
  } else {
    return 0;
  }
};


/**
 * Calcola ore effettive rimanenti (ore residue - ore perse)
 */
const getEffectiveRemainingHours = (pkg) => {
  const oreResiduo = parseFloat(pkg.oreResiduo || 0);
  const orePerse = getPackageLostHours(pkg);
  return Math.max(0, oreResiduo - orePerse);
};



// ========================================
// HELPER FUNCTIONS
// ========================================

const formatCurrency = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

const isActive = (pkg) => {
  return pkg.stati?.includes('ATTIVO') || false;
};

/**
 * ✅ Verifica se pacchetto è saldato
 */
const isSaldato = (pkg) => {
  return parseFloat(pkg.importoResiduo || 0) <= 0;
};

const getTypeLabel = (tipo) => {
  return tipo === 'MENSILE' ? 'Mensile' : 'Orario';
};

const getPaymentTypeLabel = (tipo) => {
  const labels = {
    'ACCONTO': 'Acconto',
    'SALDO': 'Saldo',
    'RATA': 'Rata',
    'INTEGRAZIONE': 'Integrazione',
  };
  return labels[tipo] || tipo;
};

const getPaymentMethodLabel = (metodo) => {
  const labels = {
    'CONTANTI': 'Contanti',
    'BONIFICO': 'Bonifico',
    'POS': 'POS',
    'ASSEGNO': 'Assegno',
    'ALTRO': 'Altro',
  };
  return labels[metodo] || metodo;
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT');
};

/**
 * ✅ AGGIORNATO: Calcola stati multipli del pacchetto
 */


/**
 * ✅ NUOVA: Formatta label stato per visualizzazione
 */
const getStateLabelFormatted = (stato) => {
  const labels = {
    'ATTIVO': 'Attivo',
    'SCADUTO': 'Scaduto',
    'ESAURITO': 'Esaurito',
    'ORE_NEGATIVE': 'Ore Negative',
    'IN_SCADENZA': 'In Scadenza',
    'DA_RINNOVARE': 'Da Rinnovare',
    'PAGATO': 'Pagato',
    'DA_PAGARE': 'Da Pagare',
    'PAG_SOSPESO': 'Sospeso',
  };
  return labels[stato] || stato;
};


/**
 * ✅ AGGIORNATO: Progress bar (sempre in ore)
 */
const getProgressPercent = (pkg) => {
  const totale = parseFloat(pkg.oreAcquistate || 0);
  const residui = parseFloat(pkg.oreResiduo || 0);
  
  if (residui < 0 || totale === 0) return 0;
  
  return Math.min(Math.max((residui / totale) * 100, 0), 100);
};

/**
 * ✅ AGGIORNATO: Classe CSS progress bar (rossa se ore <= 0)
 */
const getProgressClass = (pkg) => {
  const residui = parseFloat(pkg.oreResiduo || 0);
  
  if (residui <= 0) return 'progress-danger';
  
  const percent = getProgressPercent(pkg);
  
  if (percent < 20) return 'progress-danger';
  if (percent < 50) return 'progress-warning';
  return 'progress-success';
};

/**
 * ✅ AGGIORNATO: Testo progress bar
 */
const getProgressText = (pkg) => {
  const totale = parseFloat(pkg.oreAcquistate || 0);
  const residui = parseFloat(pkg.oreResiduo || 0);
  
  if (residui < 0) {
    return `${Math.abs(residui).toFixed(1)}h oltre il limite`;
  }
  return `${residui.toFixed(1)} / ${totale.toFixed(1)} ore rimanenti`;
};

const getInvoiceStatus = (pkg) => {
  const isSaldato = parseFloat(pkg.importoResiduo || 0) <= 0;
  const pagamenti = pkg.pagamenti || [];
  
  if (pagamenti.length === 0) {
    return '⏳ In attesa di pagamento';
  }
  
  if (!isSaldato) {
    return '⏳ In attesa di saldo';
  }
  
  const tuttiContanti = pagamenti.every(p => p.metodoPagamento === 'CONTANTI');
  const nessunoRichiedeFattura = pagamenti.every(p => !p.richiedeFattura);
  const qualcunoRichiedeFattura = pagamenti.some(p => p.richiedeFattura);
  
  if (tuttiContanti && nessunoRichiedeFattura) {
    return '✅ Emessa';
  }
  
  if (qualcunoRichiedeFattura) {
    return '⚠️ Da emettere';
  }
  
  return '✅ Emessa';
};

const getInvoiceStatusClass = (pkg) => {
  const status = getInvoiceStatus(pkg);
  if (status.includes('Emessa')) return 'invoice-issued';
  if (status.includes('Da emettere')) return 'invoice-pending';
  return 'invoice-waiting';
};

const hasInvoiceIssued = (pkg) => {
  const status = getInvoiceStatus(pkg);
  return status.includes('Emessa');
};

// ========================================
// ACTIONS
// ========================================

const loadPackages = async () => {
  loadingPackages.value = true;
  try {
    const response = await packagesAPI.getAll({ studentId: props.student.id });
    packages.value = response.data.packages || [];
  } catch (error) {
    console.error('Errore caricamento pacchetti:', error);
    alert('Errore durante il caricamento dei pacchetti');
  } finally {
    loadingPackages.value = false;
  }
};

const loadStandardPackages = async () => {
  try {
    const response = await standardPackagesAPI.getAll({ active: true });
    standardPackages.value = response.data.packages || response.data || [];
    console.log('✅ Pacchetti standard caricati:', standardPackages.value.length);
  } catch (error) {
    console.error('❌ Errore caricamento pacchetti standard:', error);
  }
};

const selectPackageForPayment = (pkg) => {
  paymentForm.value.packageId = pkg.id;
  paymentForm.value.importo = parseFloat(pkg.importoResiduo) || 0;
  activeTab.value = 'pagamento';
};

/**
 * Elimina pagamento con conferma
 */

const confirmDeletePayment = async (paymentId) => {
  if (!confirm('Sei sicuro di voler eliminare questo pagamento? L\'importo verrà ripristinato come residuo del pacchetto.')) {
    return;
  }

  try {
    await paymentsAPI.delete(paymentId);
    alert('Pagamento eliminato con successo!');
    await loadPackages(); // Ricarica pacchetti
  } catch (error) {
    console.error('Errore eliminazione pagamento:', error);
    
    // Mostra errore specifico se è un acconto con saldo
    if (error.response?.status === 400) {
      alert(error.response.data.error || 'Errore durante l\'eliminazione del pagamento');
    } else {
      alert('Errore durante l\'eliminazione del pagamento');
    }
  }
};



const selectPackageForRenewal = (pkg) => {
  // Passa al tab rinnovo
  activeTab.value = 'rinnovo';
  
  // Precompila il form rinnovo con i dati del pacchetto standard associato
  if (pkg.standardPackage) {
    renewalForm.value.standardPackageId = pkg.standardPackage.id;
    
    // Aspetta che il DOM si aggiorni, poi seleziona il pacchetto standard
    setTimeout(() => {
      // Il cambio di standardPackageId attiverà automaticamente
      // la funzione onStandardPackageChange che compilerà il resto
      console.log('📋 Precompilato rinnovo con:', pkg.standardPackage.nome);
    }, 100);
  } else {
    // Se non ha un pacchetto standard associato, usa i dati manuali
    renewalForm.value.tipo = pkg.tipo;
    renewalForm.value.oreAcquistate = parseFloat(pkg.oreAcquistate || 0);
    renewalForm.value.giorniAcquistati = pkg.tipo === 'MENSILE' ? parseFloat(pkg.giorniAcquistati || 0) : null;
    renewalForm.value.orarioGiornaliero = pkg.tipo === 'MENSILE' ? parseFloat(pkg.orarioGiornaliero || 3) : null;
    renewalForm.value.prezzoTotale = parseFloat(pkg.prezzoTotale || 0);
  }
  
  // Data inizio: oggi
  const oggi = new Date();
  renewalForm.value.dataInizio = oggi.toISOString().split('T')[0];
  
  // Data scadenza: calcola in base al tipo
  if (pkg.tipo === 'MENSILE' && pkg.standardPackage?.durataGiorni) {
    const scadenza = new Date(oggi);
    scadenza.setDate(scadenza.getDate() + pkg.standardPackage.durataGiorni);
    renewalForm.value.dataScadenza = scadenza.toISOString().split('T')[0];
  } else {
    renewalForm.value.dataScadenza = '';
  }
  
  console.log('🔄 Rinnovo pacchetto:', pkg.nome);
  console.log('📋 Form precompilato:', renewalForm.value);
};


const submitPayment = async () => {
  submitting.value = true;
  try {
    await paymentsAPI.create({
      packageId: paymentForm.value.packageId,
      importo: paymentForm.value.importo,
      tipoPagamento: paymentForm.value.tipoPagamento,
      metodoPagamento: paymentForm.value.metodoPagamento,
      richiedeFattura: paymentForm.value.richiedeFattura,
      dataPagamento: paymentForm.value.data,
      riferimento: paymentForm.value.riferimento,
      note: paymentForm.value.note,
    });

    alert('Pagamento registrato con successo!');
    emit('refresh');
    emit('close');
  } catch (error) {
    console.error('Errore registrazione pagamento:', error);
    alert('Errore durante il salvataggio del pagamento');
  } finally {
    submitting.value = false;
  }
};

/**
 * Submit rinnovo/creazione pacchetto
 */
const submitRenewal = async () => {
  submittingRenewal.value = true;
  try {
    // ✅ Payload corretto con i campi del backend
    const payload = {
      studentId: props.student.id,
      standardPackageId: renewalForm.value.standardPackageId || null,
      nome: renewalForm.value.nome,
      tipo: renewalForm.value.tipo,
      oreAcquistate: parseFloat(renewalForm.value.oreAcquistate),
      giorniAcquistati: renewalForm.value.tipo === 'MENSILE' 
        ? parseInt(renewalForm.value.giorniAcquistati) 
        : null,
      orarioGiornaliero: renewalForm.value.tipo === 'MENSILE' 
        ? parseFloat(renewalForm.value.orarioGiornaliero) 
        : null,
      prezzoTotale: parseFloat(renewalForm.value.prezzoTotale),
      dataInizio: renewalForm.value.dataInizio,
      dataScadenza: renewalForm.value.dataScadenza || null,
      note: renewalForm.value.note || null,
    };

    console.log('📤 Invio payload rinnovo:', payload);

    await packagesAPI.create(payload);
    
    alert('Nuovo pacchetto creato con successo!');
    await loadPackages();
    activeTab.value = 'storico';
    resetRenewalForm();
  } catch (error) {
    console.error('Errore creazione pacchetto:', error);
    alert('Errore durante la creazione del pacchetto');
  } finally {
    submittingRenewal.value = false;
  }
};

const viewLessons = (pkg) => {
  console.log('Vedi lezioni pacchetto:', pkg.id);
  alert(`Funzionalità "Vedi Lezioni" per pacchetto ${pkg.nome} - Da implementare`);
};

const downloadInvoice = (pkg) => {
  console.log('Scarica fattura per pacchetto:', pkg.id);
  alert(`Download fattura per "${pkg.nome}" - Da implementare`);
};

/**
 * ✅ AGGIORNATO: Apre modal modifica solo se non saldato
 */
const editPackage = (pkg) => {
  if (isSaldato(pkg)) {
    alert('⚠️ Il pacchetto è saldato e non può essere modificato.');
    return;
  }
  packageToEdit.value = pkg;
  showEditModal.value = true;
};

const confirmDelete = async (pkg) => {
  const lessonCount = pkg._count?.lezioni || 0;
  const paymentCount = pkg._count?.pagamenti || 0;
  
  let message = `⚠️ ATTENZIONE: Stai per eliminare il pacchetto "${pkg.nome}"\n\n`;
  
  if (lessonCount > 0 || paymentCount > 0) {
    message += 'VERRANNO ELIMINATI ANCHE:\n';
    if (lessonCount > 0) {
      message += `• ${lessonCount} lezioni associate\n`;
    }
    if (paymentCount > 0) {
      message += `• ${paymentCount} pagamenti registrati\n`;
    }
    message += '\n❗ QUESTA AZIONE È IRREVERSIBILE ❗\n\n';
  }
  
  message += 'Sei sicuro di voler procedere?';
  
  if (!confirm(message)) return;
  
  if (lessonCount > 0 || paymentCount > 0) {
    const secondConfirm = prompt(
      `Per confermare l'eliminazione, digita: ELIMINA\n\n(Questo eliminerà definitivamente ${lessonCount} lezioni e ${paymentCount} pagamenti)`
    );
    
    if (secondConfirm !== 'ELIMINA') {
      alert('Eliminazione annullata');
      return;
    }
  }
  
  try {
    const response = await packagesAPI.delete(pkg.id);
    
    if (response.data?.deleted) {
      const { lessonsDeleted, paymentsDeleted } = response.data.deleted;
      alert(
        `✅ Pacchetto eliminato con successo!\n\n` +
        `Lezioni eliminate: ${lessonsDeleted}\n` +
        `Pagamenti eliminati: ${paymentsDeleted}`
      );
    } else {
      alert('Pacchetto eliminato con successo!');
    }
    
    emit('refresh');
    loadPackages();
  } catch (error) {
    console.error('Errore eliminazione pacchetto:', error);
    alert('❌ Errore durante l\'eliminazione del pacchetto. Riprova.');
  }
};

const updateTotalHours = () => {
  if (renewalForm.value.tipo === 'MENSILE') {
    const giorni = parseFloat(renewalForm.value.giorniAcquistati || 0);
    const oreGiorno = parseFloat(renewalForm.value.orarioGiornaliero || 3);
    renewalForm.value.oreAcquistate = giorni * oreGiorno;
  }
};

const onPackageUpdated = () => {
  showEditModal.value = false;
  packageToEdit.value = null;
  loadPackages();
  emit('refresh');
};

const resetRenewalForm = () => {
  renewalForm.value = {
    standardPackageId: '',
    nome: '',
    tipo: 'MENSILE',
    giorniAcquistati: 0,
    oreAcquistate: 0,
    orarioGiornaliero: 3,
    prezzoTotale: 0,
    dataInizio: new Date().toISOString().split('T')[0],
    dataScadenza: '',
    note: '',
  };
};


const onStandardPackageChangeRenewal = () => {
  const selectedPackage = standardPackages.value.find(
    pkg => pkg.id === renewalForm.value.standardPackageId
  );
  
  if (selectedPackage) {
    // Precompila i campi dal pacchetto standard
    renewalForm.value.nome = selectedPackage.nome;
    renewalForm.value.tipo = selectedPackage.tipo;
    renewalForm.value.prezzoTotale = parseFloat(selectedPackage.prezzoStandard);
    
    if (selectedPackage.tipo === 'MENSILE') {
      renewalForm.value.giorniAcquistati = parseInt(selectedPackage.giorniInclusi || 20);
      renewalForm.value.orarioGiornaliero = parseFloat(selectedPackage.orarioGiornaliero || 3);
      
      // ✅ USA oreIncluse dal database (non calcolare!)
      renewalForm.value.oreAcquistate = parseFloat(selectedPackage.oreIncluse || 0);
      
      // Calcola data scadenza
      const oggi = new Date();
      const scadenza = new Date(oggi);
      scadenza.setDate(scadenza.getDate() + renewalForm.value.giorniAcquistati);
      renewalForm.value.dataScadenza = scadenza.toISOString().split('T')[0];
    } else {
      renewalForm.value.oreAcquistate = parseFloat(selectedPackage.oreIncluse || 0);
      renewalForm.value.giorniAcquistati = null;
      renewalForm.value.orarioGiornaliero = null;
      renewalForm.value.dataScadenza = '';
    }
    
    console.log('✅ Pacchetto standard selezionato:', selectedPackage.nome);
  }
};

onMounted(async () => {
  await Promise.all([
    loadPackages(),
    loadStandardPackages()
  ]);
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
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

/* Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-title h3 {
  margin: 0 0 4px 0;
  font-size: 24px;
  color: #344767;
}

.student-name {
  margin: 0;
  font-size: 14px;
  color: #8392ab;
}

.btn-close {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8392ab;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e9ecef;
  color: #344767;
}

/* Tabs */
.modal-tabs {
  display: flex;
  padding: 0 24px;
  gap: 8px;
  border-bottom: 2px solid #f0f2f5;
}

.modal-tabs .tab {
  padding: 14px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #8392ab;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.modal-tabs .tab:hover {
  color: #344767;
}

.modal-tabs .tab.active {
  color: #5e72e4;
  border-bottom-color: #5e72e4;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.tab-content {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Packages List */
.packages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.package-card {
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  transition: all 0.2s;
}

.package-card.active {
  border-color: #2dce89;
  background: rgba(45, 206, 137, 0.02);
}

.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.package-info h4 {
  margin: 0 0 4px 0;
  font-size: 18px;
  color: #344767;
}

.package-type {
  font-size: 13px;
  color: #8392ab;
}

.package-states {
  display: flex;
  gap: 6px;
}

.state-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.state-attivo {
  background: rgba(45, 206, 137, 0.15);
  color: #2dce89;
}

.package-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-row .label {
  color: #8392ab;
}

.detail-row .value {
  color: #344767;
  font-weight: 600;
}

.residuo-warning {
  color: #fb6340;
  font-weight: 600;
}

.package-actions {
  display: flex;
  gap: 8px;
}

/* Forms */
.payment-form,
.renewal-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #344767;
}

.form-control {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #344767;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #5e72e4;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

/* Buttons */
.btn-small {
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 12px 24px;
  background: #f8f9fa;
  color: #344767;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #e9ecef;
}

/* States */
.loading-state,
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #8392ab;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state svg {
  color: #cbd5e0;
}

.loader {
  width: 32px;
  height: 32px;
  border: 3px solid #e9ecef;
  border-top-color: #5e72e4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  margin-right: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Riepilogo Superiore */
.summary-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
  color: white;
}

.summary-box h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label {
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
}

.summary-value.lost {
  color: #fbb140;
}

/* Badge Pacchetto Attivo */
.badge-active {
  position: absolute;
  top: -10px;
  right: 20px;
  background: #2dce89;
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(45, 206, 137, 0.3);
}

.package-active {
  border: 2px solid #2dce89;
  box-shadow: 0 4px 16px rgba(45, 206, 137, 0.15);
}

/* Package Meta */
.package-meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 6px;
}

.package-type {
  padding: 4px 10px;
  background: rgba(94, 114, 228, 0.1);
  color: #5e72e4;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.package-period {
  font-size: 12px;
  color: #8392ab;
}

/* Progress Bar Visuale */
.package-progress {
  margin: 16px 0;
}

.progress-bar {
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s, background 0.3s;
  border-radius: 6px;
}

.progress-success {
  background: linear-gradient(90deg, #2dce89, #2dcecc);
}

.progress-warning {
  background: linear-gradient(90deg, #fb6340, #fbb140);
}

.progress-danger {
  background: linear-gradient(90deg, #f5365c, #fb6340);
}

.progress-text {
  font-size: 14px;
  color: #344767;
  font-weight: 600;
}

/* Info Fattura */
.fattura-info {
  border-top: 1px solid #e9ecef;
  padding-top: 12px;
  margin-top: 12px;
}

.fattura-emessa {
  color: #2dce89;
  font-weight: 600;
}

.fattura-pending {
  color: #fb6340;
  font-weight: 600;
}

.fattura-none {
  color: #8392ab;
}

.fattura-waiting {
  color: #8392ab;
  font-style: italic;
}

.paid-info {
  color: #8392ab;
  font-size: 13px;
}

.paid-success {
  color: #2dce89;
  font-weight: 600;
}

/* Package Actions */
.package-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.btn-action {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #344767;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
}

.btn-outline {
  background: transparent;
  border: 1px solid #e9ecef;
  color: #344767;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-icon {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid #e9ecef;
}

.btn-icon:hover {
  background: #f8f9fa;
}

.btn-danger {
  color: #f5365c;
}

.btn-danger:hover {
  background: rgba(245, 54, 92, 0.1);
  border-color: #f5365c;
}

/* ========================================
   MANTIENI IL TUO CSS ESISTENTE
   ======================================== */

/* ========================================
   ✅ NUOVI STILI DA AGGIUNGERE
   ======================================== */

/* Sezione Pagamenti */
.payments-section {
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.payments-container {
  width: 100%;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  font-size: 13px;
}

.payment-label {
  font-weight: 500;
  color: var(--color-text, #333);
  min-width: 80px;
}

.payment-amount {
  font-weight: 600;
  color: var(--color-primary, #2563eb);
  min-width: 70px;
}

.payment-method {
  color: var(--color-text-secondary, #666);
  font-size: 12px;
  font-style: italic;
}

.invoice-icon {
  margin-left: auto;
  font-size: 16px;
  cursor: help;
}

.payment-total {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border, #e5e7eb);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-success, #16a34a);
}

.no-payments {
  color: var(--color-text-secondary, #666);
  font-style: italic;
  font-size: 13px;
  padding: 8px 0;
}

/* Stati Pagamento */
.status-paid {
  color: var(--color-success, #16a34a);
  font-weight: 600;
}

.status-unpaid {
  color: var(--color-error, #dc2626);
  font-weight: 600;
}

/* Stati Fattura */
.invoice-issued {
  color: var(--color-success, #16a34a);
  font-weight: 500;
}

.invoice-pending {
  color: var(--color-warning, #f59e0b);
  font-weight: 500;
}

.invoice-waiting {
  color: var(--color-text-secondary, #666);
  font-style: italic;
}

/* Costo Pacchetto */
.price-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text, #333);
}

/* Checkbox e hint nel form */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-hint {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-secondary, #666);
  line-height: 1.4;
}


/* MANTIENI IL TUO CSS ESISTENTE */

/* ✅ AGGIUNGI QUESTI NUOVI STILI PER BADGE STATI */

.state-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.state-da-pagare {
  background: rgba(251, 146, 60, 0.15);
  color: #ea580c;
  border: 1px solid rgba(251, 146, 60, 0.3);
}

.state-ore-negative {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.state-scaduto {
  background: rgba(239, 68, 68, 0.15);
  color: #dc2626;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.state-in-scadenza {
  background: rgba(250, 204, 21, 0.15);
  color: #ca8a04;
  border: 1px solid rgba(250, 204, 21, 0.3);
}

.state-attivo {
  background: rgba(34, 197, 94, 0.15);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* ✅ Progress bar danger (rossa) */
.progress-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

/* Pulsante modifica disabilitato */
.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-icon:disabled:hover {
  background: transparent;
}

/* ========================================
   ALERT ORE PERSE - Per Singolo Pacchetto
======================================== */

.package-lost-hours-alert {
  margin-top: 12px;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid;
  font-size: 14px;
}

/* Pacchetto ATTIVO: Arancione (warning) */
.alert-content.is-active {
  background: #fef3c7;
  border-left-color: #f59e0b;
}

/* Pacchetto SCADUTO: Rosso (error) */
.alert-content.is-expired {
  background: #fee2e2;
  border-left-color: #dc2626;
}

.alert-icon {
  font-size: 20px;
}

.alert-text {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.alert-label {
  color: #78350f;
  font-weight: 500;
}

.alert-content.is-expired .alert-label {
  color: #991b1b;
}

.alert-value {
  color: #92400e;
  font-weight: 700;
  font-size: 16px;
}

.alert-content.is-expired .alert-value {
  color: #b91c1c;
}

.alert-badge {
  padding: 4px 8px;
  background: #fbbf24;
  color: #78350f;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ========================================
   ORE PERSE + ORE EFFETTIVE - Compatto
======================================== */

.package-hours-detail {
  margin-top: 12px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.hours-detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hours-detail-item .icon {
  font-size: 16px;
}

.detail-content {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.detail-content .label {
  color: #78350f;
  font-weight: 500;
  font-size: 12px;
}

.detail-content .value {
  color: #92400e;
  font-weight: 700;
  font-size: 14px;
}

.hours-detail-item.effective .detail-content .value {
  color: #065f46;
}

.formula {
  color: #92400e;
  font-size: 11px;
  font-style: italic;
  opacity: 0.7;
}

.info-tooltip {
  cursor: help;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.info-tooltip:hover {
  opacity: 1;
}

/* Pulsante elimina pagamento */
.btn-delete-payment {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #dc2626;
  opacity: 0.6;
  transition: opacity 0.2s;
  padding: 4px;
  margin-left: 8px;
  display: inline-flex;
  align-items: center;
}

.btn-delete-payment:hover {
  opacity: 1;
}

.btn-delete-payment svg {
  width: 16px;
  height: 16px;
}

/* Migliora layout payment-item per contenere il pulsante */
.payment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.payment-item:last-child {
  border-bottom: none;
}


</style>