<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title">
            <h3>✏️ Modifica Compenso</h3>
            <p class="modal-subtitle">{{ formatMonth(payment?.mese) }}</p>
          </div>
          <button class="btn-close" @click="close">×</button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Stato Attuale -->
          <div class="status-section">
            <span class="label">Stato attuale:</span>
            <span :class="['status-badge', getStatusClass(payment)]">
              {{ getStatusLabel(payment) }}
            </span>
            <span v-if="payment?.importo" class="amount">({{ payment.importo }}€)</span>
          </div>

          <hr class="divider" />

          <!-- Form -->
          <div class="form-group">
            <label class="form-label">Nuovo importo</label>
            <div class="amount-input-group">
              <input 
                type="number" 
                v-model="formData.importo" 
                :disabled="formData.proBono"
                class="form-control"
                step="0.01"
              />
              <span class="currency">€</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Stato Pagamento</label>
            <select v-model="formData.status" class="form-control">
              <option value="PAGATO">✅ Pagato (Completo)</option>
              <option value="PARZIALE">⚠️ Parziale</option>
              <option value="PRO_BONO">🎁 Pro Bono (0€)</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Note</label>
            <textarea 
              v-model="formData.note" 
              rows="3" 
              class="form-control"
              placeholder="Note opzionali..."
            ></textarea>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="close" class="btn-secondary">Annulla</button>
          <button @click="save" class="btn-primary">💾 Salva</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  payment: Object, // { id, mese, importo, pagato, proBono, note, status... }
});

const emit = defineEmits(['close', 'save']);

const formData = ref({
  importo: 0,
  status: 'PAGATO',
  note: '',
});

watch(() => props.payment, (val) => {
  if (val) {
    formData.value = {
      importo: val.importo,
      status: val.status || (val.proBono ? 'PRO_BONO' : 'PAGATO'),
      note: val.note || '',
    };
  }
}, { immediate: true });

watch(() => formData.value.status, (val) => {
  if (val === 'PRO_BONO') {
    formData.value.importo = 0;
  }
});

function formatMonth(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}

function getStatusClass(item) {
  if (!item) return '';
  if (item.proBono) return 'status-probono';
  if (item.pagato) return 'status-paid';
  return 'status-unpaid';
}

function getStatusLabel(item) {
  if (!item) return '';
  if (item.proBono) return '🎁 Pro Bono';
  if (item.pagato) return '✅ Pagato';
  return '🔴 Non Pagato';
}

function close() {
  emit('close');
}

function save() {
  emit('save', {
    ...props.payment,
    ...formData.value,
    importo: Number(formData.value.importo)
  });
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 90%; max-width: 500px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex; justify-content: space-between; align-items: flex-start;
}

.modal-title h3 { margin: 0; font-size: 18px; color: #344767; }
.modal-subtitle { margin: 4px 0 0 0; font-size: 14px; color: #8392ab; font-weight: 600; text-transform: capitalize; }

.btn-close {
  background: none; border: none; font-size: 24px; color: #8392ab; cursor: pointer;
}

.modal-body { padding: 24px; }

.status-section {
  display: flex; align-items: center; gap: 8px; margin-bottom: 24px;
  font-size: 14px; color: #344767;
}

.status-badge {
  padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase;
}
.status-paid { background: rgba(45, 206, 137, 0.1); color: #2dce89; }
.status-unpaid { background: rgba(245, 54, 92, 0.1); color: #f5365c; }
.status-probono { background: rgba(17, 205, 239, 0.1); color: #11cdef; }

.divider { border: 0; border-top: 1px solid #e9ecef; margin: 0 0 24px 0; }

.form-group { margin-bottom: 16px; }
.form-label { display: block; margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #344767; }

.amount-input-group { position: relative; }
.amount-input-group .currency {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  color: #8392ab; font-weight: 600;
}

.form-control {
  width: 100%; padding: 10px 12px; border: 1px solid #e9ecef; border-radius: 8px;
  font-size: 14px; color: #344767; transition: all 0.2s;
}
.form-control:focus { border-color: #5e72e4; outline: none; box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1); }
.form-control:disabled { background: #f8f9fa; cursor: not-allowed; }

.checkbox-group { margin-top: 20px; }
.checkbox-label { display: flex; align-items: center; gap: 10px; cursor: pointer; color: #344767; font-weight: 500; }
.checkbox-label input[type="checkbox"] { width: 18px; height: 18px; accent-color: #5e72e4; }

.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e9ecef;
  display: flex; justify-content: flex-end; gap: 12px;
  background: #f8f9fa; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px;
}

.btn-primary { padding: 10px 20px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 10px 20px; background: white; color: #344767; border: 1px solid #e9ecef; border-radius: 8px; font-weight: 600; cursor: pointer; }
</style>
