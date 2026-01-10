---
title: "Research: User Interview Playbook Validation"
status: in_progress
provider: chatgpt
date: 2026-01-05
---

<!-- PROMPT_START -->
# Review Request: User Interview Playbook for Beginner Researcher

I need you to review and improve a user interview playbook I created for a beginner researcher who is interviewing a Romanian commune mayor (primar de comuna) tomorrow. The mayor uses transparenta.eu - a public budget transparency platform.

## Context

- **Interview is tomorrow** - 45 minutes, video call
- **Cold contact** - first meeting with this person
- **Discovery interview** - not validation or feedback, pure learning
- **Goal**: Understand workflow, discover 2-3 pain points
- **Interviewer experience**: No prior experience conducting user interviews
- **Recording**: Will record and transcribe

## About Transparenta.eu - Platform Business Logic

Transparenta.eu is a Romanian public budget transparency platform that allows users to explore, analyze, and compare government budget execution data. Here's the detailed business logic:

### Core Value Proposition
The platform transforms raw, scattered budget data into an actionable civic tool, enabling both oversight (for journalists/citizens) and better governance (for public officials like mayors).

### Target Users
1. **Public sector officials** (mayors, council members) - understand their budgets, compare with peers, make data-driven decisions
2. **Independent journalists & civic activists** - investigate public spending, identify anomalies, hold government accountable

### Main Features & User Flows

**1. Entity Details Page (360-degree view of a municipality)**
- Overview with KPIs: Total expenses, revenues, budget balance
- Year-over-year trend analysis with percentage changes
- Line item exploration by functional and economic classification
- Official report downloads for auditing
- Financial summaries with income/expense/balance trends

**2. Entity Analytics (Comparative Rankings)**
- Filter and rank entities by any metric
- Per capita normalization for fair comparisons across different-sized municipalities
- Export to CSV for offline analysis
- Topic-focused analysis via classification prefixes

**3. Interactive Map Visualization**
- Geographic heatmaps showing spending patterns across Romania
- UAT (municipal) and county-level views
- Click-through navigation from map to entity details
- Color-coded based on spending/revenue amounts

**4. Budget Explorer (Treemap Visualization)**
- Hierarchical visualization of national budget distribution
- Drill-down navigation with breadcrumbs
- Grouping by functional classification (education, health, etc.) or economic classification (salaries, goods, investments)
- Multiple depth levels (chapter, subchapter, paragraph)

**5. Chart Builder (Custom Analysis)**
- Create custom line, area, and bar charts
- Multiple data series support
- Save and organize charts with categories
- Shareable deep links encoding exact chart configuration
- Annotations for documenting findings

**6. Anomaly Detection**
- **Missing line items**: Budget entries that appear in one year but disappear
- **Value changes**: Significant year-over-year variations flagged for investigation
- Filters to show only anomalous data

**7. Learning Hub (Educational Content)**
- Learning paths with modules and lessons about Romanian budget transparency
- Topics: Budget cycle phases, classification systems, red flag analysis, citizen rights
- Interactive exercises (Budget Allocator Game, Classification Explorer)
- Progress tracking and certificates

**8. Alerts & Notifications**
- Create custom alerts for budget metrics
- Set conditions (greater than, less than, equals thresholds)
- Subscribe to entity-specific updates

### Budget Data Structure
- **Functional classifications**: Budget categories (education code 65, healthcare code 66, etc.)
- **Economic classifications**: Type of expense (personnel, goods/services, investments)
- **Spending (Cheltuieli - 'ch')**: Government expenditures
- **Revenue (Venituri - 'vn')**: Income sources

### Normalization Options
- Total amounts (RON)
- Per capita amounts (for fair comparison)
- Percentage of GDP
- Currency conversion (RON, EUR, USD)
- Inflation adjustment

### Key Jobs-to-be-Done for Mayors
1. **Benchmark against peers**: "How does my commune's education spending compare to similar communes?"
2. **Prepare council reports**: "Show the consiliul local where the budget went this quarter"
3. **Verify data accuracy**: "Check if our reported execution matches what we expected"
4. **Identify anomalies**: "Are there any errors or unusual patterns in our budget?"
5. **Track trends**: "How has our spending changed over the past 3 years?"
6. **Citizen transparency**: "Show citizens where their tax money goes"

---

## Validation Criteria

