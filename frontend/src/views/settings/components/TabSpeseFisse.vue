<template>
  <div class="tab-spese-fisse">
    <div class="section-header">
      <h2>💸 Spese Fisse Mensili</h2>
      <p class="section-desc">Configura le spese ricorrenti mensili per il calcolo del Break-even Point nella contabilità</p>
    </div>

    <!-- Info Card -->
    <div class="info-card">
      <span class="info-icon">ℹ️</span>
      <div class="info-text">
        <strong>Come funziona:</strong> Le spese fisse configurate qui vengono utilizzate per calcolare il 
        <em>Break-even Point</em> nella pagina Contabilità. Il Break-even Point indica quanto manca per 
        coprire i costi fissi mensili.
      </div>
    </div>

    <!-- Form Spese Fisse -->
    <div class="costs-form">
      <div v-if="loading" class="loading">Caricamento...</div>
      
      <div v-else class="costs-grid">
        <div class="cost-card">
          <div class="cost-header">
            <span class="cost-icon">🏠</span>
            <span class="cost-label">Affitto</span>
          </div>
          <div class="cost-input-wrapper">
            <span class="currency">€</span>
            <input 
              type="number" 
              v-model.number="costs.affitto" 
              step="0.01" 
              min="0" 
              placeholder="0.00"
              @change="saveCost('affitto', costs.affitto)"
            />
          </div>
        </div>

        <div class="cost-card">
          <div class="cost-header">
            <span class="cost-icon">💡</span>
            <span class="cost-label">Utenze</span>
          </div>
          <div class="cost-subtext">Luce, gas, acqua, internet</div>
          <div class="cost-input-wrapper">
            <span class="currency">€</span>
            <input 
              type="number" 
              v-model.number="costs.utenze" 
              step="0.01" 
              min="0" 
              placeholder="0.00"
              @change="saveCost('utenze', costs.utenze)"
            />
          </div>
        </div>

        <div class="cost-card">
          <div class="cost-header">
            <span class="cost-icon">💻</span>
            <span class="cost-label">Software</span>
          </div>
          <div class="cost-subtext">Abbonamenti e licenze</div>
          <div class="cost-input-wrapper">
            <span class="currency">€</span>
            <input 
              type="number" 
              v-model.number="costs.software" 
              step="0.01" 
              min="0" 
              placeholder="0.00"
              @change="saveCost('software', costs.software)"
            />
          </div>
        </div>

        <div class="cost-card">
          <div class="cost-header">
            <span class="cost-icon">📦</span>
            <span class="cost-label">Altro</span>
          </div>
          <div class="cost-subtext">Altre spese ricorrenti</div>
          <div class="cost-input-wrapper">
            <span class="currency">€</span>
            <input 
              type="number" 
              v-model.number="costs.altro" 
              step="0.01" 
              min="0" 
              placeholder="0.00"
              @change="saveCost('altro', costs.altro)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Totale -->
    <div class="totale-card">
      <div class="totale-label">TOTALE SPESE FISSE MENSILI</div>
      <div class="totale-value">€ {{ formatCurrency(totaleCostiFissi) }}</div>
      <div class="totale-hint">Questo importo viene utilizzato per calcolare il Break-even Point</div>
    </div>

    <!-- Salvataggio automatico feedback -->
    <div v-if="saveMessage" class="save-message" :class="{ error: saveError }">
      {{ saveMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { configAPI } from '@/services/api';

// State
const costs = ref({
  affitto: 0,
  utenze: 0,
  software: 0,
  altro: 0
});
const loading = ref(true);
const saveMessage = ref('');
const saveError = ref(false);

// Computed
const totaleCostiFissi = computed(() => {
  return (costs.value.affitto || 0) + 
         (costs.value.utenze || 0) + 
         (costs.value.software || 0) + 
         (costs.value.altro || 0);
});

// Methods
function formatCurrency(value) {
  return parseFloat(value || 0).toFixed(2);
}

async function loadCosts() {
  loading.value = true;
  try {
    const response = await configAPI.getAll({ category: 'spese_fisse' });
    const configs = response.data.configs || [];
    
    // Popola i costi dalle configurazioni
    configs.forEach(config => {
      if (config.key === 'spese_fisse_affitto') {
        costs.value.affitto = parseFloat(config.value) || 0;
      } else if (config.key === 'spese_fisse_utenze') {
        costs.value.utenze = parseFloat(config.value) || 0;
      } else if (config.key === 'spese_fisse_software') {
        costs.value.software = parseFloat(config.value) || 0;
      } else if (config.key === 'spese_fisse_altro') {
        costs.value.altro = parseFloat(config.value) || 0;
      }
    });
  } catch (err) {
    console.error('Errore caricamento spese fisse:', err);
  } finally {
    loading.value = false;
  }
}

async function saveCost(tipo, valore) {
  const key = `spese_fisse_${tipo}`;
  const value = parseFloat(valore) || 0;
  
  saveMessage.value = '';
  saveError.value = false;
  
  try {
    await configAPI.update(key, { 
      value: String(value),
      category: 'spese_fisse',
      description: `Spesa fissa mensile: ${tipo}`
    });
    saveMessage.value = `✅ ${tipo.charAt(0).toUpperCase() + tipo.slice(1)} salvato`;
    setTimeout(() => { saveMessage.value = ''; }, 2000);
  } catch (err) {
    console.error(`Errore salvataggio ${tipo}:`, err);
    saveMessage.value = `❌ Errore salvataggio ${tipo}`;
    saveError.value = true;
    setTimeout(() => { saveMessage.value = ''; }, 3000);
  }
}

// Lifecycle
onMounted(() => {
  loadCosts();
});
</script>

<style scoped>
.tab-spese-fisse {
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #1e293b;
}

.section-desc {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

.info-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(94, 114, 228, 0.08), rgba(130, 94, 228, 0.08));
  border: 1px solid rgba(94, 114, 228, 0.2);
  border-radius: 12px;
  margin-bottom: 24px;
}

.info-icon {
  font-size: 24px;
}

.info-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.info-text strong {
  color: #1e293b;
}

.info-text em {
  color: #5e72e4;
  font-style: normal;
  font-weight: 600;
}

.costs-form {
  margin-bottom: 24px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #64748b;
}

.costs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.cost-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.cost-card:hover {
  border-color: #5e72e4;
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.1);
}

.cost-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 4px;
}

.cost-icon {
  font-size: 24px;
}

.cost-label {
  font-weight: 600;
  font-size: 16px;
  color: #1e293b;
}

.cost-subtext {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.cost-input-wrapper {
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 8px;
}

.cost-input-wrapper .currency {
  padding: 12px 14px;
  background: #e2e8f0;
  font-weight: 600;
  color: #64748b;
}

.cost-input-wrapper input {
  flex: 1;
  padding: 12px 14px;
  border: none;
  background: transparent;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
}

.cost-input-wrapper input:focus {
  outline: none;
}

.totale-card {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  padding: 24px;
  border-radius: 16px;
  text-align: center;
}

.totale-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.totale-value {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 8px;
}

.totale-hint {
  font-size: 13px;
  opacity: 0.8;
}

.save-message {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 20px;
  background: #10b981;
  color: white;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 100;
}

.save-message.error {
  background: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

@media (max-width: 640px) {
  .costs-grid {
    grid-template-columns: 1fr;
  }
  
  .totale-value {
    font-size: 28px;
  }
}
</style>
