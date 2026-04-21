<template>
    <div class="dashboard">
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p class="breadcrumb">Home / Dashboard</p>
        </div>
      </div>

      <!-- Mini Statistics Cards -->
      <div class="stats-row">
        <div class="stat-card gradient-primary">
          <div class="stat-content">
            <p class="stat-label">Studenti Attivi</p>
            <h3 class="stat-value">{{ stats.studentiAttivi }}</h3>
          </div>
          <div class="stat-icon">
            <div class="icon-wrapper primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend positive">+{{ stats.studentiTrend }}%</span>
            <span class="footer-text">vs mese scorso</span>
          </div>
        </div>

        <div class="stat-card gradient-info">
          <div class="stat-content">
            <p class="stat-label">Pacchetti Attivi</p>
            <h3 class="stat-value">{{ stats.pacchettiAttivi }}</h3>
          </div>
          <div class="stat-icon">
            <div class="icon-wrapper info">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend positive">+{{ stats.pacchettiTrend }}%</span>
            <span class="footer-text">nuovi questa settimana</span>
          </div>
        </div>

        <div class="stat-card gradient-success">
          <div class="stat-content">
            <p class="stat-label">Lezioni Oggi</p>
            <h3 class="stat-value">{{ stats.lezioniOggi }}</h3>
          </div>
          <div class="stat-icon">
            <div class="icon-wrapper success">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend neutral">{{ stats.lezioniProgrammate }}</span>
            <span class="footer-text">programmate</span>
          </div>
        </div>

        <div class="stat-card gradient-warning">
          <div class="stat-content">
            <p class="stat-label">Saldo Mese</p>
            <h3 class="stat-value">€{{ stats.saldoMese.toLocaleString() }}</h3>
          </div>
          <div class="stat-icon">
            <div class="icon-wrapper warning">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend positive">+{{ stats.saldoTrend }}%</span>
            <span class="footer-text">vs mese scorso</span>
          </div>
        </div>
      </div>

      <!-- Azioni Prioritarie -->
      <div class="section-title">
        <h2>Azioni Prioritarie</h2>
      </div>

      <div class="actions-grid">
        <!-- PACCHETTI IN SCADENZA -->
        <div class="action-card warning" :class="{ 'expanded': showAll.inScadenza }">
          <div class="action-header clickable" @click="toggleShowAll('inScadenza')">
            <div class="action-badge warning">
              {{ actionsData.pacchettiInScadenzaList.length }}
            </div>
            <h4>Pacchetti in Scadenza</h4>
            <span class="expand-icon" v-if="actionsData.pacchettiInScadenzaList.length > 3">
              {{ showAll.inScadenza ? '▲' : '▼' }}
            </span>
          </div>
          <p class="action-desc">Studenti con ≤ 10% ore/giorni rimanenti</p>
          
          <div class="action-list" v-if="actionsData.pacchettiInScadenzaList.length">
            <div 
              v-for="(item, idx) in visibleList(actionsData.pacchettiInScadenzaList, 'inScadenza')" 
              :key="idx" 
              class="action-list-item"
              @click="router.push(`/students/${item.studentId}`)"
            >
              <div class="item-name">{{ item.studentName }}</div>
              <div class="item-details">{{ item.tipo }}: {{ item.percentualeResidua }}% residuo</div>
            </div>
            
            <button class="btn-visualizza-tutti" @click="goToStudents('inScadenza')">
              Visualizza tutti nella lista studenti →
            </button>
          </div>
        </div>

        <!-- PACCHETTI SCADUTI -->
        <div class="action-card critical" :class="{ 'expanded': showAll.scaduti }">
          <div class="action-header clickable" @click="toggleShowAll('scaduti')">
            <div class="action-badge danger">
              {{ actionsData.pacchettiScadutiList.length }}
            </div>
            <h4>Pacchetti Scaduti</h4>
            <span class="expand-icon" v-if="actionsData.pacchettiScadutiList.length > 3">
              {{ showAll.scaduti ? '▲' : '▼' }}
            </span>
          </div>
          <p class="action-desc">Pacchetti con stato Scaduto</p>
          
          <div class="action-list" v-if="actionsData.pacchettiScadutiList.length">
            <div 
              v-for="(item, idx) in visibleList(actionsData.pacchettiScadutiList, 'scaduti')" 
              :key="idx" 
              class="action-list-item"
              @click="router.push(`/students/${item.studentId}`)"
            >
              <div class="item-name">{{ item.studentName }}</div>
              <div class="item-details">{{ formatDate(item.dataScadenza) }} - {{ item.nome }}</div>
            </div>
            <button class="btn-visualizza-tutti" @click="goToStudents('scaduti')">
              Visualizza tutti nella lista studenti →
            </button>
          </div>
        </div>

        <!-- PAGAMENTI PENDENTI -->
        <div class="action-card high" :class="{ 'expanded': showAll.pagamenti }">
          <div class="action-header clickable" @click="toggleShowAll('pagamenti')">
            <div class="action-badge info">
              {{ actionsData.pagamentiPendentiList.length }}
            </div>
            <h4>Pagamenti Pendenti</h4>
            <span class="expand-icon" v-if="actionsData.pagamentiPendentiList.length > 3">
              {{ showAll.pagamenti ? '▲' : '▼' }}
            </span>
          </div>
          <p class="action-desc">Pacchetti con saldo non completato</p>
          
          <div class="action-list" v-if="actionsData.pagamentiPendentiList.length">
            <div 
              v-for="(item, idx) in visibleList(actionsData.pagamentiPendentiList, 'pagamenti')" 
              :key="idx" 
              class="action-list-item"
              @click="router.push(`/students/${item.studentId}`)"
            >
              <div class="item-name">{{ item.studentName }}</div>
              <div class="item-details">Residuo: €{{ item.importoResiduo }}</div>
            </div>
            <button class="btn-visualizza-tutti" @click="goToStudents('pagamenti')">
              Visualizza tutti nella lista studenti →
            </button>
          </div>
        </div>
      </div>

      <!-- Attività -->
      <div class="widgets-row">
        <div class="widget-card full-width">
          <div class="widget-header">
            <h3>Attività</h3>
            <select v-model="periodoAttivita" class="select-minimal" @change="handleAttivitaChange">
              <option value="ieri">Ieri</option>
              <option value="mese_corrente">Questo Mese</option>
              <option value="mese_precedente">Mese Precedente</option>
              <option value="anno_corrente">Anno Attuale</option>
            </select>
          </div>

          <div class="activity-list">
            <div class="activity-item">
              <span class="activity-label">Ore erogate</span>
              <span class="activity-value">{{ attivita.oreErogate }}h / {{ attivita.oreProgrammate }}h</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Tasso presenza</span>
              <span class="activity-value">{{ attivita.percentualePresenza }}%</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Costo tutor</span>
              <span class="activity-value">€{{ attivita.costoTutor }}</span>
            </div>
            <div class="activity-item">
              <span class="activity-label">Ricavo stimato</span>
              <span class="activity-value">€{{ attivita.guadagnoStimato }}</span>
            </div>
            <div class="activity-item highlight">
              <span class="activity-label">Margine netto</span>
              <span class="activity-value primary">€{{ attivita.margineNetto }} ({{ attivita.percentualeMargine }}%)</span>
            </div>
            
          </div>
        </div>
      </div>

      <!-- Widget 4: Performance Tutor (Solo Admin) -->
