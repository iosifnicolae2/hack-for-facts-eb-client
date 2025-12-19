# Module 1: The Public Official's Role

## Module Overview

| Aspect | Details |
|--------|---------|
| **Duration** | 45-60 minutes |
| **Difficulty** | Beginner |
| **Prerequisites** | None |
| **Next Module** | [Module 2: Legal Framework Mastery](./02-legal-framework.md) |

## Learning Objectives

By the end of this module, you will be able to:

- [ ] Explain your position within the public finance system
- [ ] Identify the six core principles of public finance (Legea 500/2002)
- [ ] Understand the ordonator de credite hierarchy (OPC, OSC, OTC)
- [ ] Recognize the four areas of personal liability
- [ ] Use Transparenta.eu to benchmark your institution against peers

---

## Introduction

### You Are a Steward of Public Resources

As a public official working with budgets, you occupy a position of significant trust. Citizens pay taxes expecting those funds to be managed with integrity, efficiency, and transparency. Your role is not merely administrative—it is fundamentally about maintaining public trust.

> **Key Insight:** Every budget decision you make is visible to the public. Transparenta.eu allows citizens, journalists, and oversight bodies to see how your institution spends public money. Understanding this visibility is the first step to excellence in public finance.

---

## Interactive Element 1: Role Explorer Cards

Explore the three dimensions of your role as a public official managing public funds.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    YOUR ROLE IN PUBLIC FINANCE                          │
│                                                                         │
│   ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│   │   STEWARD OF    │  │    AGENT OF     │  │   GUARDIAN OF   │        │
│   │   PUBLIC        │  │   TRANSPARENCY  │  │    LEGALITY     │        │
│   │   RESOURCES     │  │                 │  │                 │        │
│   │                 │  │                 │  │                 │        │
│   │  [Click to      │  │  [Click to      │  │  [Click to      │        │
│   │   explore →]    │  │   explore →]    │  │   explore →]    │        │
│   └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
│   ════════════════════════════════════════════════════════════════     │
│                                                                         │
│   STEWARD OF PUBLIC RESOURCES                                          │
│   ─────────────────────────────                                        │
│                                                                         │
│   As a steward, you are entrusted with managing money that             │
│   belongs to the public. This means:                                   │
│                                                                         │
│   ✓ Ensuring value for money in every transaction                      │
│   ✓ Protecting assets from waste, fraud, and misuse                    │
│   ✓ Making decisions that serve the public interest                    │
│   ✓ Maintaining accurate records of all transactions                   │
│                                                                         │
│   Legal basis: Constituția României, Art. 137                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Suggested Implementation

```typescript
interface RoleCard {
  id: 'steward' | 'transparency' | 'legality'
  title: string
  subtitle: string
  description: string
  responsibilities: string[]
  legalBasis: string
  examples: {
    good: string
    bad: string
  }
}
```

---

## Interactive Element 2: Liability Matrix

Understand the four types of personal liability you face as a public official.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PERSONAL LIABILITY MATRIX                          │
│                                                                         │
│   Click each cell to see examples and mitigation strategies            │
│                                                                         │
│   ┌─────────────┬──────────────────┬─────────────────────────────────┐ │
│   │ LIABILITY   │ RISK LEVEL       │ EXAMPLE TRIGGER                 │ │
│   │ TYPE        │                  │                                 │ │
│   ├─────────────┼──────────────────┼─────────────────────────────────┤ │
│   │ FINANCIAL   │ ████████░░ HIGH  │ Approving payment without       │ │
│   │             │                  │ legal basis                     │ │
│   ├─────────────┼──────────────────┼─────────────────────────────────┤ │
│   │ ADMINIS-    │ ██████░░░░ MED   │ Missing reporting deadlines     │ │
│   │ TRATIVE     │                  │                                 │ │
│   ├─────────────┼──────────────────┼─────────────────────────────────┤ │
│   │ CRIMINAL    │ ████░░░░░░ LOW*  │ Embezzlement, abuse of office   │ │
│   │             │                  │ (*severe if triggered)          │ │
│   ├─────────────┼──────────────────┼─────────────────────────────────┤ │
│   │ POLITICAL   │ ██████░░░░ MED   │ Poor execution, public scandal  │ │
│   │             │                  │                                 │ │
│   └─────────────┴──────────────────┴─────────────────────────────────┘ │
│                                                                         │
│   ═══════════════════════════════════════════════════════════════════  │
│                                                                         │
│   SELECTED: FINANCIAL LIABILITY                                        │
│   ────────────────────────────────                                     │
│                                                                         │
│   Personal financial liability means you may be required to            │
│   repay public funds from your own pocket if you authorize             │
│   illegal payments.                                                     │
│                                                                         │
│   MITIGATION STRATEGIES:                                               │
│   ✓ Always verify legal basis before approval                          │
│   ✓ Obtain CFPP visa before commitment                                 │
│   ✓ Document all decisions in writing                                  │
│   ✓ Follow the ALOP procedure strictly                                 │
│                                                                         │
│   Legal basis: Legea 500/2002, Art. 14(2)                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Suggested Implementation

