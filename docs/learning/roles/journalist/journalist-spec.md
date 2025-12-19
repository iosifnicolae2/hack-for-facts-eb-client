# Journalist Curriculum Specification

## Overview

This document specifies the design decisions, goals, and rationale for the Investigative Budget Journalism curriculum on Transparenta.eu.

---

## Target Audience

**Primary:** Journalists and investigative reporters covering public finance in Romania

**Characteristics:**
- May have limited prior experience with budget data
- Need actionable, investigation-ready skills
- Work under time pressure and publication deadlines
- Require both technical skills and contextual knowledge
- May work for traditional media, online outlets, or as freelancers

**Secondary audiences:**
- NGO researchers and watchdog organizations
- Academic researchers studying public finance
- Civic activists with journalism backgrounds

**Excluded from this curriculum:**
- General public (covered by Citizen curriculum)
- Public sector professionals (separate curriculum planned)
- International journalists without Romanian context

---

## Goals

### Primary Goals

1. **Build investigative capacity** — Enable journalists to find stories in budget data
2. **Develop technical skills** — FOIA mastery, data analysis, procurement tracking
3. **Establish methodology** — Systematic investigation workflow with documentation
4. **Connect to outcomes** — Create measurable impact through investigations

### Learning Objectives

By completing this curriculum, journalists should be able to:

- [ ] Navigate all Romanian public finance data sources
- [ ] Write effective FOIA requests that get results
- [ ] Identify anomalies and red flags in budget data
- [ ] Conduct procurement-budget triangulation
- [ ] Structure investigations with proper documentation
- [ ] Protect sources using appropriate security measures
- [ ] Write accessible stories from complex data
- [ ] Create impact through strategic publication

---

## Design Decisions

### 1. Five-Part Structure

**Decision:** Organize curriculum into 5 thematic parts with 17 modules.

**Rationale:**
- Mirrors the investigation lifecycle: Learn → Find Data → Investigate → Specialize → Publish
- Allows journalists to enter at their skill level
- Supports both linear learning and reference use

**Structure:**

| Part | Focus | Modules |
|------|-------|---------|
| I. Foundations | Mindset, structure, classification | 1-3 |
| II. Data Sources & Access | Where to find data, FOIA, data handling | 4-6 |
| III. Investigation Methods | Story finding, red flags, workflow, sources | 7-10 |
| IV. Specialized Topics | EU funds, local gov, health/education, procurement | 11-14 |
| V. Publication & Impact | Writing, legal, impact | 15-17 |

### 2. Learning Paths by Experience Level

**Decision:** Provide 5 learning paths based on journalist experience and goals.

**Paths defined:**

| Path | Goal | Modules | Duration |
|------|------|---------|----------|
| Foundations | New to budget reporting | 1, 2, 3 | 2 hours |
| Data Hunter | Find stories in data | 4, 5, 6 | 3 hours |
| Investigator | Pursue a lead | 7, 8, 9 | 3 hours |
| Specialist | Sector expertise | 11, 12, 13 | 3 hours |
| Complete Course | Full mastery | All (1-17) | 15-20 hours |

**Rationale:**
- Experienced journalists can skip basics
- Allows focused skill development
- Accommodates deadline-driven learning

### 3. Platform Integration for Investigation

**Decision:** Position Transparenta.eu as an investigation toolkit, not just learning aid.

**Investigation-focused features:**

| Feature | Investigation Use |
|---------|-------------------|
| Budget Explorer | Find anomalies in allocation patterns |
| Entity Analytics | Benchmark suspicious entities against peers |
| Map | Identify regional disparities |
| Alerts | Track subjects during investigation |
| Search | Query millions of budget records |

**Rationale:**
- Journalists need tools, not just knowledge
- Platform features directly support investigation workflow
- Alerts enable ongoing monitoring during investigations

### 4. Practical, Actionable Content

**Decision:** Emphasize practical skills over theory.

**Examples:**
- FOIA request templates (good vs. bad examples)
- SQL queries for anomaly detection
- Red flag checklists with investigation approaches
- Investigation workflow diagrams
- Pre-publication checklists

**Rationale:**
- Journalists work under time pressure
- Actionable templates accelerate investigations
- Real-world examples more valuable than abstract concepts

### 5. Data Accuracy with Verification Notes

**Decision:** Include specific figures with clear verification guidance.

**Data included:**
- Spending/GDP: ~43.5%
- Revenue/GDP: ~34.1%
- Deficit: ~9.3%
- PNRR amounts (with revision note)
- Procurement thresholds (with update note)
- DRG tariff and education cost standard

**Verification notes added:**
- "Verify current amounts at [source]"
- "Thresholds update periodically"
- "Last updated: December 2025"

**Rationale:**
- Journalists need specific numbers but must verify
- Stale data undermines credibility
- Clear update guidance prevents errors

### 6. Source Protection Emphasis

**Decision:** Dedicate full module to source building and protection.

**Coverage:**
- Source types and approaches
- Digital security essentials
- Legal protection limits in Romania
- Relationship building strategies

**Rationale:**
- Source protection is non-negotiable for serious journalism
- Romania has limited shield law protection
- Digital security increasingly critical

### 7. Legal Framework Integration

**Decision:** Include legal considerations throughout, with dedicated module.

**Coverage:**
- Defamation risk and mitigation
- Privacy balancing
- Safe publication practices
- Support organizations (ActiveWatch, CJI, RISE, OCCRP)

**Rationale:**
- Legal threats are real for investigative journalists
- Prevention better than reaction
- Support network knowledge essential

---

## Content Principles

### Investigation-Ready
- Every concept connected to investigation use
- Practical exercises that mirror real investigations
- Tools and templates ready for immediate use

