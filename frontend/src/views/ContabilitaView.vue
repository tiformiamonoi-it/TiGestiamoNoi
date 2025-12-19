<template>
  <div class="contabilita-page">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>💰 Contabilità</h1>
        <p class="subtitle">Monitoraggio entrate, uscite e bilancio</p>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="showNuovoModal = true">
          + Nuovo Movimento
        </button>
      </div>
    </div>

    <!-- Filtro Periodo -->
    <div class="period-filter">
      <div class="filter-row">
        <div class="filter-group">
          <label>Periodo</label>
          <select v-model="periodoPreset" @change="applicaPreset" class="form-select">
            <option value="mese_corrente">Mese corrente</option>
            <option value="ultimo_mese">Ultimo mese</option>
            <option value="ultimi_3_mesi">Ultimi 3 mesi</option>
            <option value="anno_corrente">Anno corrente</option>
            <option value="tutto">Tutto lo storico</option>
            <option value="custom">Personalizzato...</option>
          </select>
        </div>
        <div v-if="periodoPreset === 'custom'" class="filter-group">
          <label>Da</label>
          <input type="date" v-model="dataInizio" @change="loadData" class="form-input" />
        </div>
        <div v-if="periodoPreset === 'custom'" class="filter-group">
          <label>A</label>
          <input type="date" v-model="dataFine" @change="loadData" class="form-input" />
        </div>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stats-grid" v-if="stats">
      <!-- Riga 1 -->
      <div class="stat-card entrate">
        <div class="stat-icon">💶</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.entrateTotali) }}</div>
          <div class="stat-label">ENTRATE</div>
        </div>
      </div>
      
      <div class="stat-card uscite">
        <div class="stat-icon">💸</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.usciteTotali) }}</div>
          <div class="stat-label">USCITE</div>
        </div>
      </div>
      
      <div class="stat-card bilancio" :class="{ positive: stats.bilancio >= 0, negative: stats.bilancio < 0 }">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.bilancio) }}</div>
          <div class="stat-label">BILANCIO</div>
        </div>
      </div>
      
      <div class="stat-card margine">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.margineNetto }}%</div>
          <div class="stat-label">MARGINE %</div>
        </div>
      </div>

      <!-- Riga 2 -->
      <div class="stat-card">
        <div class="stat-icon">💵</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.margineLordo) }}</div>
          <div class="stat-label">MARGINE LORDO</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📈</div>
        <div class="stat-content">
          <div class="stat-value">{{ formatCurrency(stats.cashflowMedio) }}/g</div>
          <div class="stat-label">CASHFLOW MEDIO</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.giorniPeriodo }}</div>
          <div class="stat-label">GIORNI</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.countMovimenti }}</div>
          <div class="stat-label">MOVIMENTI</div>
        </div>
      </div>
    </div>

    <!-- Grafici -->
    <div class="charts-row" v-if="stats">
      <div class="chart-card">
        <h3>📊 Entrate per Categoria</h3>
        <div class="category-list">
          <div v-for="cat in stats.entratePerCategoria" :key="cat.categoria" class="category-item">
            <span class="cat-name">{{ cat.categoria }}</span>
            <span class="cat-value entrata">{{ formatCurrency(cat.totale) }}</span>
          </div>
          <div v-if="stats.entratePerCategoria.length === 0" class="empty-cat">
            Nessuna entrata nel periodo
          </div>
        </div>
      </div>
      
      <div class="chart-card">
        <h3>📊 Uscite per Categoria</h3>
        <div class="category-list">
          <div v-for="cat in stats.uscitePerCategoria" :key="cat.categoria" class="category-item">
            <span class="cat-name">{{ cat.categoria }}</span>
            <span class="cat-value uscita">{{ formatCurrency(cat.totale) }}</span>
          </div>
          <div v-if="stats.uscitePerCategoria.length === 0" class="empty-cat">
            Nessuna uscita nel periodo
          </div>
        </div>
      </div>
    </div>

    <!-- Filtri Tabella -->
    <div class="table-filters">
      <div class="filter-group">
        <select v-model="filtroTipo" @change="loadMovimenti" class="form-select">
          <option value="tutti">Tutti i tipi</option>
          <option value="ENTRATA">Entrate</option>
          <option value="USCITA">Uscite</option>
        </select>
      </div>
      <div class="filter-group">
        <select v-model="filtroCategoria" @change="loadMovimenti" class="form-select">
          <option value="tutte">Tutte le categorie</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>
      <div class="filter-group search">
        <input 
          type="text" 
          v-model="searchQuery" 
          @input="debounceSearch"
          placeholder="Cerca..." 
          class="form-input"
        />
      </div>
    </div>

    <!-- Tabella Movimenti -->
    <div class="table-container">
      <table class="data-table" v-if="movimenti.length > 0">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Importo</th>
            <th>Categoria</th>
            <th>Descrizione</th>
            <th>Origine</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="mov in movimenti" :key="mov.id">
            <td>{{ formatDate(mov.data) }}</td>
            <td>
              <span :class="['badge', mov.tipo === 'ENTRATA' ? 'badge-success' : 'badge-danger']">
                {{ mov.tipo === 'ENTRATA' ? '↑ Entrata' : '↓ Uscita' }}
              </span>
            </td>
            <td :class="mov.tipo === 'ENTRATA' ? 'text-success' : 'text-danger'">
              {{ mov.tipo === 'ENTRATA' ? '+' : '-' }}{{ formatCurrency(mov.importo) }}
            </td>
            <td>{{ mov.categoria || '-' }}</td>
            <td class="desc-cell">{{ mov.descrizione }}</td>
            <td>
              <span :class="['badge', isAutomatic(mov) ? 'badge-auto' : 'badge-manual']">
                {{ isAutomatic(mov) ? '🔄 Auto' : '✏️ Manuale' }}
              </span>
            </td>
            <td>
              <div class="actions">
                <button class="btn-icon" @click="editMovimento(mov)" title="Modifica">✏️</button>
                <button class="btn-icon danger" @click="deleteMovimento(mov)" title="Elimina">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-else class="empty-state">
        <span class="empty-icon">💰</span>
        <p>Nessun movimento nel periodo selezionato</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="pagination.pages > 1">
        <button 
          :disabled="pagination.page <= 1" 
          @click="goToPage(pagination.page - 1)"
          class="btn-page"
        >
          ← Precedente
        </button>
        <span class="page-info">
          Pagina {{ pagination.page }} di {{ pagination.pages }}
        </span>
        <button 
          :disabled="pagination.page >= pagination.pages" 
          @click="goToPage(pagination.page + 1)"
          class="btn-page"
        >
          Successiva →
        </button>
      </div>
    </div>

    <!-- Modal Nuovo/Modifica Movimento -->
    <Teleport to="body" v-if="showNuovoModal">
      <div class="modal-overlay" @click.self="showNuovoModal = false">
        <div class="modal-container">
          <div class="modal-header">
            <h3>{{ editingMovimento ? '✏️ Modifica Movimento' : '➕ Nuovo Movimento' }}</h3>
            <button class="btn-close" @click="closeModal">✕</button>
          </div>
          <form @submit.prevent="saveMovimento" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label>Tipo <span class="required">*</span></label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input type="radio" v-model="form.tipo" value="ENTRATA" />
                    <span>💶 Entrata</span>
                  </label>
                  <label class="radio-label">
                    <input type="radio" v-model="form.tipo" value="USCITA" />
                    <span>💸 Uscita</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label>Importo <span class="required">*</span></label>
                <input type="number" v-model="form.importo" step="0.01" min="0.01" class="form-input" required />
              </div>
              <div class="form-group">
                <label>Data <span class="required">*</span></label>
                <input type="date" v-model="form.data" class="form-input" required />
              </div>
            </div>
            
            <div class="form-group">
              <label>Categoria <span class="required">*</span></label>
              <select v-model="form.categoria" class="form-select" required>
                <option value="">Seleziona...</option>
                <option value="Pacchetto">Pacchetto</option>
                <option value="Compenso Tutor">Compenso Tutor</option>
                <option value="Affitto">Affitto</option>
                <option value="Utenze">Utenze</option>
                <option value="Cancelleria">Cancelleria</option>
                <option value="Marketing">Marketing</option>
                <option value="Manutenzione">Manutenzione</option>
                <option value="Software">Software</option>
                <option value="Altro">Altro</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Descrizione <span class="required">*</span></label>
              <input type="text" v-model="form.descrizione" class="form-input" required />
            </div>
            
            <div class="form-group">
              <label>Note (opzionale)</label>
              <textarea v-model="form.note" class="form-textarea" rows="2"></textarea>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn-secondary" @click="closeModal">Annulla</button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Salvataggio...' : '💾 Salva' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { accountingAPI } from '@/services/api';

