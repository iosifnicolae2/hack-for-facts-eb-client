# Module 13: Health and Education Budgets

## Module Overview

| Attribute | Value |
|-----------|-------|
| **Duration** | 55 minutes |
| **Difficulty** | Intermediate-Advanced |
| **Prerequisites** | Modules 7-10 (Investigation Methodologies) |
| **Next Module** | 14. Procurement Integration |

## Learning Objectives

By the end of this module, you will be able to:

- [ ] Navigate the complex multi-source funding of health and education
- [ ] Identify per-pupil and per-patient spending disparities
- [ ] Investigate hospital finances and DRG payments
- [ ] Track education funding from ministry to classroom
- [ ] Compare institutional performance relative to resources

---

## Introduction

> **Key Insight**: Health and education together consume nearly 40% of Romania's public budget, yet outcomes lag significantly behind EU peers. The gap between spending and results is where investigative stories emerge.

These two sectors share a critical characteristic - money flows through multiple channels before reaching service delivery:

```
┌─────────────────────────────────────────────────────────────────┐
│        HEALTH & EDUCATION: MONEY vs OUTCOMES                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SPENDING (% of GDP)           │    OUTCOMES (EU Rank)          │
│  ══════════════════════════════│═══════════════════════════════│
│                                │                                │
│  HEALTH                        │    HEALTH                      │
│  Romania: 5.7%  ████████░░░    │    Life expectancy: 26th/27   │
│  EU avg:  8.1%  ███████████░   │    Infant mortality: 27th/27  │
│                                │    Preventable deaths: 27th   │
│  ──────────────────────────────│────────────────────────────── │
│                                │                                │
│  EDUCATION                     │    EDUCATION                   │
│  Romania: 3.2%  ██████░░░░░░   │    PISA scores: 26th/27       │
│  EU avg:  4.8%  █████████░░░   │    Early dropout: 26th/27     │
│                                │    Tertiary attainment: 25th  │
│                                │                                │
│  ──────────────────────────────│────────────────────────────── │
│  INVESTIGATION QUESTION:       │                                │
│  Is it underfunding, or is     │                                │
│  money being wasted/stolen?    │                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Interactive Element 1: Per-Pupil Spending Comparator

Compare education spending across schools and localities:

```
╔══════════════════════════════════════════════════════════════════╗
║              PER-PUPIL SPENDING COMPARATOR                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Compare Schools By:                                             ║
║  ( ) County  (•) Locality  ( ) School Type  ( ) Urban/Rural    ║
║                                                                  ║
║  Selected Area: [Județul Dolj                              ▼]   ║
║                                                                  ║
║  STANDARD COST per pupil (2024): 7,846 lei                      ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║  │ Locality          │ Schools │ Students │ Spending/pupil │    ║
║  ├───────────────────┼─────────┼──────────┼────────────────┤    ║
║  │ Craiova           │    85   │   42,500 │   9,230 lei    │    ║
║  │ Băilești          │    12   │    3,200 │   7,980 lei    │    ║
║  │ Calafat           │     8   │    2,100 │   8,150 lei    │    ║
║  │ Filiași           │     6   │    1,850 │   7,650 lei    │    ║
║  │ ─────────────────────────────────────────────────────── │    ║
║  │ 🔴 Coșoveni       │     3   │      420 │  12,450 lei    │    ║
║  │ ─────────────────────────────────────────────────────── │    ║
║  │ Segarcea          │     5   │    1,100 │   7,720 lei    │    ║
║                                                                  ║
║  🔴 OUTLIER DETECTED: Coșoveni                                   ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Per-pupil spending 59% above standard cost                 │  ║
║  │                                                            │  ║
║  │ Possible explanations:                                     │  ║
║  │ • Very small school sizes (inefficiency)                   │  ║
║  │ • Special programs requiring extra staff                   │  ║
║  │ • Bloated non-teaching staff                               │  ║
║  │ • Local government top-up funding                          │  ║
║  │                                                            │  ║
║  │ → INVESTIGATE: What explains the 4,600 lei difference?     │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  [View School Details] [Export Data] [Compare with PISA]         ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Interactive Element 2: Hospital Finance Analyzer

Investigate hospital revenues, costs, and efficiency:

