<template>
  <div class="settings-page">
    <div class="page-header">
      <h1>⚙️ Impostazioni</h1>
      <p class="subtitle">Configura pacchetti, tariffe, materie e utenti</p>
    </div>

    <!-- Tabs Navigation -->
    <div class="tabs-container">
      <nav class="tabs-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.key"
          :class="['tab-btn', { active: activeTab === tab.key }]"
          @click="setTab(tab.key)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <TabPacchetti v-if="activeTab === 'pacchetti'" />
      <TabTariffe v-else-if="activeTab === 'tariffe'" />
      <TabMaterie v-else-if="activeTab === 'materie'" />
      <TabSlotOrari v-else-if="activeTab === 'slot'" />
      <TabChiusure v-else-if="activeTab === 'chiusure'" />
      <TabSpeseFisse v-else-if="activeTab === 'spese'" />
      <TabUtenti v-else-if="activeTab === 'utenti'" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TabPacchetti from './components/TabPacchetti.vue';
import TabTariffe from './components/TabTariffe.vue';
import TabMaterie from './components/TabMaterie.vue';
import TabSlotOrari from './components/TabSlotOrari.vue';
import TabChiusure from './components/TabChiusure.vue';
import TabSpeseFisse from './components/TabSpeseFisse.vue';
import TabUtenti from './components/TabUtenti.vue';

const route = useRoute();
const router = useRouter();

const tabs = [
  { key: 'pacchetti', label: 'Pacchetti', icon: '📦' },
  { key: 'tariffe', label: 'Tariffe Tutor', icon: '💰' },
  { key: 'materie', label: 'Materie', icon: '📚' },
  { key: 'slot', label: 'Slot Orari', icon: '🕐' },
  { key: 'chiusure', label: 'Chiusure', icon: '🚫' },
  { key: 'spese', label: 'Spese Fisse', icon: '💸' },
  { key: 'utenti', label: 'Utenti', icon: '👥' }
];

const activeTab = ref('pacchetti');

function setTab(tab) {
  activeTab.value = tab;
  router.push({ query: { tab } });
}

onMounted(() => {
  if (route.query.tab && tabs.find(t => t.key === route.query.tab)) {
    activeTab.value = route.query.tab;
  }
});
</script>

<style scoped>
.settings-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.subtitle {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* Tabs */
.tabs-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  overflow: hidden;
}

.tabs-nav {
  display: flex;
  border-bottom: 2px solid #f1f5f9;
  overflow-x: auto;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.2s;
  position: relative;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #5e72e4;
  background: rgba(94, 114, 228, 0.05);
}

.tab-btn.active {
  color: #5e72e4;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  border-radius: 3px 3px 0 0;
}

.tab-icon {
  font-size: 18px;
}

.tab-label {
  font-size: 14px;
}

/* Tab Content */
.tab-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }

  .tab-btn {
    padding: 12px 16px;
  }

  .tab-label {
    display: none;
  }

  .tab-icon {
    font-size: 24px;
  }
}
</style>
