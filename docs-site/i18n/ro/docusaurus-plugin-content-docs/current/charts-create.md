---
id: charts-create
title: Grafice — Ghid pentru creare și configurare
---

Creați un grafic partajabil pornind de la întrebare. Adăugați una sau mai multe serii (cu filtre), alegeți tipul vizual și partajați sau exportați.

### Start rapid
1) Deschideți transparenta.eu → „Grafice”
2) Click „Creează grafic”
3) Adăugați o serie (ex.: Agregat anual)
4) Alegeți entități, Ani, latura (Cheltuieli/Venituri) și prefixe
5) Salvați pentru a vedea graficul
6) Comutați tipul graficului și Legendă/Tooltip
7) „Share Chart” → „Copy Link”

<!-- ![IMG PLACEHOLDER — Creare grafice](./images/PLACEHOLDER-charts-create-quickstart.png "Creează, adaugă serii, configurează, partajează") -->

### Tur ghidat

#### Acasă și Căutare
- Ce vedeți
  - Carduri: „Grafice”, „Hartă”, „Entități”
  - Căutare: „Introduceți numele instituției sau CUI...”
- Cum folosiți
  1) Click pe „Grafice” pentru a construi de la zero
  2) Sau căutați o instituție mai întâi pentru a prelua filtrele ulterior
- Exemplu
  - Construiți un grafic pentru a compara două orașe

#### Fluxul „Creează grafic”
- Ce vedeți
  - „Creează grafic” redirecționează la `/charts/$chartId?view=config`
  - Taburi/secțiuni pentru Serii și Opțiuni grafic
- Cum folosiți
  1) Adăugați o serie „Agregat anual”
  2) Alegeți entități, „Ani raportare”, latura și prefixe de topic
  3) Salvați pentru vedere generală; redeschideți configurarea pentru ajustări
- Exemplu
  - Două serii: Sibiu vs Cluj, Educație (65), Per capita

#### Configurați graficul
- Ce vedeți
  - Tipuri: Line, Bar, Area, tipuri agregate (Bar, Pie, Treemap, Sankey)
  - Opțiuni: Data Labels, Legend, Tooltip, Annotations, Show Diff
  - Meniu rapid: Duplicate, Delete, Copy Data, Bulk edit filters
- Cum folosiți
  1) Alegeți tipul potrivit întrebării
  2) Comutați opțiunile de afișare pentru claritate
  3) Folosiți „Bulk edit filters” pentru a modifica mai multe serii odată
- Exemplu
  - Line, Legend activ, Data Labels dezactivat

#### Export / Partajare
- Ce vedeți
  - „Share Chart” cu „PNG”, „SVG”, „Copy Link”
- Cum folosiți
  1) „Copy Link” pentru a partaja vederea exactă
  2) Exportați PNG/SVG pentru prezentări
- Exemplu
  - Partajați linkul graficului în raport

### Sarcini uzuale

#### Găsiți cheltuieli pentru `{Entitate, An}`
- Pași
  1) Adăugați o serie „Agregat anual”
  2) Selectați entitatea și „Ani raportare”
  3) Alegeți Cheltuieli sau Venituri
- Rezultat așteptat
  - O serie temporală apare în grafic
- Sfat
  - Denumiți clar seria (ex.: „Sibiu — Edu (Per capita)”) 

#### Filtrați după cod (topic)
- Pași
  1) În serie, adăugați un prefix funcțional (ex.: 65)
  2) Opțional, adăugați un prefix economic (ex.: 10.01)
  3) Folosiți Per capita pentru corectitudine între orașe
- Rezultat așteptat
  - Graficul se concentrează pe topicul ales
- Sfat
  - Prefixe mai scurte oferă acoperire mai largă

#### Comparați ani sau orașe
- Pași
  1) Adăugați a doua serie „Agregat anual”
  2) Păstrați același topic și aceeași normalizare
  3) Alegeți Line sau Area pentru trenduri
- Rezultat așteptat
  - Comparație vizuală clară între serii
- Sfat
  - Evitați să amestecați Total cu Per capita

#### Descărcați un clasament CSV (în afara graficelor)
- Pași
  1) Deschideți „Entități”
  2) Aplicați aceleași filtre ca în grafic
  3) Click „Export CSV”
- Rezultat așteptat
  - Un CSV cu clasamentul filtrat
- Sfat
  - Folosiți CSV pentru a valida insight‑urile din grafic

### Înțelegerea numerelor
- Per capita vs Total
  - Per capita împarte la populație; dacă 0/lipsă, valoarea devine 0
- Totaluri vs sub‑totaluri
  - Totalurile însumează elementele; sub‑totalurile agregă familii
- Funcțional vs Economic
  - Funcțional = scop; Economic = natură

### Depanare & Întrebări frecvente
- Graficul este aglomerat
  - Ascundeți serii; folosiți Bar/Treemap pentru compoziție
- „Copy Link” nu a funcționat
  - Asigurați‑vă că graficul este vizibil; încercați din nou
- Seria nu are date
  - Verificați ani, latură și acoperirea prefixelor
- Export imagine eșuat
  - Încercați PNG dacă SVG eșuează, sau invers

### Accesibilitate & tastatură
- Tastatură
  - ⌘/Ctrl+C/X/V copiere/tăiere/lipire serii; ⌘/Ctrl+D duplicare
- Focus
  - Tab/Shift+Tab între controale
- Operații în masă
  - „Bulk edit filters” pentru multe serii

### Confidențialitate & Date
- Surse
  - Bazat pe date oficiale de execuție bugetară
- Actualizări
  - Ani noi apar când sunt publicați
- Consimțământ
  - Analitice și erori avansate doar cu consimțământ

### Vezi și
- Bibliotecă grafice: [charts-list](./charts-list.md)
- Detaliu grafic — configurare, adnotare, partajare: [charts-detail](./charts-detail.md)
- Stocare & persistență — backup/restaurare: [storage-and-persistence](./storage-and-persistence.md)

### Glosar (scurt)
- Serie
  - O linie/bară cu propriile filtre
- Agregat anual
  - Serie care grupează valorile pe ani
- Share Chart
  - Copiați un link sau exportați imagini pentru grafic