```
╔══════════════════════════════════════════════════════════════════╗
║              HOSPITAL FINANCE ANALYZER                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Select Hospital: [Spitalul Județean de Urgență Craiova     ▼]   ║
║                                                                  ║
║  REVENUE SOURCES (2024)                                          ║
║  ═══════════════════════════════════════════════════════════════ ║
║                                                                  ║
║  Total Revenue: 485,000,000 lei                                  ║
║                                                                  ║
║  ┌─────────────────────────────────────────────────────────────┐ ║
║  │                                                             │ ║
║  │  CNAS Contract      ██████████████████░░  72%  (349M)      │ ║
║  │  (DRG payments)                                             │ ║
║  │                                                             │ ║
║  │  Ministry Transfer  ████░░░░░░░░░░░░░░░░  15%  (73M)       │ ║
║  │  (Personnel, programs)                                      │ ║
║  │                                                             │ ║
║  │  County Budget      ██░░░░░░░░░░░░░░░░░░   8%  (39M)       │ ║
║  │  (Capital, maintenance)                                     │ ║
║  │                                                             │ ║
║  │  Own Revenue        █░░░░░░░░░░░░░░░░░░░   5%  (24M)       │ ║
║  │  (Self-pay, donations)                                      │ ║
║  │                                                             │ ║
║  └─────────────────────────────────────────────────────────────┘ ║
║                                                                  ║
║  DRG PERFORMANCE                                                 ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║  Cases (validated):        52,400                                ║
║  Case-Mix Index:           1.24  (complexity above average)      ║
║  Avg DRG payment:          6,660 lei                             ║
║  Avg length of stay:       7.2 days  (national: 6.8)            ║
║                                                                  ║
║  ⚠️ RED FLAGS:                                                   ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ • Length of stay 6% above national average                 │  ║
║  │   → Potential inefficiency or upcoding                     │  ║
║  │                                                            │  ║
║  │ • 23% of cases in top-5 most profitable DRGs               │  ║
║  │   → Possible patient selection or upcoding                 │  ║
║  │                                                            │  ║
║  │ • Personnel costs 68% of expenditure                       │  ║
║  │   → Limited investment in equipment/supplies               │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  [Compare Hospitals] [DRG Breakdown] [Staff Analysis]            ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Interactive Element 3: Education Funding Flow Tracer

Follow the money from ministry to classroom:

```
╔══════════════════════════════════════════════════════════════════╗
║              EDUCATION FUNDING FLOW TRACER                       ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  TRACE FUNDING FOR: Primary Education (Standard Cost)           ║
║                                                                  ║
║       MINISTRY OF EDUCATION                                      ║
║              │                                                   ║
║              │ Sets standard cost per pupil: 7,846 lei          ║
║              │ Total allocation: 18.2 billion lei               ║
║              ▼                                                   ║
║       ┌──────────────────────────────────────────────┐          ║
║       │          COUNTY SCHOOL INSPECTORATE          │          ║
║       │   (Inspectoratul Școlar Județean)            │          ║
║       │                                              │          ║
║       │   • Validates pupil counts                   │          ║
║       │   • Distributes to localities                │          ║
║       │   • Monitors spending                        │          ║
║       └──────────────────────────────────────────────┘          ║
║              │                                                   ║
║              ▼                                                   ║
║       ┌──────────────────────────────────────────────┐          ║
║       │          LOCAL GOVERNMENT (UAT)              │          ║
║       │                                              │          ║
║       │   Receives: Standard cost × pupils          │          ║
║       │   Can add: Own budget top-up                │          ║
║       │   Manages: Non-teaching staff, utilities    │          ║
║       └──────────────────────────────────────────────┘          ║
║              │                                                   ║
║              ▼                                                   ║
║       ┌──────────────────────────────────────────────┐          ║
║       │          SCHOOL                              │          ║
║       │                                              │          ║
║       │   • Teaching staff (from ministry via ISJ)  │          ║
║       │   • Utilities, maintenance (from UAT)       │          ║
║       │   • Supplies, materials (from UAT)          │          ║
║       │   • Non-teaching staff (from UAT)           │          ║
║       └──────────────────────────────────────────────┘          ║
║                                                                  ║
║  FUNDING LEAKAGES TO INVESTIGATE:                                ║
║  ────────────────────────────────────────────────────────────   ║
║  □ ISJ administrative overhead vs classroom allocation           ║
║  □ UAT diversion to non-education spending                       ║
║  □ School-level misallocation (admin vs teaching)                ║
║  □ Ghost pupils inflating transfers                              ║
║                                                                  ║
║  [Trace Specific County] [Compare ISJ Overheads] [Pupil Audit]   ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Interactive Element 4: Health vs Education Budget Calculator

