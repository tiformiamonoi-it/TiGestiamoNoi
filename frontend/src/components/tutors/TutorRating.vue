<template>
  <div class="tutor-rating">
    <div class="stars">
      <span 
        v-for="n in 5" 
        :key="n"
        :class="['star', { filled: n <= rating, editable: editable }]"
        @click="setRating(n)"
      >
        {{ n <= rating ? '★' : '☆' }}
      </span>
    </div>
    <span class="rating-number">({{ rating.toFixed(1) }})</span>
  </div>
</template>

<script setup>
const props = defineProps({
  rating: {
    type: Number,
    default: 0
  },
  editable: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update']);

function setRating(n) {
  if (props.editable) {
    emit('update', n);
  }
}
</script>

<style scoped>
.tutor-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 20px;
  color: #e9ecef; /* Empty star color */
  transition: color 0.2s;
}

.star.filled {
  color: #fb6340; /* Orange/Gold for filled stars */
}

.star.editable {
  cursor: pointer;
}

.star.editable:hover {
  transform: scale(1.1);
}

.rating-number {
  font-size: 14px;
  font-weight: 600;
  color: #344767;
}
</style>
