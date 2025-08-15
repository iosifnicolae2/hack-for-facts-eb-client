import type { VisibilityState, ColumnPinningState, ColumnSizingState } from '@tanstack/react-table'
import { usePersistedState } from '@/lib/hooks/usePersistedState'

export type TablePreferences = {
  density: 'comfortable' | 'compact'
  columnVisibility: VisibilityState
  columnPinning?: ColumnPinningState
  columnSizing?: ColumnSizingState
  columnOrder?: string[]
  currencyFormat?: 'standard' | 'compact' | 'both' | 'euro'
}

const STORAGE_KEY_PREFIX = 'table-preferences:'

export function useTablePreferences(
  key: string,
  initial: Partial<TablePreferences> = {},
) {
  const storageKey = `${STORAGE_KEY_PREFIX}${key}`
  const [prefs, setPrefs] = usePersistedState<TablePreferences>(storageKey, {
    density: initial.density ?? 'comfortable',
    columnVisibility: initial.columnVisibility ?? {},
    columnPinning: initial.columnPinning ?? {},
    columnSizing: initial.columnSizing ?? {},
    columnOrder: initial.columnOrder ?? [],
    currencyFormat: initial.currencyFormat ?? 'both',
  })

  const setDensity = (next: ((prev: 'comfortable' | 'compact') => 'comfortable' | 'compact') | 'comfortable' | 'compact') => {
    setPrefs((prev) => ({ ...prev, density: typeof next === 'function' ? (next as any)(prev.density) : next }))
  }
  const setColumnVisibility = (updater: any) => {
    setPrefs((prev) => ({ ...prev, columnVisibility: typeof updater === 'function' ? updater(prev.columnVisibility) : updater }))
  }
  const setColumnPinning = (updater: any) => {
    setPrefs((prev) => ({ ...prev, columnPinning: typeof updater === 'function' ? updater(prev.columnPinning) : updater }))
  }
  const setColumnSizing = (updater: any) => {
    setPrefs((prev) => ({ ...prev, columnSizing: typeof updater === 'function' ? updater(prev.columnSizing) : updater }))
  }
  const setColumnOrder = (updater: any) => {
    setPrefs((prev) => ({ ...prev, columnOrder: typeof updater === 'function' ? updater(prev.columnOrder) : updater }))
  }
  const setCurrencyFormat = (next: ((prev: 'standard' | 'compact' | 'both' | 'euro') => 'standard' | 'compact' | 'both' | 'euro') | 'standard' | 'compact' | 'both' | 'euro') => {
    setPrefs((prev) => ({ ...prev, currencyFormat: typeof next === 'function' ? (next as any)(prev.currencyFormat ?? 'both') : next }))
  }

  return {
    density: prefs.density,
    setDensity,
    columnVisibility: prefs.columnVisibility,
    setColumnVisibility,
    columnPinning: prefs.columnPinning,
    setColumnPinning,
    columnSizing: prefs.columnSizing,
    setColumnSizing,
    columnOrder: prefs.columnOrder,
    setColumnOrder,
    currencyFormat: prefs.currencyFormat ?? 'both',
    setCurrencyFormat,
  }
}


