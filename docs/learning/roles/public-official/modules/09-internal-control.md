# Module 9: Internal Control System

## Part III: Control & Audit

| Duration | Difficulty | Prerequisites | Next Module |
|----------|------------|---------------|-------------|
| 60-75 min | Intermediate | Modules 1-8 | [Module 10: Internal Audit →](./10-internal-audit.md) |

---

## Learning Objectives

By the end of this module, you will be able to:

- [ ] Explain the five components of the COSO internal control framework
- [ ] Design effective segregation of duties for your institution
- [ ] Create and maintain an institutional risk register
- [ ] Apply the three lines of defense model to your organization
- [ ] Implement internal control standards per OG 119/1999

---

## Introduction

> **Key Insight**: Internal control is not about catching fraud after it happens—it's about designing systems that prevent errors and irregularities before they occur. As a public official, you are both a control subject AND a control owner.

Internal control is the foundation that enables everything else in public finance to work. Without effective controls, budget execution becomes unreliable, reporting becomes questionable, and public trust erodes.

```
┌─────────────────────────────────────────────────────────────┐
│                   THREE LINES OF DEFENSE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1st Line              2nd Line              3rd Line       │
│  ┌─────────┐          ┌─────────┐          ┌─────────┐     │
│  │OPERATIONS│          │OVERSIGHT│          │ASSURANCE│     │
│  │         │          │         │          │         │     │
│  │ • Daily │          │ • CFPP  │          │ • Audit │     │
│  │   tasks │    →     │ • Risk  │    →     │ • Review│     │
│  │ • Self- │          │   mgmt  │          │ • Report│     │
│  │   check │          │ • Comp- │          │ • Recom-│     │
│  │         │          │   liance│          │   mend  │     │
│  └─────────┘          └─────────┘          └─────────┘     │
│       │                    │                    │           │
│       ▼                    ▼                    ▼           │
│   Owns and            Monitors and         Independent      │
│   manages risk        advises              assurance        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              ↓ GOVERNING BODY (Ordonator) ↓                 │
│              Oversight, Direction, Accountability           │
└─────────────────────────────────────────────────────────────┘
```

---

## Interactive Element 1: COSO Framework Explorer

The COSO (Committee of Sponsoring Organizations) framework provides the internationally recognized standard for internal control. Romanian regulations align with this framework.