Compare investments and returns across both sectors:

```
╔══════════════════════════════════════════════════════════════════╗
║              SECTOR COMPARISON CALCULATOR                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Selected County: [Județul Timiș                            ▼]   ║
║                                                                  ║
║  HEALTH vs EDUCATION BUDGET (2024)                               ║
║  ═══════════════════════════════════════════════════════════════ ║
║                                                                  ║
║                      │ HEALTH          │ EDUCATION       │       ║
║  ────────────────────┼─────────────────┼─────────────────┤       ║
║  Total spending      │ 2.8 billion lei │ 1.9 billion lei │       ║
║  Per capita          │ 4,180 lei       │ N/A             │       ║
║  Per student         │ N/A             │ 8,950 lei       │       ║
║  Personnel %         │ 58%             │ 72%             │       ║
║  Investment %        │ 12%             │ 8%              │       ║
║  EU funds %          │ 8%              │ 4%              │       ║
║                                                                  ║
║  OUTCOME INDICATORS                                              ║
║  ────────────────────────────────────────────────────────────   ║
║                                                                  ║
║  HEALTH:                         │ EDUCATION:                    ║
║  • Hospital beds: 4,200          │ • PISA Reading: 428 (avg)     ║
║  • Doctors/1000: 3.2             │ • Dropout rate: 12%           ║
║  • Wait times: 45 days avg       │ • Teacher/student: 1:18       ║
║  • Preventable deaths: +15% nat  │ • Digital access: 78%         ║
║                                                                  ║
║  INVESTMENT GAP ANALYSIS                                         ║
║  ┌────────────────────────────────────────────────────────────┐  ║
║  │ Both sectors show high personnel costs crowding out        │  ║
║  │ investment in equipment and facilities.                    │  ║
║  │                                                            │  ║
║  │ Health: 12% investment → aging equipment, long waits       │  ║
║  │ Education: 8% investment → outdated labs, no sports        │  ║
║  │                                                            │  ║
║  │ Compare: EU average investment in health is ~18%           │  ║
║  └────────────────────────────────────────────────────────────┘  ║
║                                                                  ║
║  [Trend Analysis] [EU Comparison] [Export Report]                ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Core Content: Sector-Specific Investigation Frameworks

### Health Budget Structure

```
HEALTH FUNDING SOURCES
══════════════════════════════════════════════════════════════════

1. CNAS (National Health Insurance House)
   └── Source: Contributions from employees/employers (10.25%)
   └── Use: DRG payments to hospitals, primary care, drugs
   └── 2024 Budget: ~62 billion lei

2. MINISTRY OF HEALTH
   └── Source: State budget
   └── Use: Public health programs, national hospitals, salaries
   └── 2024 Budget: ~18 billion lei

3. LOCAL BUDGETS
   └── Source: County/city budgets
   └── Use: Local hospital capital, maintenance
   └── Varies by locality

4. FNUASS (Work Accidents Fund)
   └── Source: Employer contributions
   └── Use: Work-related medical care

5. EU FUNDS
   └── Source: PNRR, Cohesion funds
   └── Use: Hospital construction, equipment, digitalization


HOSPITAL REVENUE BREAKDOWN:
────────────────────────────────────────────────────────────────

  ┌─────────────────────────────────────────────────────────────┐
  │                                                             │
  │   DRG Payments (from CNAS)           ████████████████  65%  │
  │   ├── Acute care cases               ██████████████        │
  │   ├── Day hospitalization            ██                    │
  │   └── Emergency cases                ██                    │
  │                                                             │
  │   Ministry Transfers                 █████            20%  │
  │   ├── Personnel (doctors, nurses)    ████                  │
  │   └── National health programs       █                     │
  │                                                             │
  │   Local Government                   ███              10%  │
  │   └── Capital investments, repairs                         │
  │                                                             │
  │   Own Revenue                        ██                5%  │
  │   ├── Self-pay patients                                    │
  │   └── Donations                                            │
  │                                                             │
  └─────────────────────────────────────────────────────────────┘