### Verification-Oriented
- Multiple source triangulation emphasized
- "Red flags are leads, not conclusions"
- Methodology documentation standards

### Impact-Focused
- Pre-publication planning for maximum effect
- Follow-up tracking encouraged
- Ecosystem building (training, sharing, collaboration)

### Ethically Grounded
- Public interest justification required
- Right of reply mandatory
- Source protection absolute

---

## Platform Features Referenced

| Feature | Route | Curriculum Use |
|---------|-------|----------------|
| Budget Explorer | `/budget-explorer` | Anomaly detection, allocation analysis |
| Entity Analytics | `/entity-analytics` | Comparative analysis, benchmarking |
| Map | `/map` | Regional disparity identification |
| Alerts | `/alerts` | Investigation subject monitoring |
| Classifications | `/classifications/` | Code decoding, document reading |
| Search | `/search` | Transaction queries |

---

## External Data Sources Referenced

### Tier 1: Official Publications
- Monitorul Oficial (monitoruloficial.ro)
- Ministry of Finance (mfinante.gov.ro)
- Local government websites
- SEAP/SICAP (e-licitatie.ro)
- Curtea de Conturi (curteadeconturi.ro)

### Tier 2: Structured Systems
- Forexebug (treasury execution)
- SICAP (procurement API)
- e-consultare.gov.ro (draft legislation)

### Tier 3: Aggregated Sources
- Transparenta.eu
- Expert Forum
- EU Open Data Portal
- World Bank/IMF

### Tier 4: Internal Documents (via FOIA)
- Notele de fundamentare
- Internal audit reports
- Contract annexes
- Payment orders

---

## Key Technical Content

### Classification System
- Three-dimensional: Organizational, Functional, Economic
- COFOG-adapted functional codes (51-84)
- Economic codes with detailed breakdown (10, 20, 71, 81)
- Code 20.30.30 flagged as "opacity indicator"

### FOIA Guidance
- Law 544/2001 framework
- Good vs. bad request examples
- Escalation path: Administrative appeal → Court → Parallel pressure
- Machine-readable format requests emphasized

### Investigation Methodology
- 5 story-finding methods: Anomaly, Comparative, Flow tracking, Outcome connection, Procurement triangulation
- 3-phase investigation workflow: Discovery → Verification → Confirmation
- Documentation standards

### Red Flags
- Planning red flags (year-end spikes, "other" allocations, frequent rectifications)
- Execution red flags (few vendors, ghost contracts, amendments)
- Structural red flags (arrears, personnel crowding, transfer dependency)
- Contract splitting indicators with thresholds

### Sector-Specific Content
- EU funds: PNRR breakdown, absorption tracking
- Local government: Budget structure, key metrics, ~3,180 UATs
- Health: FNUASS structure, DRG system
- Education: Per-pupil funding, cost standard
- Procurement: SICAP stages, current thresholds

---

## Practical Exercises

| Exercise | Skill Developed |
|----------|-----------------|
| Budget Literacy Test | Decode 10 budget lines |
| FOIA Practicum | Submit 3 requests, document process |
| Anomaly Hunt | Identify 5 anomalies in county data |
| Procurement-Budget Link | Trace contract through budget |
| Comparative Analysis | Compare per-pupil spending across counties |
| Mini-Investigation | Complete hypothesis → data → story |

---

## Future Enhancements

### Planned (Not Yet Implemented)

1. **Video walkthroughs** — Screen recordings of investigation techniques
2. **Case study library** — Real investigations with methodology notes
3. **FOIA template generator** — Interactive tool for request creation
4. **Collaboration features** — Connect journalists on similar investigations
5. **Investigation tracker** — Document and organize ongoing investigations

### Under Consideration

1. **Certification program** — Verified completion credentials
2. **Mentorship matching** — Connect new journalists with experienced investigators
3. **Cross-border module** — EU-wide investigation techniques
4. **Advanced data analysis** — Python/R for budget data
5. **Real-time alerts** — AI-powered anomaly detection

---

## Maintenance Requirements

### Regular Updates Needed

| Data Type | Update Frequency | Source |
|-----------|------------------|--------|
| Procurement thresholds | Annually | ANAP |
| PNRR figures | Per renegotiation | MFE, EC |
| DRG tariff | Annually | CNAS |
| Cost standard | Annually | Ministry of Education |
| Deficit/spending figures | Quarterly | Ministry of Finance |

### Trigger-Based Updates

- New procurement law → Update Module 14
- FOIA law changes → Update Module 5
- Platform feature changes → Update relevant CTAs
- Major investigation examples → Add to case studies

---

## Related Documents

- [Curriculum Content](./journalist.md) — The curriculum itself
- [Citizen Curriculum](../citizen/citizen.md) — General public version
- [Citizen Spec](../citizen/citizen-spec.md) — Citizen curriculum specification
- [Platform CLAUDE.md](/CLAUDE.md) — Technical overview of Transparenta.eu

---

## Comparison with Citizen Curriculum

| Aspect | Citizen | Journalist |
|--------|---------|------------|
| **Depth** | Foundational | Advanced |
| **Modules** | 10 | 17 |
| **Duration** | 4-5 hours | 15-20 hours |
| **Focus** | Understanding, engagement | Investigation, publication |
| **FOIA** | Basic template | Advanced tactics, escalation |
| **Data skills** | Platform navigation | SQL, scraping, analysis |
| **Outcome** | Informed citizen | Published investigation |
| **Legal** | Rights awareness | Risk mitigation, support |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial curriculum with 17 modules |

---

*This specification should be updated whenever significant changes are made to the curriculum.*