Please validate this playbook against best practices from:
1. **The Mom Test** by Rob Fitzpatrick - avoiding false positives, talking about their life not your product
2. **Jobs-to-be-Done (JTBD)** methodology - understanding the struggling moment, pushes/pulls/anxieties/habits
3. **User research best practices** - Nielsen Norman Group, Teresa Torres (Continuous Discovery Habits), Steve Portigal (Interviewing Users)

## The Playbook to Review

### PART 1: UNDERSTANDING THE INTERVIEW

**What Is a User Interview?**

A user interview is a structured conversation where you learn about someone's real experiences, problems, and behaviors. It's NOT a sales pitch, product demo, survey, or focus group.

**Your only job:** Listen and learn. You're a journalist, not a salesperson.

**Why This Interview Matters:**
1. What problem does transparenta.eu solve for mayors? (Job-to-be-Done)
2. How does it fit into their actual work? (Workflow)
3. What's still painful or missing? (Pain points)

**The Mom Test Principles:**

| Bad Question (Gets Lies) | Good Question (Gets Truth) |
|--------------------------|----------------------------|
| "Do you like our platform?" | "Tell me about the last time you needed budget data" |
| "Would you use this feature?" | "What do you do today when you need X?" |
| "Is budget analysis important?" | "Walk me through your last budget meeting" |

**Core principle:** Talk about their life, not your product.

---

### PART 2: THE PERSONA

**Who Is a "Primar de Comuna"?**

- Elected official leading a commune (rural administrative unit)
- Communes have populations from a few hundred to ~20,000 people
- They manage the local budget (1-50 million RON/year)
- They report to the Consiliul Local (Local Council)
- They work with a small team (often just a few people on finance)

**Typical Challenges (Hypotheses to Explore):**
1. Resource constraints: Small team, limited technical skills
2. Accountability pressure: Citizens and council expect transparency
3. Comparison anxiety: "How do we compare to other communes?"
4. Reporting burden: Regular reports to council and auditors
5. Data access: Budget data is complex and hard to interpret

**Communication Style (What to Expect):**
- May be formal at first (official context)
- Proud of their commune and work
- May be defensive if they feel criticized
- Busy and time-constrained
- May not be very technical
- Will appreciate respect for their expertise

---

### PART 3: BEHAVIORAL GUIDANCE

