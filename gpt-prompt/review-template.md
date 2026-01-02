## Fișier de revizuit

[`public/assets/text/ro/functional/87.md`](https://github.com/ClaudiuBogdan/hack-for-facts-eb-client/blob/main/public/assets/text/ro/functional/87.md)

## Descriere

Capitol 87 - Alte acțiuni economice din clasificația funcțională a cheltuielilor/veniturilor bugetare conform Ordinului MFP nr. 1954/2005.

---

## Checklist de Revizuire

### 1. Acuratețe Legală și Tehnică

#### 🔴 Critical

- [ ] Codul bugetar (capitol/subcapitol) corespunde cu Ordinul MFP nr. 1954/2005
- [ ] Denumirea oficială este identică cu cea din Anexa I (venituri) sau Anexa II (cheltuieli)
- [ ] Referințele legislative sunt actuale și corect citate
- [ ] Semnul matematic (+/-) pentru calcule bugetare este corect documentat
- [ ] Tratamentul în consolidare (buget general consolidat) este corect specificat

#### 🟡 Nice to have

- [ ] Maparea COFOG (clasificare internațională) este prezentă și corectă
- [ ] Sufixele pentru tipul de buget sunt explicate (01=buget stat, 02=bugete locale, 03=BASS, etc.)
- [ ] Formulele de calcul sunt corecte și complete
- [ ] Subcapitolele și paragrafele sunt listate conform clasificației oficiale

**📋 Cum verific:**

1. Descarcă anexele oficiale de pe [MFP - Clasificații bugetare](https://mfinante.gov.ro/domenii/bugetul-de-stat/clasificatiile-bugetare):
   - [Anexa I](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrI_13102025.xls) - Clasificația veniturilor
   - [Anexa II](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrII_29012025.xls) - Clasificația cheltuielilor
   - [Cuprins 2025](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/Cuprins2025.xls) - Structura completă
2. Verifică [Ordinul MFP 1954/2005](https://legislatie.just.ro/Public/DetaliiDocument/67596) pe legislatie.just.ro
3. Pentru COFOG, consultă [Anexa 7](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/Anexanr7_13052025.xls) - corespondența cu clasificarea funcțională internațională

---

### 2. Completitudine (Structură Document)

#### 🔴 Critical

- [ ] Secțiunea "Definiție și scop" este prezentă și completă
- [ ] Secțiunea "Cum funcționează în practică" explică mecanismul (cine plătește → cine primește → cum se execută)
- [ ] Secțiunea "Utilizare în calcul și impact bugetar" specifică impactul pe tipuri de bugete
- [ ] Secțiunea "Documente relevante" conține referințe la legislația primară

#### 🟡 Nice to have

- [ ] Secțiunea "Aspecte importante" acoperă cazuri speciale, excepții și modificări recente
- [ ] Secțiunea "Interpretare pentru analiză tehnică și consolidare" oferă ghid pentru analiza datelor
- [ ] Sunt listate toate subcapitolele/paragrafele conform Anexei I sau II MFP
- [ ] Ordinea de mărime financiară este menționată (cu surse oficiale: execuție bugetară MFP)

**📋 Cum verific:**

1. Compară structura cu template-ul standard din alte fișiere din folder
2. Verifică că toate subcapitolele din [Anexa II MFP](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrII_29012025.xls) sunt menționate pentru capitolul respectiv
3. Pentru date financiare oficiale, consultă [Informații execuție bugetară MFP](https://mfinante.gov.ro/domenii/bugetul-de-stat/informatii-executie-bugetara)

---

### 3. Claritate și Calitate Conținut

#### 🔴 Critical

- [ ] Explicațiile sunt clare și accesibile pentru un utilizator fără pregătire de specialitate
- [ ] Terminologia este consistentă cu nomenclatura oficială MFP
- [ ] Nu există cod SQL, sintaxă de programare sau referințe tehnice de implementare

#### 🟡 Nice to have

- [ ] Exemplele practice sunt relevante și au surse citate (nu sunt inventate)
- [ ] Fluxul financiar este ilustrat clar (text descriptiv sau diagramă)
- [ ] Contextul și importanța clasificării în sistemul bugetar sunt explicate
- [ ] Comparații utile cu alte capitole conexe sunt menționate

**📋 Cum verific:**

1. Citește documentul ca un utilizator fără experiență bugetară - este ușor de înțeles?
2. Identifică termeni tehnici neexplicați
3. Verifică consistența termenilor între secțiuni
4. Asigură-te că nu există numere "inventate" - toate datele trebuie să aibă sursă

---

### 4. Link-uri și Formatare

#### 🔴 Critical

- [ ] Link-urile către legislatie.just.ro funcționează și afișează documentul corect
- [ ] Link-urile către mfinante.gov.ro funcționează
- [ ] Formatarea Markdown este corectă (headings, liste, tabele se afișează corect)

#### 🟡 Nice to have

- [ ] Tabelele sunt bine formatate și aliniate
- [ ] Link-urile au text descriptiv (nu URL-uri goale de tip "click aici")
- [ ] Secțiunile au spațiere consistentă
- [ ] Referințele sunt formatate uniform în tot documentul

**📋 Cum verific:**

1. Click pe fiecare link și verifică că pagina se încarcă corect
2. Pentru legislatie.just.ro, verifică că documentul afișat corespunde cu cel citat (număr și an)
3. Previzualizează fișierul Markdown în GitHub sau VS Code pentru formatare
4. Verifică că link-urile MFP nu sunt expirate (anexele se actualizează periodic)

---

### 5. Limba Română

#### 🔴 Critical

- [ ] Gramatica este corectă
- [ ] Diacriticele sunt utilizate corect (ă, â, î, ș, ț - forme Unicode corecte)

#### 🟡 Nice to have

- [ ] Stilul este consistent în tot documentul (formal, tehnic)
- [ ] Terminologia oficială MFP este folosită consecvent
- [ ] Acronimele sunt explicate la prima utilizare (ANAF, UAT, DGASPC, etc.)

**📋 Cum verific:**

1. Citește cu atenție pentru greșeli gramaticale
2. Verifică diacriticele: "ș" nu "ş", "ț" nu "ţ" (formele Unicode corecte, nu cele vechi)
3. Folosește un spell-checker pentru limba română dacă este disponibil

---

### 6. Conformitate cu Standarde și Raportare

#### 🟡 Nice to have (toate)

- [ ] Clasificarea este mapată la COFOG conform [Anexa 7 MFP](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/Anexanr7_13052025.xls)
- [ ] Este menționată corespondența cu clasificația economică unde este relevant
- [ ] Tratamentul pentru raportarea ESA 2010 este menționat (dacă aplicabil)
- [ ] Indicatorii din FOREXEBUG sunt menționați (dacă aplicabil)

**📋 Cum verific:**

1. Consultă [Anexa 7](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/Anexanr7_13052025.xls) pentru maparea COFOG oficială
2. Verifică dacă există note de modificare recente pentru acest capitol pe [pagina MFP Clasificații](https://mfinante.gov.ro/domenii/bugetul-de-stat/clasificatiile-bugetare)

---

## Note de Revizuire
<!-- 
Adaugă aici:
- Probleme găsite
- Sugestii de îmbunătățire  
- Întrebări pentru clarificare
- Link-uri către surse consultate
-->

## Capturi de Ecran / Dovezi
<!-- 
Adaugă imagini pentru:
- Erori găsite (screenshot)
- Comparații cu documentele oficiale
- Link-uri nefuncționale
-->

---

## Resurse Oficiale pentru Verificare

### Legislație Primară

| Document | Link |
|----------|------|
| Ordinul MFP nr. 1954/2005 | [legislatie.just.ro](https://legislatie.just.ro/Public/DetaliiDocument/67596) |
| Legea nr. 500/2002 - Finanțele publice | [legislatie.just.ro](https://legislatie.just.ro/Public/DetaliiDocumentAfis/37954) |
| Legea nr. 273/2006 - Finanțele publice locale | [legislatie.just.ro](https://legislatie.just.ro/Public/DetaliiDocument/73527) |

### Anexe Clasificații Bugetare (MFP - actualizate 2025)

| Anexă | Conținut | Link |
|-------|----------|------|
| Cuprins 2025 | Structura completă | [XLS](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/Cuprins2025.xls) |
| Anexa I | Clasificația veniturilor bugetului de stat | [XLS](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrI_13102025.xls) |
| Anexa I (eco) | Clasificația economică | [XLS](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrIec_27112025.xls) |
| Anexa II | Clasificația cheltuielilor bugetului de stat | [XLS](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/AnexanrII_29012025.xls) |
| Anexa 7 | Corespondență COFOG | [XLS](https://mfinante.gov.ro/static/10/Mfp/buget/sitebuget/clasificatii/Anexanr7_13052025.xls) |

### Alte Resurse

| Resursă | Link |
|---------|------|
| Pagina MFP Clasificații | [mfinante.gov.ro](https://mfinante.gov.ro/domenii/bugetul-de-stat/clasificatiile-bugetare) |
| Execuție bugetară MFP | [mfinante.gov.ro](https://mfinante.gov.ro/domenii/bugetul-de-stat/informatii-executie-bugetara) |
| FOREXEBUG (raportare) | [forexepublic.mfinante.gov.ro](https://forexepublic.mfinante.gov.ro/) |
