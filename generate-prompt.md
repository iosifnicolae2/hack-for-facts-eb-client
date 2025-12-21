# Learning Module MDX Generator

## Role and Context

You are a learning content designer and MDX author for the Transparenta.eu civic education platform. Your task is to generate a high-quality, interactive MDX learning module from a specification file.

## Key Architecture Principles

### Modules Are Reusable Building Blocks

- **Modules are NOT tied to specific roles** (citizen, journalist, public official)
- **Modules are grouped by functionality or learning content** (e.g., "budget-basics", "red-flags", "classification-systems")
- **The same module can be reused across different learning paths**
- Paths (citizen, journalist, public-official) are just different orderings/selections of modules

### Modules Contain Multiple Atomic Lessons

- **Each module contains 2-5 focused lessons**
- **Each lesson is an atomic unit** focused on ONE key concept
- **Lessons are short** (5-10 minutes each)
- Interactive elements and exercises are built specifically around each lesson's concept
- This keeps learners focused and allows targeted practice

## INPUT

Module specification file: {MODULE_SPEC_PATH}

## YOUR TASK

### Step 1: Analyze the Module Specification

Read the specification file carefully and extract:

1. **Module metadata**: total duration, difficulty level, topic area
2. **Core concepts**: identify 2-5 distinct concepts that should become separate lessons
3. **Learning objectives**: map each objective to a specific lesson
4. **Interactive elements**: assign each to the lesson where its concept is taught
5. **Quiz questions**: group by concept/lesson
6. **Platform integrations**: links to Budget Explorer or other platform features
7. **Key takeaways**: summary points per lesson and module-level

### Step 2: Split Into Atomic Lessons

**CRITICAL**: Break the module into 2-5 focused lessons. Each lesson should:

- **Cover ONE key concept** (not multiple concepts)
- **Be completable in 5-10 minutes**
- **Have 1-2 interactive elements** directly related to that concept
- **Include 1-2 quiz questions** testing that specific concept
- **Build on previous lessons** in a logical progression

**Lesson Splitting Guidelines:**

| Module Duration | Number of Lessons | Minutes per Lesson |
|-----------------|-------------------|-------------------|
| 10-20 min       | 2-3 lessons       | 5-7 min each      |
| 20-40 min       | 3-4 lessons       | 7-10 min each     |
| 40+ min         | 4-5 lessons       | 8-12 min each     |

**How to Identify Lesson Boundaries:**

1. Look for natural topic shifts in the spec
2. Each "Interactive Element" section often maps to one lesson
3. Each "Core Concept" section is typically one lesson
4. If a concept requires prerequisite knowledge, it should be a later lesson

### Step 3: Generate MDX Content

Generate ONE MDX file per lesson. Each lesson file should be self-contained and focused.

#### File Naming Convention

```
src/content/learning/modules/{module-slug}/
├── 01-{lesson-slug}.en.mdx
├── 02-{lesson-slug}.en.mdx
├── 03-{lesson-slug}.en.mdx
└── index.json  (module metadata)
```

#### Module Metadata File (index.json)

```json
{
  "id": "{module-slug}",
  "title": { "en": "{Module Title}" },
  "description": { "en": "{Brief module description}" },
  "difficulty": "beginner|intermediate|advanced",
  "totalDurationMinutes": {X},
  "lessons": [
    {
      "id": "{module-slug}-01",
      "slug": "01-{lesson-slug}",
      "title": { "en": "{Lesson 1 Title}" },
      "concept": "{Core concept this lesson teaches}",
      "durationMinutes": {X}
    },
    {
      "id": "{module-slug}-02",
      "slug": "02-{lesson-slug}",
      "title": { "en": "{Lesson 2 Title}" },
      "concept": "{Core concept this lesson teaches}",
      "durationMinutes": {X}
    }
  ]
}
```

#### Lesson Structure Template

Each lesson MDX file follows this atomic structure:

