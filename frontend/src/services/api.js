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
    // Gestisci 401 (non autenticato)
    // Per 403, distingui tra errori di autorizzazione business (hanno error message) 
    // e token scaduto/non valido (non hanno messaggio specifico)
    if (error.response?.status === 401) {
      // 401 = sempre logout
      if (window.location.pathname !== '/login') {
        console.warn('🔐 Sessione scaduta - logout automatico');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // 403 potrebbe essere:
      // - Token scaduto (TokenExpiredError) -> logout
      // - Errore di autorizzazione business logic -> propaga l'errore
      const errorMessage = error.response?.data?.error;

      // Se c'è un messaggio di errore specifico dal backend, è un errore di business logic
      // Non fare logout, lascia che il frontend gestisca l'errore
      if (errorMessage && typeof errorMessage === 'string') {
        console.warn('⛔ Errore autorizzazione:', errorMessage);
        // Non fare logout, propaga l'errore normalmente
      } else {
        // Nessun messaggio specifico = probabilmente token scaduto
        if (window.location.pathname !== '/login') {
          console.warn('🔐 Token non valido - logout automatico');
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
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
  // User management
  getUsers: () => api.get('/auth/users'),
  createUser: (data) => api.post('/auth/users', data),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  resetPassword: (id, data) => api.post(`/auth/users/${id}/reset-password`, data),
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

  // Check duplicati
  checkDuplicate: (firstName, lastName) =>
    api.get('/students/check-duplicate', { params: { firstName, lastName } }),

  // Referral
  searchForReferral: (query, excludeId) =>
    api.get('/students/search-for-referral', { params: { query, excludeId } }),
  addReferral: (studentId, referrerId) =>
    api.post(`/students/${studentId}/referrals`, { referrerId }),
  removeReferral: (studentId, referrerId) =>
    api.delete(`/students/${studentId}/referrals/${referrerId}`),

  // Hard Delete
  getDeleteInfo: (id) => api.get(`/students/${id}/delete-info`),
  hardDelete: (id) => api.delete(`/students/${id}/hard-delete`),

  // Annual Payments
  getAnnualPayments: (year) => api.get('/students/annual-payments', { params: { year } }),
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
  create: (data) => api.post('/config', data),
  update: (key, data) => api.put(`/config/${key}`, data),
  delete: (key) => api.delete(`/config/${key}`),
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

  // Verifica duplicato studenti nello slot
  checkDuplicate: (tutorId, date, timeSlotId, studentIds = null) => {
    const params = { tutorId, date, timeSlotId };
    if (studentIds) params.studentIds = studentIds;
    return api.get('/lessons/check-duplicate', { params });
  },
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

  // Elimina slot
  delete: (id) => api.delete(`/timeslots/${id}`),
};

// ========================================
// TUTORS API
// ========================================

export const tutorsAPI = {
  // Lista tutor attivi
  getAll: (params) => api.get('/tutors', { params }),
};

// ========================================
// ACCOUNTING API
// ========================================

export const accountingAPI = {
  // Lista movimenti
  getAll: (params) => api.get('/accounting', { params }),

  // Statistiche panoramica
  getStats: (params) => api.get('/accounting/stats', { params }),

  // Categorie disponibili
  getCategories: () => api.get('/accounting/categories'),

  // Crea movimento manuale
  create: (data) => api.post('/accounting', data),

  // Modifica movimento
  update: (id, data) => api.put(`/accounting/${id}`, data),

  // Elimina movimento
  delete: (id) => api.delete(`/accounting/${id}`),
};

// ========================================
// BOOKING API (Pubblico)
// ========================================

export const bookingAPI = {
  // Crea prenotazione (pubblico)
  create: (data) => api.post('/bookings/public', data),

  // Lista materie (pubblico)
  getMaterie: () => api.get('/bookings/public/materie'),

  // Verifica duplicato (pubblico)
  checkDuplicate: (data) => api.post('/bookings/public/check-duplicate', data),

  // Invia comunicazione (pubblico)
  sendCommunication: (data) => api.post('/bookings/public/communication', data),

  // Verifica studente iscritto (pubblico)
  verifyStudent: (data) => api.post('/bookings/public/verify-student', data),

  // Admin: lista prenotazioni
  getAll: (params) => api.get('/bookings', { params }),

  // Admin: aggiorna stato
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),

  // Admin: elimina
  delete: (id) => api.delete(`/bookings/${id}`),
};

// ========================================
// AVAILABILITY API (Pubblico Tutor)
// ========================================

export const availabilityAPI = {
  // Verifica telefono tutor (pubblico)
  checkPhone: (phone) => api.post('/availability/public/check', { phone }),

  // Ottieni disponibilità tutor (pubblico)
  get: (phone) => api.post('/availability/public/get', { phone }),

  // Salva disponibilità (pubblico) - data: array di { date, notes }
  save: (phone, data) => api.post('/availability/public/save', { phone, data }),

  // Admin: lista disponibilità
  getAll: (params) => api.get('/availability', { params }),

  // Admin: dati matching per data
  getMatching: (date) => api.get(`/availability/matching/${date}`),

  // Admin: assegna prenotazione a tutor/slot
  assign: (bookingId, tutorId, slot) => api.post('/availability/assign', { bookingId, tutorId, slot }),
};

// ==========================================
// Closures API (Chiusure)
// ==========================================

export const closuresAPI = {
  // Admin: lista chiusure future
  getAll: () => api.get('/closures/all'),

  // Admin: aggiungi chiusura
  add: (date, description) => api.post('/closures', { date, description }),

  // Admin: rimuovi chiusura
  delete: (id) => api.delete(`/closures/${id}`),

  // Pubblico: verifica se data è chiusura
  check: (date) => api.get(`/closures/check/${date}`),
};