<div v-if="authStore.isAdmin" class="widget-full">
  <div class="widget-card">
    <div class="widget-header">
      <h3>Performance Tutor</h3>
      <select v-model="tutorPeriodo" class="select-minimal" @change="handlePeriodoChange">
        <option value="settimana">Questa Settimana</option>
        <option value="mese">Questo Mese</option>
      </select>
    </div>

    <div v-if="performanceTutor.length === 0" class="empty-state">
      <p>Nessun tutor ha registrato lezioni negli ultimi 7 giorni</p>
    </div>

    <div v-else class="tutors-grid">
      <div v-for="tutor in performanceTutor" :key="tutor.id" class="tutor-card">
        <div class="tutor-info">
          <div class="tutor-name">{{ tutor.nome }} {{ tutor.cognome }}</div>
          <div class="tutor-stats-row">
            <span class="tutor-stat">{{ tutor.oreLavorate }}h / {{ tutor.oreDisponibili }}h</span>
            <span class="tutor-stat">{{ tutor.percentualeCapacita }}%</span>
          </div>
        </div>
        <div class="tutor-earnings">
          <div class="earning-value">€{{ tutor.guadagnoPeriodo }}</div>

          <div class="earning-label">{{ tutorPeriodo === 'mese' ? 'mese' : 'settimana' }}</div>

        </div>
      </div>
    </div>
  </div>
