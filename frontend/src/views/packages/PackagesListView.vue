<template>
  <div class="packages-page">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div 
        class="stat-card" 
        :class="{ active: activeFilter === 'ATTIVO' }"
        @click="setFilter('ATTIVO')"
      >
        <div class="stat-icon active">📦</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.attivi }}</div>
          <div class="stat-label">Attivi</div>
        </div>
      </div>
      <div 
        class="stat-card" 
        :class="{ active: activeFilter === 'DA_RINNOVARE' }"
        @click="setFilter('DA_RINNOVARE')"
      >
        <div class="stat-icon warning">⏰</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.daRinnovare }}</div>
          <div class="stat-label">Da Rinnovare/Chiusi</div>
        </div>
      </div>
      <div 
        class="stat-card" 
        :class="{ active: activeFilter === 'DA_PAGARE' }"
        @click="setFilter('DA_PAGARE')"
      >
        <div class="stat-icon danger">💳</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.daPagare }}</div>
          <div class="stat-label">Da Pagare</div>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cerca alunno..."
            @input="handleSearch"
          />
        </div>

        <select v-model="filterTipo" class="filter-select" @change="loadPackages(true)">
          <option value="">Tutti i Tipi</option>
          <option value="MENSILE">📅 Mensile</option>
          <option value="ORE">⏱️ Orario</option>
        </select>

        <select v-model="filterStato" class="filter-select" @change="loadPackages(true)">
          <option value="">Tutti gli Stati</option>
          <option value="ATTIVO">🟢 Attivo</option>
          <option value="DA_RINNOVARE">🟠 Da Rinnovare</option>
          <option value="SCADUTO">🔴 Scaduto</option>
          <option value="ESAURITO">🔴 Esaurito</option>
          <option value="NEGATIVO">🔴 Negativo</option>
          <option value="DA_PAGARE">🟡 Da Pagare</option>
          <option value="PAGATO">🔵 Pagato</option>
          <option value="CHIUSO">⚫ Chiuso</option>
        </select>

        <button 
          v-if="activeFilter || filterTipo || filterStato" 
          class="btn-clear-filter" 
          @click="clearFilters"
        >
          ✕ Rimuovi filtri
        </button>
      </div>

      <div class="toolbar-right">
        <div v-if="selectedPackages.length > 0" class="selection-info">
          <span class="selection-count">{{ selectedPackages.length }} selezionati</span>
          <button 
            class="btn-bulk btn-primary" 
            @click="openBulkRenewal"
            :disabled="!canBulkRenew"
          >
            🔄 Rinnova Bulk
          </button>
        </div>
      </div>
    </div>

    <!-- Warning per orari selezionati -->
    <div v-if="hasOrariSelected" class="warning-banner">
      ⚠️ I pacchetti ORARI non possono essere rinnovati in bulk. Deselezionali per procedere.
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="packages-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input 
                type="checkbox" 
                :checked="allMensiliSelected"
                @change="toggleSelectAll"
                :disabled="mensiliPackages.length === 0"
              />
            </th>
            <th>Alunno</th>
            <th>Tipo</th>
            <th>Pacchetto</th>
            <th>Periodo</th>
            <th>Ore/Giorni</th>
            <th>Importo</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading && packages.length === 0">
            <td colspan="9" class="loading-cell">
              <div class="loader"></div>
              Caricamento pacchetti...
            </td>
          </tr>

          <tr v-else-if="packages.length === 0">
            <td colspan="9" class="empty-cell">
              <div class="empty-icon">📦</div>
              <p>Nessun pacchetto trovato</p>
            </td>
          </tr>

          <tr 
            v-else
            v-for="pkg in packages" 
            :key="pkg.id"
            :class="{ selected: isSelected(pkg.id), 'orario-row': pkg.tipo === 'ORE' }"
          >
            <td class="checkbox-col">
              <input 
                type="checkbox"
                :checked="isSelected(pkg.id)"
                @change="toggleSelect(pkg)"
                :disabled="pkg.tipo === 'ORE'"
                :title="pkg.tipo === 'ORE' ? 'Pacchetti orari da rinnovare singolarmente' : ''"
              />
            </td>
            <td class="student-cell">
              <router-link :to="`/students/${pkg.studentId}`" class="student-link">
                {{ pkg.student?.lastName }} {{ pkg.student?.firstName }}
              </router-link>
            </td>
            <td>
              <span :class="['type-badge', pkg.tipo.toLowerCase()]">
                {{ pkg.tipo === 'MENSILE' ? '📅' : '⏱️' }} {{ pkg.tipo }}
              </span>
            </td>
            <td class="package-name">{{ pkg.nome }}</td>
            <td class="period-cell">
              <div>{{ formatDate(pkg.dataInizio) }}</div>
              <div class="period-to">→ {{ formatDate(pkg.dataScadenza) }}</div>
            </td>
            <td class="hours-cell">
              <div class="progress-mini">
                <div 
                  class="progress-fill-mini" 
                  :style="{ width: `${getProgress(pkg)}%` }"
                  :class="getProgressClass(pkg)"
                ></div>
              </div>
              <span class="hours-text">
                {{ getHoursDisplay(pkg) }}
              </span>
            </td>
            <td class="amount-cell">
              <div class="amount-total">€{{ formatCurrency(pkg.prezzoTotale) }}</div>
              <div v-if="pkg.importoResiduo > 0" class="amount-residue">
                Residuo: €{{ formatCurrency(pkg.importoResiduo) }}
              </div>
            </td>
            <td class="status-cell">
              <div class="stati-list">
                <span 
                  v-for="stato in getDisplayStates(pkg.stati)" 
                  :key="stato"
                  :class="['status-badge', stato.toLowerCase()]"
                >
                  {{ getStatoLabel(stato) }}
                </span>
              </div>
            </td>
            <td class="actions-cell">
              <div class="actions-menu">
                <button class="btn-action" @click="viewPackage(pkg)">
                  👁️
                </button>
                <button 
                  class="btn-action" 
                  @click="renewSingle(pkg)"
                  title="Rinnova pacchetto"
                >
                  🔄
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Load More -->
      <div v-if="hasMore && !loading" class="load-more">
        <button class="btn-load-more" @click="loadPackages(false)">
          Carica altri pacchetti
        </button>
      </div>
    </div>

    <!-- Bulk Renewal Modal -->
    <BulkRenewalModal
      v-if="showBulkModal"
      :packages="selectedPackagesData"
      @close="showBulkModal = false"
      @renewed="handleBulkRenewed"
    />

    <!-- Single Renewal Modal -->
    <RenewPackageModal
      v-if="showRenewModal && renewStudent"
      :student="renewStudent"
      :package-data="renewPackage"
      @close="closeRenewModal"
      @renewed="handleRenewed"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { packagesAPI } from '@/services/api';
