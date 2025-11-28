# ðŸ‘¨â€ðŸ« WebApp Doposcuola 2.0 - Pagina Tutor

**Progetto:** tiformiamonoi.it  
**Tecnologia:** Nuxt 3 + Nuxt UI  
**Data:** 4 Novembre 2025  
**Versione:** 1.0

---

## ðŸ“‘ Indice

### PARTE 1: STRUTTURA GENERALE
1. [Panoramica Pagina](#panoramica-pagina)
2. [Route e Navigazione](#route-e-navigazione)
3. [Permessi e Accessi](#permessi-e-accessi)

### PARTE 2: STAT CARDS E FILTRO TEMPORALE
4. [Stat Cards con Filtro Periodo](#stat-cards-filtro-periodo)
5. [Logica Calcolo Statistiche](#logica-calcolo-statistiche)

### PARTE 3: BARRA AZIONI E FILTRI
6. [Barra Azioni Superiore](#barra-azioni-superiore)
7. [Paga MensilitÃ  Multiple](#paga-mensilita-multiple)
8. [Sistema Filtri](#sistema-filtri)

### PARTE 4: TABELLA TUTOR
9. [Struttura Tabella (6 Colonne)](#struttura-tabella)
10. [Colonna Stati (Badge Multipli)](#colonna-stati)
11. [Colonna Mesi Non Pagati (Espandibile)](#colonna-mesi-non-pagati)
12. [Azioni per Riga](#azioni-per-riga)

### PARTE 5: MODAL PAGAMENTO
13. [Modal Paga Compenso](#modal-paga-compenso)
14. [Dettaglio Calcolo Espandibile](#dettaglio-calcolo-espandibile)
15. [Logica Calcolo Compenso](#logica-calcolo-compenso)

### PARTE 6: TARIFFE E ARROTONDAMENTO
16. [Tariffe Globali](#tariffe-globali)
17. [Arrotondamento per Difetto](#arrotondamento-per-difetto)

### PARTE 7: IMPLEMENTAZIONE TECNICA
18. [Struttura Dati TypeScript](#struttura-dati-typescript)
19. [API Endpoints](#api-endpoints)
20. [Componenti Nuxt UI](#componenti-nuxt-ui)
21. [Responsive Mobile](#responsive-mobile)
22. [Checklist Implementazione](#checklist-implementazione)

---

# PARTE 1: STRUTTURA GENERALE

---

## ðŸŽ¯ Panoramica Pagina

### Scopo della Pagina

La Pagina Tutor Ã¨ il **centro di gestione dei collaboratori**, progettata per:

- **Visione d'insieme** di tutti i tutor attivi
- **Gestione compensi mensili** (pagamenti e storico)
- **Identificazione rapida** di mensilitÃ  non pagate
- **Filtro per periodo** (mese specifico o anno intero)
- **Azioni bulk** (paga piÃ¹ tutor contemporaneamente)
- **Link a Calendario** personalizzato per tutor

### Architettura Visiva

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ HEADER + NAVBAR + SIDEBAR (layout globale)                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                              â”‚
â”‚  Filtra per: [Novembre 2025 â–¼] [Anno 2025 â–¼]               â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”              â”‚
â”‚  â”‚ðŸ‘¥ TUTOR  â”‚ â”‚ðŸ’³ DA     â”‚ â”‚ðŸ’° TOTALE       â”‚              â”‚
â”‚  â”‚  ATTIVI  â”‚ â”‚  PAGARE  â”‚ â”‚   DOVUTO       â”‚              â”‚
â”‚  â”‚    39    â”‚ â”‚     8    â”‚ â”‚   2.407â‚¬       â”‚              â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜              â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ ðŸ” Cerca...  [â˜ Paga Sel.]  [Filtriâ–¼]  [ðŸ“¤ Export]  â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•—      â”‚  â”‚
â”‚  â”‚ â•‘ NOME TUTOR    â•‘ STATO  â•‘ MESI NON  â•‘ AZIONI  â•‘      â”‚  â”‚
â”‚  â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•£      â”‚  â”‚
â”‚  â”‚ â•‘ Vittorio A.   â•‘ ðŸŸ¢     â•‘ 3 mesi    â•‘ ðŸ’³ â‹®    â•‘      â”‚  â”‚
â”‚  â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•      â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                              â”‚
â”‚  Mostrando 39 tutor (tutti caricati)                        â”‚
â”‚                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Permessi

| Utente | Visualizzazione | Paga Compensi | Modifica Tariffe | Elimina |
|--------|-----------------|---------------|------------------|---------|
| **Admin** | âœ… Tutti | âœ… Tutti | âœ… Si | âœ… Si |
| **Segreteria** | âœ… Tutti | âœ… Tutti | âŒ No | âŒ No |

---

## ðŸ”— Route e Navigazione

### Route

```
/tutor
```

### Navigazione Verso Questa Pagina

**Da Sidebar:**
- Click su **"Tutor"** nel menu principale

**Da Dashboard:**
- Widget "Performance Tutor" â†’ Link "Vedi tutti"

**Da Calendario:**
- Link "Gestisci Tutor"

### Navigazione Da Questa Pagina

**Click Nome Tutor:**
```
â†’ /tutor/:id (Pagina Dettaglio Tutor - documentata separatamente)
```

**Click ðŸ’³ Paga:**
```
â†’ Apre Modal "Paga Compenso" con tutor pre-selezionato
```

**Menu â†’ Vedi Calendario:**
```
â†’ /calendario?tutor=:id
```

**Bottone Export:**
```
â†’ /export?type=tutor&periodo=novembre-2025
```

---

## ðŸ” Permessi e Accessi

**Gestione Visualizzazione:**
- Admin e Segreteria: Accesso completo
- Tutor: **NON** possono accedere a questa pagina (redirect)

**Azioni Limitate:**
- **Modifica Tariffe:** Solo Admin (in Pagina Impostazioni)
- **Elimina Tutor:** Solo Admin (in Pagina Dettaglio Tutor)

---

# PARTE 2: STAT CARDS E FILTRO TEMPORALE

---

## ðŸ“Š Stat Cards con Filtro Periodo

### Layout Completo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Filtra per: [Novembre 2025 â–¼] [Anno 2025 â–¼]             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ ðŸ‘¥ TUTOR      â”‚ â”‚ ðŸ’³ DA         â”‚ â”‚ ðŸ’° TOTALE       â”‚ â”‚
â”‚ â”‚    ATTIVI     â”‚ â”‚    PAGARE     â”‚ â”‚    DOVUTO       â”‚ â”‚
â”‚ â”‚      39       â”‚ â”‚       8       â”‚ â”‚    2.407â‚¬       â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Filtro Temporale

**Due dropdown affiancati:**

**Dropdown 1: Periodo**
```
[Novembre 2025 â–¼]

Opzioni:
- Gennaio 2025
- Febbraio 2025
- ...
- Novembre 2025  â† Default (mese corrente)
- Dicembre 2025
- â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
- Anno Completo 2025
```

**Dropdown 2: Anno**
```
[Anno 2025 â–¼]

Opzioni:
- 2023
- 2024
- 2025  â† Default (anno corrente)
```

**Comportamento:**
- Se selezioni "Anno Completo" â†’ Disabilita dropdown Anno (diventa readonly)
- Cambiando periodo â†’ Aggiorna automaticamente le 3 Stat Cards + Tabella

---

### Card 1: Tutor Attivi

**Definizione:** Tutor con almeno 1 lezione nel periodo selezionato.

```typescript
const tutorAttivi = tutor.filter(t => {
  const lezioni = getLezioniTutorPeriodo(t.id, periodoSelezionato);
  return lezioni.length > 0 && t.stato !== 'disattivato';
}).length;
```

**Design:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ‘¥ TUTOR ATTIVI   â”‚
â”‚       39           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colore sfondo:** `var(--color-bg-1)`

---

### Card 2: Da Pagare

**Definizione:** Numero tutor con almeno 1 mese NON saldato nel periodo.

```typescript
const tutorDaPagare = tutor.filter(t => {
  const mesiNonPagati = getMesiNonPagati(t.id, periodoSelezionato);
  return mesiNonPagati.length > 0;
}).length;
```

**Design:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ’³ DA PAGARE      â”‚
â”‚       8            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colore sfondo:** `var(--color-bg-4)` (rosso chiaro)

---

### Card 3: Totale Dovuto

**Definizione:** Somma di tutti i compensi non saldati nel periodo.

```typescript
const totaleDovuto = tutor.reduce((sum, t) => {
  const mesiNonPagati = getMesiNonPagati(t.id, periodoSelezionato);
  const totale = mesiNonPagati.reduce((s, mese) => 
    s + calcolaCompensoMese(t.id, mese).totaleArrotondato, 0
  );
  return sum + totale;
}, 0);
```

**Design:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ’° TOTALE DOVUTO  â”‚
â”‚     2.407â‚¬         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colore sfondo:** `var(--color-bg-6)` (arancione chiaro)

---

## ðŸ§® Logica Calcolo Statistiche

```typescript
interface StatCardsTutor {
  tutorAttivi: number;
  tutorDaPagare: number;
  totaleDovuto: number;
}

function calcolaStatCards(periodo: PeriodoFiltro): StatCardsTutor {
  const { dataInizio, dataFine } = getPeriodoRange(periodo);
  
  let tutorAttivi = 0;
  let tutorDaPagare = 0;
  let totaleDovuto = 0;
  
  for (const tutor of allTutor) {
    if (tutor.stato === 'disattivato') continue;
    
    // Check se ha lezioni nel periodo
    const lezioni = getLezioniTutorRange(tutor.id, dataInizio, dataFine);
    if (lezioni.length > 0) {
      tutorAttivi++;
    }
    
    // Check mesi non pagati nel periodo
    const mesiNelPeriodo = getMesiInRange(dataInizio, dataFine);
    for (const mese of mesiNelPeriodo) {
      const compenso = getCompensoMese(tutor.id, mese);
      
      if (compenso && !compenso.pagato) {
        tutorDaPagare++;
        totaleDovuto += compenso.totaleArrotondato;
        break; // Conta tutor una volta sola
      }
    }
  }
  
  return { tutorAttivi, tutorDaPagare, totaleDovuto };
}
```

---

# PARTE 3: BARRA AZIONI E FILTRI

---

## ðŸ”§ Barra Azioni Superiore

### Layout Completo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ” [Cerca tutor...]   [â˜ Paga Selezionati]  [Filtriâ–¼]  [ðŸ“¤]â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Elementi

**1. Input Ricerca**
- Placeholder: "Cerca tutor..."
- Ricerca in: Nome, Cognome
- Debounced 300ms

```typescript
const searchQuery = ref('');

const filteredTutor = computed(() => {
  if (!searchQuery.value) return tutor.value;
  
  const query = searchQuery.value.toLowerCase();
  
  return tutor.value.filter(t => 
    t.nome.toLowerCase().includes(query) ||
    t.cognome.toLowerCase().includes(query)
  );
});
```

**2. Bottone Paga Selezionati**
- Visibile solo se almeno 1 tutor selezionato (checkbox)
- Apre modal con tutti i tutor selezionati

**3. Dropdown Filtri**
- Apre menu dropdown con filtri rapidi

**4. Bottone Export**
- Naviga a `/export?type=tutor&periodo=novembre-2025`

---

## âœ… Paga MensilitÃ  Multiple

### ModalitÃ  Selection

**Attivazione:**
- Checkbox appare nella tabella (prima colonna)
- Click su checkbox riga â†’ Seleziona tutor
- Click su checkbox header â†’ Seleziona tutti

**Bottone "Paga Selezionati":**
- Appare solo se `selectedTutor.length > 0`
- Click â†’ Apre modal con lista tutor selezionati

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’° PAGA COMPENSI MULTIPLI                           [X]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                           â”‚
â”‚ Hai selezionato 3 tutor                                  â”‚
â”‚                                                           â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ â˜‘ Vittorio Agnello                                  â”‚ â”‚
â”‚ â”‚   Mesi da pagare: Agosto, Settembre, Ottobre        â”‚ â”‚
â”‚ â”‚   Totale: 183â‚¬                                      â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                           â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ â˜‘ Mario Rossi                                       â”‚ â”‚
â”‚ â”‚   Mesi da pagare: Settembre                         â”‚ â”‚
â”‚ â”‚   Totale: 125â‚¬                                      â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                           â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ â˜‘ Giulia Bianchi                                    â”‚ â”‚
â”‚ â”‚   Mesi da pagare: Ottobre                           â”‚ â”‚
â”‚ â”‚   Totale: 98â‚¬                                       â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                           â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                           â”‚
â”‚ TOTALE COMPLESSIVO: 406â‚¬                                 â”‚
â”‚                                                           â”‚
â”‚ Data pagamento *    [04/11/2025] [ðŸ“…]                   â”‚
â”‚ Metodo pagamento *  â— Bonifico â—‹ Contanti â—‹ Assegno    â”‚
â”‚ Note (opzionale)    [Bonifico cumulativo novembre]      â”‚
â”‚                                                           â”‚
â”‚ [Annulla]                    [ðŸ’¾ Registra Pagamenti]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**FunzionalitÃ :**
- Puoi deselezionare singoli tutor (checkbox â˜)
- Data e metodo uguali per tutti
- Crea N pagamenti separati nel DB (uno per tutor)

---

## ðŸŽ›ï¸ Sistema Filtri

### Dropdown Filtri

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Stato:               â”‚
â”‚ â˜ Attivo             â”‚
â”‚ â˜ Inattivo           â”‚
â”‚ â˜ Disattivato        â”‚
â”‚                      â”‚
â”‚ Pagamenti:           â”‚
â”‚ â˜ Tutti pagati       â”‚
â”‚ â˜ Con mesi sospesi   â”‚
â”‚                      â”‚
â”‚ [Azzera] [Applica]   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Logica Filtri:**

```typescript
interface FiltriTutor {
  stato: ('attivo' | 'inattivo' | 'disattivato')[];
  pagamenti: ('pagati' | 'sospesi')[];
}

const filtri = ref<FiltriTutor>({
  stato: [],
  pagamenti: []
});

const tutorFiltered = computed(() => {
  let result = tutor.value;
  
  // Ricerca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(t => 
      t.nome.toLowerCase().includes(query) ||
      t.cognome.toLowerCase().includes(query)
    );
  }
  
  // Filtro stato
  if (filtri.value.stato.length > 0) {
    result = result.filter(t => filtri.value.stato.includes(t.stato));
  }
  
  // Filtro pagamenti
  if (filtri.value.pagamenti.includes('pagati')) {
    result = result.filter(t => 
      getMesiNonPagati(t.id, periodoSelezionato).length === 0
    );
  }
  
  if (filtri.value.pagamenti.includes('sospesi')) {
    result = result.filter(t => 
      getMesiNonPagati(t.id, periodoSelezionato).length > 0
    );
  }
  
  return result;
});
```

---

# PARTE 4: TABELLA TUTOR

---

## ðŸ“‹ Struttura Tabella (6 Colonne)

### Layout Tabella

```
â•”â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•—
â•‘ â˜ â•‘ NOME TUTOR   â•‘ STATO  â•‘ MESI NON PAG. â•‘ TOT DOVUTO  â•‘ ULT. PAG.   â•‘ â‹® â•‘
â• â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•£
â•‘ â˜ â•‘ Vittorio A.  â•‘ ðŸŸ¢     â•‘ 3 [Mostraâ–¼]  â•‘ 183â‚¬        â•‘ 15/08/2025  â•‘ðŸ’³â•‘
â•‘   â•‘              â•‘ Attivo â•‘ Ago,Set,Ott   â•‘             â•‘             â•‘ â‹® â•‘
â• â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•£
â•‘ â˜ â•‘ Mario Rossi  â•‘ ðŸŸ¢     â•‘ - (tutto      â•‘ 0â‚¬          â•‘ 03/11/2025  â•‘ðŸ’³â•‘
â•‘   â•‘              â•‘ Attivo â•‘   pagato)     â•‘             â•‘             â•‘ â‹® â•‘
â• â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•£
â•‘ â˜ â•‘ Giulia B.    â•‘ ðŸŸ¡     â•‘ 1 [Mostraâ–¼]  â•‘ 98â‚¬         â•‘ 10/10/2025  â•‘ðŸ’³â•‘
â•‘   â•‘              â•‘ Inatt. â•‘ Ottobre       â•‘             â•‘             â•‘ â‹® â•‘
â• â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•£
â•‘ â˜ â•‘ Luca Verdi   â•‘ ðŸŸ¢     â•‘ 2 [Mostraâ–¼]  â•‘ 122â‚¬        â•‘ 20/09/2025  â•‘ðŸ’³â•‘
â•‘   â•‘              â•‘ ðŸ”´ 2   â•‘ Set, Ott      â•‘             â•‘             â•‘ â‹® â•‘
â•‘   â•‘              â•‘ mesi   â•‘               â•‘             â•‘             â•‘   â•‘
â•šâ•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•
```

### Colonne Dettagliate

**Colonna 0: Checkbox (opzionale)**
- Visibile solo in "modalitÃ  selection"
- Header checkbox â†’ Seleziona tutti
- Riga checkbox â†’ Seleziona singolo tutor

**Colonna 1: Nome Tutor**
- Nome + Cognome
- **Clickable** â†’ Naviga a `/tutor/:id`
- **font-weight-semibold**

**Colonna 2: Stato**
- Badge (puÃ² essere multiplo)
- Vedi sezione dedicata

**Colonna 3: Mesi Non Pagati**
- Numero + bottone espandi
- Lista mesi (se espanso)

**Colonna 4: Totale Dovuto**
- Somma compensi non saldati nel periodo
- Formato: `123â‚¬`

**Colonna 5: Ultimo Pagamento**
- Data ultimo compenso saldato
- Formato: `DD/MM/YYYY`
- Se mai pagato: `-`

**Colonna 6: Azioni**
- Icona ðŸ’³ (paga rapido)
- Menu â‹® (altre azioni)

---

### Ordinamento Colonne

**Solo Nome Ã¨ ordinabile:**
- Click header "NOME TUTOR" â†’ Toggle Aâ†’Z / Zâ†’A

```typescript
const sortOrder = ref<'asc' | 'desc'>('asc');

const tutorSorted = computed(() => {
  const sorted = [...tutorFiltered.value];
  
  sorted.sort((a, b) => {
    const nameA = `${a.cognome} ${a.nome}`.toLowerCase();
    const nameB = `${b.cognome} ${b.nome}`.toLowerCase();
    
    if (sortOrder.value === 'asc') {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
  
  return sorted;
});
```

---

## ðŸŽ¨ Colonna Stati (Badge Multipli)

### Stati Possibili

**Stati Base:**
- ðŸŸ¢ **Attivo** (disponibile e lavora)
- ðŸŸ¡ **Inattivo** (pausa temporanea)
- âš« **Disattivato** (non lavora piÃ¹)

**Stato Aggiuntivo:**
- ðŸ”´ **N mesi non pagati** (se ha mensilitÃ  sospese)

### PrioritÃ  Visualizzazione

**Stack verticale (massimo 2 badge):**

```
ðŸŸ¢ Attivo
ðŸ”´ 3 mesi non pagati
```

**Logica:**

```typescript
type TutorStato = 'attivo' | 'inattivo' | 'disattivato';

function getStatiBadge(tutor: Tutor, periodo: PeriodoFiltro): StatoBadge[] {
  const stati: StatoBadge[] = [];
  
  // Stato base
  if (tutor.stato === 'attivo') {
    stati.push({ color: 'success', icon: 'heroicons:check-circle', label: 'Attivo' });
  } else if (tutor.stato === 'inattivo') {
    stati.push({ color: 'warning', icon: 'heroicons:pause-circle', label: 'Inattivo' });
  } else if (tutor.stato === 'disattivato') {
    stati.push({ color: 'gray', icon: 'heroicons:minus-circle', label: 'Disattivato' });
  }
  
  // Stato pagamento
  const mesiNonPagati = getMesiNonPagati(tutor.id, periodo);
  if (mesiNonPagati.length > 0) {
    stati.push({
      color: 'error',
      icon: 'heroicons:credit-card',
      label: `${mesiNonPagati.length} mesi non pagati`
    });
  }
  
  return stati;
}
```

---

## ðŸ“… Colonna Mesi Non Pagati (Espandibile)

### Visualizzazione Default (Collapsed)

```
3 [Mostra â–¼]
```

### Visualizzazione Espansa

```
3 [Nascondi â–²]
Agosto 2025
Settembre 2025
Ottobre 2025
```

### Implementazione

```vue
<template>
  <div class="mesi-non-pagati">
    <button @click="toggleExpand" class="expand-trigger">
      {{ mesiNonPagati.length }} 
      <span v-if="mesiNonPagati.length > 0">
        [{{ isExpanded ? 'Nascondi â–²' : 'Mostra â–¼' }}]
      </span>
      <span v-else>
        (tutto pagato)
      </span>
    </button>
    
    <div v-if="isExpanded && mesiNonPagati.length > 0" class="mesi-lista">
      <div v-for="mese in mesiNonPagati" :key="mese">
        {{ formatMese(mese) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  tutorId: string;
  periodo: PeriodoFiltro;
}

const props = defineProps<Props>();
const isExpanded = ref(false);

const mesiNonPagati = computed(() => 
  getMesiNonPagati(props.tutorId, props.periodo)
);

function toggleExpand() {
  if (mesiNonPagati.value.length > 0) {
    isExpanded.value = !isExpanded.value;
  }
}

function formatMese(mese: Date): string {
  return mese.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
}
</script>
```

---

## âš¡ Azioni per Riga

### Icona ðŸ’³ Paga

**Posizione:** Colonna 6 (prima del menu â‹®)

**Funzione:**
- Click â†’ Apre Modal "Paga Compenso" con tutor pre-selezionato
- Shortcut per pagamento rapido

```typescript
function pagaRapido(tutorId: string) {
  tutorSelezionato.value = tutorId;
  isModalPagamentoOpen.value = true;
}
```

---

### Menu â‹® Azioni

**Voci:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“… Vedi Calendario   â”‚
â”‚ â¸ï¸ Disattiva Tutor   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**1. Vedi Calendario**
- Naviga a `/calendario?tutor=:id`
- Mostra solo lezioni di quel tutor

**2. Disattiva Tutor**
- Apre modal conferma
- Cambia stato a `disattivato`
- `PATCH /api/tutor/:id { stato: 'disattivato' }`

---

# PARTE 5: MODAL PAGAMENTO

---

## ðŸ’° Modal Paga Compenso

### Layout Completo (Singolo Tutor)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’° PAGA COMPENSO - Vittorio Agnello                [X]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                           â”‚
â”‚ Seleziona mesi da pagare:                                â”‚
â”‚                                                           â”‚
â”‚ â˜‘ Agosto 2025       61â‚¬   [Vedi dettaglio â–¼]           â”‚
â”‚ â˜‘ Settembre 2025    61â‚¬   [Vedi dettaglio â–¼]           â”‚
â”‚ â˜‘ Ottobre 2025      61â‚¬   [Vedi dettaglio â–¼]           â”‚
â”‚                                                           â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                           â”‚
â”‚ TOTALE DA PAGARE: 183â‚¬                                   â”‚
â”‚                                                           â”‚
â”‚ Data pagamento *    [04/11/2025] [ðŸ“…]                   â”‚
â”‚                                                           â”‚
â”‚ Metodo pagamento *                                       â”‚
â”‚ â— Bonifico  â—‹ Contanti  â—‹ Assegno                       â”‚
â”‚                                                           â”‚
â”‚ Note (opzionale)                                         â”‚
â”‚ [Bonifico cumulativo trimestre]                         â”‚
â”‚                                                           â”‚
â”‚ [Annulla]                    [ðŸ’¾ Registra Pagamento]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Form Elements

**1. Checkbox Mesi**
- Tutti selezionati di default
- Deseleziona â†’ Riduce totale

**2. Dettaglio Espandibile**
- "Vedi dettaglio â–¼" per ogni mese
- Mostra calcolo ore (vedi sezione successiva)

**3. Data Pagamento**
- Default: Oggi
- Date picker

**4. Metodo Pagamento**
- Radio buttons: Bonifico, Contanti, Assegno
- Default: Bonifico

**5. Note Opzionali**
- Textarea per note libere

---

## ðŸ“Š Dettaglio Calcolo Espandibile

### Visualizzazione Espansa

**Click "Vedi dettaglio â–¼" su un mese:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ DETTAGLIO CALCOLO Agosto 2025      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ORE COMPLETE                       â”‚
â”‚ - Ore Singole: 6 Ã— 5,00â‚¬ = 30â‚¬   â”‚
â”‚ - Ore Gruppo:  2 Ã— 8,00â‚¬ = 16â‚¬   â”‚
â”‚ - Ore Maxi-G:  1 Ã— 8,50â‚¬ = 8â‚¬    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ MEZZE ORE                          â”‚
â”‚ - Mezze Singole: 2 Ã— 2,50â‚¬ = 5â‚¬  â”‚
â”‚ - Mezze Gruppo:  1 Ã— 4,00â‚¬ = 4â‚¬  â”‚
â”‚ - Mezze Maxi-G:  0 Ã— 4,00â‚¬ = 0â‚¬  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TOTALE: 63â‚¬                        â”‚
â”‚ (arrotondato per difetto da 63,50â‚¬)â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Nota:** Totale giÃ  arrotondato per difetto (es. 63,50â‚¬ â†’ 63â‚¬)

---

## ðŸ§® Logica Calcolo Compenso

### Struttura Dati Compenso

```typescript
interface CompensoMensile {
  tutorId: string;
  mese: Date;
  
  // Ore complete
  oreSingole: number;
  oreGruppo: number;
  oreMaxiGruppo: number;
  
  // Mezze ore
  mezzeOreSingole: number;
  mezzeOreGruppo: number;
  mezzeOreMaxiGruppo: number;
  
  // Calcoli
  totaleGrezzo: number;       // Totale esatto con centesimi
  totaleArrotondato: number;  // Arrotondato per difetto
  
  // Pagamento
  pagato: boolean;
  dataPagamento?: Date;
  metodoPagamento?: 'bonifico' | 'contanti' | 'assegno';
  note?: string;
}
```

### Funzione Calcolo

```typescript
function calcolaCompensoMese(tutorId: string, mese: Date): CompensoMensile {
  const lezioni = getLezioniTutorMese(tutorId, mese);
  
  let oreSingole = 0;
  let oreGruppo = 0;
  let oreMaxiGruppo = 0;
  let mezzeOreSingole = 0;
  let mezzeOreGruppo = 0;
  let mezzeOreMaxiGruppo = 0;
  
  // Conta ore per tipo
  lezioni.forEach(l => {
    if (l.tipo === 'singola') oreSingole += l.durata;
    if (l.tipo === 'gruppo') oreGruppo += l.durata;
    if (l.tipo === 'maxi') oreMaxiGruppo += l.durata;
    if (l.tipo === 'mezza-singola') mezzeOreSingole += l.durata;
    if (l.tipo === 'mezza-gruppo') mezzeOreGruppo += l.durata;
    if (l.tipo === 'mezza-maxi') mezzeOreMaxiGruppo += l.durata;
  });
  
  // Calcola totale con tariffe globali
  const totaleGrezzo = 
    (oreSingole * TARIFFE_GLOBALI.oraSingola) +
    (oreGruppo * TARIFFE_GLOBALI.oraGruppo) +
    (oreMaxiGruppo * TARIFFE_GLOBALI.oraMaxiGruppo) +
    (mezzeOreSingole * TARIFFE_GLOBALI.mezzaOraSingola) +
    (mezzeOreGruppo * TARIFFE_GLOBALI.mezzaOraGruppo) +
    (mezzeOreMaxiGruppo * TARIFFE_GLOBALI.mezzaOraMaxiGruppo);
  
  // Arrotonda per difetto
  const totaleArrotondato = Math.floor(totaleGrezzo);
  
  // Check se giÃ  pagato
  const pagamento = getPagamentoTutorMese(tutorId, mese);
  
  return {
    tutorId,
    mese,
    oreSingole,
    oreGruppo,
    oreMaxiGruppo,
    mezzeOreSingole,
    mezzeOreGruppo,
    mezzeOreMaxiGruppo,
    totaleGrezzo,
    totaleArrotondato,
    pagato: !!pagamento,
    dataPagamento: pagamento?.data,
    metodoPagamento: pagamento?.metodo,
    note: pagamento?.note
  };
}
```

---

# PARTE 6: TARIFFE E ARROTONDAMENTO

---

## ðŸ’¶ Tariffe Globali

### Configurazione Standard

**Tariffe uguali per tutti i tutor:**

```typescript
const TARIFFE_GLOBALI = {
  oraSingola: 5.00,
  oraGruppo: 8.00,
  oraMaxiGruppo: 8.50,
  mezzaOraSingola: 2.50,
  mezzaOraGruppo: 4.00,
  mezzaOraMaxiGruppo: 4.00  // Sempre 4â‚¬
};
```

**Gestione:**
- Modificabili solo da Admin
- Pagina Impostazioni â†’ Sezione "Tariffe Tutor"
- Modifiche valide per tutti i calcoli futuri

---

## ðŸ”¢ Arrotondamento per Difetto

### Regola

**Totale compenso sempre arrotondato per difetto:**

```typescript
const totaleGrezzo = 30.85;  // Calcolo esatto
const totaleDaPagare = Math.floor(totaleGrezzo);  // 30â‚¬
```

**Esempi:**
- `30,00â‚¬` â†’ `30â‚¬`
- `30,20â‚¬` â†’ `30â‚¬`
- `30,50â‚¬` â†’ `30â‚¬`
- `30,99â‚¬` â†’ `30â‚¬`

**Motivazione:**
- Semplifica pagamenti (niente spiccioli)
- Policy aziendale consolidata

---

### Visualizzazione

**Nel dettaglio calcolo:**

```
TOTALE: 61â‚¬
(arrotondato per difetto da 61,35â‚¬)
```

**Nella tabella e modal:**
- Mostra solo totale arrotondato: `61â‚¬`
- Nota arrotondamento solo nel dettaglio espandibile

---

# PARTE 7: IMPLEMENTAZIONE TECNICA

---

## ðŸ’¾ Struttura Dati TypeScript

### Interface Tutor

```typescript
interface Tutor {
  id: string;
  
  // Anagrafica
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  
  // Stato
  stato: 'attivo' | 'inattivo' | 'disattivato';
  dataAssunzione: Date;
  dataUltimaLezione?: Date;
  
  // Note
  note?: string;
}
```

### Interface CompensoMensile

*GiÃ  documentata nella sezione "Logica Calcolo Compenso"*

### Interface PagamentoCompenso

```typescript
interface PagamentoCompenso {
  id: string;
  tutorId: string;
  mese: Date;
  importo: number;  // Totale arrotondato
  data: Date;
  metodo: 'bonifico' | 'contanti' | 'assegno';
  note?: string;
  creatoIl: Date;
  creatoDA: string;  // User ID
}
```

### Type Helpers

```typescript
type PeriodoFiltro = {
  tipo: 'mese' | 'anno';
  mese?: number;  // 1-12
  anno: number;
};

type StatoBadge = {
  color: 'success' | 'warning' | 'error' | 'gray';
  icon: string;
  label: string;
};
```

---

## ðŸŒ API Endpoints

```typescript
// GET - Lista tutor con filtri
GET /api/tutor
Query params:
  - search: string
  - stato: string[]
  - periodo: PeriodoFiltro (JSON encoded)
  - conPagamentiSospesi: boolean

Response: {
  data: Tutor[],
  total: number
}

// GET - Dettaglio tutor
GET /api/tutor/:id

// GET - Compensi tutor (per periodo)
GET /api/tutor/:id/compensi
Query: periodo: PeriodoFiltro
Response: CompensoMensile[]

// POST - Crea tutor
POST /api/tutor
Body: Omit<Tutor, 'id'>

// PATCH - Modifica tutor
PATCH /api/tutor/:id
Body: Partial<Tutor>

// PATCH - Cambia stato tutor
PATCH /api/tutor/:id/stato
Body: { stato: 'attivo' | 'inattivo' | 'disattivato' }

// POST - Registra pagamento compenso
POST /api/compensi/paga
Body: {
  tutorId: string;
  mesi: Date[];  // Array mesi da pagare
  dataPagamento: Date;
  metodoPagamento: 'bonifico' | 'contanti' | 'assegno';
  note?: string;
}

// POST - Registra pagamenti multipli (bulk)
POST /api/compensi/paga-multipli
Body: {
  pagamenti: Array<{
    tutorId: string;
    mesi: Date[];
  }>;
  dataPagamento: Date;
  metodoPagamento: string;
  note?: string;
}

// GET - Stat cards
GET /api/tutor/statistiche
Query: periodo: PeriodoFiltro
Response: StatCardsTutor
```

---

## ðŸŽ¨ Componenti Nuxt UI Utilizzati

| Componente | Utilizzo |
|------------|----------|
| `UCard` | Stat Cards |
| `UStat` | Numeri statistiche |
| `UBadge` | Stati tutor (multipli) |
| `UButton` | Azioni, trigger |
| `UInput` | Ricerca testuale |
| `UCheckbox` | Selezione multipla, mesi da pagare |
| `URadio` | Metodo pagamento |
| `USelect` | Dropdown periodo |
| `UDropdown` | Menu azioni â‹®, filtri |
| `UModal` | Pagamento compenso, conferme |
| `UTooltip` | Spiegazioni hover |
| `UTable` (opzionale) | Alternativa a tabella custom |
| `UTextarea` | Note pagamento |

---

## ðŸ“± Responsive Mobile

### Layout Mobile (<768px)

**Trasformazione:** Tabella â†’ Card verticali

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Filtra: [Nov 2025 â–¼]        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ‘¥ 39  â”‚ ðŸ’³ 8  â”‚ ðŸ’° 2.407â‚¬ â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ” [Cerca...]  [Filtriâ–¼]   â”‚
â”‚ [Paga Sel.]  [ðŸ“¤ Export]   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                             â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ â˜ Vittorio Agnello      â”‚ â”‚
â”‚ â”‚ ðŸŸ¢ Attivo               â”‚ â”‚
â”‚ â”‚ ðŸ”´ 3 mesi non pagati    â”‚ â”‚
â”‚ â”‚                         â”‚ â”‚
â”‚ â”‚ ðŸ’° 183â‚¬ dovuti          â”‚ â”‚
â”‚ â”‚ Ultimo: 15/08/2025      â”‚ â”‚
â”‚ â”‚                         â”‚ â”‚
â”‚ â”‚ [ðŸ’³ Paga] [ðŸ“…] [â‹®]     â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                             â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ â˜ Mario Rossi           â”‚ â”‚
â”‚ â”‚ ðŸŸ¢ Attivo               â”‚ â”‚
â”‚ â”‚ Tutto pagato âœ…         â”‚ â”‚
â”‚ â”‚                         â”‚ â”‚
â”‚ â”‚ [ðŸ“… Calendario] [â‹®]    â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Card Mobile:**

```vue
<template>
  <div class="tutor-card-mobile">
    <div class="card-header">
      <UCheckbox v-if="selectionMode" v-model="selected" />
      <h3 @click="goToDetail">{{ tutor.nome }} {{ tutor.cognome }}</h3>
    </div>
    
    <div class="card-stati">
      <UBadge 
        v-for="stato in stati" 
        :key="stato.label"
        :color="stato.color" 
        size="xs"
      >
        {{ stato.label }}
      </UBadge>
    </div>
    
    <div class="card-info">
      <p v-if="totaleDovuto > 0">ðŸ’° {{ totaleDovuto }}â‚¬ dovuti</p>
      <p>Ultimo pagamento: {{ formatData(ultimoPagamento) }}</p>
    </div>
    
    <div class="card-actions">
      <UButton 
        v-if="totaleDovuto > 0" 
        size="sm" 
        @click="paga"
      >
        ðŸ’³ Paga
      </UButton>
      <UButton 
        size="sm" 
        variant="outline" 
        @click="vediCalendario"
      >
        ðŸ“…
      </UButton>
      <UDropdown :items="menuItems">
        <UButton icon="heroicons:ellipsis-horizontal" variant="ghost" size="sm" />
      </UDropdown>
    </div>
  </div>
</template>
```

---

## âœ… Checklist Implementazione

### Fase 1: Setup Base (2 giorni)
- [ ] Route `/tutor` in Nuxt
- [ ] Composable `useTutor()`
- [ ] API endpoints backend
- [ ] TypeScript interfaces

### Fase 2: Stat Cards (2 giorni)
- [ ] 3 Stat Cards con dati dinamici
- [ ] Filtro temporale (dropdown mese + anno)
- [ ] Logica calcolo per periodo selezionato
- [ ] Aggiornamento automatico al cambio periodo

### Fase 3: Tabella Tutor (4 giorni)
- [ ] Tabella 6 colonne
- [ ] Ricerca real-time (nome/cognome)
- [ ] Stati badge multipli
- [ ] Colonna mesi espandibile
- [ ] Ordinamento nome (Aâ†’Z / Zâ†’A)
- [ ] Click nome â†’ Naviga a dettaglio

### Fase 4: Sistema Filtri (2 giorni)
- [ ] Dropdown filtri (stato + pagamenti)
- [ ] Logica applicazione filtri
- [ ] Conteggio risultati filtrati

### Fase 5: Selezione Multipla (3 giorni)
- [ ] Checkbox in tabella (header + righe)
- [ ] Stato selected per tutor
- [ ] Bottone "Paga Selezionati" (condizionale)
- [ ] Modal pagamento multiplo

### Fase 6: Modal Pagamento (5 giorni)
- [ ] Modal singolo tutor
- [ ] Checkbox mesi da pagare
- [ ] Dettaglio calcolo espandibile
- [ ] Form pagamento (data, metodo, note)
- [ ] Calcolo totale dinamico
- [ ] Registrazione pagamento API

### Fase 7: Logica Compensi (4 giorni)
- [ ] Funzione calcolo compenso mese
- [ ] Arrotondamento per difetto
- [ ] Dettaglio ore per tipo
- [ ] Storico compensi per tutor
- [ ] Check pagamenti giÃ  saldati

### Fase 8: Azioni Tutor (2 giorni)
- [ ] Icona ðŸ’³ paga rapido
- [ ] Menu â‹® azioni (calendario, disattiva)
- [ ] Navigazione a calendario con filtro tutor
- [ ] Disattiva tutor (modal conferma)

### Fase 9: Export e Integrazioni (2 giorni)
- [ ] Bottone Export â†’ Naviga a pagina dedicata
- [ ] Pre-compilazione parametri export
- [ ] Link a Pagina Dettaglio Tutor

### Fase 10: Responsive Mobile (3 giorni)
- [ ] Card verticali per mobile
- [ ] Stat cards responsive
- [ ] Modal full-screen mobile
- [ ] Touch-friendly interactions

### Fase 11: Performance (2 giorni)
- [ ] Debouncing ricerca
- [ ] Lazy loading se >100 tutor
- [ ] Caching compensi calcolati

### Fase 12: Testing (3 giorni)
- [ ] Test con diversi periodi
- [ ] Test filtri combinati
- [ ] Test pagamenti multipli
- [ ] Test stati tutor
- [ ] Test responsive
- [ ] Test permessi utente

**Totale stimato: 34 giorni lavorativi**

---

## ðŸŽ¯ Riepilogo FunzionalitÃ  Chiave

### âœ… **Cosa rende questa pagina efficace:**

1. **Filtro temporale flessibile** (mese specifico o anno intero)
2. **Stat Cards dinamiche** (aggiornate in base al periodo)
3. **Tabella compatta** (6 colonne essenziali)
4. **Stati badge multipli** (visibilitÃ  immediata problemi)
5. **Mesi espandibili** (dettaglio su richiesta)
6. **Pagamento multiplo** (checkbox + bulk action)
7. **Modal pagamento completo** (con dettaglio calcolo)
8. **Arrotondamento coerente** (sempre per difetto)
9. **Tariffe globali** (gestite centralmente)
10. **Click nome â†’ Dettaglio** (navigazione intuitiva)
11. **Export dedicato** (link a pagina apposita)
12. **Responsive completo** (card mobile ottimizzate)

### ðŸ”— **Collegamenti Esterni:**

**Da questa pagina:**
- `/tutor/:id` (click nome) â†’ Dettaglio Tutor
- `/calendario?tutor=:id` (menu â‹®) â†’ Calendario filtrato
- `/export?type=tutor&periodo=...` (bottone Export) â†’ Pagina Export

**Verso questa pagina:**
- Dashboard â†’ Widget Performance Tutor
- Sidebar â†’ Menu "Tutor"
- Calendario â†’ Link "Gestisci Tutor"

---

## ðŸ“Š Metriche e KPI

**Dati mostrati:**
- Tutor attivi (con lezioni nel periodo)
- Tutor da pagare (con mensilitÃ  sospese)
- Totale dovuto (somma compensi non saldati)
- Ultimo pagamento per tutor
- Dettaglio ore per tipo lezione

**Business Value:**
- Monitoraggio cashflow compensi
- Identificazione mensilitÃ  accumulate
- Tracciamento attivitÃ  tutor
- Analisi costi orari per tipo lezione
- Storico pagamenti completo

---

**Fine Documentazione Pagina Tutor v1.0**

*Documento creato il: 4 Novembre 2025 - 10:02*  
*Integra tutte le specifiche concordate tramite domande strategiche*