</div>

<!-- Widget 5: Ripartizione Pacchetti -->
<div class="widget-full">
  <div class="widget-card">
    <div class="widget-header">
      <h3>📦 Distribuzione Pacchetti</h3>
      <span class="total-badge">{{ ripartizionePacchetti.totaleAttivi }} Attivi</span>
    </div>

    <div v-if="ripartizionePacchetti.tipologie.length === 0" class="empty-state">
      <p>Nessun pacchetto attivo</p>
    </div>

    <div v-else class="pacchetti-content">
      <!-- Grafico Barre -->
      <div class="chart-container-bar" :style="{ height: Math.max(160, ripartizionePacchetti.tipologie.length * 52 + 20) + 'px' }">
        <Bar :data="chartData" :options="chartOptions" />
      </div>

      <!-- Lista Tipologie -->
      <div class="tipologie-list">
        <div
          v-for="(tipo, index) in ripartizionePacchetti.tipologie"
          :key="tipo.nome"
          class="tipologia-item"
        >
          <div class="tipo-info">
            <div
              class="tipo-dot"
              :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
            ></div>
            <div class="tipo-details">
              <div class="tipo-nome">{{ tipo.nome }}</div>
              <div class="tipo-stats">
                {{ tipo.count }} pacchetti ({{ tipo.percentuale }}%)
              </div>
            </div>
          </div>
          <div class="tipo-guadagno">
            <div class="guadagno-value">€{{ tipo.guadagnoMedio }}</div>
            <div class="guadagno-label">medio/pkt</div>
          </div>
        </div>
      </div>

      <!-- Pacchetto più redditizio -->
      <div class="redditizio-box">
        <div class="redditizio-icon">💡</div>
        <div class="redditizio-content">
          <div class="redditizio-label">Pacchetto più redditizio</div>
          <div class="redditizio-value">
            {{ ripartizionePacchetti.pacchettoRedditizio.nome }} - 
            €{{ ripartizionePacchetti.pacchettoRedditizio.guadagnoMedio }}/pkt
          </div>
        </div>
      </div>

      <button class="btn-link" @click="router.push('/packages')">
        Gestisci Pacchetti →
      </button>
    </div>
  </div>
</div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { dashboardAPI } from '@/services/api';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const router = useRouter();
const authStore = useAuthStore();

// Stati reattivi
const finanzePeriodo = ref('mese_corrente');
const loading = ref(true);
const error = ref(null);

// Mini Statistics
const stats = ref({
  studentiAttivi: 0,
  studentiTrend: 0,
  pacchettiAttivi: 0,
  pacchettiTrend: 0,
  lezioniOggi: 0,
  lezioniProgrammate: 0,
  saldoMese: 0,
  saldoTrend: 0,
});

const chartData = computed(() => ({
  labels: ripartizionePacchetti.value.tipologie.map((t) => t.nome),
  datasets: [
    {
      label: 'Numero Pacchetti',
      data: ripartizionePacchetti.value.tipologie.map((t) => t.count),
      backgroundColor: [
        'rgba(94, 114, 228, 0.8)',   // Blu
        'rgba(45, 206, 137, 0.8)',   // Verde
        'rgba(251, 99, 64, 0.8)',    // Arancione
        'rgba(130, 94, 228, 0.8)',   // Viola
        'rgba(17, 205, 239, 0.8)',   // Ciano
        'rgba(245, 54, 92, 0.8)',    // Rosso
      ],
      borderRadius: 6,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y', // Grafico a barre orizzontali
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const tipo = ripartizionePacchetti.value.tipologie[context.dataIndex];
          return `${tipo.count} pacchetti (${tipo.percentuale}%)`;
        },
      },
    },
  },
  scales: {
    x: { beginAtZero: true, grid: { display: false } },
    y: { grid: { display: false } }
  }
};

// Azioni Prioritarie
const actionsData = ref({
  pacchettiInScadenzaList: [],
  pacchettiScadutiList: [],
  pagamentiPendentiList: []
});

