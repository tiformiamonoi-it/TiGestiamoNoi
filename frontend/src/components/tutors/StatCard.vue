<template>
  <div :class="['stat-card', colorClass]">
    <div class="stat-title">{{ title }}</div>
    <div class="stat-value">{{ value }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  title: String,
  value: [Number, String],
  type: {
    type: String,
    default: 'default', // default, warning, error
  },
});

const colorClass = computed(() => {
  switch (props.type) {
    case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'error': return 'bg-red-50 border-red-200 text-red-800';
    default: return 'bg-white border-gray-200 text-gray-800';
  }
});
</script>

<style scoped>
.stat-card {
  @apply p-4 rounded-lg border shadow-sm flex flex-col items-center justify-center min-w-[150px];
}
.stat-title {
  @apply text-sm font-medium uppercase tracking-wider opacity-70 mb-1;
}
.stat-value {
  @apply text-3xl font-bold;
}
</style>
