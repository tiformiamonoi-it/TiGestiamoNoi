# ðŸ‘¨â€ðŸ« WebApp Doposcuola 2.0 - Pagina Dettaglio Tutor

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

### PARTE 2: HEADER E ALERT
4. [Header con Info Principali](#header-con-info-principali)
5. [Azioni Rapide Header](#azioni-rapide-header)
6. [Alert Banner Critici](#alert-banner-critici)
7. [Menu Contestuale](#menu-contestuale)

### PARTE 3: NAVIGAZIONE TAB
8. [Sistema Tab (5 Tab)](#sistema-tab)
9. [Tab 1: Anagrafica](#tab-anagrafica)
10. [Tab 2: Storico Compensi](#tab-storico-compensi)
11. [Tab 3: Statistiche](#tab-statistiche)
12. [Tab 4: Alunni Seguiti](#tab-alunni-seguiti)
13. [Tab 5: Cronologia Modifiche](#tab-cronologia-modifiche)

### PARTE 4: DETTAGLI IMPLEMENTATIVI
14. [Sistema Rating (1-5 stelle)](#sistema-rating)
15. [Gestione Materie e Livelli](#gestione-materie-livelli)
16. [Modal Modifica Pagamento](#modal-modifica-pagamento)
17. [Calcolo Margine di Guadagno](#calcolo-margine-guadagno)
18. [Pagamenti Pro Bono](#pagamenti-pro-bono)

### PARTE 5: IMPLEMENTAZIONE TECNICA
19. [Struttura Dati TypeScript](#struttura-dati-typescript)
20. [API Endpoints](#api-endpoints)
21. [Componenti Nuxt UI](#componenti-nuxt-ui)
22. [Responsive Mobile](#responsive-mobile)
23. [Checklist Implementazione](#checklist-implementazione)

---

# PARTE 1: STRUTTURA GENERALE

---

## ðŸŽ¯ Panoramica Pagina

### Scopo della Pagina

La Pagina Dettaglio Tutor Ã¨ il **centro informativo completo** di un singolo collaboratore, progettata per:

- **Vista 360Â°** di tutti i dati anagrafici e operativi
- **Gestione rating** (valutazione da 1 a 5 stelle)
- **Materie e livelli** (competenze tutor)
- **Storico compensi completo** (modificabili e Pro Bono)
- **Statistiche performance** (con margine di guadagno)
- **Alunni seguiti** (lista completa con dettagli)
- **Azioni rapide** contestuali

### Architettura Visiva

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ HEADER + NAVBAR + SIDEBAR (layout globale)                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚ â† Torna a Elenco Tutor                               [â‹®]  â”‚
â”‚                                                             â”‚
â”‚ VITTORIO AGNELLO                            ðŸŸ¢ Attivo      â”‚
â”‚ â­â­â­â­â­ (5.0)                                            â”‚
â”‚ ðŸ“§ vittorio@email.com â€¢ ðŸ“ž 333-1234567                     â”‚
â”‚                                                             â”‚
â”‚ [âœï¸ Modifica] [ðŸ’³ Paga] [ðŸ“… Calendario] [ðŸ“Š Statistiche] â”‚
â”‚                                                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ”´ 3 mesi non pagati (183â‚¬ dovuti)                         â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚ [Anagrafica] [Storico Compensi] [Statistiche] [Alunni] [Cronologia]â”‚
â”‚ â•â•â•â•â•â•â•â•â•â•â•                                                â”‚
â”‚                                                             â”‚
â”‚ [CONTENUTO TAB ATTIVA]                                     â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ”— Route e Navigazione

### Route

```
/tutor/:id
```

**Parametro:** `id` (UUID tutor)

**Esempi:**
- `/tutor/t1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Navigazione Verso Questa Pagina

**Origine 1: Pagina Tutor**
- Click su **nome tutor** nella tabella â†’ `/tutor/:id`

**Origine 2: Dashboard**
- Widget Performance Tutor â†’ Click su singolo tutor

**Origine 3: Calendario**
- Click su tutor in lezione â†’ `/tutor/:id`

### Navigazione Da Questa Pagina

**Verso Pagina Tutor:**
- Click su **"â† Torna a Elenco Tutor"** â†’ `/tutor`

**Verso Calendario:**
- Click su **"ðŸ“… Calendario"** â†’ `/calendario?tutor=:id`

**Verso Dettaglio Alunno:**
- Click su nome alunno in tab "Alunni Seguiti" â†’ `/alunni/:id`

**Verso Pagina Export:**
- Menu (â‹®) â†’ **"Export"** â†’ `/export?tutor=:id`

---

## ðŸ” Permessi e Accessi

| Utente | Visualizzazione | Modifica Anagrafica | Modifica Rating | Paga Compensi | Elimina |
|--------|-----------------|---------------------|-----------------|---------------|---------|
| **Admin** | âœ… Tutti | âœ… Tutti | âœ… Si | âœ… Tutti | âœ… Si |
| **Segreteria** | âœ… Tutti | âœ… Tutti | âœ… Si | âœ… Tutti | âŒ No |
| **Tutor** | âŒ No | âŒ No | âŒ No | âŒ No | âŒ No |

**Gestione 404:**
- Se tutor non trovato â†’ Redirect a `/tutor` con toast error
- Se permessi insufficienti â†’ Mostra "Accesso Negato"

---

# PARTE 2: HEADER E ALERT

---

## ðŸ“‹ Header con Info Principali

### Layout Completo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â† Torna a Elenco Tutor                                  [â‹®]  â”‚
â”‚                                                               â”‚
â”‚ VITTORIO AGNELLO                               ðŸŸ¢ Attivo     â”‚
â”‚ â­â­â­â­â­ (5.0)                                  [Modifica âœï¸]â”‚
â”‚ ðŸ“§ vittorio@email.com â€¢ ðŸ“ž 333-1234567                       â”‚
â”‚                                                               â”‚
â”‚ [âœï¸ Modifica] [ðŸ’³ Paga] [ðŸ“… Calendario] [ðŸ“Š Statistiche]   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Elementi Header

**Riga 1: Breadcrumb + Menu**
- **â† Torna a Elenco Tutor** (link a `/tutor`)
- **[â‹®]** Menu contestuale in alto a destra

**Riga 2: Nome + Badge Stato**
- Nome tutor: **font-size-3xl**, **font-weight-bold**
- Badge stato: Stesso sistema della Pagina Tutor (multipli se necessario)

**Riga 3: Rating**
- Visualizzazione stelle (1-5)
- Numero rating (es. 5.0)
- Bottone "Modifica" inline

**Riga 4: Contatti**
- Email (clickable per email)
- Telefono (clickable per chiamata)
- Separatori: `â€¢`

**Riga 5: Azioni Rapide**
- **4 bottoni primari** (vedi sezione successiva)

---

## âš¡ Azioni Rapide Header

### Azione 1: Modifica Anagrafica

**Bottone:** `[âœï¸ Modifica Anagrafica]`

**Funzione:**
- Switcha a Tab "Anagrafica" e attiva modalitÃ  modifica
- Alternativa: Apre modal modifica (se preferisci)

---

### Azione 2: Paga Compenso

**Bottone:** `[ðŸ’³ Paga Compenso]`

**Funzione:**
- Apre **Modal "Paga Compenso"** (stesso della Pagina Tutor)
- Tutor pre-selezionato
- Lista mesi non pagati

---

### Azione 3: Vedi Calendario

**Bottone:** `[ðŸ“… Vedi Calendario]`

**Funzione:**
- Naviga a `/calendario?tutor=:id`
- Mostra solo lezioni di questo tutor

---

### Azione 4: Vai a Statistiche

**Bottone:** `[ðŸ“Š Statistiche]`

**Funzione:**
- Switcha a Tab "Statistiche"
- Shortcut rapido per performance

---

## ðŸš¨ Alert Banner Critici

### Posizione e Logica

**Posizione:** Sotto l'header, sopra le tab

**Visualizzazione:**
- Mostra **solo se** ci sono situazioni critiche
- Stack verticale se piÃ¹ alert contemporanei

### Esempi Alert

**Alert 1: Compensi Non Pagati**

```
ðŸ”´ 3 mesi non pagati (183â‚¬ dovuti)
```

**Logica:**
```typescript
const mesiNonPagati = getMesiNonPagati(tutorId, periodoCorrente);
if (mesiNonPagati.length > 0) {
  // Mostra alert
}
```

**Alert 2: InattivitÃ  Prolungata**

```
â° Nessuna lezione registrata negli ultimi 30 giorni
```

**Logica:**
```typescript
if (daysBetween(tutor.dataUltimaLezione, today) > 30) {
  // Mostra alert
}
```

**Alert 3: Rating Basso**

```
âš ï¸ Rating sotto la media: 2.5/5.0 (considerare revisione)
```

**Logica:**
```typescript
if (tutor.rating < 3.0) {
  // Mostra alert
}
```

---

## âš™ï¸ Menu Contestuale (â‹®)

### Menu Azioni

**Posizione:** Alto a destra nell'header

**Voci Menu:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“¤ Export                   â”‚ â†’ /export?tutor=:id
â”‚ ðŸ“„ Scarica Storico Compensi â”‚ â†’ Genera PDF/Excel
â”‚ ðŸ–¨ï¸ Stampa Scheda           â”‚ â†’ PDF scheda completa
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€   â”‚
â”‚ â¸ï¸ Disattiva Tutor          â”‚ â†’ Se attivo (conferma)
â”‚ â–¶ï¸ Riattiva Tutor           â”‚ â†’ Se disattivato (conferma)
â”‚ ðŸ—‘ï¸ Elimina Tutor           â”‚ â†’ Solo Admin (conferma)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Implementazione

```typescript
const menuItems = computed(() => {
  const items = [
    [{
      label: 'Export',
      icon: 'heroicons:arrow-up-tray',
      click: () => navigateTo(`/export?tutor=${tutor.value.id}`)
    }, {
      label: 'Scarica Storico Compensi',
      icon: 'heroicons:document-arrow-down',
      click: () => downloadStoricoCompensi(tutor.value.id)
    }, {
      label: 'Stampa Scheda',
      icon: 'heroicons:printer',
      click: () => stampaSchedaTutor(tutor.value.id)
    }]
  ];
  
  // Seconda sezione - Azioni stato
  const azioniStato = [];
  
  if (tutor.value.stato === 'attivo' || tutor.value.stato === 'inattivo') {
    azioniStato.push({
      label: 'Disattiva Tutor',
      icon: 'heroicons:pause',
      click: () => disattivaTutor(tutor.value.id)
    });
  }
  
  if (tutor.value.stato === 'disattivato') {
    azioniStato.push({
      label: 'Riattiva Tutor',
      icon: 'heroicons:play',
      click: () => riattivaTutor(tutor.value.id)
    });
  }
  
  azioniStato.push({
    label: 'Elimina Tutor',
    icon: 'heroicons:trash',
    click: () => eliminaTutor(tutor.value.id),
    disabled: !isAdmin.value // Solo Admin
  });
  
  items.push(azioniStato);
  
  return items;
});
```

---

# PARTE 3: NAVIGAZIONE TAB

---

## ðŸ“‘ Sistema Tab (5 Tab Principali)

### Struttura Tab

```
[Anagrafica] [Storico Compensi] [Statistiche] [Alunni Seguiti] [Cronologia]
â•â•â•â•â•â•â•â•â•â•â•
```

**Tab 1: Anagrafica**
- Form minimalista (solo Nome, Cognome, Email, Telefono)
- Rating stelle (modificabile)
- Materie e livelli (gestione avanzata)
- Preferenze (giorni disponibili, orari)
- Note interne

**Tab 2: Storico Compensi**
- Filtro periodo
- Tabella compensi per mese
- Stati: ðŸ”´ Non pagato, âœ… Pagato, ðŸŽ Pro Bono
- Azioni: Paga, Vedi Dettaglio, Modifica, Elimina

**Tab 3: Statistiche**
- Riepilogo globale (ore, compenso, lezioni, alunni)
- **Margine di guadagno** (costo tutor vs guadagno generato)
- Distribuzione ore per tipo
- Top 5 alunni
- Giorni/Orari preferiti
- Performance mensile

**Tab 4: Alunni Seguiti**
- Lista alunni con cui ha fatto lezioni
- Numero lezioni + ore totali per alunno
- Filtro periodo
- Click nome â†’ `/alunni/:id`

**Tab 5: Cronologia Modifiche**
- Log modifiche con timestamp
- Utente che ha fatto modifica
- Descrizione azione

---

## ðŸ“ Tab 1: Anagrafica

### Layout Form Minimalista

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“ DATI PERSONALI                      [Modifica âœï¸]     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Nome:     [Vittorio              ]                       â”‚
â”‚ Cognome:  [Agnello               ]                       â”‚
â”‚ Email:    [vittorio@email.com    ]                       â”‚
â”‚ Telefono: [333-1234567           ]                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**ModalitÃ :**
- Default: **Solo lettura** (campi disabilitati)
- Click "Modifica" â†’ Abilita campi
- Bottoni: "Salva" / "Annulla"

**Validazione:**

```typescript
const anagraficaSchema = z.object({
  nome: z.string().min(2, 'Minimo 2 caratteri'),
  cognome: z.string().min(2, 'Minimo 2 caratteri'),
  email: z.string().email('Email non valida'),
  telefono: z.string().min(10, 'Telefono non valido')
});
```

---

### Sezione Rating

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â­ RATING TUTOR                                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â˜…â˜…â˜…â˜…â˜… 5.0                            [Modifica Rating]  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Modal Modifica Rating:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â­ MODIFICA RATING - Vittorio Agnello             [X]   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                           â”‚
â”‚ Rating attuale: â˜…â˜…â˜…â˜…â˜… (5.0)                             â”‚
â”‚                                                           â”‚
â”‚ Nuovo rating:                                            â”‚
â”‚                                                           â”‚
â”‚ â˜†â˜†â˜†â˜†â˜†                                                   â”‚
â”‚ [Click sulle stelle per selezionare]                    â”‚
â”‚                                                           â”‚
â”‚ Note (opzionale):                                        â”‚
â”‚ [Ottima performance, molto affidabile]                  â”‚
â”‚                                                           â”‚
â”‚ [Annulla]                              [ðŸ’¾ Salva]       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Implementazione Rating:**

```typescript
const rating = ref(5);

function setRating(value: number) {
  rating.value = value;
}
```

---

### Sezione Materie e Livelli

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“š MATERIE & LIVELLI                    [Gestisci âž•]    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â€¢ Matematica (Medie, Superiori)                         â”‚
â”‚ â€¢ Fisica (Superiori)                                     â”‚
â”‚ â€¢ Chimica (Superiori)                                    â”‚
â”‚ â€¢ Inglese (Medie)                                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Modal Gestisci Materie:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“š GESTISCI MATERIE - Vittorio Agnello            [X]   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Materie attuali:                                         â”‚
â”‚                                                           â”‚
â”‚ â˜‘ Matematica     [â˜‘ Medie] [â˜‘ Superiori]        [ðŸ—‘ï¸]   â”‚
â”‚ â˜‘ Fisica         [â˜ Medie] [â˜‘ Superiori]        [ðŸ—‘ï¸]   â”‚
â”‚ â˜‘ Chimica        [â˜ Medie] [â˜‘ Superiori]        [ðŸ—‘ï¸]   â”‚
â”‚ â˜‘ Inglese        [â˜‘ Medie] [â˜ Superiori]        [ðŸ—‘ï¸]   â”‚
â”‚                                                           â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                           â”‚
â”‚ Aggiungi materia:                                        â”‚
â”‚ [Seleziona materia â–¼]  [â˜ Medie] [â˜ Superiori] [âž•]    â”‚
â”‚                                                           â”‚
â”‚ [Chiudi]                                [ðŸ’¾ Salva]      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Struttura Dati:**

```typescript
interface MateriaLivello {
  materiaId: string;
  nome: string;  // "Matematica"
  livelli: ('medie' | 'superiori')[];
}

// Esempio
const materie: MateriaLivello[] = [
  { 
    materiaId: 'm1', 
    nome: 'Matematica', 
    livelli: ['medie', 'superiori'] 
  },
  { 
    materiaId: 'm2', 
    nome: 'Fisica', 
    livelli: ['superiori'] 
  }
];
```

**Nota Importante:**
Le materie disponibili sono gestite globalmente nella **Pagina Impostazioni** (da documentare). Il tutor puÃ² solo selezionare tra quelle esistenti e specificare i livelli.

---

### Sezione Preferenze

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸŽ¯ PREFERENZE                            [Modifica âœï¸]   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Giorni disponibili: Lun, Mer, Ven                       â”‚
â”‚ Orari preferiti: 15:00-19:00                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Form Modifica:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Giorni disponibili:                                      â”‚
â”‚ â˜‘ Lun  â˜ Mar  â˜‘ Mer  â˜ Gio  â˜‘ Ven  â˜ Sab  â˜ Dom        â”‚
â”‚                                                           â”‚
â”‚ Orari preferiti:                                         â”‚
â”‚ [15:00] - [19:00]                                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Sezione Note Interne

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ”’ NOTE INTERNE (solo Admin/Segreteria)                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Molto affidabile, puntuale. Ottima gestione aula.]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Textarea:** Modificabile solo da Admin/Segreteria

---

## ðŸ’° Tab 2: Storico Compensi

### Layout con Filtro Periodo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Filtra: [Ultimo anno â–¼]                                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ’° Totale pagato (periodo): 1.832â‚¬                       â”‚
â”‚ ðŸ”´ Mesi non pagati: 3 (183â‚¬)                             â”‚
â”‚ ðŸŽ Mesi Pro Bono: 2 (0â‚¬)                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â•”â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘ MESE      â•‘ TOTALE   â•‘ STATO  â•‘ DATA PAG. â•‘ AZIONI          â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘ Ott 2025  â•‘ 61â‚¬      â•‘ ðŸ”´     â•‘ -         â•‘ [ðŸ’³] [ðŸ‘ï¸] [âœï¸] â•‘
â•‘           â•‘          â•‘ Non    â•‘           â•‘                 â•‘
â•‘           â•‘          â•‘ pagato â•‘           â•‘                 â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘ Set 2025  â•‘ 61â‚¬      â•‘ âœ…     â•‘ 05/10/25  â•‘ [ðŸ‘ï¸] [âœï¸] [ðŸ—‘ï¸] â•‘
â•‘           â•‘          â•‘ Pagato â•‘ Bonifico  â•‘                 â•‘
â• â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•£
â•‘ Ago 2025  â•‘ 0â‚¬       â•‘ ðŸŽ     â•‘ -         â•‘ [ðŸ‘ï¸] [âœï¸]      â•‘
â•‘           â•‘          â•‘ Pro    â•‘           â•‘                 â•‘
â•‘           â•‘          â•‘ Bono   â•‘           â•‘                 â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

### Stati Compenso

**3 stati possibili:**

1. **ðŸ”´ Non pagato** (da saldare)
2. **âœ… Pagato** (saldato con data + metodo)
3. **ðŸŽ Pro Bono** (0â‚¬ intenzionale - non va in contabilitÃ )

---

### Azioni per Compenso

**Per compensi NON pagati:**
- **ðŸ’³ Paga** â†’ Apre modal pagamento
- **ðŸ‘ï¸ Vedi Dettaglio** â†’ Espande calcolo ore
- **âœï¸ Modifica** â†’ Modifica importo o marca Pro Bono

**Per compensi pagati:**
- **ðŸ‘ï¸ Vedi Dettaglio** â†’ Espande calcolo ore
- **âœï¸ Modifica** â†’ Modifica importo/note
- **ðŸ—‘ï¸ Elimina** â†’ Solo Admin - riapre mensilitÃ 

---

### Modal Modifica Compenso

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âœï¸ MODIFICA COMPENSO - Settembre 2025             [X]   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Stato attuale: âœ… Pagato (61â‚¬)                           â”‚
â”‚                                                           â”‚
â”‚ Calcolo automatico: 61â‚¬                                  â”‚
â”‚ (6 ore singole Ã— 5â‚¬ + 2 ore gruppo Ã— 8â‚¬ + ...)          â”‚
â”‚                                                           â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                           â”‚
â”‚ Nuovo importo:                                           â”‚
â”‚ â— [61] â‚¬     (manuale)                                   â”‚
â”‚ â—‹ [â˜ Pro Bono] (segna come 0â‚¬ - non va in contabilitÃ ) â”‚
â”‚                                                           â”‚
â”‚ Note:                                                     â”‚
â”‚ [Bonifico cumulativo]                                   â”‚
â”‚                                                           â”‚
â”‚ [Annulla]                              [ðŸ’¾ Salva]       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Logica Pro Bono:**
- Se checkbox "Pro Bono" selezionata â†’ Importo forzato a 0â‚¬
- Flag `proBono: true` nel DB
- **NON** entra in contabilitÃ  (filtrato nelle query)
- Esempio uso: CEO fa lezione â†’ Non deve essere pagato

---

## ðŸ“Š Tab 3: Statistiche

### Card Riepilogo Globale

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“Š STATISTICHE PERFORMANCE                               â”‚
â”‚ Filtra: [Ultimo anno â–¼]                                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                           â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚ â”‚ RIEPILOGO GLOBALE                                    â”‚ â”‚
â”‚ â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤ â”‚
â”‚ â”‚ Ore totali lavorate: 342h                           â”‚ â”‚
â”‚ â”‚ Compenso totale ricevuto: 2.890â‚¬                    â”‚ â”‚
â”‚ â”‚ Media mensile: 241â‚¬                                 â”‚ â”‚
â”‚ â”‚ Lezioni totali: 124                                  â”‚ â”‚
â”‚ â”‚ Alunni seguiti: 18                                   â”‚ â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Card Margine di Guadagno

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ’° MARGINE DI GUADAGNO (ANALISI BUSINESS)               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Costo tutor (pagato): 2.890â‚¬                            â”‚
â”‚ Guadagno generato (da alunni): 8.460â‚¬                   â”‚
â”‚                                                           â”‚
â”‚ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•   â”‚
â”‚                                                           â”‚
â”‚ MARGINE NETTO: 5.570â‚¬ (+192%)                           â”‚
â”‚                                                           â”‚
â”‚ Questo tutor genera un profitto di 5.570â‚¬               â”‚
â”‚ per ogni 2.890â‚¬ investiti in compensi.                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Logica Calcolo Margine:**

```typescript
function calcolaMargineGuadagno(tutorId: string, periodo: PeriodoFiltro): MargineGuadagno {
  // 1. Somma compensi pagati al tutor
  const compensi = getCompensiPagati(tutorId, periodo);
  const costoTutor = compensi.reduce((sum, c) => sum + c.importo, 0);
  
  // 2. Per ogni lezione del tutor, calcola guadagno dall'alunno
  const lezioni = getLezioniTutor(tutorId, periodo);
  
  let guadagnoGenerato = 0;
  
  for (const lezione of lezioni) {
    // Trova pacchetto dell'alunno attivo durante quella lezione
    const pacchetto = getPacchettoAttivoAlunno(lezione.alunnoId, lezione.data);
    
    if (pacchetto) {
      // Calcola costo/ora del pacchetto alunno
      const costoOraAlunno = pacchetto.prezzo / pacchetto.oreTotali;
      
      // Aggiungi al guadagno
      guadagnoGenerato += (lezione.oreScalate * costoOraAlunno);
    }
  }
  
  // 3. Calcola margine
  const margine = guadagnoGenerato - costoTutor;
  const percentuale = costoTutor > 0 
    ? ((margine / costoTutor) * 100).toFixed(0) 
    : 0;
  
  return {
    costoTutor,
    guadagnoGenerato: Math.round(guadagnoGenerato),
    margine: Math.round(margine),
    percentualeMargine: Number(percentuale)
  };
}
```

**Esempio Pratico:**

Un tutor costa 2.890â‚¬ (compensi pagati), ma le sue lezioni generano 8.460â‚¬ di fatturato dagli alunni â†’ Margine netto di 5.570â‚¬ (+192%).

---

### Distribuzione Ore per Tipo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“Š DISTRIBUZIONE ORE PER TIPO                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Singole: â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘ 180h (52%)                  â”‚
â”‚ Gruppo:  â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘ 120h (35%)                  â”‚
â”‚ Maxi:    â–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘â–‘  42h (13%)                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Top 5 Alunni

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ‘¥ TOP 5 ALUNNI (piÃ¹ ore)                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ 1. Marco Rossi       68h (24 lezioni)                   â”‚
â”‚ 2. Giulia Bianchi    52h (18 lezioni)                   â”‚
â”‚ 3. Luca Verdi        38h (15 lezioni)                   â”‚
â”‚ 4. Sara Ferrari      32h (12 lezioni)                   â”‚
â”‚ 5. Paolo Bianchi     28h (10 lezioni)                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Click su nome alunno** â†’ Naviga a `/alunni/:id`

---

### Giorni/Orari Preferiti

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“… GIORNI/ORARI PREFERITI                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Giorno piÃ¹ attivo: MercoledÃ¬ (32 lezioni)               â”‚
â”‚ Orario preferito: 15:30-17:30 (48 lezioni)              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Performance Mensile

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“ˆ PERFORMANCE MENSILE (ore vs media)                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Ottobre: 28h (Media: 28.5h) â†’ ðŸŸ¡ -2%                    â”‚
â”‚ Settembre: 32h (Media: 28.5h) â†’ ðŸŸ¢ +12%                 â”‚
â”‚ Agosto: 24h (Media: 28.5h) â†’ ðŸ”´ -16%                    â”‚
â”‚ Luglio: 30h (Media: 28.5h) â†’ ðŸŸ¢ +5%                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Logica:**
- Media calcolata sugli ultimi 12 mesi
- Verde: sopra media, Rosso: sotto media, Giallo: vicino (-5% / +5%)

---

## ðŸ‘¥ Tab 4: Alunni Seguiti

### Layout Tabella

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ‘¥ ALUNNI SEGUITI (18 totali)                            â”‚
â”‚ Filtra: [Tutto lo storico â–¼]                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                           â”‚
â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•—      â”‚
â”‚ â•‘ NOME ALUNNO    â•‘ LEZIONI   â•‘ ORE TOT.  â•‘ ULTIMA â•‘  â†’  â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•£      â”‚
â”‚ â•‘ Marco Rossi    â•‘ 24        â•‘ 68h       â•‘ 3 gg faâ•‘  â†’  â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•£      â”‚
â”‚ â•‘ Giulia Bianchi â•‘ 18        â•‘ 52h       â•‘ 5 gg faâ•‘  â†’  â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•£      â”‚
â”‚ â•‘ Luca Verdi     â•‘ 15        â•‘ 38h       â•‘ 2 sett.â•‘  â†’  â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•£      â”‚
â”‚ â•‘ Sara Ferrari   â•‘ 12        â•‘ 32h       â•‘ 1 mese â•‘  â†’  â”‚
â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colonne:**
- **Nome Alunno** (clickable â†’ `/alunni/:id`)
- **Lezioni** (numero totale)
- **Ore Totali** (somma ore scalate)
- **Ultima Lezione** (tempo relativo: "3 giorni fa")

**Filtro Periodo:**
- Ultimo anno
- Ultimo mese
- Tutto lo storico

---

## ðŸ“œ Tab 5: Cronologia Modifiche

### Layout Cronologia

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ“ LOG MODIFICHE TUTOR                                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                           â”‚
â”‚ â±ï¸ 05/11/2025 - 09:15                                    â”‚
â”‚ ðŸ‘¤ Admin (Mario Bianchi)                                 â”‚
â”‚ ðŸ“ Compenso pagato: Ottobre 2025 (61â‚¬)                   â”‚
â”‚    Metodo: Bonifico                                      â”‚
â”‚                                                           â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                           â”‚
â”‚ â±ï¸ 28/10/2025 - 14:30                                    â”‚
â”‚ ðŸ‘¤ Segreteria (Giulia Verdi)                             â”‚
â”‚ ðŸ“ Rating modificato                                     â”‚
â”‚    Vecchio: 4.5 stelle                                   â”‚
â”‚    Nuovo: 5.0 stelle                                     â”‚
â”‚                                                           â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                           â”‚
â”‚ â±ï¸ 15/10/2025 - 10:00                                    â”‚
â”‚ ðŸ‘¤ Admin (Mario Bianchi)                                 â”‚
â”‚ ðŸ“ Materia aggiunta: Inglese (Medie)                     â”‚
â”‚                                                           â”‚
â”‚ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                           â”‚
â”‚ â±ï¸ 01/10/2025 - 16:45                                    â”‚
â”‚ ðŸ‘¤ Segreteria (Giulia Verdi)                             â”‚
â”‚ ðŸ“ Compenso modificato: Settembre 2025                   â”‚
â”‚    Vecchio importo: 58â‚¬                                  â”‚
â”‚    Nuovo importo: 61â‚¬                                    â”‚
â”‚    Motivo: Correzione ore gruppo                         â”‚
â”‚                                                           â”‚
â”‚ [Carica cronologia precedente]                           â”‚
â”‚                                                           â”‚
â”‚ Mostrando 10 di 45 modifiche totali                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Tipi di Modifiche Tracciate

```typescript
type TipoModifica = 
  | 'anagrafica_modificata'
  | 'rating_modificato'
  | 'materia_aggiunta'
  | 'materia_rimossa'
  | 'compenso_pagato'
  | 'compenso_modificato'
  | 'compenso_eliminato'
  | 'compenso_pro_bono'
  | 'tutor_disattivato'
  | 'tutor_riattivato';
```

---

# PARTE 4: DETTAGLI IMPLEMENTATIVI

---

## â­ Sistema Rating (1-5 stelle)

### Componente Rating

```vue
<template>
  <div class="rating-display">
    <div class="stars">
      <span 
        v-for="n in 5" 
        :key="n"
        :class="{ filled: n <= rating }"
        @click="editable ? setRating(n) : null"
      >
        {{ n <= rating ? 'â˜…' : 'â˜†' }}
      </span>
    </div>
    <span class="rating-number">({{ rating.toFixed(1) }})</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rating: number;
  editable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  editable: false
});

const emit = defineEmits<{
  update: [rating: number]
}>();

function setRating(value: number) {
  if (props.editable) {
    emit('update', value);
  }
}
</script>

<style scoped>
.stars span {
  font-size: var(--font-size-2xl);
  cursor: pointer;
  color: var(--color-primary);
}

.stars span.filled {
  color: var(--color-primary);
}

.stars span:not(.filled) {
  color: var(--color-text-secondary);
  opacity: 0.3;
}
</style>
```

---

## ðŸ“š Gestione Materie e Livelli

### API Materie Disponibili (Globale)

**Nota:** Le materie sono gestite globalmente nella **Pagina Impostazioni**.

```typescript
// GET - Lista materie disponibili (globale)
GET /api/materie
Response: Materia[]

interface Materia {
  id: string;
  nome: string;
  descrizione?: string;
  attiva: boolean;
}
```

### API Materie Tutor

```typescript
// GET - Materie del tutor
GET /api/tutor/:id/materie
Response: MateriaLivello[]

// POST - Aggiungi materia al tutor
POST /api/tutor/:id/materie
Body: {
  materiaId: string;
  livelli: ('medie' | 'superiori')[];
}

// PATCH - Modifica livelli materia
PATCH /api/tutor/:id/materie/:materiaId
Body: {
  livelli: ('medie' | 'superiori')[];
}

// DELETE - Rimuovi materia dal tutor
DELETE /api/tutor/:id/materie/:materiaId
```

---

## âœï¸ Modal Modifica Pagamento

### Struttura Completa

```vue
<template>
  <UModal v-model="isOpen" :ui="{ width: 'max-w-md' }">
    <template #header>
      <h3>âœï¸ Modifica Compenso - {{ formatMese(compenso.mese) }}</h3>
    </template>
    
    <div class="modal-body">
      <p class="stato-attuale">
        Stato attuale: 
        <UBadge :color="getStatoColor(compenso)">
          {{ getStatoLabel(compenso) }}
        </UBadge>
      </p>
      
      <div class="calcolo-info">
        <p>Calcolo automatico: {{ compenso.totaleArrotondato }}â‚¬</p>
        <button @click="toggleDettaglio" class="link-button">
          {{ showDettaglio ? 'Nascondi' : 'Vedi' }} dettaglio â–¼
        </button>
        
        <div v-if="showDettaglio" class="dettaglio-calcolo">
          <p>Ore Singole: {{ compenso.oreSingole }} Ã— 5â‚¬ = {{ compenso.oreSingole * 5 }}â‚¬</p>
          <p>Ore Gruppo: {{ compenso.oreGruppo }} Ã— 8â‚¬ = {{ compenso.oreGruppo * 8 }}â‚¬</p>
          <!-- ... -->
        </div>
      </div>
      
      <UDivider />
      
      <UFormGroup label="Nuovo importo">
        <URadioGroup v-model="modalitaPagamento" :options="modalitaOptions" />
        
        <UInput 
          v-if="modalitaPagamento === 'manuale'"
          v-model.number="nuovoImporto"
          type="number"
          suffix="â‚¬"
        />
      </UFormGroup>
      
      <UFormGroup label="Note (opzionale)">
        <UTextarea v-model="note" />
      </UFormGroup>
    </div>
    
    <template #footer>
      <div class="flex justify-between w-full">
        <UButton variant="ghost" @click="isOpen = false">
          Annulla
        </UButton>
        <UButton color="primary" @click="salvaModifiche">
          ðŸ’¾ Salva
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const modalitaPagamento = ref<'manuale' | 'proBono'>('manuale');
const nuovoImporto = ref(0);
const note = ref('');
const showDettaglio = ref(false);

const modalitaOptions = [
  { value: 'manuale', label: 'Importo manuale' },
  { value: 'proBono', label: 'Pro Bono (0â‚¬ - non va in contabilitÃ )' }
];

async function salvaModifiche() {
  const importo = modalitaPagamento.value === 'proBono' 
    ? 0 
    : nuovoImporto.value;
  
  const proBono = modalitaPagamento.value === 'proBono';
  
  await $fetch(`/api/compensi/${compenso.id}`, {
    method: 'PATCH',
    body: { importo, proBono, note: note.value }
  });
  
  // Refresh + chiudi
  emit('updated');
  isOpen.value = false;
}
</script>
```

---

## ðŸ’° Calcolo Margine di Guadagno

**GiÃ  documentato nella sezione Tab Statistiche** con funzione completa.

**Recap:**
- **Costo tutor:** Somma compensi pagati nel periodo
- **Guadagno generato:** Somma guadagno dagli alunni (costo/ora alunno Ã— ore lezione)
- **Margine:** Guadagno - Costo
- **Percentuale:** (Margine / Costo) Ã— 100

---

## ðŸŽ Pagamenti Pro Bono

### Logica

**Quando usare:**
- CEO fa lezione â†’ Non deve essere pagato
- Lezione di prova gratuita â†’ Tutor non pagato
- Situazioni eccezionali concordate

**Implementazione:**

```typescript
interface CompensoModificabile extends CompensoMensile {
  proBono: boolean;  // True se 0â‚¬ intenzionale
}

// Query per contabilitÃ  (ESCLUDE Pro Bono)
function getCompensiPerContabilita(periodo: PeriodoFiltro) {
  return db.compensi.findMany({
    where: {
      proBono: false,  // Escludi Pro Bono
      // ... altri filtri
    }
  });
}
```

**Visualizzazione:**
- Badge: ðŸŽ Pro Bono
- Importo: 0â‚¬
- Non compare in report contabilitÃ 

---

# PARTE 5: IMPLEMENTAZIONE TECNICA

---

## ðŸ’¾ Struttura Dati TypeScript

### Interface TutorDettaglio

```typescript
interface TutorDettaglio extends Tutor {
  // Aggiunta rating
  rating: number;  // 1-5
  
  // Materie con livelli
  materie: MateriaLivello[];
  
  // Preferenze
  preferenze: {
    giorniDisponibili: string[];  // ['lun', 'mer', 'ven']
    orariPreferiti: string;        // "15:00-19:00"
  };
  
  // Note interne
  noteInterne?: string;
  
  // Statistiche complete
  statistiche: StatisticheTutor;
}

interface MateriaLivello {
  materiaId: string;
  nome: string;  // "Matematica"
  livelli: ('medie' | 'superiori')[];
}

interface StatisticheTutor {
  // Globali
  oreTotali: number;
  compensoTotale: number;
  mediaMensile: number;
  lezioniTotali: number;
  alunniSeguiti: number;
  
  // Margine guadagno
  guadagnoGenerato: number;
  costoTutor: number;
  margine: number;
  percentualeMargine: number;
  
  // Distribuzione
  distribuzioneOre: {
    singole: number;
    gruppo: number;
    maxi: number;
  };
  
  // Top alunni
  topAlunni: Array<{
    alunnoId: string;
    nome: string;
    ore: number;
    lezioni: number;
  }>;
  
  // Preferenze rilevate
  giornoPreferito: { giorno: string; count: number };
  orarioPreferito: { fascia: string; count: number };
  
  // Performance
  performanceMensile: Array<{
    mese: Date;
    ore: number;
    media: number;
    differenzaPercentuale: number;
  }>;
}

interface CompensoModificabile extends CompensoMensile {
  proBono: boolean;  // True se 0â‚¬ intenzionale (non va in contabilitÃ )
}

interface MargineGuadagno {
  costoTutor: number;
  guadagnoGenerato: number;
  margine: number;
  percentualeMargine: number;
}
```

---

## ðŸŒ API Endpoints

```typescript
// GET - Dettaglio tutor completo
GET /api/tutor/:id/dettaglio
Response: TutorDettaglio

// PATCH - Modifica rating
PATCH /api/tutor/:id/rating
Body: { rating: number; note?: string }

// GET/POST/DELETE - Gestione materie
GET /api/tutor/:id/materie
Response: MateriaLivello[]

POST /api/tutor/:id/materie
Body: { materiaId: string; livelli: ('medie' | 'superiori')[] }

PATCH /api/tutor/:id/materie/:materiaId
Body: { livelli: ('medie' | 'superiori')[] }

DELETE /api/tutor/:id/materie/:materiaId

// GET - Materie disponibili globali
GET /api/materie
Response: Materia[]

// GET - Storico compensi (con filtro)
GET /api/tutor/:id/compensi
Query: periodo: PeriodoFiltro
Response: CompensoModificabile[]

// PATCH - Modifica compenso
PATCH /api/compensi/:id
Body: { 
  importo: number; 
  proBono: boolean;
  note?: string;
}

// DELETE - Elimina compenso (solo Admin)
DELETE /api/compensi/:id

// GET - Statistiche complete
GET /api/tutor/:id/statistiche
Query: periodo: PeriodoFiltro
Response: StatisticheTutor

// GET - Margine guadagno
GET /api/tutor/:id/margine
Query: periodo: PeriodoFiltro
Response: MargineGuadagno

// GET - Alunni seguiti
GET /api/tutor/:id/alunni
Query: periodo: PeriodoFiltro
Response: Array<{
  alunnoId: string;
  nome: string;
  lezioni: number;
  oreTotali: number;
  ultimaLezione: Date;
}>

// GET - Cronologia modifiche
GET /api/tutor/:id/cronologia
Query: page, limit
Response: {
  data: CronologiaModifica[],
  total: number,
  hasMore: boolean
}

// GET - Export storico compensi
GET /api/tutor/:id/export-compensi
Query: periodo, format ('pdf' | 'excel')
Response: File
```

---

## ðŸŽ¨ Componenti Nuxt UI Utilizzati

| Componente | Utilizzo |
|------------|----------|
| `UButton` | Azioni header, bottoni form |
| `UBadge` | Stati tutor, stati compensi |
| `UCard` | Sezioni anagrafica, statistiche |
| `UTabs` | Navigazione tab principale |
| `UInput` | Form anagrafica |
| `UTextarea` | Note |
| `UCheckbox` | Materie livelli, preferenze giorni |
| `URadio` | ModalitÃ  pagamento (manuale/Pro Bono) |
| `USelect` | Dropdown materie, filtro periodo |
| `UDropdown` | Menu contestuale (â‹®) |
| `UModal` | Modifica rating, materie, compenso |
| `UAlert` | Alert banner critici |
| `UDivider` | Separatori sezioni |
| `UTable` (opzionale) | Storico compensi, alunni |

---

## ðŸ“± Responsive Mobile

### Layout Mobile (<768px)

**Trasformazione:** Stack verticale completo

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â† Vittorio Agnello          â”‚
â”‚ ðŸŸ¢ Attivo                   â”‚
â”‚ â­â­â­â­â­ (5.0)            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ“§ vittorio@email.com       â”‚
â”‚ ðŸ“ž 333-1234567              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [Modifica]                  â”‚
â”‚ [Paga]                      â”‚
â”‚ [Calendario]                â”‚
â”‚ [Statistiche]               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ ðŸ”´ 3 mesi non pagati (183â‚¬) â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                             â”‚
â”‚ [Anagrafica]                â”‚
â”‚ [Storico Comp.]             â”‚
â”‚ [Statistiche]               â”‚
â”‚ [Alunni]                    â”‚
â”‚ [Cronologia]                â”‚
â”‚                             â”‚
â”‚ [Tab content...]            â”‚
â”‚                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Ottimizzazioni:**
- Bottoni full-width
- Tab full-width
- Form 1 colonna
- Tabelle scrollabili orizzontalmente

---

## âœ… Checklist Implementazione

### Fase 1: Route e Struttura (3 giorni)
- [ ] Route `/tutor/:id`
- [ ] Composable `useTutorDettaglio(id)`
- [ ] Layout pagina header + tab
- [ ] Gestione 404 + permessi

### Fase 2: Header e Alert (2 giorni)
- [ ] Header con info principali + rating
- [ ] 4 bottoni azione
- [ ] Menu contestuale (â‹®)
- [ ] Alert banner critici

### Fase 3: Tab Anagrafica (4 giorni)
- [ ] Form minimalista (4 campi)
- [ ] Sistema rating (modifica inline)
- [ ] Gestione materie e livelli (modal)
- [ ] Preferenze (giorni + orari)
- [ ] Note interne
- [ ] Validazione + salvataggio

### Fase 4: Tab Storico Compensi (5 giorni)
- [ ] Filtro periodo
- [ ] Tabella compensi con stati (Non pagato, Pagato, Pro Bono)
- [ ] Modal modifica compenso
- [ ] Gestione Pro Bono (flag + esclusione contabilitÃ )
- [ ] Dettaglio calcolo espandibile
- [ ] Elimina compenso (solo Admin)

### Fase 5: Tab Statistiche (6 giorni)
- [ ] Card riepilogo globale
- [ ] **Calcolo margine guadagno** (costo vs guadagno generato)
- [ ] Distribuzione ore per tipo
- [ ] Top 5 alunni (con link)
- [ ] Giorni/Orari preferiti
- [ ] Performance mensile (vs media)
- [ ] Filtro periodo statistiche

### Fase 6: Tab Alunni Seguiti (3 giorni)
- [ ] Tabella alunni (lezioni, ore, ultima)
- [ ] Filtro periodo
- [ ] Click nome â†’ Dettaglio Alunno
- [ ] Ordinamento (lezioni, ore)

### Fase 7: Tab Cronologia (2 giorni - opzionale)
- [ ] Log modifiche con timestamp
- [ ] Utente + azione + dettagli
- [ ] Paginazione lazy (10 per volta)
- [ ] Sistema generazione automatica log

### Fase 8: Integrazioni (3 giorni)
- [ ] Modal Paga Compenso (stesso della Pagina Tutor)
- [ ] Navigazione a Calendario filtrato
- [ ] Navigazione a Dettaglio Alunno
- [ ] Export storico compensi (PDF/Excel)

### Fase 9: Performance (2 giorni)
- [ ] Lazy loading tab content
- [ ] Caching dati tutor
- [ ] Caching statistiche calcolate
- [ ] Debouncing filtri

### Fase 10: Testing (3 giorni)
- [ ] Test con tutti gli stati
- [ ] Test modifica compensi (manuale + Pro Bono)
- [ ] Test margine guadagno (calcoli)
- [ ] Test responsive mobile
- [ ] Test permessi utente
- [ ] Test navigazioni

**Totale stimato: 33 giorni lavorativi**

---

## ðŸŽ¯ Riepilogo FunzionalitÃ  Chiave

### âœ… **Cosa rende questa pagina efficace:**

1. **Header informativo** con rating + 4 azioni rapide
2. **Alert banner critici** (compensi, inattivitÃ )
3. **Form anagrafica minimalista** (solo 4 campi essenziali)
4. **Sistema rating modificabile** (1-5 stelle)
5. **Gestione materie avanzata** (con livelli Medie/Superiori)
6. **Storico compensi completo** (modificabile + Pro Bono)
7. **Margine di guadagno** (analisi business ROI tutor)
8. **Statistiche performance** (distribuzione, top alunni, preferenze)
9. **Alunni seguiti** (lista completa con dettagli)
10. **Cronologia modifiche** (log audit completo)
11. **Pagamenti Pro Bono** (0â‚¬ che non vanno in contabilitÃ )
12. **Responsive completo** (ottimizzato mobile)

### ðŸ”— **Collegamenti Esterni:**

**Da questa pagina:**
- `/tutor` (breadcrumb) â†’ Pagina Tutor
- `/calendario?tutor=:id` (bottone) â†’ Calendario filtrato
- `/alunni/:id` (click alunno) â†’ Dettaglio Alunno
- `/export?tutor=:id` (menu) â†’ Pagina Export

**Verso questa pagina:**
- Pagina Tutor â†’ Click nome tutor
- Dashboard â†’ Widget Performance
- Calendario â†’ Click su tutor in lezione

---

## ðŸ“Š Metriche e KPI

**Dati mostrati:**
- Rating tutor (1-5 stelle)
- Ore totali, compenso totale, lezioni
- **Margine di guadagno** (ROI tutor)
- Distribuzione ore per tipo
- Top alunni seguiti
- Performance vs media
- Giorni/orari preferiti

**Business Value:**
- Valutazione performance tutor (rating)
- Identificazione tutor piÃ¹ profittevoli (margine)
- Analisi competenze (materie + livelli)
- Gestione compensi Pro Bono (CEO, prove gratuite)
- Tracking modifiche (audit completo)

---

## ðŸ“ Note per Pagina Impostazioni (Futura)

Come richiesto, nella **Pagina Impostazioni** (da documentare) gestiremo:

1. **Tariffe Orarie Globali** (modifica per tutti i tutor)
2. **Lista Materie Globali** (CRUD materie disponibili)
   - Nome materia
   - Descrizione
   - Attiva/Disattiva
3. **Livelli Scuola** (Elementari, Medie, Superiori - eventualmente UniversitÃ )
4. **Categorie ContabilitÃ ** (classificazione entrate/uscite)

---

**Fine Documentazione Pagina Dettaglio Tutor v1.0**

*Documento creato il: 4 Novembre 2025 - 11:54*  
*Integra tutte le specifiche concordate tramite domande strategiche*