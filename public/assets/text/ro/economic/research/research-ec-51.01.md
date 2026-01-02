# ROL

Ești un expert în Finanțe Publice din România și Analist de Date Bugetare. Sarcina ta este să generezi o fișă tehnică detaliată pentru un cod specific din clasificația economică a cheltuielilor bugetare.

# INPUT

**Codul:** 51.01
**Denumirea:** Transferuri curente
**Tip clasificație:** Economică (Anexa II din Ordinul MFP 1954/2005)
**Capitol părinte:** 51 - Transferuri între unități ale administrației publice

# INSTRUCȚIUNI DE PROCESARE

1. **Căutare și Validare:**
   - Verifică denumirea oficială în Ordinul MFP 1954/2005 (Anexa II - Clasificația economică a cheltuielilor)
   - Identifică baza legală (Legea 273/2006, Legea 500/2002)
   - Determină natura indicatorului: Cheltuială (+) la plătitor, dar SE ELIMINĂ LA CONSOLIDARE
   - IMPORTANT: Transferurile între entități publice nu reprezintă cheltuieli finale

2. **Sinteză Tehnică:**
   - Explică ce tipuri de transferuri curente există
   - Formulează logica de calcul pentru baze de date
   - Menționează OBLIGATORIU tratamentul la consolidare

# FORMATUL DE RĂSPUNS (OBLIGATORIU)

Te rog să structurezi răspunsul exact după următorul template, menținând un ton profesional și tehnic:

---

## Subcapitol 51.01 - Transferuri curente

### Definiție și scop

[Descriere clară a ce reprezintă acest subcapitol din clasificația economică.]
[Explică că sunt transferuri pentru cheltuieli curente între entități publice.]

**Baza legală principală:**

- [Legea nr. 273/2006 - Finanțele publice locale (art. privind transferurile)]
- [Legea nr. 500/2002 - Finanțele publice]

### Tipuri de transferuri curente

| De la | Către | Exemple |
|-------|-------|---------|
| Buget de Stat | Bugete locale | Cote defalcate TVA, sume defalcate |
| Buget de Stat | Instituții publice | Finanțare funcționare |
| Bugete locale | Alte bugete locale | Transferuri între UAT-uri |
| Bugete locale | Instituții subordonate | Finanțare unități subordonate |

### Utilizare în calcul și impact bugetar

**Semn și Logică:**
[Explică că este cheltuială (+) la plătitor, DAR SE ELIMINĂ LA CONSOLIDARE]

**Formula simplificată:**

```text
La nivel individual: Cheltuială (+)
La nivel CONSOLIDAT: SE ELIMINĂ (cheltuială plătitor = venit primitor)
Efect net la consolidare = 0
```

**Impact pe tipuri de bugete:**

| Tip Buget | Tratament individual | Tratament consolidat |
|-----------|---------------------|---------------------|
| Buget de Stat | + (cheltuială) | SE ELIMINĂ |
| Bugete Locale | + (cheltuială) | SE ELIMINĂ |
| La primitor | + (venit) | SE ELIMINĂ |

### Aspecte importante - CONSOLIDARE

**1. CRITICĂ:** [Transferurile între entități publice NU sunt cheltuieli finale]
**2. La consolidare:** [Se elimină pentru a evita dubla înregistrare]
**3. Mecanism:** [Ce este cheltuială la A devine venit la B → net = 0]

### Interpretare pentru analiză tehnică și consolidare

*Secțiune dedicată ingineriei de date și analizei financiare:*

**Pentru analiză la nivel individual:**
- [Instrucțiune clară: se tratează ca cheltuială normală]
- [Reflectă fluxul de resurse de la o entitate la alta]

**Pentru analiză la nivel de buget general consolidat:**
- [INSTRUCȚIUNE CRITICĂ: OBLIGATORIU SE ELIMINĂ]
- [Identificare perechi: cheltuială 51.01 la plătitor = venit la primitor]
- [Nerespectarea consolidării duce la supraevaluarea cheltuielilor publice]

### Întrebări frecvente (FAQ)

**Q1: De ce se elimină transferurile la consolidare?**
A: [Pentru că nu sunt cheltuieli finale - banii doar se mută între entități publice]

**Q2: Cum se identifică perechea plătitor-primitor?**
A: [Prin codul de identificare fiscală (CUI) și documentele justificative]

**Q3: Sumele defalcate din TVA sunt transferuri?**
A: [Da, sunt transferuri de la bugetul de stat către bugetele locale]

### Documente relevante

1. [**Ordinul MFP nr. 1954/2005** - Anexa II](https://legislatie.just.ro/Public/DetaliiDocument/67596)
2. [**Legea nr. 273/2006** - Finanțele publice locale](https://legislatie.just.ro/Public/DetaliiDocument/73527)
3. [**Metodologia de consolidare MFP**](https://mfinante.gov.ro)

### Notă importantă

[Context final: Transferurile curente (51.01) între unități ale administrației publice sunt esențiale pentru funcționarea sistemului bugetar, dar NU reprezintă cheltuieli finale ale sectorului public. La consolidare, aceste transferuri TREBUIE eliminate pentru a evita dubla înregistrare și supraevaluarea cheltuielilor publice totale.]

---

**REGULI STRICTE:**
1. NU inventa informații - dacă nu poți verifica, menționează explicit
2. NU include cod SQL sau sintaxă de programare
3. Toate link-urile trebuie să fie funcționale
4. Documentul trebuie să fie utilizabil de către un cetățean sau jurnalist
5. Răspunsul trebuie să fie în limba română
6. Format: Markdown

## Research URL

https://claude.ai/chat/a636326b-7a75-4233-b1b3-0335518ccd19
