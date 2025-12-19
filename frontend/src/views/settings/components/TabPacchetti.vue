<template>
  <div class="tab-pacchetti">
    <div class="tab-header">
      <div>
        <h2>📦 Pacchetti Standard</h2>
        <p>Gestisci i template di pacchetti offerti agli alunni</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        + Nuovo Pacchetto
      </button>
    </div>

    <!-- Filtri -->
    <div class="filters-bar">
      <select v-model="filterTipo" class="filter-select">
        <option value="">Tutti i Tipi</option>
        <option value="MENSILE">📅 Mensile</option>
        <option value="ORE">⏱️ Orario</option>
      </select>
      <select v-model="filterCategoria" class="filter-select">
        <option value="">Tutte le Categorie</option>
        <option v-for="cat in categorie" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <!-- Tabella -->
    <div class="table-container">
      <table v-if="!loading && filteredPackages.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Categoria</th>
            <th>Ore/Giorni</th>
            <th>Prezzo</th>
            <th>Stato</th>
            <th>In Uso</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pkg in filteredPackages" :key="pkg.id">
            <td class="name-cell">
              <strong>{{ pkg.nome }}</strong>
              <span v-if="pkg.descrizione" class="desc">{{ pkg.descrizione }}</span>
            </td>
            <td>
              <span :class="['type-badge', pkg.tipo.toLowerCase()]">
                {{ pkg.tipo === 'MENSILE' ? '📅' : '⏱️' }} {{ pkg.tipo }}
              </span>
            </td>
            <td>{{ pkg.categoria }}</td>
            <td>
              <template v-if="pkg.tipo === 'ORE'">
                {{ pkg.oreIncluse }}h
              </template>
              <template v-else>
                {{ pkg.giorniInclusi }} gg × {{ pkg.orarioGiornaliero }}h
              </template>
            </td>
            <td class="price-cell">€{{ formatCurrency(pkg.prezzoStandard) }}</td>
            <td>
              <span :class="['status-badge', pkg.active ? 'active' : 'inactive']">
                {{ pkg.active ? '🟢 Attivo' : '🔴 Inattivo' }}
              </span>
            </td>
            <td class="count-cell">{{ pkg._count?.pacchetti || 0 }}</td>
            <td class="actions-cell">
              <button class="btn-icon" @click="openModal(pkg)" title="Modifica">✏️</button>
              <button 
                class="btn-icon" 
                @click="toggleActive(pkg)" 
                :title="pkg.active ? 'Disattiva' : 'Attiva'"
              >
                {{ pkg.active ? '🔴' : '🟢' }}
              </button>
              <button 
                class="btn-icon danger" 
                @click="confirmDelete(pkg)" 
                title="Elimina"
                :disabled="pkg._count?.pacchetti > 0"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="loading" class="loading-state">
        <div class="loader"></div>
        <span>Caricamento pacchetti...</span>
      </div>

      <div v-else class="empty-state">
        <span class="empty-icon">📦</span>
        <p>Nessun pacchetto standard configurato</p>
        <button class="btn-primary" @click="openModal()">Crea il primo pacchetto</button>
      </div>
    </div>

    <!-- Modal Nuovo/Modifica -->
    <PackageModal
      v-if="showModal"
      :package="selectedPackage"
      @close="closeModal"
      @saved="handleSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { standardPackagesAPI } from '@/services/api';
import PackageModal from './modals/PackageModal.vue';

const packages = ref([]);
const loading = ref(false);
const showModal = ref(false);
const selectedPackage = ref(null);
const filterTipo = ref('');
const filterCategoria = ref('');

const categorie = computed(() => {
  const cats = new Set(packages.value.map(p => p.categoria));
  return Array.from(cats).sort();
});

const filteredPackages = computed(() => {
  return packages.value.filter(p => {
    if (filterTipo.value && p.tipo !== filterTipo.value) return false;
    if (filterCategoria.value && p.categoria !== filterCategoria.value) return false;
    return true;
  });
});

async function loadPackages() {
  loading.value = true;
  try {
    const response = await standardPackagesAPI.getAll();
    packages.value = response.data.packages || [];
  } catch (error) {
    console.error('Errore caricamento pacchetti:', error);
  } finally {
    loading.value = false;
  }
}

function openModal(pkg = null) {
  selectedPackage.value = pkg;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedPackage.value = null;
}

function handleSaved() {
  closeModal();
  loadPackages();
}

async function toggleActive(pkg) {
  try {
    await standardPackagesAPI.update(pkg.id, { active: !pkg.active });
    loadPackages();
  } catch (error) {
    console.error('Errore toggle stato:', error);
    alert('❌ Errore durante l\'aggiornamento');
  }
}

async function confirmDelete(pkg) {
  if (pkg._count?.pacchetti > 0) {
    alert(`⚠️ Impossibile eliminare: questo pacchetto è usato da ${pkg._count.pacchetti} alunni.`);
    return;
  }

  if (!confirm(`Sei sicuro di voler eliminare "${pkg.nome}"?`)) return;

  try {
    await standardPackagesAPI.delete(pkg.id);
    loadPackages();
  } catch (error) {
    console.error('Errore eliminazione:', error);
    alert('❌ Errore durante l\'eliminazione');
  }
}

function formatCurrency(value) {
  return parseFloat(value || 0).toFixed(2);
}

onMounted(() => {
  loadPackages();
});
</script>

<style scoped>
.tab-pacchetti {
  padding: 24px;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.tab-header h2 {
  margin: 0 0 4px;
  font-size: 20px;
  color: #1e293b;
}

.tab-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.btn-primary {
  padding: 10px 20px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

/* Table */
.table-container {
  background: #fafbfc;
  border-radius: 8px;
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  padding: 12px;
  background: #f1f5f9;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tr:hover {
  background: #f8fafc;
}

.name-cell {
  display: flex;
  flex-direction: column;
}

.name-cell .desc {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
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

.price-cell {
  font-weight: 600;
  color: #059669;
}

.count-cell {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.actions-cell {
  display: flex;
  gap: 4px;
}

.btn-icon {
  padding: 6px 8px;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e2e8f0;
}

.btn-icon.danger:hover {
  background: #fee2e2;
}

.btn-icon:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* States */
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.loader {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #5e72e4;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0 0 16px;
}
</style>
