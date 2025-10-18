import { useCallback, useMemo, useState, useEffect } from 'react'
import { buildTreemapDataV2, calculateExcludedItems, type AggregatedNode } from './budget-transform'
import { getClassificationName } from '@/lib/classifications'
import { getEconomicChapterName, getEconomicClassificationName, getEconomicSubchapterName } from '@/lib/economic-classifications'

export type Breadcrumb = { code: string; label: string; type: 'fn' | 'ec' }

const normalizeCode = (code: string | null | undefined): string => (code ?? '').replace(/[^0-9.]/g, '')

function buildPathLabel(primary: 'fn' | 'ec', code: string): string {
  const normalized = normalizeCode(code)
  if (!normalized) return ''
  if (primary === 'fn') {
    const fnName = getClassificationName(normalized)
    if (fnName) return fnName
    return `FN ${normalized}`
  }
  const parts = normalized.split('.')
  if (parts.length === 1) {
    const ec = getEconomicChapterName(normalized)
    if (ec) return ec
  } else if (parts.length === 2) {
    const ec = getEconomicSubchapterName(normalized)
    if (ec) return ec
  } else {
    const ec = getEconomicClassificationName(normalized)
    if (ec) return ec
  }
  return `EC ${normalized}`
}

function resolveBreadcrumbLabel(primary: 'fn' | 'ec', code: string, nodes: AggregatedNode[]): string {
  const normalized = normalizeCode(code)
  const depth = normalized.split('.').length
  // For 6-digit codes (depth >= 3), prefer API-provided names over classification lookups
  if (depth >= 3) {
    const match = nodes.find((n) => normalizeCode(primary === 'fn' ? n.fn_c : n.ec_c) === normalized)
    const apiName = primary === 'fn' ? match?.fn_n : match?.ec_n
    if (apiName && apiName.trim()) return apiName
  }
  return buildPathLabel(primary, code)
}

/**
 * Hook for managing treemap drilldown with cross-primary pivoting.
 *
 * Drilldown Flow:
 * 1. Start with a primary dimension (fn or ec)
 * 2. Drill through hierarchy: 2-digit → 4-digit → 6-digit codes
 * 3. At 6-digit, pivot to opposite primary (constrained by the 6-digit code)
 * 4. Drill through opposite primary: 2-digit → 4-digit → 6-digit
 * 5. Stop after reaching 2 six-digit codes (one per primary)
 *
 * State Management:
 * - `primary`: User-selected primary from UI toggle
 * - `drillPrimary`: Currently active primary during drill (may differ due to pivot)
 * - `path`: Array of codes representing current drill depth
 * - `breadcrumbs`: Full navigation trail shown to user
 * - `crossConstraint`: When set, constrains opposite primary to subset of data
 *
 * @param nodes - Budget line items to visualize
 * @param initialPrimary - Starting primary dimension ('fn' or 'ec')
 * @param rootDepth - Depth to use at root level (2, 4, or 6 digits)
 * @param excludeEcCodes - Economic codes to exclude from visualization (e.g., ['51', '80', '81'])
 * @param onPrimaryChange - Optional callback when primary changes (for URL persistence)
 */
