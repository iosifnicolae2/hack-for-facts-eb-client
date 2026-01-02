# ROL

Ești un expert în Finanțe Publice din România și Analist de Date Bugetare. Sarcina ta este să generezi o fișă tehnică detaliată pentru un cod specific din clasificația economică a cheltuielilor bugetare.

# INPUT

**Codul:** 51
**Denumirea:** Transferuri între unități ale administrației publice
**Tip clasificație:** Economică (Anexa II din Ordinul MFP 1954/2005)

# INSTRUCȚIUNI DE PROCESARE

1. **Căutare și Validare:**
   - Verifică denumirea oficială în Ordinul MFP 1954/2005 (Anexa II - Clasificația economică a cheltuielilor)
   - Identifică baza legală (Legea 273/2006, Legea 500/2002)
   - Determină natura indicatorului: Cheltuială (+), dar se elimină la consolidare
   - Transferurile între entități publice nu afectează bugetul general consolidat net

2. **Sinteză Tehnică:**
   - Explică ce tipuri de transferuri există (curente, de capital)
   - Formulează logica de calcul pentru baze de date
   - **IMPORTANT:** Explică tratamentul la consolidare (se elimină pentru a evita dubla evidență)

# FORMATUL DE RĂSPUNS (OBLIGATORIU)

Te rog să structurezi răspunsul exact după următorul template, menținând un ton profesional și tehnic:

---

## Capitol 51 - Transferuri între unități ale administrației publice

### Definiție și scop

[Descriere clară a ce reprezintă acest capitol din clasificația economică.]
[Explică că sunt transferuri INTERNE în sectorul public.]

**Baza legală principală:**

- [Act normativ 1]
- [Act normativ 2]

### Cum funcționează în practică

[Explică mecanismul: De la cine la cine? Pentru ce scopuri? Cum se înregistrează?]

1. [Componentă - Transferuri curente (51.01)]
2. [Componentă - Transferuri de capital (51.02)]

### Utilizare în calcul și impact bugetar

**Semn și Logică:**
[Explică că este cheltuială (+) la plătitor, dar venit la primitor. La consolidare se elimină.]

**Formula simplificată:**

```
La nivel individual: Cheltuieli +
La nivel consolidat: Se elimină (plătitor + primitor = 0 net)
```

**Impact pe tipuri de bugete:**

| Tip Buget | Tratament | Observații |
|-----------|-----------|------------|
| Buget de Stat | + (cheltuială) | Transferuri către locale, instituții |
| Bugete Locale | + (cheltuială) | Transferuri între UAT-uri |
| La consolidare | Se elimină | Evitarea dublei evidențe |

### Aspecte importante

**1. [Aspect Cheie 1]:** [Diferența între transferuri curente și de capital]
**2. [Aspect Cheie 2]:** [Importanța eliminării la consolidare]
**3. Magnitudine:** [Estimare - sume semnificative între niveluri de guvernare]

### Interpretare pentru analiză tehnică și consolidare

*Secțiune dedicată ingineriei de date și analizei financiare:*

**Pentru analiză la nivel individual:**
- [Instrucțiune clară: se tratează ca cheltuială normală]

**Pentru analiză la nivel de buget general consolidat:**
- [Instrucțiune CRITICĂ: OBLIGATORIU se elimină pentru a evita dubla înregistrare]
- [Explică mecanismul de eliminare]

### Întrebări frecvente (FAQ)

**Q1: De ce se elimină transferurile la consolidare?**
A: [Răspuns concis - pentru că reprezintă aceiași bani care se mută între entități publice]

**Q2: Care este diferența dintre transferuri curente și de capital?**
A: [Răspuns concis]

**Q3: Cum se identifică perechea plătitor-primitor?**
A: [Răspuns concis]

### Documente relevante

1. [**Ordinul MFP nr. 1954/2005** - Anexa II](https://legislatie.just.ro/Public/DetaliiDocument/67596)
2. [**Legea nr. 500/2002** - Finanțele publice](https://legislatie.just.ro/Public/DetaliiDocumentAfis/37954)
3. [**Legea nr. 273/2006** - Finanțele publice locale](https://legislatie.just.ro/Public/DetaliiDocument/73527)

### Notă importantă

[Context final despre importanța acestui capitol. Menționează că înțelegerea transferurilor este ESENȚIALĂ pentru analiza corectă a finanțelor publice consolidate și evitarea supraevaluării cheltuielilor totale.]

---

**REGULI STRICTE:**
1. NU inventa informații - dacă nu poți verifica, menționează explicit
2. NU include cod SQL sau sintaxă de programare
3. Toate link-urile trebuie să fie funcționale
4. Documentul trebuie să fie utilizabil de către un cetățean sau jurnalist
5. Răspunsul trebuie să fie în limba română
6. Format: Markdown

## Research URL

https://claude.ai/chat/e20f4045-00dd-4d50-a9a0-38a77b1ad719

## Processed

- **Date:** 2026-01-02 23:41:20
- **Output:** [51.md](../51.md)
