# Module 12: Local Government Deep Dive

## Module Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 55 minutes |
| **Difficulty** | Intermediate-Advanced |
| **Prerequisites** | Modules 7-10 (Investigation Methodologies) |
| **Next Module** | 13. Health and Education Budgets |

## Learning Objectives

By the end of this module, you will be able to:

- [ ] Navigate Romania's multi-tier local government budget structure
- [ ] Calculate and interpret fiscal autonomy indicators
- [ ] Identify problematic patterns in UAT (local administrative unit) finances
- [ ] Compare similar localities to find outliers
- [ ] Investigate local government spending priorities and efficiency

---

## Introduction

> **Key Insight**: Romania has 3,228 local administrative units (UATs), each with its own budget. The vast majority depend heavily on central government transfers, but spending choices remain local - creating both accountability gaps and investigation opportunities.

Local government in Romania operates on three tiers:

```
┌─────────────────────────────────────────────────────────────────┐
│              LOCAL GOVERNMENT STRUCTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    ┌─────────────────┐                          │
│                    │   41 JUDEȚE     │  County Councils         │
│                    │   (Counties)    │  + Bucharest             │
│                    └────────┬────────┘                          │
│                             │                                   │
│              ┌──────────────┼──────────────┐                    │
│              │              │              │                    │
│              ▼              ▼              ▼                    │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐     │
│  │  103 CITIES      │ │ 217 TOWNS   │ │  2,861 COMMUNES  │     │
│  │  (Municipii)     │ │ (Orașe)     │ │  (Comune)        │     │
│  │                  │ │             │ │                  │     │
│  │  > 10,000 pop    │ │ Urban with  │ │  Rural areas     │     │
│  │  Urban centers   │ │ urban status│ │  ~45% of pop     │     │
│  └──────────────────┘ └─────────────┘ └──────────────────┘     │
│                                                                 │
│  TOTAL: 3,228 UATs (Unități Administrativ-Teritoriale)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each UAT has a Local Council (Consiliu Local) and a Mayor (Primar) who together approve and execute the local budget.

---

## Interactive Element 1: UAT Comparison Tool

Compare similar localities to identify outliers:

```
╔══════════════════════════════════════════════════════════════════╗
║              UAT COMPARISON TOOL                                 ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Find Similar UATs:                                              ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Type: [▼] Municipality   Population: [▼] 50,000-100,000   │  ║
║  │ County: [▼] Any          Economic Profile: [▼] Industrial │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  RESULTS: 12 Similar Municipalities                              ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║  │UAT          │Pop    │Budget/cap│Personnel│Investment│Own Rev│ ║
║  ├─────────────┼───────┼──────────┼─────────┼──────────┼───────┤ ║
║  │Hunedoara    │60,525 │ 2,450 lei│  48%    │   22%    │  38%  │ ║
║  │Mediaș       │53,012 │ 2,180 lei│  52%    │   18%    │  35%  │ ║
║  │Turda        │47,741 │ 2,890 lei│  45%    │   28%    │  42%  │ ║
║  │Câmpina      │32,987 │ 2,340 lei│  55%    │   15%    │  31%  │ ║
║  ├─────────────┼───────┼──────────┼─────────┼──────────┼───────┤ ║
║  │🔴 OUTLIER X │55,234 │ 3,890 lei│  68%    │    8%    │  25%  │ ║
║  ├─────────────┼───────┼──────────┼─────────┼──────────┼───────┤ ║
║  │Sighișoara   │28,102 │ 2,520 lei│  51%    │   21%    │  44%  │ ║
║  │Lugoj        │40,361 │ 2,210 lei│  49%    │   19%    │  36%  │ ║
║                                                                  ║
║  🔴 OUTLIER DETECTED:                                            ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Municipality X shows unusual patterns:                     │  ║
║  │ • Personnel costs 68% (peer avg: 50%)                      │  ║
║  │ • Investment only 8% (peer avg: 20%)                       │  ║
║  │ • Own revenue 25% (peer avg: 38%)                          │  ║
║  │                                                            │  ║
║  │ Possible investigation: Bloated administration?            │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  [Deep Dive] [Export Comparison] [Set Alert]                     ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Interactive Element 2: Fiscal Autonomy Calculator