// State
const stats = ref(null);
const movimenti = ref([]);
const categories = ref([]);
const pagination = ref({ page: 1, pages: 1, total: 0 });
const loading = ref(false);
const saving = ref(false);

// Filtri
const periodoPreset = ref('mese_corrente');
const dataInizio = ref('');
const dataFine = ref('');
const filtroTipo = ref('tutti');
const filtroCategoria = ref('tutte');
const searchQuery = ref('');
let searchTimeout = null;

// Modal
const showNuovoModal = ref(false);
const editingMovimento = ref(null);
const form = ref({
  tipo: 'USCITA',
  importo: '',
  data: new Date().toISOString().split('T')[0],
  categoria: '',
  descrizione: '',
  note: ''
});

// Helpers
function formatCurrency(value) {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value || 0);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('it-IT');
}

function isAutomatic(mov) {
  return mov.paymentId || mov.tutorPaymentId;
}

// Periodo
function applicaPreset() {
  const today = new Date();
  
  switch (periodoPreset.value) {
    case 'mese_corrente':
      dataInizio.value = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      dataFine.value = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
      break;
    case 'ultimo_mese':
      dataInizio.value = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
      dataFine.value = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
      break;
    case 'ultimi_3_mesi':
      dataInizio.value = new Date(today.getFullYear(), today.getMonth() - 2, 1).toISOString().split('T')[0];
      dataFine.value = today.toISOString().split('T')[0];
      break;
    case 'anno_corrente':
      dataInizio.value = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
      dataFine.value = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
      break;
    case 'tutto':
      dataInizio.value = '';
      dataFine.value = '';
      break;
    case 'custom':
      // L'utente imposta le date manualmente
      return;
  }
  
  loadData();
}

function debounceSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadMovimenti();
  }, 300);
}

// API Calls
async function loadData() {
  await Promise.all([loadStats(), loadMovimenti(), loadCategories()]);
}

async function loadStats() {
  try {
    const params = {};
    if (dataInizio.value) params.dataInizio = dataInizio.value;
    if (dataFine.value) params.dataFine = dataFine.value;
    
    const response = await accountingAPI.getStats(params);
    stats.value = response.data;
  } catch (error) {
    console.error('Errore caricamento stats:', error);
  }
}

async function loadMovimenti(page = 1) {
  loading.value = true;
  try {
    const params = { page, limit: 20 };
    if (dataInizio.value) params.dataInizio = dataInizio.value;
    if (dataFine.value) params.dataFine = dataFine.value;
    if (filtroTipo.value !== 'tutti') params.tipo = filtroTipo.value;
    if (filtroCategoria.value !== 'tutte') params.categoria = filtroCategoria.value;
    if (searchQuery.value) params.search = searchQuery.value;
    
    const response = await accountingAPI.getAll(params);
    movimenti.value = response.data.movimenti;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('Errore caricamento movimenti:', error);
  } finally {
    loading.value = false;
  }
}

async function loadCategories() {
  try {
    const response = await accountingAPI.getCategories();
    categories.value = response.data.categories;
  } catch (error) {
    console.error('Errore caricamento categorie:', error);
  }
}