```mdx
# {Lesson Title}

## Lesson Overview

| Property | Value |
|----------|-------|
| **Duration** | {5-10} minutes |
| **Concept** | {The ONE key concept this lesson teaches} |
| **Module** | {Parent module name} |
| **Lesson** | {X} of {Y} |

---

## Learning Objective

By the end of this lesson, you will be able to:

- [ ] {ONE specific, measurable objective for this concept}

---

## {Concept Introduction}

{2-3 paragraphs introducing the concept, connecting to prior knowledge}

> **Key Insight:** {The main takeaway in one sentence}

---

## {Interactive Element Title}

{Brief context explaining why this interactive helps learn the concept}

### {Component Name}

{ASCII box diagram - visual specification for future React implementation}

**Component Interface:**
```typescript
interface {ComponentName}Props {
  readonly {propName}: {type}
}
```

**Expected Behavior:**
- {Behavior 1}
- {Behavior 2}

---

## {Core Explanation Section}

{Clear, focused explanation of the ONE concept}

- Bullet points for key facts
- A single table or diagram if needed
- Keep it focused - no tangents

---

## Practice

<Quiz
  id="{module-slug}-{lesson-number}-q1"
  question="{Question testing this specific concept}"
  options={[
    { id: 'a', text: '{Option A}', isCorrect: false },
    { id: 'b', text: '{Option B}', isCorrect: true },
    { id: 'c', text: '{Option C}', isCorrect: false },
  ]}
  explanation="{Explanation reinforcing the concept}"
/>

---

## Key Takeaway

> {ONE key takeaway that summarizes this lesson's concept}

---

## Lesson Navigation

| Previous | Current | Next |
|----------|---------|------|
| {Previous lesson or "—"} | **{Current Lesson}** | {Next lesson or "Module Complete"} |

<MarkComplete label="Complete this lesson" />
```

#### Example: Splitting a Module into Lessons

**Original Spec**: "Module 2: Where Does the Money Come From? (Revenues)" (20 min)

**Split into 3 atomic lessons:**

1. **Lesson 1: Your Tax Contribution** (7 min)
   - Concept: How salary is taxed (CAS, CASS, income tax)
   - Interactive: Salary Calculator
   - Quiz: Test tax rate knowledge

2. **Lesson 2: Types of Public Revenue** (7 min)
   - Concept: Revenue sources (taxes, contributions, EU funds)
   - Interactive: Revenue Sources Diagram
   - Quiz: Identify revenue categories

3. **Lesson 3: Romania's Revenue Problem** (6 min)
   - Concept: Why Romania has low collection and deficit
   - Interactive: EU Comparison Chart
   - Quiz: Understand deficit causes

### Step 4: Full Component Behavior Specifications

For EACH interactive element, provide a complete specification including:

#### 4.1 TypeScript Interface

```typescript
interface ComponentNameProps {
  readonly propName: type
  // ... all props with readonly modifier
}
```

#### 4.2 State Management

Describe the component's internal state:

- Initial state values
- State transitions (what triggers changes)
- Derived/computed values

#### 4.3 User Interactions

Detail all user actions:

- Click handlers and their effects
- Input validation rules
- Keyboard shortcuts (Tab, Enter, Escape, Arrow keys)
- Touch/mobile considerations

#### 4.4 Visual States

Describe appearance for each state:

- Default/idle state
- Hover state
- Active/focused state
- Loading state (if applicable)
- Success/error states
- Disabled state

#### 4.5 Animations

Specify motion design:

- Entry/exit animations
- Transition durations (use 150-300ms for micro-interactions)
- Easing functions (ease-out for entries, ease-in for exits)
- Reduced motion considerations

#### 4.6 Accessibility

Document a11y requirements:

- ARIA roles and labels
- Focus management
- Screen reader announcements
- Color contrast requirements

**Example Full Specification:**