```typescript
interface LiabilityType {
  type: 'financial' | 'administrative' | 'criminal' | 'political'
  riskLevel: number // 1-10
  description: string
  triggers: string[]
  consequences: string[]
  mitigationStrategies: string[]
  legalBasis: string
  caseStudies: {
    description: string
    outcome: string
    lesson: string
  }[]
}
```

---

## Interactive Element 3: Authority Hierarchy Navigator

Explore the three-tier ordonator de credite system and understand delegation of authority.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   ORDONATOR DE CREDITE HIERARCHY                        │
│                                                                         │
│   Click each level to see responsibilities and reporting lines         │
│                                                                         │
│                    ┌─────────────────────────┐                          │
│                    │   ORDONATOR PRINCIPAL   │                          │
│                    │     DE CREDITE (OPC)    │                          │
│                    │                         │                          │
│                    │  • Minister             │                          │
│                    │  • Primar               │                          │
│                    │  • Președinte CJ        │                          │
│                    │                         │                          │
│                    │  Full budget authority  │                          │
│                    └───────────┬─────────────┘                          │
│                                │                                        │
│              ┌─────────────────┴─────────────────┐                      │
│              ▼                                   ▼                      │
│   ┌─────────────────────────┐     ┌─────────────────────────┐          │
│   │   ORDONATOR SECUNDAR    │     │   ORDONATOR SECUNDAR    │          │
│   │     DE CREDITE (OSC)    │     │     DE CREDITE (OSC)    │          │
│   │                         │     │                         │          │
│   │  • ISJ (Education)      │     │  • DSP (Health)         │          │
│   │  • Regional bodies      │     │  • Prefectura           │          │
│   │                         │     │                         │          │
│   │  Coordinates tertiary   │     │  Coordinates tertiary   │          │
│   └───────────┬─────────────┘     └───────────┬─────────────┘          │
│               │                               │                         │
│      ┌────────┴────────┐             ┌────────┴────────┐                │
│      ▼                 ▼             ▼                 ▼                │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│   │   OTC    │   │   OTC    │   │   OTC    │   │   OTC    │            │
│   │  School  │   │  School  │   │ Hospital │   │  Agency  │            │
│   │    A     │   │    B     │   │          │   │          │            │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘            │
│                                                                         │
│   ════════════════════════════════════════════════════════════════     │
│                                                                         │
│   YOUR POSITION: [Select from dropdown ▼]                               │
│                                                                         │
│   Based on your selection, your key responsibilities are:              │
│   • Report to: [Superior ordonator]                                    │
│   • Authority: [Budget limits and delegation scope]                    │
│   • Accountability: [What you're responsible for]                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Suggested Implementation

```typescript
interface OrdonatorLevel {
  level: 'OPC' | 'OSC' | 'OTC'
  title: string
  examples: string[]
  reportsTo: OrdonatorLevel | 'Parliament' | 'Council'
  authority: {
    budgetApproval: boolean
    creditTransfers: boolean
    commitmentAuthority: boolean
    paymentAuthorization: boolean
  }
  responsibilities: string[]
  delegationScope: string
}

interface HierarchyPosition {
  currentLevel: OrdonatorLevel
  superiorChain: OrdonatorLevel[]
  subordinates: OrdonatorLevel[]
  legalBasis: string
}
```

---

## Core Concepts

### The Six Principles of Public Finance

These principles are legally mandated by Legea 500/2002, Chapter II. Every budget decision you make must align with them.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 SIX PRINCIPLES OF PUBLIC FINANCE                        │
│                      (Legea 500/2002, Cap. II)                          │
│                                                                         │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │  1. PUBLICITATE (Publicity)                    Art. 9         │    │
│   │     • Proactively disclose budget information                 │    │
│   │     • Citizens have right to know how money is spent          │    │
│   └───────────────────────────────────────────────────────────────┘    │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │  2. UNITATE (Unity)                            Art. 10        │    │
│   │     • All revenues and expenses in one budget                 │    │
│   │     • No parallel "shadow" budgets allowed                    │    │
│   └───────────────────────────────────────────────────────────────┘    │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │  3. UNIVERSALITATE (Universality)              Art. 8         │    │
│   │     • Gross recording of all transactions                     │    │
│   │     • No netting of revenues and expenses                     │    │
│   └───────────────────────────────────────────────────────────────┘    │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │  4. ANUALITATE (Annuality)                     Art. 11        │    │
│   │     • Budget approved yearly                                  │    │
│   │     • Respect timeframes and deadlines                        │    │
│   └───────────────────────────────────────────────────────────────┘    │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │  5. SPECIALIZARE (Specificity)                 Art. 12        │    │
│   │     • Spend only for approved purposes                        │    │
│   │     • Classification determines what money can fund           │    │
│   └───────────────────────────────────────────────────────────────┘    │
│   ┌───────────────────────────────────────────────────────────────┐    │
│   │  6. LEGALITATE (Legality)                      Art. 14(2)     │    │
│   │     • All actions must have legal basis                       │    │
│   │     • No payment without legal authorization                  │    │
│   └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### The Public Trust Relationship

```
                         PUBLIC TRUST
                              │
        Citizens ────────────►│◄──────────── Taxpayers
                              │
                              ▼
                 ┌─────────────────────┐
                 │   PUBLIC OFFICIAL   │
                 │                     │
                 │  • Steward of       │
                 │    public resources │
                 │  • Agent of         │
                 │    transparency     │
                 │  • Guardian of      │
                 │    legality         │
                 └─────────────────────┘
                              │
                              ▼
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   Efficiency          Effectiveness         Accountability
   (cost control)      (results)             (transparency)
```

---

## Platform Integration: Benchmark Your Institution

### Guided Activity: See How Others See You

Understanding how your institution appears on Transparenta.eu helps you anticipate questions from citizens, journalists, and oversight bodies.

**Step 1: Find Your Institution**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     FIND YOUR INSTITUTION                               │
│                                                                         │
│   Search: [ Your institution name_________________ ] [Search]          │
│                                                                         │
│   Or browse by:                                                        │
│   ○ Ministry/Department                                                │
│   ○ County (Județ)                                                     │
│   ○ Institution type (school, hospital, etc.)                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Step 2: Review Key Metrics**

Once you find your institution, note these key indicators:

| Metric | What It Shows | Questions It May Raise |
|--------|---------------|------------------------|
| Execution Rate | % of budget spent | Why low/high execution? |
| Personnel Share | % spent on salaries | Is staffing appropriate? |
| Capital Execution | Investment progress | Are projects on track? |
| Year-over-Year Change | Spending trends | What's driving changes? |

**Step 3: Compare with Peers**

Use Entity Analytics to compare your institution with similar entities:

> **Try it on Transparenta.eu:**
> 1. Open [Entity Analytics](/entity-analytics)
> 2. Search for your institution
> 3. Add 2-3 similar institutions for comparison
> 4. Review execution rates, personnel costs, and investment levels
> 5. Note any significant differences

---

## Knowledge Check

Test your understanding of the public official's role:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         KNOWLEDGE CHECK                                 │
│                                                                         │
│   Question 1 of 4                                                       │
│   ───────────────                                                       │
│                                                                         │
│   Which of the six budget principles requires that all revenues        │
│   and expenses be recorded gross, without netting?                     │
│                                                                         │
│   ○ A) Publicitate (Publicity)                                         │
│   ○ B) Universalitate (Universality)                                   │
│   ○ C) Specializare (Specificity)                                      │
│   ○ D) Unitate (Unity)                                                 │
│                                                                         │
│   [Submit Answer]                                                       │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────    │
│                                                                         │
│   Question 2 of 4                                                       │
│   ───────────────                                                       │
│                                                                         │
│   An Ordonator Terțiar de Credite (OTC) reports to:                    │
│                                                                         │
│   ○ A) Parliament directly                                             │
│   ○ B) Ministry of Finance                                             │
│   ○ C) Ordonator Secundar or Principal de Credite                      │
│   ○ D) Local Council only                                              │
│                                                                         │
│   [Submit Answer]                                                       │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────    │
│                                                                         │
│   Question 3 of 4                                                       │
│   ───────────────                                                       │
│                                                                         │
│   Financial liability means a public official may:                     │
│                                                                         │
│   ○ A) Lose their position                                             │
│   ○ B) Face disciplinary proceedings                                   │
│   ○ C) Be required to repay funds from personal resources              │
│   ○ D) Receive a written warning                                       │
│                                                                         │
│   [Submit Answer]                                                       │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────    │
│                                                                         │
│   Question 4 of 4                                                       │
│   ───────────────                                                       │
│                                                                         │
│   The principle of Specializare (Art. 12) means:                       │
│                                                                         │
│   ○ A) Only specialists can work on budgets                            │
│   ○ B) Money can only be spent for approved purposes                   │
│   ○ C) Each department has a specialized budget                        │
│   ○ D) Budget data must be published in specialized formats            │
│                                                                         │
│   [Submit Answer]                                                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Answers:** 1-B, 2-C, 3-C, 4-B