Assess a locality's financial independence:

```
╔══════════════════════════════════════════════════════════════════╗
║              FISCAL AUTONOMY CALCULATOR                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Select UAT: [Comuna Exemplu, jud. Vaslui                   ▼]   ║
║                                                                  ║
║  REVENUE STRUCTURE (2024)                                        ║
║  ═══════════════════════════════════════════════════════════════ ║
║                                                                  ║
║  Total Revenue: 4,250,000 lei                                    ║
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │  Own Revenue        ████░░░░░░░░░░░░░░░░  18%  (765,000)   │ ║
║  │  ├── Local taxes    ██░░░░░░░░░░░░░░░░░░   8%              │ ║
║  │  ├── Fees & charges █░░░░░░░░░░░░░░░░░░░   5%              │ ║
║  │  └── Other local    █░░░░░░░░░░░░░░░░░░░   5%              │ ║
║  │                                                             │ ║
║  │  Shared Taxes       ████████░░░░░░░░░░░░  38%  (1,615,000) │ ║
║  │  └── Income tax share                                       │ ║
║  │                                                             │ ║
║  │  Transfers          ████████░░░░░░░░░░░░  40%  (1,700,000) │ ║
║  │  ├── Equalization   ██████░░░░░░░░░░░░░░  28%              │ ║
║  │  └── Special purpose ██░░░░░░░░░░░░░░░░░░  12%              │ ║
║  │                                                             │ ║
║  │  EU Funds           █░░░░░░░░░░░░░░░░░░░   4%  (170,000)   │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                  ║
║  FISCAL AUTONOMY SCORE: 18%  [██░░░░░░░░] VERY LOW              ║
║  ───────────────────────────────────────────────────────────────║
║  National Average: 32%   |   Urban Average: 45%                  ║
║                                                                  ║
║  ⚠️ VULNERABILITY ASSESSMENT:                                    ║
║  This commune depends 82% on central transfers and shared taxes. ║
║  Any reduction in central funding would severely impact services.║
║                                                                  ║
║  [Compare Peer Communes] [View Trends] [Revenue Breakdown]       ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Interactive Element 3: Personnel Burden Analyzer

Investigate whether a locality is overstaffed:

```
╔══════════════════════════════════════════════════════════════════╗
║              PERSONNEL BURDEN ANALYZER                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  UAT Analysis: [Oraș X, jud. Teleorman                      ▼]   ║
║                                                                  ║
║  PERSONNEL COST BREAKDOWN                                        ║
║  ═══════════════════════════════════════════════════════════════ ║
║                                                                  ║
║  Total Budget:        12,450,000 lei                             ║
║  Personnel Costs:      8,090,000 lei (65%)                       ║
║  Population:              18,500                                 ║
║  Staff Count:                 385                                ║
║                                                                  ║
║  KEY METRICS:                                                    ║
║  ┌────────────────────┬────────────┬────────────┬─────────────┐  ║
║  │ Metric             │ This UAT   │ Peer Avg   │ Status      │  ║
║  ├────────────────────┼────────────┼────────────┼─────────────┤  ║
║  │ Personnel % budget │ 65%        │ 48%        │ 🔴 HIGH     │  ║
║  │ Staff per 1000 pop │ 20.8       │ 12.5       │ 🔴 HIGH     │  ║
║  │ Avg salary/staff   │ 21,013 lei │ 18,450 lei │ 🟡 ABOVE    │  ║
║  │ Investment capacity│ 12%        │ 25%        │ 🔴 LOW      │  ║
║  └────────────────────┴────────────┴────────────┴─────────────┘  ║
║                                                                  ║
║  STAFF DISTRIBUTION:                                             ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║  Administration (Primărie)  ████████████░░░░░░░░  145  (38%)    ║
║  Education (non-teaching)   ██████░░░░░░░░░░░░░░   78  (20%)    ║
║  Public Services            ████████░░░░░░░░░░░░   95  (25%)    ║
║  Culture & Sport            ███░░░░░░░░░░░░░░░░░   42  (11%)    ║
║  Other                      ██░░░░░░░░░░░░░░░░░░   25   (6%)    ║
║                                                                  ║
║  🔴 RED FLAG: Administration has 145 staff for 18,500 residents  ║
║               Peer average: ~85 staff for similar population     ║
║                                                                  ║
║  INVESTIGATION QUESTIONS:                                        ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ • What positions were added in last 4 years?               │  ║
║  │ • Are there family members of council/mayor on payroll?    │  ║
║  │ • How do salaries compare to private sector locally?       │  ║
║  │ • What services are provided for this staffing level?      │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  [View Organigram] [Staff Trends] [Salary Details]               ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Interactive Element 4: Investment Execution Tracker

