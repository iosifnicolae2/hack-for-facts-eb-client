# Module 1: Foundations — Why Should I Care?

## Module Overview

| Property | Value |
|----------|-------|
| **Duration** | 10-15 minutes |
| **Difficulty** | Beginner |
| **Prerequisites** | None |
| **Next Module** | [Module 2: Revenues](/learning/citizen/modules/02-revenues) |

---

## Learning Objectives

By the end of this module, you will be able to:

- [ ] Explain what a public budget is in simple terms
- [ ] Identify how public budgets affect your daily life
- [ ] Describe your three roles as a citizen: taxpayer, beneficiary, watchdog
- [ ] Navigate to the Budget Explorer and explore spending categories

---

## Introduction

### What is a Public Budget?

> **Think of it like this:** A public budget is your household budget, but for an entire country. Just like you decide how much to spend on rent, food, and savings, the government decides how much to spend on schools, hospitals, and roads.

**The key difference?** It's YOUR money they're spending.

---

## Interactive Element: Budget Impact Calculator

```
┌─────────────────────────────────────────────────────────────┐
│  💰 YOUR DAILY BUDGET IMPACT                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Every day, public budgets affect you through:              │
│                                                             │
│  🏥 Healthcare        → Hospital visits, ambulances         │
│  🎓 Education         → Schools, universities, libraries    │
│  🚗 Infrastructure    → Roads, bridges, public transport    │
│  👮 Security          → Police, firefighters, emergency     │
│  🌳 Environment       → Parks, waste management, water      │
│                                                             │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  [ List 5 services you used today → ]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Suggested Implementation

**Interactive Checklist Component:**
- User checks services they used today (healthcare, roads, public transport, etc.)
- System calculates approximate cost per citizen
- Shows which budget category funds each service
- Links to Budget Explorer for that category

---

## Core Concept: The Budget as a Social Contract

### Visual: The Social Contract Triangle

```
                    🏛️ GOVERNMENT
                        /\
                       /  \
                      /    \
                     /      \
          Promises  /        \  Services
                   /          \
                  /____________\
         💰 TAXPAYERS ←→ 📋 BENEFICIARIES
                   (Trust)

         ═══════════════════════════════════════
         The budget reveals what a society truly
         values — not what politicians say, but
         where they actually put the money.
         ═══════════════════════════════════════
```

### Key Insight

| What they SAY | What the BUDGET shows |
|---------------|----------------------|
| "Education is our priority" | Check: Is education spending increasing? |
| "We'll invest in infrastructure" | Check: What's the execution rate for capital projects? |
| "Healthcare will improve" | Check: How much per capita goes to health? |

---

## Your Three Roles as a Citizen

### Interactive Card Flip Component

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │
│   💰 TAXPAYER   │  │  📋 BENEFICIARY │  │  👁️ WATCHDOG   │
│                 │  │                 │  │                 │
│   [Click to     │  │   [Click to     │  │   [Click to     │
│    flip]        │  │    flip]        │  │    flip]        │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘

BACK OF CARDS:

TAXPAYER:                BENEFICIARY:             WATCHDOG:
You fund the budget      You use public           You have the RIGHT
through income tax,      services daily:          to know how your
VAT, and social         schools, hospitals,       money is spent and
contributions.          roads, police.            to ask questions.
~35% of salary          Worth thousands           Law 544/2001
goes to state.          of RON yearly.            protects this.
```

### Suggested Implementation
- Animated card flip on hover/click
- Each card links to deeper content
- Progress tracking (all 3 cards viewed = section complete)

---

## Reality Check: Promises vs. Spending

### Interactive Comparison Widget

**Component: Promise Tracker**