---

## Key Takeaways

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          KEY TAKEAWAYS                                  │
│                                                                         │
│   ✓ You are a steward of public resources, accountable to citizens     │
│                                                                         │
│   ✓ Six core budget principles are legally mandated (Legea 500/2002):  │
│     Publicitate, Unitate, Universalitate, Anualitate, Specializare,    │
│     Legalitate                                                          │
│                                                                         │
│   ✓ Personal liability extends to four areas: financial,              │
│     administrative, criminal, and political                            │
│                                                                         │
│   ✓ The ordonator hierarchy (OPC → OSC → OTC) defines your authority  │
│     and reporting relationships                                         │
│                                                                         │
│   ✓ Your institution's spending is publicly visible on Transparenta.eu │
│     — understand how it appears to others                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Call to Action

### Next Steps

- [ ] Complete the Role Explorer Cards exercise
- [ ] Identify your position in the ordonator hierarchy
- [ ] Review your institution's profile on Transparenta.eu
- [ ] Note areas where your institution differs from peers
- [ ] Proceed to [Module 2: Legal Framework Mastery](./02-legal-framework.md)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Ready to continue?                                                    │
│                                                                         │
│   [ Mark Module Complete ✓ ]    [ Next Module → ]                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Module Navigation

| Previous | Current | Next |
|----------|---------|------|
| — | Module 1: The Public Official's Role | [Module 2: Legal Framework](./02-legal-framework.md) |

---

## Technical Notes

### Components Needed

- `RoleExplorerCards` — Flip cards for role dimensions
- `LiabilityMatrix` — Interactive liability type explorer
- `HierarchyNavigator` — Ordonator structure visualizer
- `InstitutionFinder` — Search and locate entity
- `PeerComparison` — Side-by-side benchmarking

### Data Requirements

- Entity search functionality
- Execution rates by entity
- Peer institution matching
- Personnel cost ratios

### API Endpoints

- `GET /api/entities/search?q={query}`
- `GET /api/entities/{cui}/metrics`
- `GET /api/entities/{cui}/peers`

### Accessibility

- All interactive elements keyboard-navigable
- Screen reader labels for hierarchy diagram
- High contrast mode for liability matrix
- ARIA labels for card flip interactions
