import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearch, useRouter } from '@tanstack/react-router'
import type { Currency } from '@/schemas/charts'
import {
  parseCurrencyParam,
  parseBooleanParam,
} from '@/lib/globalSettings/params'
import {
  setPreferenceCookie,
  USER_CURRENCY_STORAGE_KEY,
  USER_INFLATION_ADJUSTED_STORAGE_KEY,
} from '@/lib/user-preferences'

type SSRSettings = {
  currency: Currency // Cookie-only value (NOT URL-mixed)
  inflationAdjusted: boolean // Cookie-only value (NOT URL-mixed)
}

type ForcedOverrides = {
  currency?: Currency
  inflationAdjusted?: boolean
}

type SettingSource = 'forced' | 'url' | 'persisted'

/**
 * Unified global settings hook that handles:
 * - URL params (highest priority for sharing)
 * - SSR hydration (matches server render)
 * - Cookie persistence (survives refresh)
 * - Forced overrides (route constraints like total_euro → EUR)
 *
 * Key insight: We maintain React state for persisted values because:
 * 1. SSR loader returns cookie-only values (ssrSettings)
 * 2. This state seeds from SSR during hydration
 * 3. When user changes settings, we update BOTH cookie AND this state
 * 4. This ensures clearing URL falls back to current preference, not stale SSR
 */
export function useGlobalSettings(
  ssrSettings: SSRSettings,
  forcedOverrides?: ForcedOverrides
) {
  const search = useSearch({ strict: false })
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  // Persisted state - seeded from SSR, updated when cookies written
  // This is the "live" persisted preference that survives URL clears
  const [persistedCurrency, setPersistedCurrency] = useState<Currency>(
    ssrSettings.currency
  )
  const [persistedInflation, setPersistedInflation] = useState<boolean>(
    ssrSettings.inflationAdjusted
  )

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Parse URL params
  const urlCurrency = parseCurrencyParam(search?.currency)
  const urlInflation = parseBooleanParam(search?.inflation_adjusted)

  // Resolve currency with full priority chain
  const { currency, currencySource } = useMemo(() => {
    // 1. Forced override (route constraint)
    if (forcedOverrides?.currency !== undefined) {
      return {
        currency: forcedOverrides.currency,
        currencySource: 'forced' as SettingSource,
      }
    }
    // 2. URL param
    if (urlCurrency !== undefined) {
      return { currency: urlCurrency, currencySource: 'url' as SettingSource }
    }
    // 3. Persisted preference (React state, updated when cookie written)
    // During SSR/hydration: uses ssrSettings.currency (initial state value)
    // After user changes: uses updated persistedCurrency
    return {
      currency: persistedCurrency,
      currencySource: 'persisted' as SettingSource,
    }
  }, [forcedOverrides?.currency, urlCurrency, persistedCurrency])

  // Resolve inflationAdjusted with full priority chain
  const { inflationAdjusted, inflationSource } = useMemo(() => {
    if (forcedOverrides?.inflationAdjusted !== undefined) {
      return {
        inflationAdjusted: forcedOverrides.inflationAdjusted,
        inflationSource: 'forced' as SettingSource,
      }
    }
    if (urlInflation !== undefined) {
      return {
        inflationAdjusted: urlInflation,
        inflationSource: 'url' as SettingSource,
      }
    }
    return {
      inflationAdjusted: persistedInflation,
      inflationSource: 'persisted' as SettingSource,
    }
  }, [forcedOverrides?.inflationAdjusted, urlInflation, persistedInflation])

  // Sync URL → cookie + React state (only when NOT forced)
  useEffect(() => {
    if (!isHydrated) return

    // Only sync if value came from URL and is not being forced
    if (currencySource === 'url' && urlCurrency !== undefined) {
      setPreferenceCookie(USER_CURRENCY_STORAGE_KEY, urlCurrency)
      setPersistedCurrency(urlCurrency) // Update React state too
    }
  }, [isHydrated, currencySource, urlCurrency])

  useEffect(() => {
    if (!isHydrated) return

    if (inflationSource === 'url' && urlInflation !== undefined) {
      setPreferenceCookie(
        USER_INFLATION_ADJUSTED_STORAGE_KEY,
        String(urlInflation)
      )
      setPersistedInflation(urlInflation) // Update React state too
    }
  }, [isHydrated, inflationSource, urlInflation])

  // Helper to write to BOTH cookie and React state
  const writeCurrencyPref = useCallback((value: Currency) => {
    setPreferenceCookie(USER_CURRENCY_STORAGE_KEY, value)
    setPersistedCurrency(value)
  }, [])

  const writeInflationPref = useCallback((value: boolean) => {
    setPreferenceCookie(USER_INFLATION_ADJUSTED_STORAGE_KEY, String(value))
    setPersistedInflation(value)
  }, [])

  // Setters: update cookie + React state + URL
  // Use functional search updater (prev) => ({ ...prev, ... }) for atomic updates
  const setCurrency = useCallback(
    (value: Currency) => {
      if (forcedOverrides?.currency !== undefined) {
        console.warn('Cannot change currency: forced by route')
        return
      }
      writeCurrencyPref(value)
      router.navigate({
        to: '.',
        search: (prev) => ({ ...prev, currency: value }),
        replace: true,
        resetScroll: false,
      })
    },
    [router, forcedOverrides?.currency, writeCurrencyPref]
  )

  const setInflationAdjusted = useCallback(
    (value: boolean) => {
      if (forcedOverrides?.inflationAdjusted !== undefined) {
        console.warn('Cannot change inflation_adjusted: forced by route')
        return
      }
      writeInflationPref(value)
      router.navigate({
        to: '.',
        search: (prev) => ({ ...prev, inflation_adjusted: value }),
        replace: true,
        resetScroll: false,
      })
    },
    [router, forcedOverrides?.inflationAdjusted, writeInflationPref]
  )

  // Batch setter for atomic updates
  const setSettings = useCallback(
    (updates: { currency?: Currency; inflationAdjusted?: boolean }) => {
      const searchUpdates: Record<string, unknown> = {}

      if (
        updates.currency !== undefined &&
        forcedOverrides?.currency === undefined
      ) {
        writeCurrencyPref(updates.currency)
        searchUpdates.currency = updates.currency
      }
      if (
        updates.inflationAdjusted !== undefined &&
        forcedOverrides?.inflationAdjusted === undefined
      ) {
        writeInflationPref(updates.inflationAdjusted)
        searchUpdates.inflation_adjusted = updates.inflationAdjusted
      }

      if (Object.keys(searchUpdates).length > 0) {
        router.navigate({
          to: '.',
          search: (prev) => ({ ...prev, ...searchUpdates }),
          replace: true,
          resetScroll: false,
        })
      }
    },
    [router, forcedOverrides, writeCurrencyPref, writeInflationPref]
  )

  return {
    currency,
    inflationAdjusted,
    setCurrency,
    setInflationAdjusted,
    setSettings,
    // Debugging/UI metadata
    source: {
      currency: currencySource,
      inflationAdjusted: inflationSource,
    },
    isForced: {
      currency: forcedOverrides?.currency !== undefined,
      inflationAdjusted: forcedOverrides?.inflationAdjusted !== undefined,
    },
  }
}
