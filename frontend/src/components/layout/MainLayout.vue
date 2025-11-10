<!-- frontend/src/components/layout/MainLayout.vue -->
<template>
  <div>
    <AppSidebar />
    <main class="main-content">
      <router-view /> <!-- ✅ CAMBIATO da <slot /> a <router-view /> -->
    </main>
  </div>
</template>

<script setup>
import AppSidebar from './AppSidebar.vue';
</script>

<style scoped>
.main-content {
  margin-left: 260px;
  min-height: 100vh;
  background: #f0f2f5;
  padding: 24px;
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 16px;
  }
}
</style>