const showAll = ref({
  inScadenza: false,
  scaduti: false,
  pagamenti: false
});

const visibleList = (list, type) => {
  if (!list) return [];
  return showAll.value[type] ? list.slice(0, 10) : list.slice(0, 3);
};

const toggleShowAll = (type) => {
  showAll.value[type] = !showAll.value[type];
};

const goToStudents = (type) => {
  let query = {};
  if (type === 'scaduti') query.stato = 'scaduto';
  else if (type === 'pagamenti') query.pagamentoSospeso = 'true';
  else if (type === 'inScadenza') query.stato = 'in_scadenza';
  router.push({ path: '/students', query });
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('it-IT');
};

const periodoAttivita = ref('ieri');

// Finanze
const finanze = ref({
  entrate: 0,
  uscite: 0,
  saldo: 0,
  trendEntrate: 0,
  trendUscite: 0,
  nuoviPacchetti: 0,
  rinnovi: 0,
  compensiPagati: 0,
});

// Attività
const attivita = ref({
  oreErogate: 0,
  oreProgrammate: 0,
  percentualePresenza: 0,
  costoTutor: 0,
  guadagnoStimato: 0,
  margineNetto: 0,
  percentualeMargine: 0,
  riepilogoMaterie: [],
});

// Performance Tutor
const performanceTutor = ref([]);
const tutorPeriodo = ref('settimana');
// Watch per ricaricare quando cambia periodo tutor
import { watch } from 'vue';

watch(tutorPeriodo, async () => {
  await fetchPerformanceTutor();
});


// Ripartizione Pacchetti
const ripartizionePacchetti = ref({
  totaleAttivi: 0,
  tipologie: [],
  pacchettoRedditizio: { nome: '', guadagnoMedio: 0 },
});


// Fetch dati dashboard
const fetchDashboardData = async () => {
  loading.value = true;
  error.value = null;

  try {
    console.log('📡 Chiamata API con periodo tutor:', tutorPeriodo.value, 'periodo attivita:', periodoAttivita.value); // DEBUG
    const response = await dashboardAPI.getStats(tutorPeriodo.value, 'mese_corrente', periodoAttivita.value);
    const data = response.data;

    // Popola stats
    stats.value = data.stats;

    // Popola azioni prioritarie con dati reali
    actionsData.value.pacchettiInScadenzaList = data.azioniPrioritarie?.pacchettiInScadenzaList || [];
    actionsData.value.pacchettiScadutiList = data.azioniPrioritarie?.pacchettiScadutiList || [];
    actionsData.value.pagamentiPendentiList = data.azioniPrioritarie?.pagamentiPendentiList || [];

    // Popola finanze
    finanze.value = data.finanze;

    // Popola attività
    console.log('📊 Attività ricevuta dal backend:', data.attivita, '| periodo:', periodoAttivita.value);
    attivita.value = data.attivita;
    performanceTutor.value = data.performanceTutor || [];
    // Popola ripartizione pacchetti
    ripartizionePacchetti.value = data.ripartizionePacchetti || {
    totaleAttivi: 0,
    tipologie: [],
    pacchettoRedditizio: { nome: '', guadagnoMedio: 0 },
    };

  } catch (err) {
    console.error('Errore caricamento dashboard:', err);
    error.value = 'Errore nel caricamento dei dati';
  } finally {
    loading.value = false;
  }
};

// Fetch separato per performance tutor (può cambiare periodo)
const fetchPerformanceTutor = async () => {
  try {
    const response = await dashboardAPI.getStats(tutorPeriodo.value);
    performanceTutor.value = response.data.performanceTutor || [];
  } catch (err) {
    console.error('Errore caricamento performance tutor:', err);
  }
};


const handleActionClick = (action) => {
  router.push(action.link);
};
// Handler cambio periodo tutor
const handlePeriodoChange = async () => {
  console.log('🔄 Cambio periodo tutor:', tutorPeriodo.value); // DEBUG
  await fetchDashboardData();
};
const handleAttivitaChange = async () => {
  console.log('🔄 Cambio periodo attivita:', periodoAttivita.value); // DEBUG
  await fetchDashboardData();
};

onMounted(() => {
  fetchDashboardData();
});
</script>


<style scoped>
.dashboard {
  margin: 20px 50px;
}

