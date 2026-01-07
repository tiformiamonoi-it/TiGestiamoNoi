<template>
  <div class="table-container">
    <table class="tutors-table">
      <thead>
        <tr>
          <th class="w-10">
            <input 
              type="checkbox" 
              :checked="allSelected" 
              @change="toggleSelectAll"
              class="checkbox-input"
            />
          </th>
          <th 
            class="cursor-pointer hover:text-gray-700"
            @click="$emit('sort', 'name')"
          >
            Nome Tutor ↕
          </th>
          <th>
            Stato
          </th>
          <th>
            Mesi Non Pagati
          </th>
          <th>
            Totale Dovuto
          </th>
          <th class="text-right">
            Azioni
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tutor in tutors" :key="tutor.id" class="tutor-row">
          <!-- Checkbox -->
          <td>
            <input 
              type="checkbox" 
              v-model="selectedIds" 
              :value="tutor.id"
              class="checkbox-input"
            />
          </td>

          <!-- Nome -->
          <td>
            <div class="tutor-cell">
              <div class="tutor-avatar">
                {{ getInitials(tutor) }}
              </div>
              <div class="tutor-info">
                <div class="tutor-name cursor-pointer hover:text-blue-600" @click="$emit('view', tutor.id)">
                  {{ tutor.lastName }} {{ tutor.firstName }}
                </div>
                <div class="tutor-email" :class="{ 'no-email': !hasEmail(tutor) }">
                  {{ hasEmail(tutor) ? tutor.email : 'Email non presente' }}
                </div>
              </div>
            </div>
          </td>

          <!-- Stato -->
          <td>
            <div class="states-cell">
              <!-- Active Status -->
              <span 
                class="state-badge"
                :class="tutor.active ? 'state-success' : 'state-inactive'"
              >
                {{ tutor.active ? 'Attivo' : 'Disattivato' }}
              </span>
              <!-- Payment Status -->
              <span 
                v-if="tutor.mesiNonPagati?.length > 0"
                class="state-badge state-danger"
              >
                {{ tutor.mesiNonPagati.length }} mesi non pagati
              </span>
            </div>
          </td>

          <!-- Mesi Non Pagati (Espandibile) -->
          <td>
            <div v-if="tutor.mesiNonPagati?.length > 0">
              <button 
                @click="toggleExpand(tutor.id)"
                class="expand-btn"
              >
                {{ tutor.mesiNonPagati.length }} 
                <span class="expand-icon">[{{ expandedIds.includes(tutor.id) ? 'Nascondi ▲' : 'Mostra ▼' }}]</span>
              </button>
              
              <div v-if="expandedIds.includes(tutor.id)" class="expanded-content">
                <div v-for="(mese, idx) in tutor.mesiNonPagati" :key="idx">
                  {{ formatMese(mese.date) }} - {{ mese.importo }}€
                </div>
              </div>
            </div>
            <span v-else class="text-muted italic">
              (tutto pagato)
            </span>
          </td>

          <!-- Totale Dovuto -->
          <td>
            <div class="amount-text" :class="tutor.totaleDovuto > 0 ? 'text-danger' : 'text-dark'">
              {{ tutor.totaleDovuto }}€
            </div>
          </td>

          <!-- Azioni -->
          <td>
            <div class="actions-cell justify-end">
              <button 
                v-if="tutor.totaleDovuto > 0"
                @click="$emit('pay', tutor)"
                class="btn-icon text-success"
                title="Paga Compenso"
              >
                💰
              </button>
              <button 
                @click="$emit('view', tutor.id)"
                class="btn-icon"
                title="Vedi Dettaglio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </button>
              <button 
                @click="$emit('toggle-active', tutor)"
                class="btn-icon"
                :class="tutor.active ? 'text-warning' : 'text-success'"
                :title="tutor.active ? 'Disattiva Tutor' : 'Attiva Tutor'"
              >
                {{ tutor.active ? '🔴' : '🟢' }}
              </button>
              <button 
                @click="$emit('delete', tutor)"
                class="btn-icon text-danger"
                title="Elimina Tutor"
              >
                🗑️
              </button>
            </div>
          </td>
        </tr>

        <!-- Empty State -->
        <tr v-if="tutors.length === 0">
          <td colspan="6" class="empty-cell">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p>Nessun tutor trovato con i filtri selezionati.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  tutors: {
    type: Array,
    required: true,
  },
  modelValue: { // v-model per selectedIds
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'view', 'pay', 'sort', 'toggle-active', 'delete']);