Track whether capital projects are actually being built:

```
╔══════════════════════════════════════════════════════════════════╗
║              INVESTMENT EXECUTION TRACKER                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  UAT: [Municipiul Y, jud. Dolj                              ▼]   ║
║  Period: [2024                                              ▼]   ║
║                                                                  ║
║  CAPITAL BUDGET EXECUTION                                        ║
║  ═══════════════════════════════════════════════════════════════ ║
║                                                                  ║
║  Planned:   45,000,000 lei                                       ║
║  Executed:  18,450,000 lei                                       ║
║  Rate:      41%  [████████░░░░░░░░░░░░]                          ║
║                                                                  ║
║  BY PROJECT:                                                     ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║  │ Project                    │ Planned   │ Spent    │ Rate │   ║
║  ├────────────────────────────┼───────────┼──────────┼──────┤   ║
║  │ School Renovation          │ 8,500,000 │ 7,225,000│  85% │   ║
║  │ Road Rehabilitation        │15,000,000 │ 6,000,000│  40% │   ║
║  │ Water System Extension     │ 9,500,000 │ 2,850,000│  30% │   ║
║  │ Sports Complex             │ 7,000,000 │   350,000│   5% │   ║
║  │ ─────────────────────────────────────────────────────────│   ║
║  │ 🔴 City Hall Renovation    │ 5,000,000 │ 2,025,000│  41% │   ║
║  │                                                           │   ║
║                                                                  ║
║  ⚠️ PATTERN DETECTED:                                            ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Sports Complex: 5% execution despite procurement          │  ║
║  │ completed in March. Contract awarded to local firm.       │  ║
║  │                                                            │  ║
║  │ City Hall Renovation: Started before citizen priorities   │  ║
║  │ (water, roads) are addressed.                             │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  MULTI-YEAR VIEW:                                                ║
║       2021    2022    2023    2024                               ║
║  Exec  68%     52%     45%     41%  ← Declining trend            ║
║                                                                  ║
║  [View Contracts] [Compare Peers] [Set Alerts]                   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Core Content: Local Government Investigation Framework

### Revenue Sources Explained

```
LOCAL GOVERNMENT REVENUE STRUCTURE
══════════════════════════════════════════════════════════════════

1. VENITURI PROPRII (Own Revenue) - What they collect locally
   ├── Impozit pe clădiri (Building tax)
   ├── Impozit pe teren (Land tax)
   ├── Impozit pe mijloace de transport (Vehicle tax)
   ├── Taxa de salubritate (Sanitation fee)
   ├── Taxa de urbanism/autorizații (Permits & fees)
   └── Other local taxes and fees