import RenewPackageModal from '@/components/students/RenewPackageModal.vue';
import BulkRenewalModal from '@/components/packages/BulkRenewalModal.vue';

const router = useRouter();

// State
const packages = ref([]);
const loading = ref(false);
const page = ref(1);
const hasMore = ref(true);
const searchQuery = ref('');
const filterTipo = ref('');
const filterStato = ref('');
const activeFilter = ref('');
const selectedPackages = ref([]);
const showBulkModal = ref(false);
const showRenewModal = ref(false);
const renewStudent = ref(null);
const renewPackage = ref(null);

// Stats
const stats = ref({
  attivi: 0,
  daRinnovare: 0,
  daPagare: 0,
  chiusi: 0
});

// Computed
const mensiliPackages = computed(() => 
  packages.value.filter(p => p.tipo === 'MENSILE')
);

const allMensiliSelected = computed(() => 
  mensiliPackages.value.length > 0 && 
  mensiliPackages.value.every(p => selectedPackages.value.includes(p.id))
);

const hasOrariSelected = computed(() =>
  packages.value.some(p => p.tipo === 'ORE' && selectedPackages.value.includes(p.id))
);

const canBulkRenew = computed(() =>
  selectedPackages.value.length > 0 && !hasOrariSelected.value
);

const selectedPackagesData = computed(() =>
  packages.value.filter(p => selectedPackages.value.includes(p.id))
);

