import { useCallback, useMemo, useState } from 'react'
import { buildTreemapDataV2, type AggregatedNode } from './budget-transform'
import { getClassificationName } from '@/lib/classifications'
import { getEconomicChapterName, getEconomicClassificationName, getEconomicSubchapterName } from '@/lib/economic-classifications'

export type Breadcrumb = { code: string; label: string }

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
  const cleaned = normalizeCode(code)
  const depth = cleaned.split('.').length
  if (depth >= 3) {
    const match = nodes.find((n) => normalizeCode(primary === 'fn' ? n.fn_c : n.ec_c) === cleaned)
    const apiName = primary === 'fn' ? match?.fn_n : match?.ec_n
    if (apiName && apiName.trim()) return apiName
  }
  return buildPathLabel(primary, code)
}

export function useTreemapDrilldown({
  nodes,
  initialPrimary = 'fn',
  rootDepth = 2,
}: {
  nodes: AggregatedNode[]
  initialPrimary?: 'fn' | 'ec'
  rootDepth?: 2 | 4 | 6
}) {
  const [primary, setPrimary] = useState<'fn' | 'ec'>(initialPrimary)
  const [path, setPath] = useState<string[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([])

  const treemapData = useMemo(() => {
    return buildTreemapDataV2({ data: nodes ?? [], primary, path, rootDepth })
  }, [nodes, primary, path, rootDepth])

  const onNodeClick = useCallback(
    (code: string | null) => {
      const cleaned = normalizeCode(code)
      if (!cleaned) return

      // Check if advancing will produce data
      const nextPath = [...path, cleaned]
      const nextData = buildTreemapDataV2({ data: nodes ?? [], primary, path: nextPath, rootDepth })
      
      // If no data at next level, don't advance (this happens with economic codes at depth 4)
      if (nextData.length === 0) {
        return
      }

      setPath((prev) => {
        const last = prev[prev.length - 1]
        if (last === cleaned) return prev
        return [...prev, cleaned]
      })

      setBreadcrumbs((prev) => {
        const last = prev[prev.length - 1]
        if (last && last.code === cleaned) return prev
        const label = resolveBreadcrumbLabel(primary, cleaned, nodes ?? [])
        return [...prev, { code: cleaned, label }]
      })
    },
    [nodes, primary, path, rootDepth],
  )

  const onBreadcrumbClick = useCallback(
    (code: string | null, index?: number) => {
      if (!code) {
        setPath([])
        setBreadcrumbs([])
        return
      }
      const cleaned = normalizeCode(code)
      setBreadcrumbs((prev) => {
        const i = typeof index === 'number' ? index : prev.findIndex((b) => b.code === cleaned)
        if (i < 0) return prev
        return prev.slice(0, i + 1)
      })
      setPath((prev) => {
        const i = typeof index === 'number' ? index : prev.findIndex((p) => p === cleaned)
        if (i < 0) return prev
        return prev.slice(0, i + 1)
      })
    },
    [],
  )

  const handleSetPrimary = useCallback((value: 'fn' | 'ec') => {
    setPrimary(value)
    setPath([])
    setBreadcrumbs([])
  }, [])

  return {
    primary,
    setPrimary: handleSetPrimary,
    path,
    breadcrumbs,
    treemapData,
    onNodeClick,
    onBreadcrumbClick,
  }
}


