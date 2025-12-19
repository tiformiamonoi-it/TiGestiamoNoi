# ðŸ“š WebApp Doposcuola 2.0 - Pagina Alunni (Completa)

**Progetto:** tiformiamonoi.it  
**Tecnologia:** Nuxt 3 + Nuxt UI  
**Data:** 3 Novembre 2025  
**Versione:** 2.0 (Completa e Aggiornata)

---

## ðŸ“‘ Indice

### PARTE 1: PAGINA ALUNNI
1. [Panoramica Pagina Alunni](#panoramica-pagina-alunni)
2. [Stat Cards Superiori](#stat-cards-superiori)
3. [Barra di Ricerca e Azioni](#barra-di-ricerca-e-azioni)
4. [Tabella Alunni](#tabella-alunni)
5. [Sistema Filtri](#sistema-filtri)
6. [Vista Pagamenti Annuale](#vista-pagamenti-annuale)
7. [Stati e Badge](#stati-e-badge)
8. [Paginazione e Scroll](#paginazione-e-scroll)
9. [Responsive Mobile](#responsive-mobile)

### PARTE 2: MODAL GESTISCI PACCHETTI
10. [Modal Gestisci Pacchetti - Struttura](#modal-gestisci-pacchetti)
11. [Tab 1: Storico Pacchetti](#tab-storico-pacchetti)
12. [Tab 2: Registra Pagamento](#tab-registra-pagamento)
13. [Tab 3: Rinnova Pacchetto](#tab-rinnova-pacchetto)

### PARTE 3: IMPLEMENTAZIONE
14. [Struttura Dati TypeScript](#struttura-dati-typescript)
15. [Logiche di Calcolo](#logiche-di-calcolo)
16. [API Endpoints](#api-endpoints)
17. [Componenti Nuxt UI](#componenti-nuxt-ui)
18. [Checklist Implementazione](#checklist-implementazione)

---

# PARTE 1: PAGINA ALUNNI

---

## ðŸŽ¯ Panoramica Pagina Alunni

### Scopo della Pagina

La Pagina Alunni Ã¨ il **centro di gestione degli studenti**, progettata per:
- Avere una **visione d'insieme immediata** di tutti gli alunni
- Identificare rapidamente **situazioni critiche** (pacchetti in scadenza, pagamenti sospesi)
- Accedere velocemente alla **gestione pacchetti** di ogni alunno
- **Filtrare e ordinare** efficacemente
- Visualizzare **pagamenti annuali** in formato calendario

### Architettura Visiva

La pagina Ã¨ strutturata in **2 tab principali**:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ HEADER + NAVBAR + SIDEBAR (layout globale)                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                              â”‚
â”‚  [ALUNNI] [PAGAMENTI ANNUALI]  â† Tab Navigation            â”‚
â”‚  â•â•â•â•â•â•â•                                                     â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                   â”‚
â”‚  â”‚ Stat 1   â”‚ â”‚ Stat 2   â”‚ â”‚ Stat 3   â”‚                   â”‚ â† Stat Cards
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜                   â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ ðŸ” Cerca...  [Filtri â–¼]  [+ Aggiungi]              â”‚  â”‚ â† Barra Azioni
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                              â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ â•”â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•—    â”‚  â”‚
â”‚  â”‚ â•‘ NOME  â•‘ PACCHETTO â•‘ ORE/GIORNIâ•‘ STATO â•‘   â‹®   â•‘    â”‚  â”‚ â† Tabella
â”‚  â”‚ â• â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•£    â”‚  â”‚
â”‚  â”‚ â•‘ Marco â•‘ Mensile   â•‘ 8/12 gg   â•‘ ðŸŸ¢    â•‘   â‹®   â•‘    â”‚  â”‚
â”‚  â”‚ â•šâ•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•    â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                              â”‚
â”‚  Mostrando 20 alunni (scroll infinito)                      â”‚
â”‚                                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Permessi

| Utente | Visualizzazione | Modifica | Eliminazione | Pagamenti |
|--------|-----------------|----------|--------------|-----------|
| **Admin** | âœ… Tutti | âœ… Tutti | âœ… Tutti | âœ… Tutti |
| **Segreteria** | âœ… Tutti | âœ… Tutti | âŒ No | âœ… Tutti |

---

## ðŸ“Š Stat Cards Superiori

### Layout e Posizionamento

**3 Stat Cards** compatte nella parte superiore.

**Griglia Responsive:**
- **Desktop (â‰¥1024px):** 3 cards in riga orizzontale
- **Tablet (768-1023px):** 3 cards in riga (piÃ¹ strette)
- **Mobile (<768px):** Stack verticale

---

### Card 1: Alunni Attivi

**Scopo:** Numero totale alunni con pacchetto attivo.

```typescript
const alunniAttivi = alunni.filter(a => 
  a.pacchettoAttivoId !== null && 
  a.attivo === true &&
  getPacchetto(a.pacchettoAttivoId).stato === 'attivo'
).length;
```

**Design:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ‘¥ ALUNNI ATTIVI     â”‚
â”‚       89               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componenti Nuxt UI:**
- `UCard`
- `UStat` o numero custom
- Icona: `heroicons:user-group`
- Colore sfondo: `var(--color-bg-1)`

**Interazione:** Click â†’ Nessuna azione (solo visualizzazione)

---

### Card 2: Pagamenti Sospesi

**Scopo:** Alunni con pacchetti non saldati.

```typescript
const pagamentiSospesi = pacchetti.filter(p => 
  p.pagamentoSaldato === false &&
  (p.stato === 'attivo' || p.stato === 'scaduto')
).length;
```

**Design:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ’³ DA PAGARE         â”‚
â”‚       12               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componenti:**
- `UCard`
- `UStat` con color="error"
- Icona: `heroicons:credit-card`
- Colore sfondo: `var(--color-bg-4)` (rosso chiaro)

**Interazione:**
- **Click:** Applica filtro automatico â†’ mostra solo alunni con pagamenti sospesi

---

### Card 3: Ore/Giorni Negativi

**Scopo:** Alunni in debito di ore o giorni.

```typescript
const alunniInDebito = pacchetti.filter(p => 
  p.oreResidue < 0 &&
  p.stato === 'attivo'
).length;

const totaleOreNegative = pacchetti
  .filter(p => p.oreResidue < 0)
  .reduce((sum, p) => sum + Math.abs(p.oreResidue), 0);
```

**Design:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  âš ï¸ NEGATIVI          â”‚
â”‚   5 alunni â€¢ -18h      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componenti:**
- `UCard`
- Doppia riga info
- Icona: `heroicons:exclamation-triangle`
- Colore sfondo: `var(--color-bg-4)`

**Interazione:**
- **Click:** Applica filtro â†’ mostra solo alunni con ore/giorni negativi

---

## ðŸ” Barra di Ricerca e Azioni

### Layout Orizzontale

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ” Cerca nome/cognome...     [Filtri â–¼]  [+ Nuovo]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Distribuzione spazio:**
- **Ricerca:** Flex-grow (occupa spazio disponibile)
- **Filtri:** Larghezza fissa 120px
- **Nuovo Alunno:** Larghezza fissa 140px
- Gap: 12px

---

### Input Ricerca

**FunzionalitÃ :**
- Ricerca **in tempo reale** (debounced 300ms)
- Cerca in: Nome, Cognome alunno

```typescript
const searchQuery = ref('');

const filteredAlunni = computed(() => {
  if (!searchQuery.value) return alunni.value;
  
  const query = searchQuery.value.toLowerCase();
  
  return alunni.value.filter(a => 
    a.nome.toLowerCase().includes(query) ||
    a.cognome.toLowerCase().includes(query)
  );
});
```

**Componenti:**
- `UInput` con:
  - `icon="heroicons:magnifying-glass"`
  - `placeholder="Cerca nome/cognome..."`
  - Clear button se c'Ã¨ testo

---

### Bottone Filtri

**FunzionalitÃ :**
- Apre **slide-over laterale** da destra
- Badge con numero filtri attivi

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Filtri [2]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componenti:**
- `UButton` variant="outline"
- `UBadge` per conteggio
- `USlideover` per pannello

---

### Bottone Nuovo Alunno

**FunzionalitÃ :**
- Apre modal per inserimento completo alunno
- Form wizard in step:
  1. Anagrafica alunno
  2. Dati genitore (per fatturazione)
  3. Primo pacchetto (opzionale)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âž• Nuovo Alunno â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componenti:**
- `UButton` color="primary"
- `UModal` full per form multi-step

---

## ðŸ“‹ Tabella Alunni

### Struttura Colonne (5 Colonne)

**Versione compatta e leggibile.**

| # | Colonna | Larghezza | Ordinabile | Descrizione |
|---|---------|-----------|------------|-------------|
| 1 | **Nome Alunno** | Flex (min 180px) | âœ… | Nome + Cognome |
| 2 | **Pacchetto** | 180px | âœ… | Tipo pacchetto |
| 3 | **Ore/Giorni** | 160px | âœ… | Progress + numeri |
| 4 | **Stato** | 140px | âœ… | Badge (multipli se necessario) |
| 5 | **Azioni** | 60px | âŒ | Menu dropdown |

**NO avatar, NO email genitore, NO checkbox, NO ultimo accesso**

---

### Colonna 1: Nome Alunno

**Design:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Marco Rossi           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componenti:**
- Nome in **font-weight-semibold**, **font-size-base**
- NO avatar

**Ordinamento:**
- Default: Cognome alfabetico Aâ†’Z
- Click header: toggle Aâ†’Z / Zâ†’A

**Interazione:**
- **Click su nome:** Naviga a `/alunni/:id` (Pagina Dettaglio - futura)

```typescript
function goToDetail(alunnoId: string) {
  navigateTo(`/alunni/${alunnoId}`);
}
```

---

### Colonna 2: Pacchetto

**Design:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Mensile 36h  â”‚
â”‚ Scad: 30/11  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Formato:**
- Prima riga: Tipo + Ore totali (es. "Mensile 36h", "Orario 24h")
- Seconda riga: Data scadenza se vicina o scaduto

**Varianti:**

**Pacchetto Attivo:**
```
Mensile 36h
Scad: 30/11/2025
```

**Nessun Pacchetto:**
```
Nessun pacchetto
```

**Componenti:**
- Testo su 2 righe
- Data in `font-size-sm`, `color-text-secondary`

---

### Colonna 3: Ore/Giorni

**Design con distinzione Orario vs Mensile:**

**Pacchetto ORARIO:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  18 / 24 ore          â”‚  â† Usate / Totali
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘ 75%        â”‚  â† Progress bar
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Pacchetto MENSILE:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  8 / 12 giorni        â”‚  â† Giorni (ore/3)
â”‚  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘ 67%        â”‚  â† Progress bar
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Logica di calcolo:**

```typescript
interface OreGiorniDisplay {
  tipo: 'ore' | 'giorni';
  usate: number;
  totali: number;
  residue: number;
  percentuale: number;
}

function calcolaDisplay(pacchetto: PacchettoStudente): OreGiorniDisplay {
  if (pacchetto.tipo === 'mensile') {
    // Converti in giorni (3 ore = 1 giorno)
    const giorniTotali = pacchetto.oreTotali / 3;
    const giorniUsati = pacchetto.oreUsate / 3;
    const giorniResidui = pacchetto.oreResidue / 3;
    
    return {
      tipo: 'giorni',
      usate: Math.round(giorniUsati * 10) / 10,
      totali: Math.round(giorniTotali),
      residue: Math.round(giorniResidui * 10) / 10,
      percentuale: (giorniUsati / giorniTotali) * 100
    };
  } else {
    // Usa ore direttamente
    return {
      tipo: 'ore',
      usate: pacchetto.oreUsate,
      totali: pacchetto.oreTotali,
      residue: pacchetto.oreResidue,
      percentuale: (pacchetto.oreUsate / pacchetto.oreTotali) * 100
    };
  }
}
```

**Colori Progress Bar:**

| Condizione | Colore |
|-----------|--------|
| Residue < 0 (negative) | Rosso `var(--color-error)` |
| Residue < 20% | Arancione `var(--color-warning)` |
| Residue 20-50% | Giallo `var(--color-warning)` |
| Residue > 50% | Verde `var(--color-success)` |

**Componenti:**
- `UProgress` con color dinamico
- Testo sotto con unitÃ  (ore/giorni)

---

### Colonna 4: Stato (Badge Multipli)

**Design: Stati multipli sovrapposti verticalmente**

**Caso 1 - Singolo stato (tutto ok):**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸŸ¢ Attivo   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Caso 2 - Stati multipli (problemi contemporanei):**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ”´ Da Pagare     â”‚  â† PrioritÃ  1
â”‚ âš ï¸ -2 giorni     â”‚  â† PrioritÃ  2
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**PrioritÃ  visualizzazione:**
1. ðŸ”´ **Pagamento Sospeso** (massima urgenza)
2. âš ï¸ **Ore/Giorni Negativi**
3. â° **Pacchetto Scaduto**
4. ðŸŸ¡ **In Scadenza** (<20%)
5. ðŸŸ¢ **Attivo** (tutto ok)
6. âš« **Inattivo** (nessun pacchetto)

**Logica stati:**

```typescript
type AlunnoStato = 
  | 'attivo'
  | 'in-scadenza'
  | 'scaduto'
  | 'sospeso'      // Pagamento non saldato
  | 'ore-negative'
  | 'inattivo';    // Nessun pacchetto

function getStatiAlunno(alunno: Alunno): AlunnoStato[] {
  const stati: AlunnoStato[] = [];
  
  if (!alunno.pacchettoAttivoId) {
    return ['inattivo'];
  }
  
  const pacchetto = getPacchetto(alunno.pacchettoAttivoId);
  
  // Pagamento sospeso (prioritÃ  massima)
  if (!pacchetto.pagamentoSaldato) {
    stati.push('sospeso');
  }
  
  // Ore/giorni negativi
  if (pacchetto.oreResidue < 0) {
    stati.push('ore-negative');
  }
  
  // Scaduto
  if (pacchetto.dataScadenza < new Date()) {
    stati.push('scaduto');
  } else {
    // In scadenza
    const percentualeResidue = (pacchetto.oreResidue / pacchetto.oreTotali) * 100;
    if (percentualeResidue < 20 && percentualeResidue >= 0) {
      stati.push('in-scadenza');
    }
  }
  
  // Se nessun problema, Ã¨ attivo
  if (stati.length === 0) {
    stati.push('attivo');
  }
  
  return stati;
}
```

**Componente Vue:**

```vue
<template>
  <div class="stati-container">
    <UBadge 
      v-for="stato in stati" 
      :key="stato"
      :color="STATI_CONFIG[stato].color"
      :icon="STATI_CONFIG[stato].icon"
      size="sm"
      class="mb-1"
    >
      {{ STATI_CONFIG[stato].label }}
    </UBadge>
  </div>
</template>

<style scoped>
.stati-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
```

**Mapping config:**

```typescript
const STATI_CONFIG = {
  'attivo': {
    color: 'success',
    icon: 'heroicons:check-circle',
    label: 'Attivo'
  },
  'in-scadenza': {
    color: 'warning',
    icon: 'heroicons:clock',
    label: 'In Scadenza'
  },
  'scaduto': {
    color: 'error',
    icon: 'heroicons:x-circle',
    label: 'Scaduto'
  },
  'sospeso': {
    color: 'red',
    icon: 'heroicons:credit-card',
    label: 'Da Pagare'
  },
  'inattivo': {
    color: 'gray',
    icon: 'heroicons:minus-circle',
    label: 'Inattivo'
  },
  'ore-negative': {
    color: 'orange',
    icon: 'heroicons:exclamation-triangle',
    label: (val: number) => `${val} ${Math.abs(val) > 3 ? 'ore' : 'giorni'} negativi`
  }
} as const;
```

---

### Colonna 5: Azioni (Menu Dropdown)

**Design:**

```
â”Œâ”€â”€â”€â”€â”€â”
â”‚  â‹®  â”‚
â””â”€â”€â”€â”€â”€â”˜
  â”‚
  â”œâ”€ ðŸ“¦ Gestisci Pacchetti
  â”œâ”€ âœï¸ Modifica Anagrafica
  â”œâ”€ ðŸ‘ï¸ Vedi Dettaglio
  â”œâ”€ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  â””â”€ ðŸ—‘ï¸ Elimina Alunno
```

**Componenti:**
- `UDropdown` con trigger icon
- `UButton` icon="heroicons:ellipsis-vertical" variant="ghost"

**Voci menu:**

| Azione | Icona | Permesso | Funzione |
|--------|-------|----------|----------|
| **Gestisci Pacchetti** | `heroicons:archive-box` | Tutti | Apre Modal Pacchetti (Tab 1) |
| **Modifica Anagrafica** | `heroicons:pencil` | Admin, Segreteria | Apre modal modifica dati |
| **Vedi Dettaglio** | `heroicons:eye` | Tutti | Naviga a `/alunni/:id` |
| **Elimina Alunno** | `heroicons:trash` | Solo Admin | Modal conferma + elimina |

**Focus principale: "Gestisci Pacchetti"** â†’ Apre modal dedicata (vedi Parte 2)

---

## ðŸ”½ Sistema Filtri

### Slide-over Filtri

**Apertura:** Click bottone "Filtri" â†’ Slide-over da destra

**Layout:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  FILTRI AVANZATI           [X]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                 â”‚
â”‚  ðŸŽ“ Scuola                      â”‚
â”‚  â˜ Elementari                   â”‚
â”‚  â˜ Medie                        â”‚
â”‚  â˜ Superiori                    â”‚
â”‚                                 â”‚
â”‚  ðŸ”´ Stato                       â”‚
â”‚  â˜ Attivo                       â”‚
â”‚  â˜ In Scadenza                  â”‚
â”‚  â˜ Scaduto                      â”‚
â”‚  â˜ Pagamento Sospeso            â”‚
â”‚  â˜ Ore/Giorni Negativi          â”‚
â”‚  â˜ Inattivo                     â”‚
â”‚                                 â”‚
â”‚  ðŸ“¦ Tipo Pacchetto              â”‚
â”‚  â˜ Mensile                      â”‚
â”‚  â˜ Orario                       â”‚
â”‚  â˜ Nessun pacchetto             â”‚
â”‚                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Azzera]        [Applica (2)]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componenti:**
- `USlideover`
- `UCheckbox` per filtri multipli
- `UButton` per azioni footer

---

### Logica Filtri

```typescript
interface FiltriAlunni {
  scuole: ('elementari' | 'medie' | 'superiori')[];
  stati: AlunnoStato[];
  tipoPacchetto: ('mensile' | 'orario' | 'nessuno')[];
}

const filtri = ref<FiltriAlunni>({
  scuole: [],
  stati: [],
  tipoPacchetto: []
});

const alunniFiltered = computed(() => {
  let result = alunni.value;
  
  // Ricerca
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(a => 
      a.nome.toLowerCase().includes(query) ||
      a.cognome.toLowerCase().includes(query)
    );
  }
  
  // Filtro scuola
  if (filtri.value.scuole.length > 0) {
    result = result.filter(a => filtri.value.scuole.includes(a.scuola));
  }
  
  // Filtro stato
  if (filtri.value.stati.length > 0) {
    result = result.filter(a => {
      const statiAlunno = getStatiAlunno(a);
      return statiAlunno.some(s => filtri.value.stati.includes(s));
    });
  }
  
  // Filtro tipo pacchetto
  if (filtri.value.tipoPacchetto.length > 0) {
    result = result.filter(a => {
      if (!a.pacchettoAttivoId && filtri.value.tipoPacchetto.includes('nessuno')) {
        return true;
      }
      const pacchetto = getPacchetto(a.pacchettoAttivoId);
      return pacchetto && filtri.value.tipoPacchetto.includes(pacchetto.tipo);
    });
  }
  
  return result;
});
```

---

## ðŸ“… Vista Pagamenti Annuale

### Nuova Tab: "Pagamenti Annuali"

**Navigazione principale:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [ALUNNI] [PAGAMENTI ANNUALI]  â”‚
â”‚          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Click su "PAGAMENTI ANNUALI" â†’ Switch vista

---

### Layout Tabella Pagamenti

**Tabella calendario con mesi dell'anno:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PAGAMENTI ANNO 2025                        [Solleciti]         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ALUNNO       â”‚ GEN â”‚ FEB â”‚ MAR â”‚ APR â”‚ MAG â”‚ GIU â”‚ ... â†’ DIC   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Marco Rossi  â”‚ âœ…  â”‚ âœ…  â”‚ âœ…  â”‚ âœ…  â”‚ 270 â”‚  -  â”‚   ...       â”‚
â”‚              â”‚270â‚¬ â”‚270â‚¬ â”‚270â‚¬ â”‚270â‚¬ â”‚     â”‚     â”‚             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Sara Bianchi â”‚ âœ…  â”‚ âœ…  â”‚ ðŸ”´  â”‚ ðŸ”´  â”‚ ðŸ”´  â”‚  -  â”‚   ...       â”‚
â”‚              â”‚270â‚¬ â”‚270â‚¬ â”‚270â‚¬ â”‚270â‚¬ â”‚270â‚¬ â”‚     â”‚             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Luca Verdi   â”‚ âœ…  â”‚  -  â”‚ âœ…  â”‚  -  â”‚ âœ…  â”‚ 220 â”‚   ...       â”‚
â”‚              â”‚220â‚¬ â”‚     â”‚220â‚¬ â”‚     â”‚220â‚¬ â”‚     â”‚             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Legenda colori celle:**

| Stato | Colore | Icona | Descrizione |
|-------|--------|-------|-------------|
| **Saldato** | Verde | âœ… | Pagamento completato |
| **Non Saldato** | Rosso | ðŸ”´ | Dovuto ma non pagato |
| **Da Pagare** | Nero | Numero | Importo previsto (futuro) |
| **Nessun Pacchetto** | Grigio | - | Alunno non attivo quel mese |

---

### Interazioni Vista Pagamenti

**Click su cella verde/rossa:**
- Apre modal dettaglio pagamento
- Mostra: Data, Importo, Metodo, Fattura

**Bottone "Solleciti":**
- Genera lista alunni con celle rosse (non saldati)
- Opzione: Invia email automatica ai genitori

**Filtri rapidi:**
```
[Tutti] [Solo Non Saldati] [Solo Attivi]
```

---

### Logica Generazione Tabella

```typescript
interface CellaPagamento {
  alunnoId: string;
  mese: number; // 1-12
  anno: number;
  stato: 'saldato' | 'non-saldato' | 'previsto' | 'vuoto';
  importo: number | null;
  pacchettoId?: string;
  dataPagamento?: Date;
}

function generaTabellaAnno(anno: number): CellaPagamento[][] {
  const risultato: CellaPagamento[][] = [];
  
  for (const alunno of alunni.value) {
    const rigaAlunno: CellaPagamento[] = [];
    
    for (let mese = 1; mese <= 12; mese++) {
      // Trova pacchetto attivo in quel mese
      const pacchetto = trovaPacchettoPerMese(alunno.id, anno, mese);
      
      if (!pacchetto) {
        rigaAlunno.push({
          alunnoId: alunno.id,
          mese,
          anno,
          stato: 'vuoto',
          importo: null
        });
        continue;
      }
      
      // Determina stato
      let stato: CellaPagamento['stato'];
      const oggi = new Date();
      const mesePacchetto = new Date(anno, mese - 1, 1);
      
      if (mesePacchetto > oggi) {
        stato = 'previsto'; // Futuro
      } else if (pacchetto.pagamentoSaldato) {
        stato = 'saldato';
      } else {
        stato = 'non-saldato'; // Dovuto ma non pagato
      }
      
      rigaAlunno.push({
        alunnoId: alunno.id,
        mese,
        anno,
        stato,
        importo: pacchetto.prezzo,
        pacchettoId: pacchetto.id,
        dataPagamento: pacchetto.dataPagamento
      });
    }
    
    risultato.push(rigaAlunno);
  }
  
  return risultato;
}
```

---

## ðŸŽ¨ Stati e Badge

**Configurazione completa giÃ  descritta nella Colonna 4.**

**Componente riutilizzabile:**

```vue
<template>
  <div class="badge-stack">
    <StatoBadge 
      v-for="stato in stati" 
      :key="stato"
      :stato="stato"
      :valore-negativo="valoreNegativo"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  stati: AlunnoStato[];
  valoreNegativo?: number; // Per "ore-negative"
}

const props = defineProps<Props>();
</script>
```

---

## ðŸ“„ Paginazione e Scroll

### Scroll Infinito

**NO paginazione classica, SI scroll infinito:**

```typescript
const pageSize = 20;
const currentPage = ref(1);

const alunniVisibili = computed(() => {
  const end = currentPage.value * pageSize;
  return alunniFiltered.value.slice(0, end);
});

// Detect scroll bottom
function handleScroll() {
  const scrollPosition = window.innerHeight + window.scrollY;
  const threshold = document.body.offsetHeight - 200;
  
  if (scrollPosition >= threshold && hasMore.value) {
    currentPage.value++;
  }
}

const hasMore = computed(() => 
  alunniVisibili.value.length < alunniFiltered.value.length
);
```

**Componente:**
- `IntersectionObserver` per rilevare fine lista
- Loading spinner durante caricamento

**Footer info:**

```
Mostrando 60 di 89 alunni  [caricamento...]
```

---

## ðŸ“± Responsive Mobile

### Layout Mobile (<768px)

**Trasformazione:** Tabella â†’ Card verticali

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ” Cerca...                    â”‚
â”‚  [Filtri]  [+ Nuovo]            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Marco Rossi       ðŸŸ¢    â”‚   â”‚
â”‚  â”‚ Mensile â€¢ 8/12 gg       â”‚   â”‚
â”‚  â”‚ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘              â”‚   â”‚
â”‚  â”‚ [Pacchetti]  [â‹®]        â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”   â”‚
â”‚  â”‚ Sara Bianchi    ðŸ”´ âš ï¸  â”‚   â”‚
â”‚  â”‚ Orario â€¢ 18/24 h        â”‚   â”‚
â”‚  â”‚ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘               â”‚   â”‚
â”‚  â”‚ [Pacchetti]  [â‹®]        â”‚   â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜   â”‚
â”‚                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Componente Card Mobile:**

```vue
<template>
  <div class="alunno-card-mobile">
    <div class="card-header">
      <h3>{{ alunno.nome }} {{ alunno.cognome }}</h3>
      <div class="stati">
        <UBadge v-for="stato in stati" :key="stato" :color="getColor(stato)" size="xs">
          {{ getLabel(stato) }}
        </UBadge>
      </div>
    </div>
    
    <div class="card-body">
      <p class="pacchetto">{{ display.tipo }} â€¢ {{ display.usate }}/{{ display.totali }} {{ display.unita }}</p>
      <UProgress :value="display.percentuale" :color="progressColor" size="sm" />
    </div>
    
    <div class="card-actions">
      <UButton variant="outline" @click="apriPacchetti">
        Pacchetti
      </UButton>
      <UDropdown :items="actions">
        <UButton icon="heroicons:ellipsis-horizontal" variant="ghost" />
      </UDropdown>
    </div>
  </div>
</template>
```

---

# PARTE 2: MODAL GESTISCI PACCHETTI

---

## ðŸ“¦ Modal Gestisci Pacchetti

### Apertura Modal

Dal menu azioni (â‹®) nella tabella:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“¦ Gestisci Pacchetti   â”‚  â† Click
â”‚ âœï¸ Modifica Anagrafica  â”‚
â”‚ ðŸ‘ï¸ Vedi Dettaglio      â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”‚
â”‚ ðŸ—‘ï¸ Elimina Alunno       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Modal si apre con:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PACCHETTI - Marco Rossi                                  [X]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Storico Pacchetti] [Registra Pagamento] [Rinnova Pacchetto]  â”‚
â”‚  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•                                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**3 Tab:**
1. **Storico Pacchetti** - Visualizza tutti i pacchetti (attivi + passati) + azioni rapide
2. **Registra Pagamento** - Form pagamento veloce
3. **Rinnova Pacchetto** - Wizard rinnovo con gestione ore residue

---

## ðŸ“‚ Tab Storico Pacchetti

### Layout Completo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“Š Riepilogo Totale                                           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Pacchetti Acquistati: 4                                  â”‚  â”‚
â”‚  â”‚ Totale Speso: 1.080,00â‚¬                                  â”‚  â”‚
â”‚  â”‚ Ore Totali: 144h â€¢ Utilizzate: 130h â€¢ Perse: 8h         â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                 â”‚
â”‚  ðŸŸ¢ PACCHETTO ATTIVO                                           â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ ðŸ“¦ Mensile Superiori 36h                                 â”‚  â”‚
â”‚  â”‚ Periodo: 01/11/2025 â†’ 30/11/2025 â€¢ Prezzo: 270,00â‚¬      â”‚  â”‚
â”‚  â”‚                                                           â”‚  â”‚
â”‚  â”‚ â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘ 24/36 ore (67%) â€¢ 12 ore rimanenti         â”‚  â”‚
â”‚  â”‚                                                           â”‚  â”‚
â”‚  â”‚ ðŸ’³ Pagamento: âœ… Saldato il 03/11/2025                   â”‚  â”‚
â”‚  â”‚ ðŸ“„ Fattura: âš ï¸ Da emettere (cliente richiede)           â”‚  â”‚
â”‚  â”‚                                                           â”‚  â”‚
â”‚  â”‚ [Vedi Lezioni â–¼]  [âœï¸ Modifica]  [ðŸ—‘ï¸ Elimina]          â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                 â”‚
â”‚  ðŸ“‚ STORICO (3 pacchetti)                                      â”‚
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ ðŸ“¦ Recupero Orario 24h                                   â”‚  â”‚
â”‚  â”‚ Periodo: 15/06/2025 â†’ 15/09/2025 â€¢ Prezzo: 220,00â‚¬      â”‚  â”‚
â”‚  â”‚ âš ï¸ Scaduto: 20/24 ore usate (4h perse)                   â”‚  â”‚
â”‚  â”‚ ðŸ”´ Pagamento: NON SALDATO (220,00â‚¬ dovuti)               â”‚  â”‚
â”‚  â”‚ ðŸ“„ Fattura: Da emettere                                  â”‚  â”‚
â”‚  â”‚                                                           â”‚  â”‚
â”‚  â”‚ [Vedi Lezioni â–¼]  [ðŸ’³ Paga]  [âœï¸ Modifica]  [ðŸ—‘ï¸ Elimina]â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Bottoni Azioni Contestuali

**Ogni card mostra bottoni diversi in base allo stato:**

#### **Pacchetto ATTIVO & SALDATO:**
```
[Vedi Lezioni â–¼]  [âœï¸ Modifica]  [ðŸ—‘ï¸ Elimina]
```

#### **Pacchetto NON SALDATO (attivo o scaduto):**
```
[Vedi Lezioni â–¼]  [ðŸ’³ Paga]  [âœï¸ Modifica]  [ðŸ—‘ï¸ Elimina]
```

#### **Pacchetto COMPLETATO & SALDATO:**
```
[Vedi Lezioni â–¼]  [ðŸ“„ Scarica Fattura]
```

---

### Azione: "ðŸ’³ Paga"

**Click su "ðŸ’³ Paga"** â†’ Switcha automaticamente a **Tab 2: Registra Pagamento** con pacchetto pre-selezionato

```typescript
function handlePagaRapido(pacchettoId: string) {
  pacchettoPreselezionato.value = pacchettoId;
  activeTab.value = 1; // Tab Pagamento
}
```

---

### Azione: "âœï¸ Modifica"

**Apre modal secondaria:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  MODIFICA PACCHETTO                   [X]  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Pacchetto: Recupero Orario 24h            â”‚
â”‚                                            â”‚
â”‚  Data inizio *    [15/06/2025] [ðŸ“…]       â”‚
â”‚  Data scadenza *  [15/09/2025] [ðŸ“…]       â”‚
â”‚  Ore totali *     [24] ore                 â”‚
â”‚  Prezzo *         [220,00] â‚¬               â”‚
â”‚                                            â”‚
â”‚  [Annulla]    [ðŸ’¾ Salva Modifiche]        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Azione: "ðŸ—‘ï¸ Elimina"

**Modal conferma:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  âš ï¸ CONFERMA ELIMINAZIONE                 â”‚
â”‚                                            â”‚
â”‚  Stai per eliminare:                       â”‚
â”‚  Recupero Orario 24h (15/06 â†’ 15/09)      â”‚
â”‚                                            â”‚
â”‚  âš ï¸ 5 lezioni associate verranno eliminate â”‚
â”‚                                            â”‚
â”‚  Questa azione Ã¨ IRREVERSIBILE.            â”‚
â”‚                                            â”‚
â”‚  [Annulla]  [ðŸ—‘ï¸ Elimina Pacchetto]        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Espansione: "Vedi Lezioni"

**Click espande card inline:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“¦ Recupero Orario 24h              [Chiudi â–²]          â”‚
â”‚                                                           â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ ðŸ“… LEZIONI (5 sessioni)                             â”‚  â”‚
â”‚ â”‚                                                      â”‚  â”‚
â”‚ â”‚ ðŸ”µ 18/06/2025 â€¢ 15:30-17:30                         â”‚  â”‚
â”‚ â”‚    Tutor: Mario Rossi â€¢ Singola â€¢ 2h scalate        â”‚  â”‚
â”‚ â”‚                                                      â”‚  â”‚
â”‚ â”‚ ðŸ”µ 22/06/2025 â€¢ 16:30-20:30                         â”‚  â”‚
â”‚ â”‚    Tutor: Giulia Bianchi â€¢ Singola â€¢ 4h scalate    â”‚  â”‚
â”‚ â”‚                                                      â”‚  â”‚
â”‚ â”‚ [... altre 3 lezioni ...]                           â”‚  â”‚
â”‚ â”‚                                                      â”‚  â”‚
â”‚ â”‚ TOTALE: 20 ore utilizzate su 24                     â”‚  â”‚
â”‚ â”‚ âš ï¸ 4 ore perse per scadenza                         â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ’³ Tab Registra Pagamento

### Form Pagamento

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ’³ REGISTRA PAGAMENTO                                         â”‚
â”‚                                                                 â”‚
â”‚  âš ï¸ Pacchetti da saldare: 2                                    â”‚
â”‚                                                                 â”‚
â”‚  Pacchetto da pagare *                                         â”‚
â”‚  [Mensile Superiori 36h (01/11 â†’ 30/11)  â–¼]                   â”‚
â”‚    â”œâ”€ Mensile Superiori 36h - 270,00â‚¬                         â”‚
â”‚    â””â”€ Recupero Orario 24h - 220,00â‚¬                           â”‚
â”‚                                                                 â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚  â”‚ Importo dovuto:    270,00â‚¬                                â”‚  â”‚
â”‚  â”‚ Sconto:            0,00â‚¬                                  â”‚  â”‚
â”‚  â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                              â”‚  â”‚
â”‚  â”‚ TOTALE DA PAGARE:  270,00â‚¬                                â”‚  â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                                 â”‚
â”‚  Importo ricevuto *   [270,00] â‚¬                               â”‚
â”‚                                                                 â”‚
â”‚  Metodo di pagamento *                                         â”‚
â”‚  â—‹ Contanti  â— Bonifico  â—‹ Carta  â—‹ Assegno                  â”‚
â”‚                                                                 â”‚
â”‚  Data pagamento *     [18/11/2025] [ðŸ“…]                       â”‚
â”‚                                                                 â”‚
â”‚  Note (opzionale)                                              â”‚
â”‚  [Pagamento bonifico - Rif: BNF-20251118-ROSSI]              â”‚
â”‚                                                                 â”‚
â”‚  â˜ Richiede fattura elettronica                               â”‚
â”‚     (Traccia se il cliente vuole fattura - da emettere dopo)  â”‚
â”‚                                                                 â”‚
â”‚  [Annulla]                    [ðŸ’¾ Registra Pagamento]         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Checkbox Fattura - FunzionalitÃ 

**âš ï¸ IMPORTANTE: Checkbox NON emette fattura automaticamente**

```
â˜ Richiede fattura elettronica
```

**Funzione:**
- âœ… Traccia solo l'informazione: cliente vuole/non vuole fattura
- âŒ NON genera numero fattura
- âŒ NON crea documento automaticamente
- âœ… Serve come **promemoria** per admin

**Dopo il salvataggio:**

Nello **Storico Pacchetti**, se `richiedeFattura === true`:

```
ðŸ“„ Fattura: âš ï¸ Da emettere (cliente richiede)
```

Se `richiedeFattura === false`:

```
ðŸ“„ Fattura: Non richiesta dal cliente
```

**Logica implementativa:**

```typescript
interface RegistrazionePagamento {
  pacchettoId: string;
  importoRicevuto: number;
  metodoPagamento: 'contanti' | 'bonifico' | 'carta' | 'assegno';
  dataPagamento: Date;
  note?: string;
  richiedeFattura: boolean; // â† Campo chiave
}

async function registraPagamento(data: RegistrazionePagamento) {
  await db.pacchetti.update({
    where: { id: data.pacchettoId },
    data: { 
      pagamentoSaldato: true,
      dataPagamento: data.dataPagamento,
      metodoPagamento: data.metodoPagamento,
      richiedeFattura: data.richiedeFattura // â† Salvato nel DB
    }
  });
  
  // NON genera fattura qui
  // Admin la emetterÃ  manualmente se necessario
}
```

---

## ðŸ”„ Tab Rinnova Pacchetto

### Form Rinnovo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ”„ RINNOVA PACCHETTO                                          â”‚
â”‚                                                                 â”‚
â”‚  ðŸ“¦ Pacchetto Attuale:                                         â”‚
â”‚  Mensile Superiori 36h â€¢ 01/11/2025 â†’ 30/11/2025              â”‚
â”‚  â° Stato: Scaduto (4 ore residue)                            â”‚
â”‚                                                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”‚
â”‚                                                                 â”‚
â”‚  STEP 1: Tipo Rinnovo                                          â”‚
â”‚  â— Rinnova stesso pacchetto (Mensile Superiori 36h - 270â‚¬)    â”‚
â”‚  â—‹ Cambia tipo pacchetto                                       â”‚
â”‚                                                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”‚
â”‚                                                                 â”‚
â”‚  STEP 2: Date                                                  â”‚
â”‚  Data inizio *    [01/12/2025] [ðŸ“…]                           â”‚
â”‚  Data scadenza    31/12/2025 (calcolata automaticamente)       â”‚
â”‚                                                                 â”‚
â”‚  â˜‘ Rinnovo automatico mensile                                 â”‚
â”‚     (Rinnovato automaticamente il 1Â° di ogni mese)            â”‚
â”‚                                                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”‚
â”‚                                                                 â”‚
â”‚  STEP 3: Gestione Ore Residue                                 â”‚
â”‚  âš ï¸ Il pacchetto precedente ha 4 ore non utilizzate            â”‚
â”‚                                                                 â”‚
â”‚  â— Trasferisci ore al nuovo pacchetto                         â”‚
â”‚    â†’ Nuovo pacchetto: 40 ore (36 + 4)                         â”‚
â”‚  â—‹ Non trasferire (ore perse)                                 â”‚
â”‚  â—‹ Rimborsa ore: 4h Ã— 7,50â‚¬ = 30,00â‚¬                          â”‚
â”‚                                                                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”‚
â”‚                                                                 â”‚
â”‚  RIEPILOGO:                                                    â”‚
â”‚  Pacchetto: Mensile Superiori 40h (36 + 4 trasferite)         â”‚
â”‚  Periodo: 01/12/2025 â†’ 31/12/2025                             â”‚
â”‚  Prezzo: 270,00â‚¬                                               â”‚
â”‚  Rinnovo automatico: SÃ¬                                        â”‚
â”‚                                                                 â”‚
â”‚  [Annulla]                    [ðŸ”„ Crea Rinnovo]               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Rinnovo Automatico Mensile

**Checkbox:** `â˜‘ Rinnovo automatico mensile`

**Funzionamento:**

```typescript
// Cron job eseguito ogni giorno alle 00:01
async function rinnovoAutomaticoPacchettiMensili() {
  const oggi = new Date();
  
  // Solo il 1Â° del mese
  if (oggi.getDate() !== 1) return;
  
  // Trova pacchetti mensili con rinnovo automatico attivo
  const pacchettiDaRinnovare = await db.pacchetti.findMany({
    where: {
      tipo: 'mensile',
      stato: 'attivo',
      rinnovoAutomatico: true
    }
  });
  
  for (const vecchioPacchetto of pacchettiDaRinnovare) {
    // Crea nuovo pacchetto identico
    const nuovoPacchetto = await db.pacchetti.create({
      data: {
        alunnoId: vecchioPacchetto.alunnoId,
        tipo: 'mensile',
        nome: vecchioPacchetto.nome,
        oreTotali: vecchioPacchetto.oreTotali,
        oreUsate: 0,
        oreResidue: vecchioPacchetto.oreTotali,
        prezzo: vecchioPacchetto.prezzo,
        dataInizio: new Date(),
        dataScadenza: getEndOfMonth(new Date()),
        pagamentoSaldato: false, // Da pagare
        rinnovoAutomatico: true
      }
    });
    
    // Chiudi vecchio pacchetto
    await db.pacchetti.update({
      where: { id: vecchioPacchetto.id },
      data: { stato: 'completato' }
    });
    
    // Aggiorna alunno
    await db.alunni.update({
      where: { id: vecchioPacchetto.alunnoId },
      data: { pacchettoAttivoId: nuovoPacchetto.id }
    });
    
    // Invia email notifica al genitore
    await sendEmail({
      to: alunno.emailGenitore,
      subject: 'Rinnovo Pacchetto Mensile',
      body: `Pacchetto rinnovato per ${formatMonth(new Date())}`
    });
  }
}
```

---

# PARTE 3: IMPLEMENTAZIONE

---

## ðŸ’¾ Struttura Dati TypeScript

### Interface Alunno

```typescript
interface Alunno {
  id: string;
  
  // Anagrafica
  nome: string;
  cognome: string;
  dataNascita: Date;
  scuola: 'elementari' | 'medie' | 'superiori';
  classe?: string;
  
  // Contatti genitore
  nomeGenitore: string;
  cognomeGenitore: string;
  emailGenitore: string;
  telefonoGenitore: string;
  
  // Pacchetto corrente
  pacchettoAttivoId?: string;
  
  // Storico
  pacchetti: string[]; // Array ID pacchetti
  
  // Stato
  attivo: boolean;
  dataIscrizione: Date;
  dataUltimaLezione?: Date;
  
  // Note
  note?: string;
  allergie?: string;
  bisogniSpeciali?: string;
}
```

---

### Interface PacchettoStudente

```typescript
interface PacchettoStudente {
  id: string;
  alunnoId: string;
  
  // Info pacchetto
  nome: string;
  tipo: 'mensile' | 'orario';
  oreTotali: number;
  oreUsate: number;
  oreResidue: number; // PuÃ² essere negativo
  prezzo: number;
  
  // Date
  dataInizio: Date;
  dataScadenza: Date;
  dataChiusura?: Date;
  
  // Stato
  stato: 'attivo' | 'scaduto' | 'completato';
  
  // Pagamento
  pagamentoSaldato: boolean;
  dataPagamento?: Date;
  metodoPagamento?: 'contanti' | 'bonifico' | 'carta' | 'assegno';
  
  // Fattura (NUOVO)
  richiedeFattura: boolean;     // Cliente vuole fattura?
  numeroFattura?: string;       // Es. "2025-0142"
  dataEmissioneFattura?: Date;
  
  // Rinnovo
  rinnovoAutomatico: boolean;   // Per pacchetti mensili
  
  // Lezioni
  lezioni: Lezione[];
}
```

---

### Interface Lezione

```typescript
interface Lezione {
  id: string;
  pacchettoId: string;
  alunnoId: string;
  tutorId: string;
  
  data: Date;
  orarioInizio: string; // "15:30"
  orarioFine: string;   // "17:30"
  
  tipo: 'singola' | 'gruppo' | 'maxi' | 'mezza';
  oreScalate: number;
  
  note?: string;
}
```

---

### Type Helper per Display

```typescript
interface OreGiorniDisplay {
  tipo: 'ore' | 'giorni';
  usate: number;
  totali: number;
  residue: number;
  percentuale: number;
  unita: string; // "ore" | "giorni"
}

type AlunnoStato = 
  | 'attivo'
  | 'in-scadenza'
  | 'scaduto'
  | 'sospeso'
  | 'ore-negative'
  | 'inattivo';
```

---

## ðŸ§® Logiche di Calcolo

### Calcolo Ore vs Giorni

```typescript
function calcolaDisplay(pacchetto: PacchettoStudente): OreGiorniDisplay {
  if (pacchetto.tipo === 'mensile') {
    // 3 ore = 1 giorno
    const giorniTotali = pacchetto.oreTotali / 3;
    const giorniUsati = pacchetto.oreUsate / 3;
    const giorniResidui = pacchetto.oreResidue / 3;
    
    return {
      tipo: 'giorni',
      usate: Math.round(giorniUsati * 10) / 10,
      totali: Math.round(giorniTotali),
      residue: Math.round(giorniResidui * 10) / 10,
      percentuale: (giorniUsati / giorniTotali) * 100,
      unita: 'giorni'
    };
  } else {
    return {
      tipo: 'ore',
      usate: pacchetto.oreUsate,
      totali: pacchetto.oreTotali,
      residue: pacchetto.oreResidue,
      percentuale: (pacchetto.oreUsate / pacchetto.oreTotali) * 100,
      unita: 'ore'
    };
  }
}
```

---

### Calcolo Stati Multipli

```typescript
function getStatiAlunno(alunno: Alunno): AlunnoStato[] {
  const stati: AlunnoStato[] = [];
  
  if (!alunno.pacchettoAttivoId) {
    return ['inattivo'];
  }
  
  const pacchetto = getPacchetto(alunno.pacchettoAttivoId);
  
  // PrioritÃ  1: Pagamento sospeso
  if (!pacchetto.pagamentoSaldato) {
    stati.push('sospeso');
  }
  
  // PrioritÃ  2: Ore/giorni negativi
  if (pacchetto.oreResidue < 0) {
    stati.push('ore-negative');
  }
  
  // PrioritÃ  3: Scaduto
  if (pacchetto.dataScadenza < new Date()) {
    stati.push('scaduto');
  } else {
    // In scadenza
    const percentuale = (pacchetto.oreResidue / pacchetto.oreTotali) * 100;
    if (percentuale < 20 && percentuale >= 0) {
      stati.push('in-scadenza');
    }
  }
  
  // Nessun problema = attivo
  if (stati.length === 0) {
    stati.push('attivo');
  }
  
  return stati;
}
```

---

## ðŸŒ API Endpoints

```typescript
// GET - Lista alunni con filtri
GET /api/alunni
Query params:
  - search: string
  - scuola: string[]
  - stato: string[]
  - tipoPacchetto: string[]
  - limit: number (per scroll infinito)
  - offset: number

Response: {
  data: Alunno[],
  total: number,
  hasMore: boolean
}

// GET - Dettaglio alunno
GET /api/alunni/:id

// POST - Crea alunno
POST /api/alunni
Body: Omit<Alunno, 'id'>

// PATCH - Modifica alunno
PATCH /api/alunni/:id
Body: Partial<Alunno>

// DELETE - Elimina alunno
DELETE /api/alunni/:id

// GET - Pacchetti alunno
GET /api/alunni/:id/pacchetti

// POST - Registra pagamento
POST /api/pacchetti/:id/pagamento
Body: {
  importo: number,
  metodoPagamento: string,
  dataPagamento: Date,
  richiedeFattura: boolean
}

// POST - Rinnova pacchetto
POST /api/pacchetti/:id/rinnova
Body: {
  trasferisciOre: boolean,
  rinnovoAutomatico: boolean,
  dataInizio: Date
}

// GET - Tabella pagamenti annuale
GET /api/alunni/pagamenti-anno/:anno
Response: CellaPagamento[][]
```

---

## ðŸŽ¨ Componenti Nuxt UI Utilizzati

| Componente | Utilizzo |
|------------|----------|
| `UCard` | Stat Cards, card pacchetti |
| `UStat` | Numeri statistiche |
| `UBadge` | Stati alunni, conteggi |
| `UButton` | Azioni, trigger |
| `UInput` | Ricerca testuale |
| `UCheckbox` | Filtri multipli |
| `URadio` | Opzioni esclusive |
| `UDropdown` | Menu azioni, selezioni |
| `UProgress` | Barra ore/giorni |
| `USlideover` | Pannello filtri |
| `UModal` | Form, conferme |
| `UTooltip` | Spiegazioni hover |
| `UTabs` | Navigazione tab (Alunni/Pagamenti, Modal Pacchetti) |
| `UTable` | Tabella pagamenti annuale (opzionale) |

---

## âœ… Checklist Implementazione

### Fase 1: Setup Base
- [ ] Route `/alunni` in Nuxt
- [ ] Composable `useAlunni()`
- [ ] API endpoints backend
- [ ] TypeScript interfaces

### Fase 2: UI Tabella Principale
- [ ] Stat Cards (3 cards)
- [ ] Barra ricerca + azioni
- [ ] Tabella 5 colonne
- [ ] Scroll infinito

### Fase 3: FunzionalitÃ  Core
- [ ] Ricerca real-time (debounced)
- [ ] Sistema filtri (slide-over)
- [ ] Ordinamento colonne
- [ ] Calcolo Ore vs Giorni

### Fase 4: Stati e Badge
- [ ] Logica calcolo stati multipli
- [ ] Componente badge stack
- [ ] Progress bar colori dinamici

### Fase 5: Modal Gestisci Pacchetti
- [ ] Tab 1: Storico (con azioni)
- [ ] Tab 2: Registra Pagamento
- [ ] Tab 3: Rinnova Pacchetto
- [ ] Azioni rapide (Paga, Modifica, Elimina)

### Fase 6: Vista Pagamenti Annuale
- [ ] Tab "Pagamenti Annuali"
- [ ] Tabella calendario GEN-DIC
- [ ] Colori celle (verde/rosso/nero/grigio)
- [ ] Bottone "Solleciti"

### Fase 7: Rinnovo Automatico
- [ ] Checkbox rinnovo automatico
- [ ] Cron job (esecuzione 1Â° del mese)
- [ ] Email notifica rinnovo

### Fase 8: Responsive Mobile
- [ ] Tabella â†’ Card list
- [ ] Stat cards stack verticale
- [ ] Filtri full-screen

### Fase 9: Performance
- [ ] Virtual scrolling (se >500 alunni)
- [ ] Debouncing ricerca
- [ ] Lazy loading pacchetti

### Fase 10: Testing
- [ ] Test con 100+ alunni
- [ ] Test filtri combinati
- [ ] Test stati multipli contemporanei
- [ ] Test rinnovo automatico
- [ ] AccessibilitÃ  keyboard

---

## ðŸŽ¯ Riepilogo FunzionalitÃ  Chiave

### âœ… **Cosa rende questa pagina efficace:**

1. **Tabella compatta** (5 colonne essenziali)
2. **Distinzione Ore/Giorni** (pacchetti orari vs mensili)
3. **Stati multipli visibili** (puÃ² mostrare 2-3 problemi contemporaneamente)
4. **Modal unificata Pacchetti** (tutto in un posto)
5. **Azioni rapide** (Paga, Modifica, Elimina direttamente da storico)
6. **Vista Pagamenti Annuale** (calendario GEN-DIC)
7. **Rinnovo automatico** (il 1Â° del mese per pacchetti mensili)
8. **Scroll infinito** (NO paginazione classica)
9. **Checkbox fattura intelligente** (solo tracciamento, non generazione)
10. **Filtri rapidi da Stat Cards** (click â†’ applica filtro)

---

**Fine Documentazione Completa Pagina Alunni v2.0**

*Documento creato il: 3 Novembre 2025 - 20:30*
*Integra tutte le discussioni e modifiche concordate*