// Search with debounce
let searchTimeout = null;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadPackages(true);
  }, 300);
}

// Load packages
async function loadPackages(reset = false) {
  if (loading.value) return;
  
  loading.value = true;
  
  try {
    if (reset) {
      page.value = 1;
      packages.value = [];
      hasMore.value = true;
      selectedPackages.value = [];
    }

    // ✅ FIX: Per il filtro "DA_RINNOVARE" speciale, carichiamo tutti e filtriamo localmente
    // perché deve includere DA_RINNOVARE + (SCADUTO & DA_PAGARE)
    let statiParam = filterStato.value || activeFilter.value || undefined;
    if (activeFilter.value === 'DA_RINNOVARE') {
      // Carichiamo tutti i pacchetti non chiusi e filtriamo localmente
      statiParam = undefined;
    }

    const params = {
      page: page.value,
      limit: 30,
      tipo: filterTipo.value || undefined,
      stati: statiParam
    };

    const response = await packagesAPI.getAll(params);
    let newPackages = response.data.packages || [];

    // ✅ FIX: Filtro locale per "Da Rinnovare/Scaduti/Chiusi"
    if (activeFilter.value === 'DA_RINNOVARE') {
      newPackages = newPackages.filter(p => 
        p.stati?.includes('DA_RINNOVARE') || 
        p.stati?.includes('SCADUTO') ||
        p.stati?.includes('CHIUSO')
      );
    }

    // Filter by search locally
    let filteredPackages = newPackages;
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filteredPackages = newPackages.filter(p => 
        p.student?.firstName?.toLowerCase().includes(query) ||
        p.student?.lastName?.toLowerCase().includes(query) ||
        p.nome?.toLowerCase().includes(query)
      );
    }

    if (reset) {
      packages.value = filteredPackages;
    } else {
      packages.value.push(...filteredPackages);
    }

    hasMore.value = newPackages.length === 30;
    page.value++;

    // Calculate stats - ricarica tutti per statistiche accurate
    if (reset && !activeFilter.value) {
      calculateStats(packages.value);
    }

  } catch (error) {
    console.error('Errore caricamento pacchetti:', error);
  } finally {
    loading.value = false;
  }
}

function calculateStats(pkgs) {
  // ✅ FIX: "Da Rinnovare" ora include DA_RINNOVARE + SCADUTO + CHIUSO
  stats.value = {
    attivi: pkgs.filter(p => p.stati?.includes('ATTIVO') && !p.stati?.includes('DA_RINNOVARE')).length,
    daRinnovare: pkgs.filter(p => 
      p.stati?.includes('DA_RINNOVARE') || 
      p.stati?.includes('SCADUTO') ||
      p.stati?.includes('CHIUSO')
    ).length,
    daPagare: pkgs.filter(p => p.stati?.includes('DA_PAGARE')).length,
  };
}

function setFilter(stato) {
  if (activeFilter.value === stato) {
    activeFilter.value = '';
  } else {
    activeFilter.value = stato;
  }
  loadPackages(true);
}

function clearFilters() {
  activeFilter.value = '';
  filterTipo.value = '';
  filterStato.value = '';
  searchQuery.value = '';
  loadPackages(true);
}

// Selection
function isSelected(id) {
  return selectedPackages.value.includes(id);
}

function toggleSelect(pkg) {
  if (pkg.tipo === 'ORE') return; // Cannot select ORARIO
  
  const idx = selectedPackages.value.indexOf(pkg.id);
  if (idx >= 0) {
    selectedPackages.value.splice(idx, 1);
  } else {
    selectedPackages.value.push(pkg.id);
  }
}

function toggleSelectAll() {
  if (allMensiliSelected.value) {
    // Deselect all
    selectedPackages.value = [];
  } else {
    // Select all MENSILI
    selectedPackages.value = mensiliPackages.value.map(p => p.id);
  }
}

// Actions
function openBulkRenewal() {
  if (!canBulkRenew.value) return;
  showBulkModal.value = true;
}

function viewPackage(pkg) {
  router.push(`/students/${pkg.studentId}`);
}

