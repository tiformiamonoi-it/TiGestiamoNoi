# âš™ï¸ WebApp Doposcuola 2.0 - Pagina Impostazioni

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

### PARTE 2: LAYOUT TAB ORIZZONTALI
4. [Struttura Tab](#struttura-tab)
5. [Lista Tab Disponibili](#lista-tab-disponibili)

### PARTE 3: TAB PACCHETTI STANDARD
6. [Gestione Pacchetti](#gestione-pacchetti)
7. [Tabella Pacchetti](#tabella-pacchetti)
8. [Modal Nuovo Pacchetto](#modal-nuovo-pacchetto)
9. [Modal Modifica Pacchetto](#modal-modifica-pacchetto)
10. [Eliminazione Pacchetto](#eliminazione-pacchetto)

### PARTE 4: TAB CATEGORIE CONTABILITÃ€
11. [Gestione Categorie](#gestione-categorie)
12. [Tabella Categorie](#tabella-categorie)
13. [Modal Nuova Categoria](#modal-nuova-categoria)
14. [Modal Modifica Categoria](#modal-modifica-categoria)
15. [Eliminazione Categoria](#eliminazione-categoria)

### PARTE 5: TAB TARIFFE TUTOR
16. [Gestione Tariffe](#gestione-tariffe)
17. [Form Tariffe Lezione Intera](#form-tariffe-lezione-intera)
18. [Form Tariffe Mezza Lezione](#form-tariffe-mezza-lezione)
19. [Storico Tariffe](#storico-tariffe)

### PARTE 6: TAB COSTI FISSI
20. [Gestione Costi Fissi](#gestione-costi-fissi)
21. [Lista Costi Dinamica](#lista-costi-dinamica)
22. [Totale Costi Fissi](#totale-costi-fissi)

### PARTE 7: TAB MATERIE
23. [Gestione Materie](#gestione-materie)
24. [Tabella Materie](#tabella-materie)
25. [Modal Nuova Materia](#modal-nuova-materia)
26. [Eliminazione Materia](#eliminazione-materia)

### PARTE 8: TAB GESTIONE UTENTI
27. [Gestione Utenti](#gestione-utenti)
28. [Tabella Utenti](#tabella-utenti)
29. [Modal Nuovo Utente](#modal-nuovo-utente)
30. [Modal Modifica Utente](#modal-modifica-utente)
31. [Reset Password](#reset-password)
32. [Eliminazione Utente](#eliminazione-utente)

### PARTE 9: IMPLEMENTAZIONE TECNICA
33. [Struttura Dati TypeScript](#struttura-dati-typescript)
34. [API Endpoints](#api-endpoints)
35. [Componenti Nuxt UI](#componenti-nuxt-ui)
36. [Responsive Mobile](#responsive-mobile)
37. [Checklist Implementazione](#checklist-implementazione)

---

# PARTE 1: STRUTTURA GENERALE

---

## ðŸŽ¯ Panoramica Pagina

### Scopo della Pagina

La Pagina Impostazioni Ã¨ il **centro di configurazione** della web app, progettata per:

- **Gestione Pacchetti Standard** (mensili, orari)
- **Categorie ContabilitÃ ** (entrate/uscite)
- **Tariffe Tutor** (singola, gruppo, maxi + mezza lezione)
- **Costi Fissi** (affitto, utenze per break-even)
- **Materie** (matematica, italiano, inglese, ecc.)
- **Gestione Utenti** (admin, segreteria con ruoli)

### Architettura Visiva

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ HEADER + NAVBAR + SIDEBAR (layout globale)                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                               â”‚
â”‚ âš™ï¸ IMPOSTAZIONI                                              â”‚
â”‚                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ [Pacchetti] [Categorie] [Tariffe] [Costi] [Materie] â”‚    â”‚
â”‚ â”‚ [Utenti]                                              â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                               â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚ â”‚ CONTENUTO TAB ATTIVO                                  â”‚    â”‚
â”‚ â”‚                                                        â”‚    â”‚
â”‚ â”‚ [Tabella/Form specifico per tab]                     â”‚    â”‚
â”‚ â”‚                                                        â”‚    â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                               â”‚
â”‚ [ðŸ’¾ Salva Modifiche]                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ”— Route e Navigazione

### Route

```
/impostazioni
/impostazioni?tab=pacchetti
/impostazioni?tab=categorie
/impostazioni?tab=tariffe
/impostazioni?tab=costi
/impostazioni?tab=materie
/impostazioni?tab=utenti
```

**Query Parameters:**
- `tab`: Tab attivo (default: pacchetti)

### Navigazione Verso Questa Pagina

**Da Sidebar:**
- Click su **"Impostazioni"** nel menu principale (solo Admin)

---

## ðŸ” Permessi e Accessi

| Ruolo | Accesso Pagina | Modifica |
|-------|----------------|----------|
| **Admin** | âœ… Si | âœ… Tutto |
| **Segreteria** | âŒ No | âŒ No |
| **Tutor** | âŒ No | âŒ No |

**Nota:**
- Solo **Admin** puÃ² accedere alla pagina Impostazioni
- Segreteria e Tutor non vedono voce nel menu

---

# PARTE 2: LAYOUT TAB ORIZZONTALI

---

## ðŸ”– Struttura Tab

### Layout Tab

```vue
<template>
  <div class="impostazioni">
    <h1>âš™ï¸ Impostazioni</h1>
    
    <UTabs v-model="tabAttivo" :items="tabs" />
    
    <div class="contenuto-tab">
      <component :is="componenteTab" />
    </div>
    
    <div class="azioni">
      <UButton 
        color="primary" 
        @click="salvaModifiche"
        :loading="salvando"
      >
        ðŸ’¾ Salva Modifiche
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const tabAttivo = ref(route.query.tab || 'pacchetti');

const tabs = [
  { key: 'pacchetti', label: 'Pacchetti' },
  { key: 'categorie', label: 'Categorie' },
  { key: 'tariffe', label: 'Tariffe' },
  { key: 'costi', label: 'Costi Fissi' },
  { key: 'materie', label: 'Materie' },
  { key: 'utenti', label: 'Utenti' }
];

const componenteTab = computed(() => {
  switch (tabAttivo.value) {
    case 'pacchetti': return TabPacchetti;
    case 'categorie': return TabCategorie;
    case 'tariffe': return TabTariffe;
    case 'costi': return TabCosti;
    case 'materie': return TabMaterie;
    case 'utenti': return TabUtenti;
    default: return TabPacchetti;
  }
});

// Aggiorna URL quando cambia tab
watch(tabAttivo, (nuovoTab) => {
  router.push({ query: { tab: nuovoTab } });
});

const salvando = ref(false);

async function salvaModifiche() {
  salvando.value = true;
  
  try {
    await $fetch('/api/impostazioni/salva', {
      method: 'POST',
      body: {
        pacchetti: pacchettiModificati.value,
        categorie: categorieModificate.value,
        tariffe: tariffeModificate.value,
        costi: costiModificati.value,
        materie: materieModificate.value
      }
    });
    
    toast.success('Impostazioni salvate con successo');
  } catch (error) {
    toast.error('Errore nel salvataggio');
  } finally {
    salvando.value = false;
  }
}
</script>
```

---

## ðŸ“‹ Lista Tab Disponibili

### 6 Tab Principali

1. **Pacchetti** - Gestione pacchetti standard
2. **Categorie** - Categorie contabilitÃ 
3. **Tariffe** - Tariffe compensi tutor
4. **Costi Fissi** - Costi fissi mensili (break-even)
5. **Materie** - Materie insegnate
6. **Utenti** - Gestione utenti e ruoli

---

# PARTE 3: TAB PACCHETTI STANDARD

---

## ðŸ“¦ Gestione Pacchetti

### Scopo

Configurazione pacchetti standard che vengono proposti agli alunni al momento dell'acquisto.

**Tipi Pacchetto:**
- **Mensile** (scadenza fissa 30 giorni)
- **Orario** (scadenza personalizzabile: 2, 3, 5 giorni)

---

## ðŸ“Š Tabella Pacchetti

### Layout Tabella

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ PACCHETTI STANDARD                          [+ Nuovo]        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•—â”‚
â”‚ â•‘ NOME PACCHETTO     â•‘ TIPO     â•‘ ORE     â•‘ PREZZO   â•‘ ... â•‘â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•£â”‚
â”‚ â•‘ Mensile Superiori  â•‘ Mensile  â•‘ 36h     â•‘ 270â‚¬     â•‘ [â‹®] â•‘â”‚
â”‚ â•‘ Mensile Medie      â•‘ Mensile  â•‘ 24h     â•‘ 180â‚¬     â•‘ [â‹®] â•‘â”‚
â”‚ â•‘ Orario 2 giorni    â•‘ Orario   â•‘ 2h      â•‘ 20â‚¬      â•‘ [â‹®] â•‘â”‚
â”‚ â•‘ Orario 3 giorni    â•‘ Orario   â•‘ 3h      â•‘ 30â‚¬      â•‘ [â‹®] â•‘â”‚
â”‚ â•‘ Orario 5 giorni    â•‘ Orario   â•‘ 5h      â•‘ 50â‚¬      â•‘ [â‹®] â•‘â”‚
â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colonne:**
1. **Nome Pacchetto** (es. "Mensile Superiori 36h")
2. **Tipo** (Mensile, Orario)
3. **Ore Predefinite** (36, 24, 2, 3, 5)
4. **Prezzo Base** (â‚¬)
5. **Azioni** (â‹®)

---

### Azioni Pacchetto

```
Menu Dropdown (â‹®):
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âœï¸ Modifica        â”‚
â”‚ ðŸ—‘ï¸ Elimina         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## âž• Modal Nuovo Pacchetto

### Layout Modal

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NUOVO PACCHETTO STANDARD                    [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ NOME PACCHETTO:                                  â”‚
â”‚ [Mensile Superiori 36h]                         â”‚
â”‚                                                  â”‚
â”‚ TIPO:                                            â”‚
â”‚ [Mensile â–¼]                                     â”‚
â”‚   â€¢ Mensile (scadenza 30 giorni)               â”‚
â”‚   â€¢ Orario (scadenza personalizzabile)         â”‚
â”‚                                                  â”‚
â”‚ ORE PREDEFINITE:                                 â”‚
â”‚ [36]                                            â”‚
â”‚                                                  â”‚
â”‚ PREZZO BASE:                                     â”‚
â”‚ [270,00] â‚¬                                      â”‚
â”‚                                                  â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”  â”‚
â”‚ â”‚ Solo per Pacchetti Orari:                  â”‚  â”‚
â”‚ â”‚ VALIDITÃ€ (giorni):                         â”‚  â”‚
â”‚ â”‚ [2]                                        â”‚  â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜  â”‚
â”‚                                                  â”‚
â”‚ [Annulla]                        [ðŸ’¾ Salva]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Validazione Form

```typescript
const pacchettoSchema = z.object({
  nome: z.string().min(3, 'Minimo 3 caratteri'),
  tipo: z.enum(['mensile', 'orario']),
  ore: z.number().min(1, 'Minimo 1 ora'),
  prezzo: z.number().min(1, 'Prezzo deve essere > 0'),
  validitaGiorni: z.number().optional() // Solo se tipo === 'orario'
});

// Validazione condizionale
const form = useForm({
  validationSchema: toTypedSchema(pacchettoSchema),
  validate: (values) => {
    if (values.tipo === 'orario' && !values.validitaGiorni) {
      return {
        validitaGiorni: 'Campo obbligatorio per pacchetti orari'
      };
    }
    return {};
  }
});
```

---

## âœï¸ Modal Modifica Pacchetto

### Stesso Layout

Modal identico a "Nuovo Pacchetto" ma con:
- Titolo: "MODIFICA PACCHETTO"
- Campi pre-compilati con dati esistenti

---

## ðŸ—‘ï¸ Eliminazione Pacchetto

### Blocco con Warning

**Se pacchetto in uso:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âš ï¸ IMPOSSIBILE ELIMINARE PACCHETTO              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Questo pacchetto Ã¨ utilizzato da 12 alunni.     â”‚
â”‚                                                  â”‚
â”‚ Per eliminarlo, devi prima riassegnare          â”‚
â”‚ manualmente un altro pacchetto a questi alunni. â”‚
â”‚                                                  â”‚
â”‚ [OK, ho capito]                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Se pacchetto NON in uso:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âš ï¸ CONFERMA ELIMINAZIONE                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Sei sicuro di voler eliminare questo pacchetto? â”‚
â”‚                                                  â”‚
â”‚ Questa azione Ã¨ irreversibile.                  â”‚
â”‚                                                  â”‚
â”‚ [Annulla]               [ðŸ—‘ï¸ Elimina]           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Logica Controllo Uso

```typescript
async function eliminaPacchetto(id: string) {
  // 1. Controlla se pacchetto Ã¨ in uso
  const alunniConPacchetto = await $fetch(`/api/pacchetti/${id}/check-uso`);
  
  if (alunniConPacchetto.length > 0) {
    // Blocca eliminazione
    modal.open({
      title: 'âš ï¸ Impossibile Eliminare Pacchetto',
      description: `Questo pacchetto Ã¨ utilizzato da ${alunniConPacchetto.length} alunni. Per eliminarlo, devi prima riassegnare manualmente un altro pacchetto a questi alunni.`,
      actions: [
        { label: 'OK, ho capito', color: 'primary' }
      ]
    });
    return;
  }
  
  // 2. Se non in uso, chiedi conferma
  const conferma = await confirm({
    title: 'âš ï¸ Conferma Eliminazione',
    description: 'Sei sicuro di voler eliminare questo pacchetto? Questa azione Ã¨ irreversibile.'
  });
  
  if (!conferma) return;
  
  // 3. Elimina pacchetto
  await $fetch(`/api/pacchetti/${id}`, { method: 'DELETE' });
  toast.success('Pacchetto eliminato');
  
  // Ricarica lista
  caricaPacchetti();
}
```

---

# PARTE 4: TAB CATEGORIE CONTABILITÃ€

---

## ðŸ—‚ï¸ Gestione Categorie

### Scopo

Configurazione categorie per movimenti contabilitÃ  (entrate/uscite).

**Categorie Predefinite:**

**Entrate:**
- Rette Alunni

**Uscite:**
- Rimborsi Tutor
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

## ðŸ“Š Tabella Categorie

### Layout Tabella

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ CATEGORIE CONTABILITÃ€                       [+ Nuova]        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•—            â”‚
â”‚ â•‘ NOME             â•‘ TIPO     â•‘ COLORE   â•‘ ... â•‘            â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•£            â”‚
â”‚ â•‘ Rette Alunni     â•‘ Entrata  â•‘ ðŸŸ¢       â•‘ [â‹®] â•‘            â”‚
â”‚ â•‘ Rimborsi Tutor   â•‘ Uscita   â•‘ ðŸ”´       â•‘ [â‹®] â•‘            â”‚
â”‚ â•‘ Affitto          â•‘ Uscita   â•‘ ðŸŸ        â•‘ [â‹®] â•‘            â”‚
â”‚ â•‘ Utenze           â•‘ Uscita   â•‘ ðŸŸ¡       â•‘ [â‹®] â•‘            â”‚
â”‚ â•‘ Cancelleria      â•‘ Uscita   â•‘ ðŸ”µ       â•‘ [â‹®] â•‘            â”‚
â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colonne:**
1. **Nome Categoria**
2. **Tipo** (Entrata, Uscita)
3. **Colore** (per grafici)
4. **Azioni** (â‹®)

---

### Azioni Categoria

```
Menu Dropdown (â‹®):
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âœï¸ Modifica        â”‚
â”‚ ðŸ—‘ï¸ Elimina         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## âž• Modal Nuova Categoria

### Layout Modal

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NUOVA CATEGORIA CONTABILITÃ€                 [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ NOME CATEGORIA:                                  â”‚
â”‚ [Marketing]                                     â”‚
â”‚                                                  â”‚
â”‚ TIPO:                                            â”‚
â”‚ â— Entrata  â—‹ Uscita                             â”‚
â”‚                                                  â”‚
â”‚ COLORE (per grafici):                            â”‚
â”‚ [#FF5733] [Color Picker]                        â”‚
â”‚                                                  â”‚
â”‚ [Annulla]                        [ðŸ’¾ Salva]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Validazione Form

```typescript
const categoriaSchema = z.object({
  nome: z.string().min(2, 'Minimo 2 caratteri'),
  tipo: z.enum(['entrata', 'uscita']),
  colore: z.string().regex(/^#[0-9A-F]{6}$/i, 'Colore esadecimale valido')
});
```

---

## âœï¸ Modal Modifica Categoria

### Stesso Layout

Modal identico a "Nuova Categoria" ma con:
- Titolo: "MODIFICA CATEGORIA"
- Campi pre-compilati

---

## ðŸ—‘ï¸ Eliminazione Categoria

### Warning Standard

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âš ï¸ CONFERMA ELIMINAZIONE                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Sei sicuro di voler eliminare questa categoria? â”‚
â”‚                                                  â”‚
â”‚ ATTENZIONE: Tutti i movimenti contabili con     â”‚
â”‚ questa categoria perderanno il riferimento.     â”‚
â”‚                                                  â”‚
â”‚ [Annulla]               [ðŸ—‘ï¸ Elimina]           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

# PARTE 5: TAB TARIFFE TUTOR

---

## ðŸ’° Gestione Tariffe

### Scopo

Configurazione tariffe compensi tutor per tipo lezione.

**Tariffe Attuali:**
- **Lezione Intera (1h):**
  - Singola: 5â‚¬
  - Gruppo: 8â‚¬
  - Maxi: 8,50â‚¬

- **Mezza Lezione (0.5h):**
  - Singola: 2,50â‚¬ (5â‚¬ / 2)
  - Gruppo: 4â‚¬ (8â‚¬ / 2)
  - Maxi: 4â‚¬ (8â‚¬ / 2, **NON** 8,50â‚¬ / 2)

---

## ðŸ“ Form Tariffe Lezione Intera

### Layout Form

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TARIFFE LEZIONE INTERA (1 ora)                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Singola (1 alunno):                              â”‚
â”‚ [5,00] â‚¬                                        â”‚
â”‚                                                  â”‚
â”‚ Gruppo (2-4 alunni):                             â”‚
â”‚ [8,00] â‚¬                                        â”‚
â”‚                                                  â”‚
â”‚ Maxi (5+ alunni):                                â”‚
â”‚ [8,50] â‚¬                                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“ Form Tariffe Mezza Lezione

### Layout Form

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ TARIFFE MEZZA LEZIONE (0.5 ore)                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â„¹ï¸ Le tariffe mezza lezione sono calcolate     â”‚
â”‚ automaticamente:                                 â”‚
â”‚                                                  â”‚
â”‚ Singola:  [2,50] â‚¬ (calcolato: 5â‚¬ / 2)         â”‚
â”‚ Gruppo:   [4,00] â‚¬ (calcolato: 8â‚¬ / 2)         â”‚
â”‚ Maxi:     [4,00] â‚¬ (calcolato: 8â‚¬ / 2)         â”‚
â”‚                                                  â”‚
â”‚ âš ï¸ Nota: Maxi usa tariffa Gruppo per mezza     â”‚
â”‚ lezione (8â‚¬ / 2 = 4â‚¬), non Maxi (8,50â‚¬ / 2).   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Nota:** Mezza lezione **readonly** (calcolate automaticamente).

---

## ðŸ“… Storico Tariffe

### Tabella Storico

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ STORICO MODIFICHE TARIFFE                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•—   â”‚
â”‚ â•‘ DATA APP â•‘ SINGOLA  â•‘ GRUPPO   â•‘ MAXI     â•‘   â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•£   â”‚
â”‚ â•‘ 01/11/25 â•‘ 5â‚¬       â•‘ 8â‚¬       â•‘ 8,50â‚¬    â•‘   â”‚
â”‚ â•‘ 01/09/25 â•‘ 4,50â‚¬    â•‘ 7,50â‚¬    â•‘ 8â‚¬       â•‘   â”‚
â”‚ â•‘ 01/06/25 â•‘ 4â‚¬       â•‘ 7â‚¬       â•‘ 7,50â‚¬    â•‘   â”‚
â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colonne:**
- **Data Applicazione** (da quando si applica)
- **Singola** (â‚¬)
- **Gruppo** (â‚¬)
- **Maxi** (â‚¬)

---

### Aggiunta Storico

```typescript
async function salvaTariffe(tariffe: Tariffe) {
  // 1. Salva nuove tariffe
  await $fetch('/api/impostazioni/tariffe', {
    method: 'POST',
    body: {
      singola: tariffe.singola,
      gruppo: tariffe.gruppo,
      maxi: tariffe.maxi,
      dataApplicazione: new Date() // Data corrente
    }
  });
  
  // 2. Aggiunge automaticamente a storico
  toast.success('Tariffe salvate. Applicate da oggi.');
}
```

---

# PARTE 6: TAB COSTI FISSI

---

## ðŸ’¸ Gestione Costi Fissi

### Scopo

Configurazione costi fissi mensili per calcolo break-even point nella ContabilitÃ .

**Costi Tipici:**
- Affitto: 600â‚¬/mese
- Utenze: 150â‚¬/mese
- Software: 50â‚¬/mese
- Altro...

---

## ðŸ“‹ Lista Costi Dinamica

### Layout Form

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ COSTI FISSI MENSILI                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Affitto:           [600,00] â‚¬  [ðŸ—‘ï¸]             â”‚
â”‚ Utenze:            [150,00] â‚¬  [ðŸ—‘ï¸]             â”‚
â”‚ Software:          [50,00] â‚¬   [ðŸ—‘ï¸]             â”‚
â”‚                                                  â”‚
â”‚ [+ Aggiungi Costo Fisso]                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ TOTALE COSTI FISSI:  800,00 â‚¬/mese              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**FunzionalitÃ :**
- Lista dinamica (aggiungi/rimuovi voci)
- Ogni voce: Nome + Importo + Bottone Elimina
- Totale automatico in fondo

---

### Aggiunta Costo Fisso

```vue
<template>
  <div class="costi-fissi">
    <div 
      v-for="(costo, index) in costiFissi" 
      :key="index"
      class="costo-item"
    >
      <UInput 
        v-model="costo.nome" 
        placeholder="Nome costo"
      />
      <UInput 
        v-model="costo.importo" 
        type="number"
        suffix="â‚¬"
      />
      <UButton 
        icon="heroicons:trash" 
        color="red"
        @click="rimuoviCosto(index)"
      />
    </div>
    
    <UButton 
      @click="aggiungiCosto"
      variant="outline"
    >
      + Aggiungi Costo Fisso
    </UButton>
    
    <div class="totale">
      TOTALE COSTI FISSI: {{ totaleCosti }}â‚¬/mese
    </div>
  </div>
</template>

<script setup lang="ts">
const costiFissi = ref([
  { nome: 'Affitto', importo: 600 },
  { nome: 'Utenze', importo: 150 },
  { nome: 'Software', importo: 50 }
]);

function aggiungiCosto() {
  costiFissi.value.push({ nome: '', importo: 0 });
}

function rimuoviCosto(index: number) {
  costiFissi.value.splice(index, 1);
}

const totaleCosti = computed(() => {
  return costiFissi.value.reduce((sum, c) => sum + c.importo, 0);
});
</script>
```

---

## ðŸ’° Totale Costi Fissi

### Calcolo Automatico

```typescript
const totaleCostiFissi = computed(() => {
  return costiFissi.value.reduce((totale, costo) => {
    return totale + (costo.importo || 0);
  }, 0);
});
```

**Utilizzo:**
- ContabilitÃ  usa questo totale per calcolare Break-even Point
- Formula: `Costi Fissi - Bilancio Corrente`

---

# PARTE 7: TAB MATERIE

---

## ðŸ“š Gestione Materie

### Scopo

Configurazione materie insegnate, utilizzate per assegnazione tutor e alunni.

**Materie Tipiche:**
- Matematica
- Italiano
- Inglese
- Scienze
- Storia
- Fisica
- Chimica
- Latino
- Greco

---

## ðŸ“Š Tabella Materie

### Layout Tabella

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ MATERIE                                     [+ Nuova]        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•—                       â”‚
â”‚ â•‘ NOME             â•‘ ATTIVA   â•‘ ... â•‘                       â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•£                       â”‚
â”‚ â•‘ Matematica       â•‘ âœ…       â•‘ [â‹®] â•‘                       â”‚
â”‚ â•‘ Italiano         â•‘ âœ…       â•‘ [â‹®] â•‘                       â”‚
â”‚ â•‘ Inglese          â•‘ âœ…       â•‘ [â‹®] â•‘                       â”‚
â”‚ â•‘ Scienze          â•‘ âœ…       â•‘ [â‹®] â•‘                       â”‚
â”‚ â•‘ Latino           â•‘ âŒ       â•‘ [â‹®] â•‘                       â”‚
â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colonne:**
1. **Nome Materia**
2. **Attiva** (âœ…/âŒ)
3. **Azioni** (â‹®)

---

### Azioni Materia

```
Menu Dropdown (â‹®):
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âœï¸ Modifica        â”‚
â”‚ ðŸ”„ Attiva/Disattivaâ”‚
â”‚ ðŸ—‘ï¸ Elimina         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## âž• Modal Nuova Materia

### Layout Modal

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NUOVA MATERIA                               [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ NOME MATERIA:                                    â”‚
â”‚ [Filosofia]                                     â”‚
â”‚                                                  â”‚
â”‚ [Annulla]                        [ðŸ’¾ Salva]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Semplice:** Solo nome materia.

---

## ðŸ—‘ï¸ Eliminazione Materia

### Blocco se Assegnata

**Se materia assegnata a tutor/alunni:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âš ï¸ IMPOSSIBILE ELIMINARE MATERIA                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Questa materia Ã¨ assegnata a:                   â”‚
â”‚ â€¢ 5 tutor                                       â”‚
â”‚ â€¢ 12 alunni                                     â”‚
â”‚                                                  â”‚
â”‚ Per eliminare la materia, devi prima rimuoverla â”‚
â”‚ dai profili di tutor e alunni.                  â”‚
â”‚                                                  â”‚
â”‚ [OK, ho capito]                                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Se NON assegnata:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âš ï¸ CONFERMA ELIMINAZIONE                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Sei sicuro di voler eliminare questa materia?  â”‚
â”‚                                                  â”‚
â”‚ [Annulla]               [ðŸ—‘ï¸ Elimina]           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Logica Controllo Assegnazione

```typescript
async function eliminaMateria(id: string) {
  // 1. Controlla assegnazioni
  const assegnazioni = await $fetch(`/api/materie/${id}/check-assegnazioni`);
  
  if (assegnazioni.tutor.length > 0 || assegnazioni.alunni.length > 0) {
    // Blocca eliminazione
    modal.open({
      title: 'âš ï¸ Impossibile Eliminare Materia',
      description: `Questa materia Ã¨ assegnata a:\nâ€¢ ${assegnazioni.tutor.length} tutor\nâ€¢ ${assegnazioni.alunni.length} alunni\n\nPer eliminare la materia, devi prima rimuoverla dai profili.`,
      actions: [{ label: 'OK, ho capito' }]
    });
    return;
  }
  
  // 2. Conferma eliminazione
  const conferma = await confirm({
    title: 'âš ï¸ Conferma Eliminazione',
    description: 'Sei sicuro di voler eliminare questa materia?'
  });
  
  if (!conferma) return;
  
  // 3. Elimina
  await $fetch(`/api/materie/${id}`, { method: 'DELETE' });
  toast.success('Materia eliminata');
}
```

---

# PARTE 8: TAB GESTIONE UTENTI

---

## ðŸ‘¥ Gestione Utenti

### Scopo

Configurazione utenti sistema con ruoli e permessi.

**Ruoli Disponibili:**
- **Admin** (accesso completo, inclusa ContabilitÃ )
- **Segreteria** (gestione operativa, NO ContabilitÃ )

**Nota:** Ruolo **Tutor** non esiste (tutor non hanno accesso webapp admin).

---

## ðŸ“Š Tabella Utenti

### Layout Tabella

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ UTENTI                                      [+ Nuovo]        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•â•â•â•â•â•â•â•¦â•â•â•â•â•â•—    â”‚
â”‚ â•‘ NOME             â•‘ EMAIL          â•‘ RUOLO      â•‘ ... â•‘    â”‚
â”‚ â• â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•â•â•â•â•â•â•â•¬â•â•â•â•â•â•£    â”‚
â”‚ â•‘ Mario Rossi      â•‘ mario@ti...    â•‘ Admin      â•‘ [â‹®] â•‘    â”‚
â”‚ â•‘ Giulia Verdi     â•‘ giulia@ti...   â•‘ Segreteria â•‘ [â‹®] â•‘    â”‚
â”‚ â•‘ Luca Bianchi     â•‘ luca@ti...     â•‘ Admin      â•‘ [â‹®] â•‘    â”‚
â”‚ â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•â•â•â•â•â•â•â•©â•â•â•â•â•â•    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Colonne:**
1. **Nome Completo**
2. **Email** (username login)
3. **Ruolo** (Admin, Segreteria)
4. **Azioni** (â‹®)

---

### Azioni Utente

```
Menu Dropdown (â‹®):
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âœï¸ Modifica        â”‚
â”‚ ðŸ”‘ Reset Password  â”‚
â”‚ ðŸ—‘ï¸ Elimina         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## âž• Modal Nuovo Utente

### Layout Modal

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ NUOVO UTENTE                                [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ NOME:                                            â”‚
â”‚ [Mario]                                         â”‚
â”‚                                                  â”‚
â”‚ COGNOME:                                         â”‚
â”‚ [Rossi]                                         â”‚
â”‚                                                  â”‚
â”‚ EMAIL (username):                                â”‚
â”‚ [mario.rossi@tiformiamonoi.it]                  â”‚
â”‚                                                  â”‚
â”‚ RUOLO:                                           â”‚
â”‚ [Admin â–¼]                                       â”‚
â”‚   â€¢ Admin (accesso completo)                    â”‚
â”‚   â€¢ Segreteria (no ContabilitÃ )                â”‚
â”‚                                                  â”‚
â”‚ PASSWORD TEMPORANEA:                             â”‚
â”‚ [Password123!]                                  â”‚
â”‚ â„¹ï¸ L'utente potrÃ  cambiarla al primo accesso   â”‚
â”‚                                                  â”‚
â”‚ [Annulla]                        [ðŸ’¾ Crea]     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Validazione Form

```typescript
const utenteSchema = z.object({
  nome: z.string().min(2, 'Minimo 2 caratteri'),
  cognome: z.string().min(2, 'Minimo 2 caratteri'),
  email: z.string().email('Email valida'),
  ruolo: z.enum(['admin', 'segreteria']),
  password: z.string().min(8, 'Minimo 8 caratteri')
});
```

---

## âœï¸ Modal Modifica Utente

### Layout Modal

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ MODIFICA UTENTE                             [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ NOME:                                            â”‚
â”‚ [Mario]                                         â”‚
â”‚                                                  â”‚
â”‚ COGNOME:                                         â”‚
â”‚ [Rossi]                                         â”‚
â”‚                                                  â”‚
â”‚ EMAIL (username):                                â”‚
â”‚ [mario.rossi@tiformiamonoi.it]                  â”‚
â”‚                                                  â”‚
â”‚ RUOLO:                                           â”‚
â”‚ [Admin â–¼]                                       â”‚
â”‚                                                  â”‚
â”‚ [Annulla]                        [ðŸ’¾ Salva]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Nota:** Password NON modificabile qui (usa Reset Password).

---

## ðŸ”‘ Reset Password

### Modal Reset

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ RESET PASSWORD - Mario Rossi                [X] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ NUOVA PASSWORD:                                  â”‚
â”‚ [NuovaPassword123!]                             â”‚
â”‚                                                  â”‚
â”‚ â„¹ï¸ La password verrÃ  cambiata immediatamente.   â”‚
â”‚ Comunica la nuova password all'utente.          â”‚
â”‚                                                  â”‚
â”‚ [Annulla]                        [ðŸ”‘ Reset]    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

### Implementazione Reset

```typescript
async function resetPassword(userId: string, nuovaPassword: string) {
  // 1. Valida password
  if (nuovaPassword.length < 8) {
    toast.error('Password deve essere almeno 8 caratteri');
    return;
  }
  
  // 2. Reset password
  await $fetch(`/api/utenti/${userId}/reset-password`, {
    method: 'POST',
    body: { password: nuovaPassword }
  });
  
  toast.success('Password resettata. Comunica la nuova password all\'utente.');
}
```

---

## ðŸ—‘ï¸ Eliminazione Utente

### Warning Standard

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âš ï¸ CONFERMA ELIMINAZIONE UTENTE                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Sei sicuro di voler eliminare l'utente          â”‚
â”‚ Mario Rossi?                                     â”‚
â”‚                                                  â”‚
â”‚ L'utente perderÃ  immediatamente l'accesso       â”‚
â”‚ alla web app.                                    â”‚
â”‚                                                  â”‚
â”‚ [Annulla]               [ðŸ—‘ï¸ Elimina]           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

# PARTE 9: IMPLEMENTAZIONE TECNICA

---

## ðŸ’¾ Struttura Dati TypeScript

```typescript
// Pacchetti
interface PacchettoStandard {
  id: string;
  nome: string;
  tipo: 'mensile' | 'orario';
  ore: number;
  prezzo: number;
  validitaGiorni?: number; // Solo per orario
  creatoIl: Date;
  modificatoIl?: Date;
}

// Categorie ContabilitÃ 
interface CategoriaContabilita {
  id: string;
  nome: string;
  tipo: 'entrata' | 'uscita';
  colore: string; // Hex color
  attiva: boolean;
}

// Tariffe Tutor
interface TariffeTutor {
  id: string;
  singola: number;
  gruppo: number;
  maxi: number;
  dataApplicazione: Date;
  creatoIl: Date;
}

interface TariffeAttuali extends TariffeTutor {
  // Calcolate automaticamente
  mezzaSingola: number; // singola / 2
  mezzaGruppo: number; // gruppo / 2
  mezzaMaxi: number; // gruppo / 2 (NON maxi / 2)
}

// Costi Fissi
interface CostoFisso {
  nome: string;
  importo: number;
}

interface CostiFissi {
  id: string;
  costi: CostoFisso[];
  totale: number; // Somma automatica
  modificatoIl: Date;
}

// Materie
interface Materia {
  id: string;
  nome: string;
  attiva: boolean;
  creatoIl: Date;
}

// Utenti
interface Utente {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  ruolo: 'admin' | 'segreteria';
  passwordHash: string;
  creatoIl: Date;
  modificatoIl?: Date;
}
```

---

## ðŸŒ API Endpoints

```typescript
// PACCHETTI
GET /api/impostazioni/pacchetti
POST /api/impostazioni/pacchetti
PATCH /api/impostazioni/pacchetti/:id
DELETE /api/impostazioni/pacchetti/:id
GET /api/pacchetti/:id/check-uso â†’ { alunni: Alunno[] }

// CATEGORIE CONTABILITÃ€
GET /api/impostazioni/categorie-contabilita
POST /api/impostazioni/categorie-contabilita
PATCH /api/impostazioni/categorie-contabilita/:id
DELETE /api/impostazioni/categorie-contabilita/:id

// TARIFFE TUTOR
GET /api/impostazioni/tariffe â†’ TariffeAttuali
GET /api/impostazioni/tariffe/storico â†’ TariffeTutor[]
POST /api/impostazioni/tariffe
Body: { singola, gruppo, maxi, dataApplicazione }

// COSTI FISSI
GET /api/impostazioni/costi-fissi â†’ CostiFissi
PATCH /api/impostazioni/costi-fissi
Body: { costi: CostoFisso[] }

// MATERIE
GET /api/impostazioni/materie
POST /api/impostazioni/materie
PATCH /api/impostazioni/materie/:id
DELETE /api/impostazioni/materie/:id
GET /api/materie/:id/check-assegnazioni â†’ { tutor: Tutor[], alunni: Alunno[] }

// UTENTI
GET /api/impostazioni/utenti
POST /api/impostazioni/utenti
Body: { nome, cognome, email, ruolo, password }
PATCH /api/impostazioni/utenti/:id
Body: { nome, cognome, email, ruolo }
DELETE /api/impostazioni/utenti/:id
POST /api/utenti/:id/reset-password
Body: { password }

// SALVATAGGIO GLOBALE
POST /api/impostazioni/salva
Body: {
  pacchetti?: PacchettoStandard[];
  categorie?: CategoriaContabilita[];
  tariffe?: TariffeAttuali;
  costi?: CostiFissi;
  materie?: Materia[];
}
```

---

## ðŸŽ¨ Componenti Nuxt UI Utilizzati

| Componente | Utilizzo |
|------------|----------|
| `UTabs` | Tab orizzontali |
| `UCard` | Container sezioni |
| `UTable` | Tabelle dati |
| `UButton` | Azioni, salva |
| `UModal` | Modal form |
| `UInput` | Campi testo, numeri |
| `USelect` | Dropdown |
| `URadioGroup` | Tipo entrata/uscita |
| `UCheckbox` | Opzioni |
| `UDropdown` | Menu azioni (â‹®) |
| `UBadge` | Badge attivo/inattivo |

---

## ðŸ“± Responsive Mobile

### Layout Mobile

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ âš™ï¸ IMPOSTAZIONI             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Sezione:                    â”‚
â”‚ [Pacchetti â–¼]               â”‚
â”‚   â€¢ Pacchetti               â”‚
â”‚   â€¢ Categorie               â”‚
â”‚   â€¢ Tariffe                 â”‚
â”‚   â€¢ Costi Fissi             â”‚
â”‚   â€¢ Materie                 â”‚
â”‚   â€¢ Utenti                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ CONTENUTO SEZIONE           â”‚
â”‚ (tabelle/form stack)        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ [ðŸ’¾ Salva Modifiche]        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Ottimizzazioni:**
- Tab â†’ Dropdown selezione
- Tabelle scrollabili orizzontalmente
- Form stack verticale
- Bottone salva sticky bottom

---

## âœ… Checklist Implementazione

### Fase 1: Route e Struttura Base (3 giorni)
- [ ] Route `/impostazioni`
- [ ] Layout tab orizzontali
- [ ] Query params tab
- [ ] Protezione Admin-only

### Fase 2: Tab Pacchetti (4 giorni)
- [ ] Tabella pacchetti
- [ ] Modal nuovo pacchetto
- [ ] Modal modifica pacchetto
- [ ] Eliminazione con blocco se in uso
- [ ] API CRUD pacchetti

### Fase 3: Tab Categorie ContabilitÃ  (3 giorni)
- [ ] Tabella categorie
- [ ] Modal nuova categoria (+ color picker)
- [ ] Modal modifica categoria
- [ ] Eliminazione categoria
- [ ] API CRUD categorie

### Fase 4: Tab Tariffe Tutor (4 giorni)
- [ ] Form tariffe lezione intera
- [ ] Calcolo automatico mezza lezione
- [ ] Logica speciale Maxi mezza (usa Gruppo)
- [ ] Tabella storico tariffe
- [ ] API tariffe + storico

### Fase 5: Tab Costi Fissi (3 giorni)
- [ ] Lista dinamica costi
- [ ] Aggiungi costo
- [ ] Rimuovi costo
- [ ] Calcolo totale automatico
- [ ] API costi fissi

### Fase 6: Tab Materie (3 giorni)
- [ ] Tabella materie
- [ ] Modal nuova materia
- [ ] Attiva/Disattiva materia
- [ ] Eliminazione con blocco se assegnata
- [ ] API CRUD materie

### Fase 7: Tab Utenti (5 giorni)
- [ ] Tabella utenti
- [ ] Modal nuovo utente
- [ ] Modal modifica utente
- [ ] Reset password (senza email)
- [ ] Eliminazione utente
- [ ] API CRUD utenti

### Fase 8: Salvataggio Globale (2 giorni)
- [ ] Bottone "Salva Modifiche"
- [ ] API salvataggio multiplo
- [ ] Feedback successo/errore
- [ ] Validazione globale

### Fase 9: Responsive Mobile (3 giorni)
- [ ] Dropdown selezione sezione
- [ ] Layout mobile ottimizzato
- [ ] Tabelle scrollabili
- [ ] Bottone salva sticky

### Fase 10: Testing (4 giorni)
- [ ] Test CRUD tutti i moduli
- [ ] Test eliminazione con blocchi
- [ ] Test calcoli automatici (tariffe, totali)
- [ ] Test permessi Admin-only
- [ ] Test responsive mobile

**Totale stimato: 34 giorni lavorativi**

---

## ðŸŽ¯ Riepilogo FunzionalitÃ  Chiave

### âœ… **Cosa rende questa pagina efficace:**

1. **Centralizzazione configurazione** (tutto in un posto)
2. **6 Tab organizzate** (Pacchetti, Categorie, Tariffe, Costi, Materie, Utenti)
3. **Gestione pacchetti** (mensili fissi, orari personalizzabili)
4. **Categorie contabilitÃ ** (con colori per grafici)
5. **Tariffe tutor** (modificabili con storico)
6. **Calcolo automatico mezza lezione** (con logica speciale Maxi)
7. **Costi fissi dinamici** (lista personalizzabile)
8. **Gestione materie** (con blocco eliminazione se assegnate)
9. **Gestione utenti** (Admin, Segreteria con permessi)
10. **Reset password manuale** (no email, modifica diretta)
11. **Blocchi intelligenti** (impedisce eliminazioni problematiche)
12. **Salvataggio con conferma** (bottone esplicito)

### ðŸ”— **Collegamenti Esterni:**

**Verso questa pagina:**
- Sidebar â†’ "Impostazioni" (solo Admin)

**Da questa pagina:**
- Nessuna navigazione esterna (pagina self-contained)

**Dati utilizzati da:**
- Pagina Alunni â†’ Usa pacchetti standard
- Pagina Calendario â†’ Usa tariffe tutor per calcolo compensi
- Pagina ContabilitÃ  â†’ Usa categorie + costi fissi (break-even)
- Tutte le pagine â†’ Usano materie per filtri/assegnazioni

---

## ðŸ“Š Metriche e KPI

**Configurazioni gestite:**
- Pacchetti standard (tipologie offerte)
- Categorie contabilitÃ  (entrate/uscite)
- Tariffe compensi tutor (singola, gruppo, maxi)
- Costi fissi mensili (break-even)
- Materie insegnate
- Utenti sistema (admin, segreteria)

**Business Value:**
- **Pacchetti standard:** Velocizzano acquisizione nuovi alunni
- **Categorie contabilitÃ :** Organizzazione finanziaria coerente
- **Tariffe tutor:** Calcolo compensi automatico e corretto
- **Costi fissi:** Monitoraggio break-even point preciso
- **Materie:** Assegnazioni tutor/alunni consistenti
- **Utenti:** Controllo accessi e sicurezza

---

**Fine Documentazione Pagina Impostazioni v1.0**

*Documento creato il: 4 Novembre 2025 - 19:13*  
*Integra tutte le specifiche concordate tramite domande strategiche*