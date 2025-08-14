---
id: workflow
title: Flux — de la întrebare la insight partajabil
---

Un parcurs clar de la întrebare la un răspuns pe care îl puteți partaja. Folosiți Analitice entități pentru a găsi outlieri, Harta pentru a confirma tipare, Detalii entitate pentru investigație și Grafice pentru comunicare.

**Pentru cine**: Începători și practicieni care vor o metodă fiabilă

**Rezultate**: Pași reproductibili pe care îi puteți repeta și partaja prin linkuri

### Start rapid (Încercați acum)
1) Deschideți Entități (clasament): [Deschideți aplicația](https://transparenta.eu/analytics)
2) Alegeți Cheltuieli → Per capita → An (ex.: 2024)
3) Adăugați prefix funcțional „65” (Educație) și ordonați
4) Deschideți Harta pentru validare spațială: [Deschideți Harta](https://transparenta.eu/map)
5) Deschideți o instituție din hartă; citiți KPI‑uri și trenduri
6) Construiți un grafic pentru două orașe: [Grafice – Nou](https://transparenta.eu/charts/new)
7) „Share Chart” → „Copy Link” și lipiți

<!-- ![IMG PLACEHOLDER — Workflow quickstart](./images/PLACEHOLDER-workflow-quickstart.png "Entități → Hartă → Entitate → Grafic → Share") -->

### Tur ghidat

#### 1) Găsiți outlieri în Entități (Analitice entități)
- Ce vedeți
  - Tabel de clasament cu filtre pentru latură (Cheltuieli/Venituri), normalizare (Per capita/Total), An și prefixe
- Cum folosiți
  1) Setați Cheltuieli, Per capita, An
  2) Adăugați prefix funcțional „65”
  3) Ordonare după coloana Per capita
- Exemplu
  - Top cheltuitori per capita la Educație în 2024
- Media
  <!-- - ![IMG PLACEHOLDER — Clasament entități](./images/PLACEHOLDER-workflow-entities.png "Filtre + tabel sortabil") -->

#### 2) Validați tiparele pe Hartă
- Ce vedeți
  - Hartă termică cu Filtre și Legendă; comutați la Tabel sau Grafic
- Cum folosiți
  1) Deschideți Harta; setați aceeași latură, normalizare, an și prefix
  2) Inspectați culorile și intervalele; folosiți Legenda
  3) Click pe o regiune pentru a deschide instituția
- Exemplu
  - Județe cu cheltuieli per capita mai mari la Educație se grupează regional
- Media
  <!-- - ![IMG PLACEHOLDER — Validare pe hartă](./images/PLACEHOLDER-workflow-map.png "Hartă + legendă") -->

#### 3) Investigați pe pagina instituției
- Ce vedeți
  - „An raportare:”, KPI‑uri, trend (Absolut vs YoY%), coloane Cheltuieli/Venituri, Analitice, Rapoarte
- Cum folosiți
  1) Alegeți anul și click pe un punct din trend pentru a sincroniza
  2) Căutați „Învățământ” în Cheltuieli pentru a evidenția rânduri
  3) Comutați Analitice pe Bar/Pie pentru compoziție
  4) Verificați Rapoarte pentru fișierele sursă
- Exemplu
  - Observați dacă nivelurile sau ritmurile explică clasamentul
- Media
  <!-- - ![IMG PLACEHOLDER — Investigație](./images/PLACEHOLDER-workflow-entity.png "An + trend + coloane + analitice") -->

#### 4) Comunicați prin Grafice (și partajați)
- Ce vedeți
  - Canvas cu Configurare rapidă și Share Chart
- Cum folosiți
  1) Creați un grafic; adăugați două serii „Agregat anual” pentru două orașe
  2) Păstrați același topic și aceeași normalizare
  3) Alegeți Line/Area; activați Legend și Labels după nevoie
  4) Share Chart → Copy Link; exportați PNG/SVG dacă e necesar
- Exemplu
  - „Sibiu vs Cluj — Educație per capita (2019–2024)”
- Media
  <!-- - ![IMG PLACEHOLDER — Grafic partajabil](./images/PLACEHOLDER-workflow-chart.png "Serii + tip + share") -->

### Sarcini uzuale (rețete)

#### Găsiți top cheltuitori per capita pe un topic
- Pași
  1) Deschideți Entități; setați Cheltuieli, Per capita, An
  2) Adăugați prefix funcțional „65”
  3) Ordonare după Per capita
- Rezultat așteptat
  - Un clasament exportabil CSV
- Sfat
  - Prefixe scurte pentru familii mai largi
- Link
  - [Găsiți top cheltuitori](./how-to/find-top-spenders.md)

#### Comparați două orașe în timp
- Pași
  1) Deschideți Grafice → Creează
  2) Adăugați două serii cu același topic și aceeași normalizare
  3) Alegeți Line sau Area
- Rezultat așteptat
  - Trenduri clare pentru ambele orașe
- Sfat
  - Denumiți clar seriile
- Link
  - [Comparați două orașe](./how-to/compare-two-cities.md)

#### Partajați o vedere reproductibilă
- Pași
  1) Configurați filtrele în Entități sau Hartă
  2) Copiați URL‑ul (deep‑link)
  3) Sau, în Grafice, Share Chart → Copy Link
- Rezultat așteptat
  - Alții deschid aceeași vedere filtrată
- Sfat
  - Preferabil Per capita pentru comparații între localități
- Link
  - [Deep‑link & vizualizări partajabile](./deeplinks-and-python-tools.md)

### Înțelegerea numerelor
- Per capita vs Total
  - Per capita împarte la populație; dacă populația e 0/lipsă, valoarea devine 0
- Totaluri și sub‑totaluri
  - Totaluri însumează elemente; sub‑totalurile agregă familii de coduri
- Funcțional vs Economic
  - Funcțional = scop; Economic = natură (ex.: salarii)

### Depanare & Întrebări frecvente
- Clasamente goale
  - Treci pe Total; scurtează prefixele; încearcă alt an
- Harta pare „plat”
  - Folosește Per capita sau un prefix mai înalt
- Nu găsesc o instituție
  - Mai puține cuvinte; verifică ortografia
- Graficul nu are date
  - Verifică ani, latură și prefixe

### Accesibilitate & scurtături
- Căutare
  - ⌘/Ctrl+K din orice pagină
- „An raportare”
  - ⌘/Ctrl+; pentru a deschide selectorul
- Editare grafice
  - ⌘/Ctrl+C/X/V pentru serii; ⌘/Ctrl+D duplicare

### Confidențialitate & Date
- Surse
  - Date oficiale de execuție bugetară
- Consimțământ
  - Analitice/erori avansate doar cu opt‑in

### Glosar (scurt)
- Entitate
  - Instituție publică (ex.: primărie)
- Per capita / Total
  - Normalizat la populație / totaluri brute
- Funcțional / Economic
  - Coduri de scop / natură economică

### Vezi și
- Quickstart: [quickstart](./quickstart.md)
- Analitice entități: [entity-analytics](./entity-analytics.md)
- Grafice — Creează: [charts-create](./charts-create.md)