function renewSingle(pkg) {
  renewStudent.value = {
    id: pkg.studentId,
    firstName: pkg.student?.firstName || '',
    lastName: pkg.student?.lastName || ''
  };
  renewPackage.value = pkg;
  showRenewModal.value = true;
}

function closeRenewModal() {
  showRenewModal.value = false;
  renewStudent.value = null;
  renewPackage.value = null;
}

function handleRenewed() {
  closeRenewModal();
  loadPackages(true);
}

function handleBulkRenewed() {
  showBulkModal.value = false;
  selectedPackages.value = [];
  loadPackages(true);
}

// Formatters
function formatDate(date) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatCurrency(value) {
  return parseFloat(value || 0).toFixed(2);
}

function getProgress(pkg) {
  // ✅ FIX: Usa giorniTotali (calcolato dinamicamente) se disponibile
  const total = pkg.tipo === 'MENSILE' 
    ? (pkg.giorniTotali || pkg.giorniAcquistati || 1) 
    : (pkg.oreAcquistate || 1);
  const residuo = pkg.tipo === 'MENSILE' 
    ? (pkg.giorniResiduo || 0) 
    : (pkg.oreResiduo || 0);
  
  // Progress = percentuale rimanente (pieno = tutto disponibile)
  return Math.min(100, Math.max(0, (residuo / total) * 100));
}

function getProgressClass(pkg) {
  const residuo = pkg.tipo === 'MENSILE' 
    ? (pkg.giorniResiduo || 0) 
    : (pkg.oreResiduo || 0);
  // ✅ FIX: Usa giorniTotali (calcolato dinamicamente) se disponibile
  const total = pkg.tipo === 'MENSILE' 
    ? (pkg.giorniTotali || pkg.giorniAcquistati || 1) 
    : (pkg.oreAcquistate || 1);
  
  const perc = (residuo / total) * 100;
  
  if (residuo < 0) return 'danger';
  if (perc < 20) return 'warning';
  if (perc < 50) return 'moderate';
  return 'success';
}

function getHoursDisplay(pkg) {
  if (pkg.tipo === 'MENSILE') {
    // ✅ FIX: Usa giorniTotali (calcolato dinamicamente) se disponibile
    const totale = pkg.giorniTotali || pkg.giorniAcquistati || 0;
    return `${pkg.giorniResiduo || 0} / ${totale} gg`;
  }
  return `${parseFloat(pkg.oreResiduo || 0).toFixed(1)} / ${parseFloat(pkg.oreAcquistate || 0).toFixed(1)} h`;
}

// Filtra stati per visualizzazione: se CHIUSO, mostra solo quello
function getDisplayStates(stati) {
  if (!Array.isArray(stati) || stati.length === 0) return [];
  if (stati.includes('CHIUSO')) return ['CHIUSO'];
  return stati;
}

// Labels minimali senza emoji
function getStatoLabel(stato) {
  const labels = {
    'ATTIVO': 'Attivo',
    'DA_RINNOVARE': 'Da Rinnovare',
    'SCADUTO': 'Scaduto',
    'ESAURITO': 'Esaurito',
    'NEGATIVO': 'Negativo',
    'DA_PAGARE': 'Da Pagare',
    'PAGATO': 'Pagato',
    'CHIUSO': 'Chiuso'
  };
  return labels[stato] || stato;
}

onMounted(() => {
  loadPackages(true);
});
</script>

<style scoped>
.packages-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card.active {
  border-color: #5e72e4;
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.05), rgba(130, 94, 228, 0.05));
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.stat-icon.active { background: rgba(45, 206, 137, 0.1); }
.stat-icon.warning { background: rgba(251, 99, 64, 0.1); }
.stat-icon.danger { background: rgba(245, 54, 92, 0.1); }
.stat-icon.muted { background: rgba(131, 146, 171, 0.1); }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #344767;
}

.stat-label {
  font-size: 13px;
  color: #8392ab;
  font-weight: 500;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  min-width: 280px;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 14px;
  flex: 1;
}