2. COTE DEFALCATE (Shared Taxes) - Automatic transfers
   └── % of income tax collected in locality
       • Communes: 11.25% direct + variable equalization
       • Cities: 12.5% direct + variable equalization
       • Counties: 13% direct + variable equalization

3. TRANSFERURI (Transfers from central budget)
   ├── Sume defalcate pentru echilibrare
   │   (Equalization transfers for poor localities)
   ├── Transferuri pentru investiții
   │   (Capital investment transfers)
   └── Subvenții specifice
       (Education, social assistance, heating aid)

4. FONDURI EXTERNE
   └── EU project co-financing and direct payments

INVESTIGATION INSIGHT:
────────────────────────────────────────────────────────────────
Localities with very low own revenue (<20%) have limited
accountability to local taxpayers. They answer more to
central government than to citizens.
```

### Spending Categories

```
LOCAL BUDGET FUNCTIONAL CLASSIFICATION
══════════════════════════════════════════════════════════════════

51 - Autorități publice (Public authorities/Administration)
     └── City hall operations, council, mayor's office

54 - Alte servicii publice generale
     └── Elections, vital records, other admin

61 - Ordine publică (Local police, community guard)

65 - Învățământ (Education - local component)
     └── School maintenance, non-teaching staff, utilities

66 - Sănătate (Health - local hospitals/clinics)

67 - Cultură, recreere (Culture, parks, sports)

68 - Asigurări și asistență socială (Social assistance)

70 - Locuințe, servicii, dezvoltare publică
     └── Housing, water, sanitation, urban development

74 - Protecția mediului (Environmental protection)

80 - Acțiuni generale economice (Economic actions)

84 - Transporturi (Roads, local transport)

RED FLAGS BY CATEGORY:
────────────────────────────────────────────────────────────────
• 51 > 15% of budget → Over-bloated administration
• 67 > 10% in poor commune → Vanity projects over basics
• 70 + 84 < 30% → Not investing in core infrastructure
• 65 declining → Neglecting local schools
```

### The Politics-Budget Connection

```
HOW LOCAL POLITICS AFFECTS BUDGETS
══════════════════════════════════════════════════════════════════

           ┌────────────────────────────────────────────┐
           │         LOCAL COUNCIL                      │
           │   (Consiliul Local - elected)              │
           │                                            │
           │   • Approves annual budget                 │
           │   • Authorizes borrowing                   │
           │   • Sets local tax rates                   │
           │   • Approves investment priorities         │
           └──────────────────┬─────────────────────────┘
                              │ Approves
                              ▼
           ┌────────────────────────────────────────────┐
           │         MAYOR (Primar)                     │
           │   (Executive - elected separately)         │
           │                                            │
           │   • Proposes budget to council             │
           │   • Executes approved budget               │
           │   • Signs contracts                        │
           │   • Manages city hall staff                │
           └──────────────────┬─────────────────────────┘
                              │ Proposes, Executes
                              ▼
           ┌────────────────────────────────────────────┐
           │         BUDGET CYCLE                       │
           │                                            │
           │   Q4 prev year: Mayor proposes budget      │
           │   Feb-Mar: Council debates and approves    │
           │   Quarterly: Rectifications possible       │
           │   Year-end: Final execution report         │
           │   +6 months: Audit by Curtea de Conturi    │
           └────────────────────────────────────────────┘

INVESTIGATION ANGLE:
────────────────────────────────────────────────────────────────
When mayor and council majority are from same party:
  → Less scrutiny of budget proposals
  → Faster approval of mayor's priorities
  → Potential for patronage and waste

When they're from different parties:
  → Budget battles, delays, amendments
  → Sometimes better oversight
  → But also potential for political blocking of projects
