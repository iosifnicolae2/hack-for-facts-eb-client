# Clerk authentication with TanStack Start SSR integration guide

**TL;DR:** The `@clerk/tanstack-react-start` package (currently in **beta**) provides full SSR support through `clerkMiddleware()` and the `auth()` server helper. Auth state is hydrated via TanStack's `beforeLoad` hook using `createServerFn`, and a critical Vite configuration fix is required to prevent SSR context loss.

This integration works with React 19 as of version **0.27.12**, but the beta status means breaking changes may occur. The core pattern involves middleware setup in `src/start.ts`, `ClerkProvider` wrapping in the root route, and server functions for auth state hydration.

---

## Installing and configuring the SDK

Install the current active package (note: `@clerk/tanstack-start` is deprecated):

```bash
npm install @clerk/tanstack-react-start
```

Configure environment variables in your `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Optional: Custom sign-in/sign-up URLs
CLERK_SIGN_IN_URL=/sign-in
CLERK_SIGN_UP_URL=/sign-up
CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

---

## Middleware configuration in the server entry point

Configure `clerkMiddleware()` in your TanStack Start entry file. This is the **critical first step** that enables SSR authentication:

```typescript
// src/start.ts
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [clerkMiddleware()],
  }
})
```

The middleware accepts several configuration options for advanced scenarios:

| Option | Purpose |
|--------|---------|
| `audience` | Validates the `aud` claim in tokens |
| `authorizedParties` | Allowlist of origins for subdomain cookie protection |
| `clockSkewInMs` | Time tolerance for token validation (default: 5000ms) |
| `jwtKey` | JWKS public key for networkless JWT verification |
| `organizationSyncOptions` | URL-based organization activation |

**Critical Vite configuration required:** Add the package to `ssr.noExternal` to prevent SSR context loss:

```typescript
// vite.config.ts
export default defineConfig({
  // ...other config
  ssr: {
    noExternal: ['@clerk/tanstack-react-start'],
  },
})
```

Without this fix, you'll encounter: `Error: No HTTPEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`

---

## Hydrating auth state from server to client

The recommended pattern uses a server function with `beforeLoad` in the root route to hydrate authentication state before any rendering occurs. This eliminates auth flicker entirely:

```typescript
// src/routes/__root.tsx
import { ClerkProvider } from '@clerk/tanstack-react-start'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { 
  createRootRoute, 
  Outlet, 
  Scripts,
  HeadContent 
} from '@tanstack/react-router'

// Server function fetches auth state during SSR
const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId, sessionId, orgId } = await auth()
  return { userId, sessionId, orgId }
})

export const Route = createRootRoute({
  // Runs BEFORE component rendering - prevents flash
  beforeLoad: async () => {
    const authState = await fetchClerkAuth()
    return authState
  },
  component: RootComponent,
})

