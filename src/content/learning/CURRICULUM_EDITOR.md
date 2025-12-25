# Curriculum Editor Implementation with Pedagogical Analysis — Version 1.0

## Overview

This is a complete, self-contained implementation of **multi-agent curriculum review** for **learning content quality assurance**. When a user says **"Review learning path [path-id]"**, this system automatically executes the full review process without additional prompting.

**No external setup required.** The system is implemented through:

- Parallel agent execution for different review dimensions
- Structured scoring rubrics based on learning science
- Evidence-based fix generation with exact replacements
- Quality gates at each phase

### Core Promise

Following this playbook produces reviews that are:

- **Pedagogically rigorous**: Every lesson evaluated against Gagné's Nine Events, Bloom's Taxonomy, and Cognitive Load Theory
- **Actionable**: Every issue comes with an exact fix, not just a description
- **Comprehensive**: Path-level coherence + lesson-level detail + cross-lesson consistency
- **Learner-centered**: Adult learning principles verified throughout

---

## Non-Negotiables

1. **Never review without reading**: Load all lesson MDX files before any analysis
2. **Every issue needs a fix**: No flagging problems without providing replacement content
3. **Alignment is sacred**: Objective → Content → Practice → Assessment chain must be unbroken
4. **Romanian must match**: Every English fix requires corresponding Romanian update
5. **Validate after fixes**: Always run `yarn learning:validate` after applying changes

---

## Automatic Execution Protocol

When user says **"Review learning path [path-id]"**, automatically execute:

```
1. PHASE 0: Load path definition and all lesson content
2. PHASE 1: Launch parallel review agents (can run in background)
   - Path Analyst Agent
   - Lesson Reviewer Agent (per lesson)
   - Quiz Auditor Agent (per quiz)
   - Consistency Checker Agent
3. PHASE 2: Aggregate findings and score each dimension
4. PHASE 3: Generate prioritized fixes with exact replacements
5. PHASE 4: Present report and offer to apply fixes
6. PHASE 5: Apply fixes and validate
```

---

## Phase 0: Content Loading

**Purpose**: Gather all content before analysis begins.

### Required Inputs

| Input | Location |
|-------|----------|
| **Path definition** | `src/content/learning/paths/{path-id}.json` |
| **Lesson MDX (English)** | `src/content/learning/modules/{contentDir}/index.en.mdx` |
| **Lesson MDX (Romanian)** | `src/content/learning/modules/{contentDir}/index.ro.mdx` |

### Loading Process

```
1. Read path JSON to get module and lesson structure
2. For each lesson:
   - Extract contentDir from path definition
   - Read index.en.mdx
   - Read index.ro.mdx (if exists)
3. Build lesson inventory with metadata:
   - Lesson ID, title, duration, objective
   - Completion mode (quiz/mark_complete)
   - Prerequisites
   - Word count
   - Component inventory (Quiz, Hidden, FlashCard, etc.)
```

**Gate: PASS/FAIL** — PASS only if all referenced lesson files exist and are readable.

---

## Phase 1: Parallel Review Agents

**Purpose**: Execute specialized reviews simultaneously for efficiency.

### Agent Roster

| Agent | Focus | Run in Background |
|-------|-------|-------------------|
| **Path Analyst** | Structure, progression, scaffolding | Yes |
| **Lesson Reviewer** | Per-lesson pedagogical quality | Yes (parallel per lesson) |
| **Quiz Auditor** | Quiz quality and alignment | Yes (parallel per quiz) |
| **Consistency Checker** | Terminology, examples across path | Yes |

Launch all agents simultaneously. Each produces structured findings.

---

## Phase 1.1: Path Analyst Agent

**Purpose**: Evaluate learning path as a coherent whole.

### Scoring Dimensions