```typescript
/**
 * TaxCalculator Component
 *
 * PURPOSE: Allow users to calculate their tax contribution from gross salary
 *
 * INTERFACE:
 */
interface TaxCalculatorProps {
  readonly initialValue?: number
  readonly taxRates: readonly TaxRate[]
  readonly currency?: 'RON' | 'EUR'
  readonly onCalculate?: (result: CalculationResult) => void
}

interface TaxRate {
  readonly id: string
  readonly name: string
  readonly rate: number
  readonly description: string
  readonly paidBy: 'employee' | 'employer'
}

interface CalculationResult {
  readonly grossSalary: number
  readonly netSalary: number
  readonly totalTax: number
  readonly breakdown: readonly { rateId: string; amount: number }[]
}

/**
 * STATE MANAGEMENT:
 * - inputValue: number (user's entered salary)
 * - isCalculating: boolean (brief loading state for animation)
 * - result: CalculationResult | null
 * - error: string | null (validation errors)
 *
 * STATE TRANSITIONS:
 * - User types → update inputValue, clear error
 * - User submits → validate, set isCalculating, compute result
 * - Invalid input → set error message
 *
 * USER INTERACTIONS:
 * - Input field: type salary amount
 * - Enter key: trigger calculation
 * - Clear button: reset to initial state
 * - Click on breakdown item: show tooltip with explanation
 *
 * VISUAL STATES:
 * - Empty: placeholder text "Enter your gross salary"
 * - Filled: show formatted number with currency
 * - Calculating: brief pulse animation (200ms)
 * - Result: animated breakdown bars fill from 0% to calculated %
 * - Error: red border, shake animation (300ms), error text below
 *
 * ANIMATIONS:
 * - Result bars: stagger animation, 100ms delay between each
 * - Number counters: count-up animation over 500ms
 * - Entry: fade-in + slide-up (200ms, ease-out)
 *
 * ACCESSIBILITY:
 * - role="application" on calculator container
 * - aria-live="polite" on result region
 * - Input has aria-describedby linking to format hint
 * - Each breakdown item is a list item for screen readers
 * - Focus trap within component when active
 */
```

### Step 5: Quiz Design Guidelines

1. **Question Types**: Use single-choice (current Quiz component supports this)
2. **Difficulty Progression**: Start easy, increase complexity
3. **Meaningful Distractors**: Wrong answers should be plausible but clearly wrong
4. **Educational Explanations**: Explanations should teach, not just confirm
5. **ID Naming**: Use `{module-slug}-q{number}` format for quiz IDs

**Quiz Component Usage:**

```mdx
<Quiz
  id="citizen-revenues-q1"
  question="What percentage of your salary goes to CAS (pension contribution)?"
  options={[
    { id: 'a', text: '10%', isCorrect: false },
    { id: 'b', text: '16%', isCorrect: false },
    { id: 'c', text: '25%', isCorrect: true },
    { id: 'd', text: '35%', isCorrect: false },
  ]}
  explanation="CAS (Contribuția de Asigurări Sociale) is 25% of your gross salary, deducted from your paycheck for the public pension system."
/>
```

### Step 6: Visual Element Guidelines

1. **ASCII Diagrams**: Preserve ASCII box art for visual structure
2. **Tables**: Use markdown tables for comparisons and metadata
3. **Blockquotes**: Use for key insights and definitions
4. **Code Blocks**: Use for technical specifications and future component interfaces
5. **Horizontal Rules**: Use `---` to separate major sections

### Step 7: Quality Checklist

**For Each Lesson:**

- [ ] Focuses on ONE key concept only
- [ ] Completable in 5-10 minutes
- [ ] Has 1-2 interactive elements related to that concept
- [ ] Has 1-2 quiz questions testing that concept
- [ ] Ends with `<MarkComplete label="..." />` component
- [ ] Navigation links correct (prev/next lesson)

**For the Module:**

- [ ] Module slug is content-based (not role-based)
- [ ] index.json has correct lesson metadata
- [ ] Lessons build on each other logically
- [ ] Total duration matches sum of lesson durations
- [ ] Each interactive element has a clear interface specification
- [ ] Accessibility requirements are documented

## OUTPUT FORMAT

Generate MULTIPLE files for each module:

### Required Files

```text
src/content/learning/modules/{module-slug}/
├── index.json              # Module metadata with lesson list
├── 01-{lesson-slug}.en.mdx # First lesson
├── 02-{lesson-slug}.en.mdx # Second lesson
├── 03-{lesson-slug}.en.mdx # Third lesson (if needed)
└── ...                     # Additional lessons as needed
```

### Module Naming Convention

**Module slugs are content-based, NOT role-based:**

✅ Good examples:
- `budget-basics` (can be used by all roles)
- `revenue-sources` (reusable across paths)
- `red-flag-detection` (shared concept)
- `classification-systems` (universal knowledge)

