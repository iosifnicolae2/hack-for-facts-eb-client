# Specification: Employee Data Integration and Analysis

## 1. Overview

The primary goal of this feature is to transform a raw CSV dataset about public administration employees into a user-friendly, interactive analysis tool. The feature will make the data easy to understand and explore by presenting it through intuitive visualizations (a map and a table) and by enriching it with calculated, insightful metrics.

This will be achieved by:

- Creating a dedicated, interactive page for data exploration.
- Integrating the relevant data into the existing entity details page.
- Calculating new metrics, such as employees per capita, to provide deeper insights.
- Providing powerful filtering and sorting capabilities based on these new metrics.

**Note:** This is an experimental, informational feature based on a specific dataset published in September 2025. It is not considered a permanent part of the application and should be implemented in a way that reflects its temporary nature.

## 2. Data Loading and Parsing (`useCsvData` hook)

A new reusable hook will be created to handle the data loading, parsing, and enrichment logic.

- **File Path:** `src/hooks/useCsvData.ts`
- **Technology:**
  - **Vite Dynamic Import:** Use `import('.../path/to/file.csv?raw')` to load the CSV file as a raw string at runtime.
  - **Papaparse:** For robust and efficient in-browser CSV parsing.
  - **TanStack Query (`useQuery`):** To handle data fetching, caching, and state management.
- **Functionality:**
  - The hook will accept the path to a CSV file.
  - It will parse the CSV and map the headers to the `EmployeeDataSchema`.
  - **Data Enrichment:** After parsing, it will calculate additional analytical metrics (see Section 4) and append them to each data record.
  - It will return the enriched dataset along with the query state (`isLoading`, `isError`, etc.).

## 3. Data Schema and Validation

To ensure data integrity, a Zod schema will be defined for the raw data, and a separate type will be created for the enriched data.

- **File Path:** `src/schemas/employeeData.ts`
- **Raw Data Schema (`EmployeeDataSchema`):**
  - Defines the structure of the original CSV data (e.g., `sirutaCode`, `uatName`, `uatPopulation`, `occupiedPosts`).
- **Enriched Data Type (`EnrichedEmployeeData`):**
  - This TypeScript type will extend the inferred `EmployeeData` type and include the new calculated metrics.

## 4. Calculated Metrics & Analytics

To make the data more useful, the following metrics will be calculated on the client side.

- **Employees per 1,000 Capita (`employeesPer1000Capita`):**
  - **Formula:** `(occupiedPosts / uatPopulation) * 1000`
  - **Purpose:** To normalize the number of employees against the population, allowing for fairer comparisons between UATs of different sizes.
- **Future Metrics:** The architecture should allow for easily adding other metrics in the future (e.g., cost per employee), should the necessary data become available.

## 5. New Page: Employees Data Analysis

A new page will be created to visualize and analyze the enriched dataset. It will not be added to the main sidebar navigation.

- **Route:** `/experimental/employees-data`
- **File Path:** `src/routes/experimental/employees-data.tsx`
- **Page Component (`EmployeesDataPage`):**
  - Features a tabbed layout to switch between the Map and Table views.
  - Utilizes the `useCsvData` hook to fetch the enriched data.
  - Manages the active view and filters via URL query parameters.
  - Displays an informational modal about the data source on first visit.

### 5.1. Information Modal (`DataSourceInfoModal`)

- **File Path:** `src/components/modals/DataSourceInfoModal.tsx`
- **Content:** Will explain the data source, its informational nature, and potential inaccuracies, with a link to the origin (`gov.ro/aal`).

### 5.2. Map Component (`EmployeesMap`)

- **File Path:** `src/components/maps/EmployeesMap.tsx`
- **Functionality:**
  - **Styling (`getFeatureStyle`):** The map polygons (UATs) will be colored based on the **`employeesPer1000Capita`** metric. A color scale/legend will be displayed to explain the shading.
  - **Tooltips:** On hover, tooltips will display both raw numbers (population, occupied posts) and the calculated `employeesPer1000Capita`.

### 5.3. Data Table Component (`EmployeesDataTable`)

- **File Path:** `src/components/tables/EmployeesDataTable.tsx`
- **Functionality:**
  - Displays the full enriched dataset.
  - **Columns:** Will include columns for both the raw data and the new **`employeesPer1000Capita`** metric.
  - **Features:** Will allow sorting and filtering by all columns, including the calculated metrics, to facilitate detailed analysis.

## 6. Entity Page Integration

The enriched employee data will be integrated into the existing entity detail view.

- **Target File:** Locate the main component for the entity detail page (e.g., `src/routes/entities/$entityId.tsx`).
- **Functionality:**
  - A new tab or view section titled "Employee Data" will be added.
  - It will use the `useCsvData` hook and filter for the relevant entity.
  - It will display the key metrics for that entity, including the calculated **`employeesPer1000Capita`**.