| Dimension | Weight | What It Measures |
|-----------|--------|------------------|
| **Progression** | 20% | Simple → complex flow, clear beginning/middle/end |
| **Prerequisites** | 15% | Correct dependency declarations, no hidden gaps |
| **Scaffolding** | 20% | Support level progression (full → partial → minimal) |
| **Bloom's Arc** | 15% | Cognitive level progression across path |
| **Coverage** | 15% | All objectives addressed, no orphan content |
| **Coherence** | 15% | Narrative thread, connected examples |

### Agent Prompt

```
Task: "Path Analyst - [path-id]"

You are analyzing the learning path structure for pedagogical effectiveness.

PATH DATA:
[Insert complete path JSON]

EXECUTE:

1. PROGRESSION ANALYSIS
   Map each module's knowledge transformation:
   | Module | Entry State | Exit State | Transformation |
   Flag: Jumps, gaps, or reversals in complexity

2. PREREQUISITE CHAIN AUDIT
   For each lesson with prerequisites:
   - Verify declared prerequisites are correct
   - Identify hidden dependencies not declared
   - Check for circular dependencies

   | Lesson | Declared | Actual Required | Correct? |

3. SCAFFOLDING CONTINUITY
   Track support level across lessons:
   | Lesson | Support Level | Elements Used |

   Support levels: Full → Partial → Minimal → Independent
   Flag: Sudden drops, gaps, or inappropriate babying

4. BLOOM'S LEVEL PROGRESSION
   | Lesson | Primary Bloom Level | Position Appropriate? |

   Expected: Early=Remember/Understand, Middle=Apply/Analyze, Late=Evaluate/Create
   Flag: Late lessons at Remember, early lessons at Evaluate

5. COVERAGE CHECK
   - Which path objectives lack sufficient lesson support?
   - Which lessons don't contribute to any objective?
   - What content is unnecessarily repeated?

6. COHERENCE ASSESSMENT
   - Is there a narrative thread?
   - Do examples build on each other?
   - Are transitions between lessons explicit?

Return:
{
  "scores": {
    "progression": X.X,
    "prerequisites": X.X,
    "scaffolding": X.X,
    "blooms_arc": X.X,
    "coverage": X.X,
    "coherence": X.X,
    "overall": X.X
  },
  "issues": [
    {
      "dimension": "...",
      "severity": "critical|important|minor",
      "location": "...",
      "problem": "...",
      "impact": "...",
      "fix": "..."
    }
  ],
  "structural_recommendations": [...]
}
```

**Gate**: PASS if overall score ≥ 7.0 AND no critical issues.

---

## Phase 1.2: Lesson Reviewer Agent

**Purpose**: Deep-review individual lessons for pedagogical quality.

### Gagné's Nine Events Scoring

| Event | Weight | What to Check |
|-------|--------|---------------|
| 1. **Gain Attention** | 12% | Engaging hook, NOT "In this lesson..." |
| 2. **Inform Objectives** | 10% | Clear, measurable, action verb |
| 3. **Stimulate Recall** | 10% | Prior knowledge activated |
| 4. **Present Content** | 15% | Chunked, scaffolded, examples |
| 5. **Provide Guidance** | 10% | Worked examples, tips, memory aids |
| 6. **Elicit Performance** | 12% | Practice with feedback |
| 7. **Provide Feedback** | 10% | Explains WHY, not just right/wrong |
| 8. **Assess Performance** | 10% | Aligned to objective |
| 9. **Enhance Transfer** | 11% | Real-world application, summary |

### Agent Prompt

