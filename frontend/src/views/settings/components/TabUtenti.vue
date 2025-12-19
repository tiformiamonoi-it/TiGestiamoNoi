<template>
  <div class="tab-utenti">
    <div class="tab-header">
      <div>
        <h2>👥 Gestione Utenti</h2>
        <p>Gestisci gli utenti con accesso alla webapp</p>
      </div>
      <button class="btn-primary" @click="openModal()">
        + Nuovo Utente
      </button>
    </div>

    <!-- Tabella Utenti -->
    <div class="table-container">
      <table v-if="!loading && users.length > 0" class="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ruolo</th>
            <th>Stato</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td class="name-cell">
              <strong>{{ user.firstName }} {{ user.lastName }}</strong>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <span :class="['role-badge', user.role.toLowerCase()]">
                {{ getRoleLabel(user.role) }}
              </span>
            </td>
            <td>
              <span :class="['status-badge', user.active ? 'active' : 'inactive']">
                {{ user.active ? '🟢 Attivo' : '🔴 Inattivo' }}
              </span>
            </td>
            <td class="actions-cell">
              <button class="btn-icon" @click="openModal(user)" title="Modifica">✏️</button>
              <button class="btn-icon" @click="resetPassword(user)" title="Reset Password">🔑</button>
              <button 
                class="btn-icon" 
                @click="toggleActive(user)" 
                :title="user.active ? 'Disattiva' : 'Attiva'"
              >
                {{ user.active ? '🔴' : '🟢' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else-if="loading" class="loading-state">
        <div class="loader"></div>
        <span>Caricamento utenti...</span>
      </div>

      <div v-else class="empty-state">
        <span class="empty-icon">👥</span>
        <p>Nessun utente configurato</p>
        <button class="btn-primary" @click="openModal()">Crea il primo utente</button>
      </div>
    </div>

    <!-- Modal Nuovo/Modifica Utente -->
    <UserModal
      v-if="showModal"
      :user="selectedUser"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Modal Reset Password -->
    <Teleport to="body" v-if="showResetModal">
      <div class="modal-overlay" @click.self="showResetModal = false">
        <div class="modal-container small">
          <div class="modal-header">
            <h3>🔑 Reset Password</h3>
            <button class="btn-close" @click="showResetModal = false">✕</button>
          </div>
          <div class="modal-body">
            <p>Reset password per <strong>{{ resetUser?.firstName }} {{ resetUser?.lastName }}</strong></p>
            <div class="form-group">
              <label class="form-label">Nuova Password <span class="required">*</span></label>
              <input 
                v-model="newPassword" 
                type="text" 
                class="form-input" 
                placeholder="Minimo 8 caratteri"
              />
            </div>
            <div class="info-box">
              ℹ️ La nuova password sarà attiva immediatamente. Comunicala all'utente.
            </div>
            <div class="modal-footer">
              <button class="btn-secondary" @click="showResetModal = false">Annulla</button>
              <button 
                class="btn-primary" 
                @click="confirmResetPassword"
                :disabled="newPassword.length < 8"
              >
                🔑 Reset Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { authAPI } from '@/services/api';
import UserModal from './modals/UserModal.vue';

const users = ref([]);
const loading = ref(false);
const showModal = ref(false);
const selectedUser = ref(null);
const showResetModal = ref(false);
const resetUser = ref(null);
const newPassword = ref('');

async function loadUsers() {
  loading.value = true;
  try {
    const response = await authAPI.getUsers();
    users.value = response.data.users || [];
  } catch (error) {
    console.error('Errore caricamento utenti:', error);
  } finally {
    loading.value = false;
  }
}

function openModal(user = null) {
  selectedUser.value = user;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedUser.value = null;
}

function handleSaved() {
  closeModal();
  loadUsers();
}

function getRoleLabel(role) {
  const labels = {
    'ADMIN': '👑 Admin',
    'TUTOR': '👨‍🏫 Tutor',
    'GENITORE': '👨‍👩‍👧 Genitore'
  };
  return labels[role] || role;
}

async function toggleActive(user) {
  try {
    await authAPI.updateUser(user.id, { active: !user.active });
    loadUsers();
  } catch (error) {
    console.error('Errore toggle stato:', error);
    alert('❌ Errore durante l\'aggiornamento');
  }
}

function resetPassword(user) {
  resetUser.value = user;
  newPassword.value = '';
  showResetModal.value = true;
}

async function confirmResetPassword() {
  if (newPassword.value.length < 8) {
    alert('⚠️ La password deve essere di almeno 8 caratteri');
    return;
  }

  try {
    await authAPI.resetPassword(resetUser.value.id, { password: newPassword.value });
    alert('✅ Password resettata con successo');
    showResetModal.value = false;
    resetUser.value = null;
    newPassword.value = '';
  } catch (error) {
    console.error('Errore reset password:', error);
    alert('❌ Errore durante il reset della password');
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.tab-utenti {
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
  font-size: 14px;
}

.data-table th {
  padding: 12px 16px;
  background: #f1f5f9;
  text-align: left;
  font-weight: 600;
  color: #475569;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.data-table tr:hover {
  background: #f8fafc;
}

.name-cell strong {
  color: #1e293b;
}

.role-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.admin {
  background: rgba(168, 85, 247, 0.1);
  color: #9333ea;
}

.role-badge.tutor {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.role-badge.genitore {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
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

.modal-container.small {
  background: white;
  border-radius: 12px;
  max-width: 420px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
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
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.info-box {
  padding: 12px;
  background: #f0f9ff;
  border-radius: 8px;
  font-size: 13px;
  color: #0369a1;
  margin-bottom: 16px;
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
</style>
