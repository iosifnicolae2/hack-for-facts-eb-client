# ROL

Ești un expert în Finanțe Publice din România și Analist de Date Bugetare. Sarcina ta este să generezi o fișă tehnică detaliată pentru un cod specific din clasificația economică a cheltuielilor bugetare.

# INPUT

**Codul:** 60.01
**Denumirea:** Fonduri europene nerambursabile
**Tip clasificație:** Economică (Anexa II din Ordinul MFP 1954/2005)
**Capitol părinte:** 60 - Proiecte cu finanțare din sumele reprezentând asistența financiară nerambursabilă aferentă PNRR

# INSTRUCȚIUNI DE PROCESARE

1. **Căutare și Validare:**
   - Verifică denumirea oficială în Ordinul MFP 1954/2005 (Anexa II - Clasificația economică a cheltuielilor)
   - Identifică baza legală (OUG 124/2021 - PNRR, Regulamentul UE 2021/241)
   - Determină natura indicatorului: Cheltuială (+), finanțată din fonduri UE
   - Reprezintă componenta de grant (nerambursabil) din PNRR

2. **Sinteză Tehnică:**
   - Explică ce reprezintă fondurile PNRR nerambursabile
   - Formulează logica de calcul pentru baze de date
   - Menționează diferența față de componenta de împrumut (capitol 61)

# FORMATUL DE RĂSPUNS (OBLIGATORIU)

Te rog să structurezi răspunsul exact după următorul template, menținând un ton profesional și tehnic:

---

## Subcapitol 60.01 - Fonduri europene nerambursabile (PNRR)

### Definiție și scop

[Descriere clară a ce reprezintă acest subcapitol din clasificația economică.]
[Explică că include cheltuielile finanțate din componenta de grant a PNRR - bani care NU trebuie returnați UE.]

**Baza legală principală:**

- [OUG nr. 124/2021 - Cadrul instituțional și financiar pentru PNRR]
- [Regulamentul UE 2021/241 - Mecanismul de Redresare și Reziliență]
- [Decizia de punere în aplicare a Consiliului pentru PNRR România]

### PNRR - Structura finanțării

| Componentă | Valoare | Natura |
|------------|---------|--------|
| Granturi (nerambursabile) | ~14,2 mld EUR | NU se returnează |
| Împrumuturi | ~14,9 mld EUR | SE returnează |
| **Total PNRR România** | ~29,1 mld EUR | |

**Capitol 60 = Granturi (nerambursabile)**
**Capitol 61 = Împrumuturi (rambursabile)**

### Utilizare în calcul și impact bugetar

**Semn și Logică:**
[Explică că este cheltuială (+), dar finanțată extern - nu afectează deficitul în același mod]

**Formula simplificată:**

```text
Fonduri PNRR nerambursabile (60.01) = Cheltuieli eligibile finanțate din grant UE
Nu se returnează la UE (diferit de 61 - împrumuturi)
```

**Impact pe tipuri de bugete:**

| Tip Buget | Tratament | Observații |
|-----------|-----------|------------|
| Buget de Stat | + | [Proiecte naționale PNRR] |
| Bugete Locale | + | [Proiecte locale finanțate PNRR - transport, educație, sănătate] |

### Aspecte importante

**1. Diferența grant vs împrumut:** [60 = grant (nu se returnează), 61 = împrumut (se returnează)]
**2. Condiționare jaloane și ținte:** [Fondurile sunt condiționate de atingerea jaloanelor și țintelor]
**3. Magnitudine:** [~91 mld RON pentru transport - vezi treemap]

### Interpretare pentru analiză tehnică și consolidare

*Secțiune dedicată ingineriei de date și analizei financiare:*

**Pentru analiză la nivel individual:**
- [Instrucțiune clară: cheltuieli finanțate din fonduri UE nerambursabile]

**Pentru analiză la nivel de buget general consolidat:**
- [Instrucțiune clară: se includ în cheltuieli, dar sursa de finanțare este externă]
- [Important pentru calculul deficitului: nu afectează în același mod ca cheltuielile din resurse proprii]

### Întrebări frecvente (FAQ)

**Q1: Care este diferența dintre capitol 60 și capitol 61?**
A: [60 = granturi nerambursabile (nu se returnează); 61 = împrumuturi (se returnează la UE)]

**Q2: PNRR afectează deficitul bugetar?**
A: [Componenta de împrumut (61) crește datoria; granturi (60) nu afectează deficitul direct]

**Q3: Ce se întâmplă dacă nu se ating jaloanele?**
A: [România riscă să nu primească tranșele de finanțare de la UE]

### Documente relevante

1. [**Ordinul MFP nr. 1954/2005** - Anexa II](https://legislatie.just.ro/Public/DetaliiDocument/67596)
2. [**OUG nr. 124/2021** - PNRR](https://legislatie.just.ro/Public/DetaliiDocument/249573)
3. [**PNRR România**](https://mfe.gov.ro/pnrr/)
4. [**Regulamentul UE 2021/241**](https://eur-lex.europa.eu/legal-content/RO/TXT/?uri=CELEX%3A32021R0241)

### Notă importantă

[Context final: Fondurile europene nerambursabile PNRR (60.01) reprezintă componenta de grant a Planului Național de Redresare și Reziliență. Acești bani (~14,2 mld EUR pentru România) NU trebuie returnați la UE, spre deosebire de componenta de împrumut (capitol 61). Finanțarea este condiționată de atingerea jaloanelor și țintelor asumate de România.]

---

**REGULI STRICTE:**
1. NU inventa informații - dacă nu poți verifica, menționează explicit
2. NU include cod SQL sau sintaxă de programare
3. Toate link-urile trebuie să fie funcționale
4. Documentul trebuie să fie utilizabil de către un cetățean sau jurnalist
5. Răspunsul trebuie să fie în limba română
6. Format: Markdown

## Research URL

https://claude.ai/chat/e04e98ac-78d0-44a4-8d85-063dd8f23dac