```
Task: "Lesson Reviewer - [lesson-id]"

You are reviewing a single lesson for pedagogical effectiveness.

LESSON CONTENT:
[Insert complete MDX file]

LESSON METADATA:
- ID: [lesson-id]
- Title: [from frontmatter]
- Duration: [from frontmatter] minutes
- Objective: [from frontmatter]
- Completion mode: [quiz/mark_complete]
- Position in path: Lesson [X] of [Y]

EXECUTE:

1. STRUCTURE CHECK
   □ Frontmatter complete (title, durationMinutes, concept, objective)
   □ Word count: ___ (target: 500-1500)
   □ Content chunks: ___ (target: 2-4 of 200-300 words each)
   □ New concepts: ___ (maximum: 4)

2. GAGNÉ'S NINE EVENTS AUDIT
   Rate each: Present (2) / Weak (1) / Missing (0)

   | Event | Score | Evidence/Issue |
   |-------|-------|----------------|
   | 1. Attention | | |
   | 2. Objectives | | |
   | 3. Recall | | |
   | 4. Content | | |
   | 5. Guidance | | |
   | 6. Performance | | |
   | 7. Feedback | | |
   | 8. Assessment | | |
   | 9. Transfer | | |

   Total: ___/18 → Normalized: ___/10

3. ALIGNMENT CHECK
   Stated objective: "[quote]"
   Bloom's verb: [verb] → Level: [level]

   - Content addresses objective: Yes/Partially/No
   - Practice tests objective level: Yes/Partially/No
   - Quiz matches objective level: Yes/Partially/No

   VERDICT: ALIGNED / MISALIGNED
   If misaligned, specify the break point.

4. COGNITIVE LOAD ASSESSMENT
   - Concepts listed: [enumerate each new concept]
   - Sequencing: Simple→Complex / Jumbled / Reverse
   - Extraneous content: [what to remove]
   - Prior knowledge connections: Present/Missing

   VERDICT: APPROPRIATE / OVERLOADED / UNDERLOADED

5. ADULT LEARNING PRINCIPLES
   □ Respects intelligence (not condescending)
   □ Builds on experience
   □ Explains relevance ("why this matters")
   □ Problem-centered framing
   □ Practical application included

   Score: ___/5

6. WRITING QUALITY
   □ Conversational tone (uses "you")
   □ Active voice dominant
   □ No forbidden phrases*
   □ Concrete, specific examples
   □ Appropriate reading level

   *Forbidden: "It's important to note", "As we all know",
    "In this lesson we will discuss", "It should be mentioned"

   Score: ___/5

7. RETRIEVAL PRACTICE
   - Check-for-understanding moments: ___ (target: 2+)
   - Types used: [Quiz/Hidden/FlashCard/other]
   - Prior lesson recall: Present/Missing

Return:
{
  "lesson_id": "...",
  "scores": {
    "structure": X.X,
    "gagne": X.X,
    "alignment": X.X,
    "cognitive_load": X.X,
    "adult_learning": X.X,
    "writing": X.X,
    "retrieval": X.X,
    "overall": X.X
  },
  "gagne_breakdown": {
    "attention": X,
    "objectives": X,
    ...
  },
  "issues": [
    {
      "category": "...",
      "severity": "critical|important|minor",
      "location": "section/line",
      "problem": "...",
      "current_content": "...",
      "replacement_content": "...",
      "rationale": "..."
    }
  ]
}
```

**Gate**: PASS if Gagné score ≥ 7/10 AND alignment = ALIGNED AND no critical issues.

---

## Phase 1.3: Quiz Auditor Agent

**Purpose**: Validate quiz quality and objective alignment.

### Quiz Quality Criteria

| Criterion | Requirement |
|-----------|-------------|
| **Structure** | Exactly 4 options, exactly 1 correct |
| **No Anti-Patterns** | No "all/none of the above", no negative framing |
| **Distractors** | All plausible, represent common misconceptions |
| **Cognitive Level** | Matches lesson objective's Bloom level |
| **Explanation** | Addresses ALL four options, not just correct |

### Agent Prompt