```

### DRG System Explained

```
UNDERSTANDING DRG (Diagnosis Related Groups)
══════════════════════════════════════════════════════════════════

DRG is a patient classification system that groups cases with
similar clinical characteristics and resource consumption.

HOW IT WORKS:
────────────────────────────────────────────────────────────────

  Patient admitted → Diagnosis coded → DRG assigned → Payment set

  Example:
  ┌────────────────────────────────────────────────────────────┐
  │ Patient: 65-year-old, hip replacement surgery              │
  │ Primary diagnosis: M16.1 (Primary coxarthrosis)           │
  │ Procedure: Total hip arthroplasty                          │
  │                                                            │
  │ DRG Assigned: I04A (Hip replacement, no complications)     │
  │ Weight: 3.24                                               │
  │ Base rate: 2,450 lei                                       │
  │ Hospital payment: 3.24 × 2,450 = 7,938 lei                 │
  └────────────────────────────────────────────────────────────┘

RED FLAGS IN DRG:
────────────────────────────────────────────────────────────────

🔴 UPCODING: Adding complications/comorbidities to get higher DRG
   • Look for: High % of "with complications" codes
   • Compare: Same procedures, different DRG distributions

🔴 CHERRY-PICKING: Selecting profitable cases, avoiding complex
   • Look for: Transfer patterns to other hospitals
   • Compare: Case-mix index vs peer hospitals

🔴 UNBUNDLING: Splitting one admission into multiple episodes
   • Look for: Unusual readmission patterns
   • Compare: Cases per patient vs national average

🔴 PHANTOM CASES: Billing for services not provided
   • Look for: Length of stay = 0 or 1 day for major procedures
   • Compare: Patient complaints vs billing records
```

### Education Budget Structure

```
EDUCATION FUNDING MECHANISM
══════════════════════════════════════════════════════════════════

THE STANDARD COST SYSTEM:
────────────────────────────────────────────────────────────────

  Ministry of Education calculates:

  STANDARD COST = Base amount × Correction coefficients

  Base (2024):  6,235 lei per pupil (pre-university)

  Coefficients:
  ┌────────────────────────────────────────────────────────────┐
  │ Factor                  │ Coefficient range               │
  ├─────────────────────────┼─────────────────────────────────┤
  │ School level            │ 1.0 - 1.5                       │
  │ Urban/Rural             │ 1.0 - 1.2                       │
  │ Special education       │ 2.0 - 3.0                       │
  │ Minority language       │ 1.1 - 1.2                       │
  │ Mountain/isolated area  │ 1.1 - 1.3                       │
  └────────────────────────────────────────────────────────────┘


FUNDING FLOW:
────────────────────────────────────────────────────────────────

        ┌─────────────────┐
        │ STATE BUDGET    │
        │ (Bugetul de     │
        │  stat)          │
        └────────┬────────┘
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
┌─────────────┐       ┌─────────────────────┐
│ TEACHING    │       │ STANDARD COST       │
│ STAFF       │       │ ALLOCATION          │
│ Salaries    │       │                     │
│             │       │ Per pupil × coeff.  │
│ Paid via    │       │ Paid to localities  │
│ ISJ/school  │       │ via ISJ             │
└─────────────┘       └──────────┬──────────┘
                                 │
                                 ▼
                      ┌─────────────────────┐
                      │ LOCAL GOVERNMENT    │
                      │ (Primărie)          │
                      │                     │
                      │ • Utilities         │
                      │ • Maintenance       │
                      │ • Non-teaching staff│
                      │ • Supplies          │
                      │ • Can TOP-UP        │
                      └─────────────────────┘


INVESTIGATION TARGETS:
────────────────────────────────────────────────────────────────