```

---

## Platform Integration: Guided Activity

### Activity: Compare Your Locality with Peers

**Step 1: Find Your UAT**

Navigate to Transparenta.eu and search for your city/commune:
```
/entities?search=[locality name]
```

**Step 2: Identify Peer Localities**

Find 3-5 similar UATs based on:
- Same type (municipality, town, commune)
- Similar population (±20%)
- Same region/economic profile

**Step 3: Run Comparison**

Using Entity Analytics, compare these metrics:
- Personnel costs as % of total spending
- Investment execution rate
- Own revenue as % of total revenue
- Spending per capita

**Step 4: Identify Outliers**

Ask yourself:
- Is your locality spending more on administration than peers?
- Is investment execution significantly lower/higher?
- Are there unexplained differences?

**Step 5: Deep Dive on Anomalies**

For any significant difference:
1. Look at budget line details
2. Check council decisions for context
3. Search for procurement contracts
4. Consider FOIA requests for specifics

---

## Knowledge Check

Test your understanding of local government budgets:

```
QUESTION 1:
What is the main indicator of a locality's financial independence?

A) Total budget size
B) Population size
C) Own revenue as percentage of total revenue  ✓
D) Number of staff

QUESTION 2:
What personnel cost percentage typically indicates overstaffing?

A) > 30% of budget
B) > 45% of budget
C) > 60% of budget  ✓
D) > 80% of budget

QUESTION 3:
How many local administrative units (UATs) exist in Romania?

A) 320
B) 1,200
C) 3,228  ✓
D) 8,500

QUESTION 4:
What is the functional code for local administration (city hall)?

A) 51  ✓
B) 65
C) 70
D) 84
```

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════╗
║                     KEY TAKEAWAYS                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  1. Romania has 3,228 UATs with budgets - most depend heavily   ║
║     on central government transfers for revenue                  ║
║                                                                  ║
║  2. Fiscal autonomy (own revenue %) reveals which localities    ║
║     are accountable to citizens vs. central government          ║
║                                                                  ║
║  3. Personnel costs > 60% is a red flag - leaves little for     ║
║     investment and services                                      ║
║                                                                  ║
║  4. Comparing similar localities reveals outliers - the same    ║
║     size city should have similar spending patterns             ║
║                                                                  ║
║  5. Low investment execution combined with high admin spending  ║
║     often indicates misplaced priorities or capacity problems   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Call to Action

**Your Local Investigation:**

Pick your home locality (or one you're interested in) and answer:

1. What is their fiscal autonomy score? (own revenue ÷ total revenue)
2. What percentage goes to personnel costs?
3. How does investment execution compare to peers?
4. What are the top 3 spending priorities by amount?
5. Are there any obvious red flags?

Local government is where investigative journalism can have the most direct impact - citizens can vote out their mayor based on your findings.

---

## Technical Notes

### Components Needed

```typescript
// UAT Comparison Tool
interface UATComparison {
  cui: string
  name: string
  type: 'municipality' | 'town' | 'commune' | 'county'
  population: number
  budgetPerCapita: number
  personnelPercent: number
  investmentPercent: number
  ownRevenuePercent: number
  outlierScore: number
}

// Fiscal Autonomy Calculator
interface RevenueBreakdown {
  ownRevenue: number
  sharedTaxes: number
  transfers: number
  euFunds: number
  total: number
  autonomyScore: number
}

// Personnel Burden Analyzer
interface PersonnelAnalysis {
  totalBudget: number
  personnelCosts: number
  staffCount: number
  population: number
  staffPer1000Pop: number
  avgSalary: number
  peerComparison: {
    personnelPercent: number
    staffPer1000Pop: number
    avgSalary: number
  }
}
```

### Data Requirements

- UAT master data (population, type, county)
- Revenue breakdown by source type
- Spending by functional classification
- Staff counts by department
- Multi-year investment execution data
- Peer grouping algorithms

### Platform Routes

- `/entities?type=local` - List local government entities
- `/entity-analytics` - Compare localities
- `/budget-explorer?functional=51` - Administration spending
- `/search?functional=70,84` - Infrastructure spending
- `/map` - Geographic view of local budgets