```
┌─────────────────────────────────────────────────────────────┐
│                    COSO FRAMEWORK EXPLORER                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                     ┌─────────────────┐                     │
│                     │ CONTROL         │                     │
│                     │ ENVIRONMENT     │  ← Foundation       │
│                     │ "Tone at top"   │                     │
│                     └────────┬────────┘                     │
│                              │                              │
│          ┌───────────────────┼───────────────────┐          │
│          ▼                   ▼                   ▼          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │    RISK      │   │   CONTROL    │   │ INFORMATION  │    │
│  │  ASSESSMENT  │   │  ACTIVITIES  │   │    AND       │    │
│  │              │   │              │   │COMMUNICATION │    │
│  │ Identify &   │   │ Policies &   │   │ Accurate &   │    │
│  │ analyze      │   │ procedures   │   │ timely       │    │
│  └──────────────┘   └──────────────┘   └──────────────┘    │
│          │                   │                   │          │
│          └───────────────────┼───────────────────┘          │
│                              ▼                              │
│                     ┌─────────────────┐                     │
│                     │   MONITORING    │  ← Continuous       │
│                     │   ACTIVITIES    │    improvement      │
│                     └─────────────────┘                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [1. Environment] [2. Risk] [3. Activities] [4. Info] [5.] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Component Selected: CONTROL ENVIRONMENT                    │
│  ─────────────────────────────────────────                  │
│                                                             │
│  What it means:                                             │
│  The set of standards, processes, and structures that       │
│  provide the basis for carrying out internal control.       │
│  It's the "tone at the top" set by leadership.              │
│                                                             │
│  Key elements:                                              │
│  • Integrity and ethical values                             │
│  • Commitment to competence                                 │
│  • Management philosophy and operating style                │
│  • Organizational structure                                 │
│  • Human resource policies                                  │
│                                                             │
│  Your responsibility:                                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ✓ Lead by example—follow procedures yourself       │    │
│  │ ✓ Communicate expectations clearly                 │    │
│  │ ✓ Hold staff accountable consistently              │    │
│  │ ✓ Support control function independence            │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Romanian regulation: OSGG 600/2018, Standard 1             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### COSO Component Details

| Component | Purpose | Key Questions |
|-----------|---------|---------------|
| **1. Control Environment** | Sets the tone | Do leaders model ethical behavior? |
| **2. Risk Assessment** | Identifies threats | What could go wrong? How likely? How severe? |
| **3. Control Activities** | Prevents/detects | What policies and procedures mitigate risks? |
| **4. Information & Communication** | Enables function | Is the right information reaching the right people? |
| **5. Monitoring Activities** | Ensures effectiveness | Are controls working? How do we know? |

---

## Interactive Element 2: Segregation of Duties Matrix Builder

Segregation of duties (SoD) is a fundamental control principle. No single person should control all aspects of a transaction from initiation to completion.

```
┌─────────────────────────────────────────────────────────────┐
│              SEGREGATION OF DUTIES MATRIX BUILDER           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INCOMPATIBLE FUNCTION PAIRS                                │
│  ─────────────────────────────────────────                  │
│                                                             │
│  ┌─────────────┐     ✗     ┌─────────────┐                 │
│  │  AUTHORIZE  │ ──────── │   EXECUTE   │                 │
│  │ (Approval)  │  Cannot   │ (Processing)│                 │
│  └─────────────┘  combine  └─────────────┘                 │
│                                                             │
│  ┌─────────────┐     ✗     ┌─────────────┐                 │
│  │   CUSTODY   │ ──────── │   RECORD    │                 │
│  │ (Physical)  │  Cannot   │(Accounting) │                 │
│  └─────────────┘  combine  └─────────────┘                 │
│                                                             │
│  ┌─────────────┐     ✗     ┌─────────────┐                 │
│  │   RECORD    │ ──────── │   VERIFY    │                 │
│  │(Accounting) │  Cannot   │ (Reconcile) │                 │
│  └─────────────┘  combine  └─────────────┘                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  BUILD YOUR MATRIX                                          │
│                                                             │
│  Process: [Procurement       ▼]                             │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Function          │ Person A │ Person B │ Person C │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Initiate request  │   [✓]    │   [ ]    │   [ ]    │  │
│  │ Approve request   │   [ ]    │   [✓]    │   [ ]    │  │
│  │ Issue order       │   [ ]    │   [ ]    │   [✓]    │  │
│  │ Receive goods     │   [✓]    │   [ ]    │   [ ]    │  │
│  │ Approve invoice   │   [ ]    │   [✓]    │   [ ]    │  │
│  │ Process payment   │   [ ]    │   [ ]    │   [✓]    │  │
│  │ Record in books   │   [ ]    │   [ ]    │   [✓]    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ⚠️ CONFLICT DETECTED:                                      │
│  Person A: "Initiate request" + "Receive goods"             │
│  Risk: Could order items for personal use                   │
│                                                             │
│  Recommendation: Separate receipt from initiation OR        │
│  add independent verification of received goods             │
│                                                             │
│  [ Check Matrix ] [ View Ideal Setup ] [ Export ]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Common SoD Violations and Remediation