.search-box svg { color: #8392ab; }

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.btn-clear-filter {
  padding: 8px 14px;
  background: #fee2e2;
  color: #b91c1c;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selection-count {
  font-size: 14px;
  font-weight: 600;
  color: #5e72e4;
  padding: 8px 12px;
  background: rgba(94, 114, 228, 0.1);
  border-radius: 6px;
}

.btn-bulk {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Warning Banner */
.warning-banner {
  padding: 12px 16px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-weight: 500;
  margin-bottom: 16px;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.packages-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.packages-table th {
  padding: 14px 12px;
  background: #f8f9fa;
  text-align: left;
  font-weight: 600;
  color: #344767;
  border-bottom: 2px solid #e9ecef;
}

.packages-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f3f5;
  vertical-align: middle;
}

.packages-table tr:hover {
  background: #fafbfc;
}

.packages-table tr.selected {
  background: rgba(94, 114, 228, 0.05);
}

.packages-table tr.orario-row .checkbox-col input {
  opacity: 0.5;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.checkbox-col input {
  width: 18px;
  height: 18px;
  accent-color: #5e72e4;
  cursor: pointer;
}

.student-link {
  color: #344767;
  text-decoration: none;
  font-weight: 600;
}

.student-link:hover {
  color: #5e72e4;
}

.type-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.type-badge.mensile {
  background: rgba(94, 114, 228, 0.1);
  color: #5e72e4;
}

.type-badge.ore {
  background: rgba(251, 99, 64, 0.1);
  color: #fb6340;
}

.package-name {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.period-cell {
  font-size: 12px;
}

.period-to {
  color: #8392ab;
}

.hours-cell {
  text-align: center;
}

.progress-mini {
  width: 60px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
  margin: 0 auto 4px;
}

.progress-fill-mini {
  height: 100%;
  transition: width 0.3s;
}

.progress-fill-mini.success { background: #2dce89; }
.progress-fill-mini.moderate { background: #ffc107; }
.progress-fill-mini.warning { background: #fb6340; }
.progress-fill-mini.danger { background: #f5365c; }

.hours-text {
  font-size: 11px;
  color: #8392ab;
}

.amount-cell {
  text-align: right;
}

.amount-total {
  font-weight: 600;
  color: #344767;
}

.amount-residue {
  font-size: 11px;
  color: #f5365c;
}

.status-cell {
  max-width: 120px;
}

.stati-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

/* ATTIVO - Verde */
.status-badge.attivo { background: rgba(45, 206, 137, 0.1); color: #2dce89; }
/* DA_RINNOVARE - Arancione */
.status-badge.da_rinnovare { background: rgba(251, 99, 64, 0.1); color: #fb6340; }
/* SCADUTO - Rosso */
.status-badge.scaduto { background: rgba(245, 54, 92, 0.1); color: #f5365c; }
/* ESAURITO - Rosso */
.status-badge.esaurito { background: rgba(245, 54, 92, 0.1); color: #f5365c; }
/* NEGATIVO - Rosso */
.status-badge.negativo { background: rgba(245, 54, 92, 0.1); color: #f5365c; }
/* DA_PAGARE - Giallo */
.status-badge.da_pagare { background: rgba(251, 191, 36, 0.1); color: #d97706; }
/* PAGATO - Blu */
.status-badge.pagato { background: rgba(94, 114, 228, 0.1); color: #5e72e4; }
/* CHIUSO - Grigio scuro */
.status-badge.chiuso { background: rgba(52, 71, 103, 0.1); color: #344767; }

.actions-cell {
  width: 80px;
}

.actions-menu {
  display: flex;
  gap: 4px;
}

.btn-action {
  padding: 6px 10px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover {
  background: #e9ecef;
}

/* Loading & Empty */
.loading-cell, .empty-cell {
  text-align: center;
  padding: 60px !important;
  color: #8392ab;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5e72e4;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* Load More */
.load-more {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.btn-load-more {
  padding: 10px 24px;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-weight: 600;
  color: #5e72e4;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-load-more:hover {
  background: #f8f9fa;
  border-color: #5e72e4;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .toolbar-left, .toolbar-right {
    flex-wrap: wrap;
  }
  
  .packages-table {
    font-size: 12px;
  }
}
</style>