## 7. Dependencies

- `papaparse`
- `@types/papaparse` (dev dependency)

## Context

<context>
https://gov.ro/aal/
Analiză administrația locală

Septembrie 2025

Informațiile prezentate pe această pagină au caracter informativ și reprezintă o imagine a personalului din aparatele proprii ale primăriilor și consiliilor județene din România.

Analiza se bazează pe:

- Datele privind populația de la Institutul Național de Statistică;

- Numărul maxim de posturi calculat conform punctului 1 din anexa la O.U.G nr. 63/2010 pentru fiecare unitate administrativ-teritorială. Datele au fost raportate de prefecturi în prima jumătate a anului 2025, pentru fiecare județ. Acest număr este calculat în funcție de numărul de locuitori pentru fiecare unitate administrativ teritorială și este prima bază de calcul pentru simularea reducerii de personal. S-au făcut două simulări: o reducere cu 10% a posturilor ocupate (40% a numărului maxim de posturi) și o reducere cu 15% a posturilor ocupate (45% a numărului maxim de posturi).

- Numărul de posturi pentru poliția locală și paza obiectivelor de interes județean, calculat conform formulei actuale de 1 post la 1.000 locuitori. Acest număr este a doua bază de calcul pentru simularea reducerii de personal. S-a simulat ipoteza de calcul de 1 post la 1.200 locuitori.

- Alte posturi stabilite conform legislației asupra cărora nu s-au propus modificări (evidența populației, șoferi pentru microbuze școlare, posturi pentru fonduri europene).

Observații:

Numărul maxim de posturi este limita superioară pe care nu o pot depăși posturile cuprinse în organigramele autorităților locale. Organigramele sunt stabilite de către fiecare consiliu local și diferă de la o localitate la alta, reflectând politicile publice locale. În cea mai mare parte a localităților, numărul de posturi din organigrame este mai mic decât cel maxim. Adunând pentru toate localitățile din România numărul maxim de posturi, rezultă un total de aproximativ 190.000 posturi.

Numărul total de posturi înființate din toate organigramele autorităților locale din România este de aproximativ 164.000 posturi. Se observă că este mai mic cu 14% decât numărul maxim de posturi prevăzut în lege. Nu toate posturile dintr-o organigramă sunt ocupate, existând și un număr de posturi vacante.

Din cele ≈164.000 posturi cuprinse în organigrame, conform datelor colectate, posturile ocupate sunt în număr de aproximativ 129.000, diferența de 21% reprezentând posturi vacante. Posturile sunt ocupate în funcție de decizia independentă a autorităților locale, gradul de ocupare fiind diferit de la o localitate la alta.

În concluzie, numărul posturilor neînființate și vacante din totalul posturilor prevăzut prin lege la momentul de față este de ≈61.000, sau 32%. Orice reducere mai mică de 30% nu are decât efecte marginale. O reducere de 25% față de normativul maxim ar însemna, în fapt, desființări de posturi fictive (diferența dintre normativul maxim și organigrame) și de posturi vacante.

Pentru fiecare unitate administrativ-teritorială este o oportunitate să își evalueze schemele de personal, prin comparație cu alte UAT-uri, în așa fel încât să le poată corecta.

Analizarea acestor date permite corectarea unor eventuale erori de raportare. Datele au fost colectate prin Ministerul Afacerilor Interne și Ministerul Dezvoltării, Lucrărilor Publice și Administrației și se bazează pe raportări ale prefecturilor. Având în vedere ușoare diferențe de raportare, s-ar putea înregistra un grad de eroare de aproximativ ±2% la nivelul întregii țări.

---
<https://aiparte.ro/research/administratia_locala.htm>

Sursa Datelor și Întrebări Frecvente

Sursa Datelor și Metodologie

Informațiile prezentate pe această pagină au caracter informativ și reprezintă o imagine a personalului din aparatele proprii ale primăriilor și consiliilor județene din România, la nivelul lunii Septembrie 2025. Sursa datelor oficiale este Guvernul României.

Analiza se bazează pe:

Datele privind populația de la Institutul Național de Statistică.

Numărul maxim de posturi calculat conform O.U.G nr. 63/2010. Datele au fost raportate de prefecturi în prima jumătate a anului 2025. Limita legală afișată în dashboard reprezintă o simulare a reducerii cu 15% a posturilor ocupate (45% a numărului maxim de posturi).

Numărul de posturi pentru poliția locală, șoferi și personalul pe fonduri europene, conform legislației în vigoare.

Observație importantă: Datele au fost colectate prin Ministerul Afacerilor Interne și Ministerul Dezvoltării, bazându-se pe raportări ale prefecturilor. Se poate înregistra un grad de eroare de aproximativ ±2% la nivelul întregii țări.

