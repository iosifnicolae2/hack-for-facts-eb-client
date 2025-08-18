import { PropsWithChildren, createContext, useContext, useMemo } from 'react'
import {
  ClerkProvider,
  SignIn as ClerkSignIn,
  SignUp as ClerkSignUp,
  SignInButton as ClerkSignInButton,
  SignOutButton as ClerkSignOutButton,
  useAuth as useClerkAuth,
  useUser as useClerkUser,
} from '@clerk/clerk-react'
import { env } from '@/config/env'

// Public, provider-agnostic user shape used across the app
export type AuthUser = {
  readonly id: string
  readonly firstName?: string | null
  readonly lastName?: string | null
  readonly email?: string | null
}

type AuthContextValue = {
  readonly isEnabled: boolean
  readonly isLoaded: boolean
  readonly isSignedIn: boolean
  readonly user: AuthUser | null
  readonly signOut: () => Promise<void> | void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function ClerkAuthBridge({ children }: PropsWithChildren) {
  const { isLoaded, isSignedIn, signOut } = useClerkAuth()
  const { user } = useClerkUser()

  const value = useMemo<AuthContextValue>(() => {
    const mappedUser: AuthUser | null = user
      ? {
          id: user.id,
          firstName: user.firstName ?? null,
          lastName: user.lastName ?? null,
          email: user.primaryEmailAddress?.emailAddress ?? null,
        }
      : null
    return {
      isEnabled: true,
      isLoaded,
      isSignedIn: Boolean(isSignedIn),
      user: mappedUser,
      signOut: async () => {
        try {
          await signOut()
        } catch {
          // no-op
        }
      },
    }
  }, [isLoaded, isSignedIn, user, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function NoopAuthProvider({ children }: PropsWithChildren) {
  const value = useMemo<AuthContextValue>(
    () => ({
      isEnabled: false,
      isLoaded: true,
      isSignedIn: false,
      user: null,
      signOut: () => {},
    }),
    [],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function AuthProvider({ publishableKey, children }: PropsWithChildren<{ publishableKey?: string }>) {
  if (publishableKey) {
    return (
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    )
  }
  return <NoopAuthProvider>{children}</NoopAuthProvider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

export function useUser() {
  const ctx = useAuth()
  return ctx.user
}

// UI wrappers to avoid leaking Clerk primitives
export function AuthSignIn(props: { path?: string }) {
  const { isEnabled } = useAuth()
  if (!isEnabled) {
    return <div className="text-sm text-muted-foreground">Authentication is disabled.</div>
  }
  return <ClerkSignIn routing="path" path={props.path ?? '/sign-in'} />
}

export function AuthSignUp(props: { path?: string }) {
  const { isEnabled } = useAuth()
  if (!isEnabled) {
    return <div className="text-sm text-muted-foreground">Authentication is disabled.</div>
  }
  return <ClerkSignUp routing="path" path={props.path ?? '/sign-up'} />
}

export function AuthSignInButton({ children }: PropsWithChildren) {
  const { isEnabled } = useAuth()
  if (!isEnabled) {
    return <span>{children ?? 'Sign in'}</span>
  }
  return <ClerkSignInButton>{children ?? 'Sign in'}</ClerkSignInButton>
}

export function AuthSignOutButton({ children }: PropsWithChildren) {
  const { isEnabled } = useAuth()
  if (!isEnabled) {
    return <span>{children ?? 'Sign out'}</span>
  }
  return <ClerkSignOutButton>{children ?? 'Sign out'}</ClerkSignOutButton>
}

export const authKey = env.VITE_CLERK_PUBLISHABLE_KEY
