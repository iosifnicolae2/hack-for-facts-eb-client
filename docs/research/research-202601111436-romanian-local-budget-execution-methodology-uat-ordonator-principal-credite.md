# Romanian Local Budget Execution Methodology - UAT as Ordonator Principal de Credite

<!--
@web-flow begin
kind: prompt
id: prompt-20260111125212490
timestamp: "2026-01-11T12:52:12.490Z"
tags: [research, technical, romanian-law, budget]
schema: web-flow/research/v1
version: 1
-->
Please conduct deep research on: Romanian Local Budget Execution ("Executie Bugetara Locala") Methodology for UAT (Unitate Administrativ-Teritoriala) as "Ordonator Principal de Credite"

## Context

We operate a transparency platform (transparenta.eu) that displays public budget execution data for Romanian local administrative units. We received feedback that our calculated totals differ from official ANAF PDF reports. We need to verify the correct methodology for what should be included vs excluded when presenting budget execution data.

Specific discrepancy example (Corbeanca commune):

- **Revenue**: Platform shows 62,096,419.65 RON vs ANAF PDF 65,471,919.11 RON (difference ~3.4M RON)
- **Expenses**: Platform shows 61,411,855.4 RON vs ANAF PDF 63,604,355.40 RON (difference exactly 2,192,500 RON)

The expense difference matches exactly "Finanțarea învățământului particular sau confesional acreditat" (economic code 55.01.63).

## Specific Questions

### 1. REVENUES (Venituri) - What codes to EXCLUDE?

- Should these functional codes be excluded from total revenue to avoid double-counting?
  - fn:04.* (Cote și sume defalcate din impozitul pe venit)
  - fn:11.* (Sume defalcate din TVA)
  - fn:36.05 (Vărsăminte din secțiunea de funcționare)
  - fn:36.50.00 (Alte venituri) - is this double-counting?
  - fn:40.*and fn:41.* (Operațiuni financiare)
  - fn:42.* (Subvenții)
  - fn:43.* (Subvenții de la alte administrații)
  - fn:47.* (Sume în curs de distribuire)
- Any TVA-related codes (like "Sume aferente TVA") that should be excluded?
- What is the correct treatment for "se scad" items in the classification?

### 2. EXPENSES (Cheltuieli) - What codes to EXCLUDE?

- Should these economic codes be excluded from total expenses?
  - ec:51 (Transferuri între unități ale administrației publice)
  - ec:55.01 (Alte transferuri) - includes 55.01.63 "Finanțarea învățământului particular"
- What is the proper consolidation treatment for:
  - Transfers to subordinate institutions
  - Financing for private/confessional education (55.01.63)
  - Internal budget movements

### 3. Romanian Legislation & Standards

- What does Legea 500/2002 (Legea finanțelor publice) say about consolidation?
- OMFP 1917/2005 (norme metodologice) - relevant provisions
- Current classification standards from Ministerul Finanțelor
- How does ANAF present data in official execution PDFs - what methodology do they use?

### 4. Consolidation Principles

- When presenting budget execution for a single UAT as ordonator principal:
  - Should we show GROSS totals (all items) matching ANAF PDFs?
  - Or should we show CONSOLIDATED totals (excluding inter-budget transfers)?
- What is the standard practice for transparency platforms?
- Which items are "real" revenue/expenses vs accounting entries?

## Constraints

- Focus on Romanian public finance legislation and Ministerul Finanțelor guidelines
- Look for official sources: ANAF, Ministerul Finanțelor, Curtea de Conturi
- Need specific code references (economic and functional classification codes)
- Must be applicable to UAT level (commune, city, county) as ordonator principal de credite

## Expected Output

- Clear list of codes to INCLUDE vs EXCLUDE for revenues
- Clear list of codes to INCLUDE vs EXCLUDE for expenses
- Legal basis for each exclusion/inclusion decision
- Recommendation on whether to show gross vs consolidated totals
- Specific references to Romanian legislation and official methodology
<!-- @web-flow end id=prompt-20260111125212490 -->

<!--
@web-flow begin
kind: response
status: pending
provider: claude
url: "https://claude.ai/chat/f1e9c5dd-47e1-4e6f-8a72-1a6ecd4c60ae"
id: response-20260111125221166-claude
prompt_id: prompt-20260111125212490
timestamp: "2026-01-11T12:52:21.166Z"
schema: web-flow/research/v1
version: 1
-->
# Romanian local budget execution methodology: what UAT transparency platforms should include

**Your platform should show GROSS totals to match ANAF PDFs.** The key finding is that the code 55.01.63 exclusion is incorrect—transfers to private/confessional schools represent real expenses leaving the public sector, not internal consolidation items. ANAF reports use gross (non-consolidated) figures, and transparency platforms should match this methodology for comparability with official documents.

The **2,192,500 RON expense discrepancy** directly corresponds to incorrectly excluding economic code 55.01.63. The **~3.4M RON revenue discrepancy** likely stems from incorrect exclusion of certain transfers received that should count as real revenue.

## Legal framework establishes gross reporting as standard

Romanian public finance law provides clear guidance on budget consolidation. **Legea 273/2006 Art. 2, pct. 15** defines consolidation as *"operațiunea de eliminare a transferurilor de sume dintre bugetele prevăzute la art. 1 alin. (2), în vederea evitării dublei evidențieri a acestora"*—the elimination of transfers between budgets within the same administrative hierarchy to avoid double-counting.

Critically, **Legea 273/2006 Art. 7** establishes the *universality principle*, requiring that *"veniturile și cheltuielile se includ în buget în totalitate, în sume brute"* (revenues and expenses are included in full, in gross amounts). This principle means ANAF's FOREXEBUG system generates reports showing gross execution at the "ordonator principal de credite" level.

**Legea 500/2002 Art. 3 alin. (1)** clarifies that consolidation applies when calculating *total national* budget execution to show the "dimension of public financial effort"—not when presenting individual UAT budget execution. The key distinction: consolidation eliminates **inter-budget transfers within the public sector**, not transfers to external entities.

## Revenue codes: what to include and exclude

Based on the regulatory framework and classification standards from **OMFP 1954/2005**, here is the definitive treatment for revenue codes:

**INCLUDE in total revenues (real external receipts):**

| Code | Description | Rationale |
|------|-------------|-----------|
| fn:04.02.* | Cote și sume defalcate din impozitul pe venit | External transfer from state budget |
| fn:11.02.* | Sume defalcate din TVA (all subcodes including 11.02.09) | External transfer from state budget |
| fn:36.02.50 | Alte venituri | Real miscellaneous revenue, not double-counting |
| fn:40.02.* | Operațiuni financiare - Încasări din rambursarea împrumuturilor | Financial operations |
| fn:41.02.* | Alte operațiuni financiare | Financial operations |
| fn:42.02.* | Subvenții de la bugetul de stat | Real transfers from state budget |
| fn:43.02.* | Subvenții de la alte administrații | Real transfers from other public administrations |

**EXCLUDE or handle specially:**

| Code | Description | Treatment |
|------|-------------|-----------|
| fn:37.02.03 | Vărsăminte din secțiunea de funcționare pentru finanțarea secțiunii de dezvoltare | **Show as NEGATIVE value**—internal transfer between operating and development sections |
| fn:47.02.* | Sume în curs de distribuire | **EXCLUDE**—temporary amounts awaiting distribution, marked "X" in official forms |

The "se scad" items in Romanian budget classification indicate amounts to subtract. These appear with negative signs in official reports and should be treated as subtractions, not excluded entirely.

## Expense codes: the 55.01.63 question resolved

The treatment of expense codes depends critically on whether the recipient is **within or outside** the UAT's budgetary hierarchy.

**Code 55.01.63 should be INCLUDED as a real expense.** This represents "Finanțarea învățământului particular sau confesional acreditat"—financing of accredited private or confessional education. The recipient institutions (private schools) are **external entities**, not subordinate public institutions within the UAT structure. Per **Legea 421/2023** and **Legea 9/2025**, these funds flow: State budget → TVA splits (code 11.02.09) → Local budget → Private schools (terminal recipient). The money **leaves the public sector entirely**.

**Include in totals (real expenses):**

| Code | Description | Rationale |
|------|-------------|-----------|
| ec:55.01.63 | Finanțarea învățământului particular sau confesional | Terminal transfer to external private entity |
| All standard operating/capital expenses | Various | Core budget execution items |

**Exclude only in consolidated views (internal public sector transfers):**

| Code | Description | When to exclude |
|------|-------------|-----------------|
| ec:51.01 | Transferuri curente către instituții publice subordonate | Only when consolidating with subordinate institution budgets |
| ec:51.02 | Transferuri de capital către instituții subordonate | Only when consolidating with subordinate institution budgets |

The distinction is crucial: transfers to **subordinate public institutions** (like municipal schools, cultural centers) are internal movements that would be eliminated in a consolidated view. Transfers to **external entities** (like private schools under 55.01.63) represent real public expenditure regardless of consolidation level.

## ANAF methodology uses gross figures

ANAF's budget execution PDF reports generated through the **FOREXEBUG national reporting system** show **gross (non-consolidated) totals**. The system collects data from over 14,000 public entities and generates reports at COFOG3 detail level.

Standard ANAF report types include:

- **FXB-EXB-900**: Budget execution at individual entity level
- **FXB-EXB-901**: Aggregated at Principal Credit Ordinator (OPC) level

When ANAF sums revenues or expenses for a UAT, transfers between budget entities within that UAT are **not automatically eliminated**. This means if a commune transfers 100,000 lei to a subordinate school, the gross total shows both the expense (from commune) and the revenue (at school)—consolidated would show only 100,000 lei.

The Court of Accounts (Curtea de Conturi) audit report on FOREXEBUG confirms this methodology: *"Forexebug does not automatically perform consolidation at local level."* Consolidation is performed separately when preparing consolidated financial statements, not in standard budget execution reports.

## Resolving the Corbeanca discrepancies

**Expense discrepancy (2,192,500 RON):** Your platform incorrectly excludes code 55.01.63. This exact match confirms the issue. **Solution: Include code 55.01.63 in expense totals**—it represents real payments to private/confessional schools, not internal transfers.

**Revenue discrepancy (~3.4M RON):** Likely caused by one or more of:

- Incorrect exclusion of "sume defalcate" that should count as real revenue
- Incorrect treatment of section transfers (37.02.03/37.02.04)
- Timing differences in recognition of transfers received
- Possible exclusion of subsidies (42.02.*or 43.02.*) that should be included

To diagnose the revenue discrepancy precisely, compare your platform's revenue breakdown code-by-code against the ANAF PDF to identify which specific codes are being excluded.

## Recommendation: match ANAF for transparency

For a transparency platform, **matching ANAF's gross methodology is strongly recommended** for several reasons:

- **Legal compliance**: Legea 273/2006 Art. 7 requires gross amounts
- **Audit consistency**: Curtea de Conturi audits against official execution reports
- **User expectations**: Citizens comparing platform data with official PDFs expect matching totals
- **Comparability**: Other official platforms (transparenta-bugetara.gov.ro, data.gov.ro) use gross figures

If you wish to also present consolidated views for analytical purposes, offer them as a secondary option with clear labeling: "Date consolidate" with an explanation of which transfers were eliminated and a link to gross totals.

## Conclusion

The core finding is that your platform's methodology incorrectly treats code 55.01.63 as an internal consolidation item when it represents real external expenditure. **Include 55.01.63 in expense totals.** For revenues, include all "sume defalcate" (04.02.*, 11.02.*), subventions (42.02.*, 43.02.*), and other external transfers. Only exclude fn:47.02.* (temporary distribution amounts) and show fn:37.02.03 as a negative value for section transfers.

The legal basis for gross reporting is **Legea 273/2006 Art. 7** (universality principle) and **OMFP 1954/2005** (classification standards). Matching ANAF's FOREXEBUG methodology ensures your platform provides comparable, verifiable data that citizens can cross-reference with official documents.

---

Based on our previous research, here is the clear table of codes to **EXCLUDE** when displaying consolidated local budget totals (OPC + all subordinate entities aggregated):

---

## REVENUES - Codes to EXCLUDE from Consolidated Total

| Code | Description (RO) | Reason for Exclusion |
|------|------------------|----------------------|
| **43.10.09** | Subvenții pentru instituții publice | Mirror of ec:51.01 transfers from OPC - creates double-counting |
| **43.10.19** | Subvenții pentru instituții publice destinate secțiunii de dezvoltare | Mirror of ec:51.02 capital transfers from OPC |
| **47.02.*** | Sume în curs de distribuire | Temporary amounts awaiting distribution - not real revenue |

---

## EXPENSES - Codes to EXCLUDE from Consolidated Total

| Code | Description (RO) | Reason for Exclusion |
|------|------------------|----------------------|
| **51.01.*** | Transferuri curente între unități ale administrației publice | Internal transfer to subordinates - appears as revenue 43.10.09 at recipient |
| **51.02.*** | Transferuri de capital către instituții publice | Internal capital transfer - appears as revenue 43.10.19 at recipient |

---

## Important: Codes to KEEP (Do NOT Exclude)

| Code | Description (RO) | Why KEEP |
|------|------------------|----------|
| **55.01.63** | Finanțarea învățământului particular sau confesional acreditat | Recipient is EXTERNAL (private schools) - not in consolidated perimeter |
| **37.02.03** | Vărsăminte din secțiunea de funcționare pentru finanțarea secțiunii de dezvoltare | Internal section transfer - include as negative, nets to zero with 37.02.04 |
| **37.02.04** | Vărsăminte din secțiunea de funcționare | Include as positive - nets to zero with 37.02.03 |

---

## Legal Basis

**Legea 273/2006, Art. 2, pct. 15**: *"consolidare - operațiunea de eliminare a transferurilor de sume dintre bugetele prevăzute la art. 1 alin. (2), în vederea evitării dublei evidențieri a acestora"*