```
┌─────────────────────────────────────────────────────────────┐
│  SMALL INSTITUTION CHALLENGE                                │
│                                                             │
│  When you don't have enough staff for full segregation:     │
│                                                             │
│  Compensating Controls:                                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │ • Supervisory review of all transactions           │    │
│  │ • Independent reconciliation by another person     │    │
│  │ • Dual signatures above threshold (e.g., 10,000 lei)   │
│  │ • Rotation of duties                               │    │
│  │ • Surprise audits                                  │    │
│  │ • Exception reporting                              │    │
│  │ • CFPP verification (mandatory)                    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  Minimum: CFPP must ALWAYS be separate from ordonator       │
│  (This is mandatory under OG 119/1999, not optional)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Interactive Element 3: Risk Register Creator

Risk registers document identified risks, their assessment, and planned responses. Every public institution should maintain one.

```
┌─────────────────────────────────────────────────────────────┐
│                   RISK REGISTER CREATOR                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  RISK IDENTIFICATION                                        │
│                                                             │
│  Risk Title: [________________________]                     │
│                                                             │
│  Category: [Financial ▼]                                    │
│  • Financial    • Operational    • Compliance               │
│  • Reputational • Strategic      • IT/Cyber                 │
│                                                             │
│  Description:                                               │
│  [__________________________________________________]      │
│  [__________________________________________________]      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  RISK ASSESSMENT                                            │
│                                                             │
│  PROBABILITY                    IMPACT                      │
│  ───────────                    ──────                      │
│  ○ 1 - Rare (< 5%)              ○ 1 - Minor                │
│  ○ 2 - Unlikely (5-25%)         ○ 2 - Moderate             │
│  ● 3 - Possible (25-50%)        ● 3 - Major                │
│  ○ 4 - Likely (50-75%)          ○ 4 - Severe               │
│  ○ 5 - Almost certain (>75%)    ○ 5 - Catastrophic         │
│                                                             │
│            RISK SCORE = 3 × 3 = 9 (MEDIUM-HIGH)             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    RISK HEAT MAP                                    │   │
│  │         Impact →                                    │   │
│  │    P  1    2    3    4    5                         │   │
│  │    r  ┌────┬────┬────┬────┬────┐                   │   │
│  │    o 5│ 5  │ 10 │ 15 │ 20 │ 25 │ ← Critical        │   │
│  │    b  ├────┼────┼────┼────┼────┤                   │   │
│  │    a 4│ 4  │ 8  │ 12 │ 16 │ 20 │ ← High            │   │
│  │    b  ├────┼────┼────┼────┼────┤                   │   │
│  │    i 3│ 3  │ 6  │[9] │ 12 │ 15 │ ← Medium          │   │
│  │    l  ├────┼────┼────┼────┼────┤                   │   │
│  │    i 2│ 2  │ 4  │ 6  │ 8  │ 10 │ ← Low             │   │
│  │    t  ├────┼────┼────┼────┼────┤                   │   │
│  │    y 1│ 1  │ 2  │ 3  │ 4  │ 5  │ ← Minimal         │   │
│  │    ↓  └────┴────┴────┴────┴────┘                   │   │
│  │                                                     │   │
│  │    [9] = Your current risk position                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  RISK RESPONSE                                              │
│                                                             │
│  Response Strategy: [Mitigate ▼]                            │
│  • Accept   - Live with it (low risks)                      │
│  • Mitigate - Reduce probability or impact                  │
│  • Transfer - Insurance, outsourcing                        │
│  • Avoid    - Don't do the activity                         │
│                                                             │
│  Planned Controls:                                          │
│  [__________________________________________________]      │
│                                                             │
│  Risk Owner: [__________________]                           │
│  Review Date: [__/__/____]                                  │
│                                                             │
│  [ Add Risk ] [ View Register ] [ Export to PDF ]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Sample Risk Register Entry

| Field | Example Value |
|-------|---------------|
| **Risk ID** | FIN-001 |
| **Title** | Delayed supplier payments |
| **Category** | Financial |
| **Description** | Failure to pay suppliers within 30 days leads to penalties and damaged relationships |
| **Probability** | 3 - Possible |
| **Impact** | 3 - Major (penalties + reputation) |
| **Score** | 9 (Medium-High) |
| **Response** | Mitigate |
| **Controls** | Weekly cash flow review, payment calendar alerts, prioritization matrix |
| **Owner** | Compartment financiar-contabil |
| **Status** | Active |

---

## Interactive Element 4: Internal Control Standards Self-Assessment

Romania has 16 internal control standards (OSGG 600/2018). Use this tool to assess your institution's compliance.

