<template>
  <div class="tab-tariffe">
    <div class="tab-header">
      <div>
        <h2>💰 Tariffe Tutor</h2>
        <p>Configura i compensi per le lezioni</p>
      </div>
    </div>

    <div class="tariffe-grid">
      <!-- Lezione Intera -->
      <div class="tariffe-card">
        <div class="card-header">
          <h3>🕐 Lezione Intera (1 ora)</h3>
        </div>
        <div class="card-body">
          <div class="tariffa-row">
            <label>Singola (1 alunno)</label>
            <div class="input-group">
              <input v-model.number="tariffe.singola" type="number" step="0.5" min="0" />
              <span class="suffix">€</span>
            </div>
          </div>
          <div class="tariffa-row">
            <label>Gruppo (2-4 alunni)</label>
            <div class="input-group">
              <input v-model.number="tariffe.gruppo" type="number" step="0.5" min="0" />
              <span class="suffix">€</span>
            </div>
          </div>
          <div class="tariffa-row">
            <label>Maxi (5+ alunni)</label>
            <div class="input-group">
              <input v-model.number="tariffe.maxi" type="number" step="0.5" min="0" />
              <span class="suffix">€</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mezza Lezione -->
      <div class="tariffe-card readonly">
        <div class="card-header">
          <h3>⏱️ Mezza Lezione (0.5 ore)</h3>
          <span class="badge-auto">Calcolate automaticamente</span>
        </div>
        <div class="card-body">
          <div class="tariffa-row">
            <label>Singola</label>
            <div class="value-display">{{ mezzaSingola.toFixed(2) }} €</div>
          </div>
          <div class="tariffa-row">
            <label>Gruppo</label>
            <div class="value-display">{{ mezzaGruppo.toFixed(2) }} €</div>
          </div>
          <div class="tariffa-row">
            <label>Maxi</label>
            <div class="value-display">{{ mezzaMaxi.toFixed(2) }} €</div>
            <span class="note">⚠️ Usa tariffa Gruppo / 2</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div class="info-box">
      <h4>ℹ️ Come funzionano le tariffe</h4>
      <ul>
        <li><strong>Singola:</strong> 1 solo alunno in lezione</li>
        <li><strong>Gruppo:</strong> Da 2 a 4 alunni in lezione</li>
        <li><strong>Maxi:</strong> 5 o più alunni in lezione</li>
        <li><strong>Mezza lezione Maxi:</strong> Usa tariffa Gruppo / 2 (non Maxi / 2)</li>
      </ul>
    </div>

    <!-- Salva Button -->
    <div class="actions-bar">
      <button 
        class="btn-primary" 
        @click="salvaTariffe" 
        :disabled="saving || !hasChanges"
      >
        {{ saving ? 'Salvataggio...' : '💾 Salva Tariffe' }}
      </button>
      <span v-if="savedAt" class="saved-info">
        ✅ Ultimo salvataggio: {{ formatDate(savedAt) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { configAPI } from '@/services/api';

const tariffe = ref({
  singola: 5,
  gruppo: 8,
  maxi: 8.5
});

const originalTariffe = ref({ singola: 5, gruppo: 8, maxi: 8.5 });
const saving = ref(false);
const savedAt = ref(null);

// Calcolo automatico mezza lezione
const mezzaSingola = computed(() => tariffe.value.singola / 2);
const mezzaGruppo = computed(() => tariffe.value.gruppo / 2);
const mezzaMaxi = computed(() => tariffe.value.gruppo / 2); // Usa gruppo, non maxi!

const hasChanges = computed(() => {
  return tariffe.value.singola !== originalTariffe.value.singola ||
         tariffe.value.gruppo !== originalTariffe.value.gruppo ||
         tariffe.value.maxi !== originalTariffe.value.maxi;
});

async function loadTariffe() {
  try {
    const response = await configAPI.getAll({ category: 'tariffe' });
    const configs = response.data.configs || [];
    
    const singola = configs.find(c => c.key === 'tariffa_singola');
    const gruppo = configs.find(c => c.key === 'tariffa_gruppo');
    const maxi = configs.find(c => c.key === 'tariffa_maxi');
    
    if (singola) tariffe.value.singola = parseFloat(singola.value);
    if (gruppo) tariffe.value.gruppo = parseFloat(gruppo.value);
    if (maxi) tariffe.value.maxi = parseFloat(maxi.value);
    
    originalTariffe.value = { ...tariffe.value };
  } catch (error) {
    console.error('Errore caricamento tariffe:', error);
  }
}

async function salvaTariffe() {
  saving.value = true;
  
  try {
    // Salva ogni tariffa
    await Promise.all([
      configAPI.update('tariffa_singola', { value: String(tariffe.value.singola) }),
      configAPI.update('tariffa_gruppo', { value: String(tariffe.value.gruppo) }),
      configAPI.update('tariffa_maxi', { value: String(tariffe.value.maxi) })
    ]);
    
    originalTariffe.value = { ...tariffe.value };
    savedAt.value = new Date();
    alert('✅ Tariffe salvate con successo!');
  } catch (error) {
    console.error('Errore salvataggio tariffe:', error);
    alert('❌ Errore durante il salvataggio');
  } finally {
    saving.value = false;
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('it-IT');
}

onMounted(() => {
  loadTariffe();
});
</script>

<style scoped>
.tab-tariffe {
  padding: 24px;
}

.tab-header {
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

.tariffe-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.tariffe-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.tariffe-card.readonly {
  background: #f1f5f9;
}

.card-header {
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
}

.badge-auto {
  font-size: 11px;
  padding: 4px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 4px;
  font-weight: 500;
}

.card-body {
  padding: 16px;
}

.tariffa-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.tariffa-row:last-child {
  border-bottom: none;
}

.tariffa-row label {
  font-weight: 500;
  color: #475569;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.input-group input {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  text-align: right;
}

.input-group input:focus {
  outline: none;
  border-color: #5e72e4;
}

.suffix {
  color: #64748b;
  font-weight: 500;
}

.value-display {
  font-size: 16px;
  font-weight: 600;
  color: #5e72e4;
}

.tariffa-row .note {
  font-size: 11px;
  color: #f59e0b;
  margin-left: 8px;
}

.info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 16px 20px;
  margin-bottom: 24px;
}

.info-box h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #0369a1;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: #0c4a6e;
}

.info-box li {
  margin-bottom: 6px;
}

.actions-bar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.saved-info {
  font-size: 13px;
  color: #16a34a;
}

@media (max-width: 768px) {
  .tariffe-grid {
    grid-template-columns: 1fr;
  }
}
</style>
