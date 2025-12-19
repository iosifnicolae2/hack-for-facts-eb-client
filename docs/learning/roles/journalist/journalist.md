# Curriculum: Investigative Budget Journalism in Romania

### From Data to Accountability Stories

---

## Choose Your Learning Path

Not sure where to start? Pick a path based on your experience:

| Path | Your Goal | Modules | Time |
|------|-----------|---------|------|
| **Foundations** | "I'm new to budget reporting" | [1](#module-1-the-journalists-mindset), [2](#module-2-anatomy-of-romanian-public-finance), [3](#module-3-the-classification-system) | 2 hours |
| **Data Hunter** | "I want to find stories in data" | [4](#module-4-primary-data-sources), [5](#module-5-mastering-foia), [6](#module-6-working-with-budget-data-at-scale) | 3 hours |
| **Investigator** | "I have a lead to pursue" | [7](#module-7-finding-stories-in-budget-data), [8](#module-8-red-flags-and-patterns), [9](#module-9-the-investigation-workflow) | 3 hours |
| **Specialist** | "I need sector expertise" | [11](#module-11-eu-funds-investigation), [12](#module-12-local-government-deep-dive), [13](#module-13-health-and-education-budgets) | 3 hours |
| **Complete Course** | "I want full mastery" | All modules (1-17) | 15-20 hours |

---

## Transparenta.eu — Your Investigation Toolkit

Throughout this curriculum, you'll use these platform features:

| Feature | What it does | Investigation use |
|---------|--------------|-------------------|
| **Budget Explorer** | Interactive treemap of spending | Find anomalies in allocation patterns |
| **Entity Analytics** | Compare institutions side-by-side | Benchmark suspicious entities against peers |
| **Map** | Geographic view by region | Identify regional disparities |
| **Alerts** | Monitor entities for changes | Track subjects during investigation |
| **Classifications** | Decode budget codes | Understand what budget lines mean |
| **Search** | Query millions of budget records | Find specific transactions |

---

## Part I: Foundations

---

## Module 1: The Journalist's Mindset

**Learning objective:** Develop the investigative approach to public money.

### Core principles

| Principle | What it means |
|-----------|---------------|
| **Follow the money, not rhetoric** | Politicians announce; budgets reveal. The gap between press releases and budget lines is where stories live |
| **Think in systems** | One suspicious contract is a tip; patterns across institutions are investigations |
| **Assume incompetence first** | Most anomalies stem from poor planning, not theft — but incompetence can mask corruption |
| **Persistence + data = advantage** | Most journalists stop at the press release; budget documents are public but underutilized |

### Ethical framework

- **Public interest** — Justify every investigation
- **Proportionality** — Match scrutiny to significance
- **Right of reply** — Always give subjects opportunity to respond
- **Source protection** — Guard those who trust you with information

> **Try it on Transparenta.eu:**
> Open the [Budget Explorer](/budget-explorer) and compare any ministry's *approved* budget vs. *executed* spending. The gap between planning and reality is often where stories begin.

**Key Takeaways:**

- Budget data lets you verify claims, not just report them
- Patterns matter more than isolated incidents
- Your competitive advantage is willingness to dig into documents others ignore

---

## Module 2: Anatomy of Romanian Public Finance

**Learning objective:** Master the structure of public money flows.

### The Consolidated General Budget

```
┌─────────────────────────────────────────────────────────────┐
│            BUGETUL GENERAL CONSOLIDAT                       │
│                  (~40-44% of GDP)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  BUGETUL DE STAT │  │ BUGETELE LOCALE  │                │
│  │  (State Budget)  │  │ (~3,180 units)   │                │
│  │                  │  │                  │                │
│  │  • Ministries    │  │  • 41 Counties   │                │
│  │  • Central       │  │    + Bucharest   │                │
│  │    agencies      │  │  • 103 Municipal.│                │
│  │  • Transfers     │  │  • 217 Towns     │                │
│  └──────────────────┘  │  • ~2,861 Communes│               │
│                        └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  SOCIAL INSURANCE│  │  HEALTH FUND     │                │
│  │  BUDGET (BASS)   │  │  (FNUASS)        │                │
│  │                  │  │                  │                │
│  │  • Pensions      │  │  • CNAS          │                │
│  │  • Unemployment  │  │  • Hospitals     │                │
│  │  • Sick leave    │  │  • Drugs         │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  ┌──────────────────────────────────────────┐              │
│  │  SPECIAL FUNDS & OTHER BUDGETS           │              │
│  │  • Road Fund, Environment Fund           │              │
│  │  • State-owned enterprises               │              │
│  │  • Self-financed institutions            │              │
│  └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### Key actors and documents

| Actor | Role | Documents for investigation |
|-------|------|----------------------------|
| Ministry of Finance | Coordinates, consolidates | Budget laws, execution reports, fiscal strategy |
| Line ministries | Sectoral spending | Own budgets, procurement, activity reports |
| Local governments | ~3,180 autonomous budgets | Local budgets, HCL decisions |
| Curtea de Conturi | Post-hoc audit | Annual reports, thematic audits |
| Treasury (Forexebug) | Payment execution | Real-time execution data |
| ANAF | Revenue collection | Tax statistics |

### Critical context: Romania's fiscal position

| Metric | 2024 Value | EU Average | Story angle |
|--------|------------|------------|-------------|
| Spending/GDP | ~43.5% | ~49% | Not a "big spender" |
| Revenue/GDP | ~34.1% | ~46% | Collection crisis |
| Deficit | ~9.3% | ~3% limit | Unsustainable |

> **Try it on Transparenta.eu:**
> Use the [Map](/map) view to see how spending varies across Romania's 42 county-level units. Look for outliers — both high and low.

**Key Takeaways:**

- Romania spends moderately but collects poorly — the deficit story is about revenue, not excess spending
- ~3,180 local administrative units each produce budget data you can analyze
- Understanding money flows helps you trace funds from source to final use

---

## Module 3: The Classification System

**Learning objective:** Read any budget line like a native speaker.

### The three-dimensional classification

| Dimension | Question | Example |
|-----------|----------|---------|
| **Organizational** | WHO spends? | Ministerul Educației → ISJ Sibiu → Liceul X |
| **Functional** | FOR WHAT purpose? | 65.02.04.01 = Secondary education |
| **Economic** | WHAT TYPE of spending? | 71.01.01 = Construction |

### Functional codes (COFOG-adapted)

| Code | Category | Investigation angles |
|------|----------|---------------------|
| 51 | Public authorities | Administrative bloat, political staffing |
| 54 | Other public services | Debt transactions, transfers |
| 61 | Public order | Police spending, justice system |
| 65 | Education | Per-pupil spending, infrastructure |
| 66 | Health | Hospital funding, drug procurement |
| 68 | Social protection | Benefits distribution, fraud |
| 70 | Housing, utilities | Local development, contracts |
| 74 | Environment | Waste management, pollution |
| 80 | Economic affairs | Subsidies, state aid |
| 84 | Transport | Infrastructure projects |

### Economic codes (what type of spending)

```
TITLU (Title) — Major category
    └── ARTICOL (Article) — Subcategory
            └── ALINEAT (Line item) — Specific type

Key codes to memorize:

TITLU 10 — Personnel (salaries, bonuses)
    ├── 10.01 — Cash salaries
    │       ├── 10.01.01 — Base salaries
    │       └── 10.01.06 — Bonuses
    └── 10.03 — Contributions

TITLU 20 — Goods & Services
    ├── 20.01 — Operating costs
    │       ├── 20.01.03 — Utilities
    │       └── 20.01.30 — Other (watch this!)
    └── 20.30.30 — Other expenses (opacity flag)

TITLU 71 — Capital Investments
    ├── 71.01 — Construction
    ├── 71.02 — Equipment
    └── 71.03 — Furniture, IT

TITLU 81 — Loan Repayments
```

### Decoding exercise

```
65.02.04.01 | 71.01.01 | Credite bugetare: 500.000 lei
│  │  │  │    │  │  │
│  │  │  │    │  │  └─ Sub-article: Construction
│  │  │  │    │  └──── Article: Fixed assets
│  │  │  │    └─────── Title 71: Capital investments
│  │  │  └──────────── High schools
│  │  └─────────────── Secondary education
│  └────────────────── Local budget indicator
└───────────────────── Education function
```

**Translation:** 500,000 lei allocated for construction at a high school (local budget).

> **Try it on Transparenta.eu:**
> Use the [Classification Explorer](/classifications/functional/) to look up code 65.02 and explore all education subcategories. Then search for a specific school in [Entity Analytics](/entity-analytics) to see how this translates to real spending.

**Key Takeaways:**

- Every budget line tells you WHO spent, FOR WHAT, and WHAT TYPE
- Code 20.30.30 ("other expenses") often hides details worth investigating
- Code 71 (investments) with low execution rates signals capacity problems or political priorities

---

## Part II: Data Sources & Access

---

## Module 4: Primary Data Sources

**Learning objective:** Know where every piece of budget data lives.

### Tier 1: Official publications (always available)

| Source | URL | What you get | Update frequency |
|--------|-----|--------------|------------------|
| Monitorul Oficial | monitoruloficial.ro | Budget laws, HG, OUG | Real-time |
| Ministry of Finance | mfinante.gov.ro | National execution, fiscal reports | Monthly/Quarterly |
| Local government sites | Various | Local budgets, HCL | Varies widely |
| SEAP/SICAP | e-licitatie.ro | All public procurement | Real-time |
| Curtea de Conturi | curteadeconturi.ro | Audit reports | Annual + thematic |

### Tier 2: Structured data systems

| System | What it contains | Access method |
|--------|------------------|---------------|
| **Forexebug** | Real-time treasury execution | Limited public; detailed via FOIA |
| **SICAP** | Procurement data, contracts | Public search + API |
| **e-consultare.gov.ro** | Draft legislation, consultations | Public |
| **Registrul Datoriei Publice** | Public debt details | Ministry of Finance |

### Tier 3: Aggregated sources

| Source | Coverage | Best for |
|--------|----------|----------|
| **Transparenta.eu** | Budget execution records | Cross-institution analysis |
| **Expert Forum** | Thematic analyses | Context, interpretation |
| **EU Open Data Portal** | cohesiondata.ec.europa.eu | EU funds tracking |
| **World Bank/IMF** | Comparative data | International benchmarking |

### Tier 4: Internal documents (requires FOIA or sources)

- Notele de fundamentare (justification memos)
- Internal audit reports
- Correspondence between institutions
- Contract annexes and amendments
- Payment orders and invoices

> **Try it on Transparenta.eu:**
> Use the [Search](/search) function to query specific institutions or budget categories. Set up [Alerts](/alerts) to monitor your investigation subjects.

**Key Takeaways:**

- Layer your sources: official data, structured systems, aggregators, internal documents
- SEAP/SICAP and Transparenta.eu are your workhorses for pattern detection
- Internal documents via FOIA often contain the "why" behind the numbers

---

## Module 5: Mastering FOIA (Law 544/2001)

**Learning objective:** Extract information institutions don't want to give.

### Legal framework

| Law | What it guarantees | Key deadlines |
|-----|-------------------|---------------|
| **Legea 544/2001** | Free access to public information | 10 working days (standard), 30 days (complex) |
| **Legea 52/2003** | Transparency in decision-making | 30 working days for draft publication |

### Writing effective requests

**❌ Bad request:**
> "Vă rog să-mi trimiteți toate informațiile despre cheltuielile primăriei."

**✅ Good request:**
> "În baza Legii 544/2001, solicit următoarele documente:
>
> 1. Execuția bugetară detaliată pe articole și alineate pentru capitolul 65.02 (Învățământ), pentru perioada ianuarie-iunie 2024
> 2. Lista contractelor de achiziție publică încheiate pentru bunuri și servicii în cadrul acestui capitol, cu valori peste 50.000 lei
> 3. Situația plăților efectuate către [Firma X] în anul 2024
>
> Solicit primirea documentelor în format electronic (Excel/CSV pentru date tabulare, PDF pentru documente)."

### Key tactics

| Tactic | Why it works |
|--------|--------------|
| Be specific | Time periods, budget chapters, document types |
| Request machine-readable formats | Excel/CSV, not scanned PDFs |
| Ask for underlying data | Raw data, not just summaries |
| Document everything | Email with read receipt, registered mail |
| Know appeal deadlines | 30 days for administrative appeal |

### Escalation path when refused

1. **Administrative appeal (reclamație administrativă)** — 30 days to file
2. **Court action (contencios administrativ)** — Tribunal level
3. **Parallel pressure** — Media coverage, Avocatul Poporului

> **Try it on Transparenta.eu:**
> Before filing FOIA requests, check if the data already exists on Transparenta.eu. Use specific budget codes from your search to make precise FOIA requests for documents behind the numbers.

**Key Takeaways:**

- Specific requests get better responses than broad ones
- Always request electronic, machine-readable formats
- Document your requests — you may need evidence for appeals

---

## Module 6: Working with Budget Data at Scale

**Learning objective:** Handle large datasets efficiently.

### Data formats you'll encounter

| Format | Where you find it | How to handle |
|--------|-------------------|---------------|
| PDF tables | Official reports | Tabula, Camelot, manual extraction |
| Excel files | FOIA responses, portals | Direct analysis, clean first |
| Web tables | Ministry websites | Web scraping, copy-paste |
| API/JSON | SEAP, modern portals | Programmatic access |
| Database exports | Transparenta.eu | SQL queries |

### Essential tools by task

| Task | Tools |
|------|-------|
| **Data cleaning** | OpenRefine, Excel, Python (pandas) |
| **Analysis** | SQL, Pivot tables, R |
| **Visualization** | Datawrapper, Flourish, Tableau Public |
| **Scraping** | Python (BeautifulSoup), browser extensions |

### Common data problems

| Problem | Solution |
|---------|----------|
| Inconsistent institution names | Build a normalization dictionary |
| Missing periods | Document gaps, don't interpolate |
| Currency/inflation over time | Adjust to constant prices (INS deflators) |
| Classification changes between years | Map old→new codes, note breaks |
| Aggregation mismatches | Verify totals; drill into discrepancies |

### SQL example: Finding anomalies

```sql
-- Institutions with unusual personnel cost growth
SELECT 
    institution_name,
    year,
    personnel_costs,
    LAG(personnel_costs) OVER (PARTITION BY institution_id ORDER BY year) as prev_year,
    ROUND((personnel_costs - LAG(personnel_costs) OVER (PARTITION BY institution_id ORDER BY year)) 
        / NULLIF(LAG(personnel_costs) OVER (PARTITION BY institution_id ORDER BY year), 0) * 100, 1) as pct_change
FROM budget_execution
WHERE year >= 2020
HAVING pct_change > 50 OR pct_change < -30
ORDER BY ABS(pct_change) DESC;
```

> **Try it on Transparenta.eu:**
> Export data from [Entity Analytics](/entity-analytics) for multiple similar entities (e.g., 10 county hospitals). Use pivot tables to compare personnel spending per bed or per patient.

**Key Takeaways:**

- Clean data before analysis — garbage in, garbage out
- SQL skills dramatically increase your investigation capacity
- Always verify totals and check for classification changes across years

---

## Part III: Investigation Methodologies

---

## Module 7: Finding Stories in Budget Data

**Learning objective:** Develop systematic approaches to story discovery.

### Method 1: Anomaly detection

Look for statistical outliers:

| Anomaly type | What to look for | Example query |
|--------------|------------------|---------------|
| Spending outliers | Per-capita spending 2+ standard deviations from mean | Compare commune spending/resident |
| Growth spikes | Year-over-year changes >30% | Track all budget lines across years |
| Execution extremes | <50% or >95% execution rates | Both signal problems |
| Allocation oddities | High allocations to "other" categories | Code 20.30.30 scrutiny |

### Method 2: Comparative analysis

Compare similar entities:

- Schools of similar size in different counties
- Hospitals with similar patient volumes
- Communes with similar populations
- Same institution over multiple years

### Method 3: Following specific flows

Track money from source to destination:

- EU fund → Managing authority → Beneficiary → Contractor
- Central transfer → Local budget → Specific spending
- Ministry allocation → Subordinate institution → Final use

### Method 4: Connecting budget to outcomes

| Spending | Outcome data | Story potential |
|----------|--------------|-----------------|
| Education budget | Test scores, dropout rates | Value for money |
| Health spending | Mortality, waiting times | Service quality |
| Infrastructure | Road quality metrics | Project delivery |
| Public safety | Crime statistics | Effectiveness |

### Method 5: Procurement-budget triangulation

- Large contracts should appear in corresponding budget chapters
- Track vendors receiving funds across multiple institutions
- Compare framework agreement ceilings vs. actual execution

> **Try it on Transparenta.eu:**
> Use [Entity Analytics](/entity-analytics) to compare 5 similar communes. Export the data, calculate per-capita spending, and identify the outlier. That's your first lead.

**Key Takeaways:**

- Anomalies are leads, not conclusions — verify before publishing
- Comparison creates context and reveals what's unusual
- The best stories connect spending to real-world outcomes

---

## Module 8: Red Flags and Patterns

**Learning objective:** Recognize indicators of potential problems.

### Planning and allocation red flags

| Red flag | What it might indicate | How to investigate |
|----------|------------------------|---------------------|
| Year-end spending spike | "Use it or lose it" culture | Compare monthly execution patterns |
| High allocation to "other" (20.30.30) | Hiding detailed spending | Request detailed breakdowns via FOIA |
| Multiple rectificări per year | Poor planning or manipulation | Track each change and justification |
| Low capital investment execution | Capacity problems or deliberate underfunding | Compare with stated political priorities |

### Execution red flags

| Red flag | What it might indicate | How to investigate |
|----------|------------------------|---------------------|
| Payments to few vendors | Possible favoritism | Cross-reference with SEAP, ownership data |
| Services with no clear output | Ghost contracts | Request deliverables, activity reports |
| Repeated contract amendments | Scope creep, poor planning | Request amendment justifications |
| Emergency procurement for predictable needs | Avoiding competition | Compare with previous years' patterns |

### Structural red flags

| Red flag | What it might indicate | How to investigate |
|----------|------------------------|---------------------|
| Growing arrears (arierate) | Cash flow crisis | Monitor quarterly reports |
| Personnel >60% of budget | No room for services/investment | Track trend over 5+ years |
| Heavy transfer dependency | Weak local revenue base | Compare fiscal autonomy ratios |
| Unrecorded commitments | Hidden liabilities | Cross-check with Curtea de Conturi |

### Contract splitting indicators

| Threshold | What to watch |
|-----------|---------------|
| <270,120 lei (goods/services) | Multiple similar contracts just below direct purchase limit |
| <900,400 lei (works) | Phased projects avoiding simplified procedure |

> **Try it on Transparenta.eu:**
> Find an institution in [Entity Analytics](/entity-analytics) and calculate: What % goes to personnel (Code 10) vs. investments (Code 71)? If personnel exceeds 70%, that's a story about crowding out development.

**Key Takeaways:**

- Red flags are starting points, not conclusions
- Patterns across time and entities are stronger than isolated incidents
- Always look for innocent explanations before assuming wrongdoing

---

## Module 9: The Investigation Workflow

**Learning objective:** Structure investigations for maximum impact.

### Phase 1: Discovery (1-2 weeks)

```
Hypothesis generation
    ├── Data exploration (Transparenta.eu, SEAP)
    │       ├── Run anomaly queries
    │       ├── Compare entities
    │       └── Identify patterns
    │
    ├── Initial FOIA requests
    │       ├── Detailed budget breakdowns
    │       └── Relevant contracts
    │
    └── Background research
            ├── Previous reporting
            ├── Curtea de Conturi findings
            └── Political context
```

### Phase 2: Verification (2-4 weeks)

```
Testing the hypothesis
    ├── Deep data analysis
    │       ├── Multiple source triangulation
    │       └── Statistical validation
    │
    ├── Document collection
    │       ├── Follow-up FOIA
    │       ├── Source documents
    │       └── Internal communications
    │
    ├── Human sources
    │       ├── Current/former employees
    │       ├── Contractors, suppliers
    │       └── Oversight officials
    │
    └── Expert consultation
            ├── Subject matter experts
            └── Legal review
```

### Phase 3: Confirmation (1-2 weeks)

```
Pre-publication checklist
    ├── Right of reply
    │       ├── Written questions to subjects
    │       └── Document response (or non-response)
    │
    ├── Legal review
    │       ├── Defamation risk
    │       └── Source protection
    │
    ├── Editorial review
    │       ├── Fact-check every claim
    │       └── Methodology documentation
    │
    └── Impact planning
            ├── Oversight bodies to notify
            ├── Follow-up angles
            └── Data publication plan
```

### Documentation standards

- Maintain chain of custody for all documents
- Screenshot web pages (they change)
- Keep raw data separate from processed data
- Document every FOIA request and response
- Create an evidence index

> **Try it on Transparenta.eu:**
> Set up [Alerts](/alerts) for every entity in your investigation. You'll be notified of any budget changes while you're working.

**Key Takeaways:**

- Investigations have phases — don't skip verification
- Documentation protects you legally and editorially
- Right of reply is mandatory, not optional

---

## Module 10: Source Building and Protection

**Learning objective:** Develop and protect human sources.

### Source types in budget investigations

| Source type | What they provide | Approach |
|-------------|-------------------|----------|
| **Insiders** | Internal documents, context | Long-term relationship, absolute protection |
| **Officials** | On-record statements | Professional, documented exchanges |
| **Auditors** | Technical validation | Expert interviews |
| **Competitors** | Leads, alternative perspective | Verify independently |
| **Whistleblowers** | Explosive information | Maximum security protocols |

### Building relationships

- Attend public meetings and budget hearings
- Develop expertise that makes you valuable to sources
- Start with small stories that build trust
- Be reliable — protect everyone who trusts you
- Follow through on promises

### Source protection essentials

| Threat | Protection |
|--------|------------|
| Digital surveillance | Signal, encrypted email, no metadata |
| Document identification | Air-gapped handling, redaction |
| Social engineering | Never confirm identity to anyone |
| Legal compulsion | Know shield law limits (Romania: limited) |

**Key Takeaways:**

- Sources are people who trust you — never betray that
- Protect source identity absolutely, even from colleagues
- Digital security is not optional for serious investigations

---

## Part IV: Specialized Topics

---

## Module 11: EU Funds Investigation

**Learning objective:** Track European money through Romanian systems.

### Current funding landscape (2021-2027)

| Program | Amount | Key investigation angles |
|---------|--------|-------------------------|
| **Cohesion Policy** | ~€31.5 billion | Absorption rates, project delays |
| **CAP (Agriculture)** | ~€14.9 billion | Beneficiary concentration, land grabbing |
| **PNRR** | ~€21.4 billion total | Milestone achievement, reform delivery |

### PNRR breakdown (November 2025 revision)

| Component | Amount | Notes |
|-----------|--------|-------|
| Grants | €13.57 billion | Increased from original |
| Loans | €7.84 billion | Reduced by ~€7B from original €14.9B |
| **Total** | **€21.4 billion** | Down from original €29.1B |

> **Important:** PNRR figures change with renegotiations. Always verify current amounts at [mfe.gov.ro](https://mfe.gov.ro) or the European Commission's Romania RRP page.

### Key data sources for EU funds

| Source | URL | What you get |
|--------|-----|--------------|
| Ministry of EU Funds | mfe.gov.ro | Project lists, absorption data |
| EU Open Data | cohesiondata.ec.europa.eu | Comparative, disbursement data |
| Official EU PNRR page | ec.europa.eu/recovery | Milestone tracking |
| fonduri-ue.ro | fonduri-ue.ro | Beneficiary information |

### Investigation angles

- Absorption rates by program, region, beneficiary type
- Project delays and cost overruns
- Beneficiaries receiving multiple grants
- Connection between awards and political cycles
- Comparison with peer countries (Bulgaria, Poland, Hungary)

> **Try it on Transparenta.eu:**
> Search for institutions with high Titlu 58 (EU-funded projects) spending. Compare execution rates to national average — low execution may indicate implementation problems.

**Key Takeaways:**

- PNRR figures change — always verify current amounts
- Romania's EU fund absorption is a chronic story worth tracking
- Multiple beneficiary databases exist — cross-reference them

---

## Module 12: Local Government Deep Dive

**Learning objective:** Master local budget investigation.

### Local budget structure

```
Bugetul local
├── Secțiunea de funcționare (Operating)
│       ├── Personnel (Code 10)
│       ├── Goods and services (Code 20)
│       └── Transfers, subsidies (Codes 50-59)
│
├── Secțiunea de dezvoltare (Development)
│       ├── Capital investments (Code 71)
│       ├── EU-funded projects (Code 58)
│       └── Loan repayments (Code 81)
│
└── Revenue sources
        ├── Own revenues (taxes, fees)
        ├── Quotas from income tax
        ├── Transfers from state budget
        └── EU funds, loans
```

### Key metrics for comparison

| Metric | Formula | Red flag threshold |
|--------|---------|-------------------|
| Fiscal autonomy | Own revenues ÷ Total revenues | <30% = high dependency |
| Personnel burden | Personnel ÷ Operating expenses | >60% = crowding out |
| Investment capacity | Capital spending ÷ Total spending | <15% = stagnation |
| Debt service ratio | Debt payments ÷ Own revenues | >30% = legal limit |
| Execution rate | Actual ÷ Planned | <70% for investments = problem |

### Romania's local structure

| Level | Count | Budget characteristics |
|-------|-------|----------------------|
| Counties (județe) | 41 | Intermediate, coordinate services |
| Bucharest | 1 | Special status, largest budget |
| Municipalities | 103 | Urban, larger budgets |
| Towns | 217 | Urban, mid-size |
| Communes | ~2,861 | Rural, smallest, most numerous |

### Local access challenges and opportunities

| Challenge | Opportunity |
|-----------|-------------|
| Less digital, more PDF | Easier to find human sources |
| Smaller staff, less responsive | Attend council meetings in person |
| Political sensitivity higher | Local impact more visible |
| Less standardized reporting | Stories more exclusive |

> **Try it on Transparenta.eu:**
> Use the [Map](/map) to identify your target region. Then use [Entity Analytics](/entity-analytics) to compare all communes in one county. Who's the outlier?

**Key Takeaways:**

- ~3,180 local budgets = ~3,180 potential investigations
- Local is easier to monitor, influence, and verify
- Personnel-to-investment ratio reveals true priorities

---

## Module 13: Health and Education Budgets

**Learning objective:** Navigate sector-specific complexities.

### Health sector funding flows

```
FNUASS (National Health Insurance Fund)
    │
    └── CNAS (National Health Insurance House)
            │
            ├── CAS (County Houses) → Primary care, outpatient
            │
            └── Hospitals
                    ├── DRG-based payments (acute care)
                    ├── Ministry of Health funding (some)
                    └── Local government support (some)
```

**DRG (Diagnosis-Related Groups):** Hospitals are paid per case based on diagnosis complexity. The tariff (TCP) × relative value (VR) determines payment. Current TCP: ~1,485 lei.

### Health investigation angles

| Area | Data sources | Story potential |
|------|--------------|-----------------|
| Hospital arrears | Quarterly reports, FOIA | Cash flow crisis |
| Drug procurement | SEAP, price comparisons | Overpricing |
| Equipment purchases | SEAP, utilization data | White elephants |
| Waiting times vs. spending | CNAS data, patient complaints | Service quality |

### Education funding flows

```
State budget → Ministry of Education
    │
    ├── Per-pupil funding (cost standard)
    │       └── Through local budgets → schools
    │
    ├── National programs (After School, Hot Meal, etc.)
    │       └── Transfers to localities
    │
    └── Direct funding: universities, inspectorates
```

**Cost standard (2025):** 10,324 lei per student base rate, with coefficients for school type, location, and climate.

### Education investigation angles

| Area | Data sources | Story potential |
|------|--------------|-----------------|
| Per-pupil spending variations | Budget data, school enrollment | Equity issues |
| School renovation | Capital spending (Code 71), procurement | Political favoritism |
| Teacher distribution | Staff numbers, school locations | Rural-urban gap |
| Dropout vs. investment | Education spending, outcome data | Effectiveness |

> **Try it on Transparenta.eu:**
> Compare hospital budgets in [Entity Analytics](/entity-analytics). Calculate spending per bed or per DRG case across similar hospitals. Outliers are leads.

**Key Takeaways:**

- Health and education have complex, multi-source funding
- DRG and cost-standard systems create natural comparison opportunities
- Connect spending to outcomes for powerful stories

---

## Module 14: Procurement Integration

**Learning objective:** Connect budget data with procurement data.

### The SICAP system (replaced SEAP in April 2018)

| Stage | What to find | Investigation use |
|-------|--------------|-------------------|
| Planificare | Annual procurement plan | What they intend to buy |
| Inițiere | Procurement notice | Who's competing |
| Evaluare | Bid evaluation | Selection criteria |
| Atribuire | Contract award | Who won, at what price |
| Contract | Signed agreement | Terms, delivery dates |
| Execuție | Amendments, payments | Actual vs. planned |

### Current thresholds (January 2024)

| Category | Direct purchase | Simplified | EU threshold |
|----------|-----------------|------------|--------------|
| Goods/services | <270,120 lei | 270,120-705,819 lei | >705,819 lei (central) |
| Works | <900,400 lei | 900,400-27,334,460 lei | >27,334,460 lei |

> **Note:** Thresholds update periodically. Verify current values at anap.gov.ro.

### Connecting procurement to budget

| Procurement data | Budget data | What to check |
|------------------|-------------|---------------|
| Contract value | Budget allocation | Should fit within chapter |
| Vendor payments | Budget execution | Should match timing |
| Framework ceilings | Multi-year commitments | Watch cumulative exposure |
| Amendments | Rectifications | Should correlate |

### Procurement red flags

| Pattern | What it might indicate |
|---------|------------------------|
| Single-source (negociere fără publicare) overuse | Avoiding competition |
| Contract splitting just below thresholds | Deliberate evasion |
| Repeated amendments (>20% increase) | Poor specification or favoritism |
| Same vendor wins across institutions | Coordination or corruption |
| Emergency procedures for predictable needs | Procedure abuse |

> **Try it on Transparenta.eu:**
> Find a major contract in SEAP, note the contracting authority and amount. Then search for that authority in Transparenta.eu and verify the spending appears in the corresponding budget chapter.

**Key Takeaways:**

- Procurement and budget data should tell the same story
- Watch for splitting, amendments, and vendor concentration
- SICAP replaced SEAP in 2018, but both terms are still used

---

## Part V: Publication and Impact

---

## Module 15: Writing Budget Stories

**Learning objective:** Translate data into compelling narratives.

### Story structures

| Structure | When to use | Elements |
|-----------|-------------|----------|
| **Accountability** | Clear wrongdoing found | Who decided, who benefited, what happened |
| **Explanatory** | Complex system to explain | How it works, what citizens get, how we compare |
| **Investigative** | Pattern discovered | What we found, how, what it means, what's next |

### Making numbers accessible

| Technical | Accessible |
|-----------|------------|
| "2.3 billion lei" | "Enough to build 50 schools" |
| "15% execution rate" | "For every 100 lei planned, only 15 were spent" |
| "3x higher than average" | "Spends three times more than similar communes" |
| "Personnel at 78%" | "78 bani of every leu goes to salaries" |
| "9.3% deficit" | "Borrowing nearly 1 in 10 lei it spends" |

### Methodology transparency

- Describe data sources used
- Acknowledge limitations honestly
- Publish underlying data when possible
- Enable verification and replication

### Pre-publication checklist

- [ ] Every claim has a documented source
- [ ] Numbers verified against multiple sources
- [ ] Right of reply documented
- [ ] Legal review complete
- [ ] Methodology section written
- [ ] Data prepared for publication

**Key Takeaways:**

- Numbers need context to create meaning
- Transparency about methodology builds credibility
- Enable others to verify and build on your work

---

## Module 16: Legal Considerations

**Learning objective:** Protect yourself and your sources.

### Romanian press law framework

| Risk | Mitigation |
|------|------------|
| **Defamation** | Document facts, right of reply, public interest defense |
| **Privacy** | Balance public interest, minimize unnecessary exposure |
| **Classified information** | Verify actual classification vs. claimed |
| **Source exposure** | Technical security, understand privilege limits |

### Safe publication practices

- Distinguish facts from allegations
- Use precise language ("documents show" vs. "proves")
- Document all right of reply attempts
- Pre-publication legal review for sensitive stories
- Maintain insurance/legal support arrangements

### When officials threaten

1. Document everything
2. Don't retract without legal advice
3. Know your organization's support protocols
4. Connect with press freedom organizations

### Support organizations

| Organization | What they provide |
|--------------|-------------------|
| **ActiveWatch** | Press freedom monitoring, legal support referrals |
| **CJI** (Centrul pentru Jurnalism Independent) | Training, ethical guidance |
| **RISE Project** | Investigative collaboration |
| **OCCRP** | Cross-border investigation support |

**Key Takeaways:**

- Documentation is your legal protection
- Right of reply is mandatory, not optional
- Know your support network before you need it

---

## Module 17: Creating Impact

**Learning objective:** Maximize the effect of your investigations.

### Before publication

- Notify relevant oversight bodies (embargoed)
- Prepare regulatory complaints if warranted
- Brief allied organizations
- Plan follow-up coverage

### At publication

- Full methodology transparency
- Publish underlying data
- Coordinate social media strategy
- Enable partner amplification

### After publication

- Track official responses
- File formal complaints where appropriate
- Monitor for changes/reforms
- Update stories as situations develop
- Archive all evidence

### Building the ecosystem

| Action | Impact |
|--------|--------|
| Train other journalists | Multiply investigative capacity |
| Share data and methods | Enable follow-up stories |
| Collaborate on complex investigations | Pool resources |
| Support legal defense when needed | Protect the profession |

> **Try it on Transparenta.eu:**
> After publication, use [Alerts](/alerts) to monitor your investigation subjects. Track whether your reporting leads to budget changes, audits, or reforms.

**Key Takeaways:**

- Impact comes from follow-up, not just publication
- Share your data and methods to multiply effect
- Track outcomes to measure your impact

---

## Practical Exercises

### Exercise 1: Budget Literacy Test

Decode 10 budget lines from Transparenta.eu, identifying institution, function, and economic classification.

### Exercise 2: FOIA Practicum

Submit three budget-related FOIA requests and document the response process.

### Exercise 3: Anomaly Hunt

Using Transparenta.eu, identify five statistical anomalies worth investigating in your county.

### Exercise 4: Procurement-Budget Link

Take one contract >500,000 lei from SEAP, trace it through the contracting authority's budget.

### Exercise 5: Comparative Analysis

Compare per-pupil education spending across 10 counties, controlling for population density.

### Exercise 6: Mini-Investigation

Conduct a complete small investigation: hypothesis → data → verification → 500-word story.

---

## Quick Reference

### Essential URLs

| Resource | URL |
|----------|-----|
| Transparenta.eu | transparenta.eu |
| Ministry of Finance | mfinante.gov.ro |
| SICAP/SEAP (procurement) | e-licitatie.ro |
| Court of Accounts | curteadeconturi.ro |
| Official Gazette | monitoruloficial.ro |
| EU Funds Portal | fonduri-ue.ro |
| Company Registry | recom.ro |
| EU Cohesion Data | cohesiondata.ec.europa.eu |

### Key Laws

| Law | Subject | Key for |
|-----|---------|---------|
| Legea 500/2002 | Public finance | Budget cycle, execution |
| Legea 273/2006 | Local public finance | Local budgets |
| Legea 544/2001 | Access to information | FOIA requests |
| Legea 52/2003 | Decision transparency | Public consultation |
| Legea 98/2016 | Public procurement | Procurement procedures |

### Classification Quick Guide

| Code | Meaning |
|------|---------|
| 10 | Personnel costs |
| 20 | Goods and services |
| 20.30.30 | "Other" (scrutinize!) |
| 51 | Intergovernmental transfers |
| 58 | EU-funded projects |
| 71 | Capital investments |
| 81 | Loan repayments |

---

*This curriculum was designed for journalists investigating Romanian public budgets. For questions or updates, contact us through Transparenta.eu.*

*Last updated: December 2025. Verify all thresholds and figures against current official sources before publication.*
