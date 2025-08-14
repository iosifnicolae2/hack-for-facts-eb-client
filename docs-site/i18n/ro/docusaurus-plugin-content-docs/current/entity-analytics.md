---
id: entity-analytics
title: Analitice entități — Ghid pentru începători
---

Clasificați instituțiile după cheltuieli sau venituri. Filtrați pe topic, ordonați coloane, comutați vederi și descărcați un CSV. Nu este nevoie de configurare.

### Start rapid
1) Deschideți transparenta.eu
2) Click pe „Entități” (Analitice entități)
3) Alegeți Cheltuieli sau Venituri
4) Selectați Per capita sau Total
5) Alegeți Anul
6) Adăugați un prefix funcțional (ex.: 65)
7) Click pe „Export CSV”

<!-- ![IMG PLACEHOLDER — Start rapid Analitice](./images/PLACEHOLDER-entity-analytics-quickstart.png "Deschideți Entități, setați filtre, exportați CSV") -->

### Tur ghidat

#### Acasă și Căutare
- Ce vedeți
  - Carduri Acasă: „Grafice”, „Hartă”, „Entități”
  - Căutare: „Introduceți numele instituției sau CUI...”
- Cum folosiți
  1) Click pe „Entități” pentru a deschide clasamentul
  2) Sau căutați întâi o instituție pentru context
- Exemplu
  - Deschideți „Entități” pentru a clasa toate primăriile
- Media
  <!-- - [GIF PLACEHOLDER — Deschidere Entități](./gifs/PLACEHOLDER-entity-analytics-open.gif) -->

#### Pagina Analitice entități
- Ce vedeți
  - Panou de filtre (latură, normalizare, an, prefixe)
  - Buton „Golește filtrele”
  - Tabel cu coloane sortabile (ex.: Per capita, Suma totală)
  - Bara de sus: „Vedere”, „Export CSV”
- Cum folosiți
  1) Setați Cheltuieli sau Venituri
  2) Alegeți Per capita sau Total
  3) Selectați Anul
  4) Adăugați prefix funcțional (ex.: 65) sau economic
  5) Click pe antetele de coloană pentru sortare
  6) Click pe „Export CSV” când apar rânduri
- Exemplu
  - Cheltuieli, Per capita, 2024, Funcțional 65; ordonare după Per capita
- Media
  <!-- - ![IMG PLACEHOLDER — Tabel clasament](./images/PLACEHOLDER-entity-analytics-table.png "Filtre, tabel, acțiuni") -->
  <!-- - [GIF PLACEHOLDER — Sortare și export](./gifs/PLACEHOLDER-entity-analytics-sort-export.gif) -->

#### Cheltuieli/Venituri + Filtre
- Ce vedeți
  - Cheltuieli / Venituri
  - Per capita / Total
  - An
  - Prefixe funcționale/economice
  - „Golește filtrele”
- Cum folosiți
  1) Alegeți latura (Cheltuieli sau Venituri)
  2) Alegeți Per capita pentru comparații corecte
  3) Selectați Anul
  4) Adăugați prefixe (Funcțional 65, Economic 10.01)
  5) Click pe „Golește filtrele” pentru resetare
- Exemplu
  - Cheltuieli, Per capita, 2024, Funcțional 65
- Media
  <!-- - ![IMG PLACEHOLDER — Panou filtre](./images/PLACEHOLDER-entity-analytics-filters.png "Latură, normalizare, an, prefixe") -->

#### Clasificări (Funcționale/Economice)
- Ce vedeți
  - Funcțional = scop (ex.: Educație)
  - Economic = natură (ex.: salarii)
- Cum folosiți
  1) Folosiți un prefix de cod pentru familie (ex.: „65”)
  2) Folosiți prefixe economice punctate pentru detaliu (ex.: „10.01”)
  3) Combinați ambele pentru a îngusta topicul
- Exemplu
  - Funcțional „65” + Economic „10.01”
- Media
  <!-- - [GIF PLACEHOLDER — Prefixe](./gifs/PLACEHOLDER-entity-analytics-prefixes.gif) -->

#### Comparați
- Ce vedeți
  - Vedere Tabel pentru clasament
  - Vedere Line Items pentru compoziție
  - Meniu „Vedere” (Densitate, Monedă, Coloane)