❌ Bad examples:
- `citizen-foundations` (tied to role)
- `journalist-red-flags` (tied to role)

### Lesson Naming Convention

Lessons are numbered and slugged within their module:
- `01-what-is-a-budget.en.mdx`
- `02-your-three-roles.en.mdx`
- `03-promises-vs-reality.en.mdx`

Note: Romanian translations can be added later (e.g., `01-what-is-a-budget.ro.mdx`).

```

---

## Usage Instructions

1. **Locate the module spec file** in `docs/learning/modules/{module-name}.md`
2. **Copy the prompt template** above
3. **Replace `{MODULE_SPEC_PATH}`** with the actual path
4. **Run the prompt** - the AI will generate multiple lesson MDX files + index.json
5. **Review and refine** - check quiz accuracy, link correctness, component specs
6. **Place the output** in `src/content/learning/modules/{module-slug}/`

---

## Key Files Reference

### Input Spec Locations

Module specifications (content-based, not role-based):
- `docs/learning/modules/{module-name}.md` - New location for reusable modules

### Output Structure

Each module generates a folder with multiple lessons:
```text
src/content/learning/modules/{module-slug}/
├── index.json                    # Module metadata
├── 01-{lesson-slug}.en.mdx       # Lesson 1
├── 02-{lesson-slug}.en.mdx       # Lesson 2
└── ...
```

### Path Configuration (References Modules)

Paths define which modules to include and in what order:
- Citizen: `src/content/learning/paths/citizen.json`
- Journalist: `src/content/learning/paths/journalist.json`
- Public Official: `src/content/learning/paths/public_servant.json`

Each path references shared modules:
```json
{
  "id": "citizen",
  "modules": [
    { "moduleId": "budget-basics", "order": 1 },
    { "moduleId": "revenue-sources", "order": 2 },
    { "moduleId": "red-flag-detection", "order": 3 }
  ]
}
```

### Component Files (for interface reference)

- Quiz: `src/features/learning/components/assessment/Quiz.tsx`
- MarkComplete: `src/features/learning/components/player/MarkComplete.tsx`
- Interactive (future): `src/features/learning/components/interactive/`

---

## Component Interfaces Currently Supported

### Quiz Component
```typescript
type QuizOption = {
  readonly id: string      // 'a', 'b', 'c', 'd'
  readonly text: string    // Option text
  readonly isCorrect: boolean
}

type QuizProps = {
  readonly id: string          // Unique quiz ID
  readonly question: string    // Question text
  readonly options: readonly QuizOption[]
  readonly explanation: string // Shown after answering
  readonly contentId: string   // Auto-injected by LessonPlayer
}
```

### MarkComplete Component

```typescript
type MarkCompleteProps = {
  readonly label?: string     // Button label, defaults to "Mark as Complete"
  readonly contentId: string  // Auto-injected by LessonPlayer
}
```

---

## Future Interactive Components (Full Behavior Patterns)

When specifying future components in the Technical Notes section, use these comprehensive patterns:

---

### FlipCard Component

```typescript
/**
 * FlipCard - Reveals hidden content on interaction
 *
 * PURPOSE: Present concepts with front (title/icon) and back (detailed explanation)
 */
interface FlipCardProps {
  readonly cards: readonly FlipCardItem[]
  readonly onCardFlip?: (cardId: string) => void
  readonly onAllViewed?: () => void
}

interface FlipCardItem {
  readonly id: string
  readonly frontTitle: string
  readonly frontIcon: string      // Emoji or icon name
  readonly backContent: string    // Markdown supported
  readonly category?: string      // Optional grouping
}

/**
 * STATE:
 * - flippedCards: Set<string> (IDs of cards currently showing back)
 * - viewedCards: Set<string> (IDs of cards that have been viewed at least once)
 *
 * INTERACTIONS:
 * - Click card: toggle flip state
 * - Enter/Space on focused card: toggle flip
 * - Escape: flip back to front
 * - Tab: navigate between cards
 *
 * VISUAL STATES:
 * - Front: icon + title, subtle shadow
 * - Back: full content, slightly elevated shadow
 * - Flipping: 3D rotate animation (400ms, ease-in-out)
 * - Viewed indicator: subtle checkmark badge on corner
 *
 * ANIMATIONS:
 * - Flip: rotateY 180deg with perspective
 * - Hover: scale(1.02), shadow elevation
 * - Progress bar: fills as cards are viewed
 *
 * ACCESSIBILITY:
 * - role="button" on each card
 * - aria-pressed for flip state
 * - aria-label with front title
 * - Announce back content on flip
 */