□ Localities using education money for non-education spending
□ "Ghost pupils" - enrolled but not attending
□ School consolidation resistance → maintaining inefficient schools
□ ISJ administrative overhead vs direct school support
□ Gap between allocated and actually spent per pupil
```

---

## Platform Integration: Guided Activity

### Activity: Compare Hospital or School Financing

**Option A: Hospital Investigation**

1. Navigate to Transparenta.eu and find a hospital entity
2. Check their functional code 66 (Health) spending breakdown
3. Look at economic codes:
   - 10 (Personnel) - should be 55-65%
   - 20 (Goods & services) - includes medical supplies
   - 71 (Capital) - equipment, renovation
4. Compare with a similar hospital in another county

**Option B: Education Investigation**

1. Find a county school inspectorate (ISJ)
2. Find local government education spending (functional 65)
3. Calculate per-pupil spending using known enrollment
4. Compare across localities in the same county

**Questions to Answer:**
- Where is the money actually going?
- Are there unexplained differences between similar institutions?
- Is investment (code 71) adequate or being crowded out?

---

## Knowledge Check

Test your understanding of health and education budgets:

```
QUESTION 1:
What is the primary source of hospital revenue in Romania?

A) Local government budget
B) Ministry of Health direct transfer
C) CNAS contract (DRG payments)  ✓
D) Patient self-pay

QUESTION 2:
What does "upcoding" mean in the DRG system?

A) Using modern software
B) Adding false complications to get higher payment  ✓
C) Improving data quality
D) Updating patient records

QUESTION 3:
What is the "standard cost" system in education?

A) Fixed amount all schools receive equally
B) Per-pupil amount with correction coefficients  ✓
C) Competitive grants for best schools
D) EU-funded school improvement program

QUESTION 4:
If a locality's per-pupil spending is 50% above standard cost,
what should you investigate?

A) Nothing, more spending is always better
B) School size, staff ratios, and local top-ups  ✓
C) Only the principal's salary
D) Student test scores
```

---

## Key Takeaways

```
╔══════════════════════════════════════════════════════════════════╗
║                     KEY TAKEAWAYS                                ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  1. Romania spends 5.7% GDP on health and 3.2% on education -   ║
║     both significantly below EU averages - yet outcomes are     ║
║     even worse than spending gaps suggest                        ║
║                                                                  ║
║  2. Hospital funding flows through CNAS (DRG), Ministry, and    ║
║     local budgets - each layer has different accountability     ║
║                                                                  ║
║  3. DRG gaming (upcoding, cherry-picking) is a major source     ║
║     of healthcare waste and fraud                                ║
║                                                                  ║
║  4. Education's "standard cost" system creates per-pupil        ║
║     comparisons that can reveal misallocation                   ║
║                                                                  ║
║  5. High personnel costs (>65%) in both sectors crowd out       ║
║     investment in equipment, facilities, and supplies           ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## Call to Action

**Your Sector Investigation:**

Choose either health or education in your county and investigate:

**Health:**
1. Pick the largest hospital - what's their personnel cost percentage?
2. Find their case-mix index - are they treating complex cases?
3. What's their investment in last 3 years? New equipment?

**Education:**
1. Calculate per-pupil spending across localities in your county
2. Identify the highest and lowest spenders
3. Is there any relationship between spending and dropout rates?

These sectors affect every citizen - your investigation could improve lives.

---

## Technical Notes

### Components Needed

```typescript
// Per-Pupil Spending Comparator
interface SchoolSpending {
  locality: string
  schools: number
  students: number
  totalSpending: number
  perPupilSpending: number
  standardCostRatio: number
  outlierFlag: boolean
}

// Hospital Finance Analyzer
interface HospitalFinance {
  cui: string
  name: string
  revenueBreakdown: {
    cnasContract: number
    ministryTransfer: number
    localBudget: number
    ownRevenue: number
  }
  drgMetrics: {
    cases: number
    caseMixIndex: number
    avgPayment: number
    avgLengthOfStay: number
  }
  personnelPercent: number
  investmentPercent: number
}

// Education Funding Flow
interface EducationFlow {
  level: 'ministry' | 'isj' | 'locality' | 'school'
  allocated: number
  spent: number
  overhead: number
  perPupilReach: number
}
```

### Data Requirements

- School enrollment data by locality
- Standard cost coefficients and base rates
- Hospital DRG case data (aggregated)
- CNAS contract values by hospital
- ISJ budget breakdowns
- Local education spending (functional 65)
- Local health spending (functional 66)

### Platform Routes

- `/entities?type=hospital` - Hospital entities
- `/entities?type=school` - School entities
- `/budget-explorer?functional=65` - Education spending
- `/budget-explorer?functional=66` - Health spending
- `/entity-analytics` - Compare institutions