```
┌─────────────────────────────────────────────────────────────┐
│          INTERNAL CONTROL STANDARDS SELF-ASSESSMENT        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OSGG 600/2018 - 16 Standards                               │
│                                                             │
│  CONTROL ENVIRONMENT                                        │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Standard 1: Ethics and Integrity                   │    │
│  │ [ ] Code of conduct exists                         │    │
│  │ [ ] Staff trained on ethics                        │    │
│  │ [ ] Conflict of interest declarations filed        │    │
│  │ Status: ○ Implemented ○ Partial ○ Not implemented  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Standard 2: Duties, Functions, Tasks               │    │
│  │ [ ] Organizational chart current                   │    │
│  │ [ ] Job descriptions exist for all positions      │    │
│  │ [ ] Segregation of duties documented               │    │
│  │ Status: ○ Implemented ● Partial ○ Not implemented  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Standard 3: Competence, Performance                │    │
│  │ [ ] Training needs identified                      │    │
│  │ [ ] Annual performance evaluations                 │    │
│  │ [ ] Competency development plans                   │    │
│  │ Status: ○ Implemented ○ Partial ● Not implemented  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  [Expand All Standards ▼]                                   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  SUMMARY DASHBOARD                                          │
│                                                             │
│  ┌───────────────┬───────────────┬───────────────┐         │
│  │  Implemented  │    Partial    │ Not Implemented│         │
│  │      6        │       7       │       3       │         │
│  │    37.5%      │    43.75%     │    18.75%     │         │
│  │   ████████    │  ███████████  │    █████      │         │
│  │    Green      │    Yellow     │     Red       │         │
│  └───────────────┴───────────────┴───────────────┘         │
│                                                             │
│  Overall Score: PARTIAL COMPLIANCE (62%)                    │
│                                                             │
│  Priority Actions:                                          │
│  1. Standard 3: Create competency development plans         │
│  2. Standard 10: Update IT security procedures              │
│  3. Standard 14: Document monitoring activities             │
│                                                             │
│  [ Generate Report ] [ Create Action Plan ] [ Compare ]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 16 Internal Control Standards (OSGG 600/2018)

| # | Standard | Category |
|---|----------|----------|
| 1 | Ethics and Integrity | Environment |
| 2 | Duties, Functions, Tasks | Environment |
| 3 | Competence, Performance | Environment |
| 4 | Organizational Structure | Environment |
| 5 | Objectives | Risk Assessment |
| 6 | Risk Management | Risk Assessment |
| 7 | Monitoring Performance | Risk Assessment |
| 8 | Procedure Documentation | Control Activities |
| 9 | Supervision | Control Activities |
| 10 | Business Continuity | Control Activities |
| 11 | Information and Communication | Info & Comm |
| 12 | Management Reporting | Info & Comm |
| 13 | Accounting and Financial Reporting | Info & Comm |
| 14 | Evaluation of Control System | Monitoring |
| 15 | Internal Audit | Monitoring |
| 16 | Quality Assurance | Monitoring |

---

## Core Concepts

### The Internal Control Pyramid

```
┌─────────────────────────────────────────────────────────────┐
│                 INTERNAL CONTROL PYRAMID                    │
│                                                             │
│                          ╱╲                                 │
│                         ╱  ╲                                │
│                        ╱ 1  ╲   Preventive                  │
│                       ╱ CFPP ╲  (Stop before)               │
│                      ╱────────╲                             │
│                     ╱    2     ╲  Detective                 │
│                    ╱ Internal   ╲ (Find during)             │
│                   ╱   Audit      ╲                          │
│                  ╱────────────────╲                         │
│                 ╱       3          ╲ Corrective             │
│                ╱   Management       ╲ (Fix after)           │
│               ╱     Review           ╲                      │
│              ╱────────────────────────╲                     │
│             ╱          4               ╲ External           │
│            ╱    External Audit          ╲ Assurance         │
│           ╱    (Curtea de Conturi)       ╲                  │
│          ╱────────────────────────────────╲                 │
│                                                             │
│  Effectiveness increases ↑    Cost decreases ↓              │
│  (Prevention is cheapest)                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Control Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Preventive** | Stop problems before they occur | CFPP visa, segregation of duties, authorization limits |
| **Detective** | Identify problems when they occur | Reconciliations, exception reports, variance analysis |
| **Corrective** | Fix problems after they occur | Error correction procedures, disciplinary actions |
| **Directive** | Guide toward desired outcomes | Policies, procedures, training |

### CFPP as Core Preventive Control

