# Citizen Curriculum Specification

## Overview

This document specifies the design decisions, goals, and rationale for the Citizen's Guide to Romanian Public Budget curriculum on Transparenta.eu.

---

## Target Audience

**Primary:** Romanian citizens who want to understand public budgets

**Characteristics:**

- No prior knowledge of public finance required
- May have limited time (need flexible learning paths)
- Want practical, actionable knowledge
- Interested in local government accountability

**Excluded from this curriculum:**

- Journalists/NGOs (separate curriculum planned)
- Public sector professionals (separate curriculum planned)
- Academic researchers (too specialized)

---

## Goals

### Primary Goals

1. **Demystify public budgets** — Make budget concepts accessible to any citizen
2. **Enable civic engagement** — Give citizens tools to monitor and question spending
3. **Drive platform adoption** — Connect learning to Transparenta.eu features

### Learning Objectives

By completing this curriculum, citizens should be able to:

- [ ] Explain where public money comes from and where it goes
- [ ] Navigate Transparenta.eu to find specific budget information
- [ ] Read and decode official budget documents
- [ ] Calculate and interpret execution rates
- [ ] Identify red flags in budget management
- [ ] Submit a FOIA request for budget information
- [ ] Analyze their local government's budget

---

## Design Decisions

### 1. Goal-Based Learning Paths

**Decision:** Add learning paths at the start based on citizen goals, not just linear modules.

**Rationale:**

- Users reported "unclear learning path" as a key challenge
- Different citizens have different goals and time constraints
- Allows quick engagement without full curriculum commitment

**Paths defined:**

| Path | Goal | Modules | Duration |
|------|------|---------|----------|
| Quick Start | Understand basics | 1, 2, 3 | 30 min |
| Local Watchdog | Monitor local government | 1, 6, 7, 9, 10 | 90 min |
| Investigator | Investigate suspicions | 5, 7, 9, 8 | 60 min |
| Complete Course | Full understanding | All | 4-5 hours |

### 2. Deep Platform Integration

**Decision:** Include direct links and CTAs to Transparenta.eu features throughout.

**Rationale:**

- Users wanted "knowledge to translate to action"
- Abstract concepts become concrete when tied to real tools
- Increases platform engagement and stickiness

**Integration approach:**

- "Try it on Transparenta.eu" boxes in each module
- Direct links with query parameters (e.g., `?accountCategory=vn`)
- Platform Quick Reference table at the start
- Capstone project uses platform step-by-step

### 3. Module Structure Retained

**Decision:** Keep 10-module structure, improve content within modules.

**Rationale:**

- Existing structure covers essential topics comprehensively
- Restructuring would break existing links and references
- Adding learning paths provides flexibility without restructuring

### 4. Key Takeaways Added

**Decision:** Add 3-bullet "Key Takeaways" section to each module.

**Rationale:**

- Helps retention of core concepts
- Provides quick reference for returning users
- Supports scannable reading patterns

### 5. Factual Data Updates

**Decision:** Update all financial data based on fact-check review.

**Changes made:**

- GDP spending: 35% → **43.5%**
- Added structural deficit: **9.3%**
- Added VAT increase warning (Law 141/2025)
- Detailed labor tax breakdown (CAS 25%, CASS 10%, CAM 2.25%)
- Fixed budget submission deadline: **October 15**
- Updated UAT count: ~3,200 → **~3,229**

**Rationale:** Credibility requires accurate data. Original curriculum contained errors that would undermine trust.

### 6. Red Flags Expanded

**Decision:** Add "Contract Splitting" and "Persistent High Deficit" as red flags.

**Rationale:**

- Contract splitting is a common Romanian budget issue (~€27k threshold abuse)
- Deficit is a macro-level concern citizens should understand
- Both were identified in expert review as missing

### 7. Terminology Alignment

**Decision:** Use official Romanian terms with explanations.

**Example:** "Active nefinanciare (capital investments) — Code 71"

**Rationale:**

- Citizens will encounter official terms in real documents
- Providing both helps bridge learning and real-world application
- Economic codes (10, 20, 71) are essential for platform navigation

---

## Content Principles

### Simplicity

- Use plain language, avoid jargon
- When technical terms are necessary, explain them
- Prefer tables and lists over long paragraphs

### Actionability

- Every module should enable a concrete action
- Link concepts to platform features
- Provide templates (e.g., FOIA request)

### Accuracy

- All financial data must be verifiable
- Include legislative references where relevant
- Update data annually or when significant changes occur

### Local Focus

- Emphasize local government monitoring
- Local budgets are more accessible and impactful
- Citizens can more easily influence local decisions

---

## Platform Features Referenced

| Feature | Route | Usage in Curriculum |
|---------|-------|---------------------|
| Budget Explorer | `/budget-explorer` | Modules 1, 2, 3 |
| Revenue View | `/budget-explorer?accountCategory=vn` | Module 2 |
| Entity Analytics | `/entity-analytics` | Modules 6, 7, 9, 10 |
| Map | `/map` | Module 6 |
| Alerts | `/alerts` | Modules 7, 8 |
| Functional Classifications | `/classifications/functional/` | Modules 3, 5 |
| Economic Classifications | `/classifications/economic/` | Module 5 |
| Entity Details | `/entities/{cui}` | Modules 9, 10 |

---

## Future Enhancements

### Planned (Not Yet Implemented)

1. **Interactive quizzes** — Self-assessment after each module
2. **Video micro-lessons** — 2-3 min videos for complex concepts
3. **Progress tracking** — Save completion state across sessions
4. **Certificates** — Shareable completion badges
5. **Real data examples** — Embedded live data snapshots

### Under Consideration

1. **Gamification** — Points, badges, leaderboards
2. **Community features** — Share findings, discuss with others
3. **Localized content** — Regional examples based on user location
4. **Mobile-optimized version** — Condensed format for phones

---

## Maintenance Requirements

### Annual Updates Needed

- GDP spending percentages
- Deficit figures
- Tax rates (especially if VAT changes)
- UAT counts (if administrative changes occur)
- Legislative references

### Trigger-Based Updates

- New budget-related laws → Update Module 4, 8
- Platform feature changes → Update relevant CTAs
- Major economic events → Add context/alerts

---

## Related Documents

- [Curriculum Content](./citizen.md) — The curriculum itself
- [Platform CLAUDE.md](/CLAUDE.md) — Technical overview of Transparenta.eu
- [Learning Academy Routes](/src/routes/learning/) — Frontend implementation

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial curriculum |
| 1.1 | Dec 2024 | Fact-check corrections (GDP, VAT, taxes, timeline) |
| 2.0 | Dec 2024 | Added learning paths, platform CTAs, key takeaways |

---

*This specification should be updated whenever significant changes are made to the curriculum.*