/* Header */
.page-header {
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 4px 0;
  color: #344767;
  font-size: 28px;
  font-weight: 700;
}

.breadcrumb {
  margin: 0;
  color: #8392ab;
  font-size: 14px;
}

/* Mini Statistics */
/* Mini Statistics */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* Forza 4 colonne su desktop */
  gap: 20px;
  margin-bottom: 32px;
}

/* Responsive: 2 colonne su tablet */
@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive: 1 colonna su mobile */
@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}


.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  position: relative;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #5e72e4, #825ee4);
}

.stat-card.gradient-primary::before {
  background: linear-gradient(90deg, #5e72e4, #825ee4);
}

.stat-card.gradient-info::before {
  background: linear-gradient(90deg, #11cdef, #1171ef);
}

.stat-card.gradient-success::before {
  background: linear-gradient(90deg, #2dce89, #2dcecc);
}

.stat-card.gradient-warning::before {
  background: linear-gradient(90deg, #fb6340, #fbb140);
}

.stat-content {
  margin-bottom: 16px;
}

.stat-label {
  margin: 0 0 8px 0;
  color: #8392ab;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  margin: 0;
  color: #344767;
  font-size: 32px;
  font-weight: 700;
}

.stat-icon {
  position: absolute;
  top: 20px;
  right: 20px;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.icon-wrapper.primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
}

.icon-wrapper.info {
  background: linear-gradient(135deg, #11cdef, #1171ef);
}

.icon-wrapper.success {
  background: linear-gradient(135deg, #2dce89, #2dcecc);
}

.icon-wrapper.warning {
  background: linear-gradient(135deg, #fb6340, #fbb140);
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f2f5;
}

.trend {
  font-size: 13px;
  font-weight: 600;
}

.trend.positive {
  color: #2dce89;
}

.trend.neutral {
  color: #8392ab;
}

.footer-text {
  color: #8392ab;
  font-size: 13px;
}

/* Section Title */
.section-title {
  margin: 32px 0 16px 0;
}

.section-title h2 {
  margin: 0;
  color: #344767;
  font-size: 20px;
  font-weight: 600;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.action-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.2s;
  border-left: 4px solid #cbd5e1;
}

.action-card.high {
  border-left-color: #fb6340;
}

.action-card.critical {
  border-left-color: #f5365c;
}

.action-card.medium {
  border-left-color: #11cdef;
}

.action-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.action-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  color: white;
}

.action-badge.warning {
  background: linear-gradient(135deg, #fb6340, #fbb140);
}

.action-badge.danger {
  background: linear-gradient(135deg, #f5365c, #f56036);
}

.action-badge.info {
  background: linear-gradient(135deg, #11cdef, #1171ef);
}

.action-header h4 {
  margin: 0;
  color: #344767;
  font-size: 15px;
  font-weight: 600;
}

.action-desc {
  margin: 0;
  color: #8392ab;
  font-size: 13px;
  padding-left: 52px;
}

/* Widgets Row */
.widgets-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.widget-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.widget-header h3 {
  margin: 0;
  color: #344767;
  font-size: 18px;
  font-weight: 600;
}

.select-minimal {
  padding: 6px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 13px;
  color: #8392ab;
  background: white;
  cursor: pointer;
}

.select-minimal:focus {
  outline: none;
  border-color: #5e72e4;
}

/* Finance Grid */
.finance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.finance-item {
  text-align: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.finance-item.entrate {
  background: linear-gradient(135deg, rgba(45, 206, 137, 0.1), rgba(45, 206, 204, 0.1));
}

.finance-item.uscite {
  background: linear-gradient(135deg, rgba(245, 54, 92, 0.1), rgba(245, 96, 54, 0.1));
}

.finance-item.saldo {
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.1), rgba(130, 94, 228, 0.1));
}

.finance-label {
  font-size: 12px;
  color: #8392ab;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}

.finance-value {
  font-size: 24px;
  font-weight: 700;
  color: #344767;
  margin-bottom: 4px;
}

.finance-value.primary {
  background: linear-gradient(90deg, #5e72e4, #825ee4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.finance-trend {
  font-size: 13px;
  font-weight: 600;
  color: #8392ab;
}

.finance-trend.positive {
  color: #2dce89;
}

.divider {
  height: 1px;
  background: #f0f2f5;
  margin: 20px 0;
}

.finance-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.detail-row span {
  color: #8392ab;
}

.detail-row strong {
  color: #344767;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
}

.activity-item.highlight {
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.05), rgba(130, 94, 228, 0.05));
  padding: 14px;
  border-radius: 10px;
  border-bottom: none;
  margin-top: 8px;
}

.activity-label {
  color: #8392ab;
  font-size: 14px;
}

.activity-value {
  color: #344767;
  font-weight: 600;
  font-size: 14px;
}

.activity-value.primary {
  background: linear-gradient(90deg, #5e72e4, #825ee4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .widgets-row {
    grid-template-columns: 1fr;
  }

  .finance-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

/* Widget 4: Performance Tutor */
.tutors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px;
}

.tutor-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.05), rgba(130, 94, 228, 0.05));
  border-radius: 10px;
  border-left: 3px solid #5e72e4;
}

.tutor-info {
  flex: 1;
}

.tutor-name {
  font-weight: 600;
  color: #344767;
  margin-bottom: 8px;
  font-size: 15px;
}

.tutor-stats-row {
  display: flex;
  gap: 16px;
}

.tutor-stat {
  font-size: 13px;
  color: #8392ab;
}

.tutor-earnings {
  text-align: right;
}

.earning-value {
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(90deg, #5e72e4, #825ee4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.earning-label {
  font-size: 12px;
  color: #8392ab;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #8392ab;
  font-size: 14px;
}


/* Widget 5: Ripartizione Pacchetti */

.widget-full + .widget-full {
  margin-top: 24px; /* Spazio tra widget full-width consecutivi */
}


.total-badge {
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.1), rgba(130, 94, 228, 0.1));
  border-radius: 20px;
  color: #5e72e4;
  font-size: 13px;
  font-weight: 600;
}

.pacchetti-content {
  display: grid;
  gap: 24px;
}

.chart-container {
  position: relative;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container-bar {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.chart-center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.chart-total {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(90deg, #5e72e4, #825ee4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.chart-label {
  font-size: 13px;
  color: #8392ab;
  margin-top: 4px;
}

.tipologie-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tipologia-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  background: #f8f9fa;
  border-radius: 10px;
}

.tipo-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.tipo-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tipo-details {
  flex: 1;
}

.tipo-nome {
  font-weight: 600;
  color: #344767;
  font-size: 14px;
  margin-bottom: 2px;
}

.tipo-stats {
  font-size: 13px;
  color: #8392ab;
}

.tipo-guadagno {
  text-align: right;
}

.guadagno-value {
  font-size: 16px;
  font-weight: 700;
  color: #2dce89;
}

.guadagno-label {
  font-size: 11px;
  color: #8392ab;
}

.redditizio-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(45, 206, 137, 0.08), rgba(45, 206, 204, 0.08));
  border-radius: 10px;
  border-left: 3px solid #2dce89;
}

.redditizio-icon {
  font-size: 24px;
}

.redditizio-content {
  flex: 1;
}

.redditizio-label {
  font-size: 12px;
  color: #8392ab;
  margin-bottom: 4px;
}

.redditizio-value {
  font-size: 15px;
  font-weight: 600;
  color: #344767;
}

.btn-link {
  width: 100%;
  padding: 12px;
  background: transparent;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #5e72e4;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-link:hover {
  background: #f8f9fa;
  border-color: #5e72e4;
}

/* Nuove classi Action Cards */
.clickable {
  cursor: pointer;
  user-select: none;
}

.expand-icon {
  margin-left: auto;
  font-size: 14px;
  color: #8392ab;
}

.action-list {
  margin-top: 16px;
  border-top: 1px solid #f0f2f5;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-list-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.action-list-item:hover {
  background: #e9ecef;
}

.item-name {
  font-weight: 600;
  font-size: 14px;
  color: #344767;
}

.item-details {
  font-size: 12px;
  color: #8392ab;
  margin-top: 2px;
}

.btn-visualizza-tutti {
  margin-top: 8px;
  background: none;
  border: none;
  color: #5e72e4;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  text-align: center;
  padding: 8px;
  border-radius: 6px;
}

.btn-visualizza-tutti:hover {
  background: rgba(94, 114, 228, 0.1);
}

</style>
