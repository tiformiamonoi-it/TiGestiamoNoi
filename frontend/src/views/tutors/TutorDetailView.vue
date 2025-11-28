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
        <div class="context-menu">
          <!-- TODO: Implementare menu contestuale (Export, Stampa, etc.) -->
          <!-- <button class="btn-icon">⋮</button> -->
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
            <a :href="`mailto:${tutor.email}`" class="contact-link">📧 {{ tutor.email }}</a>
            <span class="separator">•</span>
            <a :href="`tel:${tutor.phone}`" class="contact-link">📞 {{ tutor.phone || 'N/D' }}</a>
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
                <div class="value">{{ tutor.email }}</div>
              </div>
              <div class="info-item">
                <label>Telefono</label>
                <div class="value">{{ tutor.phone || '-' }}</div>
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
          
          <div class="section-card mt-6">
            <h3>📈 Performance Mensile</h3>
            <p class="text-muted">Grafico in arrivo...</p>
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

import PaymentModal from '@/components/tutors/PaymentModal.vue';
import TutorRatingModal from '@/components/tutors/TutorRatingModal.vue';
import TutorEditModal from '@/components/tutors/TutorEditModal.vue';
import PaymentEditModal from '@/components/tutors/PaymentEditModal.vue';

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
const tutorsForPayment = ref([]);

const tabs = [
  { id: 'anagrafica', label: 'Anagrafica' },
  { id: 'compensi', label: 'Storico Compensi' },
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
  
  // Convert unpaid to same structure as payments
  const unpaidFormatted = unpaid.map(u => ({
    id: 'unpaid-' + u.date,
    mese: u.date,
    importo: u.importo,
    pagato: false,
    proBono: false,
    dataPagamento: null,
    metodo: null
  }));

  // Merge and sort by date desc
  return [...payments, ...unpaidFormatted].sort((a, b) => new Date(b.mese) - new Date(a.mese));
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

.contact-link:hover {
  color: #5e72e4;
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
</style>