```

---

### Calculator Component

```typescript
/**
 * Calculator - Real-time computation with visual breakdown
 *
 * PURPOSE: Allow users to input values and see computed results with explanation
 */
interface CalculatorProps {
  readonly id: string
  readonly title: string
  readonly inputs: readonly CalculatorInput[]
  readonly computeFn: (values: Record<string, number>) => CalculatorResult
  readonly formatOptions?: Intl.NumberFormatOptions
}

interface CalculatorInput {
  readonly id: string
  readonly label: string
  readonly placeholder?: string
  readonly min?: number
  readonly max?: number
  readonly step?: number
  readonly defaultValue?: number
  readonly suffix?: string        // e.g., "RON", "%"
}

interface CalculatorResult {
  readonly total: number
  readonly breakdown: readonly {
    readonly label: string
    readonly value: number
    readonly percentage?: number
    readonly color?: string
  }[]
  readonly insights?: readonly string[]  // Key takeaways
}

/**
 * STATE:
 * - inputValues: Record<string, number>
 * - result: CalculatorResult | null
 * - isAnimating: boolean
 * - errors: Record<string, string>
 *
 * INTERACTIONS:
 * - Input change: debounced recalculation (300ms)
 * - Enter: immediate recalculation
 * - Reset button: clear all to defaults
 * - Breakdown item hover: show tooltip with details
 *
 * VISUAL STATES:
 * - Empty: placeholder values shown
 * - Calculating: subtle pulse on result area
 * - Computed: animated bars + counters
 * - Error: input highlighted red, error message
 *
 * ANIMATIONS:
 * - Bars: width animates from 0 to final % (500ms, staggered 100ms)
 * - Numbers: count-up animation (400ms)
 * - Insights: fade-in sequentially (200ms delay each)
 *
 * ACCESSIBILITY:
 * - Inputs properly labeled with aria-describedby for format hints
 * - Results announced via aria-live="polite"
 * - Error messages linked to inputs via aria-errormessage
 */
```

---

### ComparisonChart Component

```typescript
/**
 * ComparisonChart - Horizontal bar chart for comparing values
 *
 * PURPOSE: Visualize relative differences between items (countries, categories, etc.)
 */
interface ComparisonChartProps {
  readonly title: string
  readonly items: readonly ComparisonItem[]
  readonly unit?: string
  readonly highlightItem?: string    // ID of item to highlight
  readonly showAverage?: boolean
  readonly sortOrder?: 'asc' | 'desc' | 'none'
}

interface ComparisonItem {
  readonly id: string
  readonly label: string
  readonly value: number
  readonly flag?: string             // Country flag emoji
  readonly annotation?: string       // e.g., "← LOWEST"
}

/**
 * STATE:
 * - hoveredItem: string | null
 * - sortedItems: ComparisonItem[] (computed from sortOrder)
 * - maxValue: number (for scaling bars)
 *
 * INTERACTIONS:
 * - Hover bar: show exact value tooltip
 * - Click bar: optional drill-down callback
 * - Keyboard: arrow keys navigate between items
 *
 * VISUAL STATES:
 * - Default: all bars same color
 * - Highlighted: one bar uses accent color
 * - Hovered: bar slightly elevated, value visible
 * - Average line: dashed vertical line if showAverage=true
 *
 * ANIMATIONS:
 * - Entry: bars grow from left (600ms, staggered 50ms)
 * - Hover: scale(1.02) + elevation
 * - Sort change: bars reorder with spring animation
 *
 * ACCESSIBILITY:
 * - role="img" with aria-label describing the chart
 * - Each bar is a listitem with value in aria-label
 * - Screen reader announces "X of Y: Z units"
 */
```

---

### GuidedActivity Component

```typescript
/**
 * GuidedActivity - Step-by-step platform walkthrough
 *
 * PURPOSE: Guide users through using platform features with validation
 */