function goToPage(page) {
  loadMovimenti(page);
}

// CRUD
function editMovimento(mov) {
  editingMovimento.value = mov;
  form.value = {
    tipo: mov.tipo,
    importo: parseFloat(mov.importo),
    data: new Date(mov.data).toISOString().split('T')[0],
    categoria: mov.categoria || '',
    descrizione: mov.descrizione,
    note: mov.note || ''
  };
  showNuovoModal.value = true;
}

async function saveMovimento() {
  if (!form.value.tipo || !form.value.importo || !form.value.descrizione || !form.value.categoria) {
    alert('Compila tutti i campi obbligatori');
    return;
  }
  
  saving.value = true;
  try {
    if (editingMovimento.value) {
      await accountingAPI.update(editingMovimento.value.id, form.value);
    } else {
      await accountingAPI.create(form.value);
    }
    
    closeModal();
    await loadData();
  } catch (error) {
    console.error('Errore salvataggio:', error);
    alert('Errore durante il salvataggio');
  } finally {
    saving.value = false;
  }
}

async function deleteMovimento(mov) {
  const isAuto = isAutomatic(mov);
  const msg = isAuto 
    ? 'Questo è un movimento automatico. Sei sicuro di volerlo eliminare?' 
    : 'Sei sicuro di voler eliminare questo movimento?';
    
  if (!confirm(msg)) return;
  
  try {
    await accountingAPI.delete(mov.id);
    await loadData();
  } catch (error) {
    console.error('Errore eliminazione:', error);
    alert(error.response?.data?.error || 'Errore durante l\'eliminazione');
  }
}

function closeModal() {
  showNuovoModal.value = false;
  editingMovimento.value = null;
  form.value = {
    tipo: 'USCITA',
    importo: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    descrizione: '',
    note: ''
  };
}

// Init
onMounted(() => {
  applicaPreset();
});
</script>

<style scoped>
.contabilita-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

/* Period Filter */
.period-filter {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.form-select, .form-input {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 150px;
}

.form-select:focus, .form-input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.stat-label {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-card.entrate {
  border-left: 4px solid #10b981;
}

.stat-card.uscite {
  border-left: 4px solid #ef4444;
}

.stat-card.bilancio.positive {
  border-left: 4px solid #10b981;
}

.stat-card.bilancio.negative {
  border-left: 4px solid #ef4444;
}

.stat-card.margine {
  border-left: 4px solid #8b5cf6;
}

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-card h3 {
  margin: 0 0 16px;
  font-size: 16px;
  color: #1e293b;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
}

.cat-name {
  font-weight: 500;
  color: #475569;
}

.cat-value {
  font-weight: 700;
}

.cat-value.entrata {
  color: #10b981;
}

.cat-value.uscita {
  color: #ef4444;
}

.empty-cat {
  text-align: center;
  color: #94a3b8;
  padding: 20px;
}

/* Table Filters */
.table-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.table-filters .search {
  flex: 1;
  min-width: 200px;
}

.table-filters .form-input {
  width: 100%;
}

/* Table */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8fafc;
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  border-bottom: 1px solid #e2e8f0;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 14px;
  color: #334155;
}

.data-table tr:hover {
  background: #f8fafc;
}

.desc-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.badge-auto {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.badge-manual {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.text-success {
  color: #10b981;
  font-weight: 600;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

/* Actions */
.actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px 8px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f1f5f9;
}

.btn-icon.danger:hover {
  background: #fee2e2;
  border-color: #fecaca;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-page {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: #64748b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
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
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  padding: 6px 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #64748b;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.2s;
}

.radio-label:has(input:checked) {
  border-color: #5e72e4;
  background: rgba(94, 114, 228, 0.05);
}

.radio-label input {
  display: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .contabilita-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-row {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .data-table th, .data-table td {
    padding: 10px 8px;
  }
}
</style>
