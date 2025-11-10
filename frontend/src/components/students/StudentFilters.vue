<template>
  <div class="filters-bar">
    <div class="search-box">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        :value="filters.search"
        @input="updateFilter('search', $event.target.value)"
        type="text"
        placeholder="Cerca alunno per nome, cognome o genitore..."
        class="search-input"
      />
    </div>

    <select
      :value="filters.scuola"
      @change="updateFilter('scuola', $event.target.value)"
      class="filter-select"
    >
      <option value="">Tutte le scuole</option>
      <option value="ELEMENTARI">Elementari</option>
      <option value="MEDIA">Medie</option>
      <option value="SUPERIORE">Superiori</option>
      <option value="ALTRO">Altro</option>

    </select>

    <select
      :value="filters.stato"
      @change="updateFilter('stato', $event.target.value)"
      class="filter-select"
    >
      <option value="">Tutti gli stati</option>
      <option value="attivo">Attivo</option>
      <option value="sospeso">Sospeso</option>
      <option value="ore_negative">Ore Negative</option>
      <option value="in_scadenza">In Scadenza</option>
      <option value="scaduto">Scaduto</option>
      <option value="inattivo">Inattivo</option>
    </select>

    <select
      :value="filters.pacchetto"
      @change="updateFilter('pacchetto', $event.target.value)"
      class="filter-select"
    >
      <option value="">Tutti i pacchetti</option>
      <option value="mensile">Mensile</option>
      <option value="orario">Orario</option>
    </select>

    <div class="filter-checkboxes">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="filters.oreNegative"
          @change="updateFilter('oreNegative', $event.target.checked)"
        />
        <span>Ore Negative</span>
      </label>

      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="filters.pagamentoSospeso"
          @change="updateFilter('pagamentoSospeso', $event.target.checked)"
        />
        <span>Pagamento Sospeso</span>
      </label>
    </div>

    <button
      v-if="hasActiveFilters"
      @click="$emit('clear')"
      class="btn-clear"
    >
      Pulisci filtri
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:filters', 'clear']);

const hasActiveFilters = computed(() => {
  return (
    props.filters.search ||
    props.filters.scuola ||
    props.filters.stato ||
    props.filters.pacchetto ||
    props.filters.oreNegative ||
    props.filters.pagamentoSospeso
  );
});

let searchTimeout;

const updateFilter = (key, value) => {
  const newFilters = { ...props.filters, [key]: value };
  
  // Debounce per la ricerca
  if (key === 'search') {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      emit('update:filters', newFilters);
    }, 500);
  } else {
    emit('update:filters', newFilters);
  }
};
</script>

<style scoped>
.filters-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 14px;
  color: #8392ab;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 10px 10px 42px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.filter-select:hover {
  border-color: #5e72e4;
}

.filter-select:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.filter-checkboxes {
  display: flex;
  gap: 16px;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #344767;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #5e72e4;
}

.checkbox-label span {
  font-weight: 500;
}

.btn-clear {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #8392ab;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-clear:hover {
  background: #f8f9fa;
  color: #344767;
  border-color: #344767;
}

@media (max-width: 768px) {
  .filters-bar {
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .filter-checkboxes {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