```
Task: "Quiz Auditor - [lesson-id] - [quiz-id]"

You are auditing a quiz for learning effectiveness.

QUIZ COMPONENT:
[Insert complete Quiz JSX]

LESSON OBJECTIVE:
[Insert the lesson's stated objective from frontmatter]

EXECUTE:

1. STRUCTURE CHECK
   □ Options count: ___ (must be 4)
   □ Correct answers: ___ (must be 1)
   □ "All of the above" present: Yes/No (must be No)
   □ "None of the above" present: Yes/No (must be No)
   □ Negative framing ("NOT"): Yes/No (must be No)

2. DISTRACTOR ANALYSIS
   For each incorrect option:
   | Option | Text | Plausible? | Misconception? | Too Obviously Wrong? |

   All distractors must be plausible but clearly wrong upon understanding.

3. COGNITIVE LEVEL MATCH
   - Question tests: [Remember/Understand/Apply/Analyze/Evaluate]
   - Objective requires: [level from objective's verb]
   - MATCH: Yes/No

   If No: Quiz tests [level] but should test [required level]

4. EXPLANATION QUALITY
   Current explanation addresses:
   □ Why correct answer is correct
   □ Why option A is wrong (or correct)
   □ Why option B is wrong (or correct)
   □ Why option C is wrong (or correct)
   □ Why option D is wrong (or correct)

5. ALIGNMENT CHECK
   - Does this quiz test the stated objective?
   - Or does it test trivia/tangential knowledge?

Return:
{
  "quiz_id": "...",
  "lesson_id": "...",
  "pass": true/false,
  "issues": [
    {
      "type": "structure|distractor|cognitive_level|explanation|alignment",
      "severity": "critical|important|minor",
      "problem": "...",
      "fix": "..."
    }
  ],
  "corrected_quiz": {
    // Complete corrected Quiz component if issues found
  }
}
```

**Gate**: PASS if all structure checks pass AND cognitive level matches AND explanation covers all options.

---

## Phase 1.4: Consistency Checker Agent

**Purpose**: Find terminology and example inconsistencies across the path.

### Consistency Dimensions

| Dimension | What to Check |
|-----------|---------------|
| **Terminology** | Same concepts use same names throughout |
| **Definitions** | Terms defined consistently when introduced |
| **Examples** | Examples build on each other, don't contradict |
| **Cross-references** | Lessons reference prior lessons explicitly |

### Agent Prompt

```
Task: "Consistency Checker - [path-id]"

You are checking for consistency across all lessons in a learning path.

LESSONS:
[Insert all lesson MDX files, labeled by lesson ID]

EXECUTE:

1. TERMINOLOGY AUDIT
   Extract all key terms (budget concepts, classifications, etc.)

   | Term | First Introduced | Definition Given | Variations Found |

   Flag:
   - Terms used before defined
   - Same concept with different names
   - Conflicting definitions

2. EXAMPLE TRACKING
   | Example/Scenario | Lessons Used | Consistent? | Issue |

   Check:
   - Do examples build on each other?
   - Any contradictory examples?
   - Is there a running case study? Should there be?

3. CROSS-REFERENCE AUDIT
   | Lesson | References Prior? | Explicit Callback? |

   Expected: "Remember from [prior lesson]..." or similar

4. JARGON CHECK
   List all technical terms.
   For each: Is it defined on first use? Is definition clear?

Return:
{
  "scores": {
    "terminology": X.X,
    "examples": X.X,
    "cross_references": X.X,
    "overall": X.X
  },
  "terminology_issues": [
    {
      "term": "...",
      "problem": "used_before_defined|inconsistent_definition|multiple_names",
      "locations": [...],
      "canonical_term": "...",
      "fix": "..."
    }
  ],
  "example_issues": [...],
  "missing_cross_references": [...]
}
```

**Gate**: PASS if no terminology used before defined AND no conflicting definitions.

---

## Phase 2: Findings Aggregation

**Purpose**: Combine all agent outputs into unified scoring and prioritized issues.

### Aggregation Process

