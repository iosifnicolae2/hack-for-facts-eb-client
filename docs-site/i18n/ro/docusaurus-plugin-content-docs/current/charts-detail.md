---
id: charts-detail
title: Detaliu grafic — construiți, configurați, adnotați, partajați
---

Construiți un grafic clar, ajustați aspectul, adăugați note și partajați. Setările și seriile sunt salvate cu graficul și pot fi partajate prin link.

### Start rapid
1) Deschideți transparenta.eu → „Grafice”
2) Click „Creează grafic”
3) Adăugați o serie (topic, entitate, an)
4) Alegeți tipul (Line, Bar, Area sau tipuri agregate)
5) Comutați Legend, Tooltip și Data Labels
6) „Share Chart” → „Copy Link”
7) Lipiți linkul într‑un articol sau chat

<!-- ![IMG PLACEHOLDER — Detaliu grafic](./images/PLACEHOLDER-charts-detail-quickstart.png "Creează, configurează, partajează") -->

### Tur ghidat

#### Pagina graficului (overview)
- Ce vedeți
  - Canvas („chart-display-area”)
  - „Configurare rapidă” cu setări comune
  - „Share Chart” cu PNG, SVG, Copy Link
  - Meniu: Duplicate, Delete, Copy Data, Bulk edit filters
- Cum folosiți
  1) Folosiți „Configurare rapidă” pentru a schimba tipul
  2) Comutați Data Labels, Legend, Tooltip
  3) Activați Show Annotations și Show Diff la nevoie
  4) Folosiți meniul pentru Duplicate sau Bulk edit filters
- Exemplu
  - Comutați la Area; afișați Legend; activați Annotations

#### Configurarea seriilor
- Ce vedeți
  - Adăugați serii (ex.: linii de execuție agregate anual)
  - Filtre pentru an, latură (Cheltuieli/Venituri) și prefixe
  - Opțiuni pentru serii calculate, statice și personalizate
- Cum folosiți
  1) Adăugați o serie „Agregat anual”
  2) Alegeți entități, ani și prefixe de topic
  3) Opțional, adăugați o serie de calcul pentru rapoarte
  4) Țineți sub control seriile vizibile
- Exemplu
  - Două orașe, Educație (65), Per capita

#### Adnotați graficul
- Ce vedeți
  - Comutatoare „Show Annotations” și „Edit Annotations”
  - Instrumente de adnotare (punct, linie, prag, regiune)
- Cum folosiți
  1) Porniți „Show Annotations”
  2) Porniți „Edit Annotations”
  3) Adăugați note în puncte cheie pentru context
- Exemplu
  - Marcați o dată de schimbare de politică pe serie

#### Export / Partajare
- Ce vedeți
  - Card „Share Chart”: „PNG”, „SVG”, „Copy Link”
- Cum folosiți
  1) Click „PNG” sau „SVG” pentru a exporta o imagine
  2) Click „Copy Link” pentru a partaja exact graficul
  3) Asigurați‑vă că graficul este vizibil înainte de export
- Exemplu
  - Lipiți linkul într‑un chat de redacție

### Sarcini uzuale

#### Găsiți cheltuieli pentru `{Entitate, An}`
- Pași
  1) Adăugați o serie Agregat anual
  2) Alegeți entitatea și „Ani raportare”
  3) Alegeți Cheltuieli sau Venituri
- Rezultat așteptat
  - Seria afișează valorile pentru entitatea și anul alese
- Sfat
  - Denumiți descriptiv seriile

#### Filtrați după cod (topic)
- Pași
  1) În serie, adăugați prefix funcțional (ex.: 65)
  2) Opțional, adăugați prefix economic (ex.: 10.01)
  3) Alegeți Per capita pentru comparații corecte
- Rezultat așteptat
  - Graficul se concentrează pe topicul ales
- Sfat
  - Prefixe mai scurte → acoperire mai largă

#### Comparați ani sau entități
- Pași
  1) Adăugați a doua serie pentru alt oraș sau categorie
  2) Păstrați același topic și aceeași normalizare
  3) Alegeți Line sau Area pentru trend
- Rezultat așteptat
  - Comparație vizuală ușoară între serii
- Sfat
  - Evitați amestecarea unităților/normalizărilor

#### Descărcați CSV (din clasament)
- Pași
  1) Deschideți „Entități” pentru un tabel de clasament
  2) Aplicați filtre ca în grafic
  3) Click „Export CSV”
- Rezultat așteptat
  - Se descarcă un CSV pentru aria dvs.
- Sfat
  - Folosiți CSV în foi de calcul pentru analiză suplimentară

### Înțelegerea numerelor
- Per capita vs Total
  - Per capita împarte la populație; dacă 0/lipsă, valoarea devine 0
- Totaluri vs sub‑totaluri
  - Totalurile însumează elemente; sub‑totalurile agregă familii
- Funcțional vs Economic
  - Funcțional = scop; Economic = natură
- Unități și grafice mixte
  - Evitați pie dacă unitățile diferă; bar/treemap sunt mai sigure

### Depanare & Întrebări frecvente
- „Copy Link” nu a mers
  - Asigurați vizibilitatea graficului; reîncercați
- Grafic aglomerat
  - Reduceți seriile vizibile; folosiți Bar/Treemap pentru compoziție
- Topic greșit capturat
  - Re‑verificați prefixele și intervalele de ani
- Export imagine eșuat
  - Încercați dimensiuni mai mici; asigurați vizibilitatea completă

### Accesibilitate & tastatură
- Tastatură
  - ⌘/Ctrl+C/X/V pentru serii; ⌘/Ctrl+D duplicare
- Focus
  - Tab/Shift+Tab prin controale
- Adnotări
  - Comutați „Show” și „Edit” pentru gestionarea notelor
- Operații în masă
  - „Bulk edit filters” pentru multe serii odată

### Confidențialitate & Date
- Surse
  - Bazat pe date oficiale de execuție bugetară
- Actualizări
  - Ani noi apar când sunt publicați
- Consimțământ
  - Analitice și erori avansate doar cu consimțământ

### Vezi și
- Bibliotecă grafice: [charts-list](./charts-list.md)
- Grafice — Creează: [charts-create](./charts-create.md)
- Stocare & persistență — backup/restaurare: [storage-and-persistence](./storage-and-persistence.md)