function RootComponent() {
  return (
    <ClerkProvider>
      <html>
        <head><HeadContent /></head>
        <body>
          <Outlet />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

The `beforeLoad` hook is essential because it runs **before** the loader and component, ensuring auth state is available throughout the route tree. Child routes can access this context via `useRouteContext()` or through their own `beforeLoad` function parameters.

---

## Protecting routes with SSR authentication

### Layout route protection (recommended for multiple protected routes)

Create a pathless layout route that protects all child routes:

```typescript
// src/routes/_authenticated.tsx
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'

const requireAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAuthenticated, userId } = await auth()
  
  if (!isAuthenticated) {
    throw redirect({ 
      to: '/sign-in',
      search: { redirect: location.href }
    })
  }
  
  return { userId }
})

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => await requireAuth(),
  component: () => <Outlet />,
})
```

Any route under `src/routes/_authenticated/` will now require authentication. For example, `src/routes/_authenticated/dashboard.tsx` is automatically protected.

### Individual route protection

For protecting single routes:

```typescript
// src/routes/profile.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'

const getProfileData = createServerFn({ method: 'GET' }).handler(async () => {
  const { isAuthenticated, userId } = await auth()
  
  if (!isAuthenticated) {
    throw redirect({ to: '/sign-in' })
  }
  
  // Fetch full user data from Clerk backend
  const user = await clerkClient().users.getUser(userId)
  return { 
    userId, 
    firstName: user?.firstName,
    email: user?.emailAddresses[0]?.emailAddress 
  }
})

export const Route = createFileRoute('/profile')({
  beforeLoad: async () => await getProfileData(),
  loader: async ({ context }) => {
    return { user: context }
  },
  component: ProfilePage,
})

function ProfilePage() {
  const { user } = Route.useLoaderData()
  return <h1>Welcome, {user.firstName}!</h1>
}
```

---

## Accessing auth state in server functions and loaders

### Using `auth()` in server functions

The `auth()` helper is the primary method for accessing authentication state server-side:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'

const protectedAction = createServerFn({ method: 'POST' })
  .validator((data: { message: string }) => data)
  .handler(async ({ data }) => {
    const { userId, isAuthenticated, sessionId, orgId } = await auth()
    
    if (!isAuthenticated) {
      throw new Error('Unauthorized')
    }
    
    // Perform authenticated action
    return { success: true, userId }
  })
```

**Available properties from `auth()`:**

- `isAuthenticated` - Boolean indicating auth status
- `userId` - The authenticated user's ID
- `sessionId` - Current session ID
- `orgId` - Active organization ID (if applicable)
- `getToken()` - Async function to retrieve session token

### Using `clerkClient()` for backend operations

Access Clerk's Backend API for user management, organization operations, and more:

```typescript
import { clerkClient } from '@clerk/tanstack-react-start/server'

const getUserDetails = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  
  if (!userId) return null
  
  const client = clerkClient()
  const user = await client.users.getUser(userId)
  const organizations = await client.users.getOrganizationMembershipList({ userId })
  
  return { user, organizations }
})
```

### API route protection

```typescript
// src/routes/api/protected-data.ts
import { json, createAPIFileRoute } from '@tanstack/react-start'
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'

export const ServerRoute = createAPIFileRoute('/api/protected-data')({
  GET: async () => {
    const { isAuthenticated, userId } = await auth()
    
    if (!isAuthenticated) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    const user = await clerkClient().users.getUser(userId)
    return json({ user })
  },
})
```

---

## Server-side `auth()` versus client-side `useAuth()`

Understanding when to use each is critical for proper SSR integration:

| Aspect | `auth()` (Server) | `useAuth()` (Client) |
|--------|-------------------|----------------------|
| **Import** | `@clerk/tanstack-react-start/server` | `@clerk/tanstack-react-start` |
| **Context** | Server functions, middleware, API routes | React components |
| **Async** | Yes (`await auth()`) | No (synchronous hook) |
| **Use case** | Route protection, data fetching, API auth | UI rendering, conditional display |
| **SSR safe** | ✅ Primary SSR method | ⚠️ Requires hydration first |

**Client-side hooks pattern:**

```typescript
import { useAuth, useUser } from '@clerk/tanstack-react-start'

