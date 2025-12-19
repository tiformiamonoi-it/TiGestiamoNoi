# ðŸ’° WebApp Doposcuola 2.0 - Pagina ContabilitÃ 

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

### PARTE 2: STAT CARDS PANORAMICA
4. [Layout Stat Cards Compatte](#layout-stat-cards-compatte)
5. [Card Entrate](#card-entrate)
6. [Card Uscite](#card-uscite)
7. [Card Bilancio e Metriche](#card-bilancio-metriche)

### PARTE 3: FILTRI E PERIODO
8. [Filtro Periodo](#filtro-periodo)
9. [Presets Periodo](#presets-periodo)
10. [Date Range Custom](#date-range-custom)

### PARTE 4: GRAFICI RIEPILOGO
11. [Grafico Entrate per Categoria](#grafico-entrate-categoria)
12. [Grafico Uscite per Categoria](#grafico-uscite-categoria)

### PARTE 5: TABELLA MOVIMENTI
13. [Struttura Tabella](#struttura-tabella)
14. [Colonne Tabella](#colonne-tabella)
15. [Badge Automatico/Manuale](#badge-automatico-manuale)
16. [Filtri Avanzati](#filtri-avanzati)
17. [Azioni Movimento](#azioni-movimento)

### PARTE 6: MODAL NUOVO MOVIMENTO
18. [Form Nuovo Movimento](#form-nuovo-movimento)
19. [Categorie ContabilitÃ ](#categorie-contabilita)
20. [Checkbox Fattura Emessa](#checkbox-fattura-emessa)

### PARTE 7: INTEGRAZIONE AUTOMATICA
21. [Pagamenti Pacchetti Alunni](#pagamenti-pacchetti-alunni)
22. [Pagamenti Compensi Tutor](#pagamenti-compensi-tutor)
23. [Gestione Pro Bono](#gestione-pro-bono)
24. [Eliminazione Movimenti Auto](#eliminazione-movimenti-auto)

### PARTE 8: METRICHE AVANZATE
25. [Break-even Point](#break-even-point)
26. [Cashflow Medio](#cashflow-medio)
27. [Tasso di Crescita](#tasso-crescita)
28. [Margine Netto %](#margine-netto)

### PARTE 9: IMPLEMENTAZIONE TECNICA
29. [Struttura Dati TypeScript](#struttura-dati-typescript)
30. [API Endpoints](#api-endpoints)
31. [Componenti Nuxt UI](#componenti-nuxt-ui)
32. [Responsive Mobile](#responsive-mobile)
33. [Checklist Implementazione](#checklist-implementazione)

---

# PARTE 1: STRUTTURA GENERALE

---

## ðŸŽ¯ Panoramica Pagina

### Scopo della Pagina

La Pagina ContabilitÃ  Ã¨ il **centro finanziario** della web app, progettata per:

- **Monitoraggio entrate/uscite** (con distinzione contanti/banca)
- **Calcolo bilancio e margini** (profittabilitÃ  business)
- **Gestione movimenti manuali** (affitto, utenze, cancelleria)
- **Integrazione automatica** (pagamenti pacchetti, compensi tutor)
- **Analisi cashflow** (medio giornaliero, break-even point)
- **Grafici riepilogo** (categorie entrate/uscite)
- **Export contabile** (Excel, PDF)

### Architettura Visiva

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ HEADER + NAVBAR + SIDEBAR (layout globale)                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                               â”‚
â”‚ ðŸ’° CONTABILITÃ€                                               â”‚
â”‚                                                               â”‚
â”‚ Periodo: [Mese corrente â–¼] oppure [Da: 01/10] [A: 31/10]   â”‚
â”‚                                                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ STAT CARDS (8 card compatte in 2 righe)                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ GRAFICO ENTRATE         â”‚  â”‚ GRAFICO USCITE           â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ FILTRI + [+ Nuovo Movimento] [ðŸ“¤ Export]                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                               â”‚
â”‚ TABELLA MOVIMENTI                                            â”‚
â”‚                                                               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ”— Route e Navigazione

### Route

```
/contabilita
```

### Navigazione Verso Questa Pagina

**Da Sidebar:**
- Click su **"ContabilitÃ "** nel menu principale

**Da Dashboard:**
- Widget Panoramica Finanziaria â†’ Link "Vedi ContabilitÃ "

### Navigazione Da Questa Pagina

**Bottone Export:**
- Naviga a `/export?type=contabilita&periodo=...`

---

## ðŸ” Permessi e Accessi

| Utente | Visualizzazione | Aggiungi Movimento | Modifica Movimento | Elimina Movimento |
|--------|-----------------|--------------------|--------------------|-------------------|
| **Admin** | âœ… Tutto | âœ… Si | âœ… Tutto | âœ… Tutto |
| **Segreteria** | âœ… Tutto | âœ… Si | âœ… Manuali | âŒ Solo Manuali |
| **Tutor** | âŒ No | âŒ No | âŒ No | âŒ No |

**Nota:**
- Movimenti **Automatici** (da pagamenti/compensi) modificabili/eliminabili solo da Admin
- Movimenti **Manuali** modificabili/eliminabili da Admin e Segreteria

---

# PARTE 2: STAT CARDS PANORAMICA

---

## ðŸ“Š Layout Stat Cards Compatte

### Struttura 2 Righe Ã— 4 Card

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ PANORAMICA CONTABILE - Ottobre 2025                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚ â”‚ ðŸ’¶ 4.850â‚¬    â”‚ â”‚ ðŸ’¸ 1.420â‚¬    â”‚ â”‚ ðŸ’° 3.430â‚¬    â”‚ â”‚ +12% â”‚â”‚
â”‚ â”‚ ENTRATE      â”‚ â”‚ USCITE       â”‚ â”‚ BILANCIO     â”‚ â”‚ vs   â”‚â”‚
â”‚ â”‚ Banca: 3.200â‚¬â”‚ â”‚ Banca: 800â‚¬  â”‚ â”‚              â”‚ â”‚ sett â”‚â”‚
â”‚ â”‚ Cont.: 1.650â‚¬â”‚ â”‚ Cont.: 620â‚¬  â”‚ â”‚              â”‚ â”‚      â”‚â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”Œâ”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚ â”‚ ðŸ’µ 3.120â‚¬    â”‚ â”‚ ðŸ“Š 110â‚¬/g    â”‚ â”‚ ðŸŽ¯ 1.200â‚¬    â”‚ â”‚ 71%  â”‚â”‚
â”‚ â”‚ MARGINE      â”‚ â”‚ CASHFLOW     â”‚ â”‚ BREAK-EVEN   â”‚ â”‚ MARG â”‚â”‚
â”‚ â”‚ LORDO        â”‚ â”‚ MEDIO        â”‚ â”‚              â”‚ â”‚ %    â”‚â”‚
â”‚ â”‚              â”‚ â”‚              â”‚ â”‚              â”‚ â”‚      â”‚â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â””â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**8 Card Totali:**
1. **Entrate Totali** (+ breakdown banca/contanti)
2. **Uscite Totali** (+ breakdown banca/contanti)
3. **Bilancio** (Entrate - Uscite)
4. **Variazione %** (vs periodo precedente)
5. **Margine Lordo** (Entrate - Costo Tutor)
6. **Cashflow Medio** (â‚¬/giorno)
7. **Break-even Point** (quanto manca)
8. **Margine Netto %** (profittabilitÃ )

---

## ðŸ’¶ Card Entrate

### Layout Card Compatta

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’¶ 4.850â‚¬    â”‚  â† Totale grande
â”‚ ENTRATE      â”‚
â”‚ Banca: 3.200â‚¬â”‚  â† Breakdown piccolo
â”‚ Cont.: 1.650â‚¬â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Elementi:**
- **Totale:** Font grande, bold (24-30px)
- **Label:** "ENTRATE" uppercase, grigio
- **Breakdown:** Font piccolo (11-12px), sotto
  - Banca: â‚¬
  - Contanti: â‚¬

---

## ðŸ’¸ Card Uscite

### Layout Card Compatta

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’¸ 1.420â‚¬    â”‚  â† Totale grande
â”‚ USCITE       â”‚
â”‚ Banca: 800â‚¬  â”‚  â† Breakdown piccolo
â”‚ Cont.: 620â‚¬  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Elementi:**
- **Totale:** Font grande, bold
- **Label:** "USCITE" uppercase, grigio
- **Breakdown:** Font piccolo
  - Banca: â‚¬
  - Contanti: â‚¬

---

## ðŸ’° Card Bilancio e Metriche

### Card Bilancio

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’° 3.430â‚¬    â”‚
â”‚ BILANCIO     â”‚
â”‚              â”‚
â”‚              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Calcolo:** Entrate Totali - Uscite Totali

**Colore:**
- Verde: Positivo (+)
- Rosso: Negativo (-)

---

### Card Variazione %

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”
â”‚ +12%  â”‚
â”‚ vs    â”‚
â”‚ sett  â”‚
â”‚       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Calcolo:** ((Bilancio Attuale - Bilancio Precedente) / Bilancio Precedente) Ã— 100

**Colore:**
- Verde: Crescita (+)
- Rosso: Calo (-)

---

### Card Margine Lordo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’µ 3.120â‚¬    â”‚
â”‚ MARGINE      â”‚
â”‚ LORDO        â”‚
â”‚              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Calcolo:** Entrate - Costo Tutor (solo compensi tutor, escluso Pro Bono)

**Nota:** Diverso da Bilancio (che sottrae TUTTE le uscite)

---

### Card Cashflow Medio

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“Š 110â‚¬/g    â”‚
â”‚ CASHFLOW     â”‚
â”‚ MEDIO        â”‚
â”‚              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Calcolo:** Bilancio / Giorni Periodo

---

### Card Break-even Point

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸŽ¯ 1.200â‚¬    â”‚
â”‚ BREAK-EVEN   â”‚
â”‚              â”‚
â”‚              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Calcolo:** Costi Fissi Mensili - Bilancio Corrente

**Se Bilancio >= Costi Fissi:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸŽ¯ âœ…        â”‚
â”‚ BREAK-EVEN   â”‚
â”‚ RAGGIUNTO    â”‚
â”‚              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Card Margine Netto %

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”
â”‚ 71%   â”‚
â”‚ MARG  â”‚
â”‚ %     â”‚
â”‚       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Calcolo:** (Bilancio / Entrate) Ã— 100

---

# PARTE 3: FILTRI E PERIODO

---

## ðŸ“… Filtro Periodo

### Opzione A: Dropdown Presets

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Periodo: [Mese corrente â–¼]                               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Opzioni:**
- Mese corrente
- Ultimo mese
- Ultimi 3 mesi
- Anno corrente
- Tutto lo storico
- Custom (apre date range)

---

### Opzione B: Date Range Custom

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Da: [01/10/2025] [ðŸ“…]   A: [31/10/2025] [ðŸ“…]           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Implementazione Combinata (Opzione C)

```vue
<template>
  <div class="filtro-periodo">
    <USelectMenu 
      v-model="periodoPreset" 
      :options="presets"
      @change="applicaPreset"
    />
    
    <div v-if="periodoPreset === 'custom'" class="date-range">
      <UInput 
        v-model="dataInizio" 
        type="date" 
        label="Da"
      />
      <UInput 
        v-model="dataFine" 
        type="date" 
        label="A"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const periodoPreset = ref('mese_corrente');
const dataInizio = ref('');
const dataFine = ref('');

const presets = [
  { value: 'mese_corrente', label: 'Mese corrente' },
  { value: 'ultimo_mese', label: 'Ultimo mese' },
  { value: 'ultimi_3_mesi', label: 'Ultimi 3 mesi' },
  { value: 'anno_corrente', label: 'Anno corrente' },
  { value: 'tutto', label: 'Tutto lo storico' },
  { value: 'custom', label: 'Personalizzato...' }
];

function applicaPreset(preset: string) {
  const today = new Date();
  
  switch (preset) {
    case 'mese_corrente':
      dataInizio.value = startOfMonth(today);
      dataFine.value = endOfMonth(today);
      break;
    case 'ultimo_mese':
      dataInizio.value = subMonths(today, 1);
      dataFine.value = today;
      break;
    // ... altri casi
  }
  
  caricaDati();
}
</script>
```

---

## ðŸ“ˆ Presets Periodo

### Calcolo Date per Preset

```typescript
function getDateRangeFromPreset(preset: string): { inizio: Date; fine: Date } {
  const today = new Date();
  
  switch (preset) {
    case 'mese_corrente':
      return {
        inizio: startOfMonth(today),
        fine: endOfMonth(today)
      };
    
    case 'ultimo_mese':
      return {
        inizio: subMonths(today, 1),
        fine: today
      };
    
    case 'ultimi_3_mesi':
      return {
        inizio: subMonths(today, 3),
        fine: today
      };
    
    case 'anno_corrente':
      return {
        inizio: new Date(today.getFullYear(), 0, 1),
        fine: endOfYear(today)
      };
    
    case 'tutto':
      return {
        inizio: new Date(2020, 0, 1), // Data minima
        fine: today
      };
    
    default:
      return { inizio: today, fine: today };
  }
}
```

---

# PARTE 4: GRAFICI RIEPILOGO

---

## ðŸ“Š Grafico Entrate per Categoria

### Layout Grafico

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RIEPILOGO ENTRATE PER CATEGORIA                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                    â”‚
â”‚   Grafico Torta/Donut                             â”‚
â”‚                                                    â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚   â”‚ Rette Alunni 90% (4.365â‚¬)          â”‚         â”‚
â”‚   â”‚   Banca: 3.000â‚¬ (65%)              â”‚         â”‚
â”‚   â”‚   Contanti: 1.365â‚¬ (35%)           â”‚         â”‚
â”‚   â”‚                                     â”‚         â”‚
â”‚   â”‚ Altro 10% (485â‚¬)                   â”‚         â”‚
â”‚   â”‚   Banca: 200â‚¬ (41%)                â”‚         â”‚
â”‚   â”‚   Contanti: 285â‚¬ (59%)             â”‚         â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Elementi:**
- Grafico torta principale (categorie)
- Legenda con percentuali
- **Breakdown contanti/banca** per ogni categoria (sotto)

---

## ðŸ“Š Grafico Uscite per Categoria

### Layout Grafico

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RIEPILOGO USCITE PER CATEGORIA                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                    â”‚
â”‚   Grafico Torta/Donut                             â”‚
â”‚                                                    â”‚
â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”         â”‚
â”‚   â”‚ Affitto 40% (568â‚¬)                 â”‚         â”‚
â”‚   â”‚   Banca: 568â‚¬ (100%)               â”‚         â”‚
â”‚   â”‚   Contanti: 0â‚¬                     â”‚         â”‚
â”‚   â”‚                                     â”‚         â”‚
â”‚   â”‚ Rimborsi Tutor 35% (497â‚¬)          â”‚         â”‚
â”‚   â”‚   Banca: 200â‚¬ (40%)                â”‚         â”‚
â”‚   â”‚   Contanti: 297â‚¬ (60%)             â”‚         â”‚
â”‚   â”‚                                     â”‚         â”‚
â”‚   â”‚ Utenze 15% (213â‚¬)                  â”‚         â”‚
â”‚   â”‚   Banca: 213â‚¬ (100%)               â”‚         â”‚
â”‚   â”‚                                     â”‚         â”‚
â”‚   â”‚ Cancelleria 5% (71â‚¬)               â”‚         â”‚
â”‚   â”‚   Contanti: 71â‚¬ (100%)             â”‚         â”‚
â”‚   â”‚                                     â”‚         â”‚
â”‚   â”‚ Altro 5% (71â‚¬)                     â”‚         â”‚
â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

# PARTE 5: TABELLA MOVIMENTI

---

## ðŸ“‹ Struttura Tabella

### Layout Tabella Completa

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Filtri: [Tipo â–¼] [Categoria â–¼] [Metodo â–¼] [Origine â–¼]     â”‚
â”‚ [Cerca...] [Range: Min â‚¬ - Max â‚¬]                           â”‚
â”‚ [+ Nuovo Movimento] [ðŸ“¤ Export]                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                               â”‚
â”‚ â•”â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•—â”‚
â”‚ â•‘ DATA â•‘ BADGEâ•‘ TIPO   â•‘ IMPORTO   â•‘ METODO     â•‘ CATEGORIA â•‘â”‚
â”‚ â• â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•£â”‚
â”‚ â•‘ 20/10â•‘ Auto â•‘ Entrataâ•‘ 220,00â‚¬   â•‘ Bonifico   â•‘ Rette     â•‘â”‚
â”‚ â•‘      â•‘      â•‘        â•‘           â•‘            â•‘ Alunni    â•‘â”‚
â”‚ â• â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•£â”‚
â”‚ â•‘ 18/10â•‘ Manuaâ•‘ Uscita â•‘ 50,00â‚¬    â•‘ Contanti   â•‘ Utenze    â•‘â”‚
â”‚ â•‘      â•‘      â•‘        â•‘           â•‘            â•‘           â•‘â”‚
â”‚ â• â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•£â”‚
â”‚ â•‘ 15/10â•‘ Auto â•‘ Uscita â•‘ 8,00â‚¬     â•‘ Contanti   â•‘ Rimborsi  â•‘â”‚
â”‚ â•‘      â•‘      â•‘        â•‘           â•‘            â•‘ Tutor     â•‘â”‚
â”‚ â•šâ•â•â•â•â•â•â•©â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â”‚
â”‚                                                               â”‚
â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•—                   â”‚
â”‚ â•‘ DESCRIZIONE   â•‘ NOTE          â•‘ AZIONI â•‘                   â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•£                   â”‚
â”‚ â•‘ Pagamento...  â•‘ Bonifico fattoâ•‘ [â‹®]   â•‘                   â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•£                   â”‚
â”‚ â•‘ Bolletta luce â•‘ -             â•‘ [â‹®]   â•‘                   â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•£                   â”‚
â”‚ â•‘ Compenso M... â•‘ -             â•‘ [â‹®]   â•‘                   â”‚
â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“‘ Colonne Tabella

### Colonne Implementate

**Colonna 1: Data**
- Formato: DD/MM/YYYY
- Ordinabile

**Colonna 2: Badge Auto/Manuale**
- `Auto` (verde chiaro)
- `Manuale` (blu chiaro)

**Colonna 3: Tipo**
- `Entrata` (verde)
- `Uscita` (rosso)

**Colonna 4: Importo**
- Formato: 1.234,56â‚¬
- Con segno (+/-)

**Colonna 5: Metodo Pagamento**
- Bonifico
- Contanti
- POS
- Altro

**Colonna 6: Categoria**
- Nome categoria

**Colonna 7: Descrizione**
- Testo breve (max 50 caratteri)

**Colonna 8: Note Interne**
- Campo opzionale
- Visibile solo Admin/Segreteria

**Colonna 9: Azioni**
- Menu dropdown (â‹®)

---

## ðŸ·ï¸ Badge Automatico/Manuale

### Visualizzazione Badge

```typescript
<template>
  <UBadge 
    :color="movimento.automatico ? 'green' : 'blue'"
    variant="soft"
  >
    {{ movimento.automatico ? 'Auto' : 'Manuale' }}
  </UBadge>
</template>
```

**Styling:**

```css
.badge-auto {
  background: rgba(var(--color-success-rgb), 0.1);
  color: var(--color-success);
}

.badge-manuale {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
}
```

---

## ðŸ” Filtri Avanzati

### Filtri Disponibili

**1. Tipo (Entrata/Uscita):**
```
[Tutti â–¼]
  â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Tutti      â”‚
â”‚ Entrate    â”‚
â”‚ Uscite     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**2. Categoria:**
```
[Tutte â–¼]
  â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â˜‘ Tutte        â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
â”‚ â˜ Rette Alunni â”‚
â”‚ â˜ Affitto      â”‚
â”‚ â˜ Utenze       â”‚
â”‚ â˜ Rimborsi     â”‚
â”‚ â˜ Altro        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**3. Metodo Pagamento:**
```
[Tutti â–¼]
  â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Tutti      â”‚
â”‚ Bonifico   â”‚
â”‚ Contanti   â”‚
â”‚ POS        â”‚
â”‚ Altro      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**4. Origine:**
```
[Tutti â–¼]
  â†“
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Tutti      â”‚
â”‚ Automatico â”‚
â”‚ Manuale    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**5. Range Importo:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Min: [0] â‚¬   Max: [10000] â‚¬ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**6. Ricerca Testuale:**
```
[Cerca in descrizione o categoria...]
```

---

## âš™ï¸ Azioni Movimento

### Menu Dropdown

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ‘ï¸ Vedi Dettaglio  â”‚ â†’ Apre modal info complete
â”‚ âœï¸ Modifica        â”‚ â†’ Solo Manuali o Admin
â”‚ ðŸ—‘ï¸ Elimina         â”‚ â†’ Solo Admin
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Logica Permessi:**

```typescript
const azioniDisponibili = computed(() => {
  const azioni = [];
  
  // Vedi dettaglio sempre disponibile
  azioni.push({
    label: 'Vedi Dettaglio',
    icon: 'heroicons:eye',
    click: () => vediDettaglio(movimento.value.id)
  });
  
  // Modifica
  if (isAdmin.value || (movimento.value.automatico === false && isSegreteria.value)) {
    azioni.push({
      label: 'Modifica',
      icon: 'heroicons:pencil',
      click: () => modificaMovimento(movimento.value.id)
    });
  }
  
  // Elimina (solo Admin)
  if (isAdmin.value) {
    azioni.push({
      label: 'Elimina',
      icon: 'heroicons:trash',
      click: () => eliminaMovimento(movimento.value.id)
    });
  }
  
  return azioni;
});
```

---

# PARTE 6: MODAL NUOVO MOVIMENTO

---

## ðŸ“ Form Nuovo Movimento

### Layout Modal Completo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NUOVO MOVIMENTO CONTABILE                           [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                           â”‚
â”‚ TIPO MOVIMENTO:                                          â”‚
â”‚ â— Entrata  â—‹ Uscita                                     â”‚
â”‚                                                          â”‚
â”‚ IMPORTO:           DATA:                                â”‚
â”‚ [50,00] â‚¬          [21/10/2025]                         â”‚
â”‚                                                          â”‚
â”‚ METODO PAGAMENTO:                                        â”‚
â”‚ [Bonifico â–¼]                                            â”‚
â”‚   â€¢ Bonifico                                            â”‚
â”‚   â€¢ Contanti                                            â”‚
â”‚   â€¢ POS                                                 â”‚
â”‚   â€¢ Altro                                               â”‚
â”‚                                                          â”‚
â”‚ CATEGORIA:                                               â”‚
â”‚ [Utenze â–¼]                                              â”‚
â”‚                                                          â”‚
â”‚ DESCRIZIONE:                                             â”‚
â”‚ [Bolletta luce mese di Ottobre]                        â”‚
â”‚                                                          â”‚
â”‚ NOTE INTERNE (opzionale):                                â”‚
â”‚ [Pagato in ritardo, sanzione applicata]                â”‚
â”‚                                                          â”‚
â”‚ â˜ Fattura emessa                                        â”‚
â”‚                                                          â”‚
â”‚ [Annulla]                        [ðŸ’¾ Salva Movimento]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Validazione Form

```typescript
const movimentoSchema = z.object({
  tipo: z.enum(['entrata', 'uscita']),
  importo: z.number().min(0.01, 'Importo deve essere > 0'),
  data: z.date(),
  metodo: z.enum(['bonifico', 'contanti', 'pos', 'altro']),
  categoria: z.string().min(1, 'Categoria obbligatoria'),
  descrizione: z.string().min(3, 'Minimo 3 caratteri'),
  noteInterne: z.string().optional(),
  fatturaEmessa: z.boolean()
});

const form = useForm({
  validationSchema: toTypedSchema(movimentoSchema)
});
```

---

## ðŸ—‚ï¸ Categorie ContabilitÃ 

### Categorie Predefinite

**Entrate:**
- Rette Alunni (automatica)
- Altro (manuale)

**Uscite:**
- Rimborsi Tutor (automatica)
- Affitto
- Utenze
- Cancelleria
- Marketing/PubblicitÃ 
- Materiali Didattici
- Manutenzione
- Assicurazioni
- Software/Abbonamenti
- Altro

---

### Gestione Categorie

**Dove:** Pagina Impostazioni (futura)

**CRUD Categorie:**

```typescript
interface CategoriaContabilita {
  id: string;
  nome: string;
  tipo: 'entrata' | 'uscita';
  predefinita: boolean; // False se custom
  attiva: boolean;
  icona?: string;
}

// API
GET /api/categorie-contabilita
POST /api/categorie-contabilita
PATCH /api/categorie-contabilita/:id
DELETE /api/categorie-contabilita/:id
```

---

## âœ… Checkbox Fattura Emessa

### Logica Checkbox

**Label:**
```
â˜ Fattura emessa (traccia se manca fattura)
```

**Significato:**
- **Checked (âœ…):** Fattura presente e archiviata
- **Unchecked (â˜):** Fattura mancante o da emettere

**Uso:**
- Permette di tracciare movimenti senza fattura
- Utile per report fiscali e scadenziari
- Non blocca inserimento (solo flag informativo)

---

# PARTE 7: INTEGRAZIONE AUTOMATICA

---

## ðŸ’³ Pagamenti Pacchetti Alunni

### Quando si Crea Movimento

**Trigger:** Registri pagamento pacchetto in Dettaglio Alunno

**Azione:**

```typescript
async function salvaPagamentoPacchetto(pagamento: PagamentoPacchetto) {
  // 1. Salva pagamento pacchetto
  const savedPagamento = await db.pagamentiPacchetti.create({
    alunnoId: pagamento.alunnoId,
    pacchettoId: pagamento.pacchettoId,
    importo: pagamento.importo,
    metodo: pagamento.metodo, // bonifico/contanti/pos
    data: pagamento.data,
    note: pagamento.note
  });
  
  // 2. Crea movimento automatico in contabilitÃ 
  await db.movimentiContabili.create({
    tipo: 'entrata',
    importo: pagamento.importo,
    metodo: pagamento.metodo,
    categoria: 'Rette Alunni',
    descrizione: `Pagamento pacchetto ${alunno.nome} ${alunno.cognome} - ${pacchetto.tipo}`,
    data: pagamento.data,
    automatico: true,
    riferimentoId: savedPagamento.id,
    riferimentoTipo: 'pagamento_pacchetto',
    fatturaEmessa: true // Auto-fattura per rette
  });
  
  toast.success('Pagamento registrato e movimento in contabilitÃ  creato');
}
```

---

### Quando si Elimina Pagamento

**Trigger:** Elimini pagamento pacchetto

**Azione:**

```typescript
async function eliminaPagamentoPacchetto(id: string) {
  // 1. Elimina movimento contabilitÃ  collegato
  await db.movimentiContabili.deleteWhere({
    riferimentoId: id,
    riferimentoTipo: 'pagamento_pacchetto'
  });
  
  // 2. Elimina pagamento
  await db.pagamentiPacchetti.delete(id);
  
  toast.success('Pagamento e movimento contabilitÃ  eliminati');
}
```

---

## ðŸ’¸ Pagamenti Compensi Tutor

### Quando si Crea Movimento

**Trigger:** Paghi compenso tutor da Pagina Tutor

**Azione:**

```typescript
async function pagaCompensoTutor(compenso: CompensoTutor) {
  // IMPORTANTE: Solo se NON Pro Bono
  if (compenso.proBono) {
    // Pro Bono NON va in contabilitÃ 
    return;
  }
  
  // Salva compenso
  const savedCompenso = await db.compensiTutor.update(compenso.id, {
    pagato: true,
    dataPagamento: new Date(),
    metodoPagamento: compenso.metodo,
    importo: compenso.importo
  });
  
  // Crea movimento automatico in contabilitÃ 
  await db.movimentiContabili.create({
    tipo: 'uscita',
    importo: compenso.importo,
    metodo: compenso.metodo,
    categoria: 'Rimborsi Tutor',
    descrizione: `Compenso ${tutor.nome} ${tutor.cognome} - ${compenso.mese}`,
    data: new Date(),
    automatico: true,
    riferimentoId: savedCompenso.id,
    riferimentoTipo: 'compenso_tutor',
    fatturaEmessa: false // Rimborsi solitamente senza fattura
  });
}
```

---

### Pagamento Bulk

**Trigger:** Paghi piÃ¹ tutor insieme (bulk)

**Azione:**

```typescript
async function pagaCompensiBulk(compensi: CompensoTutor[]) {
  for (const compenso of compensi) {
    // Salta Pro Bono
    if (compenso.proBono) continue;
    
    await pagaCompensoTutor(compenso);
  }
  
  toast.success(`${compensi.length} compensi pagati e registrati in contabilitÃ `);
}
```

---

## ðŸŽ Gestione Pro Bono

### Logica Pro Bono

**Regola:** I compensi Pro Bono **NON** entrano in contabilitÃ 

**PerchÃ©:**
- Compenso 0â‚¬ intenzionale (non errore)
- Non impatta bilancio reale
- Esempi: CEO fa lezione, lezione prova gratuita

**Implementazione:**

```typescript
// Query movimenti contabilitÃ  (escludi Pro Bono alla fonte)
function getMovimentiContabili(periodo: PeriodoFiltro) {
  return db.movimentiContabili.findMany({
    where: {
      data: {
        gte: periodo.inizio,
        lte: periodo.fine
      },
      // Pro Bono non hanno movimento, quindi query normale
    }
  });
}

// Compensi tutor con Pro Bono visibili
function getCompensiTutor(periodo: PeriodoFiltro) {
  return db.compensiTutor.findMany({
    where: {
      mese: periodo.mese,
      // Include Pro Bono: true/false (tutti)
    }
  });
}
```

---

## ðŸ—‘ï¸ Eliminazione Movimenti Auto

### Quando Elimini Pagamento/Compenso

**Caso 1: Elimina Pagamento Pacchetto**

Movimento contabilitÃ  collegato viene **eliminato automaticamente**

**Caso 2: Elimina Compenso Tutor**

Movimento contabilitÃ  collegato viene **eliminato automaticamente**

**Implementazione:**

```typescript
// Trigger database
CREATE TRIGGER on_delete_pagamento_pacchetto
AFTER DELETE ON pagamenti_pacchetti
FOR EACH ROW
BEGIN
  DELETE FROM movimenti_contabili
  WHERE riferimentoId = OLD.id 
  AND riferimentoTipo = 'pagamento_pacchetto';
END;

CREATE TRIGGER on_delete_compenso_tutor
AFTER DELETE ON compensi_tutor
FOR EACH ROW
BEGIN
  DELETE FROM movimenti_contabili
  WHERE riferimentoId = OLD.id 
  AND riferimentoTipo = 'compenso_tutor';
END;
```

---

# PARTE 8: METRICHE AVANZATE

---

## ðŸŽ¯ Break-even Point

### Definizione

**Break-even Point** = Punto di pareggio tra entrate e costi fissi

**Formula:**
```
Break-even Point = Costi Fissi Mensili - Bilancio Corrente
```

**Se Bilancio >= Costi Fissi:** Break-even raggiunto (0â‚¬)

---

### Costi Fissi Mensili

**Configurabili in Impostazioni:**

```typescript
interface CostiFissi {
  affitto: number;      // 600â‚¬
  utenze: number;       // 150â‚¬
  software: number;     // 50â‚¬
  // ... altri costi ricorrenti
  totale: number;       // Somma automatica
}

// Esempio
const costiFissi: CostiFissi = {
  affitto: 600,
  utenze: 150,
  software: 50,
  totale: 800
};
```

---

### Calcolo Break-even

```typescript
function calcolaBreakEven(bilancio: number, costiFissi: number): BreakEven {
  if (bilancio >= costiFissi) {
    return {
      raggiunto: true,
      mancante: 0,
      percentuale: 100,
      messaggio: 'âœ… Break-even raggiunto!'
    };
  } else {
    const mancante = costiFissi - bilancio;
    const percentuale = (bilancio / costiFissi) * 100;
    
    return {
      raggiunto: false,
      mancante: Math.round(mancante),
      percentuale: Math.round(percentuale),
      messaggio: `ðŸŽ¯ Mancano ${mancante}â‚¬ al break-even (${percentuale}%)`
    };
  }
}
```

---

## ðŸ“Š Cashflow Medio

### Formula

```
Cashflow Medio = Bilancio / Giorni Periodo
```

**Esempio:**
```
Bilancio: 3.430â‚¬
Periodo: Ottobre 2025 (31 giorni)
Cashflow Medio: 3.430â‚¬ / 31 = 110,6â‚¬/giorno
```

---

### Implementazione

```typescript
function calcolaCashflowMedio(bilancio: number, periodo: PeriodoFiltro): number {
  const giorni = differenceInDays(periodo.fine, periodo.inizio) + 1;
  return Math.round(bilancio / giorni);
}
```

---

## ðŸ“ˆ Tasso di Crescita

### Formula

```
Tasso Crescita = ((Bilancio Attuale - Bilancio Precedente) / Bilancio Precedente) Ã— 100
```

**Esempio:**
```
Bilancio Attuale (Ottobre): 3.430â‚¬
Bilancio Precedente (Settembre): 3.064â‚¬
Crescita: ((3.430 - 3.064) / 3.064) Ã— 100 = +11,9%
```

---

### Implementazione

```typescript
function calcolaTassoCrescita(
  bilancioAttuale: number, 
  bilancioPrecedente: number
): TassoCrescita {
  if (bilancioPrecedente === 0) {
    return {
      percentuale: 0,
      trend: 'neutro',
      messaggio: 'N/A'
    };
  }
  
  const percentuale = ((bilancioAttuale - bilancioPrecedente) / bilancioPrecedente) * 100;
  const trend = percentuale > 0 ? 'positivo' : percentuale < 0 ? 'negativo' : 'neutro';
  
  return {
    percentuale: Math.round(percentuale * 10) / 10, // 1 decimale
    trend,
    messaggio: `${percentuale > 0 ? '+' : ''}${percentuale.toFixed(1)}%`
  };
}
```

---

## ðŸ’¹ Margine Netto %

### Formula

```
Margine Netto % = (Bilancio / Entrate) Ã— 100
```

**Esempio:**
```
Bilancio: 3.430â‚¬
Entrate: 4.850â‚¬
Margine Netto: (3.430 / 4.850) Ã— 100 = 70,7%
```

**Interpretazione:**
- **> 50%:** Ottima profittabilitÃ 
- **30-50%:** Buona profittabilitÃ 
- **< 30%:** Margini ristretti

---

### Implementazione

```typescript
function calcolaMargineNetto(bilancio: number, entrate: number): number {
  if (entrate === 0) return 0;
  return Math.round((bilancio / entrate) * 100);
}
```

---

# PARTE 9: IMPLEMENTAZIONE TECNICA

---

## ðŸ’¾ Struttura Dati TypeScript

### Interface MovimentoContabile

```typescript
interface MovimentoContabile {
  id: string;
  tipo: 'entrata' | 'uscita';
  importo: number;
  metodo: 'bonifico' | 'contanti' | 'pos' | 'altro';
  categoria: string; // "Rette Alunni", "Affitto", ecc.
  descrizione: string;
  noteInterne?: string;
  fatturaEmessa: boolean; // True se fattura presente
  data: Date;
  
  // Origine movimento
  automatico: boolean; // True se creato da sistema
  riferimentoId?: string; // ID pagamento/compenso
  riferimentoTipo?: 'pagamento_pacchetto' | 'compenso_tutor';
  
  // Audit
  creatoIl: Date;
  creatoDa: string; // User ID
  modificatoIl?: Date;
  modificatoDa?: string;
}

interface PanoramicaContabile {
  // Entrate
  entrateTotali: number;
  entrateBanca: number;
  entrateContanti: number;
  variazioneEntrate: number; // %
  
  // Uscite
  usciteTotali: number;
  usciteBanca: number;
  usciteContanti: number;
  variazioneUscite: number; // %
  
  // Bilanci
  bilancio: number; // Entrate - Uscite
  margineLordo: number; // Entrate - Costo Tutor
  cashflowMedio: number; // Bilancio / giorni
  breakEvenPoint: number; // Quanto manca a coprire costi fissi
  margineNetto: number; // % (Bilancio / Entrate Ã— 100)
}

interface CategoriaContabilita {
  id: string;
  nome: string;
  tipo: 'entrata' | 'uscita';
  predefinita: boolean; // False se custom
  attiva: boolean;
  icona?: string;
}

interface BreakEven {
  raggiunto: boolean;
  mancante: number;
  percentuale: number;
  messaggio: string;
}

interface TassoCrescita {
  percentuale: number;
  trend: 'positivo' | 'negativo' | 'neutro';
  messaggio: string;
}
```

---

## ðŸŒ API Endpoints

```typescript
// GET - Panoramica contabile
GET /api/contabilita/panoramica
Query: 
  - dataInizio: string (YYYY-MM-DD)
  - dataFine: string (YYYY-MM-DD)
Response: PanoramicaContabile

// GET - Lista movimenti
GET /api/contabilita/movimenti
Query:
  - dataInizio: string
  - dataFine: string
  - tipo?: 'entrata' | 'uscita'
  - categoria?: string
  - metodo?: string
  - automatico?: boolean
  - ricerca?: string
Response: MovimentoContabile[]

// POST - Crea movimento manuale
POST /api/contabilita/movimenti
Body: {
  tipo: 'entrata' | 'uscita';
  importo: number;
  metodo: string;
  categoria: string;
  descrizione: string;
  noteInterne?: string;
  fatturaEmessa: boolean;
  data: Date;
}
Response: MovimentoContabile

// PATCH - Modifica movimento
PATCH /api/contabilita/movimenti/:id
Body: Partial<MovimentoContabile>
Response: MovimentoContabile

// DELETE - Elimina movimento
DELETE /api/contabilita/movimenti/:id

// GET - Breakdown categorie (per grafici)
GET /api/contabilita/breakdown-categorie
Query:
  - dataInizio: string
  - dataFine: string
  - tipo: 'entrata' | 'uscita'
Response: Array<{
  categoria: string;
  totale: number;
  banca: number;
  contanti: number;
  percentuale: number;
}>

// GET - Costi fissi (da impostazioni)
GET /api/impostazioni/costi-fissi
Response: CostiFissi

// PATCH - Aggiorna costi fissi
PATCH /api/impostazioni/costi-fissi
Body: CostiFissi
```

---

## ðŸŽ¨ Componenti Nuxt UI Utilizzati

| Componente | Utilizzo |
|------------|----------|
| `UCard` | Stat cards, grafici |
| `UButton` | Azioni, nuovo movimento, export |
| `UBadge` | Auto/Manuale, Tipo movimento |
| `UModal` | Nuovo movimento, vedi dettaglio |
| `UInput` | Form campi testo, importo |
| `USelect` | Dropdown filtri, categoria, metodo |
| `UCheckbox` | Fattura emessa |
| `UTextarea` | Descrizione, note interne |
| `UTable` | Tabella movimenti |
| `UDropdown` | Azioni movimento (â‹®) |
| `URadioGroup` | Tipo movimento (Entrata/Uscita) |

---

## ðŸ“± Responsive Mobile

### Layout Mobile (<768px)

**Stat Cards:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’° CONTABILITÃ€              â”‚
â”‚ Ottobre 2025                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ’¶ 4.850â‚¬                   â”‚
â”‚ ENTRATE                     â”‚
â”‚ Banca: 3.200â‚¬               â”‚
â”‚ Cont.: 1.650â‚¬               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ’¸ 1.420â‚¬                   â”‚
â”‚ USCITE                      â”‚
â”‚ Banca: 800â‚¬                 â”‚
â”‚ Cont.: 620â‚¬                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ’° 3.430â‚¬                   â”‚
â”‚ BILANCIO                    â”‚
â”‚ +12% vs settembre           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ’µ 3.120â‚¬                   â”‚
â”‚ MARGINE LORDO               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ“Š 110â‚¬/g                   â”‚
â”‚ CASHFLOW MEDIO              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸŽ¯ 1.200â‚¬                   â”‚
â”‚ BREAK-EVEN                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ 71%                         â”‚
â”‚ MARGINE NETTO %             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Tabella Movimenti:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ 20/10/2025                  â”‚
â”‚ ðŸ’¶ ENTRATA - 220â‚¬          â”‚
â”‚ Auto | Bonifico             â”‚
â”‚ Rette Alunni                â”‚
â”‚ Pagamento pacchetto...      â”‚
â”‚ [â‹®]                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ 18/10/2025                  â”‚
â”‚ ðŸ’¸ USCITA - 50â‚¬            â”‚
â”‚ Manuale | Contanti          â”‚
â”‚ Utenze                      â”‚
â”‚ Bolletta luce...            â”‚
â”‚ [â‹®]                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Ottimizzazioni:**
- Stack verticale card
- Card movimento full-width
- Bottoni touch-friendly
- Modal full-screen

---

## âœ… Checklist Implementazione

### Fase 1: Route e Struttura Base (3 giorni)
- [ ] Route `/contabilita`
- [ ] Composable `useContabilita()`
- [ ] Layout pagina + filtro periodo
- [ ] Gestione permessi

### Fase 2: Stat Cards Panoramica (5 giorni)
- [ ] API calcolo panoramica
- [ ] 8 Card compatte (layout 2Ã—4)
- [ ] Card Entrate (breakdown banca/contanti)
- [ ] Card Uscite (breakdown banca/contanti)
- [ ] Card Bilancio
- [ ] Card Variazione %
- [ ] Card Margine Lordo
- [ ] Card Cashflow Medio
- [ ] Card Break-even Point
- [ ] Card Margine Netto %

### Fase 3: Filtro Periodo (3 giorni)
- [ ] Dropdown presets (mese, 3 mesi, anno, tutto)
- [ ] Date range custom
- [ ] Logica calcolo periodo
- [ ] Refresh dati automatico

### Fase 4: Grafici Riepilogo (4 giorni)
- [ ] Grafico Entrate per Categoria (torta + breakdown)
- [ ] Grafico Uscite per Categoria (torta + breakdown)
- [ ] Legenda con percentuali
- [ ] Breakdown contanti/banca per categoria

### Fase 5: Tabella Movimenti (6 giorni)
- [ ] Tabella responsive con 9 colonne
- [ ] Badge Auto/Manuale
- [ ] Formattazione importi
- [ ] Paginazione (50 per pagina)
- [ ] Ordinamento colonne
- [ ] Menu azioni (â‹®)

### Fase 6: Filtri Avanzati (4 giorni)
- [ ] Filtro Tipo (Entrate/Uscite)
- [ ] Filtro Categoria (multi-select)
- [ ] Filtro Metodo Pagamento
- [ ] Filtro Origine (Auto/Manuale)
- [ ] Range Importo (min/max)
- [ ] Ricerca testuale (descrizione + categoria)

### Fase 7: Modal Nuovo Movimento (3 giorni)
- [ ] Form completo (8 campi)
- [ ] Validazione
- [ ] Dropdown categoria dinamico
- [ ] Checkbox Fattura Emessa
- [ ] Salvataggio + refresh

### Fase 8: Integrazione Automatica (5 giorni)
- [ ] Hook pagamento pacchetto â†’ Crea entrata
- [ ] Hook compenso tutor â†’ Crea uscita
- [ ] Logica Pro Bono (skip contabilitÃ )
- [ ] Hook eliminazione â†’ Rimuovi movimento
- [ ] Test integrazione completa

### Fase 9: Metriche Avanzate (4 giorni)
- [ ] Funzione calcolo Break-even Point
- [ ] Funzione Cashflow Medio
- [ ] Funzione Tasso di Crescita
- [ ] Funzione Margine Netto %
- [ ] Configurazione Costi Fissi (Impostazioni)

### Fase 10: Export (2 giorni)
- [ ] Bottone Export â†’ Pagina Export
- [ ] Pre-compilazione parametri

### Fase 11: Responsive Mobile (3 giorni)
- [ ] Layout mobile stat cards (stack)
- [ ] Tabella mobile (card verticali)
- [ ] Filtri mobile ottimizzati
- [ ] Modal full-screen mobile

### Fase 12: Performance (2 giorni)
- [ ] Caching panoramica
- [ ] Lazy loading movimenti
- [ ] Debouncing ricerca

### Fase 13: Testing (4 giorni)
- [ ] Test integrazione pagamenti/compensi
- [ ] Test calcoli metriche
- [ ] Test filtri combinati
- [ ] Test eliminazione cascata
- [ ] Test permessi utente
- [ ] Test responsive mobile

**Totale stimato: 48 giorni lavorativi**

---

## ðŸŽ¯ Riepilogo FunzionalitÃ  Chiave

### âœ… **Cosa rende questa pagina efficace:**

1. **8 Stat Cards compatte** (breakdown contanti/banca)
2. **Metriche avanzate** (Break-even, Cashflow, Crescita, Margine %)
3. **Grafici categorie** (con breakdown metodo pagamento)
4. **Integrazione automatica** (pagamenti pacchetti, compensi tutor)
5. **Gestione Pro Bono** (esclusi da contabilitÃ )
6. **Filtri potenti** (6 filtri + ricerca)
7. **Badge Auto/Manuale** (distinzione origine)
8. **Eliminazione cascata** (rimuove movimento se elimini pagamento)
9. **Fattura Emessa** (tracking fiscale)
10. **Note interne** (info aggiuntive Admin/Segreteria)
11. **Export contabile** (Excel, PDF)
12. **Responsive mobile** (card verticali)

### ðŸ”— **Collegamenti Esterni:**

**Da questa pagina:**
- `/export?type=contabilita&periodo=...` (Export) â†’ Pagina Export

**Verso questa pagina:**
- Sidebar â†’ "ContabilitÃ "
- Dashboard â†’ Widget Panoramica Finanziaria

**Integrazione automatica da:**
- Dettaglio Alunno â†’ Pagamento Pacchetto â†’ Crea Entrata
- Pagina Tutor â†’ Paga Compenso â†’ Crea Uscita

---

## ðŸ“Š Metriche e KPI

**Dati mostrati:**
- Entrate/Uscite totali (+ breakdown metodo)
- Bilancio periodo
- Margine Lordo
- Break-even Point
- Cashflow Medio
- Tasso di Crescita
- Margine Netto %

**Business Value:**
- Monitoraggio finanziario real-time
- Analisi profittabilitÃ  (margini)
- Identificazione break-even point
- Tracking cashflow giornaliero
- Confronto periodi (crescita %)
- Distinzione contanti/banca (liquiditÃ )
- Gestione automatica movimenti (zero errori)

---

**Fine Documentazione Pagina ContabilitÃ  v1.0**

*Documento creato il: 4 Novembre 2025 - 18:18*  
*Integra tutte le specifiche concordate tramite domande strategiche*