```
1. COLLECT all agent outputs
2. MERGE issues by location (deduplicate overlapping findings)
3. CALCULATE composite scores:

   Path Score = 0.30 * PathAnalyst.overall +
                0.50 * avg(LessonReviewer.overall) +
                0.10 * avg(QuizAuditor.pass_rate) +
                0.10 * ConsistencyChecker.overall

4. PRIORITIZE issues:
   - Critical: Blocks learning, must fix before publish
   - Important: Degrades learning, should fix soon
   - Minor: Polish, fix when convenient

5. GROUP issues by type for efficient fixing
```

### Composite Scoring Rubric

| Overall Score | Verdict |
|---------------|---------|
| 9.0 - 10.0 | Excellent — Ready to publish |
| 8.0 - 8.9 | Good — Minor polish needed |
| 7.0 - 7.9 | Needs Work — Important fixes required |
| < 7.0 | Major Revision — Critical issues present |

**Gate**: PASS to Phase 3 always (even if scores low, we generate fixes).

---

## Phase 3: Fix Generation

**Purpose**: Generate exact replacement content for all issues.

### Fix Types

| Issue Type | Fix Approach |
|------------|--------------|
| **Weak Hook** | Generate engaging question/fact/scenario opener |
| **Missing Recall** | Add "Remember from [lesson]..." connection |
| **No Retrieval** | Insert Hidden components after chunks |
| **Missing Transfer** | Add summary blockquote + real-world application |
| **Quiz Level Mismatch** | Rewrite question to match objective's Bloom level |
| **Inconsistent Term** | Standardize on canonical term throughout |
| **Missing Prerequisite** | Add to lesson's prerequisites array |

### Fix Template

For EVERY issue, generate:

```
────────────────────────────────────────────────────────────────
FIX #[N]: [Issue Title]
────────────────────────────────────────────────────────────────
Location: [Lesson ID], [Section/Line]
Severity: [Critical/Important/Minor]
Problem: [What's wrong]
Impact: [How it hurts learning]

CURRENT:
[Quote exact current content]

REPLACEMENT:
[Provide exact replacement content]

RATIONALE:
[Why this fix improves learning]

ROMANIAN UPDATE:
[Corresponding Romanian fix if applicable]
────────────────────────────────────────────────────────────────
```

### Common Fix Patterns

#### Weak Hook → Engaging Opener

```
CURRENT:
In this lesson, we will discuss budget classifications.

REPLACEMENT:
A hospital, a highway, and a teacher's salary—what do they have in common?
They all compete for the same budget. But how do governments decide which
gets funded? That's where classification systems come in.
```

#### Missing Recall Activation

```
CURRENT:
Economic classifications organize spending by type.

REPLACEMENT:
You've already seen how functional classifications group spending by
purpose—education, healthcare, defense. Economic classifications take a
different angle: they organize by *type* of expense, regardless of purpose.
Think salaries vs. equipment vs. transfers.
```

#### No Retrieval Practice → Embedded Checks

```
ADD AFTER CHUNK:
<Hidden trigger="Quick check: What's the difference between functional and economic classifications?">
Functional classifications group by **purpose** (what the money is for),
while economic classifications group by **type** (what kind of expense).
</Hidden>
```

#### Abrupt Ending → Transfer + Summary

```
CURRENT:
That's how budget classifications work.
<MarkComplete label="Complete" />

REPLACEMENT:
> **Key Takeaways**
> - Functional classifications show *what* money is spent on
> - Economic classifications show *how* money is spent
> - Both views together reveal the full picture

**Try This**: Next time you explore a budget on Transparenta.eu,
switch between functional and economic views. Notice how the same
total amount tells different stories depending on which lens you use.

<MarkComplete label="Mark Lesson Complete" />
```

#### Quiz Tests Wrong Level

