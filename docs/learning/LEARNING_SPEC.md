# Technical Specification: Public Budget Learning Platform

**Version:** 2.0
**Status:** Draft
**Last Updated:** December 2024
**Context:** Civic Education on Romanian Public Budget & Law

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Functional Requirements](#3-functional-requirements)
4. [Data Models](#4-data-models)
5. [Architecture](#5-architecture)
6. [Component Specifications](#6-component-specifications)
7. [Progress & State Management](#7-progress--state-management)
8. [Assessment System](#8-assessment-system)
9. [Certification System](#9-certification-system)
10. [Internationalization](#10-internationalization)
11. [Notifications & Re-engagement](#11-notifications--re-engagement)
12. [Performance & SEO](#12-performance--seo)
13. [Accessibility](#13-accessibility)
14. [Analytics & Metrics](#14-analytics--metrics)
15. [Security Considerations](#15-security-considerations)
16. [Implementation Phases](#16-implementation-phases)
17. [Open Questions](#17-open-questions)
18. [Related Documents](#18-related-documents)

---

## 1. Executive Summary

### Goal

Build a friction-free, highly interactive educational platform that demystifies the Romanian public budget. The architecture supports a "content-first" approach where interactive modules (simulators, quizzes) are embedded within narrative content (MDX). The system prioritizes virality and accessibility, allowing guest users to learn immediately while incentivizing registration through progress synchronization and certification.

### Key Principles

- **Frictionless Entry**: No authentication required to start learning
- **Content-First**: MDX-based content with embedded React components
- **Module Reusability**: Modules are atomic units that can appear in multiple learning paths
- **Progressive Enhancement**: Guest → Authenticated user with seamless progress merge
- **Virality Built-In**: Shareable certificates, social media optimized, public verification

---

## 2. Problem Statement

### Current Challenges

1. **Knowledge Gap**: Romanian citizens lack understanding of how public budgets work
2. **Engagement**: Existing educational materials are static and unengaging
3. **Accessibility**: Budget information is complex and presented in technical jargon
4. **Actionability**: Learning rarely translates to civic engagement

### Solution Approach

Create role-based learning paths that combine:
- Theoretical knowledge with interactive demonstrations
- Real platform data integration for concrete examples
- Gamified assessment with public certification
- Progressive skill building from basics to specialized topics

---

## 3. Functional Requirements

### 3.1 Access & Onboarding

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **Frictionless Entry** | Users interact with all content immediately, no auth gate | P0 |
| **Role Selection** | Users select persona (Citizen, Journalist, Public Official) | P0 |
| **Role Switching** | Switch roles anytime without losing progress | P0 |
| **Progress Persistence** | Guest progress stored in localStorage | P0 |
| **Auth Sync** | Authenticated users sync progress to database | P0 |
| **Progress Merge** | On login, merge local + remote progress (union) | P1 |

### 3.2 Learning Experience

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **Interactive Content** | Simulators, live data, quizzes embedded in MDX | P0 |
| **Dynamic Loading** | Modules lazy-loaded on demand | P0 |
| **Visual Progress** | Learning path visualization with completion state | P0 |
| **Module Navigation** | Previous/next navigation, jump to any module | P0 |
| **Platform Integration** | CTAs linking to Budget Explorer, Entity Analytics | P1 |
| **Language Switching** | Full i18n support (en, ro) | P0 |

### 3.3 Assessment

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **Module Quizzes** | Multiple choice, fill-in-blank, interactive challenges | P0 |
| **Minimum Score** | 70% required to mark module as "passed" | P0 |
| **Infinite Retries** | Focus on mastery, not penalization | P0 |
| **Instant Feedback** | Show correct/incorrect immediately with explanations | P0 |
| **Progress Tracking** | Track attempts, best score, completion date | P1 |

### 3.4 Certification

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **Tiered Certificates** | Bronze (60%), Silver (80%), Gold (100%) | P0 |
| **Public Verification** | Permanent URL: `/certificates/{uuid}` | P0 |
| **Social Sharing** | Dynamic OG image with name + completion % | P0 |
| **Honor Code** | Name entry + disclaimer checkbox before generation | P0 |
| **Context-Aware Messages** | Funny/encouraging phrases based on tier | P1 |
| **Certificate Download** | PDF/PNG export option | P2 |

### 3.5 Virality & Social

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **Share Buttons** | Module completion, certificate, progress milestones | P0 |
| **Public Profile** | Optional opt-in to show learning stats | P1 |
| **OG Meta Tags** | Dynamic social previews for shared content | P0 |
| **Referral Tracking** | Track how users discovered the platform | P2 |

### 3.6 Notifications

| Requirement | Description | Priority |
|-------------|-------------|----------|
| **Email Reminders** | Inactivity reminders after X days | P2 |
| **Learning Summary** | "What you learned today" email | P2 |
| **Streak Tracking** | Consecutive days learning | P2 |
| **Milestone Celebrations** | Email on certificate unlock | P1 |

---

## 4. Data Models

### 4.1 Core Entities

```typescript
// Learning Path (Role-based curriculum)
type LearningPath = {
  readonly id: string                    // e.g., "citizen", "journalist"
  readonly slug: string                  // URL slug
  readonly title: TranslatedString       // Display name
  readonly description: TranslatedString // Short description
  readonly icon: string                  // Icon identifier
  readonly modules: ModuleReference[]    // Ordered list of modules
  readonly estimatedDuration: number     // Minutes
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  readonly prerequisites: string[]       // Path IDs
}

// Module (Atomic learning unit)
type Module = {
  readonly id: string                    // Unique identifier
  readonly slug: string                  // URL slug
  readonly title: TranslatedString
  readonly description: TranslatedString
  readonly content: string               // MDX file path or content
  readonly duration: number              // Estimated minutes
  readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  readonly learningObjectives: TranslatedString[]
  readonly challenges: Challenge[]       // Embedded assessments
  readonly platformIntegrations: PlatformCTA[]
  readonly prerequisites: string[]       // Module IDs
  readonly tags: string[]                // For search/filtering
}

// Module Reference (in a path)
type ModuleReference = {
  readonly moduleId: string
  readonly order: number
  readonly isOptional: boolean
}

// Challenge (Assessment item)
type Challenge = {
  readonly id: string
  readonly type: ChallengeType
  readonly question: TranslatedString
  readonly options?: ChallengeOption[]   // For multiple choice
  readonly correctAnswer: string | string[]
  readonly explanation: TranslatedString // Shown after answer
  readonly points: number                // Weight in module score
  readonly hints?: TranslatedString[]    // Optional hints
}

type ChallengeType =
  | 'multiple_choice'
  | 'multiple_select'
  | 'fill_blank'
  | 'ordering'
  | 'matching'
  | 'interactive'      // Custom component

type ChallengeOption = {
  readonly id: string
  readonly label: TranslatedString
  readonly isCorrect: boolean
}

// Platform CTA (Call to Action)
type PlatformCTA = {
  readonly label: TranslatedString
  readonly route: string                 // Platform route
  readonly queryParams?: Record<string, string>
  readonly description: TranslatedString
}

// Translation wrapper
type TranslatedString = {
  readonly en: string
  readonly ro: string
}
```

### 4.2 Progress Entities

```typescript
// User Progress (stored in DB for authenticated users)
type UserProgress = {
  readonly userId: string
  readonly pathId: string
  readonly moduleProgress: ModuleProgress[]
  readonly startedAt: Date
  readonly lastActivityAt: Date
  readonly certificateId?: string        // If earned
}

// Module Progress
type ModuleProgress = {
  readonly moduleId: string
  readonly status: ModuleStatus
  readonly score?: number                // Best score (0-100)
  readonly attempts: number              // Quiz attempt count
  readonly completedAt?: Date
  readonly challengeResponses: ChallengeResponse[]
}

type ModuleStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'      // Content viewed
  | 'passed'         // Assessment passed (70%+)

// Challenge Response (individual answer)
type ChallengeResponse = {
  readonly challengeId: string
  readonly answer: string | string[]
  readonly isCorrect: boolean
  readonly attemptedAt: Date
}

// Guest Progress (localStorage schema)
type GuestProgress = {
  readonly version: number               // Schema version for migrations
  readonly paths: Record<string, GuestPathProgress>
  readonly lastUpdated: string           // ISO date
}

type GuestPathProgress = {
  readonly startedAt: string
  readonly modules: Record<string, GuestModuleProgress>
}

type GuestModuleProgress = {
  readonly status: ModuleStatus
  readonly score?: number
  readonly attempts: number
  readonly completedAt?: string
}
```

### 4.3 Certificate Entities

```typescript
// Certificate
type Certificate = {
  readonly id: string                    // UUID
  readonly userId: string
  readonly pathId: string
  readonly recipientName: string         // User-provided name
  readonly tier: CertificateTier
  readonly completionPercentage: number
  readonly modulesCompleted: number
  readonly modulesTotal: number
  readonly issuedAt: Date
  readonly verificationUrl: string       // Public URL
  readonly honorCodeAcceptedAt: Date
}

type CertificateTier = 'bronze' | 'silver' | 'gold'

// Tier thresholds
const CERTIFICATE_TIERS = {
  bronze: { minPercentage: 60, label: 'Bronze', color: '#CD7F32' },
  silver: { minPercentage: 80, label: 'Silver', color: '#C0C0C0' },
  gold: { minPercentage: 100, label: 'Gold', color: '#FFD700' },
} as const
```

---

## 5. Architecture

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React SPA)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Learning   │  │   Progress   │  │    Certificate       │   │
│  │   Player     │  │   Engine     │  │    Generator         │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│         │                 │                    │                 │
│         ▼                 ▼                    ▼                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    State Layer                            │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │ TanStack   │  │ localStorage│  │   URL State        │  │   │
│  │  │ Query      │  │ (guests)   │  │   (TanStack Router)│  │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        CONTENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   MDX Files  │  │   Path       │  │    Interactive       │   │
│  │   (content)  │  │   Configs    │  │    Components        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (GraphQL API)                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Progress   │  │  Certificate │  │    Notification      │   │
│  │   Service    │  │   Service    │  │    Service           │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Content Engine

**Format**: MDX (Markdown + JSX)

MDX allows embedding React components directly in markdown content:

```mdx
# Module 1: Budget Foundations

Public budgets affect every aspect of your daily life...

<BudgetImpactCalculator />

## Your Three Roles as a Citizen

<CardFlip cards={[
  { front: "Taxpayer", back: "You fund the budget through taxes" },
  { front: "Beneficiary", back: "You use public services" },
  { front: "Watchdog", back: "You have the right to monitor spending" }
]} />

<Quiz
  questions={[
    {
      question: "What percentage of GDP flows through public budgets?",
      options: ["20%", "35%", "43%", "60%"],
      correct: 2
    }
  ]}
/>
```

### 5.3 Content Structure

```
src/
├── content/
│   └── learning/
│       ├── paths/
│       │   ├── citizen.json           # Path configuration
│       │   ├── journalist.json
│       │   └── public-official.json
│       ├── modules/
│       │   ├── foundations/
│       │   │   ├── index.mdx          # Module content
│       │   │   └── challenges.json    # Assessment data
│       │   ├── revenues/
│       │   ├── expenditures/
│       │   └── ...
│       └── shared/
│           └── components/            # Shared MDX components
├── components/
│   └── learning/
│       ├── LearningPlayer.tsx         # Main player component
│       ├── ModuleRenderer.tsx         # MDX renderer
│       ├── PathVisualizer.tsx         # Progress visualization
│       ├── CertificateCard.tsx        # Certificate display
│       └── interactive/               # Embedded components
│           ├── Quiz.tsx
│           ├── BudgetSimulator.tsx
│           ├── CardFlip.tsx
│           └── ...
└── routes/
    └── learning/
        ├── index.tsx                  # Learning hub
        ├── $pathId/
        │   ├── index.tsx              # Path overview
        │   └── $moduleId.tsx          # Module player
        └── certificates/
            └── $certificateId.tsx     # Public certificate page
```

### 5.4 Module Loading Strategy

Modules are lazy-loaded to minimize initial bundle size:

```typescript
// Module loading with React.lazy
const moduleLoaders: Record<string, () => Promise<{ default: MDXContent }>> = {
  'foundations': () => import('@/content/learning/modules/foundations/index.mdx'),
  'revenues': () => import('@/content/learning/modules/revenues/index.mdx'),
  // ...
}

// In ModuleRenderer
const ModuleRenderer = ({ moduleId }: { moduleId: string }) => {
  const Module = React.lazy(moduleLoaders[moduleId])

  return (
    <Suspense fallback={<ModuleSkeleton />}>
      <MDXProvider components={mdxComponents}>
        <Module />
      </MDXProvider>
    </Suspense>
  )
}
```

---

## 6. Component Specifications

### 6.1 Interactive Components

All interactive components are built custom using shadcn/Radix patterns.

#### Quiz Component

```typescript
type QuizProps = {
  readonly questions: QuizQuestion[]
  readonly onComplete: (score: number, responses: QuizResponse[]) => void
  readonly showFeedback?: boolean        // Default: true
  readonly allowRetry?: boolean          // Default: true
  readonly passingScore?: number         // Default: 70
}

type QuizQuestion = {
  readonly id: string
  readonly type: 'single' | 'multiple' | 'fill_blank'
  readonly question: string
  readonly options?: QuizOption[]
  readonly correctAnswer: string | string[]
  readonly explanation: string
  readonly points?: number               // Default: 1
}
```

#### Budget Simulator

```typescript
type BudgetSimulatorProps = {
  readonly initialAllocations: BudgetCategory[]
  readonly totalBudget: number
  readonly constraints?: SimulatorConstraint[]
  readonly onComplete?: (allocations: BudgetCategory[]) => void
}

type BudgetCategory = {
  readonly id: string
  readonly label: string
  readonly allocation: number            // Percentage
  readonly min?: number                  // Minimum allowed
  readonly max?: number                  // Maximum allowed
  readonly description: string
}
```

#### Card Flip

```typescript
type CardFlipProps = {
  readonly cards: FlipCard[]
  readonly layout?: 'grid' | 'row'
  readonly onAllViewed?: () => void      // Tracks completion
}

type FlipCard = {
  readonly front: React.ReactNode
  readonly back: React.ReactNode
  readonly icon?: string
}
```

#### Platform CTA

```typescript
type PlatformCTAProps = {
  readonly title: string
  readonly description: string
  readonly route: string
  readonly queryParams?: Record<string, string>
  readonly variant?: 'default' | 'prominent' | 'subtle'
}

// Example usage in MDX
<PlatformCTA
  title="Explore the Budget"
  description="See how Romania spends public money"
  route="/budget-explorer"
  queryParams={{ accountCategory: 'ch' }}
/>
```

### 6.2 Navigation Components

#### Learning Path Visualizer

```typescript
type PathVisualizerProps = {
  readonly path: LearningPath
  readonly progress: UserProgress
  readonly currentModuleId?: string
  readonly onModuleClick: (moduleId: string) => void
}

// Visual representation
// ┌─────┐    ┌─────┐    ┌─────┐    ┌─────┐
// │  ✓  │───▶│  ✓  │───▶│ 🔵 │───▶│  ○  │
// │ M1  │    │ M2  │    │ M3  │    │ M4  │
// └─────┘    └─────┘    └─────┘    └─────┘
//  Done       Done      Current   Locked
```

#### Module Navigation

```typescript
type ModuleNavigationProps = {
  readonly previousModule?: ModuleReference
  readonly nextModule?: ModuleReference
  readonly currentProgress: ModuleProgress
  readonly onNavigate: (moduleId: string) => void
  readonly onMarkComplete: () => void
}
```

### 6.3 Certificate Components

#### Certificate Display

```typescript
type CertificateDisplayProps = {
  readonly certificate: Certificate
  readonly variant?: 'full' | 'card' | 'preview'
  readonly showShareButtons?: boolean
  readonly showDownload?: boolean
}
```

#### Certificate Generator (Internal)

The certificate image is generated server-side for consistent social media previews:

```typescript
// API endpoint: GET /api/certificates/:id/image
// Returns: PNG image (1200x630 for OG, customizable)

type CertificateImageParams = {
  readonly certificateId: string
  readonly format?: 'og' | 'square' | 'full'  // Default: 'og'
}
```

---

## 7. Progress & State Management

### 7.1 Dual-Store Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST USER FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User Action ──▶ Progress Hook ──▶ localStorage           │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  localStorage: learning_progress                     │  │
│   │  {                                                   │  │
│   │    version: 1,                                       │  │
│   │    paths: {                                          │  │
│   │      citizen: { modules: { m1: { status: 'passed' }}}│  │
│   │    }                                                 │  │
│   │  }                                                   │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 AUTHENTICATED USER FLOW                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   User Action ──▶ Progress Hook ──▶ TanStack Query ──▶ API │
│                         │                                   │
│                         ▼                                   │
│                  Optimistic Update                          │
│                  (localStorage cache)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 Progress Hook

```typescript
type UseProgressReturn = {
  // State
  readonly progress: UserProgress | GuestProgress
  readonly isLoading: boolean
  readonly isGuest: boolean

  // Module actions
  readonly startModule: (moduleId: string) => void
  readonly completeModule: (moduleId: string, score?: number) => void
  readonly submitChallenge: (moduleId: string, challengeId: string, answer: unknown) => void

  // Path actions
  readonly startPath: (pathId: string) => void
  readonly getPathProgress: (pathId: string) => PathProgressSummary
  readonly canClaimCertificate: (pathId: string) => CertificateEligibility
}

type PathProgressSummary = {
  readonly completedModules: number
  readonly totalModules: number
  readonly percentage: number
  readonly currentModule?: string
  readonly estimatedTimeRemaining: number  // Minutes
}

type CertificateEligibility = {
  readonly eligible: boolean
  readonly tier: CertificateTier | null
  readonly missingModules: string[]
  readonly percentage: number
}
```

### 7.3 Merge Strategy (Auth Transition)

When a guest user logs in, progress is merged using a **Union Merge**:

```typescript
function mergeProgress(
  local: GuestProgress,
  remote: UserProgress
): UserProgress {
  // For each module, take the "better" state
  // completed > in_progress > not_started
  // Higher score wins
  // Earlier completion date wins

  const merged = { ...remote }

  for (const [pathId, localPath] of Object.entries(local.paths)) {
    for (const [moduleId, localModule] of Object.entries(localPath.modules)) {
      const remoteModule = merged.moduleProgress.find(m => m.moduleId === moduleId)

      if (!remoteModule ||
          statusPriority(localModule.status) > statusPriority(remoteModule.status) ||
          (localModule.score ?? 0) > (remoteModule.score ?? 0)) {
        // Local wins
        merged.moduleProgress = updateModule(merged.moduleProgress, {
          moduleId,
          status: localModule.status,
          score: Math.max(localModule.score ?? 0, remoteModule?.score ?? 0),
          // ... rest of merge logic
        })
      }
    }
  }

  return merged
}
```

---

## 8. Assessment System

### 8.1 Assessment Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    ASSESSMENT FLOW                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   User reads content ──▶ Encounters Quiz ──▶ Submits Answer │
│                                   │                          │
│                                   ▼                          │
│                          ┌───────────────┐                   │
│                          │   Validate    │                   │
│                          │   Answer      │                   │
│                          └───────────────┘                   │
│                                   │                          │
│                    ┌──────────────┴──────────────┐           │
│                    ▼                             ▼           │
│             ┌───────────┐                 ┌───────────┐      │
│             │  Correct  │                 │ Incorrect │      │
│             └───────────┘                 └───────────┘      │
│                    │                             │           │
│                    ▼                             ▼           │
│             Show success                  Show explanation   │
│             + explanation                 + "Try again"      │
│                    │                             │           │
│                    ▼                             │           │
│             Update score ◀───────────────────────┘           │
│                    │                                         │
│                    ▼                                         │
│         All challenges done?                                 │
│              │         │                                     │
│            Yes        No                                     │
│              │         │                                     │
│              ▼         ▼                                     │
│         Calculate    Next                                    │
│         final score  challenge                               │
│              │                                               │
│              ▼                                               │
│         Score >= 70%?                                        │
│              │         │                                     │
│            Yes        No                                     │
│              │         │                                     │
│              ▼         ▼                                     │
│         Mark PASSED   Offer retry                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Scoring Rules

```typescript
const SCORING_CONFIG = {
  passingScore: 70,              // Minimum to pass module
  maxAttempts: Infinity,         // Unlimited retries
  scoreCalculation: 'best',      // 'best' | 'latest' | 'average'
  partialCredit: false,          // No partial points for multi-select
} as const

function calculateModuleScore(responses: ChallengeResponse[]): number {
  const totalPoints = challenges.reduce((sum, c) => sum + (c.points ?? 1), 0)
  const earnedPoints = responses
    .filter(r => r.isCorrect)
    .reduce((sum, r) => {
      const challenge = challenges.find(c => c.id === r.challengeId)
      return sum + (challenge?.points ?? 1)
    }, 0)

  return Math.round((earnedPoints / totalPoints) * 100)
}
```

---

## 9. Certification System

### 9.1 Certificate Tiers

| Tier | Threshold | Badge Color | Social Message |
|------|-----------|-------------|----------------|
| **Bronze** | 60% | `#CD7F32` | "I'm learning about Romanian public budgets!" |
| **Silver** | 80% | `#C0C0C0` | "I'm well-versed in Romanian public budgets!" |
| **Gold** | 100% | `#FFD700` | "I've mastered Romanian public budgets!" |

### 9.2 Certificate Generation Flow

```
┌──────────────────────────────────────────────────────────────┐
│                 CERTIFICATE GENERATION FLOW                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   User clicks "Claim Certificate"                            │
│                    │                                         │
│                    ▼                                         │
│         ┌───────────────────┐                                │
│         │ Check Eligibility │                                │
│         │ (70%+ modules     │                                │
│         │  passed)          │                                │
│         └───────────────────┘                                │
│                    │                                         │
│         ┌─────────┴─────────┐                                │
│         ▼                   ▼                                │
│    Not Eligible        Eligible                              │
│         │                   │                                │
│         ▼                   ▼                                │
│    Show missing       Show Honor Code                        │
│    modules            Dialog                                 │
│                            │                                 │
│                            ▼                                 │
│                    ┌───────────────┐                         │
│                    │ Enter Name    │                         │
│                    │ + Accept      │                         │
│                    │ Disclaimer    │                         │
│                    └───────────────┘                         │
│                            │                                 │
│                            ▼                                 │
│                    Generate Certificate                      │
│                    (UUID, store in DB)                       │
│                            │                                 │
│                            ▼                                 │
│                    Show Certificate                          │
│                    + Share Options                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Public Verification Page

Route: `/certificates/:certificateId`

```typescript
// Certificate verification page
// - SSR/SSG for SEO and social sharing
// - Dynamic OG image generation
// - Verification badge showing authenticity

type CertificatePageProps = {
  readonly certificate: Certificate
  readonly path: LearningPath
  readonly issueDate: string
  readonly isValid: boolean
}
```

**OG Meta Tags:**

```html
<meta property="og:title" content="Certificate: Citizen Budget Literacy" />
<meta property="og:description" content="John Doe completed 100% of the Citizen learning path on Transparenta.eu" />
<meta property="og:image" content="https://transparenta.eu/api/certificates/uuid/image" />
<meta property="og:url" content="https://transparenta.eu/certificates/uuid" />
```

---

## 10. Internationalization

### 10.1 Content Translation Strategy

**Static Content (UI):** Use Lingui with existing workflow

```typescript
import { t, Trans } from '@lingui/macro'

// Component text
<Button>{t`Start Learning`}</Button>
<Trans>You've completed {count} modules</Trans>
```

**Dynamic Content (MDX):** Separate MDX files per locale

```
content/
└── learning/
    └── modules/
        └── foundations/
            ├── index.en.mdx    # English content
            └── index.ro.mdx    # Romanian content
```

**Challenge Text:** Stored in JSON with locale keys

```json
{
  "question": {
    "en": "What percentage of GDP flows through public budgets?",
    "ro": "Ce procent din PIB trece prin bugetele publice?"
  }
}
```

### 10.2 Language Switching

```typescript
// Hook for learning content locale
function useLearningLocale() {
  const { i18n } = useLingui()

  const loadModule = async (moduleId: string) => {
    const locale = i18n.locale
    return import(`@/content/learning/modules/${moduleId}/index.${locale}.mdx`)
  }

  return { loadModule, locale: i18n.locale }
}
```

---

## 11. Notifications & Re-engagement

### 11.1 Notification Types

| Type | Trigger | Content | Priority |
|------|---------|---------|----------|
| **Inactivity Reminder** | No activity for 3 days | "Continue where you left off" | P2 |
| **Learning Summary** | Daily (if activity) | "Today you learned X, Y, Z" | P2 |
| **Streak Milestone** | 7, 14, 30 day streak | "You're on fire! 7 day streak" | P2 |
| **Certificate Unlocked** | Threshold reached | "Claim your certificate!" | P1 |
| **New Content** | Module added to path | "New module available" | P3 |

### 11.2 Email Templates

```typescript
type NotificationTemplate = {
  readonly type: NotificationType
  readonly subject: TranslatedString
  readonly preheader: TranslatedString
  readonly body: TranslatedString         // With placeholders
  readonly cta: {
    readonly label: TranslatedString
    readonly url: string
  }
}
```

---

## 12. Performance & SEO

### 12.1 Performance Requirements

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** | < 2.5s | Lazy load modules, skeleton loaders |
| **FID** | < 100ms | Minimal JS in critical path |
| **CLS** | < 0.1 | Reserved space for dynamic content |
| **Bundle Size** | < 100kb initial | Code splitting per module |

### 12.2 Loading Strategy

```typescript
// Route-level code splitting
const LearningHub = React.lazy(() => import('./routes/learning'))
const ModulePlayer = React.lazy(() => import('./routes/learning/$pathId/$moduleId'))

// Module content lazy loading
const moduleContent = React.lazy(() =>
  import(`@/content/learning/modules/${moduleId}/index.mdx`)
)
```

### 12.3 SEO Requirements

| Page | Rendering | Indexable |
|------|-----------|-----------|
| Learning Hub | SSG | Yes |
| Path Overview | SSG | Yes |
| Module Content | CSR | No (requires interaction) |
| Certificate | SSR | Yes (for social sharing) |

---

## 13. Accessibility

### 13.1 Requirements

- **WCAG 2.1 AA** compliance minimum
- All interactive elements keyboard-navigable
- Screen reader support for quizzes and interactive components
- High contrast mode support
- No auto-playing animations (respect `prefers-reduced-motion`)
- Focus management during quiz flow

### 13.2 Component Requirements

```typescript
// Quiz accessibility
<Quiz
  aria-label="Module assessment quiz"
  onKeyDown={handleQuizNavigation}  // Arrow keys, Enter, Space
/>

// Progress indicator
<ProgressBar
  aria-label={`${completed} of ${total} modules completed`}
  aria-valuenow={completed}
  aria-valuemin={0}
  aria-valuemax={total}
/>
```

---

## 14. Analytics & Metrics

### 14.1 Key Metrics (PostHog Events)

| Event | Properties | Purpose |
|-------|------------|---------|
| `learning_path_started` | `pathId`, `source` | Track path engagement |
| `module_started` | `pathId`, `moduleId` | Track module engagement |
| `module_completed` | `pathId`, `moduleId`, `score`, `duration` | Track completion |
| `quiz_submitted` | `moduleId`, `quizId`, `score`, `attempt` | Track quiz performance |
| `certificate_claimed` | `pathId`, `tier`, `percentage` | Track certification |
| `certificate_shared` | `pathId`, `platform`, `tier` | Track virality |

### 14.2 Dashboards

- **Engagement**: Active learners, completion rates, drop-off points
- **Content**: Module difficulty (avg score), time spent, retry rates
- **Virality**: Shares, certificate views, referral tracking
- **Retention**: Return rate, streak distribution, re-engagement success

---

## 15. Security Considerations

### 15.1 Data Protection

- Guest progress stored only in localStorage (client-side)
- Authenticated progress encrypted in transit (HTTPS)
- Certificate names stored but not publicly indexed
- No PII in analytics events

### 15.2 Certificate Integrity

- UUIDs are cryptographically random
- Certificates linked to authenticated users only
- No way to forge or modify issued certificates
- Rate limiting on certificate generation

### 15.3 Content Protection

- MDX content served from authenticated CDN
- No sensitive data in module content
- Interactive components validate inputs

---

## 16. Implementation Phases

### Phase 1: Foundation (MVP)

**Scope:**
- [ ] Learning hub with path selection
- [ ] Module player with MDX rendering
- [ ] Basic quiz component
- [ ] Guest progress (localStorage)
- [ ] Path progress visualization

**Deliverables:**
- Users can browse and complete modules as guests
- Progress saved locally

### Phase 2: Authentication & Sync

**Scope:**
- [ ] Authenticated progress storage
- [ ] Progress merge on login
- [ ] User profile with learning stats

**Deliverables:**
- Users can log in and sync progress
- Progress persists across devices

### Phase 3: Assessment & Certification

**Scope:**
- [ ] Full quiz system with scoring
- [ ] Certificate generation
- [ ] Public verification pages
- [ ] Social sharing (OG images)

**Deliverables:**
- Users can earn and share certificates

### Phase 4: Engagement & Virality

**Scope:**
- [ ] Email notifications
- [ ] Streak tracking
- [ ] Public profile (opt-in)
- [ ] Advanced analytics

**Deliverables:**
- Complete engagement loop

### Phase 5: Interactive Components

**Scope:**
- [ ] Budget simulator
- [ ] Platform integration CTAs
- [ ] Advanced interactive components
- [ ] Live data integration

**Deliverables:**
- Rich interactive learning experience

---

## 17. Open Questions

| # | Question | Options | Decision |
|---|----------|---------|----------|
| 1 | Should certificates expire? | Never / 1 year / Content version | TBD |
| 2 | Rate limiting for certificate generation? | Per user / Per IP / None | TBD |
| 3 | Module prerequisites enforcement? | Strict / Recommended / None | TBD |
| 4 | Content versioning strategy? | Git-based / Database / Both | TBD |
| 5 | Offline support for modules? | PWA / None | TBD |
| 6 | Team/organization features? | Phase 5+ / Never | TBD |

---

## 18. Related Documents

### Content Specifications
- [Citizen Curriculum Spec](./roles/citizen/citizen-spec.md)
- [Journalist Curriculum Spec](./roles/journalist/journalist-spec.md)
- [Public Official Curriculum Spec](./roles/public-official/public-official-spec.md)

### Technical References
- [Platform CLAUDE.md](/CLAUDE.md) — Technical overview of Transparenta.eu
- [Component Library](/src/components/ui/) — shadcn UI components

### External Resources
- [MDX Documentation](https://mdxjs.com/)
- [Lingui Documentation](https://lingui.dev/)
- [TanStack Router](https://tanstack.com/router)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Dec 2024 | — | Initial requirements draft |
| 2.0 | Dec 2024 | — | Full technical specification |

---

*This specification should be treated as the source of truth for the Learning Platform implementation. All significant changes should be documented in the version history.*
