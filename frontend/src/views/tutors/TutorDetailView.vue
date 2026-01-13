<template>
  <div class="tutor-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Caricamento profilo tutor...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Errore caricamento</h3>
      <p>{{ error }}</p>
      <button @click="fetchTutor" class="btn-secondary">Riprova</button>
    </div>

    <div v-else-if="tutor" class="content-container">
      <!-- Breadcrumb & Menu -->
      <div class="top-nav">
        <router-link to="/tutors" class="back-link">
          ← Torna a Elenco Tutor
        </router-link>
        <div class="menu-azioni">
          <button @click="showMenu = !showMenu" class="btn-menu">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
            </svg>
          </button>
          <div v-if="showMenu" class="dropdown-menu">
            <!-- Bottone condizionale Attiva/Disattiva -->
            <button v-if="tutor.active" @click="toggleActive" class="menu-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="6" y="4" width="12" height="16" rx="1"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
              </svg>
              Disattiva Tutor
            </button>
            <button v-else @click="toggleActive" class="menu-item success">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Attiva Tutor
            </button>

            <button @click="deleteTutor" class="menu-item danger">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Elimina Tutor
            </button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="profile-header">
        <div class="header-main">
          <div class="tutor-identity">
            <h1 class="tutor-name">{{ tutor.firstName }} {{ tutor.lastName }}</h1>
            <span :class="['status-badge', tutor.active ? 'status-active' : 'status-inactive']">
              {{ tutor.active ? '🟢 Attivo' : '🔴 Inattivo' }}
            </span>
          </div>
          
          <div class="tutor-rating-section">
            <TutorRating :rating="tutor.rating || 5" :editable="false" />
            <button class="btn-text-action" @click="openRatingModal">Modifica ✏️</button>
          </div>

          <div class="tutor-contacts">
            <span v-if="hasEmail(tutor)" class="contact-link">
              <a :href="`mailto:${tutor.email}`">📧 {{ tutor.email }}</a>
            </span>
            <span v-else class="contact-missing">📧 Email non presente</span>
            <span class="separator">•</span>
            <span v-if="hasPhone(tutor)" class="contact-link">
              <a :href="`tel:${tutor.phone}`">📞 {{ tutor.phone }}</a>
            </span>
            <span v-else class="contact-missing">📞 Telefono non presente</span>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="btn-action btn-outline" @click="openEditModal">
            ✏️ Modifica
          </button>
          <button class="btn-action btn-primary" @click="openPaymentModal">
            💰 Paga
          </button>
          <button class="btn-action btn-outline" @click="goToCalendar">
            📅 Calendario
          </button>
          <button class="btn-action btn-outline" @click="activeTab = 'statistiche'">
            📊 Statistiche
          </button>
        </div>
      </div>

      <!-- Alerts -->
      <div v-if="unpaidAlert" class="alerts-section">
        <div class="alert-banner alert-danger">
          🔴 {{ unpaidAlert.count }} mesi non pagati ({{ unpaidAlert.amount }}€ dovuti)
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Tab 1: Anagrafica -->
        <div v-if="activeTab === 'anagrafica'" class="tab-pane">
          <div class="section-card">
            <div class="card-header">
              <h3>📝 Dati Personali</h3>
            <div class="card-header">
              <h3>📝 Dati Personali</h3>
              <button class="btn-small btn-outline" @click="openEditModal">Modifica ✏️</button>
            </div>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <label>Nome</label>
                <div class="value">{{ tutor.firstName }}</div>
              </div>
              <div class="info-item">
                <label>Cognome</label>
                <div class="value">{{ tutor.lastName }}</div>
              </div>
              <div class="info-item">
                <label>Email</label>
                <div class="value" :class="{ 'value-missing': !hasEmail(tutor) }">
                  {{ hasEmail(tutor) ? tutor.email : 'Email non presente' }}
                </div>
              </div>
              <div class="info-item">
                <label>Telefono</label>
                <div class="value" :class="{ 'value-missing': !hasPhone(tutor) }">
                  {{ hasPhone(tutor) ? tutor.phone : 'Telefono non presente' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Materie (Placeholder) -->
          <div class="section-card mt-6">
            <div class="card-header">
              <h3>📚 Materie & Livelli</h3>
              <button class="btn-small btn-outline" @click="openSubjectsModal">Gestisci ➕</button>
            </div>
            <ul class="subjects-list">
              <li v-for="subject in tutor.subjects" :key="subject.name">
                • {{ subject.name }} 
                <span v-if="subject.levels" class="text-muted">
                  ({{ [subject.levels.medie ? 'Medie' : '', subject.levels.superiori ? 'Superiori' : ''].filter(Boolean).join(', ') }})
                </span>
              </li>
              <li v-if="!tutor.subjects || tutor.subjects.length === 0" class="text-muted">
                Nessuna materia assegnata
              </li>
            </ul>
          </div>
        </div>

        <!-- Tab 2: Storico Compensi -->
        <div v-if="activeTab === 'compensi'" class="tab-pane">
          <TutorPaymentHistory 
            :payments="fullPaymentHistory" 
            @pay="handleHistoryPay"
            @details="handleHistoryDetails"
            @edit="handleHistoryEdit"
            @reset="handleHistoryReset"
            @delete-payment="handleDeletePayment"
            @modify-amount="handleModifyAmount"
            @export="handleHistoryExport"
          />
        </div>

        <!-- Tab 3: Rimborsi -->
        <div v-if="activeTab === 'rimborsi'" class="tab-pane">
          <TutorReimbursements 
            :tutor-id="tutorId" 
            @refresh="fetchTutor"
          />
        </div>

        <!-- Tab 3: Statistiche -->
        <div v-if="activeTab === 'statistiche'" class="tab-pane">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Ore Totali</div>
              <div class="stat-value">{{ tutorStore.currentTutor?.stats?.oreTotali || 0 }}h</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Lezioni Totali</div>
              <div class="stat-value">{{ tutorStore.currentTutor?.stats?.lezioniTotali || 0 }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Alunni Seguiti</div>
              <div class="stat-value">{{ tutorStore.currentTutor?.stats?.alunniSeguiti || 0 }}</div>
            </div>
            <div class="stat-card">
              <div class="stat-label">Compenso Totale</div>
              <div class="stat-value">€{{ (tutorStore.currentTutor?.stats?.compensoTotale || 0).toFixed(2) }}</div>
            </div>
          </div>
          
          <!-- Performance Mensile -->
          <div class="section-card mt-6">
            <div class="section-header-flex">
              <h3>📈 Performance Mensile</h3>
              <div class="header-controls">
                <select v-model="selectedMonths" @change="loadMonthlyPerformance" class="month-selector">
                  <option :value="0">Mese corrente</option>
                  <option :value="3">Ultimi 3 mesi</option>
                  <option :value="6">Ultimi 6 mesi</option>
                  <option :value="12">Ultimo anno</option>
                  <option :value="24">Ultimi 2 anni</option>
                </select>
                <button class="btn-refresh" @click="loadMonthlyPerformance" title="Aggiorna">🔄</button>
              </div>
            </div>
            
            <!-- Loading -->
            <div v-if="performanceLoading" class="loading-state">
              Caricamento...
            </div>
            
            <template v-else-if="monthlyPerformance.length > 0">
              <!-- KPI Cards -->
              <div class="performance-kpis">
                <div class="kpi-card success">
                  <span class="kpi-label">💰 Margine Totale ({{ selectedMonths }} mesi)</span>
                  <span class="kpi-value">€{{ performanceTotals.margine?.toFixed(2) || '0.00' }}</span>
                </div>
                <div class="kpi-card info">
                  <span class="kpi-label">📊 Margine Medio Mensile</span>
                  <span class="kpi-value">€{{ performanceTotals.mediaMargineMensile || 0 }}</span>
                </div>
                <div class="kpi-card primary">
                  <span class="kpi-label">📈 Margine %</span>
                  <span class="kpi-value">{{ performanceTotals.marginePercentuale || 0 }}%</span>
                </div>
              </div>

              <!-- Bar Chart -->
              <div class="chart-container">
                <h4>Andamento Margine</h4>
                <div class="bar-chart">
                  <div 
                    v-for="item in monthlyPerformance" 
                    :key="item.mese" 
                    class="bar-item"
                    :title="`${item.meseLabel}: €${item.margine}`"
                  >
                    <div class="bar-wrapper">
                      <div 
                        class="bar" 
                        :style="{ height: getBarHeight(item.margine) + '%' }"
                        :class="{ 'bar-negative': item.margine < 0 }"
                      >
                        <span class="bar-value">€{{ item.margine }}</span>
                      </div>
                    </div>
                    <span class="bar-label">{{ item.meseLabel }}</span>
                  </div>
                </div>
              </div>

              <!-- Table -->
              <div class="performance-table-container">
                <table class="performance-table">
                  <thead>
                    <tr>
                      <th>Mese</th>
                      <th>Lezioni</th>
                      <th>Ore</th>
                      <th>Studenti</th>
                      <th>Ricavo</th>
                      <th>Compenso</th>
                      <th>Margine</th>
                      <th>%</th>
                      <th>€/Lezione</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in monthlyPerformance" :key="item.mese">
                      <td class="font-bold">{{ item.meseLabel }}</td>
                      <td>{{ item.numLezioni }}</td>
                      <td>{{ item.oreTotali }}h</td>
                      <td>{{ item.numStudenti }}</td>
                      <td class="text-primary">€{{ item.ricavoGenerato.toFixed(2) }}</td>
                      <td class="text-danger">€{{ item.compensoTutor.toFixed(2) }}</td>
                      <td class="text-success font-bold">€{{ item.margine.toFixed(2) }}</td>
                      <td>
                        <span :class="['badge', item.marginePercentuale >= 60 ? 'badge-success' : 'badge-warning']">
                          {{ item.marginePercentuale }}%
                        </span>
                      </td>
                      <td>€{{ item.mediaEntrateLezione.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="totals-row">
                      <td class="font-bold">TOTALE</td>
                      <td>{{ performanceTotals.lezioni }}</td>
                      <td>{{ performanceTotals.ore }}h</td>
                      <td>-</td>
                      <td class="text-primary font-bold">€{{ performanceTotals.ricavo?.toFixed(2) }}</td>
                      <td class="text-danger font-bold">€{{ performanceTotals.compenso?.toFixed(2) }}</td>
                      <td class="text-success font-bold">€{{ performanceTotals.margine?.toFixed(2) }}</td>
                      <td>
                        <span class="badge badge-primary">{{ performanceTotals.marginePercentuale }}%</span>
                      </td>
                      <td>-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </template>
            
            <div v-else class="empty-state">
              <p>Nessun dato disponibile per la performance mensile</p>
            </div>
          </div>

          <!-- Distribuzione Ore per Tipo -->
          <div class="section-card mt-6">
            <div class="section-header-flex">
              <h3>📊 Distribuzione Ore per Tipo</h3>
            </div>
            <div v-if="detailedStatsLoading" class="loading-state">Caricamento...</div>
            <div v-else-if="detailedStats" class="distribution-chart">
              <div class="dist-row">
                <span class="dist-label">Singole</span>
                <div class="dist-bar-container">
                  <div class="dist-bar singole" :style="{ width: detailedStats.distribuzioneOre?.singole?.percentuale + '%' }"></div>
                </div>
                <span class="dist-value">{{ detailedStats.distribuzioneOre?.singole?.ore || 0 }}h ({{ detailedStats.distribuzioneOre?.singole?.percentuale || 0 }}%)</span>
              </div>
              <div class="dist-row">
                <span class="dist-label">Gruppo</span>
                <div class="dist-bar-container">
                  <div class="dist-bar gruppo" :style="{ width: detailedStats.distribuzioneOre?.gruppo?.percentuale + '%' }"></div>
                </div>
                <span class="dist-value">{{ detailedStats.distribuzioneOre?.gruppo?.ore || 0 }}h ({{ detailedStats.distribuzioneOre?.gruppo?.percentuale || 0 }}%)</span>
              </div>
              <div class="dist-row">
                <span class="dist-label">Maxi</span>
                <div class="dist-bar-container">
                  <div class="dist-bar maxi" :style="{ width: detailedStats.distribuzioneOre?.maxi?.percentuale + '%' }"></div>
                </div>
                <span class="dist-value">{{ detailedStats.distribuzioneOre?.maxi?.ore || 0 }}h ({{ detailedStats.distribuzioneOre?.maxi?.percentuale || 0 }}%)</span>
              </div>
            </div>
            <div v-else class="empty-state"><p>Nessun dato disponibile</p></div>
          </div>

          <!-- Top 5 Alunni -->
          <div class="section-card mt-6">
            <div class="section-header-flex">
              <h3>👥 Top 5 Alunni</h3>
            </div>
            <div v-if="detailedStatsLoading" class="loading-state">Caricamento...</div>
            <div v-else-if="detailedStats?.top5Alunni?.length > 0" class="top-alunni-list">
              <div 
                v-for="(alunno, idx) in detailedStats.top5Alunni" 
                :key="alunno.id" 
                class="top-alunno-item"
                @click="$router.push('/students/' + alunno.id)"
              >
                <span class="rank">{{ idx + 1 }}.</span>
                <span class="alunno-nome">{{ alunno.nome }}</span>
                <span class="alunno-stats">{{ alunno.ore }}h ({{ alunno.lezioni }} lezioni)</span>
              </div>
            </div>
            <div v-else class="empty-state"><p>Nessun alunno nel periodo selezionato</p></div>
          </div>

          <!-- Giorni/Orari Preferiti -->
          <div class="section-card mt-6">
            <div class="section-header-flex">
              <h3>📅 Giorni/Orari Preferiti</h3>
            </div>
            <div v-if="detailedStatsLoading" class="loading-state">Caricamento...</div>
            <div v-else-if="detailedStats" class="preferiti-container">
              <div class="preferiti-section">
                <h4>Giorni più attivi</h4>
                <div class="preferiti-list">
                  <div 
                    v-for="g in detailedStats.giorniPreferiti?.slice(0, 3)" 
                    :key="g.giorno" 
                    class="preferiti-item"
                  >
                    <span class="preferiti-label">{{ g.giorno }}</span>
                    <span class="preferiti-count">{{ g.count }} lezioni ({{ g.percentuale }}%)</span>
                  </div>
                  <div v-if="!detailedStats.giorniPreferiti?.length" class="text-muted">Nessun dato</div>
                </div>
              </div>
              <div class="preferiti-section">
                <h4>Orari più frequenti</h4>
                <div class="preferiti-list">
                  <div 
                    v-for="o in detailedStats.orariPreferiti?.slice(0, 3)" 
                    :key="o.fascia" 
                    class="preferiti-item"
                  >
                    <span class="preferiti-label">{{ o.fascia }}</span>
                    <span class="preferiti-count">{{ o.count }} lezioni ({{ o.percentuale }}%)</span>
                  </div>
                  <div v-if="!detailedStats.orariPreferiti?.length" class="text-muted">Nessun dato</div>
                </div>
              </div>
            </div>
            <div v-else class="empty-state"><p>Nessun dato disponibile</p></div>
          </div>
        </div>

        <!-- Tab 4: Alunni -->
        <div v-if="activeTab === 'alunni'" class="tab-pane">
          <TutorStudentsList :students="tutorStore.currentTutor?.students" />
        </div>

        <!-- Tab 5: Cronologia -->
        <div v-if="activeTab === 'cronologia'" class="tab-pane">
          <div class="empty-placeholder">🚧 Cronologia in arrivo...</div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <TutorSubjectsModal 
      :is-open="showSubjectsModal"
      :initial-subjects="tutor?.subjects || []"
      @close="showSubjectsModal = false"
      @save="handleSubjectsSave"
    />

    <PaymentModal 
      :is-open="showPaymentModal"
      :tutors-to-pay="tutorsForPayment"
      @close="showPaymentModal = false"
      @confirm="handlePaymentConfirm"
    />

    <TutorRatingModal
      :is-open="showRatingModal"
      :initial-rating="tutor?.rating || 0"
      @close="showRatingModal = false"
      @save="handleRatingSave"
    />

    <TutorEditModal
      :is-open="showEditModal"
      :tutor="tutor"
      @close="showEditModal = false"
      @save="handleEditSave"
    />

    <PaymentEditModal
      :is-open="showEditPaymentModal"
      :payment="selectedPayment"
      @close="showEditPaymentModal = false"
      @save="handleEditPaymentSave"
    />

    <!-- Modal Modifica Importo Compenso -->
    <Teleport to="body">
      <div v-if="showModifyAmountModal" class="modal-overlay" @click.self="showModifyAmountModal = false">
        <div class="modal-container modify-amount-modal">
          <div class="modal-header">
            <h3>✏️ Modifica Compenso {{ modifyAmountData.meseLabel }}</h3>
            <button class="btn-close" @click="showModifyAmountModal = false">✕</button>
          </div>
          <div class="modal-body">
            <div class="info-box mb-4">
              <p class="text-muted">Stai modificando il compenso calcolato automaticamente dalle lezioni. Questa modifica sovrascriverà il calcolo automatico per questo mese.</p>
            </div>
            <div class="form-group">
              <label>Importo Originale (calcolato)</label>
              <input 
                type="text" 
                :value="'€' + Number(modifyAmountData.importoOriginale).toFixed(2)"
                disabled
                class="form-input disabled"
              />
            </div>
            <div class="form-group">
              <label>Nuovo Importo (€) *</label>
              <input 
                type="number" 
                v-model="modifyAmountData.nuovoImporto" 
                step="0.01" 
                min="0"
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label>Nota (motivo modifica)</label>
              <textarea 
                v-model="modifyAmountData.note" 
                placeholder="Es: Bonus, Detrazione, Correzione..."
                class="form-input"
                rows="2"
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showModifyAmountModal = false">Annulla</button>
            <button class="btn-primary" @click="saveModifyAmount">Salva Modifica</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTutorStore } from '@/stores/tutor';
import TutorRating from '@/components/tutors/TutorRating.vue';
import TutorPaymentHistory from '@/components/tutors/TutorPaymentHistory.vue';
import TutorStudentsList from '@/components/tutors/TutorStudentsList.vue';
import TutorSubjectsModal from '@/components/tutors/TutorSubjectsModal.vue';
import TutorReimbursements from '@/components/tutors/TutorReimbursements.vue';

import PaymentModal from '@/components/tutors/PaymentModal.vue';
import TutorRatingModal from '@/components/tutors/TutorRatingModal.vue';
import TutorEditModal from '@/components/tutors/TutorEditModal.vue';
import PaymentEditModal from '@/components/tutors/PaymentEditModal.vue';
import api from '@/services/api';

const route = useRoute();
const router = useRouter();
const tutorStore = useTutorStore();

const tutorId = route.params.id;
const tutor = ref(null);
const loading = ref(true);
const error = ref(null);
const activeTab = ref('anagrafica');
const showSubjectsModal = ref(false);
const showPaymentModal = ref(false);
const showRatingModal = ref(false);
const showEditModal = ref(false);
const showMenu = ref(false);
const tutorsForPayment = ref([]);

// Modifica Importo Compenso
const showModifyAmountModal = ref(false);
const modifyAmountData = ref({
  mese: null,
  importoOriginale: 0,
  nuovoImporto: 0,
  note: ''
});

// Performance Mensile
const monthlyPerformance = ref([]);
const performanceTotals = ref({});
const performanceLoading = ref(false);
const selectedMonths = ref(6);

// Detailed Stats (distribuzione ore, top 5, preferiti)
const detailedStats = ref(null);
const detailedStatsLoading = ref(false);

const tabs = [
  { id: 'anagrafica', label: 'Anagrafica' },
  { id: 'compensi', label: 'Storico Compensi' },
  { id: 'rimborsi', label: 'Rimborsi' },
  { id: 'statistiche', label: 'Statistiche' },
  { id: 'alunni', label: 'Alunni Seguiti' },
  { id: 'cronologia', label: 'Cronologia' },
];

// Alerts Logic
const unpaidAlert = computed(() => {
  const stats = tutorStore.currentTutor?.currentPeriodStats;
  if (stats && stats.mesiNonPagati && stats.mesiNonPagati.length > 0) {
    return {
      count: stats.mesiNonPagati.length,
      amount: stats.totaleDovuto
    };
  }
  return null;
});

onMounted(async () => {
  await fetchTutor();
  loadMonthlyPerformance(); // Carica performance in background
});

async function fetchTutor() {
  loading.value = true;
  error.value = null;
  try {
    const data = await tutorStore.fetchTutorDetail(tutorId);
    tutor.value = data.tutor;
  } catch (e) {
    error.value = 'Impossibile caricare i dati del tutor.';
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// Helpers for placeholder detection
function hasEmail(t) {
  return t?.email && !t.email.includes('@placeholder.local');
}

function hasPhone(t) {
  return t?.phone && t.phone.trim() !== '';
}

// Performance Mensile
async function loadMonthlyPerformance() {
  performanceLoading.value = true;
  try {
    const response = await api.get(`/tutors/${tutorId}/monthly-performance?mesi=${selectedMonths.value}`);
    monthlyPerformance.value = response.data.performance || [];
    performanceTotals.value = response.data.totali || {};
  } catch (error) {
    console.error('Errore caricamento performance:', error);
    monthlyPerformance.value = [];
  } finally {
    performanceLoading.value = false;
  }
  
  // Also load detailed stats with same period
  loadDetailedStats();
}

// Detailed Stats (distribuzione ore, top 5, preferiti)
async function loadDetailedStats() {
  detailedStatsLoading.value = true;
  try {
    const response = await api.get(`/tutors/${tutorId}/detailed-stats?mesi=${selectedMonths.value}&includeCurrent=true`);
    detailedStats.value = response.data;
  } catch (error) {
    console.error('Errore caricamento detailed stats:', error);
    detailedStats.value = null;
  } finally {
    detailedStatsLoading.value = false;
  }
}

function getBarHeight(margine) {
  if (!monthlyPerformance.value.length) return 0;
  const maxMargine = Math.max(...monthlyPerformance.value.map(p => Math.abs(p.margine)), 1);
  return Math.min(100, (Math.abs(margine) / maxMargine) * 100);
}

function goToCalendar() {
  router.push({ name: 'calendario', query: { tutor: tutorId } });
}

function openPaymentModal() {
  const stats = tutorStore.currentTutor?.currentPeriodStats;
  tutorsForPayment.value = [{
    ...tutor.value,
    mesiNonPagati: stats?.mesiNonPagati || []
  }];
  showPaymentModal.value = true;
}

async function handlePaymentConfirm(payload) {
  try {
    await tutorStore.payTutors(
      payload.pagamenti,
      payload.dataPagamento,
      payload.metodoPagamento,
      payload.note
    );
    showPaymentModal.value = false;
    await fetchTutor(); // Refresh data
    alert('Pagamento registrato con successo!');
  } catch (e) {
    alert('Errore durante il pagamento: ' + e.message);
  }
}

function openRatingModal() {
  showRatingModal.value = true;
}

async function handleRatingSave(newRating) {
  // TODO: API call to update rating
  console.log('New rating:', newRating);
  tutor.value.rating = newRating;
  // await tutorStore.updateRating(tutorId, newRating);
}

function openSubjectsModal() {
  showSubjectsModal.value = true;
}

async function handleSubjectsSave(subjects) {
  try {
    // Aggiorniamo solo le materie
    await tutorStore.updateTutor(tutorId, { subjects });
    // Ricarica dati
    await fetchTutor();
  } catch (e) {
    alert('Errore salvataggio materie');
  }
}

function openEditModal() {
  showEditModal.value = true;
}

async function handleEditSave(updatedTutor) {
  try {
    await tutorStore.updateTutor(tutorId, updatedTutor);
    showEditModal.value = false;
    await fetchTutor();
  } catch (e) {
    alert('Errore salvataggio dati');
  }
}

// History Logic
const showEditPaymentModal = ref(false);
const selectedPayment = ref(null);

const fullPaymentHistory = computed(() => {
  const payments = tutorStore.currentTutor?.payments || [];
  const unpaid = tutorStore.currentTutor?.currentPeriodStats?.mesiNonPagati || [];
  
  // Group by month
  const historyMap = new Map();

  // 1. Add existing payments
  payments.forEach(p => {
    const monthKey = p.mese; // Assuming 'YYYY-MM-DD' or similar that represents the month
    if (!historyMap.has(monthKey)) {
      historyMap.set(monthKey, {
        id: 'month-' + monthKey,
        mese: monthKey,
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        payments: [],
        status: 'DA_PAGARE'
      });
    }
    const entry = historyMap.get(monthKey);
    entry.payments.push(p);
    entry.paidAmount += Number(p.importo);
  });

  // 2. Add unpaid amounts (remaining)
  unpaid.forEach(u => {
    const monthKey = u.date;
    if (!historyMap.has(monthKey)) {
      historyMap.set(monthKey, {
        id: 'month-' + monthKey,
        mese: monthKey,
        totalAmount: 0,
        paidAmount: 0,
        remainingAmount: 0,
        payments: [],
        status: 'DA_PAGARE'
      });
    }
    const entry = historyMap.get(monthKey);
    entry.remainingAmount += Number(u.importo);
  });

  // 3. Calculate totals and status
  const result = Array.from(historyMap.values()).map(entry => {
    entry.totalAmount = entry.paidAmount + entry.remainingAmount;
    
    // Calculate breakdown from lessons
    // Need to fetch lessons or use store if available. 
    // Assuming backend now returns 'lessons' in tutorStore.currentTutor.lessons
    const lessons = tutorStore.currentTutor?.lessons || [];
    // DEBUG: Check if timeSlot is present
    console.log('Lessons for breakdown:', lessons);
    
    const monthLessons = lessons.filter(l => {
      const d = new Date(l.data);
      const entryDate = new Date(entry.mese);
      return d.getMonth() === entryDate.getMonth() && d.getFullYear() === entryDate.getFullYear();
    });

    entry.breakdown = {
      singole: { ore: 0, oreImporto: 0, mezzeOre: 0, mezzeOreImporto: 0 },
      gruppo: { ore: 0, oreImporto: 0, mezzeOre: 0, mezzeOreImporto: 0 },
      maxi: { ore: 0, oreImporto: 0, mezzeOre: 0, mezzeOreImporto: 0 }
    };

    let totalCalculated = 0;

    monthLessons.forEach(l => {
      const type = l.tipo?.toLowerCase() || 'singola';
      const amount = Number(l.compensoTutor || 0);
      
      // Determine if it's a "Mezza Ora"
      // Priority 1: Check 'mezzaLezione' flag on students
      let isHalfHour = false;
      if (l.lessonStudents && l.lessonStudents.length > 0) {
        // If any student has mezzaLezione, treat as half hour (especially for Single)
        if (l.lessonStudents.some(ls => ls.mezzaLezione)) {
          isHalfHour = true;
        }
      }

      // Priority 2: If not set by flag, check TimeSlot duration
      if (!isHalfHour && l.timeSlot) {
        const [startH, startM] = l.timeSlot.oraInizio.split(':').map(Number);
        const [endH, endM] = l.timeSlot.oraFine.split(':').map(Number);
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        if (durationMinutes <= 45) isHalfHour = true;
      }

      // Priority 3: Fallback Heuristic based on Amount
      if (!isHalfHour && !l.timeSlot) {
         if (type === 'singola' && amount <= 3.0) isHalfHour = true;
         else if (type === 'gruppo' && amount <= 4.5) isHalfHour = true;
         else if (type === 'maxi' && amount <= 4.5) isHalfHour = true;
      }

      if (type === 'singola') {
        if (isHalfHour) {
          entry.breakdown.singole.mezzeOre++;
          entry.breakdown.singole.mezzeOreImporto += amount;
        } else {
          entry.breakdown.singole.ore++;
          entry.breakdown.singole.oreImporto += amount;
        }
      } else if (type === 'gruppo') {
        if (isHalfHour) {
          entry.breakdown.gruppo.mezzeOre++;
          entry.breakdown.gruppo.mezzeOreImporto += amount;
        } else {
          entry.breakdown.gruppo.ore++;
          entry.breakdown.gruppo.oreImporto += amount;
        }
      } else if (type === 'maxi') {
        if (isHalfHour) {
          entry.breakdown.maxi.mezzeOre++;
          entry.breakdown.maxi.mezzeOreImporto += amount;
        } else {
          entry.breakdown.maxi.ore++;
          entry.breakdown.maxi.oreImporto += amount;
        }
      }
      
      totalCalculated += amount;
    });

    // Override totalAmount with calculated floor if no payments exist yet?
    // Or just use it for the "Total Calcolato" display?
    // The requirement says "Totale dovuto deve essere la somma... approssimate per difetto".
    // So we should probably use Math.floor(totalCalculated) as the source of truth for 'totalAmount' if it's not already set by payments?
    // Actually, 'totalAmount' in history is (paid + remaining). 
    // If we are building history from scratch (unpaid months), we rely on 'calcolaStatsTutor' from backend.
    // But here we are recalculating on frontend for the breakdown.
    // Let's trust the backend 'remainingAmount' for the main table, but show the detailed calculation in the popup.
    // Wait, if the backend doesn't floor it, we might have a mismatch.
    // Backend 'calcolaCompensoMese' uses 'Math.floor(totaleGrezzo)'. So it IS floored.
    // So frontend calculation should match backend.
    
    entry.calculatedTotal = Math.floor(totalCalculated);

    // Check for Pro Bono FIRST - if any payment is Pro Bono, the whole month is considered paid
    const hasProBonoPayment = entry.payments.some(p => p.proBono || p.status === 'PRO_BONO');
    
    if (hasProBonoPayment) {
      entry.status = 'PRO_BONO';
      entry.remainingAmount = 0; // Pro Bono = fully covered
      // Keep totalAmount as calculated for display (original amount)
      entry.totalAmount = entry.calculatedTotal || entry.totalAmount;
    } else if (entry.paidAmount > 0 && entry.remainingAmount > 0.01) {
      entry.status = 'PARZIALE';
    } else if (entry.remainingAmount <= 0.01 && entry.paidAmount > 0) {
      entry.status = 'PAGATO';
    } else {
      entry.status = 'DA_PAGARE';
    }
    
    return entry;
  });

  // Sort by date desc
  return result.sort((a, b) => new Date(b.mese) - new Date(a.mese));
});

function handleHistoryPay(item) {
  tutorsForPayment.value = [{
    ...tutor.value,
    mesiNonPagati: [{ date: item.mese, importo: item.importo }]
  }];
  showPaymentModal.value = true;
}

function handleHistoryDetails(item) {
  // Placeholder for details
  alert(`Dettagli per ${new Date(item.mese).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}: \nImporto: ${item.importo}€\n(Dettaglio ore in arrivo)`);
}

function handleHistoryEdit(item) {
  selectedPayment.value = item;
  showEditPaymentModal.value = true;
}

async function handleHistoryReset(item) {
  if (!confirm('Sei sicuro di voler resettare questo pagamento? Verrà eliminato dalla contabilità.')) return;
  
  try {
    await tutorStore.deletePayment(item.id);
    await fetchTutor();
  } catch (e) {
    alert('Errore eliminazione pagamento: ' + e.message);
  }
}

async function handleDeletePayment(payment) {
  if (!confirm(`Sei sicuro di voler eliminare il pagamento di ${payment.importo}€ del ${new Date(payment.dataPagamento).toLocaleDateString()}?`)) return;

  try {
    await tutorStore.deletePayment(payment.id);
    await fetchTutor();
  } catch (e) {
    alert('Errore eliminazione pagamento: ' + e.message);
  }
}

function handleModifyAmount(item) {
  modifyAmountData.value = {
    mese: item.mese,
    importoOriginale: item.totalAmount,
    nuovoImporto: item.totalAmount,
    note: '',
    meseLabel: new Date(item.mese).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  };
  showModifyAmountModal.value = true;
}

async function saveModifyAmount() {
  try {
    const { mese, nuovoImporto, note } = modifyAmountData.value;
    
    if (!nuovoImporto || nuovoImporto < 0) {
      alert('Inserisci un importo valido');
      return;
    }
    
    await api.put(`/tutors/${tutorId}/compenso-mensile`, {
      mese,
      nuovoImporto: parseFloat(nuovoImporto),
      note
    });
    
    showModifyAmountModal.value = false;
    await fetchTutor();
    alert('✅ Importo compenso aggiornato con successo!');
  } catch (e) {
    alert('Errore: ' + (e.response?.data?.error || e.message));
  }
}

function handleHistoryExport(item) {
  alert('Funzionalità Export in arrivo... Porterà alla pagina dedicata agli export.');
}

async function handleEditPaymentSave(updatedPayment) {
  try {
    // TODO: Implement backend API for updating payment
    console.log('Saving payment:', updatedPayment);
    // If it's an existing payment (has real ID), update it
    // If it's unpaid (id starts with 'unpaid-'), we might need to create a record if setting pro-bono
    
    if (updatedPayment.proBono && !updatedPayment.pagato) {
      // Mark as paid (pro-bono)
      await tutorStore.payTutors(
        [{ tutorId: tutorId, mesi: [updatedPayment.mese] }],
        new Date(),
        'PRO_BONO',
        updatedPayment.note
      );
    } else {
       // Just update details if it was already paid
       await tutorStore.updatePayment(updatedPayment);
    }
    
    showEditPaymentModal.value = false;
    await fetchTutor();
  } catch (e) {
    alert('Errore salvataggio pagamento: ' + e.message);
  }
}

// Toggle Active/Inactive
async function toggleActive() {
  showMenu.value = false;
  const newState = !tutor.value.active;
  const action = newState ? 'attivare' : 'disattivare';
  
  if (!confirm(`Sei sicuro di voler ${action} ${tutor.value.firstName} ${tutor.value.lastName}?`)) return;
  
  try {
    await tutorStore.updateTutor(tutorId, { active: newState });
    await fetchTutor();
  } catch (e) {
    console.error('Errore toggle stato:', e);
    alert('❌ Errore: ' + (e.response?.data?.error || e.message));
  }
}

// Delete Tutor
async function deleteTutor() {
  showMenu.value = false;
  if (!confirm(`Sei sicuro di voler eliminare ${tutor.value.firstName} ${tutor.value.lastName}?\n\nQuesta azione è irreversibile.`)) return;
  
  try {
    await api.delete(`/tutors/${tutorId}`);
    alert('✅ Tutor eliminato con successo!');
    router.push('/tutors');
  } catch (e) {
    console.error('Errore eliminazione:', e);
    const errorMsg = e.response?.data?.error || 'Errore durante l\'eliminazione';
    alert(`❌ ${errorMsg}`);
  }
}
</script>

<style scoped>
.tutor-detail-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Loading & Error */
.loading-container, .error-container {
  text-align: center;
  padding: 60px;
  color: #8392ab;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5e72e4;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Top Nav */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.back-link {
  color: #8392ab;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.back-link:hover {
  color: #5e72e4;
}

/* Dropdown Menu */
.menu-azioni {
  position: relative;
}

.btn-menu {
  padding: 8px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  color: #8392ab;
  transition: all 0.2s;
}

.btn-menu:hover {
  background: #f8f9fa;
  color: #344767;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 8px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 180px;
  z-index: 100;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: #344767;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item.success {
  color: #2dce89;
}

.menu-item.success:hover {
  background: rgba(45, 206, 137, 0.1);
}

.menu-item.danger {
  color: #f5365c;
}

.menu-item.danger:hover {
  background: rgba(245, 54, 92, 0.1);
}

/* Profile Header */
.profile-header {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.header-main {
  margin-bottom: 24px;
}

.tutor-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.tutor-name {
  font-size: 28px;
  font-weight: 700;
  color: #344767;
  margin: 0;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-active {
  background: rgba(45, 206, 137, 0.1);
  color: #2dce89;
}

.status-inactive {
  background: rgba(245, 54, 92, 0.1);
  color: #f5365c;
}

.tutor-rating-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.btn-text-action {
  background: none;
  border: none;
  color: #5e72e4;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.tutor-contacts {
  display: flex;
  gap: 12px;
  color: #8392ab;
  font-size: 14px;
}

.contact-link {
  color: #8392ab;
  text-decoration: none;
  transition: color 0.2s;
}

.contact-link a {
  color: inherit;
  text-decoration: none;
}

.contact-link:hover,
.contact-link a:hover {
  color: #5e72e4;
}

.contact-missing {
  color: #adb5bd;
  font-style: italic;
}

.value-missing {
  color: #adb5bd;
  font-style: italic;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-action {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-outline {
  background: white;
  border: 1px solid #e9ecef;
  color: #344767;
}

.btn-outline:hover {
  background: #f8f9fa;
  border-color: #d1d7e0;
}

.btn-success {
  background: linear-gradient(135deg, #2dce89, #2dcecc);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 206, 137, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #fb6340, #fbb140);
  color: white;
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(251, 99, 64, 0.3);
}

.btn-danger {
  background: linear-gradient(135deg, #f5365c, #f56036);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 54, 92, 0.3);
}

.actions-spacer {
  flex: 1;
  min-width: 20px;
}

/* Alerts */
.alerts-section {
  margin-bottom: 24px;
}

.alert-banner {
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-danger {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: 2px;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 24px;
  overflow-x: auto;
}

.tab-btn {
  padding: 12px 24px;
  background: none;
  border: none;
  font-weight: 600;
  color: #8392ab;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #5e72e4;
}

.tab-btn.active {
  color: #5e72e4;
  border-bottom-color: #5e72e4;
}

/* Tab Content */
.section-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #344767;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.info-item label {
  display: block;
  font-size: 12px;
  color: #8392ab;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
}

.info-item .value {
  font-size: 16px;
  color: #344767;
  font-weight: 500;
}

.subjects-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.subjects-list li {
  padding: 8px 0;
  color: #344767;
  font-size: 15px;
}

.empty-placeholder {
  text-align: center;
  padding: 40px;
  color: #8392ab;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #e9ecef;
}

.mt-6 { margin-top: 24px; }
.btn-small { padding: 6px 12px; font-size: 12px; border-radius: 6px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  text-align: center;
}

.stat-label {
  font-size: 13px;
  color: #8392ab;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #344767;
}

.text-muted { color: #8392ab; font-size: 14px; }

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

.modal-container {
  background: white;
  padding: 24px;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #344767;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #8392ab;
  padding: 4px;
}

.btn-close:hover {
  color: #344767;
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #344767;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  color: #344767;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #5e72e4;
}

.form-input.disabled {
  background: #f6f9fc;
  color: #8392ab;
}

.info-box {
  background: #f8f9fe;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #5e72e4;
}

.mb-4 { margin-bottom: 16px; }

.btn-primary {
  background: linear-gradient(135deg, #5e72e4 0%, #825ee4 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.4);
}

.btn-secondary {
  background: white;
  color: #344767;
  border: 1px solid #e9ecef;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

/* Performance Mensile */
.section-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header-flex h3 {
  margin: 0;
}

.btn-refresh {
  background: none;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 14px;
}

.btn-refresh:hover {
  background: #f8f9fa;
}

.header-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.month-selector {
  padding: 6px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 13px;
  color: #344767;
  background: white;
  cursor: pointer;
}

.month-selector:focus {
  outline: none;
  border-color: #5e72e4;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #8392ab;
}

.performance-kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.kpi-card {
  padding: 16px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-card.success {
  background: linear-gradient(135deg, #2dce89 0%, #26a65b 100%);
  color: white;
}

.kpi-card.info {
  background: linear-gradient(135deg, #11cdef 0%, #1171ef 100%);
  color: white;
}

.kpi-card.primary {
  background: linear-gradient(135deg, #5e72e4 0%, #825ee4 100%);
  color: white;
}

.kpi-label {
  font-size: 12px;
  opacity: 0.9;
}

.kpi-value {
  font-size: 24px;
  font-weight: 700;
}

/* Bar Chart */
.chart-container {
  background: #f8f9fe;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.chart-container h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #344767;
}

.bar-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 200px;
  gap: 8px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 80px;
}

.bar-wrapper {
  width: 100%;
  height: 160px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  width: 100%;
  max-width: 50px;
  background: linear-gradient(180deg, #2dce89 0%, #26a65b 100%);
  border-radius: 6px 6px 0 0;
  min-height: 10px;
  transition: height 0.5s ease;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 6px;
}

.bar-negative {
  background: linear-gradient(180deg, #f5365c 0%, #d31f4a 100%);
}

.bar-value {
  font-size: 10px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.bar-label {
  font-size: 11px;
  color: #8392ab;
  margin-top: 8px;
  text-align: center;
}

/* Performance Table */
.performance-table-container {
  overflow-x: auto;
}

.performance-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.performance-table th,
.performance-table td {
  padding: 10px 8px;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.performance-table th {
  background: #f8f9fe;
  color: #8392ab;
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
}

.performance-table td:first-child,
.performance-table th:first-child {
  text-align: left;
}

.performance-table .font-bold {
  font-weight: 600;
}

.performance-table .text-primary {
  color: #5e72e4;
}

.performance-table .text-danger {
  color: #f5365c;
}

.performance-table .text-success {
  color: #2dce89;
}

.totals-row {
  background: #f8f9fe;
  font-weight: 600;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.badge-primary {
  background: #e8e9fc;
  color: #5e72e4;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #8392ab;
}

/* Distribution Chart Styles */
.distribution-chart {
  padding: 16px 0;
}

.dist-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.dist-label {
  width: 70px;
  font-weight: 600;
  color: #344767;
  font-size: 14px;
}

.dist-bar-container {
  flex: 1;
  height: 24px;
  background: #f1f1f1;
  border-radius: 12px;
  overflow: hidden;
}

.dist-bar {
  height: 100%;
  border-radius: 12px;
  transition: width 0.5s ease;
}

.dist-bar.singole {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
}

.dist-bar.gruppo {
  background: linear-gradient(135deg, #2dce89, #1aae6f);
}

.dist-bar.maxi {
  background: linear-gradient(135deg, #fb6340, #f5365c);
}

.dist-value {
  width: 100px;
  text-align: right;
  font-size: 13px;
  color: #8392ab;
  font-family: monospace;
}

/* Top Alunni List Styles */
.top-alunni-list {
  padding: 8px 0;
}

.top-alunno-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.top-alunno-item:hover {
  background: #f8f9fa;
}

.top-alunno-item .rank {
  font-weight: 700;
  color: #5e72e4;
  font-size: 16px;
  width: 24px;
}

.top-alunno-item .alunno-nome {
  flex: 1;
  font-weight: 600;
  color: #344767;
}

.top-alunno-item .alunno-stats {
  color: #8392ab;
  font-size: 13px;
  font-family: monospace;
}

/* Preferiti Container Styles */
.preferiti-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 8px 0;
}

.preferiti-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: #344767;
  font-weight: 600;
}

.preferiti-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preferiti-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preferiti-label {
  font-weight: 600;
  color: #344767;
  font-size: 14px;
}

.preferiti-count {
  color: #8392ab;
  font-size: 13px;
}

@media (max-width: 768px) {
  .preferiti-container {
    grid-template-columns: 1fr;
  }
}
</style>
