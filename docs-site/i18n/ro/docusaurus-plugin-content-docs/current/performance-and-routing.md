---
id: performance-and-routing
title: Performanță & Rutare — rapid implicit
---

Aplicația este concepută să se simtă instant. Paginile preîncarcă ce aveți nevoie, componentele grele se încarcă doar la deschidere, iar linkurile păstrează contextul (an/filtre) ca să nu vă pierdeți locul. Această pagină explică aspectele vizibile pentru utilizator.

**Pentru cine**: Oricine își dorește o experiență fluidă pe desktop și mobil

**Rezultate**: Recunoașteți stările de încărcare, păstrați contextul la navigare, recuperați dacă o pagină pare lentă

### Start rapid
1) Folosiți căutarea din Acasă (⌘/Ctrl+K) pentru a deschide direct o instituție
2) Navigați cu linkuri din aplicație; anul și filtrele rămân setate
3) Graficele și tabelele mari afișează un schelet scurt în timpul încărcării
4) Pe rețele lente, comutați pe Total sau folosiți prefixe mai scurte
5) Partajați deep‑linkuri pentru a deschide aceeași vedere filtrată

<!-- ![IMG PLACEHOLDER — Performance quickstart](./images/PLACEHOLDER-performance-quickstart.png "Căutare, navigare, schelete, deep‑link") -->

### Tur ghidat

#### Navigare rapidă (păstrați contextul)
- Ce vedeți
  - Linkurile din aplicație vă duc între Hartă, Entități, pagini de Instituție și Grafice
  - Anul, latura și topicul se mențin acolo unde are sens
- Cum folosiți
  1) Din Hartă, click pe o regiune pentru pagina instituției
  2) Din Entități, sortați și exportați CSV fără a reface filtrele
  3) Dintr‑un grafic, Back pentru a reveni la lista de grafice
- Exemplu
  - Deschideți Hartă → click pe un oraș → se deschide instituția cu anul ales

#### Încărcare inteligentă (schelete și la cerere)
- Ce vedeți
  - Placeholder‑e scurte în timpul încărcării (schelete pe grafice/tabele)
  - Paginile devin interactive rapid; părțile grele apar imediat după
- Cum folosiți
  1) Așteptați un moment pentru vederi grele (grafice sau tabele mari)
  2) Dacă filtrul e prea strict, lărgiți pentru a vedea rezultate mai repede
- Exemplu
  - Clasamentul din Entități apare instant; rândurile se populează treptat

#### Rutare prietenoasă pe mobil
- Ce vedeți
  - Pe Hartă, filtrele și legenda se deschid ca modale; paginile evită reload complet
- Cum folosiți
  1) Atingeți Filtre pentru a ajusta topicul și anul
  2) Folosiți gestul back pentru a reveni; selecțiile rămân
- Exemplu
  - Comutați între Hartă și instituție fără a pierde anul ales

#### Partajare și redeschidere vederi
- Ce vedeți
  - Deep‑link‑urile codifică contextul în URL; graficele au „Share Chart”
- Cum folosiți
  1) Copiați URL‑ul pentru același an și aceleași filtre
  2) În grafice, „Share Chart” → „Copy Link”
- Exemplu
  - Partajați „Educație per capita în 2024” din Entități

### Sarcini uzuale

#### Păstrați filtrele la navigare
- Pași
  1) Setați latura, normalizarea, anul și prefixele
  2) Urmați linkurile din aplicație (Hartă → Entitate, Entități → CSV etc.)
- Rezultat așteptat
  - Selecțiile rămân; nu reintroduceți date
- Sfat
  - Dacă se resetează contextul, re‑aplicați din taguri sau panoul de filtre

#### Faceți o pagină lentă să se încarce mai repede
- Pași
  1) Comutați pe Total
  2) Folosiți un prefix funcțional mai scurt (ex.: „65”)
  3) Alegeți un an recent cu date mai complete
- Rezultat așteptat
  - Rezultate mai rapide; rafinați după încărcare
- Sfat
  - Evitați combinarea multor filtre pe rețele lente

#### Partajați un link care se deschide repede
- Pași
  1) Configurați vederea (Per capita, an, prefix)
  2) Copiați URL‑ul (sau „Share Chart” → „Copy Link”)
- Rezultat așteptat
  - Ceilalți deschid același context cu încărcare minimă
- Sfat
  - Preferabil prefixe scurte pentru rezultate mai largi și rapide

### Înțelegerea numerelor & stărilor
- Per capita vs Total
  - Per capita împarte la populație; dacă populația e 0/lipsă, valoarea devine 0. Total afișează sume brute
- Gol, încărcare, eroare
  - Încărcare afișează schelete; gol = fără rânduri; erorile oferă Retry
- Familii de topicuri
  - Prefixe scurte includ mai multe elemente și se încarcă de obicei mai repede inițial

### Depanare & Întrebări frecvente
- O pagină rămâne prea mult pe schelet
  - Verificați conexiunea; lărgiți filtrele; încercați Total
- Apare „Nu există date”
  - Ajustați anul sau eliminați un prefix foarte îngust
- Mi‑am pierdut poziția după Back
  - Redeschideți ultima pagină; majoritatea păstrează selecțiile
- Aplicația pare mai lentă pe mobil
  - Folosiți Wi‑Fi; păstrați prefixele scurte; evitați filtre complexe multiple

### Accesibilitate & tastatură
- Focalizați căutarea
  - ⌘/Ctrl+K din orice pagină
- Navigare tastatură
  - Tab și săgeți pentru câmpuri și liste; Enter pentru selectare
- Ergonomie mobil
  - Filtre ca modale; ținte mari pentru atingere

### Confidențialitate & Date
- Consimțământ
  - Analitice/erori avansate doar cu opt‑in; optimizările de performanță nu cer tracking
- Surse de date
  - Bazat pe date oficiale de execuție; încărcarea depinde de filtrele alese

### Glosar (scurt)
- Schelet (skeleton)
  - Placeholder UI afișat în timpul încărcării
- Deep‑link
  - URL care redeschide o vedere cu contextul curent
- Normalizare
  - Afișare Per capita vs Total în contexte analitice

### Vezi și
- Căutare globală & navigare: [global-search-and-navigation](./global-search-and-navigation.md)
- Deep‑link & vizualizări partajabile: [deeplinks-and-python-tools](./deeplinks-and-python-tools.md)
- Gestionare erori & Telemetrie: [error-and-telemetry](./error-and-telemetry.md)


