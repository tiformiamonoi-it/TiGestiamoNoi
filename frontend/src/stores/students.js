// frontend/src/stores/students.js
import { defineStore } from 'pinia';
import { studentsAPI } from '@/services/api';

export const useStudentsStore = defineStore('students', {
  state: () => ({
    students: [],
    currentStudent: null,
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      pages: 0,
    },
  }),

  getters: {
    activeStudents: (state) => state.students.filter(s => s.active),
  },

  actions: {
    async fetchStudents(params = {}) {
      this.loading = true;
      this.error = null;

      try {
        const response = await studentsAPI.getAll(params);
        this.students = response.data.students;
        this.pagination = response.data.pagination;
      } catch (error) {
        this.error = error.response?.data?.error || 'Errore caricamento studenti';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchStudentById(id) {
      this.loading = true;
      this.error = null;

      try {
        const response = await studentsAPI.getById(id);
        this.currentStudent = response.data.student;
      } catch (error) {
        this.error = error.response?.data?.error || 'Errore caricamento studente';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createStudent(data) {
      this.loading = true;
      this.error = null;

      try {
        const response = await studentsAPI.create(data);
        this.students.unshift(response.data.student);
        return response.data.student;
      } catch (error) {
        this.error = error.response?.data?.error || 'Errore creazione studente';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateStudent(id, data) {
      this.loading = true;
      this.error = null;

      try {
        const response = await studentsAPI.update(id, data);
        const index = this.students.findIndex(s => s.id === id);
        if (index !== -1) {
          this.students[index] = response.data.student;
        }
        return response.data.student;
      } catch (error) {
        this.error = error.response?.data?.error || 'Errore aggiornamento studente';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteStudent(id) {
      this.loading = true;
      this.error = null;

      try {
        await studentsAPI.delete(id);
        this.students = this.students.filter(s => s.id !== id);
      } catch (error) {
        this.error = error.response?.data?.error || 'Errore eliminazione studente';
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
});
