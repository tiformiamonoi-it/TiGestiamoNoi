// frontend/src/router/index.js
// Configurazione Vue Router

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

// Layout esistente
import MainLayout from '@/components/layout/MainLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========================================
    // ROUTE PUBBLICA (SENZA LAYOUT)
    // ========================================
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { requiresGuest: true },
    },

    // ========================================
    // ROUTE AUTENTICATE (CON LAYOUT + SIDEBAR)
    // ========================================
    {
      path: '/',
      component: MainLayout, // ✅ Usa il layout esistente
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'students',
          name: 'students',
          component: () => import('@/views/students/StudentsListView.vue'),
        },
        {
          path: 'students/:id',
          name: 'student-detail',
          component: () => import('@/views/students/StudentDetailView.vue'),
        },
        {
          path: 'packages',
          name: 'packages',
          component: () => import('@/views/packages/PackagesListView.vue'),
        },
        {
          path: 'lessons',
          name: 'lessons',
          component: () => import('@/views/lessons/LessonsListView.vue'),
        },
        {
          path: 'calendario',
          name: 'calendario',
          component: () => import('@/views/CalendarView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/settings/SettingsView.vue'),
          meta: { requiresAdmin: true },
        },
      ],
    },
  ],
});

// Navigation guard per protezione routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Route richiede autenticazione
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login');
  }

  // Route richiede guest (non autenticato)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next('/dashboard');
  }

  // Route richiede admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/dashboard');
  }

  next();
});

export default router;
