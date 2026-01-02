# ROL

Ești un expert în Finanțe Publice din România și Analist de Date Bugetare. Sarcina ta este să generezi o fișă tehnică detaliată pentru un cod specific din clasificația economică a cheltuielilor bugetare.

# INPUT

**Codul:** 81.01
**Denumirea:** Rambursări de credite externe
**Tip clasificație:** Economică (Anexa II din Ordinul MFP 1954/2005)
**Capitol părinte:** 81 - Rambursări de credite

# INSTRUCȚIUNI DE PROCESARE

1. **Căutare și Validare:**
   - Verifică denumirea oficială în Ordinul MFP 1954/2005 (Anexa II - Clasificația economică a cheltuielilor)
   - Identifică baza legală (OUG 64/2007 - Datoria publică, Legea 273/2006)
   - Determină natura indicatorului: Operațiune financiară (+) - SUB LINIA DE DEFICIT
   - Reprezintă returnarea principalului la credite externe (diferit de dobânzi!)

2. **Sinteză Tehnică:**
   - Explică ce tipuri de rambursări externe sunt incluse
   - Formulează logica de calcul pentru baze de date
   - Menționează diferența față de plata dobânzilor (capitol 30)

# FORMATUL DE RĂSPUNS (OBLIGATORIU)

Te rog să structurezi răspunsul exact după următorul template, menținând un ton profesional și tehnic:

---

## Subcapitol 81.01 - Rambursări de credite externe

### Definiție și scop

[Descriere clară a ce reprezintă acest subcapitol din clasificația economică.]
[Explică că reprezintă returnarea PRINCIPALULUI la creditele externe - NU dobânzile!]

**Baza legală principală:**

- [OUG nr. 64/2007 - Datoria publică]
- [Legea nr. 273/2006 - Finanțele publice locale]
- [Acorduri de împrumut cu instituții financiare internaționale]

### Diferența cheie: Rambursări vs. Dobânzi

| Element | Rambursări (81.01) | Dobânzi (30.02) |
|---------|-------------------|-----------------|
| Ce reprezintă | Returnarea principalului | Costul împrumutului |
| Efect asupra datoriei | REDUCE datoria | NU reduce datoria |
| Poziție în buget | Sub linia de deficit | Deasupra liniei de deficit |
| Impact deficit ESA | NU afectează | Afectează deficitul |

### Tipuri de credite externe rambursate

| Sursa | Descriere | Exemple |
|-------|-----------|---------|
| Instituții financiare internaționale | FMI, Banca Mondială, BERD | Împrumuturi pentru reforme |
| Piețe externe | Euroobligațiuni | Titluri emise în EUR/USD |
| Credite bilaterale | Guverne străine | Acorduri guvernamentale |
| Împrumuturi UE | SURE, MRR | Facilități europene |

### Utilizare în calcul și impact bugetar

**Semn și Logică:**
[Explică că este operațiune financiară (+), dar SUB LINIA DE DEFICIT]

**Formula simplificată:**

```text
Rambursări credite externe (81.01) = Σ Rate scadente principal împrumuturi externe

IMPORTANT: Sunt "sub linia" - nu afectează deficitul ESA!
Deficitul se calculează ÎNAINTE de rambursări.
```

**Impact pe tipuri de bugete:**

| Tip Buget | Tratament | Observații |
|-----------|-----------|------------|
| Buget de Stat | + | [Principal debitor - datorie publică externă] |
| Bugete Locale | + | [Rambursări împrumuturi externe locale] |

### Aspecte importante

**1. Sub linia de deficit:** [Rambursările NU afectează deficitul bugetar ESA]
**2. Diferența față de dobânzi:** [Principalul reduce datoria; dobânzile sunt cost]
**3. Magnitudine:** [~4,31 mld RON pentru datorii externe locale - vezi treemap]

### Interpretare pentru analiză tehnică și consolidare

*Secțiune dedicată ingineriei de date și analizei financiare:*

**Pentru analiză la nivel individual:**
- [Instrucțiune clară: operațiune financiară, nu cheltuială obișnuită]
- [Se tratează separat de cheltuielile curente și de capital]

**Pentru analiză la nivel de buget general consolidat:**
- [Instrucțiune clară: rambursările între entități publice se elimină (dacă există)]
- [Cele către creditori externi rămân]

### Întrebări frecvente (FAQ)

**Q1: Care este diferența dintre rambursări (81) și dobânzi (30)?**
A: [Rambursările = returnarea sumei împrumutate (principal); Dobânzile = costul împrumutului]

**Q2: Rambursările afectează deficitul bugetar?**
A: [NU direct - sunt "sub linia de deficit", dar afectează necesarul de finanțare]

**Q3: De ce sunt importante pentru bugete locale?**
A: [UAT-urile care au contractat credite externe trebuie să le ramburseze din buget propriu]

### Documente relevante

1. [**Ordinul MFP nr. 1954/2005** - Anexa II](https://legislatie.just.ro/Public/DetaliiDocument/67596)
2. [**OUG nr. 64/2007** - Datoria publică](https://legislatie.just.ro/Public/DetaliiDocument/83786)
3. [**Rapoarte datorie publică MFP**](https://mfinante.gov.ro/domenii/datorie-publica)

### Notă importantă

[Context final: Rambursările de credite externe (81.01) reprezintă returnarea principalului la împrumuturile contractate din străinătate. Spre deosebire de dobânzi (capitol 30), rambursările REDUC efectiv datoria publică și sunt operațiuni "sub linia de deficit" - nu afectează indicatorul de deficit bugetar, dar afectează necesarul de finanțare al bugetului.]

---

**REGULI STRICTE:**
1. NU inventa informații - dacă nu poți verifica, menționează explicit
2. NU include cod SQL sau sintaxă de programare
3. Toate link-urile trebuie să fie funcționale
4. Documentul trebuie să fie utilizabil de către un cetățean sau jurnalist
5. Răspunsul trebuie să fie în limba română
6. Format: Markdown

## Research URL

https://claude.ai/chat/8612ccbe-8fb3-4a26-87f3-e549b8227584

## Processed

- **Date:** 2026-01-02 23:45:14
- **Output:** [81.01.md](../81.01.md)