export function useTreemapDrilldown({
  nodes,
  initialPrimary = 'fn',
  rootDepth = 2,
  excludeEcCodes = [],
  onPrimaryChange,
}: {
  nodes: AggregatedNode[]
  initialPrimary?: 'fn' | 'ec'
  rootDepth?: 2 | 4 | 6
  excludeEcCodes?: string[]
  onPrimaryChange?: (primary: 'fn' | 'ec') => void
}) {
  // UI-selected primary (from toggle)
  const [primary, setPrimary] = useState<'fn' | 'ec'>(initialPrimary)
  // Internally active primary while drilling (may pivot to opposite)
  const [drillPrimary, setDrillPrimary] = useState<'fn' | 'ec'>(initialPrimary)
  const [path, setPath] = useState<string[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])
  const [crossConstraint, setCrossConstraint] = useState<{ type: 'fn' | 'ec'; code: string } | null>(null)

  useEffect(() => {
    if (primary !== initialPrimary) {
      setPrimary(initialPrimary)
      setDrillPrimary(initialPrimary)
      setPath([])
      setCrossConstraint(null)
      setBreadcrumbs([])
    }
  }, [initialPrimary, primary])

  const treemapData = useMemo(() => {
    return buildTreemapDataV2({
      data: nodes ?? [],
      primary: drillPrimary,
      path,
      constraint: crossConstraint ?? undefined,
      rootDepth,
      excludeEcCodes,
    })
  }, [nodes, drillPrimary, path, crossConstraint, rootDepth, excludeEcCodes])

  // Calculate excluded items for current layer
  const excludedItemsSummary = useMemo(() => {
    if (!excludeEcCodes || excludeEcCodes.length === 0) return undefined
    return calculateExcludedItems(nodes ?? [], excludeEcCodes, {
      path,
      constraint: crossConstraint ?? undefined,
      primary: drillPrimary,
    })
  }, [nodes, excludeEcCodes, path, crossConstraint, drillPrimary])

  const appendBreadcrumb = useCallback(
    (type: 'fn' | 'ec', code: string) => {
      const label = resolveBreadcrumbLabel(type, code, nodes ?? [])
      setBreadcrumbs((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.code === code && last.label === label) return prev
        return [...prev, { code, label, type }]
      })
    },
    [nodes],
  )

  const onNodeClick = useCallback(
    (code: string | null) => {
      // Check if we've already completed both primary flows up to 6-digit
      // This prevents drilling beyond 2 six-digit selections (one per primary)
      const totalSixDigitSteps = breadcrumbs.reduce(
        (acc, item) => acc + (item.code && item.code.split('.').length === 3 ? 1 : 0),
        0
      )
      if (totalSixDigitSteps >= 2) {
        return
      }

      // Reset to root
      if (!code) {
        setPath([])
        setCrossConstraint(null)
        setDrillPrimary(primary)
        setBreadcrumbs([])
        return
      }

      const normalized = normalizeCode(code)
      if (!normalized) return

      // Ignore clicks that would not advance (duplicate of last step)
      const lastPathCode = path[path.length - 1]
      if (lastPathCode && lastPathCode === normalized) return

      const selectedDepth = normalized ? normalized.split('.').length : 0 // 1->2d, 2->4d, 3->6d

      const hasNextInCurrent = (nextPath: string[]) => {
        const next = buildTreemapDataV2({
          data: nodes ?? [],
          primary: drillPrimary,
          path: nextPath,
          constraint: crossConstraint ?? undefined,
          rootDepth,
          excludeEcCodes,
        })
        return next.length > 0
      }

      // If we are already pivoting, keep drilling within current primary
      if (crossConstraint) {
        // In pivot stage: allow drill down within current primary up to 6-digits
        if (selectedDepth < 3) {
          const nextPath = [...path, normalized]
          if (!hasNextInCurrent(nextPath)) return
          appendBreadcrumb(drillPrimary, normalized)
          setPath(nextPath)
          return
        }
        // At 6-digit on second primary: if this is a duplicate of last breadcrumb, ignore.
        const lastCrumb = breadcrumbs[breadcrumbs.length - 1]
        if (lastCrumb && normalizeCode(lastCrumb.code) === normalized && lastCrumb.type === drillPrimary) {
          return
        }
        // Otherwise, do not mutate path and do not append; just ignore the click as it's terminal.
        return
      }

      // Not in pivot stage yet: drill 2->4->6 within the same primary; pivot only at 6
      if (selectedDepth < 3) {
        const nextPath = [...path, normalized]
        if (!hasNextInCurrent(nextPath)) return
        appendBreadcrumb(drillPrimary, normalized)
        setPath(nextPath)
        return
      }

      // Pivot at 6-digit to the opposite primary constrained by this code
      const opposite = drillPrimary === 'fn' ? 'ec' : 'fn'
      const oppositeRoot = buildTreemapDataV2({
        data: nodes ?? [],
        primary: opposite,
        path: [],
        constraint: { type: drillPrimary, code: normalized },
        rootDepth: 2,
        excludeEcCodes,
      })
      if (oppositeRoot.length > 0) {
        // Record the final step in the first primary only when a pivot will occur
        appendBreadcrumb(drillPrimary, normalized)
        setCrossConstraint({ type: drillPrimary, code: normalized })
        setDrillPrimary(opposite)
        setPath([]) // start fresh for the opposite primary levels (2 -> 4 -> 6)
        return
      }
      // If opposite has no data, do not append breadcrumb; remain at current state.
      return
    },
    [nodes, primary, drillPrimary, crossConstraint, path, breadcrumbs, appendBreadcrumb, rootDepth, excludeEcCodes],
  )

  const onBreadcrumbClick = useCallback(
    (code: string | null, index?: number) => {
      // Back to root when clicking "Main Categories"
      if (!code) {
        setPath([])
        setDrillPrimary(primary)
        setCrossConstraint(null)
        setBreadcrumbs([])
        return
      }

      const normalized = normalizeCode(code)
      const clickedIndex = typeof index === 'number' ? index : breadcrumbs.findIndex((c) => c.code === normalized)
      const clickedDepth = normalized.split('.').length

      // PRE-PIVOT NAVIGATION: When we haven't pivoted to opposite primary yet
      if (!crossConstraint) {
        // If clicking a 6-digit item, pivot like a node click at 6-digit, but only if opposite has data
        if (clickedDepth >= 3) {
          const opposite = primary === 'fn' ? 'ec' : 'fn'
          const oppositeRoot = buildTreemapDataV2({
            data: nodes ?? [],
            primary: opposite,
            path: [],
            constraint: { type: primary, code: normalized },
            rootDepth: 2,
            excludeEcCodes,
          })
          if (oppositeRoot.length > 0) {
            setCrossConstraint({ type: primary, code: normalized })
            setDrillPrimary(opposite)
            setPath([])
            if (clickedIndex !== -1) setBreadcrumbs(breadcrumbs.slice(0, clickedIndex + 1))
            return
          }
          // If opposite has no data, fall back to parent level within current primary
          const parent = normalized.split('.').slice(0, 2).join('.')
          const idxInPath = path.indexOf(parent)
          const newPath = idxInPath !== -1 ? path.slice(0, idxInPath + 1) : (parent ? [parent] : [])
          setPath(newPath)
          if (clickedIndex !== -1) setBreadcrumbs(breadcrumbs.slice(0, Math.max(0, clickedIndex)))
          setDrillPrimary(primary)
          return
        }
        // Otherwise, trim current path and breadcrumbs to the clicked level
        const idxInPath = path.indexOf(normalized)
        const newPath = idxInPath !== -1 ? path.slice(0, idxInPath + 1) : [normalized]
        setPath(newPath)
        if (clickedIndex !== -1) setBreadcrumbs(breadcrumbs.slice(0, clickedIndex + 1))
        setDrillPrimary(primary)
        return
      }

      // POST-PIVOT NAVIGATION: When we've pivoted and have cross-constraint active
      // The breadcrumb trail is split: [first primary path] -> [pivot point] -> [second primary path]
      const pivotCode = normalizeCode(crossConstraint.code)
      const pivotIndex = breadcrumbs.findIndex((c) => c.code === pivotCode)

      // CASE 1: Clicked on the first primary's breadcrumbs (before or at pivot point)
      if (pivotIndex === -1 || clickedIndex <= pivotIndex) {
        const firstPrimary = crossConstraint.type
        const opposite = firstPrimary === 'fn' ? 'ec' : 'fn'
        // If clicked exactly the 6-digit pivot crumb, pivot back to opposite root (like node click)
        if (clickedIndex === pivotIndex && clickedDepth >= 3) {
          setPath([])
          setDrillPrimary(opposite)
          // keep the constraint on the pivot code
          setCrossConstraint({ type: firstPrimary, code: normalized })
          setBreadcrumbs(breadcrumbs.slice(0, clickedIndex + 1))
          return
        }
        // Otherwise, move within first primary; avoid ending on 6-digit leaf that has no children
        const newPathCodesRaw = breadcrumbs.slice(0, clickedIndex + 1).map((c) => normalizeCode(c.code))
        const last = newPathCodesRaw[newPathCodesRaw.length - 1]
        const lastDepth = (last ?? '').split('.').length
        const newPathCodes = lastDepth >= 3 ? newPathCodesRaw.slice(0, -1) : newPathCodesRaw
        setPath(newPathCodes)
        setDrillPrimary(firstPrimary)
        setCrossConstraint(null)
        setBreadcrumbs(breadcrumbs.slice(0, clickedIndex + 1 - (lastDepth >= 3 ? 1 : 0)))
        return
      }

      // CASE 2: Clicked on the second primary's breadcrumbs (after pivot point)
      // Move within second primary (post-pivot), keeping the constraint active
      const secondPath = breadcrumbs.slice(pivotIndex + 1, clickedIndex + 1).map((c) => normalizeCode(c.code))
      setPath(secondPath)
      setBreadcrumbs(breadcrumbs.slice(0, clickedIndex + 1))
    },
    [breadcrumbs, crossConstraint, path, primary, nodes, excludeEcCodes],
  )

  const handleSetPrimary = useCallback((value: 'fn' | 'ec') => {
    setPrimary(value)
    setDrillPrimary(value)
    setPath([])
    setCrossConstraint(null)
    setBreadcrumbs([])
    onPrimaryChange?.(value)
  }, [onPrimaryChange])

  const reset = useCallback(() => {
    setPath([])
    setDrillPrimary(primary)
    setCrossConstraint(null)
    setBreadcrumbs([])
  }, [primary])

  return {
    primary, // UI-selected
    activePrimary: drillPrimary, // treemap active
    setPrimary: handleSetPrimary,
    path,
    breadcrumbs,
    treemapData,
    excludedItemsSummary,
    onNodeClick,
    onBreadcrumbClick,
    reset,
  }
}