function UserProfile() {
  const { isLoaded, isSignedIn, userId, getToken } = useAuth()
  const { user } = useUser()
  
  // Always check isLoaded to avoid hydration mismatches
  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Please sign in</div>
  
  return <div>Welcome, {user?.firstName}!</div>
}
```

**Key principle:** Use `auth()` in `beforeLoad` and server functions for SSR. Use `useAuth()` and `useUser()` in components for reactive UI updates. The `beforeLoad` hydration ensures `useAuth()` has data immediately on the client.

---

## Token refresh and session management in SSR

Clerk handles token refresh automatically through its session management. However, for SSR-specific considerations:

### Accessing tokens for external API calls

```typescript
const fetchExternalData = createServerFn({ method: 'GET' }).handler(async () => {
  const authState = await auth()
  
  if (!authState.isAuthenticated) {
    throw redirect({ to: '/sign-in' })
  }
  
  // Get token for external API
  const token = await authState.getToken()
  
  const response = await fetch('https://api.external-service.com/data', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  
  return response.json()
})
```

### Session configuration options

The `clerkMiddleware()` accepts options for session handling:

```typescript
export const startInstance = createStart(() => ({
  requestMiddleware: [
    clerkMiddleware({
      // Allow 5 seconds of clock skew for token validation
      clockSkewInMs: 5000,
      
      // For satellite/multi-domain setups
      domain: 'example.com',
      isSatellite: false,
      
      // JWT verification options
      jwtKey: process.env.CLERK_JWT_KEY, // Optional: for networkless verification
    }),
  ],
}))
```

### Handling token expiration in long-running operations

For operations that might outlast a token's validity:

```typescript
const longRunningOperation = createServerFn({ method: 'POST' }).handler(async () => {
  const authState = await auth()
  
  // Get fresh token before long operation
  const token = await authState.getToken({ skipCache: true })
  
  // Use token for operation
  // Clerk automatically refreshes tokens client-side
})
```

---

## Known issues and critical workarounds

### SSR context loss (most common issue)

**Symptom:** `Error: No HTTPEvent found in AsyncLocalStorage`

**Solution:** Already mentioned above—add to `ssr.noExternal` in Vite config. This affects **12+ developers** according to GitHub issue tracking.

### Hydration mismatches

**Symptom:** `A tree hydrated but some attributes of the server rendered HTML didn't match`

**Solutions:**

1. Use `ClientOnly` wrapper for purely client-side logic:

```typescript
import { ClientOnly } from '@tanstack/react-router'

function Header() {
  return (
    <header>
      <ClientOnly fallback={<span>Loading...</span>}>
        <UserButton />
      </ClientOnly>
    </header>
  )
}
```

2. Avoid `typeof window !== 'undefined'` checks in SSR components

3. Ensure `beforeLoad` properly hydrates auth state before component render

### Bun runtime compatibility

**Issue:** `clerkMiddleware` may consume request body, causing `ERR_BODY_ALREADY_USED` for POST server functions.

**Status:** Fixed in recent versions. Ensure you're on `@clerk/tanstack-react-start@0.27.12` or later.

### Infinite login loops

**Cause:** Using `redirectToSignIn()` in component context instead of `throw redirect()` in `beforeLoad`.

**Solution:** Always use `beforeLoad` for authentication redirects, never component-level checks that trigger re-renders.

---

## Complete implementation example

Here's a full working example bringing all patterns together:

```typescript
// src/start.ts
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => ({
  requestMiddleware: [clerkMiddleware()],
}))
```

```typescript
// src/routes/__root.tsx
import { ClerkProvider, SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/tanstack-react-start'
import { createServerFn } from '@tanstack/react-start'
import { auth } from '@clerk/tanstack-react-start/server'
import { createRootRoute, Outlet, HeadContent, Scripts } from '@tanstack/react-router'

const fetchClerkAuth = createServerFn({ method: 'GET' }).handler(async () => {
  const { userId } = await auth()
  return { userId }
})

export const Route = createRootRoute({
  beforeLoad: async () => await fetchClerkAuth(),
  component: () => (
    <ClerkProvider>
      <html>
        <head><HeadContent /></head>
        <body>
          <nav>
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </nav>
          <Outlet />
          <Scripts />
        </body>
      </html>
    </ClerkProvider>
  ),
})
```

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/start/vite'

export default defineConfig({
  plugins: [react(), tanstackStart()],
  ssr: {
    noExternal: ['@clerk/tanstack-react-start'],
  },
})
```

---

## Conclusion

Integrating Clerk with TanStack Start SSR requires attention to **three critical areas**: middleware configuration, proper auth state hydration via `beforeLoad`, and the Vite `ssr.noExternal` workaround. The `auth()` helper should drive all server-side authentication while client hooks handle reactive UI updates.

The **beta status** of `@clerk/tanstack-react-start` means production deployments should carefully evaluate stability requirements. The official example at [github.com/clerk/clerk-tanstack-react-start-quickstart](https://github.com/clerk/clerk-tanstack-react-start-quickstart) provides a tested starting point, and the TanStack team maintains an example at [tanstack.com/start/latest/docs/framework/react/examples/start-clerk-basic](https://tanstack.com/start/latest/docs/framework/react/examples/start-clerk-basic).

For React 19 compatibility, ensure you're using version **0.27.12** or later, which includes peer dependency fixes for React 19's version constraints.