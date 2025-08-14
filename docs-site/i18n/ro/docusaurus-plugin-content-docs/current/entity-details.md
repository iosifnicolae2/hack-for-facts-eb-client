---
id: entity-details
title: Detalii entitate — Ghid pentru începători
---

Vedeți o imagine completă a unei instituții. Alegeți anul, citiți KPI‑urile, parcurgeți Cheltuieli și Venituri, evidențiați topicuri și deschideți rapoarte. Nu este nevoie de configurare.

### Start rapid
1) Deschideți transparenta.eu
2) Căutați „Introduceți numele instituției sau CUI...”
3) Deschideți pagina instituției
4) Alegeți „An raportare:”
5) Comutați trendul: Absolut sau YoY%
6) Căutați „Învățământ” în Cheltuieli
7) Deschideți „Rapoarte” pentru descărcări

<!-- ![IMG PLACEHOLDER — Start rapid instituție](./images/PLACEHOLDER-entity-quickstart.png "Antet, An, KPI‑uri, coloane") -->

### Tur ghidat

#### Acasă și Căutare
- Ce vedeți
  - Carduri: „Grafice”, „Hartă”, „Entități”
  - Căutare: „Introduceți numele instituției sau CUI...”
- Cum folosiți
  1) Apăsați ⌘/Ctrl+K sau click în căsuța de căutare
  2) Tastați câteva litere (ex.: „Sibiu”)
  3) Alegeți rezultatul corect și apăsați Enter
- Exemplu
  - Deschideți „Municipiul Sibiu”
- Media
  <!-- - [GIF PLACEHOLDER — Căutare acasă](./gifs/PLACEHOLDER-entity-home-search.gif) -->

#### Pagina instituției
- Ce vedeți
  - Antet cu „An raportare:”
  - KPI‑uri și grafic de trend (Absolut vs YoY%)
  - Două coloane: Cheltuieli și Venituri
  - Analitice cu comutatoare Bar/Pie
  - Rapoarte cu linkuri de descărcare
- Cum folosiți
  1) Schimbați „An raportare:”
  2) Click pe un an din grafic pentru a sincroniza pagina
  3) Căutați în coloane pentru a evidenția topicuri
  4) Comutați Analitice pe Bar sau Pie
  5) Deschideți „Rapoarte” pentru descărcare
- Exemplu
  - An 2024. Căutați „Învățământ” în Cheltuieli
- Media
  <!-- - ![IMG PLACEHOLDER — Pagina instituției](./images/PLACEHOLDER-entity-page.png "Antet, An, KPI‑uri, coloane") -->
  <!-- - [GIF PLACEHOLDER — An + trend](./gifs/PLACEHOLDER-entity-year.gif) -->

#### Cheltuieli/Venituri + Filtre
- Ce vedeți
  - Cheltuieli / Venituri
  - Comutator trend: Absolut / YoY%
  - Analitice (Bar/Pie) pentru compoziție rapidă
  - Căutare în coloane pentru evidențiere topicuri
- Cum folosiți
  1) Alegeți Cheltuieli sau Venituri
  2) Comutați trendul pentru ritmuri de schimbare
  3) Folosiți căutarea în coloane (ex.: „Edu”)
  4) Folosiți Bar/Pie pentru instantanee structurale
- Exemplu
  - Cheltuieli + Bar, evidențiați „Învățământ”
- Media
  <!-- - ![IMG PLACEHOLDER — Filtre cheltuieli](./images/PLACEHOLDER-entity-spending.png "Coloane, trend, analitice") -->

#### Clasificări (Funcționale/Economice)
- Ce vedeți
  - Funcțional = scop (ex.: Educație)
  - Economic = natură (ex.: salarii)
- Cum folosiți
  1) În coloane, folosiți căutarea pentru a găsi topicuri
  2) Începeți cu termeni scurți (ex.: „Edu”)
  3) Folosiți Bar/Pie pentru compoziție
- Exemplu
  - Evidențiați Educație, apoi comutați pe Bar
- Media
  <!-- - [GIF PLACEHOLDER — Căutare în coloană](./gifs/PLACEHOLDER-entity-column-search.gif) -->

#### Comparați
- Ce vedeți
  - „Hartă” pentru tipare spațiale
  - „Entități” (Analitice entități) pentru clasamente
  - „Grafice” pentru comparații în timp
- Cum folosiți
  1) Din pagina instituției, deschideți „Hartă” pentru vecini
  2) Deschideți „Entități” pentru ordonare și export
  3) „Grafice” → „Creează grafic” pentru a compara orașe
