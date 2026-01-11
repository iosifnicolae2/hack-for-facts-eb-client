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
{"chatUrl":"<https://claude.ai/chat/f1e9c5dd-47e1-4e6f-8a72-1a6ecd4c60ae"}>
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
{"chatUrl":"<https://chatgpt.com/c/69639a41-5984-832a-b905-1f18564b5945"}>
<!-- @web-flow end id=response-20260111125221311-chatgpt -->

<!--
@web-flow begin
kind: response
status: completed
provider: claude
id: response-20260111131610882-claude
prompt_id: prompt-20260111125212490
timestamp: "2026-01-11T13:16:10.882Z"
schema: web-flow/research/v1
version: 1
-->
# Romanian local budget execution methodology: what UAT transparency platforms should include\n\n**Your platform should show GROSS totals to match ANAF PDFs.** The key finding is that the code 55.01.63 exclusion is incorrect—transfers to private/confessional schools represent real expenses leaving the public sector, not internal consolidation items. ANAF reports use gross (non-consolidated) figures, and transparency platforms should match this methodology for comparability with official documents.\n\nThe **2,192,500 RON expense discrepancy** directly corresponds to incorrectly excluding economic code 55.01.63. The **~3.4M RON revenue discrepancy** likely stems from incorrect exclusion of certain transfers received that should count as real revenue.\n\n## Legal framework establishes gross reporting as standard\n\nRomanian public finance law provides clear guidance on budget consolidation. **Legea 273/2006 Art. 2, pct. 15** defines consolidation as *\"operațiunea de eliminare a transferurilor de sume dintre bugetele prevăzute la art. 1 alin. (2), în vederea evitării dublei evidențieri a acestora\"*—the elimination of transfers between budgets within the same administrative hierarchy to avoid double-counting.\n\nCritically, **Legea 273/2006 Art. 7** establishes the *universality principle*, requiring that *\"veniturile și cheltuielile se includ în buget în totalitate, în sume brute\"* (revenues and expenses are included in full, in gross amounts). This principle means ANAF's FOREXEBUG system generates reports showing gross execution at the \"ordonator principal de credite\" level.\n\n**Legea 500/2002 Art. 3 alin. (1)** clarifies that consolidation applies when calculating *total national* budget execution to show the \"dimension of public financial effort\"—not when presenting individual UAT budget execution. The key distinction: consolidation eliminates **inter-budget transfers within the public sector**, not transfers to external entities.\n\n## Revenue codes: what to include and exclude\n\nBased on the regulatory framework and classification standards from **OMFP 1954/2005**, here is the definitive treatment for revenue codes:\n\n**INCLUDE in total revenues (real external receipts):**\n\n| Code | Description | Rationale |\n|------|-------------|-----------|\n| fn:04.02.*| Cote și sume defalcate din impozitul pe venit | External transfer from state budget |\n| fn:11.02.* | Sume defalcate din TVA (all subcodes including 11.02.09) | External transfer from state budget |\n| fn:36.02.50 | Alte venituri | Real miscellaneous revenue, not double-counting |\n| fn:40.02.*| Operațiuni financiare - Încasări din rambursarea împrumuturilor | Financial operations |\n| fn:41.02.* | Alte operațiuni financiare | Financial operations |\n| fn:42.02.*| Subvenții de la bugetul de stat | Real transfers from state budget |\n| fn:43.02.* | Subvenții de la alte administrații | Real transfers from other public administrations |\n\n**EXCLUDE or handle specially:**\n\n| Code | Description | Treatment |\n|------|-------------|-----------|\n| fn:37.02.03 | Vărsăminte din secțiunea de funcționare pentru finanțarea secțiunii de dezvoltare | **Show as NEGATIVE value**—internal transfer between operating and development sections |\n| fn:47.02.*| Sume în curs de distribuire | **EXCLUDE**—temporary amounts awaiting distribution, marked \"X\" in official forms |\n\nThe \"se scad\" items in Romanian budget classification indicate amounts to subtract. These appear with negative signs in official reports and should be treated as subtractions, not excluded entirely.\n\n## Expense codes: the 55.01.63 question resolved\n\nThe treatment of expense codes depends critically on whether the recipient is **within or outside** the UAT's budgetary hierarchy.\n\n**Code 55.01.63 should be INCLUDED as a real expense.** This represents \"Finanțarea învățământului particular sau confesional acreditat\"—financing of accredited private or confessional education. The recipient institutions (private schools) are **external entities**, not subordinate public institutions within the UAT structure. Per **Legea 421/2023** and **Legea 9/2025**, these funds flow: State budget → TVA splits (code 11.02.09) → Local budget → Private schools (terminal recipient). The money **leaves the public sector entirely**.\n\n**Include in totals (real expenses):**\n\n| Code | Description | Rationale |\n|------|-------------|-----------|\n| ec:55.01.63 | Finanțarea învățământului particular sau confesional | Terminal transfer to external private entity |\n| All standard operating/capital expenses | Various | Core budget execution items |\n\n**Exclude only in consolidated views (internal public sector transfers):**\n\n| Code | Description | When to exclude |\n|------|-------------|-----------------|\n| ec:51.01 | Transferuri curente către instituții publice subordonate | Only when consolidating with subordinate institution budgets |\n| ec:51.02 | Transferuri de capital către instituții subordonate | Only when consolidating with subordinate institution budgets |\n\nThe distinction is crucial: transfers to **subordinate public institutions** (like municipal schools, cultural centers) are internal movements that would be eliminated in a consolidated view. Transfers to **external entities** (like private schools under 55.01.63) represent real public expenditure regardless of consolidation level.\n\n## ANAF methodology uses gross figures\n\nANAF's budget execution PDF reports generated through the **FOREXEBUG national reporting system** show **gross (non-consolidated) totals**. The system collects data from over 14,000 public entities and generates reports at COFOG3 detail level.\n\nStandard ANAF report types include:\n- **FXB-EXB-900**: Budget execution at individual entity level\n- **FXB-EXB-901**: Aggregated at Principal Credit Ordinator (OPC) level\n\nWhen ANAF sums revenues or expenses for a UAT, transfers between budget entities within that UAT are **not automatically eliminated**. This means if a commune transfers 100,000 lei to a subordinate school, the gross total shows both the expense (from commune) and the revenue (at school)—consolidated would show only 100,000 lei.\n\nThe Court of Accounts (Curtea de Conturi) audit report on FOREXEBUG confirms this methodology: *\"Forexebug does not automatically perform consolidation at local level.\"* Consolidation is performed separately when preparing consolidated financial statements, not in standard budget execution reports.\n\n## Resolving the Corbeanca discrepancies\n\n**Expense discrepancy (2,192,500 RON):** Your platform incorrectly excludes code 55.01.63. This exact match confirms the issue. **Solution: Include code 55.01.63 in expense totals**—it represents real payments to private/confessional schools, not internal transfers.\n\n**Revenue discrepancy (~3.4M RON):** Likely caused by one or more of:\n- Incorrect exclusion of \"sume defalcate\" that should count as real revenue\n- Incorrect treatment of section transfers (37.02.03/37.02.04)\n- Timing differences in recognition of transfers received\n- Possible exclusion of subsidies (42.02.* or 43.02.*) that should be included\n\nTo diagnose the revenue discrepancy precisely, compare your platform's revenue breakdown code-by-code against the ANAF PDF to identify which specific codes are being excluded.\n\n## Recommendation: match ANAF for transparency\n\nFor a transparency platform, **matching ANAF's gross methodology is strongly recommended** for several reasons:\n\n- **Legal compliance**: Legea 273/2006 Art. 7 requires gross amounts\n- **Audit consistency**: Curtea de Conturi audits against official execution reports\n- **User expectations**: Citizens comparing platform data with official PDFs expect matching totals\n- **Comparability**: Other official platforms (transparenta-bugetara.gov.ro, data.gov.ro) use gross figures\n\nIf you wish to also present consolidated views for analytical purposes, offer them as a secondary option with clear labeling: \"Date consolidate\" with an explanation of which transfers were eliminated and a link to gross totals.\n\n## Conclusion\n\nThe core finding is that your platform's methodology incorrectly treats code 55.01.63 as an internal consolidation item when it represents real external expenditure. **Include 55.01.63 in expense totals.** For revenues, include all \"sume defalcate\" (04.02.*, 11.02.*), subventions (42.02.*, 43.02.*), and other external transfers. Only exclude fn:47.02.* (temporary distribution amounts) and show fn:37.02.03 as a negative value for section transfers.\n\nThe legal basis for gross reporting is **Legea 273/2006 Art. 7** (universality principle) and **OMFP 1954/2005** (classification standards). Matching ANAF's FOREXEBUG methodology ensures your platform provides comparable, verifiable data that citizens can cross-reference with official documents."}
<!-- @web-flow end id=response-20260111131610882-claude -->
