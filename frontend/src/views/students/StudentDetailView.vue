<template>
  <div class="student-detail-page">
    <!-- Loading -->
    <div v-if="loading" class="loading-container">
      <div class="loader"></div>
      <p>Caricamento dettagli studente...</p>
    </div>

    <!-- Contenuto -->
    <template v-else-if="student">
      <!-- HEADER COMPLETO -->
      <div class="header-section">
        <!-- Breadcrumb + Menu Contestuale -->
        <div class="header-top">
          <button @click="goBack" class="btn-back">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Torna alla lista
          </button>

          <div class="menu-azioni">
            <button @click="toggleMenu" class="btn-menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="19" cy="12" r="1"></circle>
                <circle cx="5" cy="12" r="1"></circle>
              </svg>
            </button>
            <div v-if="showMenu" class="dropdown-menu">
              <button @click="exportAlunno" class="menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Export
              </button>
              <button @click="stampaScheda" class="menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Stampa Scheda
              </button>
              
              <!-- Bottone condizionale Attiva/Disattiva -->
              <button v-if="student.active" @click="disattivaAlunno" class="menu-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="6" y="4" width="12" height="16" rx="1"></rect>
                  <rect x="9" y="9" width="6" height="6"></rect>
                </svg>
                Disattiva Alunno
              </button>
              <button v-else @click="attivaAlunno" class="menu-item success">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Attiva Alunno
              </button>

              <button v-if="isAdmin" @click="eliminaAlunno" class="menu-item danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Elimina Alunno
              </button>
            </div>
          </div>
        </div>

        <!-- Nome + Badge Stato -->
        <div class="header-main">
          <div>
            <h1 class="student-name">{{ student.firstName }} {{ student.lastName }}</h1>
            <div v-if="student.studentPhone" class="student-phone">
              <a :href="`tel:${student.studentPhone}`">📱 {{ student.studentPhone }}</a>
            </div>
          </div>
          <div class="stati-badges">
            <span v-if="student.active" class="badge active">✅ Attivo</span>
            <span v-else class="badge inactive">❌ Inattivo</span>
          </div>
        </div>

        <!-- Info Scuola -->
        <p class="info-scuola">
          <span v-if="student.scuola">📚 {{ student.scuola }}</span>
          <span v-if="student.classe">📖 {{ student.classe }}</span>
        </p>

        <!-- Info Genitore -->
        <div v-if="student.parentName" class="info-genitore">
          <span>👤 {{ student.parentName }}</span>
          <a v-if="student.parentPhone" :href="`tel:${student.parentPhone}`" class="contact-link">
            📱 {{ student.parentPhone }}
          </a>
          <a v-if="student.parentEmail" :href="`mailto:${student.parentEmail}`" class="contact-link">
            ✉️ {{ student.parentEmail }}
          </a>
        </div>

        <!-- Azioni Rapide -->
        <div class="azioni-rapide">
          <button 
            @click="openManagePackages" 
            class="btn-action primary"
            :disabled="!student.active"
            :class="{ 'btn-disabled': !student.active }"
          >
            📦 Gestisci Pacchetti
          </button>
          
          <button 
            @click="openAddLesson" 
            class="btn-action primary"
            :disabled="!student.active"
            :class="{ 'btn-disabled': !student.active }"
          >
            ➕ Aggiungi a Lezione
          </button>
        </div>
      </div>

      <!-- ALERT ALUNNO DISATTIVATO -->
      <div v-if="!student.active" class="alert alert-warning">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Alunno Disattivato</div>
          <div class="alert-description">
            Non è possibile aggiungere nuovi pacchetti o lezioni a questo alunno fino alla riattivazione.
          </div>
        </div>
      </div>

      <!-- CARD RIEPILOGO -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">📦</div>
          <div class="card-content">
            <div class="card-label">Pacchetto Attivo</div>
            <div class="card-value">{{ pacchettoAttivo?.nome || 'Nessuno' }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">⏰</div>
          <div class="card-content">
            <div class="card-label">Ore/Giorni Residui</div>
            <div class="card-value">{{ residuoText }}</div>
          </div>
        </div>

        <div class="summary-card">
          <div class="card-icon">💰</div>
          <div class="card-content">
            <div class="card-label">Da Pagare</div>
            <div class="card-value">€{{ formatCurrency(pacchettoAttivo?.importoResiduo || 0) }}</div>
          </div>
        </div>
      </div>

      <!-- TABS NAVIGATION -->
      <div class="tabs-container">
        <div class="tabs">
          <button
            :class="['tab', { active: activeTab === 'anagrafica' }]"
            @click="activeTab = 'anagrafica'"
          >
            👤 Anagrafica
          </button>
          <button
            :class="['tab', { active: activeTab === 'pacchetto' }]"
            @click="activeTab = 'pacchetto'"
          >
            📦 Pacchetto Attuale
          </button>
          <button
            :class="['tab', { active: activeTab === 'storico' }]"
            @click="activeTab = 'storico'"
          >
            📚 Storico
          </button>
        </div>

        <!-- TAB CONTENT -->
        <div class="tab-content">
          <!-- TAB 1: ANAGRAFICA -->
          <div v-if="activeTab === 'anagrafica'" class="anagrafica-tab">
            <div class="tab-header">
              <h3>Dati Personali</h3>
              <button v-if="!editingAnagrafica" @click="editingAnagrafica = true" class="btn-edit">
                ✏️ Modifica
              </button>
            </div>

            <div class="anagrafica-form">
              <!-- Colonna Alunno -->
              <div class="form-column">
                <h4>👤 Dati Alunno</h4>
                <div class="form-group">
                  <label>Nome</label>
                  <input v-model="anagraficaForm.firstName" type="text" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Cognome</label>
                  <input v-model="anagraficaForm.lastName" type="text" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Telefono Alunno</label>
                  <input v-model="anagraficaForm.studentPhone" type="tel" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Email Alunno</label>
                  <input v-model="anagraficaForm.studentEmail" type="email" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Scuola</label>
                  <input v-model="anagraficaForm.scuola" type="text" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Classe</label>
                  <input v-model="anagraficaForm.classe" type="text" :disabled="!editingAnagrafica" />
                </div>
              </div>

              <!-- Colonna Genitore -->
              <div class="form-column">
                <h4>👨‍👩‍👦 Dati Genitore</h4>
                <div class="form-group">
                  <label>Nome Genitore</label>
                  <input v-model="anagraficaForm.parentName" type="text" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Email Genitore</label>
                  <input v-model="anagraficaForm.parentEmail" type="email" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Telefono Genitore</label>
                  <input v-model="anagraficaForm.parentPhone" type="tel" :disabled="!editingAnagrafica" />
                </div>
                <div class="form-group">
                  <label>Indirizzo</label>
                  <input v-model="anagraficaForm.parentIndirizzo" type="text" :disabled="!editingAnagrafica" />
                </div>
              </div>
            </div>

            <!-- Sezione Extra -->
            <div class="extra-section">
              <div class="form-group">
                <label>Referral - Come ci ha conosciuto?</label>
                <input v-model="anagraficaForm.referral" type="text" placeholder="Es: Passaparola - amico Giulia" :disabled="!editingAnagrafica" />
              </div>
              <div class="form-group">
                <label>Bisogni Speciali / BES</label>
                <input v-model="anagraficaForm.bisogniSpeciali" type="text" placeholder="Es: DSA - discalculia" :disabled="!editingAnagrafica" />
              </div>
              <div v-if="isAdmin" class="form-group">
                <label>Note Interne (solo Admin)</label>
                <textarea v-model="anagraficaForm.note" :disabled="!editingAnagrafica" rows="3"></textarea>
              </div>
            </div>

            <!-- Pulsanti Azione -->
            <div v-if="editingAnagrafica" class="form-actions">
              <button @click="cancelEditAnagrafica" class="btn-secondary">Annulla</button>
              <button @click="salvaAnagrafica" class="btn-primary">Salva Modifiche</button>
            </div>
          </div>

          <!-- TAB 2: PACCHETTO ATTUALE -->
          <!-- TAB 2: PACCHETTO ATTUALE (Advanced - stile ManagePackagesModal) -->
<!-- TAB 2: PACCHETTO ATTUALE -->
<div v-if="activeTab === 'pacchetto'" class="pacchetto-tab">
  
  <!-- Bottone Crea Nuovo Pacchetto (sempre visibile) -->
  <div class="tab-header-actions">
    <button 
      @click="openCreatePackage" 
      class="btn-create-package"
      :disabled="!student.active"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Crea Nuovo Pacchetto
    </button>
  </div>

  <!-- Empty State - Nessun Pacchetto Attivo -->
  <div v-if="pacchettiAttivi.length === 0" class="empty-state-packages">
    <div class="empty-icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      </svg>
    </div>
    <h3>Nessun Pacchetto Attivo</h3>
    <p>Crea un nuovo pacchetto per iniziare a registrare lezioni per questo studente.</p>
    <button 
      @click="openCreatePackage" 
      class="btn-empty-action"
      :disabled="!student.active"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
      </svg>
      Crea Primo Pacchetto
    </button>
  </div>

  <!-- Lista Pacchetti Attivi -->
  <div v-else class="packages-list-active">
    <div 
      v-for="pkg in pacchettiAttivi" 
      :key="pkg.id" 
      class="package-card-advanced"
      :class="{ 'package-in-uso': isPacchettoInUso(pkg) }"
    >
      <!-- Badge Pacchetto In Uso -->
      <div v-if="isPacchettoInUso(pkg)" class="badge-in-uso">
        🎯 IN USO
      </div>

      <!-- Header Pacchetto -->
      <div class="package-header">
        <div class="package-info">
          <h4>{{ pkg.nome }}</h4>
          <div class="package-meta">
            <span class="package-type-badge">{{ pkg.tipo }}</span>
            <span v-if="pkg.dataInizio && pkg.dataScadenza" class="package-period">
              📅 {{ formatDate(pkg.dataInizio) }} - {{ formatDate(pkg.dataScadenza) }}
            </span>
          </div>
        </div>

        <!-- Stati Multipli -->
        <div class="package-stati">
          <span 
            v-for="stato in pkg.stati" 
            :key="stato"
            :class="['stato-badge', getStatoBadgeClass(stato)]"
          >
            {{ getStatoLabel(stato) }}
          </span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="package-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: getProgressPercent(pkg) + '%' }"
            :class="getProgressClass(pkg)"
          ></div>
        </div>
        <div class="progress-text">{{ getProgressText(pkg) }}</div>
      </div>

      <!-- Sezione Ore Perse + Ore Effettive (solo MENSILE ATTIVO) -->
      <div 
        v-if="pkg.tipo === 'MENSILE' && pkg.stati?.includes('ATTIVO') && getPackageLostHours(pkg) > 0" 
        class="package-hours-detail"
      >
        <div class="hours-detail-item lost">
          <span class="icon">⚠️</span>
          <div class="detail-content">
            <span class="label">Ore perse:</span>
            <span class="value">{{ getPackageLostHours(pkg).toFixed(1) }}h</span>
          </div>
          <span class="info-tooltip" title="Ore teoriche non utilizzate dei giorni consumati">ℹ️</span>
        </div>
        
        <div class="hours-detail-item effective">
          <span class="icon">✅</span>
          <div class="detail-content">
            <span class="label">Ore effettive rimanenti:</span>
            <span class="value">{{ getEffectiveRemainingHours(pkg).toFixed(1) }}h</span>
          </div>
          <span class="formula">
            ({{ parseFloat(pkg.oreResiduo || 0).toFixed(1) }}h - {{ getPackageLostHours(pkg).toFixed(1) }}h)
          </span>
        </div>
      </div>

      <!-- Dettagli Economici -->
      <div class="package-details">
        <!-- Costo Pacchetto -->
        <div class="detail-row">
          <span class="label">Costo pacchetto</span>
          <span class="value price-value">€{{ formatCurrency(pkg.prezzoTotale) }}</span>
        </div>

        <!-- Elenco Pagamenti -->
        <div class="detail-row payments-section">
          <span class="label">Pagamenti</span>
          <div class="payments-container">
            <div v-if="pkg.pagamenti && pkg.pagamenti.length > 0" class="payments-list">
              <div v-for="pag in pkg.pagamenti" :key="pag.id" class="payment-item">
                <span class="payment-label">{{ getPaymentTypeLabel(pag.tipoPagamento) }}</span>
                <span class="payment-amount">€{{ formatCurrency(pag.importo) }}</span>
                <span class="payment-method">{{ getPaymentMethodLabel(pag.metodoPagamento) }}</span>
                <span class="payment-date">{{ formatDate(pag.dataPagamento) }}</span>
                <span v-if="pag.richiedeFattura" class="invoice-icon" title="Richiede fattura">📄</span>
                
                <!-- Bottone Elimina -->
                <button 
                  @click.stop="eliminaPagamento(pag, pkg)" 
                  class="btn-delete-payment" 
                  title="Elimina pagamento"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
              <div class="payment-total">
                <strong>Pagato: €{{ formatCurrency(pkg.importoPagato) }}</strong>
              </div>
            </div>
            <div v-else class="no-payments">
              Nessun pagamento registrato
            </div>
          </div>
        </div>

        <!-- Stato Pagamento -->
        <div class="detail-row">
          <span class="label">Stato Pagamento</span>
          <span 
            v-if="parseFloat(pkg.importoResiduo || 0) === 0" 
            class="value status-paid"
          >
            ✅ Saldato
          </span>
          <span v-else class="value status-unpaid">
            ⚠️ Da saldare: €{{ formatCurrency(pkg.importoResiduo) }}
          </span>
        </div>

        <!-- Stato Fattura -->
        <div class="detail-row">
          <span class="label">Fattura</span>
          <span 
            class="value" 
            :class="getInvoiceStatusClass(pkg)"
          >
            {{ getInvoiceStatus(pkg) }}
          </span>
        </div>
      </div>

      <!-- Azioni Pacchetto -->
      <div class="package-actions">
        <!-- Paga (solo se non saldato) -->
        <button 
          v-if="parseFloat(pkg.importoResiduo || 0) > 0"
          @click="registraPagamento(pkg)" 
          class="btn-action btn-primary"
        >
          💳 Paga
        </button>

        <!-- Vedi Lezioni -->
        <button 
          @click="vediLezioniPacchetto(pkg)" 
          class="btn-action btn-outline"
        >
          📚 Vedi Lezioni
        </button>

        <!-- Modifica (disabilitato se saldato) -->
        <button 
          @click="modificaPacchetto(pkg)" 
          class="btn-action btn-icon"
          :disabled="isSaldato(pkg)"
          :title="isSaldato(pkg) ? 'Pacchetto saldato, non modificabile' : 'Modifica'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <!-- Elimina -->
        <button 
          @click="eliminaPacchetto(pkg)" 
          class="btn-action btn-icon btn-danger" 
          title="Elimina"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>



          <!-- TAB 3: STORICO (con stile ManagePackagesModal) -->
          <div v-if="activeTab === 'storico'" class="storico-tab">
            <div class="storico-tabs">
              <button
                :class="['storico-tab-btn', { active: storicoTab === 'pacchetti' }]"
                @click="storicoTab = 'pacchetti'"
              >
                📦 Storico Pacchetti
              </button>
              <button
                :class="['storico-tab-btn', { active: storicoTab === 'pagamenti' }]"
                @click="storicoTab = 'pagamenti'"
              >
                💰 Storico Pagamenti
              </button>
              <button
                :class="['storico-tab-btn', { active: storicoTab === 'lezioni' }]"
                @click="storicoTab = 'lezioni'"
              >
                📚 Storico Lezioni
              </button>
            </div>

            <!-- Sub-Tab: Storico Pacchetti -->
            <div v-if="storicoTab === 'pacchetti'" class="storico-content">
              <div v-if="student.pacchetti.length === 0" class="empty-state">
                <p>Nessun pacchetto trovato</p>
              </div>
              <div v-else class="packages-list-storico">
                <div v-for="pkg in student.pacchetti" :key="pkg.id" class="package-card-storico">
                  <div class="package-card-header">
                    <div class="package-info">
                      <h3>{{ pkg.nome }}</h3>
                      <span class="package-type-badge">{{ pkg.tipo }}</span>
                    </div>
                    <div class="package-stati">
                      <span 
                        v-for="stato in pkg.stati" 
                        :key="stato"
                        :class="['stato-badge', getStatoBadgeClass(stato)]"
                      >
                        {{ stato }}
                      </span>
                    </div>
                  </div>

                  <div class="package-card-body">
                    <div class="package-stats-grid">
                      <div class="stat-item">
                        <div class="stat-label">Tipo</div>
                        <div class="stat-value">{{ pkg.tipo }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">Periodo</div>
                        <div class="stat-value">
                          {{ formatDate(pkg.dataInizio) }} - {{ formatDate(pkg.dataScadenza) }}
                        </div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">{{ pkg.tipo === 'MENSILE' ? 'Giorni' : 'Ore' }}</div>
                        <div class="stat-value">
                          <span class="highlight">{{ pkg.tipo === 'MENSILE' ? pkg.giorniResiduo : pkg.oreResiduo }}</span>
                          / {{ pkg.tipo === 'MENSILE' ? pkg.giorniAcquistati : pkg.oreAcquistate }}
                        </div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">Prezzo</div>
                        <div class="stat-value">€{{ formatCurrency(pkg.prezzoTotale) }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">Pagato</div>
                        <div class="stat-value success">€{{ formatCurrency(pkg.importoPagato) }}</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-label">Residuo</div>
                        <div class="stat-value danger">€{{ formatCurrency(pkg.importoResiduo) }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sub-Tab: Storico Pagamenti -->
            <div v-if="storicoTab === 'pagamenti'" class="storico-content">
              <div v-if="allPayments.length === 0" class="empty-state">
                <p>Nessun pagamento trovato</p>
              </div>
              <div v-else class="payments-table">
                <div v-for="payment in allPayments" :key="payment.id" class="payment-row">
                  <div class="payment-date">{{ formatDate(payment.dataPagamento) }}</div>
                  <div class="payment-method">
                    <span class="badge">{{ payment.tipoPagamento }}</span>
                    <span class="badge">{{ payment.metodoPagamento }}</span>
                  </div>
                  <div class="payment-amount">€{{ formatCurrency(payment.importo) }}</div>
                  <div v-if="payment.richiedeFattura" class="payment-invoice">📄 Fattura</div>
                  <div v-if="isAdmin" class="payment-actions">
                    <button @click="eliminaPagamento(payment)" class="btn-delete">
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sub-Tab: Storico Lezioni -->
            <div v-if="storicoTab === 'lezioni'" class="storico-content">
              <div class="filter-section">
                <input v-model="lessonDateFilter" type="date" class="filter-input" />
              </div>
              <div v-if="filteredLessons.length === 0" class="empty-state">
                <p>Nessuna lezione trovata</p>
              </div>
              <div v-else class="lezioni-list">
                <div v-for="ls in filteredLessons.slice(0, 20)" :key="ls.id" class="lezione-item">
                  <div class="lezione-date">{{ formatDate(ls.lesson.data) }}</div>
                  <div class="lezione-details">
                    <span>{{ ls.lesson.timeSlot.oraInizio }}-{{ ls.lesson.timeSlot.oraFine }}</span>
                    <span>{{ getTipoLezione(ls) }}</span>
                  </div>
                  <div class="lezione-hours">{{ ls.oreScalate }}h</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Errore -->
    <div v-else class="error-container">
      <p>❌ Studente non trovato</p>
      <button @click="goBack" class="btn-primary">Torna alla lista</button>
    </div>

    <!-- Modali -->
    <CreateStudentModal
      v-if="showEditModal"
      :student="student"
      @close="showEditModal = false"
      @saved="handleStudentUpdated"
    />

    <EditPackageModal
      v-if="showEditPackageModal"
      :packageData="selectedPackage"
      @close="closeEditPackageModal"
      @updated="handlePackageUpdated"
    />

    <RegisterPaymentModal
        v-if="showRegisterPaymentModal"
        :packageData="selectedPackageForPayment"
        @close="closeRegisterPaymentModal"
        @saved="handlePaymentSaved"
      />

      <RenewPackageModal
        v-if="showRenewPackageModal"
        :packageData="selectedPackageForRenewal"
        :student="student"
        @close="closeRenewPackageModal"
        @renewed="handlePackageRenewed"
      />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { studentsAPI, paymentsAPI, packagesAPI } from '@/services/api';
import CreateStudentModal from '@/components/students/CreateStudentModal.vue';
import EditPackageModal from '@/components/students/EditPackageModal.vue';
import RegisterPaymentModal from '@/components/students/RegisterPaymentModal.vue';
import RenewPackageModal from '@/components/students/RenewPackageModal.vue';


const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const showEditPackageModal = ref(false);
const selectedPackage = ref(null);
const showRegisterPaymentModal = ref(false);
const selectedPackageForPayment = ref(null);
const showRenewPackageModal = ref(false);
const selectedPackageForRenewal = ref(null);



// ========================================
// STATE
// ========================================

const student = ref(null);
const loading = ref(false);
const activeTab = ref('anagrafica');
const storicoTab = ref('pacchetti');
const lessonDateFilter = ref('');
const showEditModal = ref(false);
const showMenu = ref(false);
const editingAnagrafica = ref(false);

// Form Anagrafica
const anagraficaForm = ref({
  firstName: '',
  lastName: '',
  scuola: '',
  classe: '',
  studentPhone: '',
  studentEmail: '',
  parentName: '',
  parentEmail: '',
  parentPhone: '',
  parentIndirizzo: '',
  referral: '',
  bisogniSpeciali: '',
  note: '',
});

// ========================================
// COMPUTED
// ========================================

const isAdmin = computed(() => authStore.user?.ruolo === 'ADMIN');

// Apri modale creazione nuovo pacchetto
const openCreatePackage = () => {
  if (!student.value.active) {
    alert('⚠️ Impossibile creare pacchetti per alunni disattivati');
    return;
  }
  
  // Usa il pacchetto più recente come riferimento (se esiste)
  const ultimoPacchetto = student.value.pacchetti?.length > 0 
    ? student.value.pacchetti[student.value.pacchetti.length - 1]
    : null;
  
  selectedPackageForRenewal.value = ultimoPacchetto;
  showRenewPackageModal.value = true;
};


// ✅ Pacchetto Attivo (primo ATTIVO con ore residue > 0, ordinato per dataInizio)
const pacchettoAttivo = computed(() => {
  if (!student.value?.pacchetti) return null;
  
  const pacchetti = student.value.pacchetti
    .filter(p => {
      const hasAttivoState = p.stati?.includes('ATTIVO');
      const hasResiduo = p.tipo === 'MENSILE' 
        ? p.giorniResiduo > 0 
        : p.oreResiduo > 0;
      return hasAttivoState && hasResiduo;
    })
    .sort((a, b) => new Date(a.dataInizio) - new Date(b.dataInizio));
  
  return pacchetti.length > 0 ? pacchetti[0] : null;
});

// Testo residuo
const residuoText = computed(() => {
  if (!pacchettoAttivo.value) return '-';

  if (pacchettoAttivo.value.tipo === 'MENSILE') {
    return `${pacchettoAttivo.value.giorniResiduo || 0} giorni`;
  } else {
    return `${pacchettoAttivo.value.oreResiduo || 0}h`;
  }
});

// Filtrate lezioni (tutte)
const filteredLessons = computed(() => {
  if (!student.value?.lessonStudents) return [];

  let lessons = student.value.lessonStudents;

  if (lessonDateFilter.value) {
    const filterDate = new Date(lessonDateFilter.value).toISOString().split('T')[0];
    lessons = lessons.filter(ls => {
      const lessonDate = new Date(ls.lesson.data).toISOString().split('T')[0];
      return lessonDate === filterDate;
    });
  }

  return lessons.sort((a, b) => new Date(b.lesson.data) - new Date(a.lesson.data));
});

// Tutti pagamenti
const allPayments = computed(() => {
  if (!student.value?.pacchetti) return [];

  const payments = [];
  student.value.pacchetti.forEach(pkg => {
    if (pkg.pagamenti) {
      payments.push(...pkg.pagamenti.map(p => ({
        ...p,
        packageId: pkg.id,
        packageNome: pkg.nome,
      })));
    }
  });

  return payments.sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));
});

// Tutti i pacchetti ATTIVI
const pacchettiAttivi = computed(() => {
  if (!student.value?.pacchetti) return [];
  
  return student.value.pacchetti
    .filter(p => p.stati?.includes('ATTIVO'))
    .sort((a, b) => new Date(a.dataInizio) - new Date(b.dataInizio));
});

// ========================================
// FUNCTIONS
// ========================================

// Carica studente
const loadStudent = async () => {
  loading.value = true;
  try {
    const response = await studentsAPI.getById(route.params.id);
    student.value = response.data.student;

    // Precompila form anagrafica
    if (student.value) {
      anagraficaForm.value = {
        firstName: student.value.firstName || '',
        lastName: student.value.lastName || '',
        scuola: student.value.scuola || '',
        classe: student.value.classe || '',
        studentPhone: student.value.studentPhone || '',
        studentEmail: student.value.studentEmail || '',
        parentName: student.value.parentName || '',
        parentEmail: student.value.parentEmail || '',
        parentPhone: student.value.parentPhone || '',
        parentIndirizzo: student.value.parentIndirizzo || '',
        referral: student.value.referral || '',
        bisogniSpeciali: student.value.bisogniSpeciali || '',
        note: student.value.note || '',
      };
    }
  } catch (error) {
    console.error('Errore caricamento studente:', error);
  } finally {
    loading.value = false;
  }
};

// Verifica se è il pacchetto in uso (più vecchio ATTIVO con ore > 0)
const isPacchettoInUso = (pkg) => {
  return pacchettoAttivo.value?.id === pkg.id;
};

// Calcola ore perse per pacchetto
const getPackageLostHours = (pkg) => {
  const isScaduto = pkg.stati?.includes('SCADUTO');
  const isEsaurito = pkg.stati?.includes('ESAURITO');

  if (isScaduto || isEsaurito) {
    return parseFloat(pkg.orePerse || 0);
  }

  if (pkg.tipo === 'MENSILE') {
    const giorniAcquistati = parseFloat(pkg.giorniAcquistati || 0);
    const giorniResidui = parseFloat(pkg.giorniResiduo || 0);
    const giorniUsati = giorniAcquistati - giorniResidui;
    const oreAcquistate = parseFloat(pkg.oreAcquistate || 0);
    const oreResiduo = parseFloat(pkg.oreResiduo || 0);
    const oreUsate = oreAcquistate - oreResiduo;
    const orarioGiornaliero = parseFloat(pkg.orarioGiornaliero || 3);

    const oreTeoriche = giorniUsati * orarioGiornaliero;
    const orePerse = oreTeoriche - oreUsate;

    return Math.max(0, orePerse);
  }

  return 0;
};

// Calcola ore effettive rimanenti
const getEffectiveRemainingHours = (pkg) => {
  const oreResiduo = parseFloat(pkg.oreResiduo || 0);
  const orePerse = getPackageLostHours(pkg);
  return Math.max(0, oreResiduo - orePerse);
};

// Progress bar
const getProgressPercent = (pkg) => {
  const totale = parseFloat(pkg.oreAcquistate || 0);
  const residui = parseFloat(pkg.oreResiduo || 0);
  if (residui <= 0 || totale === 0) return 0;
  return Math.min(Math.max((residui / totale) * 100, 0), 100);
};

const getProgressClass = (pkg) => {
  const residui = parseFloat(pkg.oreResiduo || 0);
  if (residui <= 0) return 'progress-danger';
  const percent = getProgressPercent(pkg);
  if (percent < 20) return 'progress-danger';
  if (percent < 50) return 'progress-warning';
  return 'progress-success';
};

const getProgressText = (pkg) => {
  const totale = parseFloat(pkg.oreAcquistate || 0);
  const residui = parseFloat(pkg.oreResiduo || 0);
  if (residui <= 0) {
    return `${Math.abs(residui).toFixed(1)}h oltre il limite`;
  }
  return `${residui.toFixed(1)} / ${totale.toFixed(1)} ore rimanenti`;
};

// Badge stati
const getStatoBadgeClass = (stato) => {
  const map = {
    'ATTIVO': 'stato-attivo',
    'SCADUTO': 'stato-scaduto',
    'ESAURITO': 'stato-esaurito',
    'IN_SCADENZA': 'stato-in-scadenza',
    'ORE_NEGATIVE': 'stato-ore-negative',
    'PAGATO': 'stato-pagato',
    'DA_PAGARE': 'stato-da-pagare',
  };
  return map[stato] || '';
};

const getStatoLabel = (stato) => {
  const labels = {
    'ATTIVO': 'Attivo',
    'SCADUTO': 'Scaduto',
    'ESAURITO': 'Esaurito',
    'IN_SCADENZA': 'In Scadenza',
    'ORE_NEGATIVE': 'Ore Negative',
    'PAGATO': 'Pagato',
    'DA_PAGARE': 'Da Pagare',
  };
  return labels[stato] || stato;
};

// Verifica se saldato
const isSaldato = (pkg) => {
  return parseFloat(pkg.importoResiduo || 0) === 0;
};

// Label pagamenti
const getPaymentTypeLabel = (tipo) => {
  const labels = {
    'ACCONTO': 'Acconto',
    'SALDO': 'Saldo',
    'RATA': 'Rata',
    'INTEGRAZIONE': 'Integrazione',
  };
  return labels[tipo] || tipo;
};

const getPaymentMethodLabel = (metodo) => {
  const labels = {
    'CONTANTI': 'Contanti',
    'BONIFICO': 'Bonifico',
    'POS': 'POS',
    'ASSEGNO': 'Assegno',
    'ALTRO': 'Altro',
  };
  return labels[metodo] || metodo;
};

// Stato fattura
const getInvoiceStatus = (pkg) => {
  const isSaldato = parseFloat(pkg.importoResiduo || 0) === 0;
  const pagamenti = pkg.pagamenti || [];

  if (pagamenti.length === 0) return '⏳ In attesa di pagamento';
  if (!isSaldato) return '⏳ In attesa di saldo';

  const tuttiContanti = pagamenti.every(p => p.metodoPagamento === 'CONTANTI');
  const nessunoRichiedeFattura = pagamenti.every(p => !p.richiedeFattura);
  const qualcunoRichiedeFattura = pagamenti.some(p => p.richiedeFattura);

  if (tuttiContanti && nessunoRichiedeFattura) return '✅ Emessa';
  if (qualcunoRichiedeFattura) return '📄 Da emettere';
  return '✅ Emessa';
};

const getInvoiceStatusClass = (pkg) => {
  const status = getInvoiceStatus(pkg);
  if (status.includes('Emessa')) return 'invoice-issued';
  if (status.includes('Da emettere')) return 'invoice-pending';
  return 'invoice-waiting';
};


const vediLezioniPacchetto = (pkg) => {
  // TODO: Apri lista lezioni filtrate per pacchetto
  alert(`Vedi lezioni per pacchetto: ${pkg.nome}`);
};

const modificaPacchetto = (pkg) => {
  if (isSaldato(pkg)) {
    alert('⚠️ Il pacchetto è saldato e non può essere modificato.');
    return;
  }
  
  selectedPackage.value = pkg;
  showEditPackageModal.value = true;
};

// ✅ Aggiungi closeEditPackageModal
const closeEditPackageModal = () => {
  showEditPackageModal.value = false;
  selectedPackage.value = null;
};

// ✅ Modifica handlePackageUpdated
const handlePackageUpdated = () => {
  loadStudent();
  showEditPackageModal.value = false;
  selectedPackage.value = null;
};

// ✅ Modifica registraPagamento (senza pkg inutilizzato)
const registraPagamento = (pkg) => {
  selectedPackageForPayment.value = pkg;
  showRegisterPaymentModal.value = true;
};
const closeRegisterPaymentModal = () => {
  showRegisterPaymentModal.value = false;
  selectedPackageForPayment.value = null;
};

const handlePaymentSaved = () => {
  loadStudent();
  showRegisterPaymentModal.value = false;
  selectedPackageForPayment.value = null;
};


const closeRenewPackageModal = () => {
  showRenewPackageModal.value = false;
  selectedPackageForRenewal.value = null;
};

const handlePackageRenewed = () => {
  loadStudent();
  showRenewPackageModal.value = false;
  selectedPackageForRenewal.value = null;
};


const eliminaPacchetto = async (pkg) => {
  const lessonCount = pkg._count?.lessonStudents || 0;
  const paymentCount = pkg.pagamenti?.length || 0;

  let message = `⚠️ ATTENZIONE: Stai per eliminare il pacchetto "${pkg.nome}".\n\n`;
  
  if (lessonCount > 0 || paymentCount > 0) {
    message += '🗑️ VERRANNO ELIMINATI ANCHE:\n';
    if (lessonCount > 0) message += `- ${lessonCount} lezioni associate\n`;
    if (paymentCount > 0) message += `- ${paymentCount} pagamenti registrati\n`;
    message += '\n⚠️ QUESTA AZIONE È IRREVERSIBILE!\n\n';
    message += 'Sei sicuro di voler procedere?';
  }

  if (!confirm(message)) return;

  if (lessonCount > 0 || paymentCount > 0) {
    const secondConfirm = prompt(
      'Per confermare l\'eliminazione, digita "ELIMINA".\nQuesto eliminerà definitivamente ' +
      (lessonCount > 0 ? `${lessonCount} lezioni` : '') +
      (paymentCount > 0 ? ` e ${paymentCount} pagamenti` : '')
    );
    
    if (secondConfirm !== 'ELIMINA') {
      alert('Eliminazione annullata');
      return;
    }
  }

  try {
    await packagesAPI.delete(pkg.id);
    alert('✅ Pacchetto eliminato con successo!');
    loadStudent();
  } catch (error) {
    console.error('Errore eliminazione pacchetto:', error);
    alert('❌ Errore durante l\'eliminazione del pacchetto');
  }
};

const eliminaPagamento = async (payment, pkg) => {
  if (!confirm(`Sei sicuro di voler eliminare il pagamento di €${formatCurrency(payment.importo)}?\n\nL'importo verrà ripristinato come residuo del pacchetto "${pkg.nome}".`)) return;

  try {
    await paymentsAPI.delete(payment.id);
    alert('✅ Pagamento eliminato con successo!');
    loadStudent();
  } catch (error) {
    console.error('Errore eliminazione pagamento:', error);
    if (error.response?.status === 400) {
      alert(error.response.data.error || 'Errore durante l\'eliminazione del pagamento');
    } else {
      alert('❌ Errore durante l\'eliminazione del pagamento');
    }
  }
};


// Torna indietro
const goBack = () => {
  router.push('/students');
};

// Menu contestuale
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

// Azioni Menu
const exportAlunno = () => {
  router.push(`/export?alunno=${student.value.id}`);
  showMenu.value = false;
};

const stampaScheda = () => {
  window.print();
  showMenu.value = false;
};

const disattivaAlunno = async () => {
  if (!confirm('Sei sicuro di voler disattivare questo alunno?')) return;

  try {
    await studentsAPI.update(student.value.id, {
      firstName: student.value.firstName,
      lastName: student.value.lastName,
      active: false,
    });
    alert('✅ Alunno disattivato');
    loadStudent();
    showMenu.value = false;
  } catch (error) {
    console.error('Errore disattivazione:', error);
    alert('❌ Errore durante la disattivazione');
  }
};

const attivaAlunno = async () => {
  if (!confirm('Sei sicuro di voler riattivare questo alunno?')) return;

  try {
    await studentsAPI.update(student.value.id, {
      firstName: student.value.firstName,
      lastName: student.value.lastName,
      active: true,
    });
    alert('✅ Alunno riattivato con successo');
    loadStudent();
    showMenu.value = false;
  } catch (error) {
    console.error('Errore attivazione:', error);
    alert('❌ Errore durante l\'attivazione');
  }
};

const eliminaAlunno = async () => {
  if (!confirm('Sei SICURO? Questa azione è irreversibile!')) return;
  if (!confirm('Ripeti conferma per eliminare definitivamente')) return;

  try {
    await studentsAPI.delete(student.value.id);
    alert('✅ Alunno eliminato');
    router.push('/students');
  } catch (error) {
    console.error('Errore eliminazione:', error);
    alert('❌ Errore durante l\'eliminazione');
  }
};

// Salva anagrafica
const salvaAnagrafica = async () => {
  try {
    const updateData = {
      firstName: anagraficaForm.value.firstName,
      lastName: anagraficaForm.value.lastName,
      classe: anagraficaForm.value.classe,
      scuola: anagraficaForm.value.scuola,
      studentPhone: anagraficaForm.value.studentPhone || null,
      studentEmail: anagraficaForm.value.studentEmail || null,
      parentName: anagraficaForm.value.parentName,
      parentEmail: anagraficaForm.value.parentEmail,
      parentPhone: anagraficaForm.value.parentPhone,
      parentIndirizzo: anagraficaForm.value.parentIndirizzo || null,
      referral: anagraficaForm.value.referral || null,
      bisogniSpeciali: anagraficaForm.value.bisogniSpeciali || null,
      note: anagraficaForm.value.note || null,
    };

    await studentsAPI.update(student.value.id, updateData);
    alert('✅ Anagrafica salvata');
    editingAnagrafica.value = false;
    loadStudent();
  } catch (error) {
    console.error('Errore salvataggio:', error);
    alert('❌ Errore durante il salvataggio');
  }
};

const cancelEditAnagrafica = () => {
  editingAnagrafica.value = false;
  // Ripristina valori originali
  if (student.value) {
    anagraficaForm.value = {
      firstName: student.value.firstName || '',
      lastName: student.value.lastName || '',
      scuola: student.value.scuola || '',
      classe: student.value.classe || '',
      studentPhone: student.value.studentPhone || '',
      studentEmail: student.value.studentEmail || '',
      parentName: student.value.parentName || '',
      parentEmail: student.value.parentEmail || '',
      parentPhone: student.value.parentPhone || '',
      parentIndirizzo: student.value.parentIndirizzo || '',
      referral: student.value.referral || '',
      bisogniSpeciali: student.value.bisogniSpeciali || '',
      note: student.value.note || '',
    };
  }
};

// ✅ Apri tab Storico invece del modale
const openManagePackages = () => {
  if (!student.value.active) {
    alert('⚠️ Impossibile gestire pacchetti per alunni disattivati');
    return;
  }
  activeTab.value = 'storico';
  storicoTab.value = 'pacchetti';
};

const openAddLesson = () => {
  if (!student.value.active) {
    alert('⚠️ Impossibile aggiungere lezioni per alunni disattivati');
    return;
  }
  alert('Funzionalità in sviluppo');
};

const handleStudentUpdated = () => {
  loadStudent();
  showEditModal.value = false;
};

// ✅ Elimina Pagamento (solo ADMIN)

// Ottieni tipo lezione
const getTipoLezione = (lessonStudent) => {
  const { lesson } = lessonStudent;
  const numStudenti = lesson.lessonStudents?.length || 1;

  if (numStudenti === 1) return 'SINGOLA';
  if (numStudenti <= 3) return 'GRUPPO';
  return 'MAXI';
};



// Formattazioni
const formatCurrency = (value) => {
  return parseFloat(value || 0).toFixed(2);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/*const getInitials = (student) => {
  return `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`;
};

// Modali
const openEditModal = () => {
  showEditModal.value = true;
};*/

// ========================================
// LIFECYCLE
// ========================================

onMounted(() => {
  loadStudent();
});
</script>

<style scoped>
/* ========================================
   LAYOUT PRINCIPALE
======================================== */
.student-detail-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

/* ========================================
   LOADING & ERROR STATES
======================================== */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #e9ecef;
  border-top-color: #5e72e4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-container p,
.error-container p {
  color: #6b7280;
  font-size: 16px;
  margin: 0;
}

/* ========================================
   HEADER SECTION
======================================== */
.header-section {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #f9fafb;
  border-color: #5e72e4;
  color: #5e72e4;
}

/* Menu Contestuale */
.menu-azioni {
  position: relative;
}

.btn-menu {
  padding: 8px 12px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-menu:hover {
  background: #e5e7eb;
  border-color: #5e72e4;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 40px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 100;
  min-width: 200px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  color: #374151;
  font-size: 14px;
  transition: all 0.2s;
}

.menu-item:hover {
  background: #f9fafb;
  color: #5e72e4;
}

.menu-item.success {
  color: #2dce89;
}

.menu-item.success:hover {
  background: rgba(45, 206, 137, 0.1);
}

.menu-item.danger {
  color: #f5365c;
}

.menu-item.danger:hover {
  background: rgba(245, 54, 92, 0.1);
}

/* Header Main */
.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.student-name {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
  color: #111827;
}

.student-phone {
  font-size: 14px;
  margin-top: 4px;
}

.student-phone a {
  color: #5e72e4;
  text-decoration: none;
  font-weight: 600;
}

.student-phone a:hover {
  text-decoration: underline;
}

.stati-badges {
  display: flex;
  gap: 8px;
}

.badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge.active {
  background: rgba(45, 206, 137, 0.15);
  color: #2dce89;
}

.badge.inactive {
  background: #e5e7eb;
  color: #6b7280;
}

/* Info Scuola */
.info-scuola {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  gap: 16px;
}

/* Info Genitore */
.info-genitore {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.contact-link {
  color: #5e72e4;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.contact-link:hover {
  color: #3b5bdb;
  text-decoration: underline;
}

/* Azioni Rapide */
.azioni-rapide {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.btn-action {
  padding: 12px 20px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action.primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-action.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed !important;
  pointer-events: none;
}

/* ========================================
   ALERTS SECTION
======================================== */
.alert {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border-left: 4px solid;
  margin-bottom: 24px;
}

.alert-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.alert-description {
  font-size: 14px;
  color: #6b7280;
}

.alert-warning {
  background: rgba(251, 191, 36, 0.1);
  border-left-color: #fbbf24;
}

/* ========================================
   SUMMARY CARDS
======================================== */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  background: #f9fafb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

/* ========================================
   TABS CONTAINER
======================================== */
.tabs-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 16px 16px 0 16px;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
  overflow-x: auto;
}

.tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-radius: 8px 8px 0 0;
  font-size: 15px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  color: #374151;
  background: rgba(94, 114, 228, 0.05);
}

.tab.active {
  background: white;
  color: #5e72e4;
}

.tab-content {
  padding: 24px;
  min-height: 500px;
}

/* ========================================
   TAB: ANAGRAFICA
======================================== */
.anagrafica-tab {
  max-width: 100%;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.tab-header h3 {
  margin: 0;
  font-size: 18px;
  color: #111827;
}

.btn-edit {
  padding: 8px 16px;
  background: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit:hover {
  background: #e5e7eb;
  border-color: #5e72e4;
  color: #5e72e4;
}

.anagrafica-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 32px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-column h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5e72e4;
  box-shadow: 0 0 0 3px rgba(94, 114, 228, 0.1);
}

.extra-section {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary,
.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

/* ========================================
   TAB PACCHETTO ATTUALE - ADVANCED
======================================== */
.pacchetto-tab {
  max-width: 100%;
}

/* Summary Box */
.summary-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  color: white;
}

.summary-box h4 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.summary-label {
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
}

.summary-value.lost {
  color: #fbbf24;
}

/* Packages List Active */
.packages-list-active {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Package Card Advanced */
.package-card-advanced {
  position: relative;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
}

.package-card-advanced:hover {
  border-color: #5e72e4;
  box-shadow: 0 8px 24px rgba(94, 114, 228, 0.15);
  transform: translateY(-2px);
}

/* Badge Pacchetto In Uso */
.package-card-advanced.package-in-uso {
  border-color: #5e72e4;
  border-width: 3px;
  background: linear-gradient(to bottom, rgba(94, 114, 228, 0.03), white);
}

.badge-in-uso {
  position: absolute;
  top: -12px;
  left: 20px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.4);
}

/* Package Header */
.package-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.package-info h4 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.package-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.package-type-badge {
  padding: 4px 12px;
  background: #5e72e4;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.package-period {
  font-size: 13px;
  color: #6b7280;
}

.package-stati {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.stato-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stato-attivo {
  background: rgba(45, 206, 137, 0.15);
  color: #2dce89;
}

.stato-scaduto {
  background: rgba(245, 54, 92, 0.15);
  color: #f5365c;
}

.stato-esaurito {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}

.stato-in-scadenza {
  background: rgba(251, 146, 60, 0.15);
  color: #fb923c;
}

.stato-ore-negative {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.stato-pagato {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
}

.stato-da-pagare {
  background: rgba(156, 163, 175, 0.15);
  color: #9ca3af;
}

/* Progress Bar */
.package-progress {
  margin-bottom: 20px;
}

.progress-bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 6px;
}

.progress-success {
  background: linear-gradient(90deg, #2dce89, #48bb78);
}

.progress-warning {
  background: linear-gradient(90deg, #fbbf24, #fb923c);
}

.progress-danger {
  background: linear-gradient(90deg, #f5365c, #ef4444);
}

.progress-text {
  font-size: 13px;
  color: #6b7280;
  text-align: center;
}

/* Package Hours Detail */
.package-hours-detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 20px;
  border-left: 4px solid #fbbf24;
}

.hours-detail-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hours-detail-item .icon {
  font-size: 20px;
}

.hours-detail-item .detail-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hours-detail-item .label {
  font-size: 14px;
  color: #6b7280;
}

.hours-detail-item .value {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.hours-detail-item.lost .value {
  color: #f5365c;
}

.hours-detail-item.effective .value {
  color: #2dce89;
}

.hours-detail-item .info-tooltip {
  font-size: 16px;
  color: #9ca3af;
  cursor: help;
}

.hours-detail-item .formula {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}

/* Package Details */
.package-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row .label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.detail-row .value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-align: right;
}

.price-value {
  font-size: 18px;
  color: #5e72e4;
}

.status-paid {
  color: #2dce89;
}

.status-unpaid {
  color: #f5365c;
}

.invoice-issued {
  color: #2dce89;
}

.invoice-pending {
  color: #fbbf24;
}

.invoice-waiting {
  color: #9ca3af;
}

/* Payments Section */
.payments-section {
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.payments-container {
  width: 100%;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.payment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
}

.payment-label {
  font-weight: 600;
  color: #374151;
  min-width: 80px;
}

.payment-amount {
  font-weight: 700;
  color: #2dce89;
  min-width: 80px;
}

.payment-method {
  color: #6b7280;
  font-size: 12px;
  flex: 1;
}

.invoice-icon {
  font-size: 16px;
  cursor: help;
}

.btn-delete-payment {
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #f5365c;
  border-radius: 6px;
  color: #f5365c;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete-payment:hover {
  background: #f5365c;
  color: white;
}

.payment-total {
  padding: 10px 12px;
  background: rgba(94, 114, 228, 0.1);
  border-radius: 8px;
  text-align: right;
  margin-top: 8px;
}

.payment-total strong {
  color: #5e72e4;
  font-size: 14px;
}

.no-payments {
  padding: 16px;
  text-align: center;
  color: #9ca3af;
  font-style: italic;
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

/* Package Actions */
.package-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 2px solid #f3f4f6;
}

.btn-action {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, #5e72e4, #825ee4);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.3);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #5e72e4;
  color: #5e72e4;
}

.btn-outline {
  background: white;
  color: #5e72e4;
  border: 2px solid #5e72e4;
}

.btn-outline:hover:not(:disabled) {
  background: #5e72e4;
  color: white;
}

.btn-icon {
  padding: 10px;
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-icon:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #5e72e4;
  color: #5e72e4;
}

.btn-danger {
  border-color: #f5365c;
  color: #f5365c;
}

.btn-danger:hover:not(:disabled) {
  background: #f5365c;
  color: white;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-state svg {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
}

/* ========================================
   RESPONSIVE
======================================== */
@media (max-width: 1200px) {
  .summary-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-stats {
    grid-template-columns: 1fr;
  }

  .package-header {
    flex-direction: column;
    gap: 16px;
  }

  .package-actions {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
    justify-content: center;
  }

  .payment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .hours-detail-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .hours-detail-item .detail-content {
    width: 100%;
  }
}


/* ========================================
   TAB: STORICO (stile ManagePackagesModal)
======================================== */
.storico-tab {
  max-width: 100%;
}

.storico-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
}

.storico-tab-btn {
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.storico-tab-btn:hover {
  color: #374151;
}

.storico-tab-btn.active {
  color: #5e72e4;
  border-bottom-color: #5e72e4;
}

.storico-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.packages-list-storico {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.package-card-storico {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.package-card-storico:hover {
  border-color: #5e72e4;
  box-shadow: 0 4px 12px rgba(94, 114, 228, 0.1);
}

/* Payments Table */
.payments-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.payment-row:hover {
  border-color: #5e72e4;
  background: white;
}

.payment-date {
  font-weight: 600;
  color: #111827;
  min-width: 100px;
}

.payment-method {
  display: flex;
  gap: 8px;
}

.payment-amount {
  font-weight: 700;
  font-size: 16px;
  color: #2dce89;
}

.payment-invoice {
  color: #5e72e4;
  font-size: 12px;
  font-weight: 600;
}

.payment-actions {
  display: flex;
  gap: 8px;
}

.btn-delete {
  padding: 6px 12px;
  background: #f5365c;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #dc2626;
}

/* Filter Input */
.filter-section {
  margin-bottom: 16px;
}

.filter-input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.filter-input:focus {
  outline: none;
  border-color: #5e72e4;
}

.lezioni-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lezione-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.lezione-item:hover {
  border-color: #5e72e4;
  background: white;
}

.lezione-date {
  font-weight: 600;
  color: #111827;
  min-width: 100px;
}

.lezione-details {
  flex: 1;
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #6b7280;
}

.lezione-hours {
  font-weight: 600;
  color: #5e72e4;
}

/* ========================================
   EMPTY STATE
======================================== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
}

/* ========================================
   RESPONSIVE
======================================== */
@media (max-width: 1200px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }

  .anagrafica-form {
    grid-template-columns: 1fr;
  }

  .package-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .student-detail-page {
    padding: 16px;
  }

  .header-section {
    padding: 16px;
  }

  .header-top {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .student-name {
    font-size: 24px;
  }

  .azioni-rapide {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  .tab-content {
    padding: 16px;
    min-height: 300px;
  }

  .package-stats-grid {
    grid-template-columns: 1fr;
  }

  .payment-row {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}

/* Payment Date */
.payment-date {
  font-size: 12px;
  color: #9ca3af;
  min-width: 90px;
}

/* Btn Delete Payment - versione migliorata */
.btn-delete-payment {
  padding: 6px 8px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.btn-delete-payment:hover {
  background: #f5365c;
  border-color: #f5365c;
  color: white;
}

.btn-delete-payment svg {
  width: 16px;
  height: 16px;
}
/* Tab Header Actions */
.tab-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-create-package {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create-package:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
}

.btn-create-package:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Empty State Packages */
.empty-state-packages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.03), rgba(124, 58, 237, 0.03));
  border: 2px dashed rgba(79, 70, 229, 0.2);
  border-radius: 16px;
}

.empty-icon {
  margin-bottom: 20px;
  color: #9ca3af;
}

.empty-state-packages h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.empty-state-packages p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #6b7280;
  max-width: 400px;
}

.btn-empty-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-empty-action:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
}

.btn-empty-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

</style>
test