```
OBJECTIVE: "Analyze budget data to identify unusual patterns"

CURRENT (tests recall):
<Quiz
  question="What percentage typically goes to salaries?"
  options={[...]}
/>

REPLACEMENT (tests analysis):
<Quiz
  question="A city's budget shows 85% going to 'administrative costs' while neighboring cities average 40%. What does this pattern suggest?"
  options={[
    { id: "a", text: "The city is more efficient", isCorrect: false },
    { id: "b", text: "There may be a classification error or hidden spending", isCorrect: true },
    { id: "c", text: "The city has fewer services", isCorrect: false },
    { id: "d", text: "This is normal variation", isCorrect: false }
  ]}
  explanation="A 45 percentage point difference from neighboring cities is far outside normal variation. Option B is correct—such anomalies often indicate misclassification or spending that warrants investigation. Option A is wrong because higher admin costs suggest inefficiency. Option C doesn't explain the ratio. Option D ignores that this deviation is statistically significant."
/>
```

**Gate**: PASS if every critical/important issue has a complete fix with replacement content.

---

## Phase 4: Report Presentation

**Purpose**: Present findings clearly and offer to apply fixes.

### Report Structure

```markdown
# Learning Path Review: [path-id]

## Executive Summary

**Overall Score**: [X.X]/10 — [Excellent/Good/Needs Work/Major Revision]
**Critical Issues**: [count]
**Important Issues**: [count]
**Lessons Reviewed**: [count]

### Learner Experience Assessment
[2-3 sentences describing what learning would feel like]

---

## Dimension Scores

| Dimension | Score | Summary |
|-----------|-------|---------|
| Progression | /10 | [one-line summary] |
| Scaffolding | /10 | [one-line summary] |
| Alignment | /10 | [one-line summary] |
| Retrieval Practice | /10 | [one-line summary] |
| Consistency | /10 | [one-line summary] |
| Engagement | /10 | [one-line summary] |

---

## Lesson Summary

| Lesson | Gagné | Alignment | Load | Quiz | Overall |
|--------|-------|-----------|------|------|---------|
| [id] | /9 | ✓/✗ | ✓/✗ | ✓/✗ | [rating] |

---

## Critical Issues (Must Fix)

[List with fix references]

## Important Issues (Should Fix)

[List with fix references]

## Enhancements (Could Do)

[List]

---

## Ready to Apply?

I can automatically apply [X] fixes to [Y] lessons.
Would you like me to proceed?
```

---

## Phase 5: Fix Application

**Purpose**: Apply approved fixes and validate.

### Application Process

```
1. FOR EACH approved fix:
   a. Read current lesson file
   b. Apply Edit with old_string → new_string
   c. If Romanian update needed:
      - Read Romanian file
      - Apply corresponding edit
   d. Log change

2. VALIDATE:
   yarn learning:validate

3. IF validation fails:
   - Report which checks failed
   - Offer to investigate

4. REPORT completion:
   - Fixes applied: [count]
   - Lessons modified: [list]
   - Validation: PASS/FAIL
```

**Gate**: PASS if `yarn learning:validate` succeeds.

---

## Scoring Rubrics

### Gagné Event Scoring (per lesson)

| Score | Meaning |
|-------|---------|
| 2 | Event present and effective |
| 1 | Event present but weak or incomplete |
| 0 | Event missing or ineffective |

**Total possible**: 18 points → Normalize to 10-point scale.

### Bloom's Level Reference

| Level | Verbs | Expected Position |
|-------|-------|-------------------|
| Remember | define, list, identify, name | Early lessons |
| Understand | explain, describe, compare | Early-mid lessons |
| Apply | use, solve, demonstrate, calculate | Mid lessons |
| Analyze | differentiate, examine, compare | Mid-late lessons |
| Evaluate | judge, assess, recommend | Late lessons |
| Create | design, construct, propose | Capstone lessons |

### Cognitive Load Thresholds

| Metric | Target | Overloaded |
|--------|--------|------------|
| New concepts | ≤ 4 | > 4 |
| Word count | 500-1500 | > 1500 or < 500 |
| Chunk size | 200-300 words | > 400 words |
| Duration | 3-8 min | > 10 min |

