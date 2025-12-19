<template>
  <div class="referral-input-container">
    <label class="form-label">Referral - Chi ha portato questo alunno?</label>
    
    <!-- Tag degli studenti selezionati -->
    <div class="referral-tags">
      <span 
        v-for="ref in referrers" 
        :key="ref.id" 
        class="referral-tag"
      >
        {{ ref.referrer.firstName }} {{ ref.referrer.lastName }}
        <button 
          v-if="!disabled"
          @click="removeReferral(ref.referrer.id)" 
          class="tag-remove"
          type="button"
        >×</button>
      </span>
      
      <span v-if="referrers.length === 0 && disabled" class="no-referrals">
        Nessun referral
      </span>
    </div>
    
    <!-- Campo di ricerca (solo se editabile) -->
    <div v-if="!disabled" class="search-container">
      <input
        v-model="searchQuery"
        @input="handleSearch"
        @focus="showDropdown = true"
        type="text"
        class="search-input"
        placeholder="Cerca studente..."
      />
      
      <!-- Dropdown risultati -->
      <div v-if="showDropdown && searchResults.length > 0" class="search-dropdown">
        <div
          v-for="student in searchResults"
          :key="student.id"
          @click="selectStudent(student)"
          class="dropdown-item"
        >
          <span class="student-name">{{ student.firstName }} {{ student.lastName }}</span>
          <span v-if="student.classe" class="student-classe">{{ student.classe }}</span>
        </div>
      </div>
      
      <!-- No results -->
      <div v-if="showDropdown && searchQuery && searchResults.length === 0 && !loading" class="search-dropdown">
        <div class="dropdown-empty">Nessuno studente trovato</div>
      </div>
    </div>
    
    <!-- Loading -->
    <div v-if="loading" class="loading-indicator">Caricamento...</div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { studentsAPI } from '@/services/api';

const props = defineProps({
  studentId: {
    type: String,
    required: true
  },
  referrers: {
    type: Array,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['updated']);

const searchQuery = ref('');
const searchResults = ref([]);
const showDropdown = ref(false);
const loading = ref(false);
let searchTimeout = null;

const handleSearch = () => {
  clearTimeout(searchTimeout);
  
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    loading.value = true;
    try {
      const { data } = await studentsAPI.searchForReferral(
        searchQuery.value.trim(),
        props.studentId
      );
      // Filtra studenti già selezionati
      const existingIds = props.referrers.map(r => r.referrer.id);
      searchResults.value = data.students.filter(s => !existingIds.includes(s.id));
    } catch (error) {
      console.error('Errore ricerca referral:', error);
    } finally {
      loading.value = false;
    }
  }, 300);
};

const selectStudent = async (student) => {
  try {
    await studentsAPI.addReferral(props.studentId, student.id);
    searchQuery.value = '';
    searchResults.value = [];
    showDropdown.value = false;
    emit('updated');
  } catch (error) {
    console.error('Errore aggiunta referral:', error);
    alert('Errore durante l\'aggiunta del referral');
  }
};

const removeReferral = async (referrerId) => {
  try {
    await studentsAPI.removeReferral(props.studentId, referrerId);
    emit('updated');
  } catch (error) {
    console.error('Errore rimozione referral:', error);
    alert('Errore durante la rimozione del referral');
  }
};

// Chiudi dropdown quando si clicca fuori
const handleClickOutside = (event) => {
  if (!event.target.closest('.referral-input-container')) {
    showDropdown.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.referral-input-container {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.referral-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
  min-height: 32px;
}

.referral-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.tag-remove {
  background: transparent;
  border: none;
  color: #6366f1;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  transition: color 0.2s;
}

.tag-remove:hover {
  color: #4338ca;
}

.no-referrals {
  color: #9ca3af;
  font-size: 13px;
  font-style: italic;
}

.search-container {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #6366f1;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 4px;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.student-name {
  font-weight: 500;
  color: #111827;
}

.student-classe {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 4px;
}

.dropdown-empty {
  padding: 12px 14px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.loading-indicator {
  font-size: 13px;
  color: #6b7280;
  margin-top: 8px;
}
</style>