**Before the Interview:**
- Test video call 10 minutes before
- Find a quiet space without interruptions
- Have this playbook open on second screen or printed
- Research their commune on transparenta.eu (but don't mention unless relevant)

**Mental Preparation:**
- You are a curious student, not an expert
- They are the expert on their own experience
- Your job is to listen 80%, talk 20%
- Silence is okay - let them think

**Your Demeanor:**
- Warm and curious - genuine interest in their work
- Respectful - they're a public official with responsibilities
- Patient - let them finish thoughts
- Non-judgmental - never criticize or correct
- Humble - you're there to learn, not teach

**What To Do When...**

They give you praise ("Your platform is great!"):
> "Mulțumesc! Mă bucur să aud asta. Puteți să-mi povestiți despre ultima dată când l-ați folosit? Ce căutați?"

They give you a feature request ("You should add X"):
> "Interesant! Ce v-a făcut să vă doriți asta? Ce s-a întâmplat?"

They speak in hypotheticals ("I would probably..."):
> "Ați avut vreodată situația asta în realitate? Ce ați făcut atunci?"

They give short answers:
> "Puteți să-mi dați mai multe detalii?" or "Ce s-a întâmplat după?"

---

### PART 4: THREE INTERVIEW SCENARIOS

**Scenario A: The Active Power User**
- Signs: They mention specific features, describe recent usage, have opinions
- Strategy: Go deep on workflow, focus on what's STILL painful, explore decision criteria

**Scenario B: The Casual/New User**
- Signs: Vague answers, don't remember features, talk about what they WOULD do
- Strategy: Focus on workflow WITHOUT the tool, understand why they signed up, explore barriers

**Scenario C: The Skeptic/Resistant User**
- Signs: Defensive tone, emphasize existing solutions, mention bureaucratic constraints
- Strategy: Don't push the product, respect their methods, understand trust criteria

---

### PART 5: THE COMPLETE INTERVIEW SCRIPT

**Phase 1: Opening & Rapport (0-7 min)**

> "Bună ziua! Mă auziți și mă vedeți bine?"
> "Mulțumesc foarte mult că v-ați făcut timp să discutăm."

Build rapport:
> "Înainte să începem, sunt curios - cum e viața de primar în [Numele Comunei]? Ce face comuna dumneavoastră specială?"

Set expectations:
> "Vreau să fiu clar de la început. Nu sunt aici să vă vând nimic. Scopul meu e să înțeleg cum lucrați cu datele bugetare. Dumneavoastră sunteți expertul, eu sunt aici să învăț."

Request permission to record:
> "Aș vrea să înregistrez conversația, dacă sunteți de acord. O să folosesc înregistrarea doar intern."

**Phase 2: Context & Background (7-12 min)**

> "Ce responsabilități aveți legate de buget în activitatea de primar?"
> "Cam câți oameni din primărie lucrează cu datele bugetare?"
> "Cât de des aveți nevoie să analizați sau să raportați date bugetare?"

**Phase 3: Current Reality (12-22 min)**

The "Last Time" Technique:
> "Povestiți-mi despre ultima dată când ați avut nevoie să analizați date bugetare. Ce se întâmpla?"

Follow-up probes:
> "Ce anume căutați?"
> "Ce instrumente sau surse de date ați folosit?"
> "Unde v-ați blocat sau a fost greu?"
> "Cât timp v-a luat?"
> "Ați reușit să găsiți ce căutați?"

Cost & Impact:
> "Ce se întâmplă când datele nu sunt disponibile sau sunt greșite?"
> "Ați avut vreodată situații în care lipsa datelor v-a creat probleme reale?"

Comparison:
> "Aveți nevoie să comparați bugetul dumneavoastră cu al altor comune? Cum faceți asta acum?"

**Phase 4: Discovery & Adoption (22-32 min)**

> "Cum ați aflat de transparenta.eu?"
> "Ce v-a determinat să încercați platforma? Ce se întâmpla în acel moment?"
> "Care a fost momentul în care ați zis 'trebuie să găsesc o soluție mai bună'?"
> "Ce ați căutat prima dată când ați intrat pe platformă?"
> "A fost ceva confuz sau dificil când ați început?"

**Phase 5: Current Usage (32-40 min)**

> "Acum, cât de des intrați pe platformă?"
> "În ce situații vă gândiți 'trebuie să intru pe transparenta.eu'?"
> "Ce funcționalități folosiți cel mai des?"
> "Sunt situații în care platforma NU vă ajută și trebuie să faceți altfel?"
> "Ce puteți face acum ce nu puteați înainte?"

**Phase 6: Wrap-Up (40-45 min)**

Magic Wand:
> "Dacă ați avea o baghetă magică și ați putea schimba un singur lucru, ce ar fi?"

Ground it:
> "Ați încercat să rezolvați asta cumva?"

Recruiting:
> "Cunoașteți alți primari care ar putea să ne ajute cu feedback similar?"

---

### PART 6: POST-INTERVIEW

Immediately After (Within 30 min):
1. Brain dump everything you remember
2. Note emotions: How did you feel? What surprised you?
3. Key quotes: Write memorable phrases verbatim

Coding Categories:
- PROBLEM: Pain points, frustrations
- TRIGGER: Moments that cause action
- WORKAROUND: Manual solutions
- IMPACT: Costs (time, money, reputation)
- BARRIER: Anxieties, habits preventing change
- FEATURE_USE: What they use
- FEATURE_GAP: What's missing

---

### PART 7: ANTI-PATTERN CHECKLIST

During the Interview, Did You...
- Talk about THEIR life, not your product?
- Ask about PAST behavior, not hypotheticals?
- Get SPECIFIC examples when answers were vague?
- Listen more than you talked (80/20)?
- Avoid defending or explaining the product?
- Explore the COST of their problems?

Red Flags That Mean You Got Bad Data:
- Lots of praise but no specific examples
- All hypothetical answers
- You talked more than 30% of the time
- You explained features or defended the product
- No emotional language or concrete stories

---

## Please Provide

1. **What's good** - What should be kept as-is?
2. **What's missing** - What critical elements are absent?
3. **What could be improved** - Specific suggestions for better questions
4. **Methodological issues** - Any problems with the approach?
5. **Tips for first-time interviewer** - Practical advice for someone nervous
6. **Improved/additional questions** - Based on JTBD and Mom Test best practices
7. **Cultural considerations** - Anything specific for interviewing Romanian public officials?

Please be comprehensive and specific in your feedback. This is for a real interview happ?ening tomorrow.
<!-- PROMPT_END -->

## URL

https://chatgpt.com/c/695af528-c744-8327-9cbb-b57c50114d7e

## Response

<!-- RESPONSE_START -->
...
<!-- RESPONSE_END -->