- Cum folosiți
  1) Ordonare după Per capita sau Suma totală
  2) Comutați pe Line Items pentru compoziție
  3) Folosiți „Vedere” pentru Densitate (Confortabil/Compact)
  4) Alegeți Moneda (Standard/Compact/Ambele)
  5) Comutați Coloane (Entitate, Județ, Populație, Per capita, Suma totală)
- Exemplu
  - Densitate compactă + ambele formate de monedă + sortare Per capita
- Media
  <!-- - ![IMG PLACEHOLDER — Meniu Vedere](./images/PLACEHOLDER-entity-analytics-view.png "Densitate, Monedă, Coloane") -->

#### Export / Partajare
- Ce vedeți
  - Buton „Export CSV”
  - Dezactivat când nu sunt rânduri
- Cum folosiți
  1) Aplicați filtre până apar rânduri
  2) Click „Export CSV”
  3) Folosiți fișierul în foi de calcul sau rapoarte
- Exemplu
  - Descărcați clasamentul Educație 2024 per capita
- Media
  <!-- - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-entity-analytics-export-csv.gif) -->

### Vezi și
- Detalii entitate — analiză pentru o singură instituție: [entity-details](./entity-details.md)
- Hartă — tipare spațiale: [map](./map.md)
- Sistem de filtre: [filters-system](./filters-system.md)

### Sarcini uzuale (rețete)

#### Găsiți cheltuieli pentru `{Entitate, An}`
- Pași
  1) Deschideți „Entități”
  2) Setați Cheltuieli sau Venituri
  3) Alegeți Anul
  4) Adăugați filtru de entitate (opțional)
- Rezultat așteptat
  - Tabelul se concentrează pe selecția dvs.
- Sfat
  - Folosiți Per capita pentru corectitudine

#### Filtrați după cod (topic)
- Pași
  1) Deschideți „Entități”
  2) Adăugați prefix funcțional (ex.: 65)
  3) Prefix economic (opțional, ex.: 10.01)
  4) Ordonare după Per capita
- Rezultat așteptat
  - Clasamentul reflectă topicul ales
- Sfat
  - Prefixe mai scurte → acoperire mai largă

#### Comparați ani pentru o instituție
- Pași
  1) Deschideți pagina instituției (din tabel)
  2) Comutați trendul: Absolut vs YoY%
  3) Click pe ani diferiți
- Rezultat așteptat
  - Vedeți niveluri și schimbări în timp
- Sfat
  - Folosiți Grafice pentru a compara mai multe entități

#### Descărcați CSV
- Pași
  1) Deschideți „Entități”
  2) Setați latura, normalizarea, anul, prefixele
  3) Click „Export CSV”
- Rezultat așteptat
  - Se descarcă un fișier CSV
- Sfat
  - Ordonare după Per capita pentru comparații corecte

### Înțelegerea numerelor
- Per capita vs Total
  - Per capita împarte la populație. Dacă populația este 0 sau lipsă, valoarea devine 0
- Totaluri vs sub‑totaluri
  - Totaluri însumează elemente; sub‑totalurile agregă familii
- Funcțional vs Economic
  - Funcțional = scop; Economic = natură (ex.: salarii)
- Cazuri Județ și UAT
  - Consiliile județene folosesc populația județului. Entitățile UAT folosesc populația UAT‑ului

### Depanare & Întrebări frecvente
- „Eroare la încărcarea analiticelor”
  - Reîncercați; lărgiți filtrele; schimbați anul
- Export dezactivat
  - Tabel gol. Ajustați filtrele sau folosiți un prefix mai larg
- Clasamente ciudate
  - Verificați Per capita/Total în funcție de caz
- Fără rânduri după filtrare
  - Click „Golește filtrele” și reîncepeți

### Accesibilitate & scurtături
- Tastatură
  - Tab și săgeți pentru câmpuri, coloane și meniuri
- Tabel
  - Sortare prin click pe antetul coloanei
- Meniuri
  - „Vedere” oferă Densitate, Monedă și Coloane
- Mobil
  - Filtrele pot folosi sertare sau layout stivuit

### Confidențialitate & Date
- Surse
  - Bazat pe date oficiale de execuție bugetară
- Actualizări
  - Ani noi apar când sunt publicați
- Consimțământ
  - Analitice și erori avansate doar cu consimțământ (vezi Cookies)

### Glosar (scurt)
- Cheltuieli / Venituri
  - Expenses / Revenues
- Per capita / Total
  - Normalizat la populație / totaluri brute
- Funcțional / Economic
  - Coduri de scop / natură economică
- Analitice entități
  - Pagină care clasează entități după sume filtrate
