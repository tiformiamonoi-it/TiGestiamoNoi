import { defineStore } from 'pinia';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/tutors';

export const useTutorStore = defineStore('tutor', {
    state: () => ({
        tutors: [],
        stats: {
            activeTutors: 0,
            tutorsToPay: 0,
            tutorsToPay: 0,
            totalDue: 0,
        },
        currentTutor: null, // Dati dettaglio tutor corrente
        loading: false,
        error: null,
        pagination: {
            page: 1,
            limit: 50,
            total: 0,
        },
        // Filtri attivi
        filters: {
            search: '',
            stato: [],
            periodo: {
                tipo: 'mese',
                mese: new Date().getMonth() + 1,
                anno: new Date().getFullYear(),
            },
            conPagamentiSospesi: false,
        },
    }),

    actions: {
        async fetchTutors() {
            this.loading = true;
            this.error = null;
            try {
                const params = {
                    page: this.pagination.page,
                    limit: this.pagination.limit,
                    search: this.filters.search,
                    stato: this.filters.stato,
                    periodo: JSON.stringify(this.filters.periodo),
                    conPagamentiSospesi: this.filters.conPagamentiSospesi,
                };

                const response = await axios.get(API_URL, { params });
                this.tutors = response.data.data;
                this.pagination.total = response.data.total;
            } catch (err) {
                this.error = err.response?.data?.error || 'Errore caricamento tutor';
                console.error(err);
            } finally {
                this.loading = false;
            }
        },

        async fetchStats() {
            try {
                const params = {
                    periodo: JSON.stringify(this.filters.periodo),
                };
                const response = await axios.get(`${API_URL}/stats`, { params });
                this.stats = response.data;
            } catch (err) {
                console.error('Errore caricamento statistiche:', err);
            }
        },

        async fetchTutorDetail(id) {
            this.loading = true;
            this.error = null;
            this.currentTutor = null;
            try {
                const response = await axios.get(`${API_URL}/${id}`);
                this.currentTutor = response.data;
                return response.data;
            } catch (err) {
                this.error = err.response?.data?.error || 'Errore caricamento dettaglio tutor';
                console.error(err);
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateTutor(id, data) {
            try {
                await axios.put(`${API_URL}/${id}`, data);
                // Aggiorna stato locale se necessario o ricarica
                await this.fetchTutorDetail(id);
            } catch (err) {
                console.error('Errore aggiornamento tutor:', err);
                throw err;
            }
        },

        async payTutors(pagamenti, dataPagamento, metodoPagamento, note) {
            try {
                await axios.post(`${API_URL}/pay`, {
                    pagamenti,
                    dataPagamento,
                    metodoPagamento,
                    note,
                });
                // Ricarica dati dopo pagamento
                await this.fetchTutors();
                await this.fetchStats();
                return true;
            } catch (err) {
                this.error = err.response?.data?.error || 'Errore registrazione pagamento';
                throw err;
            }
        },

        async updatePayment(payment) {
            try {
                await axios.put(`${API_URL}/payments/${payment.id}`, {
                    importo: payment.importo,
                    note: payment.note,
                    proBono: payment.proBono,
                    status: payment.status
                });
                await this.fetchTutorDetail(this.currentTutor.tutor.id);
            } catch (err) {
                console.error('Errore aggiornamento pagamento:', err);
                throw err;
            }
        },

        async deletePayment(id) {
            try {
                await axios.delete(`${API_URL}/payments/${id}`);
                await this.fetchTutorDetail(this.currentTutor.tutor.id);
            } catch (err) {
                console.error('Errore eliminazione pagamento:', err);
                throw err;
            }
        },

        setFilters(newFilters) {
            this.filters = { ...this.filters, ...newFilters };
            this.pagination.page = 1; // Reset pagina
            this.fetchTutors();
            this.fetchStats();
        },

        setPage(page) {
            this.pagination.page = page;
            this.fetchTutors();
        },
    },
});