<!-- @web-flow end id=response-20260111125221166-claude -->

<!--
@web-flow begin
kind: response
status: pending
provider: chatgpt
url: "https://chatgpt.com/c/69639a41-5984-832a-b905-1f18564b5945"
id: response-20260111125221311-chatgpt
prompt_id: prompt-20260111125212490
timestamp: "2026-01-11T12:52:21.311Z"
schema: web-flow/research/v1
version: 1
-->
## Revenues: Codes to Exclude or Include (Avoiding Double Count)

When reporting a **UAT’s budget execution**, certain revenue categories should be omitted from the total to prevent **double-counting** of funds that are merely transfers. Romanian public finance law defines “consolidation” as eliminating inter-budget transfers to avoid counting the same money twice[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul)[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/184744#:~:text=organizatorica%20din%20cadrul%20institu%C5%A3iei%20publice,credit%20de%20angajament). In practice, the following revenue items are treated as *pass-through* or internal entries and **excluded from net revenue totals** (marked as “se scad” in reports), even though they appear in the detailed classification:

- **Sume defalcate din TVA (functional code 11.\*)** – These are VAT amounts allocated from the state budget to local budgets (for decentralised expenditures or equalization). They are *not* actual own-source revenues of the UAT but transfers from the central government. Official execution reports list these with a "(se scad)" notation and subtract them from the total[\[3\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,defalcate%20din%20taxa%20pe%20valoarea). Including them in both state and local budgets would double count the same funds, so they must be excluded in a consolidated view[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul). (They are included in gross revenue, but deducted to calculate “venituri proprii”[\[4\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=TOTAL%20VENITURI%20%28cod00.02%2B00.15%2B00.16%2B00.17%2B45.02%2B48.02%29%2000.01%20,326756330%20165069110%20250574331).)

- **Cote defalcate din impozitul pe venit (functional code 04.\*)** – These are the UAT’s share of income tax collected nationally[\[5\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Impozit%20pe%20venit%20%2803,pe%20venit%20pentru%20echilibrarea%20bugetelor). Legally, this allocation is considered part of the local budget’s revenues[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/184744#:~:text=organizatorica%20din%20cadrul%20institu%C5%A3iei%20publice,credit%20de%20angajament). In a single UAT report, **they are included in total revenues** (since this money becomes available to the local budget)[\[5\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Impozit%20pe%20venit%20%2803,pe%20venit%20pentru%20echilibrarea%20bugetelor). However, from a consolidated perspective (state \+ local), they represent transfers from the state budget, so they would be eliminated to avoid double counting[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul). In other words, you **should include** income tax shares in the UAT’s own execution total (to match ANAF’s local report), but be aware that they are not “own collected” revenues. Many transparency reports show them as a separate line item rather than mixing with truly local taxes.

- **“Vărsăminte din secțiunea de funcționare” (internal transfers between sections)** – These appear under codes like **36.05 or 37.02** and represent funds moved from the operating section to the development section of the budget (or vice versa). Such internal budget transfers are **purely accounting entries** that inflate both revenues and expenditures if counted. The methodology is to subtract them out: e.g. in execution statements one section shows a negative value and the other a positive for the same amount, canceling out in the consolidated total[\[6\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02%20,de%20dezvoltare%20a%20bugetelui%20local). **Exclude** these transfers from the net totals, as they do not constitute new income to the UAT (they are just reallocations of existing funds).

- **“Sume în curs de distribuire” (code 47.\*)** – These are amounts in transit, collected by the UAT on behalf of other entities or to be redistributed. For example, certain shared taxes or fees might be temporarily recorded in the local budget then passed on. They are marked “se scad” in the classification, indicating they **must be deducted** from revenue totals[\[3\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,defalcate%20din%20taxa%20pe%20valoarea). These funds don’t ultimately belong to the UAT, so they should not count toward its revenue total.

- **Operațiuni financiare (codes 40\. *and 41\.*)** – This category includes **financial operations** like proceeds from loans, bond issuances, or recoveries of loaned amounts. While these bring in cash, they are financing instruments rather than earned revenues. In execution reports they are usually shown in a separate section (e.g. Section III – *Operațiuni financiare*)[\[7\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02.03%20,Incasari%20din%20rambursarea%20imprumuturilor%20acordate). If the aim is to present the *operational budget execution*, you may exclude or separately disclose these. (They do not cause double counting across budgets – a loan is not another budget’s expenditure – but including large borrowings can distort comparisons of revenue performance. Official local budget forms include them in “Total venituri” for completeness[\[8\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=TOTAL%20VENITURI%20%28cod%2000,3%2C201%2C351%204%2C937%2C077%204%2C005%2C402%201%2C988%204%2C131%2C038), but often highlight the core revenues separately.)

- **Subsidies from other public administrations (functional codes 42\. *and 43\.*)** – These are **transfers received** from the state budget or other administrations (e.g. subsidies for schools, health, or from the county council). They are real inflows of resources to the local budget and **are included in the UAT’s total revenues** in official reports[\[9\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=IV,02%20973%2C250%202%2C726%2C680%201%2C493%2C312)[\[10\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Subventii%20de%20la%20bugetul%20de,40%2C000%2040%2C000%2075%2C000%2075%2C000%2075%2C000). However, they do represent inter-budget transfers (recorded as expenditures in the sender’s budget). In the *general consolidated budget* of Romania, such transfers are eliminated to avoid double counting. For a single UAT’s execution, **do not exclude subsidies** – they should appear in revenues – but it’s good practice to present them separately from the UAT’s own-source revenues. (For example, the execution form lists “Subvenții de la alte administrații” under its own heading[\[9\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=IV,02%20973%2C250%202%2C726%2C680%201%2C493%2C312).)

In summary, **include all external funds** that genuinely add to the UAT’s budget (taxes, shares from state revenue[\[5\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Impozit%20pe%20venit%20%2803,pe%20venit%20pentru%20echilibrarea%20bugetelor), subsidies[\[9\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=IV,02%20973%2C250%202%2C726%2C680%201%2C493%2C312), grants, etc.), but **exclude internal transfers** or transitory items that would inflate totals without representing new money. The official *Contul de execuție al bugetului local – Venituri* follows this approach: it shows *gross revenue* by source, then calculates *net local revenue (“venituri proprii”)* by subtracting code 11 (VAT transfers) and internal moves[\[4\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=TOTAL%20VENITURI%20%28cod00.02%2B00.15%2B00.16%2B00.17%2B45.02%2B48.02%29%2000.01%20,326756330%20165069110%20250574331). This ensures no double counting of amounts transferred between sections or budgets.

## Expenses: Codes to Exclude or Adjust in Totals

For expenditures (cheltuieli), the focus is on **eliminating internal transfers** so that only actual spending on final purposes is counted in the consolidated total. When a UAT is an *ordonator principal* with subordinate institutions (schools, services, etc.), money often flows from the main budget to those sub-units and then is spent on goods, salaries, etc. The **methodology is to exclude such inter-entity transfers** to avoid double-counting the same funds as both a transfer and a spend. Key cases:

- **Transferuri între unități ale administrației publice (economic code 51\)** – These are current transfers to other public institutions. In a commune or city budget, this typically means funds transferred **to subordinate public entities** (for example, the city transferring funds to a local school or museum that has its own budget). It could also include transfers to another government (e.g. co-financing sent to the county or an inter-community development association). In the main budget’s accounting, these appear as expenditures (economic chapter 51.01). However, if we consolidate the UAT’s finances, that same money will appear as revenue and spending in the subordinate institution’s execution. **Therefore, code 51 transfers should be excluded from the consolidated total** – they are internal to the public sector[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul). In practice, when preparing the UAT’s execution account, the amounts under 51 are not included in the final “Total Cheltuieli” of the consolidated budget. (The subordinate institution’s actual expenses, such as salaries or goods, get reflected in the relevant economic categories of the consolidated report instead of counting the transfer.)

- **Alte transferuri (economic code 55.01)** – This category covers “other transfers,” which can include various specific transfer programs. Whether to exclude these from total expenditures depends on the *nature of the transfer*: if the recipient is **within the public sector**, it should be consolidated out; if the recipient is outside the public sector, it remains a final expenditure. For example:

- **Finanțarea învățământului particular sau confesional acreditat (code 55.01.63)** – This is a transfer of funds to private or religious schools. Because these schools are **not part of the public budget system**, funding them is a *final expense* from the UAT’s perspective. Such transfers **should be included in the total spending** (they leave the public budget permanently). Indeed, official reports count these expenses in full – e.g. an execution report for Buzău shows the allocation for *învățământ particular* as part of expenditures[\[11\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=,Sume%20reprezentand). In the Corbeanca example, the ANAF report’s higher expenditure total was due to **including** this item, whereas the platform had omitted it, leading to a RON 2,192,500 shortfall (exactly the value of 55.01.63, meaning it should not have been excluded).

- **Transfers to public institutions or other local budgets** under code 55.01 (for instance, some subcodes might fund local public entities or projects co-funded with other authorities). These are effectively similar to code 51 transfers. If, say, 55.01.xx represents funds given to a subordinate public entity or another UAT’s budget, then **exclude those in consolidation**. They will appear as expenditures in the main budget but also as revenues/expenditures in the other public entity. They are **internal transfers** from the viewpoint of the general government and must be netted out[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul). (The execution report often groups such items as “Transferuri interne” under Titlul 55 and ensures they don’t inflate the consolidated total[\[12\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=Transferuri%20catre%20institu%3Fii%20publice%2051,344500%20344500%20286373%2058127%20286373).)

- **Financing between budget sections or internal funds** – Similar to the revenue side, any item that is basically an internal movement of funds should not count in total outlays. The classic example is the **operating-to-development section transfer** (usually reflected in an expenditure code mirroring the revenue side “vărsăminte”). In newer classifications this appears as a negative expenditure under code 37.02 in the operating section and a positive revenue in development, canceling out[\[6\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02%20,de%20dezvoltare%20a%20bugetelui%20local). The net effect on total spending is zero, and the *contul de execuție* form reflects that (the combined total excludes that internal transfer). So, **do not include internal section transfers** in the overall expense tally.

- **Debt repayments and financial operations** – If the local budget execution includes categories for loan principal repayments (these might fall under **Titlul 80 Operațiuni financiare** in expenditures), they are often listed separately from functional spending. While not “double counted” per se, they are not part of operating or capital expenditures on services. Many transparency platforms report them separately. The ANAF execution PDF typically shows debt service in its own section. For clarity, you may want to exclude or distinguish **loan repayments or other financial transfers** in presenting core expenditure totals (they don’t reflect spending on programs, but on financing). This is more about presentation than consolidation, since paying back a loan doesn’t appear as another budget’s revenue.

**Consolidation treatment summary:** To properly consolidate a UAT’s budget, **eliminate intra-budget transfers** such as: \- Funds the city hall sends to its subordinate units (or to other government entities) – these are counted under transfer codes (51, some 55.01 subcodes) and should drop out when combining budgets[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul). \- Internal reallocations between sections or funds (vărsăminte) – ensure they cancel out and do not add to totals[\[6\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02%20,de%20dezvoltare%20a%20bugetelui%20local). Conversely, **do count all final expenditures** that actually go out to provide services or payments in the community, even if classified as transfers. A transfer to a **private school, NGO, or individual** is a final use of funds and remains in the total. The key is whether the receiving entity’s spending is also being reported within the same consolidated perimeter. If yes, drop the transfer; if not, include it. The **RON 2.19 million** for private education in Corbeanca falls in the latter category and thus belongs in the expense total (as the official methodology confirms)[\[11\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=,Sume%20reprezentand).

## Legal and Methodological Framework

**Legea nr. 500/2002 (Finanțe Publice)** and **Legea nr. 273/2006 (Finanțe Publice Locale)** provide the overarching rules for budget execution and reporting. They explicitly define the *general consolidated budget* and the principle of consolidation: *“operațiunea de eliminare a transferurilor de sume dintre bugete… în vederea evitării dublei evidențieri”*[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul)[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/184744#:~:text=organizatorica%20din%20cadrul%20institu%C5%A3iei%20publice,credit%20de%20angajament). In other words, whenever budgets are aggregated, any transfers **from one public budget to another must be removed** to reflect only final revenues and expenditures. This legal principle is the basis for excluding the codes discussed above. For example, amounts allocated from the state to local budgets (income tax shares, TVA sums) and amounts transferred between local institutions are not counted twice in the consolidated figures of the government.

The **Ministry of Finance’s methodological norms** (OMFP 1917/2005, plus subsequent updates) detail how public institutions keep accounts and report execution. Local budget execution is reported via standardized forms: \- **“Contul de execuție a bugetului local – Venituri” (Anexa 12\)** – which lists all revenue categories (by chapter and subchapter codes) for the UAT[\[13\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=finan%C5%A3ate%20din%20venituri%20proprii%20%C5%9Fi,execu%C5%A3ie%20a%20bugetului%20fondurilor%20externe). \- **“Contul de execuție a bugetului local – Cheltuieli” (Anexa 13\)** – which lists all expenditures (by economic classification) for the UAT.

Notably, these forms are prepared **at the level of the entire UAT (ordonator principal consolidat with subordonates)**[\[14\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=8,ai%20bugetelor%20locale%2C%20cu%20informa%C5%A3ii)[\[15\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=match%20at%20L881%209,teritoriale%20%28comune%2C%20ora%C5%9Fe). The methodology ensures that internal transfers are either excluded or presented in a way that nets to zero: \- In the **revenues form**, the UAT’s income includes its own-source collections *plus* any sums from other budgets. However, the form usually highlights “Venituri proprii” as a subset which **excludes** the state transfers. For example, in one city’s execution report, **Total Revenues** were 35.64 million, of which “venituri proprii” (after removing \~11.79 million of VAT transfers and some internal moves) were 22.28 million[\[16\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=A%20B%201%202%203,27%2C536%2C303%205%2C111%2C314%2022%2C424%2C989%2023%2C606%2C337%203%2C929%2C966). The total still included the state-sourced funds, as those were part of resources, but when analyzing local fiscal effort, the state transfers are subtracted[\[4\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=TOTAL%20VENITURI%20%28cod00.02%2B00.15%2B00.16%2B00.17%2B45.02%2B48.02%29%2000.01%20,326756330%20165069110%20250574331). \- In the **expenditures form**, the consolidated report shows what the UAT spent by economic nature, combining the city hall and subordinate institutions. Any transfer to a subordinate is not counted as a final expense on that form – only the subordinate’s actual spending of that money (e.g. on goods, services, personnel) is reflected. The norms instruct that the ordonator principal will consolidate subordinate execution data and **“eliminate operațiunile de transfer”** in the process. In practice, you may see negative entries for internal transfers. For instance, a **transfer from the operating section to development** is recorded as a negative at code 37.02 in the operating section and a positive in development, canceling out[\[6\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02%20,de%20dezvoltare%20a%20bugetelui%20local). Likewise, a transfer to a subordinate unit is recorded in the city’s books (code 51 or 55\) and as revenue in the subunit (code 43); when consolidated, those two entries are offset (the detailed annex might show them under “Transferuri interne” with no net impact on total)[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul). The **Public Finance Law and local finance law both mandate this consolidation step**, so the official methodology is aligned with those laws.

The **budget classification standards** (approved by the Ministry of Finance) define the codes and their meanings. The functional classification (two-digit and chapter codes like 04, 11, 42, 43 etc.) and the economic classification (two-digit titles like 51, 55, with detailed subcodes) are used in all reports. For example, **code 42** denotes subsidies from the state, **43** subsidies from other administrations, **04** denotes the share of income tax, **11** denotes VAT transfers, **47** denotes distributed sums, **51** and **55** cover various transfers, etc. The treatment we’ve described (include or exclude) comes directly from the nature of these codes as explained in official guidelines. The **Court of Accounts** also emphasizes in its analyses that only consolidated figures (with inter-budget transfers removed) truly reflect the public spending in a locality[\[17\]](https://www.senat.ro/legis/PDF/2006/06L204FG.pdf?nocache=true#:~:text=,teritoriala%20%2C%20de)[\[18\]](https://primariaocnasibiului.ro/download/7/#:~:text=%5BPDF%5D%20Lege%20273%20,reflecta%20dimensiunea%20efortului%20financiar%20public).

**ANAF’s official execution PDFs** for local governments essentially follow the format of Anexa 12/13 mentioned above. Thus, their methodology is: \- They present **gross revenue totals including all funding sources**, and **gross expenditure totals including all uses of funds**, for the entire UAT. \- Internal transfers are either shown with a “se scad” note or in such a way that they don’t contribute to the final total. For instance, the ANAF report will list the shares from VAT under revenue but mark them to be subtracted[\[3\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,defalcate%20din%20taxa%20pe%20valoarea). It will list transfers to subunits under expenditures, but the overall “Total Cheltuieli” in that report will not count those transfers as a double expense. Instead, the subunit’s spending appears under its respective categories.

In summary, Romanian legislation and standards require **consolidated reporting** at the UAT level, meaning **inter-budget transfers are excluded** from aggregate totals. Legea 500/2002 and Legea 273/2006 provide the legal basis[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul)[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/184744#:~:text=organizatorica%20din%20cadrul%20institu%C5%A3iei%20publice,credit%20de%20angajament), and OMFP 1917/2005 (with later amendments) provides the technical instructions for implementing this in financial statements. The official ANAF reports can be trusted as a model: if your platform’s totals differ, it likely means some transfer was mishandled (included or excluded wrongly). Aligning with the official methodology will ensure your figures match those in the PDFs.

## Gross vs. Consolidated Totals: Recommendations for Transparency

When presenting budget execution for a single local government (UAT) as **ordonator principal**, the standard practice is to show the **consolidated picture for that UAT** – in other words, **gross of external inflows, net of internal transfers**. This gives readers the full scope of resources used in the community without double counts. Key recommendations:

- **Include all external revenue sources and all final expenditures (Gross totals):** The total revenues should encompass the UAT’s own collections *plus* funds received from the state or other entities, since these increase the resources at the locality’s disposal[\[5\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Impozit%20pe%20venit%20%2803,pe%20venit%20pentru%20echilibrarea%20bugetelor)[\[9\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=IV,02%20973%2C250%202%2C726%2C680%201%2C493%2C312). Similarly, total expenditures should reflect everything the UAT spent or distributed for its policies, including grants and transfers to non-public recipients[\[11\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=,Sume%20reprezentand). This gross approach ensures your platform’s “Total Revenue” and “Total Expenditure” lines match the official execution report (as the user expects). For example, if the commune received 3.4 million RON from the VAT fund, that should appear in revenues, and if it spent 2.19 million RON on financing a private school, that should appear in expenditures – these are genuine budgetary flows.

- **Eliminate or separate internal transfers (Consolidated netting):** To avoid inflated figures, do not sum transfers that occur **within the local public sector**. The prime example is a city hall transferring funds to a subordinated school: that amount would otherwise count twice (once as city expenditure, once as school expenditure). Instead, exclude it from the total, counting only the school’s actual spending on education. The same goes for the operating-to-development section transfer – it should not increase the overall total. Essentially, **consolidation at the UAT level means you count each RON once: either where it’s finally spent or where it leaves the system**[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul). The official reports implement this by showing those transactions as “minus” lines or by not adding them into totals[\[6\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02%20,de%20dezvoltare%20a%20bugetelui%20local). Your platform should mimic this: you can still display the line items for transparency, but your aggregated totals should be net of those.

- **Clearly distinguish “own revenues” vs “transfers” (and similarly, direct vs. transferred expenditures):** It’s very useful for transparency to show which portion of the budget came from the locality’s own fiscal effort and which came from higher-level support. The law actually requires local budgets to identify those sources. You might, for instance, present two revenue totals: one **including** state subsidies and one **excluding** them (much like the execution form shows *Venituri totale* vs. *Venituri proprii*[\[4\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=TOTAL%20VENITURI%20%28cod00.02%2B00.15%2B00.16%2B00.17%2B45.02%2B48.02%29%2000.01%20,326756330%20165069110%20250574331)). This way, users understand that, say, out of 65 million RON total revenue, only 62 million was local taxation while 3 million was central transfers. The platform can still default to showing the **65 million gross** (to align with official totals), but the breakdown prevents confusion. The same logic applies to expenditures: you may want to flag how much of the spending was on the UAT’s own services versus how much was passed on (e.g. “Transfers to subordinates or other budgets”).

- **“Real” revenues/expenses vs. accounting movements:** Emphasize actual service delivery and resource generation. Taxes, fees, shared income tax, grants, and subsidies are **real revenues** – they fund the public programs[\[5\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Impozit%20pe%20venit%20%2803,pe%20venit%20pentru%20echilibrarea%20bugetelor)[\[9\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=IV,02%20973%2C250%202%2C726%2C680%201%2C493%2C312). Salaries, goods and services, investments, and payments to beneficiaries are **real expenditures** – they reflect actual use of funds in the community[\[11\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=,Sume%20reprezentand). In contrast, internal reallocations (like moving surplus from one section to another, or forwarding funds to a subordinate who will do the actual spending) are **accounting mechanisms**. They should be shown for completeness, but not counted in totals. By following the consolidation rules, you ensure only “real” flows remain in the aggregated figures. This gives citizens a transparent view of the budget execution: it shows **the net revenue the locality had at its disposal and the net spending on public services**, without the noise of internal money shuffling.

In conclusion, you should **present the UAT’s budget execution in a consolidated manner**. That means **gross totals including all external funding, and net of internal transfers**, consistent with how the Ministry of Finance and ANAF present official data. This approach is grounded in law (Legea 500/2002, Legea 273/2006) and in standard reporting practice[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul)[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/184744#:~:text=organizatorica%20din%20cadrul%20institu%C5%A3iei%20publice,credit%20de%20angajament). Adopting it will align your platform’s numbers with the official PDF reports and provide a truthful picture of the local government’s finances. Each exclusion or inclusion decision can be justified by the legal framework and classification norms – as summarized above – ensuring that your transparency platform is both accurate and in line with Romanian public finance methodology.

**Sources:**

- Legea Finanțelor Publice nr. 500/2002 – Art. 2 (alin. 1, pct. 18\) (definiția *consolidării*)[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul); Legea Finanțelor Publice Locale nr. 273/2006 – Art. 2 (alin. 1, pct. 15\)[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/184744#:~:text=organizatorica%20din%20cadrul%20institu%C5%A3iei%20publice,credit%20de%20angajament).

- OMFP 1917/2005 – Norme metodologice de întocmire a contului de execuție (Anexele 12 și 13\)[\[13\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=finan%C5%A3ate%20din%20venituri%20proprii%20%C5%9Fi,execu%C5%A3ie%20a%20bugetului%20fondurilor%20externe)[\[14\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=8,ai%20bugetelor%20locale%2C%20cu%20informa%C5%A3ii). These require UATs to report consolidated execution as ordonator principal.

- Extras din Contul de execuție – Venituri (UAT exemple): showing *Total venituri* vs *Venituri proprii* (excluderi 11.02, 37.02)[\[4\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=TOTAL%20VENITURI%20%28cod00.02%2B00.15%2B00.16%2B00.17%2B45.02%2B48.02%29%2000.01%20,326756330%20165069110%20250574331); listing of cote defalcate impozit (04) și sume defalcate TVA (11) în execuție[\[5\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Impozit%20pe%20venit%20%2803,pe%20venit%20pentru%20echilibrarea%20bugetelor)[\[3\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,defalcate%20din%20taxa%20pe%20valoarea).

- Extras din Contul de execuție – Cheltuieli: exemplu de **Finanțarea învățământului particular 55.01.63** inclus în cheltuielile UAT[\[11\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=,Sume%20reprezentand); **transferuri interne** evidențiate separat (ex. vărsăminte între secțiuni cu valori negative/pozitive)[\[6\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02%20,de%20dezvoltare%20a%20bugetelui%20local); transferuri către instituții publice (51/55) netezite la consolidare.

- Curtea de Conturi – raportări și ghiduri: mențiuni despre eliminarea transferurilor la consolidare pentru reflectarea corectă a execuției locale[\[17\]](https://www.senat.ro/legis/PDF/2006/06L204FG.pdf?nocache=true#:~:text=,teritoriala%20%2C%20de)[\[18\]](https://primariaocnasibiului.ro/download/7/#:~:text=%5BPDF%5D%20Lege%20273%20,reflecta%20dimensiunea%20efortului%20financiar%20public).

---

[\[1\]](https://legislatie.just.ro/Public/DetaliiDocument/37954#:~:text=prin%20finan%C8%9Barea%20provenit%C4%83%20din%20surse,indicator%20ce%20m%C4%83soar%C4%83%20impactul) LEGE 500 11/07/2002 \- Portal Legislativ

[https://legislatie.just.ro/Public/DetaliiDocument/37954](https://legislatie.just.ro/Public/DetaliiDocument/37954)

[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/184744#:~:text=organizatorica%20din%20cadrul%20institu%C5%A3iei%20publice,credit%20de%20angajament) LEGE (A) 273 29/06/2006 \- Portal Legislativ

[https://legislatie.just.ro/Public/DetaliiDocument/184744](https://legislatie.just.ro/Public/DetaliiDocument/184744)

[\[3\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,defalcate%20din%20taxa%20pe%20valoarea) [\[6\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02%20,de%20dezvoltare%20a%20bugetelui%20local) [\[7\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=37.02.03%20,Incasari%20din%20rambursarea%20imprumuturilor%20acordate) [\[8\]](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf#:~:text=TOTAL%20VENITURI%20%28cod%2000,3%2C201%2C351%204%2C937%2C077%204%2C005%2C402%201%2C988%204%2C131%2C038) RptTiparireAnexeConturiExecutie

[https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf](https://comunaviisoara.ro/wp-content/uploads/2023/02/cont-executie-venituri-sursa-02.pdf)

[\[4\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=TOTAL%20VENITURI%20%28cod00.02%2B00.15%2B00.16%2B00.17%2B45.02%2B48.02%29%2000.01%20,326756330%20165069110%20250574331) [\[11\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=,Sume%20reprezentand) [\[12\]](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf#:~:text=Transferuri%20catre%20institu%3Fii%20publice%2051,344500%20344500%20286373%2058127%20286373) C:\\InfoSoft\\Contabilitate\\dds2.frx

[https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf](https://primariabuzau.ro/wp-content/uploads/2025/05/22.1.-Contul-de-executie-buget-local-Sectiunea-de-Functionare-.pdf)

[\[5\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Impozit%20pe%20venit%20%2803,pe%20venit%20pentru%20echilibrarea%20bugetelor) [\[9\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=IV,02%20973%2C250%202%2C726%2C680%201%2C493%2C312) [\[10\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=Subventii%20de%20la%20bugetul%20de,40%2C000%2040%2C000%2075%2C000%2075%2C000%2075%2C000) [\[16\]](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf#:~:text=A%20B%201%202%203,27%2C536%2C303%205%2C111%2C314%2022%2C424%2C989%2023%2C606%2C337%203%2C929%2C966) 44235.3758208218

[https://primariatoplita.ro/storage/2021/03/CONT\_DE\_EXECUTIE\_BUGET\_LOCAL\_VENITURI.pdf](https://primariatoplita.ro/storage/2021/03/CONT_DE_EXECUTIE_BUGET_LOCAL_VENITURI.pdf)

[\[13\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=finan%C5%A3ate%20din%20venituri%20proprii%20%C5%9Fi,execu%C5%A3ie%20a%20bugetului%20fondurilor%20externe) [\[14\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=8,ai%20bugetelor%20locale%2C%20cu%20informa%C5%A3ii) [\[15\]](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf#:~:text=match%20at%20L881%209,teritoriale%20%28comune%2C%20ora%C5%9Fe) Microsoft Word \- normio.doc

[https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf](https://static.anaf.ro/static/10/Anaf/reglementari/normio.pdf)

[\[17\]](https://www.senat.ro/legis/PDF/2006/06L204FG.pdf?nocache=true#:~:text=,teritoriala%20%2C%20de) \[PDF\] privind finanțele publice locale

[https://www.senat.ro/legis/PDF/2006/06L204FG.pdf?nocache=true](https://www.senat.ro/legis/PDF/2006/06L204FG.pdf?nocache=true)

[\[18\]](https://primariaocnasibiului.ro/download/7/#:~:text=%5BPDF%5D%20Lege%20273%20,reflecta%20dimensiunea%20efortului%20financiar%20public) \[PDF\] Lege 273 \- Primaria Ocna Sibiului

[https://primariaocnasibiului.ro/download/7/](https://primariaocnasibiului.ro/download/7/)

--- Second research

# Romanian Local Budget Execution Methodology for UAT (Ordonator Principal de Credite)

## Revenues – Codes to Exclude (to Avoid Double Counting)

When presenting a local budget execution for a **unitate administrativ-teritorială (UAT)** as *ordonator principal de credite*, certain revenue categories must be **excluded (subtracted)** from total revenues to avoid double counting. These are typically inter-governmental transfers or internal movements that would otherwise inflate the totals:

- **Cote și sume defalcate din impozitul pe venit (Code 04\)** – This is the share of income tax redistributed by the state to the local budget. In official execution reports, these appear with “*(se scad)*”, indicating they are deducted in consolidation[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00). Including them as local revenue while also counting them as state expenditure would double-count the same funds. Thus, all **Code 04** items (including sub-codes like 04.01, 04.02, 04.04 etc.) are excluded from the local revenue total[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=defalcate%20din%20impozitul%20pe%20%E2%94%82,din%20impozitul%20pe%20venit%20pentru). For example, Buzău’s consolidated revenue account lists **“Cote și sume defalcate din impozitul pe venit (se scad)”** with the full amount to be subtracted[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00).

- **Sume defalcate din TVA (Code 11\)** – These are VAT amounts allocated by the state to local budgets for various purposes (education, roads, etc.). Similarly, they are marked “(se scad)” in local execution reports[\[3\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,252%2C00%200%2C00%200%2C00). All subcategories under code 11 (e.g. 11.01, 11.02 for decentralised expenditures, 11.06 for equalization, etc.) are excluded from the revenue total[\[4\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=din%20TVA%20%E2%94%82%20%E2%94%82%2011,%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82%20cheltuielilor). In other words, **transfers from the state budget (VAT shares)** are not counted as local revenue in the consolidated total.

- **Subvenții de la bugetul de stat sau de la alte administrații (Codes 42 and 43\)** – These are subsidies or grants from the state budget or from other public administrations. They are external transfers similar in nature to the tax shares above. To avoid double counting in the broader public sector, such inter-budget subsidies are excluded from the local *own* revenue total in consolidation. (The state will record them as expenditure, so the local does not count them as new income in a consolidated view.) For example, code 42 includes various state grants to local budgets (funding for heating, healthcare, etc.), which are considered state-to-local transfers[\[5\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=%E2%94%A4%E2%94%827720100%E2%94%82Subven%C8%9Bii%20de%20la%20bugetul%20de,05%20%E2%94%82%20Planuri)[\[6\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=preuniversitar%20%E2%94%82%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82,pentru%20finan%C8%9Barea%E2%94%82%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82). Likewise, code 43 covers transfers from other UATs or institutions. In a single UAT’s report, these are **not counted in “real” revenues** – they are financing sources coming from other budgets.

- **Sume în curs de distribuire (Code 47\)** – These are amounts temporarily collected and pending distribution to other entities (for instance, revenues collected in a central account to be split between state and local budgets). By definition, code 47 revenues belong to another beneficiary and are not truly the UAT’s income. The classification lists **“47 – Sume în curs de distribuire”** (e.g. tax payments in transit) which should be omitted from final revenue tallies[\[7\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%A4%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82%2047,%C8%99omaj%20%C8%99i%20bugetul%20fondului%20na%C8%9Bional). In practice, such entries are recorded only for technical completeness and **must be subtracted out**, since they will be forwarded (e.g. a local government collecting state taxes would exclude those from its own resources).

- **Vărsăminte din secțiunea de funcționare pentru dezvoltare (part of code 36 or 37\)** – This refers to internal transfers of funds from the operating section to the development section of the budget. They appear as **internal movements, not new revenue**. In consolidated reports, one section’s outflow is the other’s inflow, so they cancel out. For example, an execution report might show a negative entry like *“Vărsăminte din secțiunea de funcționare pentru finanțarea secțiunii de dezvoltare”* of a certain amount and a corresponding positive entry, netting zero[\[8\]](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf#:~:text=Varsaminte%20din%20sectiunea%20de%20functionare,0%2C00%200%2C00%200%2C00%200%2C00%200%2C00). To avoid inflating both sections, such internal virement (typically classification code 36.05 or 37.03/37.04) is excluded from total revenues. The **“se scad”** principle applies – these amounts are deducted so that only external revenues remain in the total.

- **Operațiuni financiare (Codes 40 and 41\)** – These codes cover financial operations like **loans, use of prior surplus (excedent), and other financing**. They are not actual revenue from the economy, but rather financing sources. According to norms, they are reported separately and often marked to be excluded from “budgetary revenues.” For instance, if a UAT uses surplus from previous years, the execution report will show an entry under code 40/41 (e.g. *“Sume din excedentul bugetului local utilizate”*)[\[9\]](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf#:~:text=Incasari%20din%20rambursarea%20imprumuturilor%20acordate,480%2C00%200%2C00%200%2C00). While this indicates the amount of past savings used, it is **not counted in the current revenue total** (since that surplus was counted as revenue in earlier years). Similarly, proceeds from loans (domestic or external – often code 41.02, 41.03) are financing items, not to be mixed with operational revenues. In summary, **do not include codes 40.xx and 41.xx in the sum of revenues** – they are funding sources that would distort the picture of actual income if counted.

In practical terms, the **Ministry of Finance’s methodology (OMFP 1917/2005 and updates)** flags these categories in the budget classification with notes like “(se scad)” or other indications that they are deducted. The local execution accounts published on the Ministry’s portal follow this rule, subtracting inter-budget transfers from the totals. The rationale is reinforced by law: **Legea finanțelor publice locale nr. 273/2006** (art. 3\) stipulates that the general budget of a locality, *after consolidation by eliminating transfers between budgets*, reflects the true financial effort in that year[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,). In other words, a UAT’s consolidated revenue should include only the *real revenues* (own-source revenues and any external funds that are final to that locality), excluding those portions that are mere pass-through from other public budgets.

**Examples of exclusions:** If a commune’s budget law includes 11.02 Sume defalcate din TVA pentru finanțarea învățământului or 04.01 Cote defalcate din impozitul pe venit, these will be listed but deducted (they might even be shown as negative or in a “se scad” section)[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00)[\[3\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,252%2C00%200%2C00%200%2C00). If the commune collected certain taxes that must be shared upward (code 47), those shared portions are not counted as its revenue. If the city transferred 1 million RON from its operating budget to its development projects (36.05/37.03), that 1 million is not counted twice – it’s removed from the consolidated total. And if the county gave the city a 500k RON subsidy (code 43.xx), that 500k is excluded from the city’s revenue total in a consolidated presentation (since it was already counted in the county’s spending).

By excluding all these categories, we **avoid double counting** money that has already been counted in another budget or another section of the same budget. The result is that the **Total Revenues** in a consolidated local budget execution report represents the genuine incoming resources attributable to that locality (taxes, fees, grants from EU or donors, etc., plus any net transfers that aren’t counted elsewhere).

## Expenses – Codes to Exclude or Adjust in Consolidation

On the expenditure side, the goal is to report what was actually spent on public services **without internal double counting**. A single UAT (as an ordonator principal) often includes a central apparatus and multiple subordinate institutions (schools, libraries, etc.) whose budgets roll up into a *general local budget*. When consolidating, any transfers *within* this local system should be eliminated. Key points for expenses:

- **Transferuri între unități ale administrației publice (Economic Category 51\)** – These are transfers from the UAT’s budget to other public sector entities. This can include transfers to subordinate public institutions (e.g. a city hall transferring funds to its subordinate schools or local hospitals) or to other administrative units. In a consolidated report of the UAT, such transfers are **excluded** because the receiving institution’s expenditures will be counted in the total. If we did not exclude them, the money would appear twice: once as an expense of the city and again as expenses of the subordinate unit. Legea 273/2006 explicitly requires eliminating such intra-government transfers in consolidation[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,). Therefore, **all code 51.xx expenditures (transfers to other public authorities or institutions)** should be left out of the total expenses for the UAT’s consolidated execution. The official practice is that these may be reported in the detailed tables but are not summed into the “Total Cheltuieli” of the consolidated budget. For example, if a county council budget shows an expense line *“Transferuri către bugetele locale”* of 2 million RON (code 51.x), and that 2 million is received by a town (in the town’s revenues code 43.x), a consolidated view at the county level or national level will net this out. At the county level itself, if presenting its own execution, that transfer to the town is external (not within the county’s own subordinates), so it might be included for the county’s perspective but would be excluded in a higher-level consolidation. The general rule: **transfers within the same consolidated scope get eliminated**. For a UAT’s own consolidated budget, “transfers to subordinate units” fall in this category and are not counted in total spending.

- **Alte transferuri (Economic Category 55\)** – This is a broader transfers category, and here we must distinguish **internal vs. external** destinations. *Category 55.01 – “Alte transferuri curente interne”* includes various transfer lines, some of which may be internal to the public sector, while others go outside of it. For consolidation, **if the transfer’s recipient is another entity inside the UAT’s consolidation boundary, exclude it**; if the recipient is outside (private sector, households, other governments), then it remains as a final expenditure. A notable example is **“Finanțarea învățământului particular sau confesional acreditat” (code 55.01.63)**[\[11\]](https://sintact.ro/legislatie/monitorul-oficial/hotararea-69-2024-privind-aprobarea-normelor-metodologice-pentru-17025301#:~:text=,particular%20%C5%9Fi%20confesional%20acreditate). This is the funding that a local government provides to private or faith-based schools in its area, typically using money it received from the state for this purpose. Even though it is listed under “transferuri interne” in the economic classification, the recipient (a private accredited school) is **not a public institution** and not part of the UAT’s own budget structure. Therefore, this is a *final expense* from the UAT’s perspective and **should be included** in the expense total. In other words, **do not exclude code 55.01.63** – it is real spending on education in that community, financed through the local budget. In the discrepancy example given, the platform had omitted this 2.1925 million RON expenditure, which led to the expense total being exactly that much lower than the official figure. The official execution report for the commune did include the **financing of private education** as an expenditure, because it is part of the public effort (the money exits the public sector to those schools). The correct approach is to count such items as expenditures. On the other hand, if there were a line 55.01.xx representing a transfer to, say, a subordinate public library (just hypothetical), that would be an internal transfer and should be excluded (with the library’s actual spending counted under other categories like goods, salaries, etc.). In summary: **Review the nature of items under 55.01** – exclude those that are purely passing funds to another public entity whose spending is separately accounted, but keep those that represent the final disbursement of funds (even if categorized as “transfer”) to non-public entities or individuals. Many sub-lines of 55.01 are actually external (scholarships, aid, private school funding, etc.) and are legitimate expenses to count.

- **Transfers to subordinate budgetary institutions** – These can appear under category 51 or 55 depending on the type of transfer. Common cases are transfers for operating costs of schools, museums, social service units that are under the local authority. In consolidation, we **do not count the act of transfer itself**; we only count the expenditures made with those funds. Practically, the consolidated expense report will merge the subordinate units’ expenditures by economic nature and functional classification. For example, if a city allocates 5 million RON to its municipal hospital (a subordinate unit) for salaries and utilities, the consolidated budget will show the hospital’s salary and utility expenditures in the Health chapter, and **will not show a 5 million “transfer” line** at all (or it may show it with a note and then exclude it). This prevents double counting the same 5 million. The legal basis is again the consolidation principle of eliminating intra-budget sums[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,). So, **any intra-UAT transfers (budgetary support to subordinate institutions, internal reallocations)** are excluded from the total. Only the **end-use expenses** (salaries, goods, services, investments, etc.) of those institutions remain in the consolidated figures.

- **Finanțarea secțiunii de dezvoltare din excedent sau din transferuri** – On the expense side, internal movements like using last year’s surplus for development or moving funds between sections do not directly appear as “expenses” (they appear in revenues as discussed). But sometimes, expense reports have technical lines (under financing sections or under loans repayment categories) to reflect such operations (e.g. Category 84 or 85 for repayments, or 81 for credit reimbursements). These are not operational expenses on public services; they are either debt service or reverse entries for earlier payments. The question specifically asks about *“se scad” items in classification* – generally, *negative expense lines* appear for things like **“Plăți efectuate în anii precedenți și recuperate în anul curent”** (repayments of prior year expenses, code 85\)[\[12\]](https://primariabuzau.ro/wp-content/uploads/2025/05/04-Contul-de-executie-cheltuieli.pdf#:~:text=match%20at%20L167%20recuperate%20in,precedenti%20si%20recuperate%20in%20anul). Those are shown as negative values (recoveries) in execution and are indeed subtracted in arriving at net expenses. If an expense category is marked “(se scad)” in classification (unusual on expense side, but possible for recoveries or corrections), then it means to deduct it. Most consolidation adjustments on expenditures, however, are done by excluding entire transfer categories as described, rather than showing negatives. The bottom line is that **only actual outlays that leave the UAT’s consolidated budget are counted** in total expenses.

In summary, for **expense totals**, **exclude:** transfers that simply shuffle funds between budgets (code 51, and any similar 55.xx that are internal), as well as any internal budget-section transfers or accounting reversals. **Include:** all genuine spending on operations, whether done by the central city hall or by subordinate units, and transfers that go to outside entities (private sector, population, other governments in a non-consolidated context). By doing this, the **Total Cheltuieli** of the UAT will represent the actual expenditures benefitting the community or paid out by that community, without double-counting internal financial transactions. This matches official methodology – for example, the *Contul de execuție cheltuieli consolidat* for a city will include personnel, goods, services, capital outlay, etc., but a transfer to its own subunit will not inflate the total (the subunit’s spending is already in the total). If the platform had mistakenly excluded an item like the private education funding (which should be in total) or included a transfer that should be netted out, it would cause discrepancies exactly as observed.

## Legal and Methodological References

The consolidation rules for local budget execution are grounded in Romanian public finance law and ministerial regulations:

- **Legea finanțelor publice locale nr. 273/2006**, art. 3, alin. (1) (as modified by OUG 63/2010) states that *the revenues and expenditures of all component budgets of a UAT, cumulated at the level of the UAT, form the general local budget which,* *after consolidation by eliminating inter-budgetary transfers, reflects the size of the public financial effort in that year for that administrative unit*[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,). This is a clear legal mandate to remove internal transfers (“transferuri de sume dintre bugete”) from the consolidated figures. In essence, the law ensures that when we talk about a locality’s budget execution in aggregate, we are not simply summing everything (which would double count money that moved from one pocket to another), but rather summing only final incomes and final outflows.

- **OMFP 1917/2005 (Norme metodologice privind încheierea exercițiului bugetar)** and subsequent orders define the budgetary classification and reporting formats. In these norms, certain revenue codes are explicitly annotated with “**(se scad)**”. For instance, the classification schema approved by OMFP 1917/2005 labels **code 04 “Cote și sume defalcate din impozitul pe venit” with “(se scad)”**[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=defalcate%20din%20impozitul%20pe%20%E2%94%82,din%20impozitul%20pe%20venit%20pentru) and **code 11 “Sume defalcate din TVA” with “(se scad)”**[\[4\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=din%20TVA%20%E2%94%82%20%E2%94%82%2011,%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82%20cheltuielilor), indicating these are amounts to be deducted in consolidated reporting. We see this carried through in practice: the Ministry of Finance’s standard report “Contul de execuție venituri CONSOLIDAT” for a local government lists those items and subtracts them[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00)[\[3\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,252%2C00%200%2C00%200%2C00). The presence of “(se scad)” in the official forms is a direct guide to exclude those amounts from totals. Likewise, the classification of revenue includes **code 47 “Sume în curs de distribuire”**, which represents revenues collected on behalf of other budgets – these are not summed as the locale’s own revenue[\[7\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%A4%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82%2047,%C8%99omaj%20%C8%99i%20bugetul%20fondului%20na%C8%9Bional).

- **Current Classification Standards (Clasificația indicatorilor bugetari)**: The functional and economic classification used by all public institutions in Romania provides which codes are considered transfers. Economic codes **51 and 55.01** fall under *Titlul V – Transferuri*, and within those, the distinction can be made between transfers to other public entities vs. other destinations. The classification (updated periodically by MOF) treats **code 55.01** as “Alte transferuri curente interne” and includes sub-lines for specific purposes. One such sub-line is **“Finanțarea învățământului particular sau confesional acreditat” identified by code 55.01.63**[\[11\]](https://sintact.ro/legislatie/monitorul-oficial/hotararea-69-2024-privind-aprobarea-normelor-metodologice-pentru-17025301#:~:text=,particular%20%C5%9Fi%20confesional%20acreditate). Knowing the classification of this item clarifies that it is a transfer to the private sector (albeit for a public education purpose) and thus not an intra-government transfer to eliminate within the local budget – instead, it is a use of funds that must appear in the final expenses. On the other hand, a line like 55.01.01 (if it existed, e.g. hypothetical “Transferuri către instituții publice subordonate”) would be an internal transfer to exclude. **OMFP 1954/2005** (which defined the economic classification) and its successors outline these details. In short, the classification tells us which items are merely reallocations (to be netted out) and which are actual spending. The platform should align its inclusion/exclusion of codes based on this classification and its annotations.

- **ANAF/MF Official Reports**: The official local budget execution reports (often PDF outputs available via ANAF or the Ministry of Finance’s portal) implement the above rules. They typically present a **gross breakdown by category, then show net totals after subtracting the “se scad” items**. For example, an official report for a municipality in 2025 shows the planned and realized amounts for all revenue lines, including shares of income tax and VAT, but marks those with “se scad” and the total “Total Venituri” is calculated **after** removing them[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00)[\[3\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,252%2C00%200%2C00%200%2C00). On the expenditure side, the official *Contul de execuție cheltuieli consolidat* merges all expenditures and does not double count transfers. If one looks for a transfer to a subordinate unit in that report, either it will not appear at all or it will appear in a separate section that does not add to the total. A note from the Ministry’s website confirms that the execution data aggregated at the level of each ordonator principal are consolidated (internal transfers are not included in totals)[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,). In practice, this means the totals in those PDFs are the **consolidated (net) figures** that a transparency platform should mirror.

- **Legea nr. 500/2002 (Legea finanțelor publice)** – While this law mainly covers the state budget and general rules, it introduces the concept of the **“buget general consolidat”** as the aggregated budget of all components **minus inter-budget transfers**[\[13\]](https://www.senat.ro/legis/PDF/2002/02L300FG.pdf#:~:text=%5BPDF%5D%20LEGE%20,Buna%20gestiune). This concept extends to local budgets as components of the general consolidated budget of the country. Thus, the principle of not double counting a transfer that appears in two budgets is a cornerstone of public financial reporting. Additionally, Legea 500/2002 and related norms (e.g. OMFP 1801/2020 for public institutions’ financial statements) ensure that things like **budget surplus usage or loan proceeds are reported separately** from operating revenues[\[9\]](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf#:~:text=Incasari%20din%20rambursarea%20imprumuturilor%20acordate,480%2C00%200%2C00%200%2C00), reinforcing that they should not be misconstrued as “new revenues.”

- **Curtea de Conturi guidelines and standard practices**: Romania’s Court of Accounts, in auditing local finances, also expects that consolidated financial statements of a UAT show true revenues and expenditures net of transfers. For instance, a county audit report might reclassify a wrongly counted transfer (if a council counted a transfer to a subordinate as an expense in consolidated totals, the auditors would flag that). The legal and normative framework described above is what auditors use to assess correctness. While we don’t have a specific audit report excerpt here, the absence of findings on this topic in published audit reports suggests that most UATs follow the methodology (and the platform should as well).

## Consolidation Principles – Gross vs. Consolidated Totals

**For a single UAT acting as ordonator principal, the standard is to present *consolidated* totals (net of internal transfers)**, not simple gross sums of all transactions. This ensures the data reflects actual finances of that UAT without inflation from circular flows. Key principles and recommendations:

- **Present the budget execution on a consolidated basis**, as the Ministry of Finance does. The **gross approach (counting everything including internal reallocations)** will mislead by overstating both revenues and expenses. For transparency purposes, citizens and analysts should see how much money the local government *truly raised and spent*. Consolidated totals provide this by excluding duplicative entries. The feedback about differences with official data essentially highlights that the official figures are consolidated. To match them, the platform should apply the same exclusions. In the example, the commune’s official revenue (\~65.47 million) included some items the platform omitted – likely the platform had already consolidated more aggressively (perhaps excluding a subsidy that the official report treated as external revenue). Conversely, on expenses, the platform’s exclusion of the private education transfer made its total too low compared to the official, meaning the official count considered that a valid expense. By adjusting the inclusion/exclusion of those specific codes as discussed, the platform’s totals will align with the official methodology.

- **“Real” revenues vs “accounting” revenues**: Real revenues are those that originate from the economy into that budget (taxes, fees, grants) or that increase the net resources of the UAT. Accounting entries like moving money from one section to another or receiving a transfer that was already accounted in another budget do not increase net resources – they are merely reallocations. Thus, they should not be included in the sum. The platform should categorize revenue codes into *own revenues* (to include) and *transfer/internal* (to exclude). After exclusion, the **Total Revenues** essentially equals: *fiscal revenues (taxes), non-fiscal revenues (fees, property income), subsidies/grants from EU or other external sources, and any other income that isn’t counted elsewhere.* It explicitly leaves out the state tax shares, state subsidies, etc., because those were resources coming from the central budget (already counted in the state’s collection and spending). This approach gives a clearer picture of how self-sufficient the locality is and how much support it received, without double counting the support.

- **“Real” expenditures vs “artificial” ones**: Similarly, a **consolidated expenditure total** shows what the locality actually spent on public services and investments. If we included internal financial transfers (like the city hall “spending” 5 million by just moving it to a subordinate’s account), we would overstate the spending. The real spending is what that 5 million was ultimately used for (salaries, supplies, etc.). Therefore, the platform should report expenditures by economic category (personnel, goods and services, capital, transfers, etc.) **after eliminating internal transfers**. Standard practice on platforms (and in official reports) is to list the broad categories and ensure the totals match the consolidated figure from official sources. For example, the **Transparenta.eu** platform likely aims to mirror what one would find in the *execuție bugetară* published by the city. To do so, it must show consolidated figures. Any deviations (like initially seen differences) indicate a need to adjust which lines are summed.

- **Consolidation scope**: It’s worth noting that “consolidated” is relative to the scope of budgets considered. In our case, the scope is a single UAT’s **general local budget** (which comprises the principal credit holder’s budget and those of subordinate units). At this level, we eliminate transfers between the city hall and its subordinates. We **do not eliminate** transactions between the local budget and entities outside of it. For instance, if a commune pays 100k RON to a county (perhaps as co-financing for a project), that is a transfer to another UAT – within the commune’s report, that 100k is a legitimate expense (money leaving the commune’s budget). We wouldn’t exclude it at the commune level (because the county’s budget is not consolidated with the commune’s at the commune-level report). However, if we were looking at an aggregate of all local budgets in a county, then that transfer would be eliminated in that higher consolidation. The platform’s focus is each UAT separately, so **exclude only intra-UAT flows, not inter-UAT flows**. In practical terms: exclude “transfers to subordinate units” but **include “transfers to other distinct administrations”** when reporting a single UAT. This nuance explains why code 55.01.63 stays (it’s a transfer to private schools, outside the UAT’s own budget) and why, say, a line “Transferuri către bugetul județean” would also stay (it’s outside the UAT). The **only transfers a UAT report removes are those within its own umbrella** (main budget to sub-budgets). This approach aligns with the legal definition that consolidation is done *“la nivelul unității administrativ-teritoriale”*[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,).

- **Transparency and standard practice**: Most transparency platforms and official disclosures use consolidated figures for consistency and comparability. For example, the Ministry’s **Transparență Bugetară** portal publishes execution data for each institution on a consolidated basis. The user of the data can then see the net budget execution. It is standard to show **gross figures only in detailed breakdowns**, but **headline totals are always consolidated**. Therefore, to answer the question: one should **show consolidated totals** matching the official PDFs (which are consolidated). The platform should not present gross totals that include internal double counts, as that would confuse users and deviate from official numbers. Instead, it can footnote or detail what items were excluded (for transparency about transfers), but the main figures should reflect the consolidated methodology.

- **Legal basis for each exclusion/inclusion**: To recap a few key justifications: *State tax shares and subsidies* – excluded because of the principle in art. 3 of Legea 273/2006 and classification “se scad” notes[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00)[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,). *Transfers to subunits* – excluded based on the same art. 3 and the logic of consolidation within the general local budget. *Financing of private education* – included as expense because it is mandated by law (Legea educației) to be funded via locals but is ultimately a use of funds in the private sector, not an intra-budget transfer (Hotărârea Guv. nr. 136/2016 and subsequent, which establishes that these funds are provided *through* local budgets for private schools[\[14\]](https://legislatie.just.ro/Public/DetaliiDocument/195974#:~:text=descentraliz%C4%83rii%20nr,%C3%AEnv%C4%83%C8%9B%C4%83m%C3%A2nt%20se%20face%20pe%20baza)). *Use of surplus* – shown separately by OMFP 720/2014 and OMFP 1801/2020 rules, not counted in revenues[\[9\]](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf#:~:text=Incasari%20din%20rambursarea%20imprumuturilor%20acordate,480%2C00%200%2C00%200%2C00). *Intra-budget section virement* – governed by the budgetary rules (art. 20 of Legea 273/2006 allows transfers between sections, but execution reporting treats them as technical, netting them out so as not to double count that revenue in development section).

In conclusion, the correct methodology for UAT budget execution is to **present consolidated figures**. The platform should **include** genuine revenues (own-source and external grants that are final) and genuine expenditures (actual spending for the community), and **exclude** all internal transfers and pass-through funds as identified by their codes. Adopting this will resolve the discrepancies: the revenue total will likely **include amounts that were missing** (e.g. certain subsidies that should be counted as revenue for the UAT since they’re not counted elsewhere at that level) and **exclude those that were over-counted** (if any were included twice), and the expenditure total will **include previously omitted final spends** (like the 55.01.63 private education funding) while **excluding any double-counted transfers**. This aligns with both the letter of Romanian public finance law and the standard reporting practice used by the Ministry of Finance and ANAF in official budget execution documents[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,)[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00).

### Sources

- Legea nr. 273/2006 privind finanțele publice locale – Art. 3(1) (principle of consolidating local budgets by eliminating transfers)[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,).

- Clasificația indicatorilor bugetari (OMFP 1917/2005, as updated) – markings for revenues that “se scad” in consolidare: e.g. code 04 (Cote defalcate din impozit pe venit)[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00); code 11 (Sume defalcate din TVA)[\[3\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,252%2C00%200%2C00%200%2C00); code 47 (Sume în curs de distribuire)[\[7\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%A4%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82%2047,%C8%99omaj%20%C8%99i%20bugetul%20fondului%20na%C8%9Bional) etc.

- Contul de execuție bugetară consolidat – exemplu Municipiul Buzău (Iunie 2025), care arată excluderea cotelor defalcate și a transferurilor interne din total venituri[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00)[\[3\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,252%2C00%200%2C00%200%2C00).

- Hotărârea Guvernului nr. 136/2016 (și norme ulterioare) – stabilește finanțarea învățământului particular prin bugetele locale (cod economic 55.01.63), sumă provenită din TVA defalcată și transferată către școli private[\[14\]](https://legislatie.just.ro/Public/DetaliiDocument/195974#:~:text=descentraliz%C4%83rii%20nr,%C3%AEnv%C4%83%C8%9B%C4%83m%C3%A2nt%20se%20face%20pe%20baza)[\[11\]](https://sintact.ro/legislatie/monitorul-oficial/hotararea-69-2024-privind-aprobarea-normelor-metodologice-pentru-17025301#:~:text=,particular%20%C5%9Fi%20confesional%20acreditate). Acest transfer este cheltuială finală a UAT (nu se elimină la consolidarea bugetului local, deoarece beneficiar final e în afara sistemului bugetar local).

- OMFP nr. 720/2014 și OMFP nr. 1801/2020 – reguli metodologice de execuție și raportare financiară pentru instituții publice, care prevăd evidențierea separată a surselor de finanțare (excedent, împrumuturi) și a recuperărilor de plăți, fără ca acestea să distorsioneze totalurile de venituri/cheltuieli[\[9\]](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf#:~:text=Incasari%20din%20rambursarea%20imprumuturilor%20acordate,480%2C00%200%2C00%200%2C00)[\[12\]](https://primariabuzau.ro/wp-content/uploads/2025/05/04-Contul-de-executie-cheltuieli.pdf#:~:text=match%20at%20L167%20recuperate%20in,precedenti%20si%20recuperate%20in%20anul).

- Rapoarte de execuție bugetară locale (PDF-uri ANAF/MFP) – confirmă practicile de mai sus, prezentând bugetele UAT consolidate la nivel de ordonator principal, cu transferurile interne eliminate și cu note “(se scad)” la elementele relevante[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,)[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00).

---

[\[1\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Cote%20si%20sume%20defalcate%20din,380%2C00%200%2C00%200%2C00) [\[3\]](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf#:~:text=Sume%20defalcate%20din%20TVA%20,252%2C00%200%2C00%200%2C00) primariabuzau.ro

[https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf](https://primariabuzau.ro/wp-content/uploads/2025/08/03-Contul-de-executie-venituri-CONSOLIDAT.pdf)

[\[2\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=defalcate%20din%20impozitul%20pe%20%E2%94%82,din%20impozitul%20pe%20venit%20pentru) [\[4\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=din%20TVA%20%E2%94%82%20%E2%94%82%2011,%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82%20cheltuielilor) [\[5\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=%E2%94%A4%E2%94%827720100%E2%94%82Subven%C8%9Bii%20de%20la%20bugetul%20de,05%20%E2%94%82%20Planuri) [\[6\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=preuniversitar%20%E2%94%82%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82,pentru%20finan%C8%9Barea%E2%94%82%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82) [\[7\]](https://legislatie.just.ro/Public/DetaliiDocument/219269#:~:text=%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%80%E2%94%A4%E2%94%82%20%E2%94%82%20%E2%94%82%20%E2%94%82%2047,%C8%99omaj%20%C8%99i%20bugetul%20fondului%20na%C8%9Bional) ANEXA (A) 12/12/2005 \- Portal Legislativ

[https://legislatie.just.ro/Public/DetaliiDocument/219269](https://legislatie.just.ro/Public/DetaliiDocument/219269)

[\[8\]](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf#:~:text=Varsaminte%20din%20sectiunea%20de%20functionare,0%2C00%200%2C00%200%2C00%200%2C00%200%2C00) [\[9\]](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf#:~:text=Incasari%20din%20rambursarea%20imprumuturilor%20acordate,480%2C00%200%2C00%200%2C00) cjsm.ro

[https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf](https://www.cjsm.ro/storage/documente-financiare/cecilia/cont-de-executie-cheltuieli-consolidat.pdf)

[\[10\]](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf#:~:text=Veniturile%20si%20cheltuielile%20bugetare%20Art,) ditl3.ro

[https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf](https://www.ditl3.ro/media/6283/lege-nr-273-din-2006-24052013html.pdf)

[\[11\]](https://sintact.ro/legislatie/monitorul-oficial/hotararea-69-2024-privind-aprobarea-normelor-metodologice-pentru-17025301#:~:text=,particular%20%C5%9Fi%20confesional%20acreditate) Hotararea 69/2024 privind aprobarea normelor metodologice pentru ...

[https://sintact.ro/legislatie/monitorul-oficial/hotararea-69-2024-privind-aprobarea-normelor-metodologice-pentru-17025301](https://sintact.ro/legislatie/monitorul-oficial/hotararea-69-2024-privind-aprobarea-normelor-metodologice-pentru-17025301)

[\[12\]](https://primariabuzau.ro/wp-content/uploads/2025/05/04-Contul-de-executie-cheltuieli.pdf#:~:text=match%20at%20L167%20recuperate%20in,precedenti%20si%20recuperate%20in%20anul) primariabuzau.ro

[https://primariabuzau.ro/wp-content/uploads/2025/05/04-Contul-de-executie-cheltuieli.pdf](https://primariabuzau.ro/wp-content/uploads/2025/05/04-Contul-de-executie-cheltuieli.pdf)

[\[13\]](https://www.senat.ro/legis/PDF/2002/02L300FG.pdf#:~:text=%5BPDF%5D%20LEGE%20,Buna%20gestiune) \[PDF\] LEGE \- privind finanţele publice

[https://www.senat.ro/legis/PDF/2002/02L300FG.pdf](https://www.senat.ro/legis/PDF/2002/02L300FG.pdf)

[\[14\]](https://legislatie.just.ro/Public/DetaliiDocument/195974#:~:text=descentraliz%C4%83rii%20nr,%C3%AEnv%C4%83%C8%9B%C4%83m%C3%A2nt%20se%20face%20pe%20baza) HOTARARE (A) 136 02/03/2016 \- Portal Legislativ

[https://legislatie.just.ro/Public/DetaliiDocument/195974](https://legislatie.just.ro/Public/DetaliiDocument/195974)

--- Third research

# Consolidation of Local Budget Codes in Romania – Methodology and Legal Justification

## Legislative context for **consolidation**

Romanian local budgets must be reported on a **consolidated** basis.  The **Law on local public finances (Legea nr. 273/2006)** defines *consolidare* as *“the operation of eliminating transfers of sums between budgets in order to avoid double counting”*.  Article 3 of the same law adds that the **general local budget** of a commune/city/county reflects the local financial effort **only after consolidation**, i.e., after eliminating transfers between budgets.  Local revenues consist of: (i) own revenues (taxes, contributions, fees); (ii) **shares of state revenues** (income‑tax and VAT shares); and (iii) **subsidies from the state budget or other public budgets**.  When consolidating, transfers (state tax shares, VAT allocations, inter‑budget transfers and other internal movements) are eliminated so that each amount is counted only once.

## Code‑by‑code justification

### Code 04 – *Cote și sume defalcate din impozitul pe venit* (shares of personal income tax)

- **Nature:** The state allocates a percentage of income‑tax collections to local budgets.  These funds enter the local budget as revenue but represent transfers from the state budget.
- **Classification:** The Ministry of Finance’s **budget indicator classification** lists code `04` with the note **“se scad”** (to be subtracted), meaning that these amounts are deducted when consolidating local budgets.
- **Legal basis:** Article 5 of Law 273/2006 enumerates “cote și sume defalcate din impozitul pe venit” as a component of local revenues.  Because the same amounts are recorded as state‐budget expenditures, counting them again at local level would double count.  Hence, they are included in **gross** revenue (showing total resources available) but **excluded** from consolidated totals (“venituri proprii”).
- **Consolidation rule:** In a local authority’s consolidated budget (ordinators principal + subordinates) the income‑tax shares are recorded as external transfers but **eliminated when calculating consolidated revenues** to avoid double counting across budgets.  In national consolidation they are also eliminated.  For transparency, they may be shown separately but not summed into own revenues.

### Code 11 – *Sume defalcate din TVA* (shares of VAT)

- **Nature:** These are allocations from VAT revenues designated for local governments (financing decentralised expenditures, balancing local budgets, etc.).
- **Classification:** The budget classification lists all sub‑codes under `11` as **“se scad”**.
- **Legal basis:** As with code 04, Law 273/2006 includes these VAT allocations among local revenues.  However, to prevent double counting at consolidation, they must be deducted from the local revenue total.
- **Consolidation rule:** VAT shares are reported in gross revenue but subtracted in consolidated figures and labelled “se scad” in official execution accounts.  Only the amounts that remain after this deduction (own revenues and final grants) enter the consolidated total.

### Codes 36.05 and 21.A.36.05.00 – *Vărsăminte din veniturile şi/sau disponibilităţile instituţiilor publice*

- **Nature:** Code 36.05 (and the accounting account `21.A.36.05.00`) records transfers of **surpluses or available funds** from subordinate public institutions to the local budget.
- **Official guidance:** The Ministry of Finance’s methodological note on closing the fiscal year explains that account **21.A.36.05.00** is used to register **surpluses transferred from subordinate institutions (“vărsăminte din veniturile şi/sau disponibilităţile instituțiilor publice”)**.  These are not new revenues but reallocations within the same UAT.
- **Consolidation rule:** In the consolidated local budget, amounts under code 36.05 are **eliminated** because the subordinate institution’s surplus is already counted in its own execution.  Adding the transfer again in the principal’s revenue would double count the same funds.  Thus, they may appear as a line item but must not be included in consolidated totals.

### Codes 37.02.03 / 37.02.04 – *Vărsăminte din secțiunea de funcționare pentru finanțarea secțiunii de dezvoltare*

- **Nature:** These subcodes reflect internal transfers between the operating section and the development section of the same budget.
- **Evidence:** In sample local budget reports, **37.02.03** appears as a negative revenue (transferring funds out of the operating section) and **37.02.04** as a corresponding positive revenue in the development section, the amounts cancelling each other.
- **Consolidation rule:** Because this is an internal movement, neither the negative nor the positive amount is counted in the consolidated revenue total.  They are shown for completeness but excluded in final sums.

### Code 47 – *Sume în curs de distribuire* / *Sume încasate în contul unic, în curs de distribuire*

- **Nature:** Code 47 covers **transitory sums collected in the treasury’s single account and pending distribution to the correct budget** (e.g., shared taxes temporarily held).  These amounts are not final revenues.
- **Official guidance:** The Ministry of Finance’s year‑end methodology (Order 1983/2025) states that amounts recorded in account **21.A.47.04.00 “Sume încasate pentru bugetul local în contul unic, în curs de distribuire”** are **distributed to the appropriate revenue accounts on 5 January of the following year**.  This indicates they are temporary and must not be treated as revenue for the year.
- **Consolidation rule:** Because these sums are merely in transit, they must be **eliminated from consolidated revenues**.  Once distributed, the amounts are recorded under their proper revenue codes (taxes, fees, etc.).

### Codes 40 and 41 – *Operațiuni financiare* (financial operations)

- **Nature:** These codes refer to financial operations such as **using previous years’ surplus**, contracting or repaying **loans**, and other financing activities.
- **Evidence:** In local budget execution reports, codes `40.xx` and `41.xx` appear under a separate section labeled **“Operațiuni financiare”** and list items like “Sume din excedentul bugetului local utilizat” and “Împrumuturi interne/externe primite”.  They are not operating revenues or expenditures but financing sources/uses.
- **Consolidation rule:** Financial operations are typically **reported separately** and excluded from the totals of current revenues or expenditures.  They are included in the financing statement but do not affect the consolidated operating result.

### Codes 42 and 43 – *Subvenții* (subsidies)

- **Nature:** Code 42 refers to **subsidies from the state budget**, while code 43 covers **subsidies from other public administrations (e.g., county or other municipalities)**.  These sums finance specific services like social care, health or education.
- **Legal basis:** Law 273/2006 lists subsidies from the state and other public budgets among **local revenues**.
- **Consolidation rule:** At the **local UAT level**, these subsidies are **external transfers** and thus remain included in revenues; they increase the resources available to the locality.  When consolidating budgets at a higher level (e.g., county or national), they are eliminated to avoid double counting across budgets, but for the UAT’s own consolidated budget they are kept.  Consequently, codes 42.*and 43.* are **included** in consolidated revenue figures for a single local authority.

### Code 51 – *Transferuri între unități ale administrației publice*

- **Nature:** Code 51 comprises **transfers from one public institution to another** (e.g., a municipality transferring funds to a subordinate school or another public institution).
- **Legal basis and principle:** According to the consolidation definition in Law 273/2006, internal transfers between public budgets must be eliminated.  Because the receiving institution records these transfers as revenue and its subsequent spending as expenditure, keeping the transfer in the principal’s expenditure would double count the amount.
- **Consolidation rule:** In the **gross view** (execution of an individual ordonator principal) the transfers may appear.  When consolidating the budgets of the ordonator principal and its subordinate institutions, **all internal transfers under code 51 are eliminated**, and only the subordinate institution’s actual expenditures (personnel, goods, services, etc.) remain in the consolidated total.  Transfers to public institutions outside the consolidation perimeter (e.g., from a commune to a county) remain, because those budgets are not consolidated with the commune at this level.

### Code 55 – *Alte transferuri* (other transfers)

- **Nature:** Code 55 covers various current transfers.  Some sub‑codes represent internal transfers within the public sector; others finance private‑sector beneficiaries.
- **Subcodes:**

  - **55.01.63 – *Finanțarea învățământului particular sau confesional acreditat***.

    - **Evidence:** Government Decision 136/2016 (norms on financing private/confessional education) states that funding for private or confessional schools is recorded in the local budget under indicator **“Finanțarea învățământului particular sau confesional acreditat” (code 55.01.63)** and that private schools must report how these funds are used.
    - **Consolidation rule:** This transfer goes **outside the public sector**, so it is a final expense.  It is **included** in consolidated expenditure totals (it must not be eliminated).  In the Corbeanca case from the user’s context, the official execution included this expense, so it should not be removed.
  - **Other sub‑codes in 55.01 (internal transfers)** – Some lines under `55.01` relate to transfers to subordinate public institutions or other budgets.  These are internal to the consolidation perimeter.  The consolidation principle in Law 273/2006 means such internal transfers should be **eliminated** to avoid double counting, just like code 51.  The receiving institution’s expenses are counted instead.  However, if a transfer under code 55 goes to a beneficiary outside the consolidated budget (e.g., scholarships to students, payments to NGOs), it is a final expenditure and remains included.

### Summary of inclusion/exclusion rules

| Code (functional or economic) | Description / examples                                                             | Consolidation treatment at **UAT level**                                                                                                                | Legal/official source                                                                                                            |
| ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **04. ***                     | Shares of income‑tax allocated to local budgets                                    | Show in gross revenue but **exclude** from consolidated total (“se scad”) to avoid double counting                                                      | Budget classification marks code 04 “se scad”; Law 273/2006 includes them as transfers                                           |
| **11. ***                     | Shares of VAT allocated to local budgets                                           | Show in gross revenue but **exclude** from consolidated total (“se scad”)                                                                               | Budget classification marks code 11 “se scad”; Law 273/2006 includes them as transfers                                           |
| **36.05 (21.A.36.05.00)**     | Transfers of surpluses from subordinate institutions                               | **Exclude** (internal transfer)                                                                                                                         | MOF methodology notes that account 21.A.36.05.00 records surpluses from subordinate institutions                                 |
| **37.02.03 / 37.02.04**       | Transfers between operating and development sections                               | **Exclude** (internal movement; negative and positive entries cancel out)                                                                               | Sample execution report shows negative 37.02.03 and positive 37.02.04 entries cancelling each other                              |
| **47 ***                      | Sums in course of distribution (in treasury single account)                        | **Exclude** (transitory, not final revenue)                                                                                                             | MOF Order 1983/2025 states amounts in account 21.A.47.04.00 are distributed to proper revenue accounts and are not final revenue |
| **40***&**41***           | Financial operations (use of surplus, loans, repayments)                           | Report separately; exclude from operating revenue/expenditure totals                                                                                    | Execution forms show these under a separate “Operațiuni financiare” section                                                      |
| **42 ***                      | Subsidies from the state budget                                                    | **Include** in consolidated revenue (external transfers to the locality); eliminated only in national consolidation                                     | Law 273/2006 lists subsidies among local revenues                                                                                |
| **43 ***                      | Subsidies from other public administrations                                        | **Include** (same rationale as 42 *)                                                                                                                    | Law 273/2006                                                                                                                     |
| **51 ***                      | Transfers between public institutions (e.g., from city hall to subordinate school) | **Exclude** when consolidating the budgets of the ordonator principal with its subordinates; include only transfers outside the consolidation perimeter | Consolidation definition eliminates transfers between budgets                                                                    |
| **55.01.63**                  | Funding for accredited private or confessional schools                             | **Include** – final expenditure leaving the public sector                                                                                               | Government Decision 136/2016: local budgets provide this funding and private schools report its use                              |
| **Other 55 ***                | Other transfers                                                                    | **Exclude** if the recipient is a public institution within the consolidation perimeter; **include** if the recipient is outside the public sector      | Consolidation principle and Law 273/2006; classification depending on the line                                                   |

## Conclusion

Romanian public finance law requires local budgets to be consolidated by **eliminating transfers between budgets**.  Shares of state revenues (codes 04 and 11), internal transfers of surpluses (36.05), internal section virements (37.02), sums in distribution (47) and transfers between public institutions (51 and some 55 lines) are **internal movements** and must be excluded from consolidated totals.  Subsidies from the state and other administrations (42 and 43) and final transfers outside the public sector (e.g., funding private education under 55.01.63) are **external** and remain in consolidated figures.  Financial operations (40 */ 41*) are financing items reported separately and not part of operating revenue/expenditure.  Applying these rules ensures that each resource and expenditure is counted exactly once and aligns the platform’s data with official ANAF/MF execution reports.

<!-- @web-flow end id=response-20260111125221311-chatgpt -->

<!-- Conclusions -->
# Gemini Conclusions

<https://gemini.google.com/app/1631dfc1fcef23df>

Here is the technical methodology for calculating the Consolidated Local Budget execution for a Romanian UAT (Unitate Administrativ-Teritoriala), based on Legea 273/2006 and OMFP 1917/2005.

### Executive Summary

To match the official ANAF/Ministerul Finanțelor PDF totals:

1. **Revenues**: You must display **GROSS** totals for all external resources. Do **not** exclude shares of VAT (11.02) or Income Tax (04.02) at the UAT level. These are only eliminated during *national* consolidation, not local reporting.
2. **Expenses**: You must **INCLUDE** transfers to private entities (like 55.01.63). You should only exclude transfers to **public** institutions that are *within* the same budget hierarchy (to prevent double counting salaries/utilities paid by the subordinate).

---

### 1. REVENUES (Venituri)

**Methodology:** The "Total Venituri" in ANAF execution reports represents the total resources available to the UAT. While codes `04` and `11` are marked "se scad" in the classification (for national statistics), they **must be INCLUDED** in the UAT's total to reflect its actual budget envelope.

| Code Category | Classification | Treatment | Reason & Legal Basis |
| --- | --- | --- | --- |
| **03, 05, 07, 12, 16, 18, etc.** | Venituri proprii (Own revenues) | **INCLUDE** | Core fiscal revenues (taxes on buildings, vehicles, land). |
| **04.02.** * | Cote și sume defalcate din impozitul pe venit | **INCLUDE** | Represents cash transferred from State to Local budget. Although it is a transfer, it is a revenue source for the UAT. <br>

<br>*(Legea 273/2006 Art. 5)* |
| **11.02.** *| Sume defalcate din TVA | **INCLUDE** | Same as above. Excluding this usually causes massive discrepancies (often 30-50% of the budget). |
| **42.02.*** <br>

<br> **43.02.** *| Subvenții (Subsidies from State/Other Admins) | **INCLUDE** | External transfers received. Must be included to match ANAF "Total Venituri". |
| **37.02.03** | Vărsăminte din secțiunea de funcționare | **EXCLUDE / NET** | This is an internal movement between the Operating and Development sections. It appears as a **negative** value in operating and positive in development. The sum should be **0**. |
| **47.*** | Sume în curs de distribuire | **EXCLUDE** | Suspense accounts for money that does not belong to the UAT (funds in transit). |
| **40.** * <br>

<br> **41.** * | Operațiuni financiare | **SEPARATE** | Usually presented separately from "Total Venituri" (Total Revenues) in transparency portals, as these are financing items (loans, surplus), not income. However, check if ANAF bundles them in your specific PDF target. |

**Resolving your ~3.4M RON Revenue Discrepancy:**
The difference likely stems from **Subvenții (42.02 or 43.02)** or a specific **Sume defalcate (11.02)** line that you are excluding. Ensure you are summing **all** positive inflows except internal technical corrections.

---

### 2. EXPENSES (Cheltuieli)

**Methodology:** Consolidation requires eliminating **internal** transfers (to avoid counting the money once when transferred to a school, and again when the school pays a teacher). However, transfers to **external** entities (private schools, NGOs, churches) are final expenses and must be included.

| Code Category | Classification | Treatment | Reason & Legal Basis |
| --- | --- | --- | --- |
| **10, 20, 57, 59, 71** | Personnel, Goods, Social, Capital | **INCLUDE** | Real economic consumption. |
| **55.01.63** | Finanțarea învățământului particular sau confesional | **INCLUDE** | **Critical Fix:** The recipient is a **private** entity. The money leaves the public sector. Excluding this was the cause of your 2.19M RON error. <br>

<br>*(Ref: Norme metodologice, Govt Decision 136/2016)* |
| **55.01.18** <br>

<br> **55.01.42** | Alte transferuri curente interne | **CHECK** | Include ONLY if the recipient is external (e.g., NGO). If the recipient is a subordinate public institution, exclude. |
| **51.01** | Transferuri către instituții publice | **EXCLUDE** | **Consolidation Rule:** This money goes to a subordinate institution (e.g., a school). You should count the *school's* actual expenses (salaries/goods) instead of this transfer line. |
| **51.02** | Transferuri de capital | **EXCLUDE** | Same logic. Exclude the transfer; count the actual investment made by the subordinate. |
| **85.01** | Plăți efectuate în anii precedenți și recuperate | **SUBTRACT** | These are usually negative values correcting past expenses. Include them as they reduce the total. |

---

### Detailed Calculation Methodology for Transparency Platforms

To correctly calculate the **Local Consolidated Budget (Bugetul Local Consolidat)**, you must follow the "Ordonator Principal" logic defined in **Legea 273/2006 (Public Local Finance Law)**.

#### 1. The Principle of Consolidation

The law defines consolidation as "the operation of eliminating transfers of sums between budgets to avoid double counting" (Art 2, pct 15).

- **Vertical Consolidation (Hierarchical):** When you present the budget of a City Hall (Primaria), you are aggregating the City Hall's own budget + the budgets of all subordinate institutions (Schools, Cultural Centers, etc.).
- **The Elimination:**
- The City Hall sends 1M RON to a School (Code `51.01` in City Budget).
- The School receives 1M RON (Code `43.10` in School Budget).
- The School spends 1M RON on Salaries (Code `10` in School Budget).
- **Correct Consolidated Total:** 0 RON (Transfer) + 1M RON (Salaries) = **1M RON Real Expense**.
- **Your Platform's Calculation:** Sum all expenses of the UAT and its subordinates, but **exclude** any expenditure code starting with **51.01** or **51.02**.

#### 2. The Trap of "External" Transfers (The Corbeanca Case)

The confusion arises with **Code 55.01 (Alte transferuri)**.

- Unlike Code 51 (which is strictly between public administrations), Code 55 mixes internal and external transfers.
- **Code 55.01.63** is for *private* or *confessional* education. Since these entities are **not** public institutions and are **not** part of the budget consolidation perimeter, the transfer cannot be eliminated. It acts as a final expense (similar to a subsidy or a service payment).
- **Rule of thumb:** If the money flows to an entity that does *not* report its own execution into the FOREXEBUG system under this UAT, it is a **Real Expense**.

#### 3. Matching ANAF PDFs

ANAF PDFs (e.g., generated via Forexebug) typically present the **Execution of the Local Budget** (Execuția Bugetului Local).

- **Revenues:** They show the SUM of all revenue sources. They do NOT eliminate the amounts received from the State Budget (VAT/Income Tax splits). If you exclude these, you are showing "Venituri Proprii" (Own Revenues), not "Total Venituri". **Recommendation:** Label your total "Total Venituri (Inclusiv Sume Defalcate)" and match ANAF.
- **Expenses:** They show the SUM of all final expenses. They generally include Code 55.01.63.

#### 4. Summary Algorithm

For a given UAT (e.g., Corbeanca):

1. **Fetch data** for the UAT and all its subordinates.
2. **Calculate Revenue:** `SUM(All Revenues)` - `SUM(Code 37.*)` - `SUM(Code 47.*)` - `SUM(Code 43.* ONLY IF it comes from the UAT itself)`.

- *Note: Safest is to sum all positive revenue lines found in the ANAF report, as the PDF is already a summary.*

1. **Calculate Expenses:** `SUM(All Expenses)` - `SUM(Code 37.*)` - `SUM(Code 51.01)` - `SUM(Code 51.02)`.

- **Crucial:** Do **NOT** subtract `55.01.63`.

---

# ChatGPT Conclusions

## Scope and baseline legal principles (what “local consolidated budget” means)

For a **single UAT (commune/city/county) as ordonator principal de credite (OPC)**, the law distinguishes:

- **Individual budgets** (UAT budget + budgets of subordinate institutions, etc.) that are executed and reported **in gross**; and
- The **“bugetul general al UAT”** obtained by **cumulating** those budgets **and then consolidating** them by **eliminating transfers of sums between the budgets** so you don’t double-count the same money inside the UAT perimeter.

Key anchors:

- **Consolidation definition**: *“consolidare = operaţiunea de eliminare a transferurilor de sume dintre bugetele prevăzute la art. 1 alin. (2), în vederea evitării dublei evidenţieri”*.
- **UAT “buget general”**: budgets under art. 1(2) (local budget, subordinate institutions’ budgets, own-revenue institutions, loans, external funds) cumulated at UAT level and, **after consolidation** by eliminating transfers between budgets, it reflects the UAT’s public financial effort.
- **Universality / gross recording**: *“Veniturile şi cheltuielile se includ în buget în totalitate, în sume brute.”*
- **Local revenue composition** includes (explicitly): own revenues (including **cote defalcate din impozitul pe venit**), **sume defalcate** from state budget revenues, **subvenţii** from state and other budgets, and donations/sponsorship.

Implication for your platform:

- **Gross totals** are correct for **an individual reporting unit** (OPC alone / each subordinate alone).
- **Consolidated totals** are correct for **OPC + subordinates aggregated**, but only if you eliminate **intra-perimeter transfers** (not “all transfers by code”).

---

## A. Total income (Venituri) — codes to include/exclude for a **consolidated UAT** view

### 1) Reference: how “TOTAL VENITURI” is computed in the standard execution form (gross, per reporting unit)

The standard “Contul de execuție – Venituri” form computes **VENITURI – TOTAL** as:
**00.02 + 00.15 + 00.16 + 00.17 + 45.02 + 46.02 + 47.02 + 48.02**.

This is the **gross** total per reporting unit (OPC or subordinate).

### 2) Consolidated UAT rule (what changes when you aggregate OPC + subordinates)

When you build a **UAT consolidated** view (OPC + subordinates), you apply Law 273 consolidation: **eliminate transfers of sums between the budgets included in the perimeter** to avoid double counting.

That means:

- Do **not** exclude categories just because they “look like transfers” (e.g., state subsidies).
- Do eliminate only those revenues that are the **mirror** of an expense transfer inside the same UAT perimeter.

### Revenue table (UAT consolidated totals)

| Revenue code / family    | Official label (where available)                                                                        |                                           Use in **UAT consolidated total income** | Consolidation logic (why)                                                                                                                                                                                                                           | Legal / official reference                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **04.***                 | “Cote şi sume defalcate din impozitul pe venit (se scad)”                                               |                     **INCLUDE** (as revenue coming from outside the UAT perimeter) | Although marked “se scad” in classification, **it is still a UAT revenue** and doesn’t create double-counting *inside* OPC+subordinates. It would be eliminated only in a broader consolidation where the **state budget** is inside the perimeter. | Classification shows 04.00 “(se scad)”.  Local revenue composition includes “cote defalcate din impozitul pe venit”.  Consolidation eliminates transfers **between budgets in the consolidation set**. |
| **11.02.***              | “Sume defalcate din taxa pe valoarea adăugată (se scad)”                                                |                                                                        **INCLUDE** | Same reasoning: it is a transfer from outside the OPC+subordinates set (state → local). Excluding it understates UAT resources and will not match gross execution totals.                                                                           | 11.02 “(se scad)” in classification.  Local revenues include “sume defalcate din unele venituri ale bugetului de stat”.                                                                                |
| **42.***                 | “Subvenţii de la bugetul de stat”                                                                       |                                                                        **INCLUDE** | Subventions are explicitly part of local revenues; they are not intra-UAT transfers (sender is state).                                                                                                                                              | 42.02 label.  Local revenues include “subvenţii primite de la bugetul de stat şi de la alte bugete”.                                                                                                   |
| **43.***                 | “Subvenţii de la alte administraţii” (includes subventions received from other local budgets)           |                           **INCLUDE**, **EXCEPT** eliminate the **intra-UAT** ones | 43.* is a **mixed bucket**: some are from outside the UAT (keep), some may be from another budget **inside** the UAT perimeter (eliminate to avoid double counting).                                                                                | 43.02 label and examples incl. “subvenţii primite de la alte bugete locale…”  Consolidation rule (eliminate transfers between budgets to avoid double evidence).                                       |
| **36.02.05**             | “Vărsăminte din veniturile şi/sau disponibilităţile instituţiilor publice”                              |              **ELIMINATE** when the paying institution is inside the UAT perimeter | In OPC+subordinates aggregation, this is typically an **internal settlement** (institution → UAT). Keeping it would double-count because the institution’s money is already captured in its own budget lines.                                       | 36.02.05 label.  Consolidation definition.                                                                                                                                                             |
| **36.02.50**             | “Alte venituri”                                                                                         |                                                                        **INCLUDE** | Not an internal transfer by definition; it’s a miscellaneous revenue bucket. Must be included in gross totals; exclude only if you can prove it is an intra-perimeter transfer (rare; usually not).                                                 | 36.02.50 label.  Universality principle (revenues included in full, gross).                                                                                                                            |
| **37.02.03**             | “Vărsăminte din secţiunea de funcţionare pentru finanţarea secţiunii de dezvoltare … (cu semnul minus)” |             **INCLUDE with sign** (negative) **OR** exclude together with 37.02.04 | This is **not new income**; it is an internal movement between budget sections. If you sum absolute values or drop negatives, totals become wrong.                                                                                                  | Execution form label + “cu semnul minus”.  Sections defined in Law 273 (secţiune de funcţionare / dezvoltare).                                                                                         |
| **37.02.04**             | “Vărsăminte din secţiunea de funcţionare”                                                               |             **INCLUDE with sign** (positive) **OR** exclude together with 37.02.03 | Counterpart of 37.02.03; same rule.                                                                                                                                                                                                                 | Execution form label.                                                                                                                                                                                  |
| **21.A.47.04.00 / 47.*** | “Sume încasate … în contul unic … în curs de distribuire”                                               | Recommended: **SHOW SEPARATELY** and exclude from “final income” until distributed | This is a transit mechanism: order explains these are **in curs de distribuire** and must be transferred to proper revenue accounts by year-end / early January. Counting as final revenue can distort totals.                                      | OMF 1983/2025 notes on 21.A.47.04.00 and distribution deadlines.                                                                                                                                       |

**Practical enforcement rule for your platform (revenues):**
For a consolidated UAT total, **do not blanket-exclude** 04.*, 11.*, 42.*, 43.* (these are real UAT revenues under Law 273).
Instead, eliminate only the **intra-perimeter** ones (typically 36.02.05 and the internal portion of 43.*), consistent with the statutory definition of consolidation.

---

## B. Total expenses (Cheltuieli) — codes to include/exclude for a **consolidated UAT** view

### 1) Reference: “TOTAL CHELTUIELI” in the standard execution form (gross, by functional chapters)

One standard “Contul de execuție – Cheltuieli” form expresses total as:
**50.02 + 59.02 + 63.02 + 70.02 + 74.02 + 79.02**.

That is a **gross** per reporting unit (OPC or subordinate).

### 2) Consolidated UAT rule (what changes when aggregating OPC + subordinates)

Same statutory consolidation rule: **eliminate transfers of sums between budgets inside the consolidation perimeter**.

### Expenses table (UAT consolidated totals)

| Expense economic code / family                                  | Official label                                                                     |                                      Use in **UAT consolidated total expenses** | Consolidation logic (why)                                                                                                                                                                                                                                                                                                  | Legal / official reference                                                                                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **51** (incl. 51.01, 51.02)                                     | “TITLUL VI TRANSFERURI ÎNTRE UNITĂŢI ALE ADMINISTRAŢIEI PUBLICE (cod 51.01+51.02)” | **ELIMINATE only the intra-UAT ones** (OPC → subordinate that is also included) | These are explicit **inter-budget transfers**. When sender and receiver are both in the consolidated set, keeping both creates double counting (expense at sender + revenue at receiver). Transfers to entities outside the perimeter remain real consolidated spending and should stay.                                   | Economic classification shows Title VI / 51.  Consolidation definition (eliminate transfers between budgets to avoid double evidence).                                        |
| **51.01.01**                                                    | “Transferuri către instituţii publice”                                             |                      **ELIMINATE** when recipient is a consolidated subordinate | This is the typical line used when OPC funds a public institution (e.g., school) that may also appear in your aggregated dataset.                                                                                                                                                                                          | 51.01.01 label.  Consolidation definition.                                                                                                                                    |
| **55.01.63**                                                    | “Finanţarea învăţământului particular sau confesional acreditat”                   |                                                  **INCLUDE (do not eliminate)** | This is not an intra-UAT budget-to-budget transfer. It is a **final expenditure** financing accredited private/confessional education units; excluding it understates real UAT spending.                                                                                                                                   | HG 136/2016 explicitly states these transfers are reflected in the local authority’s budget at indicator **55.01.63**.  Also universality principle: expenses included gross. |
| **55.01.*** (other)                                             | “Transferuri interne” (varies)                                                     |                                                                **CASE-BY-CASE** | Do **not** blanket-exclude Title 55: some are internal program transfers, some are final transfers outside the UAT budget perimeter. Only eliminate those that are actually intra-perimeter budget-to-budget transfers.                                                                                                    | Classification shows Title 55 includes “Transferuri interne” (range shown in the template).  Consolidation rule: eliminate transfers only **between budgets in the set**.     |
| **All other expense titles (10, 20, 30, 40, 57, 59, 70, etc.)** | Personnel, goods/services, subsidies, social assistance, capital, etc.             |                                                                     **INCLUDE** | These represent real spending for goods/services, wages, subsidies, investments. The default rule under universality is to include them gross; consolidation elimination applies only when they are a transfer between consolidated budgets (which is usually captured under Title 51/selected 55, not under wages/goods). | Execution template groups “CHELTUIELI CURENTE” and shows that 51 and 55 are specific transfer titles among others.  Universality principle.                                   |

---

## C. Detailed methodology to calculate a **UAT consolidated local budget** (income + expenses)

### Step 1 — Define the consolidation perimeter (which entities/budgets are “inside”)

Per Law 273, the UAT-level cumulation includes budgets referenced at art. 1(2) (local budgets, subordinate institutions financed from local budgets, institutions financed from own revenues, loans, external funds).
In practice, the reporting framework also treats UAT + subordinate institutions as reporting units (e.g., execution forms are filled by UAT and subordinate institutions financed from local budgets; detailed economic execution is in Anexa 7).

**Platform implementation:** keep a definitive list for each UAT of:

- OPC entity;
- all subordinate institutions you aggregate (schools, cultural institutions, social assistance units, etc.).

### Step 2 — Compute **gross totals per entity** (do not net inside a single entity)

Because of **universality**, each entity’s budget execution is gross: “veniturile şi cheltuielile se includ … în totalitate, în sume brute.”
So for each entity (OPC and each subordinate), compute:

- **Gross revenue total** using the standard “VENITURI – TOTAL” structure (00.02+00.15+00.16+00.17+45.02+46.02+47.02+48.02).
- **Gross expenses total** per execution form (functional sum shown in the form).

**Critical technical rule:** preserve the **sign** of entries like 37.02.03 which is explicitly “cu semnul minus”.
Dropping negatives or summing absolute values is a common cause of mismatches.

### Step 3 — Identify intra-perimeter transfers that must be eliminated (the core of consolidation)

By definition, **consolidation = eliminating transfers of sums between the budgets in the perimeter to avoid double counting**.

So, when OPC funds a subordinate that is included in your aggregated dataset:

- Outgoing appears in OPC expenses typically under **economic title 51** (e.g., 51.01.01 “Transferuri către instituţii publice”).
- Incoming appears in the subordinate’s revenues often under **43.*** (“Subvenţii de la alte administraţii”) or similar “subvenţii pentru instituţii publice” subcodes, depending on the specific budget/report.

**Consolidation elimination rule:** remove **both sides** of the internal transfer from the consolidated totals:

- Subtract the internal-transfer amount from consolidated **expenses** (to avoid counting the transfer as “spending”)
- Subtract the same amount from consolidated **revenues** (to avoid counting the same money again as “income” to the subordinate)

This matches the legal purpose: avoiding “dubla evidenţiere”.

### Step 4 — Treat common “problem codes” correctly in consolidation

1. **Do not eliminate real external revenues** (even if they look like transfers)

- **04.***(income tax shares), **11.*** (VAT defalcated), **42.*** (state subsidies) are part of local revenues in law and are external to the OPC+subordinates perimeter.

1. **Eliminate 36.02.05 only when it is internal**

- 36.02.05 is explicitly “vărsăminte … instituţiilor publice”; if those institutions are in your aggregate, it’s internal and should be eliminated.

1. **Do not eliminate 55.01.63**

- HG 136/2016 explicitly anchors this expenditure indicator in the **local authority’s** budget as a transfer financing accredited private/confessional units; it is not an intra-UAT budget mirror and should remain in consolidated expenses.

1. **Handle section-transfer codes (37.02.03/37.02.04) as internal movements, not new resources**

- They represent movements between “secţiune de funcţionare” and “secţiune de dezvoltare,” which are defined in Law 273.
- The reporting line explicitly marks 37.02.03 as negative; preserve sign or exclude both legs.

1. **Treat “in curs de distribuire” (47 / 21.A.47.04.00) as in-transit**

- OMF 1983/2025 describes 21.A.47.04.00 as sums in a **distribution pipeline**, with explicit rules/term for distribution to the correct revenue accounts.
- Best practice in a transparency product: show as “in transit” separately from “final revenue” (or exclude from final total until distributed).

### Step 5 — Output both views (recommended for transparency + auditability)

Even if your product emphasizes a consolidated figure, it is best to publish **two totals**:

- **Gross totals (per entity)**: match execution forms, consistent with universality (“sume brute”).
- **Consolidated totals (UAT aggregate)**: sum gross totals across OPC+subordinates, then **eliminate intra-perimeter transfers** (primarily Title 51/selected 43 + 36.02.05 mirrors).

This structure also makes complaints easier to resolve: any discrepancy can be traced to (a) sign handling, or (b) incorrect classification of an item as “internal transfer” vs “external resource / final spending”.

---

## Summary: minimal ruleset you can implement

### Consolidated **Total Income**

Start with **all revenue lines**, then:

1. **Keep** 04.*, 11.*, 42.*, and the external part of 43.* (external revenues).
2. **Eliminate** internal revenues that are *mirrors of internal transfers*, especially:

   - 36.02.05 when the source institution is inside the UAT perimeter.
   - the **internal portion** of 43.* when the sender is inside the perimeter.
3. Preserve signs for 37.02.03/04 (or exclude both legs).
4. Consider separating/excluding 47 / 21.A.47.04.00 as “in transit.”

### Consolidated **Total Expenses**

Start with **all expense lines**, then:

1. **Eliminate only intra-perimeter transfers**, mainly:

   - economic Title **51** (and subcodes like 51.01.01) when recipient is inside the UAT perimeter.
2. **Never eliminate 55.01.63** (it is final spending mandated to be recorded in local budget).
3. Do not blanket-exclude Title 55; apply the same “inside perimeter?” test.

If you want, I can convert the above into an explicit deterministic mapping spec for your database (e.g., “transferFilter=no-transfers” vs “consolidated internal transfers elimination”) using the same code families but with “inside perimeter” conditions spelled out.

<!-- End of conclusions-->