---

## Termination Rules

Review is complete when:

1. **All lessons reviewed**: Every lesson in path has Lesson Reviewer output
2. **All quizzes audited**: Every Quiz component has Quiz Auditor output
3. **Consistency checked**: Consistency Checker has analyzed all content
4. **Fixes generated**: Every critical/important issue has replacement content
5. **Report presented**: User has seen findings and scores

If user approves fixes:

6. **Fixes applied**: All approved edits made to MDX files
7. **Validation passed**: `yarn learning:validate` succeeds

---

## Multi-Agent Orchestration

### Agent Launch Order

```
PHASE 1 (parallel, background):
├── Path Analyst Agent (1 instance)
├── Lesson Reviewer Agent (1 per lesson, parallel)
├── Quiz Auditor Agent (1 per quiz, parallel)
└── Consistency Checker Agent (1 instance)

PHASE 2 (sequential):
└── Aggregator (combines all outputs)

PHASE 3 (sequential):
└── Fix Generator (creates replacements for issues)

PHASE 4 (interactive):
└── Reporter (presents findings, gets approval)

PHASE 5 (sequential, if approved):
└── Fixer (applies changes, validates)
```

### Agent Output Contract

Every agent MUST return:

1. **Scores** (dimension scores + overall)
2. **Issues** (with severity, location, problem, fix)
3. **Pass/Fail** (for gate checking)

If agent cannot complete: Return partial results with `incomplete: true` and reason.

---

## Quality Checklist

Before marking review complete:

- [ ] All lessons loaded and reviewed
- [ ] All quizzes audited
- [ ] Consistency checked across path
- [ ] Every critical issue has a fix
- [ ] Every important issue has a fix
- [ ] Fixes include Romanian updates where needed
- [ ] Report presented to user
- [ ] If fixes applied: validation passed

---

## Validation Commands

After applying fixes:

```bash
# Validate learning content structure
yarn learning:validate

# Update metadata from MDX frontmatter
yarn learning:generate

# Type check
yarn typecheck
```

---

## Quick Reference: Issue Severity

| Severity | Definition | Examples |
|----------|------------|----------|
| **Critical** | Blocks learning, factually wrong, or breaks functionality | Missing completion component, objective-content misalignment, quiz with no correct answer |
| **Important** | Degrades learning experience significantly | Weak hook, no retrieval practice, cognitive overload |
| **Minor** | Polish and enhancement | Passive voice, inconsistent formatting, could add more examples |

---

## Ready to Begin

When user says **"Review learning path [path-id]"**, automatically:

1. **Phase 0**: Load path JSON + all lesson MDX files
2. **Phase 1**: Launch parallel review agents (background)
   - Path Analyst: Structure, progression, scaffolding
   - Lesson Reviewer (per lesson): Gagné, alignment, load
   - Quiz Auditor (per quiz): Quality, level match
   - Consistency Checker: Terms, examples, cross-refs
3. **Phase 2**: Aggregate scores and prioritize issues
4. **Phase 3**: Generate exact fixes for all critical/important issues
5. **Phase 4**: Present report with scores and action items
6. **Phase 5**: On approval, apply fixes and validate

**No additional prompting required** — the system knows what to do.

---

When user says **"Review lesson [lesson-id]"**, execute abbreviated flow:

1. Find lesson in path definitions
2. Load lesson MDX (en + ro)
3. Run Lesson Reviewer + Quiz Auditor
4. Present findings with fixes
5. On approval, apply and validate

---

When user says **"Fix [issue] in [lesson-id]"**, execute quick fix:

1. Read the lesson
2. Identify the specific issue
3. Generate fix with replacement content
4. Apply with Edit tool
5. Update Romanian version
6. Validate

---

*Version 1.0 — Based on Gagné's Nine Events, Bloom's Taxonomy, Cognitive Load Theory, and Knowles' Andragogy*