const selectedIds = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const expandedIds = ref([]);

const allSelected = computed(() => {
  return props.tutors.length > 0 && selectedIds.value.length === props.tutors.length;
});

function toggleSelectAll() {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = props.tutors.map(t => t.id);
  }
}

function toggleExpand(id) {
  if (expandedIds.value.includes(id)) {
    expandedIds.value = expandedIds.value.filter(x => x !== id);
  } else {
    expandedIds.value.push(id);
  }
}

function formatMese(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}

function hasEmail(tutor) {
  return tutor.email && !tutor.email.includes('@placeholder.local');
}

function getInitials(tutor) {
  return `${tutor.firstName.charAt(0)}${tutor.lastName.charAt(0)}`;
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.tutors-table {
  width: 100%;
  border-collapse: collapse;
}

.tutors-table thead {
  background: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}

.tutors-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 13px;
  color: #8392ab;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tutor-row {
  border-bottom: 1px solid #f0f2f5;
  transition: background 0.2s;
}

.tutor-row:hover {
  background: #f8f9fa;
}

.tutor-row td {
  padding: 16px;
  vertical-align: middle;
}

/* Checkbox */
.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #5e72e4;
  cursor: pointer;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: white;
  transition: all 0.2s;
}

.checkbox-input:checked {
  background: #5e72e4;
  border-color: #5e72e4;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
}

.checkbox-input:hover {
  border-color: #5e72e4;
}

.checkbox-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.2);
}

/* Tutor Cell */
.tutor-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tutor-avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.tutor-info {
  flex: 1;
  min-width: 0;
}

.tutor-name {
  font-weight: 600;
  color: #344767;
  font-size: 14px;
  margin-bottom: 2px;
}

.tutor-email {
  font-size: 12px;
  color: #8392ab;
}

.tutor-email.no-email {
  font-style: italic;
  color: #adb5bd;
}

/* States Cell */
.states-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.state-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.state-success {
  background: rgba(45, 206, 137, 0.15);
  color: #2dce89;
}

.state-inactive {
  background: rgba(131, 146, 171, 0.15);
  color: #8392ab;
}

.state-danger {
  background: rgba(245, 54, 92, 0.15);
  color: #f5365c;
}

/* Expandable Content */
.expand-btn {
  font-size: 14px;
  color: #5e72e4;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
}

.expand-btn:hover {
  text-decoration: underline;
}

.expand-icon {
  font-size: 11px;
  margin-left: 4px;
}

.expanded-content {
  margin-top: 8px;
  font-size: 12px;
  color: #525f7f;
  padding-left: 8px;
  border-left: 2px solid #e9ecef;
}

.text-muted {
  color: #8392ab;
  font-size: 13px;
}

/* Amount */
.amount-text {
  font-size: 14px;
  font-weight: 700;
}

.text-danger {
  color: #f5365c;
}

.text-dark {
  color: #344767;
}

/* Actions */
.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 34px;
  height: 34px;
  padding: 0;
  background: transparent;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8392ab;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f8f9fa;
  color: #5e72e4;
  border-color: #5e72e4;
}

.text-success {
  color: #2dce89;
}

.text-warning {
  color: #fb6340;
}

.text-danger {
  color: #f5365c;
}

/* Empty State */
.empty-cell {
  padding: 60px 20px;
  text-align: center;
  color: #8392ab;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-cell svg {
  color: #cbd5e0;
}

.empty-cell p {
  margin: 0;
  font-size: 16px;
}
</style>
