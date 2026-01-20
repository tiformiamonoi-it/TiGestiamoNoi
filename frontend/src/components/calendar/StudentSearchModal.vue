<!-- frontend/src/components/calendar/StudentSearchModal.vue -->
<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Seleziona Studenti</h3>
        <button @click="$emit('close')" class="btn-close">✖</button>
      </div>

      <!-- Ricerca -->
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Cerca per nome o cognome..."
          class="search-input"
          autofocus
        />
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="loader"></div>
        Caricamento studenti...
      </div>

      <!-- Lista studenti -->
      <div v-else class="students-list">
        <div
          v-for="student in filteredStudents"
          :key="student.id"
          class="student-row"
          :class="{ 
            selected: selectedStudents.has(student.id),
            disabled: isStudentChiuso(student)
          }"
          @click="toggleStudent(student)"
        >
          <input
            type="checkbox"
            :checked="selectedStudents.has(student.id)"
            :disabled="selectedIds.includes(student.id) || isStudentChiuso(student)"
            @click.stop="toggleStudent(student)"
          />
          
          <div class="student-info">
            <div class="student-name">
              {{ student.firstName }} {{ student.lastName }}
              
              <!-- Badge già aggiunto -->
              <span
                v-if="selectedIds.includes(student.id)"
                class="badge-already-added"
              >
                ✓ Già aggiunto
              </span>
              
              <!-- Badge pacchetto chiuso -->
              <span
                v-else-if="isStudentChiuso(student)"
                class="badge-chiuso"
              >
                Pacchetto Chiuso
              </span>
            </div>
            
            <div class="student-packages">
              <span
                v-for="pkg in student.pacchetti"
                :key="pkg.id"
                class="package-badge"
                :class="getPackageClass(pkg)"
              >
                📦 {{ pkg.nome }} ({{ getPackageResiduo(pkg) }})
              </span>
            </div>
          </div>

          <!-- Warning 0h -->
          <span
            v-if="hasZeroHours(student) && !isStudentChiuso(student)"
            class="warning-badge"
            title="Ore residue a 0"
          >
            ⚠️ 0h
          </span>
        </div>

        <!-- Empty state -->
        <div v-if="filteredStudents.length === 0" class="empty-state">
          <p>Nessuno studente trovato</p>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <div class="selected-count">
          {{ selectedStudents.size }} {{ selectedStudents.size === 1 ? 'studente selezionato' : 'studenti selezionati' }}
        </div>
        <div class="footer-actions">
          <button @click="$emit('close')" class="btn-secondary">
            Annulla
          </button>
          <button
            @click="handleAdd"
            class="btn-primary"
            :disabled="selectedStudents.size === 0"
          >
            Aggiungi Selezionati
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { calendarAPI } from '@/services/api';

// ========================================
// PROPS & EMITS
// ========================================

const props = defineProps({
  selectedIds: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['add-students', 'close']);

// ========================================
// STATE
// ========================================

const loading = ref(false);
const students = ref([]);
const searchQuery = ref('');
const selectedStudents = ref(new Set());

// ========================================
// COMPUTED
// ========================================

// Filtra studenti per ricerca
const filteredStudents = computed(() => {
  if (!searchQuery.value) return students.value;
  
  const query = searchQuery.value.toLowerCase();
  return students.value.filter(s => 
    s.firstName.toLowerCase().includes(query) ||
    s.lastName.toLowerCase().includes(query)
  );
});

// ========================================
// FUNCTIONS
// ========================================

const loadStudents = async () => {
  loading.value = true;
  try {
    const response = await calendarAPI.getAlunniDisponibili();
    students.value = response.data.students || [];
  } catch (error) {
    console.error('Errore caricamento studenti:', error);
    alert('Errore durante il caricamento degli studenti');
  } finally {
    loading.value = false;
  }
};

const toggleStudent = (student) => {
  // Non permettere toggle se già aggiunto alla lezione o pacchetto chiuso
  if (props.selectedIds.includes(student.id)) return;
  if (isStudentChiuso(student)) return;
  
  if (selectedStudents.value.has(student.id)) {
    selectedStudents.value.delete(student.id);
  } else {
    selectedStudents.value.add(student.id);
  }
  
  // Force reactivity
  selectedStudents.value = new Set(selectedStudents.value);
};

// Verifica se lo studente ha SOLO pacchetti chiusi (o nessun pacchetto attivo)
const isStudentChiuso = (student) => {
  // ✅ Se il backend ha già calcolato questo flag, usalo
  if (student._allPackagesClosed === true) return true;
  
  // Se non ci sono pacchetti attivi (il backend li ha già filtrati), lo studente non è utilizzabile
  if (!student.pacchetti || student.pacchetti.length === 0) {
    return true;
  }
  
  // Se TUTTI i pacchetti restituiti sono CHIUSI
  return student.pacchetti.every(pkg => pkg.stati?.includes('CHIUSO'));
};

const handleAdd = () => {
  const selected = students.value.filter(s => selectedStudents.value.has(s.id));
  emit('add-students', selected);
};

const hasZeroHours = (student) => {
  return student.pacchetti.some(pkg => {
    if (pkg.tipo === 'ORE') {
      return parseFloat(pkg.oreResiduo) <= 0;
    }
    return false;
  });
};

const getPackageResiduo = (pkg) => {
  if (pkg.tipo === 'ORE') {
    return `${pkg.oreResiduo}h`;
  } else if (pkg.tipo === 'MENSILE') {
    return `${pkg.giorniResiduo || 0}gg`;
  }
  return '';
};

const getPackageClass = (pkg) => {
  // Se pacchetto chiuso
  if (pkg.stati?.includes('CHIUSO')) return 'package-closed';
  
  if (pkg.tipo === 'ORE') {
    const ore = parseFloat(pkg.oreResiduo);
    if (ore <= 0) return 'package-warning';
    if (ore <= 2) return 'package-low';
  }
  return 'package-active';
};

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
  loadStudents();
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
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.btn-close {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.search-box {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.loading-state {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.loader {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.students-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px;
}

.student-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.student-row:hover {
  background: #f9fafb;
}

.student-row.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.student-row input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.student-row input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.badge-already-added {
  padding: 2px 8px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.student-packages {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.package-badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #374151;
}

.package-active {
  background: #d1fae5;
  color: #065f46;
}

.package-low {
  background: #fef3c7;
  color: #92400e;
}

.package-warning {
  background: #fee2e2;
  color: #991b1b;
}

/* Pacchetto chiuso - grigio */
.package-closed {
  background: #e5e7eb;
  color: #6b7280;
}

/* Badge "Pacchetto Chiuso" */
.badge-chiuso {
  padding: 2px 8px;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

/* Riga studente disabilitato */
.student-row.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.student-row.disabled:hover {
  background: transparent;
}

.warning-badge {
  font-size: 12px;
  padding: 4px 8px;
  background: #fef3c7;
  border-radius: 4px;
  color: #92400e;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.selected-count {
  font-size: 14px;
  color: #6b7280;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-content {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