```
┌─────────────────────────────────────────────────────────────┐
│               CFPP - THE CORE PREVENTIVE CONTROL            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  OG 119/1999 - Controlul Financiar Preventiv Propriu        │
│                                                             │
│  Transaction enters → CFPP Review → Visa Decision           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               CFPP VERIFICATION CHECKLIST            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 1. Legal basis exists                     [ ]       │   │
│  │ 2. Budget credits available               [ ]       │   │
│  │ 3. Supporting documents complete          [ ]       │   │
│  │ 4. Calculation correct                    [ ]       │   │
│  │ 5. Segregation of duties respected        [ ]       │   │
│  │ 6. Previous phases completed (ALOP)       [ ]       │   │
│  │ 7. Beneficiary entitled to payment        [ ]       │   │
│  │ 8. Approval signatures present            [ ]       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ All checked? → VIZĂ CFPP                            │   │
│  │ Any missing?  → REFUZ (with written justification)  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  CFPP INDEPENDENCE REQUIREMENT                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • CFPP person appointed by ordonator                │   │
│  │ • Cannot be disciplined for refusing visa           │   │
│  │ • Cannot perform incompatible functions             │   │
│  │ • Must report refusals to ordonator                 │   │
│  │ • Ordonator can override but assumes responsibility │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Platform Integration

### Benchmarking Control Effectiveness

Use Transparenta.eu to benchmark your control environment:

**Activity 1: Execution Rate Analysis**
```
Navigate to: /entity-analytics

Your institution's execution rate compared to peers indicates
control effectiveness:

• Very low execution (<70%): May indicate excessive controls
  blocking legitimate transactions OR poor planning

• High execution with high amendments (>80% + many virări):
  May indicate weak controls allowing errors through

• High execution with low amendments (>85%, few changes):
  Indicates good planning AND effective controls

Compare your institution to similar entities:
→ Filter by organizational level (OPC, OSC, OTC)
→ Filter by same county/region
→ Look for outliers in both directions
```

**Activity 2: Error Pattern Detection**
```
Navigate to: /budget-explorer

Analyze spending patterns that may indicate control weaknesses:

• Unusual year-end spikes: Control override pressure?
• Consistent budget line overruns: Weak commitment control?
• Large transfers between chapters: Planning problems?

