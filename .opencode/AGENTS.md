# Transparenta.eu Client - Project Context

This document provides context for all OpenCode agents working on this React frontend codebase.

## Project Overview

Transparenta.eu is a Romanian public budget analytics platform targeting public sector and independent journalists. This is the React frontend client that provides:

- Interactive budget data exploration with advanced filters
- Data visualizations (treemaps, charts, maps)
- AI-powered natural language query generation
- Multi-language support (Romanian, English)

## Tech Stack

| Category           | Technology                                |
| ------------------ | ----------------------------------------- |
| Framework          | React 19 + TypeScript (strict)            |
| Styling            | Tailwind CSS v4 + shadcn UI (Radix)       |
| Routing            | TanStack Router (file-based)              |
| Server State       | TanStack Query (React Query)              |
| Data Viz           | Recharts, D3-Sankey, Leaflet        |
| i18n               | Lingui (PO format)                        |
| Auth               | Clerk                                     |
| Error Tracking     | Sentry                                    |
| Analytics          | PostHog (with consent)                    |
| Testing            | Vitest, Playwright, Testing Library       |
| Build              | Vite                                      |

## Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn UI components (Radix primitives)
│   ├── filters/        # Filter components (entity, county, period)
│   ├── budget-explorer/# Budget visualization (treemaps, breakdowns)
│   ├── charts/         # Chart components and renderers
│   ├── maps/           # Leaflet map components
│   └── tables/         # Data table components
├── routes/             # TanStack Router file-based routes
├── features/           # Feature-specific modules
├── hooks/              # Global custom hooks
├── lib/                # Utility libraries
│   ├── api/           # API clients (GraphQL, charts, entities)
│   ├── hooks/         # Reusable hooks
│   └── errors/        # Error handling utilities
├── contexts/           # React contexts (Error, Theme)
├── schemas/            # Zod validation schemas
├── types/              # TypeScript type definitions
├── locales/            # i18n catalogs (en/, ro/)
└── config/             # Configuration files
```

## Key Patterns

### Data Fetching

```typescript
// Use TanStack Query with GraphQL client
import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/api/graphql'

export function useEntityData(cui: string) {
  return useQuery({
    queryKey: ['entity', cui],
    queryFn: () => graphqlRequest<EntityResponse>(QUERY, { cui }),
  })
}
```

### Component Pattern

```typescript
// Named exports, functional components, typed props
type Props = {
  readonly title: string
  readonly onClick: () => void
}

export function MyComponent({ title, onClick }: Props) {
  return <Button onClick={onClick}>{title}</Button>
}
```

### i18n

```typescript
import { t, Trans } from '@lingui/macro'

const label = t`Submit`
<Trans>Welcome to the app</Trans>
```

## Development Commands

```bash
yarn dev              # Start dev server
yarn build            # Production build
yarn typecheck        # TypeScript check (run before completing tasks!)
yarn test             # Unit tests (Vitest)
yarn test:e2e         # E2E tests (Playwright)
yarn i18n:extract     # Extract translations
yarn i18n:compile     # Compile translations
```

## Critical Rules

1. **Always run `yarn typecheck`** before completing any task
2. **Use shadcn UI** components before creating custom ones
3. **Use Tailwind** utility classes only (no custom CSS)
4. **Mark all text** for translation with Lingui macros
5. **No `any` types** - use explicit TypeScript types
6. **Named exports** - not default exports
7. **Functional components** - with hooks, never class components
