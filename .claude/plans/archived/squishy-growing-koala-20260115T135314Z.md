# Angajamente Bugetare - Citizen-Friendly Redesign

## The Problem

The current UI is too technical and overwhelming:
- 5 KPI cards with jargon (Credite Bugetare, Receptii Totale, etc.)
- Complex pipeline showing raw numbers
- Detailed accounting breakdowns
- No story, no context, no explanation

**A normal citizen cannot understand what this means.**

---

## Design Philosophy

### Tell a Story, Not Show Data

The budget should be like a household budget story:
> "The city planned to spend 2.6 million RON this year. So far, they've spent 2.29 million (88%). They still owe 64,687 RON for things they've received but haven't paid for yet."

### Progressive Disclosure

```
Level 1: One simple headline (5 seconds)
    ↓
Level 2: Visual story (30 seconds)
    ↓
Level 3: Key insights (1 minute)
    ↓
Level 4: Full details (for experts)
```

### Plain Language First

| Technical Term | Citizen-Friendly |
|---------------|------------------|
| Credite Bugetare | Planned Budget |
| Angajamente | Committed to Spend |
| Receptii | Goods/Services Received |
| Plati | Payments Made |
| Arierate | Unpaid Bills |
| Grad Utilizare | Budget Used |

---

## New Component Design

### 1. Hero Section - "The Big Picture"

**File:** `src/components/angajamente/BudgetStoryHero.tsx`

A single, impactful summary:

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│     ████████████████████░░░░  88%                     │
│                                                        │
│     Budget Used                                        │
│     2,29 mil. RON out of 2,6 mil. RON                 │
│                                                        │
│     "This entity has spent 88% of its planned budget" │
│                                                        │
└────────────────────────────────────────────────────────┘
```

Features:
- Large progress ring or bar (visual focus)
- Simple percentage headline
- Plain language explanation
- No jargon, no technical terms

### 2. Visual Story - "How Money Flows"

**File:** `src/components/angajamente/BudgetJourney.tsx`

A visual journey with icons and simple labels:

```
┌────────────────────────────────────────────────────────┐
│  How Your Tax Money Gets Spent                         │
│                                                        │
│  💰 PLANNED          📝 COMMITTED       📦 RECEIVED   │
│  ─────────────────────────────────────────────────    │
│  2,6 mil RON    →    2,6 mil RON   →   2,35 mil RON  │
│  100%                100%               90%           │
│                                                        │
│                  💸 PAID                               │
│                  ─────────────                         │
│                  2,29 mil RON                          │
│                  88%                                   │
│                                                        │
│  ℹ️ What does this mean?                               │
│  The city committed to spending all its budget,       │
│  received 90% of goods/services, and paid for 88%.    │
└────────────────────────────────────────────────────────┘
```

Features:
- Simple 4-step visual journey
- Icons to make it intuitive
- Percentages relative to the plan
- Expandable explanation at bottom

### 3. Key Insight Card - "What You Should Know"

**File:** `src/components/angajamente/KeyInsight.tsx`

Only shown if there's something noteworthy:

```
┌────────────────────────────────────────────────────────┐
│ ⚠️ Something to Watch                                  │
│                                                        │
│ This entity has 64.687 RON in unpaid bills            │
│                                                        │
│ This means they received goods or services but        │
│ haven't paid for them yet. Large unpaid amounts       │
│ can indicate cash flow problems.                       │
│                                                        │
│ [Learn more about arrears →]                          │
└────────────────────────────────────────────────────────┘
```

OR if everything is healthy:

```
┌────────────────────────────────────────────────────────┐
│ ✅ Budget Health: Good                                 │
│                                                        │
│ This entity is using its budget efficiently.          │
│ All bills are paid, no outstanding obligations.       │
└────────────────────────────────────────────────────────┘
```

### 4. Expandable Details Section

**File:** `src/components/angajamente/BudgetDetails.tsx`

Hidden by default, expandable for those who want more:

```
┌────────────────────────────────────────────────────────┐
│ [▼ Show detailed breakdown]                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Budget Breakdown by Category                           │
│ ┌──────────────────────────────────────┐               │
│ │ Education         ████████░░  800k   │               │
│ │ Healthcare        ██████░░░░  600k   │               │
│ │ Infrastructure    ████░░░░░░  400k   │               │
│ │ Administration    ████░░░░░░  400k   │               │
│ └──────────────────────────────────────┘               │
│                                                        │
│ [▼ Show full data table]                               │
│ (Current AngajamenteTable goes here)                   │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## New Page Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  [BudgetStoryHero - 88% progress ring]                 │
│  "Sibiu has used 88% of its 2025 budget"               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [BudgetJourney - visual flow]                         │
│  Planned → Committed → Received → Paid                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [KeyInsight - warning or health status]               │
│  ⚠️ 64k RON in unpaid bills                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [▼ Show more details]                                 │
│  (collapsed by default)                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/angajamente/AngajamenteKPIs.tsx` | **DELETE** - Replace with BudgetStoryHero |
| `src/components/angajamente/CommitmentPipeline.tsx` | **REWRITE** - Become BudgetJourney |
| `src/components/angajamente/AngajamenteBreakdown.tsx` | **MOVE** - Into expandable section |
| `src/components/angajamente/AngajamenteTable.tsx` | **MOVE** - Into expandable section |

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/angajamente/BudgetStoryHero.tsx` | Hero section with progress ring |
| `src/components/angajamente/BudgetJourney.tsx` | Visual 4-step story |
| `src/components/angajamente/KeyInsight.tsx` | Warning or health status card |
| `src/components/angajamente/BudgetDetails.tsx` | Expandable details wrapper |

## Files to Update

| File | Change |
|------|--------|
| `src/components/entities/views/AngajamenteView.tsx` | New layout with story-first components |
| `src/components/angajamente/index.ts` | Export new components |

---

## Copy/Language Guidelines

### Headlines (use these exact words)
- "Budget Used" (not "Utilization Rate")
- "Planned Budget" (not "Credite Bugetare")
- "Payments Made" (not "Plati Trezor")
- "Unpaid Bills" (not "Arierate")

### Explanations (plain language)
- "This entity planned to spend X and has spent Y so far"
- "They received goods worth X but have only paid Y"
- "Unpaid bills are things received but not yet paid for"

### Status Labels
- "On Track" (>90% utilization, no arrears)
- "Something to Watch" (arrears > 0 or utilization < 70%)
- "Needs Attention" (significant arrears or very low utilization)

---

## Implementation Order

1. **BudgetStoryHero** - The visual centerpiece
2. **BudgetJourney** - The story flow
3. **KeyInsight** - The "so what" card
4. **BudgetDetails** - Expandable wrapper for existing components
5. **AngajamenteView** - Compose new layout
6. **Remove old components** from main view (move to details)

---

## Verification

1. Run `yarn dev` and navigate to entity Commitments tab
2. **5-second test**: Can you understand the main message in 5 seconds?
3. **Jargon test**: Are there any technical terms visible without expanding?
4. **Story test**: Does it feel like reading a story or a spreadsheet?
5. **Mobile test**: Does it work on a small screen?

---

## Success Criteria

A citizen should be able to:
1. ✅ Understand the main budget status in 5 seconds
2. ✅ Follow the "money journey" without explanation
3. ✅ Know if there's a problem (unpaid bills) immediately
4. ✅ Optionally dig deeper if they're curious
5. ✅ Feel informed, not overwhelmed