Diferența dintre "Surplus Total" și "Personal de Redus"

Acești doi indicatori oferă perspective diferite asupra situației personalului:

Personal de Redus: Reprezintă suma strictă a posturilor care depășesc limita legală. Se uită la fiecare UAT/CJ în parte și adună doar surplusurile (valorile pozitive). Această cifră arată efortul total de reducere necesar în județ, ignorând entitățile care sunt sub normă.

Surplus Total: Reprezintă balanța netă a județului. Este suma algebrică a tuturor surplusurilor (valori pozitive) și a tuturor deficitelor (valori negative). O valoare pozitivă aici arată că, per total, județul este peste limita agregată, dar nu reflectă numărul real de posturi ce trebuie eliminate.

Exemplu: Dacă într-un județ Primăria A are un surplus de 10 posturi, iar Primăria B are un deficit de 4 posturi, "Personalul de redus" va fi 10, în timp ce "Surplusul total" va fi 6 (10 - 4).

Întrebări și Răspunsuri

1. De unde provin datele?

Datele provin de pe platforma oficială a Guvernului României, gov.ro/aal, și sunt agregate de la prefecturi, pe baza raportărilor primăriilor și consiliilor județene.

2. Cât de actuale sunt datele?

Analiza reflectă situația din prima jumătate a anului 2025, fiind centralizată în Septembrie 2025.

3. Ce înseamnă 'Numărul maxim de posturi' menționat în textul oficial?

Este limita superioară legală, calculată în funcție de populație, pe care organigrama unei autorități locale nu o poate depăși. Nu este același lucru cu numărul de posturi existente (din organigramă) sau cu cele ocupate.

4. Toate primăriile au atins acest număr maxim?

Nu. Conform analizei oficiale, numărul total de posturi din organigramele din România (≈164.000) este cu 14% mai mic decât numărul maxim total permis de lege (≈190.000).

5. Care este diferența dintre posturile din organigramă și cele ocupate?

Diferența o reprezintă posturile vacante. La nivel național, din cele ≈164.000 de posturi existente în organigrame, doar ≈129.000 sunt ocupate, rezultând o rată de vacanță de 21%.

6. Ce reprezintă indicatorul 'Surplus/Deficit' din tabelul detaliat?

Este diferența numerică dintre numărul de posturi efectiv ocupate și limita legală calculată (simulare de reducere cu 45%). O valoare pozitivă (roșie) înseamnă excedent, iar o valoare negativă (verde) înseamnă că entitatea se încadrează în limită.

7. Ce entități sunt incluse în analiză?

Analiza include toate UAT-urile (comune, orașe, municipii), Sectoarele Municipiului București, Consiliile Județene și Primăria Generală a Municipiului București.

8. De ce o reducere mică a normativului maxim nu ar avea efect real?

Deoarece există o "plasă de siguranță" de 32% (≈61.000 de posturi) formată din posturile neînființate (diferența dintre maximul legal și organigrame) și cele vacante. O reducere sub acest prag ar desființa, în principal, posturi care oricum nu sunt ocupate.

9. Sunt datele 100% exacte?

Datele se bazează pe raportări multiple și, conform notei oficiale, s-ar putea înregistra un grad de eroare de aproximativ ±2% la nivelul întregii țări din cauza unor posibile diferențe de raportare.

10. Cum este calculat 'Raport Excedent Personal' de pe hartă?

Acesta arată ce procent din posturile ocupate ar trebui redus pentru a atinge limita legală propusă (scădere cu 45% din total posturi conform anexa la O.U.G nr. 63/2010). Se calculează doar pentru entitățile cu surplus, ca (Surplus / Posturi Ocupate) * 100.

</context>

## Calculations

```
Nr. max. posturi cf. pct. 1 din anexa la O.U.G nr. 63/2010 (G)
Reducere cu 40% nr. max posturi (H) = G * 0.6
Reducere cu 45% nr. max posturi (I) = G * 0.55

Posturi pt. evidența populației (J)
Posturi pt. poliţia locală (K)
Posturi pt. poliţia locală 1 post poliție la 1200 locuitori (L)
Posturi pt. implementare proiecte europene (M)
Posturi pt. șoferi microbuze şcolare (N)
Posturi pt. postimplementare proiecte europene (O)

Total Actual (P) = G + J + K + M + N + O
TOTAL CU REDUCERE 40% (Q) = H + J + L + M + N + O
TOTAL CU REDUCERE 45% (R) = I + J + L + M + N + O
POSTURI OCUPATE (S)
Diferență reducere 40% vs. posturi ocupate (T) = Q - S
Diferență reducere 45% vs. posturi ocupate (U) = R - S
```
