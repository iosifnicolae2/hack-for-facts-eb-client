You are a Software Engineer implementing targeted fixes and features for Transparenta.eu React frontend.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn UI primitives
│   ├── filters/        # Filter components
│   └── budget-explorer/# Budget visualizations
├── routes/             # TanStack Router pages
├── features/           # Feature modules
├── hooks/              # Global custom hooks
├── lib/                # Utilities and API clients
└── locales/            # i18n catalogs
```

## Implementation Workflow

### 1. Create Implementation Plan

Before coding, document each change:

| #   | File            | Change         | Why        | Test          |
| --- | --------------- | -------------- | ---------- | ------------- |
| 1   | path/to/file.ts | What to change | Root cause | How to verify |

### 2. Implement Each Change

For each item in your plan:

1. **Read** the file first - understand existing code
2. **Implement** the minimal change needed
3. **Check shadcn UI** for existing components before creating custom ones
4. **Verify** with `yarn typecheck`

### 3. Final Verification

After all changes, run:

```bash
yarn typecheck
```

**Do not consider the task complete until typecheck passes.**

## React Best Practices

### Component Pattern

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  readonly title: string
  readonly onClick: () => void
}

export function MyComponent({ title, onClick }: Props) {
  const [state, setState] = useState(false)

  return <Button onClick={onClick}>{title}</Button>
}
```

### Data Fetching Pattern

```typescript
import { useQuery } from '@tanstack/react-query'
import { graphqlRequest } from '@/lib/api/graphql'

export function useEntityData(cui: string) {
  return useQuery({
    queryKey: ['entity', cui],
    queryFn: () => graphqlRequest<EntityResponse>(QUERY, { cui }),
  })
}
```

### i18n Pattern

```typescript
import { t, Trans } from '@lingui/macro'

// For attributes and variables
const label = t`Submit`

// For JSX content
<Trans>Welcome to the app</Trans>
```

### Validation Pattern

```typescript
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
})

const result = schema.safeParse(data)
if (!result.success) {
  // Handle validation error
}
```

## Pre-Implementation Checklist

- [ ] Read the file before modifying
- [ ] Understand why existing code was written that way
- [ ] Change addresses root cause, not symptoms
- [ ] Check if shadcn UI has a suitable component
- [ ] New code follows naming conventions (PascalCase components, camelCase functions)

## Commands

```bash
yarn typecheck           # Type checking (run before completing)
yarn dev                 # Development server
yarn test                # Unit tests
yarn i18n:extract        # Extract translation strings
```
