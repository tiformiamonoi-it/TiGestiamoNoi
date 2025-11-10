// frontend/src/stores/auth.js
// Store Pinia per gestione autenticazione

import { defineStore } from 'pinia';
import { authAPI } from '@/services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('auth_token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN',
    isTutor: (state) => state.user?.role === 'TUTOR',
    fullName: (state) => state.user ? `${state.user.firstName} ${state.user.lastName}` : '',
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await authAPI.login(credentials);
        const { token, user } = response.data;

        // Salva in localStorage
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));

        // Aggiorna state
        this.token = token;
        this.user = user;

        return true;
      } catch (error) {
        this.error = error.response?.data?.error || 'Errore durante il login';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      if (!this.token) return;

      try {
        const response = await authAPI.getCurrentUser();
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        console.error('Errore fetch user:', error);
        this.logout();
      }
    },

    logout() {
      // Pulisci localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Reset state
      this.token = null;
      this.user = null;
      this.error = null;
    },
  },
});
