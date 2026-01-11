import { createContext, useContext, useEffect, useState } from "react"

export type Theme = "dark" | "light" | "system"
export type ResolvedTheme = "dark" | "light"

export const THEME_COOKIE_NAME = "ui-theme"
const THEME_STORAGE_KEY = "ui-theme"

function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light" || value === "system"
}

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  /** Initial theme resolved during SSR (from cookie) */
  ssrTheme?: ResolvedTheme
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

/**
 * Resolves the actual theme to apply based on user preference and system setting
 */
function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light" // Default for SSR when system preference unknown
  }
  return theme
}

/**
 * Sets a cookie with the theme preference (accessible during SSR)
 */
function setThemeCookie(theme: Theme) {
  if (typeof document === "undefined") return
  // Set cookie with 1 year expiry, accessible from all paths
  const maxAge = 365 * 24 * 60 * 60
  document.cookie = `${THEME_COOKIE_NAME}=${theme};path=/;max-age=${maxAge};SameSite=Lax`
}

function readThemeCookie(): Theme | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]*)`)
  )
  if (!match) return null

  const cookieValue = decodeURIComponent(match[1])
  return isTheme(cookieValue) ? cookieValue : null
}

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null
  try {
    const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isTheme(storedValue) ? storedValue : null
  } catch {
    return null
  }
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  ssrTheme,
}: ThemeProviderProps) {
  // Initialize theme from localStorage (client) or default (SSR)
  const [theme, setThemeState] = useState<Theme>(() => {
    const ssrOrDefaultTheme = ssrTheme ?? defaultTheme

    if (typeof window === "undefined") return ssrOrDefaultTheme

    const storedTheme = readStoredTheme()
    const cookieTheme = readThemeCookie()

    // If SSR cookie exists, it should win over localStorage to avoid hydration flashes.
    if (cookieTheme === "dark" || cookieTheme === "light") return cookieTheme

    // "system" can't be resolved during SSR, so keep SSR-resolved theme for hydration,
    // then switch to "system" preference after mount.
    if (cookieTheme === "system") return ssrOrDefaultTheme

    return storedTheme ?? ssrOrDefaultTheme
  })

  // Use SSR theme on first render to prevent hydration mismatch
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    ssrTheme || resolveTheme(theme)
  )

  // Keep cookie/localStorage in sync and honor "system" cookie after hydration.
  useEffect(() => {
    if (typeof window === "undefined") return

    const cookieTheme = readThemeCookie()
    const storedTheme = readStoredTheme()

    if (cookieTheme) {
      if (storedTheme !== cookieTheme) {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, cookieTheme)
        } catch {
          // Ignore storage errors (e.g. blocked storage).
        }
      }

      if (cookieTheme === "system") {
        setThemeState("system")
      }

      return
    }

    if (storedTheme) {
      setThemeCookie(storedTheme)
    }
  }, [])

  // Apply theme class to document and update resolved theme
  useEffect(() => {
    if (typeof window === "undefined") return

    const newResolved = resolveTheme(theme)
    setResolvedTheme(newResolved)

    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(newResolved)
  }, [theme])

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      const newResolved = mediaQuery.matches ? "dark" : "light"
      setResolvedTheme(newResolved)
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(newResolved)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
      setThemeCookie(newTheme)
    }
    setThemeState(newTheme)
  }

  const value: ThemeProviderState = {
    theme,
    resolvedTheme,
    setTheme,
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