- Exemplu
  - Comparați două municipii la Educație per capita
- Media
  <!-- - ![IMG PLACEHOLDER — Comparați](./images/PLACEHOLDER-entity-compare.png "Hartă + clasament + grafic") -->

#### Export / Partajare
- Ce vedeți
  - „Entități” are „Export CSV”
  - „Grafice” are „Share Chart” → „PNG”, „SVG”, „Copy Link”
- Cum folosiți
  1) Pentru clasamente, deschideți „Entități” → „Export CSV”
  2) Într‑un grafic, folosiți „Share Chart” → „Copy Link”
- Exemplu
  - Descărcați un CSV pentru topicul și anul dvs.
- Media
  <!-- - [GIF PLACEHOLDER — Export CSV](./gifs/PLACEHOLDER-entity-export-csv.gif) -->
  <!-- - [GIF PLACEHOLDER — Copy Link](./gifs/PLACEHOLDER-entity-copy-link.gif) -->

### Vezi și
- Analitice entități (clasament): [entity-analytics](./entity-analytics.md)
- Hartă — comparație spațială: [map](./map.md)
- Deep‑link & vizualizări partajabile: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)

### Sarcini uzuale (rețete)

#### Găsiți cheltuieli pentru `{Entitate, An}`
- Pași
  1) Căutați și deschideți instituția
  2) Selectați „An raportare:”
  3) Alegeți Cheltuieli sau Venituri
- Rezultat așteptat
  - KPI‑uri, liste și analitice reflectă anul
- Sfat
  - Click pe un an din grafic pentru sincronizare

#### Filtrați după topic (simplu)
- Pași
  1) În Cheltuieli, folosiți câmpul de căutare
  2) Tastați un termen scurt (ex.: „Edu”)
  3) Comutați Analitice pe Bar pentru compoziție
- Rezultat așteptat
  - Rândurile cu termenul sunt evidențiate; structura e clară
- Sfat
  - Porniți general, apoi rafinați

#### Comparați ani pentru o instituție
- Pași
  1) Comutați trendul: Absolut vs YoY%
  2) Click pe ani diferiți din graficul de trend
  3) Observați schimbările în KPI‑uri și liste
- Rezultat așteptat
  - Vedeți nivelul și schimbarea în timp
- Sfat
  - Folosiți Grafice pentru comparații multi‑serie

#### Descărcați un clasament CSV
- Pași
  1) Deschideți „Entități”
  2) Setați Cheltuieli, Per capita, An
  3) Adăugați un prefix funcțional (opțional)
  4) Click „Export CSV”
- Rezultat așteptat
  - Se descarcă un fișier CSV
- Sfat
  - Ordonare după Per capita pentru comparații corecte

### Înțelegerea numerelor
- Totaluri vs sub‑totaluri
  - Totalurile însumează elementele din aria aleasă; sub‑totalurile agregă familii
- Per capita vs Total
  - Per capita împarte la populație. Dacă populația este 0 sau lipsă, valoarea devine 0
- Funcțional vs Economic
  - Funcțional = scop; Economic = natură (ex.: salarii)
- TVA și subvenții
  - Explorați în vederi economice

### Depanare & Întrebări frecvente
- „Nu am găsit date”
  - Instituția nu are date pentru selecție. Încercați altă instituție
- „Eroare la încărcarea detaliilor”
  - Verificați conexiunea; încercați din nou; schimbați anul
- Nu găsesc un topic
  - Folosiți termeni mai scurți (ex.: „Edu”)
- Valorile par prea mici
  - Treceți pe Total sau încercați alt an

### Accesibilitate & scurtături
- Focalizare căutare
  - Apăsați ⌘/Ctrl+K din Acasă
- Selector an
  - Apăsați ⌘/Ctrl+; pentru „An raportare:”
- Navigare tastatură
  - Folosiți Tab și săgeți pentru câmpuri și liste
- Mobil
  - Unele controale trec în meniuri/accordion

### Confidențialitate & Date
- Surse
  - Bazat pe date oficiale de execuție bugetară
- Ritm actualizări
  - Ani noi apar când sunt publicați; anii vechi rămân stabili
- Consimțământ
  - Analitice și erori avansate doar cu consimțământ

### Glosar (scurt)
- Cheltuieli / Venituri
  - Expenses / Revenues
- Per capita / Total
  - Normalizat la populație / totaluri brute
- Funcțional / Economic
  - Coduri de scop / natură economică
- An raportare
  - Anul folosit pentru toate valorile din pagină