interface GuidedActivityProps {
  readonly title: string
  readonly steps: readonly GuidedStep[]
  readonly onComplete?: () => void
  readonly allowSkip?: boolean
}

interface GuidedStep {
  readonly id: string
  readonly instruction: string       // What user should do
  readonly hint?: string             // Additional guidance
  readonly deepLink?: string         // URL to open
  readonly validation: StepValidation
}

type StepValidation =
  | { type: 'manual' }                           // User clicks "Done"
  | { type: 'input'; question: string; answer: string }  // User enters answer
  | { type: 'confirm'; question: string }        // Yes/No confirmation

/**
 * STATE:
 * - currentStep: number
 * - completedSteps: Set<string>
 * - stepInputs: Record<string, string>
 * - isValidating: boolean
 *
 * INTERACTIONS:
 * - "Open Link" button: opens deep link in new tab
 * - "Mark Done" button: advances to next step
 * - Input submission: validates answer, shows feedback
 * - "Skip" button: if allowSkip, moves to next
 * - Back button: return to previous step
 *
 * VISUAL STATES:
 * - Pending step: dimmed, numbered
 * - Current step: highlighted, full instruction visible
 * - Completed step: checkmark, collapsed
 * - Incorrect answer: shake animation, error message
 * - All complete: celebration state
 *
 * ANIMATIONS:
 * - Step transition: slide + fade (300ms)
 * - Completion: confetti burst or checkmark animation
 * - Error: shake (200ms)
 * - Progress bar: smooth fill
 *
 * ACCESSIBILITY:
 * - role="group" with aria-label for activity
 * - Steps are list items
 * - Current step has aria-current="step"
 * - Completion announced via aria-live
 */
```

---

### AlertBox Component

```typescript
/**
 * AlertBox - Highlighted information box for legislative updates or warnings
 *
 * PURPOSE: Draw attention to time-sensitive or important information
 */
interface AlertBoxProps {
  readonly type: 'info' | 'warning' | 'success' | 'legislative'
  readonly title: string
  readonly content: string           // Markdown supported
  readonly effectiveDate?: string    // For legislative changes
  readonly sourceLink?: string
  readonly dismissible?: boolean
}

/**
 * VISUAL STATES:
 * - Info: blue accent, info icon
 * - Warning: amber accent, warning triangle
 * - Success: green accent, checkmark
 * - Legislative: purple accent, gavel icon, date badge
 *
 * ANIMATIONS:
 * - Entry: slide-down + fade (200ms)
 * - Dismiss: slide-up + fade (200ms)
 * - Pulse: subtle pulse on icon for emphasis
 *
 * ACCESSIBILITY:
 * - role="alert" for warnings
 * - role="status" for info/success
 * - Dismiss button has aria-label="Dismiss alert"
 */
```

---

## Quick Start Example

To generate a module with multiple lessons, use this prompt:

```text
Generate a learning module from this specification:

docs/learning/modules/budget-basics.md

Split into atomic lessons (one concept per lesson, 5-10 min each).
Include full component behavior specifications for all interactive elements.

Output:
1. index.json (module metadata with lesson list)
2. Each lesson as a separate MDX file (01-xxx.en.mdx, 02-xxx.en.mdx, etc.)
```

Example output structure:
```text
src/content/learning/modules/budget-basics/
├── index.json
├── 01-what-is-a-budget.en.mdx
├── 02-your-three-roles.en.mdx
└── 03-promises-vs-reality.en.mdx
```

---

## Summary

This prompt template enables you to:

1. **Transform module specs** into multiple atomic lesson MDX files
2. **Keep lessons focused** on ONE concept each (5-10 minutes)
3. **Create reusable modules** that can be shared across different learning paths
4. **Specify full component behaviors** for future React implementation
5. **Maintain platform consistency** with existing Quiz and MarkComplete components

**Key Architecture:**

- Modules are **content-based**, NOT role-based
- Each module contains **2-5 atomic lessons**
- Paths (citizen, journalist, etc.) **reference shared modules**

**Files involved:**

- Input: `docs/learning/modules/{module-name}.md`
- Output: `src/content/learning/modules/{module-slug}/` (folder with index.json + lesson MDX files)