```
┌──────────────────────────────────────────────────────────────┐
│  📊 PROMISE vs REALITY                                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  What was PLANNED for 2024:                                  │
│  ████████████████████████████████████  100%                  │
│                                                              │
│  What was ACTUALLY SPENT:                                    │
│  █████████████████████████░░░░░░░░░░░   72%                  │
│                                                              │
│  Gap: 28% of planned budget was NOT spent                    │
│                                                              │
│  🔍 Where did the money NOT go?                              │
│     • Capital investments: 58% execution                     │
│     • Personnel costs: 98% execution                         │
│     • EU project co-financing: 61% execution                 │
│                                                              │
│  [ Explore in Budget Explorer → ]                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Data Integration

**API Endpoint:** `/api/analytics/execution-rates`

**Display:**
- Animated progress bars showing planned vs actual
- Color coding (green >90%, yellow 70-90%, red <70%)
- Click to drill down into categories

---

## Platform Integration: Your First Exploration

### Guided Tour Component

```
┌──────────────────────────────────────────────────────────────┐
│  🎯 HANDS-ON: Explore the Budget Explorer                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Click the button below to open Budget Explorer      │
│          [ Open Budget Explorer → ]                          │
│                                                              │
│  Step 2: Look at the treemap — each box represents a         │
│          spending category. Bigger box = more money.         │
│                                                              │
│  Step 3: Click on "Social Protection" (usually the biggest)  │
│          See what's inside: pensions, welfare, etc.          │
│                                                              │
│  Step 4: Try switching to "Per Capita" view                  │
│          Now you see spending per person, not totals.        │
│                                                              │
│  ✅ Task: Find which category gets the LEAST money           │
│                                                              │
│  Your answer: [ _________________ ]  [ Check Answer ]        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Suggested Implementation
- Opens Budget Explorer in embedded iframe or new tab
- Highlights elements as user progresses
- Validates answer against live data
- Awards completion badge

---

## Knowledge Check

### Quiz Component

```
┌──────────────────────────────────────────────────────────────┐
│  ✍️ QUICK QUIZ                                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. What percentage of Romania's GDP goes through            │
│     public budgets?                                          │
│                                                              │
│     ○ About 20%                                              │
│     ○ About 35%                                              │
│     ● About 43%  ✓                                           │
│     ○ About 60%                                              │
│                                                              │
│  2. Which of these is NOT a citizen's role in the budget?    │
│                                                              │
│     ○ Taxpayer                                               │
│     ○ Beneficiary                                            │
│     ● Approver  ✓ (Parliament approves, not citizens)        │
│     ○ Watchdog                                               │
│                                                              │
│  3. "Execution rate" measures:                               │
│                                                              │
│     ○ How fast money is spent                                │
│     ● How much of planned budget was actually spent  ✓       │
│     ○ How many people work in government                     │
│     ○ Tax collection efficiency                              │
│                                                              │
│  Score: 3/3  🎉                                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Key Takeaways

```
┌──────────────────────────────────────────────────────────────┐
│  📌 REMEMBER                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ✓ Public budgets decide how ~43% of Romania's GDP is spent  │
│                                                              │
│  ✓ You are a taxpayer, beneficiary, AND watchdog            │
│                                                              │
│  ✓ The gap between planned and spent reveals the truth       │
│                                                              │
│  ✓ You have the RIGHT to know — it's your money              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Call to Action

### Engagement Component

```
┌──────────────────────────────────────────────────────────────┐
│  🚀 TAKE ACTION                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Before moving to Module 2, try ONE of these:                │
│                                                              │
│  [ ] Spend 5 minutes exploring the Budget Explorer           │
│      → Find your city's total spending                       │
│                                                              │
│  [ ] Tell someone what you learned                           │
│      → "Did you know 43% of GDP goes through budgets?"       │
│                                                              │
│  [ ] Bookmark Transparenta.eu for later                      │
│      → You'll use it throughout this curriculum              │
│                                                              │
│                                                              │
│  [ Mark as Complete & Continue to Module 2 → ]               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Module Navigation

| Previous | Current | Next |
|----------|---------|------|
| — | **Module 1: Foundations** | [Module 2: Revenues →](/learning/citizen/modules/02-revenues) |

---

## Technical Notes for Implementation

### Components Needed

1. **BudgetImpactCalculator** - Interactive checklist with cost estimation
2. **CardFlip** - Animated card component for roles
3. **PromiseTracker** - Bar chart comparing planned vs actual
4. **GuidedTour** - Step-by-step platform walkthrough
5. **QuizComponent** - Multiple choice with instant feedback
6. **ProgressTracker** - Module completion status

### Data Requirements

- Total GDP spending percentage (static: ~43.5%)
- Execution rates by category (API: `/api/analytics/execution-summary`)
- Budget Explorer link with pre-set filters

### Accessibility

- All interactive elements keyboard-navigable
- Screen reader labels for visual elements
- High contrast mode support
- No auto-playing animations
