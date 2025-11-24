// frontend/src/services/api.js
// Configurazione Axios per chiamate API

import axios from 'axios';

// Base URL del backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Crea istanza Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere token JWT alle richieste
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestione errori globali
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token scaduto o non valido - logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ============================================
// AUTH API
// ============================================

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// ============================================
// STUDENTS API
// ============================================

export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// ============================================
// PACKAGES API
// ============================================

export const packagesAPI = {
  getAll: (params) => api.get('/packages', { params }),
  getById: (id) => api.get(`/packages/${id}`),
  create: (data) => api.post('/packages', data),
  update: (id, data) => api.put(`/packages/${id}`, data),
  delete: (id) => api.delete(`/packages/${id}`),
  updateStates: (id, stati) => api.patch(`/packages/${id}/states`, { stati }),
};

// ============================================
// STANDARD PACKAGES API
// ============================================

// ========================================
// STANDARD PACKAGES API
// ========================================

export const standardPackagesAPI = {
  getAll: () => api.get('/standard-packages'),
  getById: (id) => api.get(`/standard-packages/${id}`),
  create: (data) => api.post('/standard-packages', data),
  update: (id, data) => api.put(`/standard-packages/${id}`, data),
  delete: (id) => api.delete(`/standard-packages/${id}`),
};



// ============================================
// PAYMENTS API
// ============================================

export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  delete: (id) => api.delete(`/payments/${id}`),
  
};

// ============================================
// CONFIG API
// ============================================

export const configAPI = {
  getAll: (params) => api.get('/config', { params }),
  getByKey: (key) => api.get(`/config/${key}`),
  update: (key, value) => api.put(`/config/${key}`, { value }),
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  getStats: (periodoTutor = 'settimana', periodoFinanze = 'mese_corrente') => {
    const url = `/dashboard/stats?periodoTutor=${periodoTutor}&periodoFinanze=${periodoFinanze}`;
    console.log('🌐 API getStats - URL completa:', url);
    return api.get(url);
  },
};

// ========================================
// LESSONS API
// ========================================

export const lessonsAPI = {
  // Lista lezioni
  getAll: (params) => api.get('/lessons', { params }),
  
  // Singola lezione
  getById: (id) => api.get(`/lessons/${id}`),
  
  // Crea lezione
  create: (data) => api.post('/lessons', data),
  
  // Aggiorna lezione
  update: (id, data) => api.put(`/lessons/${id}`, data),
  
  // Elimina lezione
  delete: (id) => api.delete(`/lessons/${id}`),

  deleteBulkByTutorDate: (tutorId, date) => api.delete(`/lessons/bulk/by-tutor-date?tutorId=${tutorId}&data=${date}`),
};

// ========================================
// CALENDAR API
// ========================================

export const calendarAPI = {
  // Giorni del mese
  getGiorni: (params) => api.get('/lessons/calendar/giorni', { params }),
  
  // Alunni disponibili
  getAlunniDisponibili: (params) => api.get('/lessons/calendar/alunni-disponibili', { params }),
};


// ========================================
// TIMESLOTS API
// ========================================

export const timeslotsAPI = {
  // Lista slot orari
  getAll: (params) => api.get('/timeslots', { params }),
  
  // Crea slot
  create: (data) => api.post('/timeslots', data),
  
  // Attiva/disattiva
  toggle: (id, attivo) => api.patch(`/timeslots/${id}`, { attivo }),
};

// ========================================
// TUTORS API
// ========================================

export const tutorsAPI = {
  // Lista tutor attivi
  getAll: (params) => api.get('/tutors', { params }),
};
