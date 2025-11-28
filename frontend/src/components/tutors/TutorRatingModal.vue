<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h3>⭐ Modifica Rating</h3>
          <button class="btn-close" @click="close">×</button>
        </div>

        <div class="modal-body">
          <p class="description">Seleziona il nuovo rating per questo tutor:</p>
          <div class="rating-selector">
            <TutorRating :rating="currentRating" :editable="true" @update="currentRating = $event" />
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn-secondary">Annulla</button>
          <button @click="save" class="btn-primary">Salva</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';
import TutorRating from './TutorRating.vue';

const props = defineProps({
  isOpen: Boolean,
  initialRating: Number
});

const emit = defineEmits(['close', 'save']);

const currentRating = ref(props.initialRating);

watch(() => props.isOpen, (val) => {
  if (val) currentRating.value = props.initialRating;
});

function close() {
  emit('close');
}

function save() {
  emit('save', currentRating.value);
  close();
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000; backdrop-filter: blur(4px);
}

.modal-container {
  background: white; border-radius: 12px; width: 90%; max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
}

.modal-header {
  padding: 20px; border-bottom: 1px solid #e9ecef;
  display: flex; justify-content: space-between; align-items: center;
}

.modal-header h3 { margin: 0; font-size: 18px; color: #344767; }

.btn-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #8392ab; }

.modal-body { padding: 24px; text-align: center; }

.description { margin-bottom: 16px; color: #525f7f; }

.rating-selector {
  display: flex; justify-content: center;
  transform: scale(1.5); margin: 10px 0;
}

.modal-footer {
  padding: 16px 24px; border-top: 1px solid #e9ecef;
  display: flex; justify-content: flex-end; gap: 12px;
  background: #f8f9fa; border-radius: 0 0 12px 12px;
}

.btn-primary { padding: 10px 20px; background: #5e72e4; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary { padding: 10px 20px; background: white; color: #344767; border: 1px solid #e9ecef; border-radius: 8px; font-weight: 600; cursor: pointer; }
</style>