Your profile: [Select your entity]
Peer average: [Auto-calculated]
Variance: [Highlighted if significant]
```

---

## Knowledge Check

Test your understanding of internal control concepts.

### Question 1
Which COSO component provides the foundation for all other components?

- A) Risk Assessment
- B) Control Activities
- C) Control Environment
- D) Monitoring Activities

<details>
<summary>Show Answer</summary>

**C) Control Environment**

The control environment is the foundation—it sets the "tone at the top" and creates the discipline and structure that enable all other components to function effectively. Without a strong control environment, the other components will be ineffective.
</details>

### Question 2
A CFPP officer wants to refuse a visa because the legal basis is unclear. The ordonator insists the transaction proceed. What happens?

- A) CFPP must grant the visa if ordonator insists
- B) CFPP refuses, ordonator can override taking personal responsibility
- C) The transaction is cancelled
- D) CFPP must escalate to Curtea de Conturi

<details>
<summary>Show Answer</summary>

**B) CFPP refuses, ordonator can override taking personal responsibility**

Per OG 119/1999, if CFPP refuses a visa and the ordonator disagrees, the ordonator may approve the transaction in writing, but assumes personal responsibility for the consequences. This is the "ordonator override" provision.
</details>

### Question 3
In a small institution with only 5 staff, which segregation of duties is MANDATORY and cannot be compensated?

- A) Initiation and approval of purchases
- B) Recording and reconciliation
- C) CFPP and ordonator functions
- D) Receipt and inspection of goods

<details>
<summary>Show Answer</summary>

**C) CFPP and ordonator functions**

While other functions can use compensating controls in small institutions, OG 119/1999 absolutely requires that the CFPP function be separate from the ordonator. This is the only truly non-negotiable segregation. The CFPP person cannot be the ordonator or deputy ordonator.
</details>

### Question 4
A risk has probability 4 (Likely) and impact 2 (Moderate). What is the appropriate response strategy?

- A) Accept - the risk is too low to address
- B) Avoid - stop the activity entirely
- C) Mitigate - implement controls to reduce probability or impact
- D) Transfer - buy insurance

<details>
<summary>Show Answer</summary>

**C) Mitigate - implement controls to reduce probability or impact**

Risk score = 4 × 2 = 8 (Medium). This is above the typical acceptance threshold but not severe enough to avoid entirely. Mitigation through controls is the appropriate response. Given the high probability, focus on controls that reduce likelihood of occurrence.
</details>

---

## Key Takeaways

1. **Internal control is everyone's responsibility** - You are both subject to controls AND responsible for implementing them in your area

2. **Prevention beats detection** - Invest in preventive controls (CFPP, segregation, authorization) rather than trying to find problems after they occur

3. **COSO provides the framework** - Five components, 17 principles, all aligned with Romanian regulations (OSGG 600/2018)

4. **Segregation of duties is fundamental** - But small institutions can use compensating controls (except CFPP/ordonator separation)

5. **Risk registers are living documents** - Create them, maintain them, use them for decision-making and resource allocation

---

## Call to Action

Start strengthening your internal control environment:

### Immediate (This Week)
- [ ] Review your institution's CFPP refusal rate
- [ ] Verify CFPP independence is maintained
- [ ] Check that key segregations exist (or compensating controls)

### Short-term (This Month)
- [ ] Complete self-assessment using the 16 standards
- [ ] Identify top 3 control gaps
- [ ] Create action plan for highest-risk gaps

### Medium-term (This Quarter)
- [ ] Build or update your risk register
- [ ] Train staff on control responsibilities
- [ ] Benchmark your execution patterns on Transparenta.eu

> **Benchmark Yourself**: Visit /entity-analytics to compare your execution rates and amendment patterns against peer institutions. Unusual patterns may indicate control weaknesses to address.

---

## Module Navigation

| Previous | Current | Next |
|----------|---------|------|
| [← Module 8: Accounting & Reporting](./08-accounting-reporting.md) | **Module 9: Internal Control System** | [Module 10: Internal Audit →](./10-internal-audit.md) |

---

## Technical Notes

### Component Requirements

```typescript
interface COSOComponent {
  id: 'environment' | 'risk' | 'activities' | 'info' | 'monitoring'
  name: string
  description: string
  principles: Principle[]
  yourResponsibilities: string[]
  regulatoryReference: string
}

interface SegregationMatrix {
  process: string
  functions: Function[]
  assignments: Map<Function, Person[]>
  conflicts: Conflict[]
  compensatingControls: string[]
}

interface RiskRegisterEntry {
  id: string
  title: string
  category: 'financial' | 'operational' | 'compliance' | 'reputational' | 'strategic' | 'it'
  description: string
  probability: 1 | 2 | 3 | 4 | 5
  impact: 1 | 2 | 3 | 4 | 5
  score: number
  response: 'accept' | 'mitigate' | 'transfer' | 'avoid'
  controls: string[]
  owner: string
  status: 'active' | 'closed' | 'monitoring'
  reviewDate: Date
}

interface StandardAssessment {
  standardId: number
  standardName: string
  category: 'environment' | 'risk' | 'activities' | 'info' | 'monitoring'
  checklistItems: ChecklistItem[]
  status: 'implemented' | 'partial' | 'not_implemented'
  evidence: string[]
  gaps: string[]
  actionPlan: Action[]
}
```

### Data Requirements

- Internal control standards (OSGG 600/2018)
- Risk assessment matrices and scoring guidelines
- Segregation of duties requirements by process
- CFPP procedures and refusal statistics
- Peer comparison data from entity-analytics

### API Endpoints

- `GET /api/entities/{cui}/execution-patterns` - Execution rate trends
- `GET /api/entities/{cui}/amendments` - Budget modification history
- `GET /api/benchmark/execution-rate` - Peer comparison data

### Legal References

- **OG 119/1999**: Internal control framework, CFPP requirements
- **OSGG 600/2018**: 16 internal control standards
- **Legea 500/2002**: Ordonator responsibilities
- **Legea 672/2002**: Internal audit (see Module 10)
