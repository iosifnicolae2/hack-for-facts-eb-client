import { getClassificationName, getClassificationParent } from '@/lib/classifications'
import {
  getEconomicChapterName,
  getEconomicClassificationName,
  getEconomicSubchapterName,
  getEconomicParent,
} from '@/lib/economic-classifications'
import type { AggregatedLineItemConnection } from '@/schemas/entity-analytics'

export type AggregatedNode = AggregatedLineItemConnection['nodes'][number]

export type TreemapInput = {
  name: string
  value: number
  code: string
  isLeaf: boolean
  children: TreemapInput[]
}

type BuildTreemapOptions = {
    primary: 'fn' | 'ec'
    depth: 2 | 4 | 6
    drillPrefix?: string
    constraint?: { type: 'fn' | 'ec'; code: string }
}

const clean = (val?: string | null) => val?.replace(/[^0-9.]/g, '') ?? ''

type BuildTreemapV2Options = {
  data: AggregatedNode[]
  primary: 'fn' | 'ec'
  path: string[]
  constraint?: { type: 'fn' | 'ec'; code: string }
  /** When there is no path (root), use this depth for grouping. */
  rootDepth?: 2 | 4 | 6
}

export function buildTreemapDataV2({ data, primary, path, constraint, rootDepth }: BuildTreemapV2Options): TreemapInput[] {
  const currentCode = path.length > 0 ? path[path.length - 1] : null
  let depth = (currentCode
    ? (String(currentCode).split('.').length + 1) * 2
    : (rootDepth ?? 2)) as 2 | 4 | 6
  
  // Economic codes only go 2 levels deep (chapter and subchapter), cap at depth 4
  if (primary === 'ec' && depth > 6) {
    depth = 6
  }
  
  if (depth > 6) return []

  const getGroupCode = (code: string | null | undefined) => {
    if (!code) return ''
    const cleanCode = clean(code)
    if (!cleanCode) return ''
    const parts = cleanCode.split('.')
    if (depth === 2) return parts[0] ?? ''
    if (depth === 4) return parts.slice(0, 2).join('.')
    return parts.slice(0, 3).join('.')
  }

  const getLabel = (code: string, item: AggregatedNode) => {
    if (primary === 'fn') {
      if (depth === 6) {
        // For detailed functional codes, prefer API-provided name
        if (item.fn_n && item.fn_n.trim()) return item.fn_n
      } else {
        const name = getClassificationName(code)
        if (name) return name
      }
    } else {
      if (depth === 6) {
        // For detailed economic codes, prefer API-provided name
        if (item.ec_n && item.ec_n.trim()) return item.ec_n
      } else {
        const parts = code.split('.')
        if (parts.length === 1) {
          const name = getEconomicChapterName(code)
          if (name) return name
        } else if (parts.length === 2) {
          const name = getEconomicSubchapterName(code)
          if (name) return name
        } else {
          const name = getEconomicClassificationName(code)
          if (name) return name
        }
      }
    }
    return code
  }

  const grouped = data.reduce<Record<string, TreemapInput>>((acc, item) => {
    const fnCode = clean(item.fn_c)
    const ecCode = clean(item.ec_c)

    // Apply cross-constraint
    if (constraint) {
      const constraintCode = clean(constraint.code)
      if (constraint.type === 'fn' && !fnCode.startsWith(constraintCode)) return acc
      if (constraint.type === 'ec' && !ecCode.startsWith(constraintCode)) return acc
    }

    const code = primary === 'fn' ? fnCode : ecCode

    // Filter by path
    if (currentCode) {
      if (!code.startsWith(clean(currentCode))) return acc
    }

    const groupCode = getGroupCode(code)
    if (!groupCode || (currentCode && groupCode === clean(currentCode))) {
      return acc
    }

    if (!acc[groupCode]) {
      acc[groupCode] = {
        name: getLabel(groupCode, item),
        value: 0,
        code: groupCode,
        // Consider groups at depth >= 4 as leaves for UI purposes
        isLeaf: depth >= 4,
        children: [],
      }
    }

    acc[groupCode]!.value += item.amount ?? 0
    return acc
  }, {})

  return Object.values(grouped).sort((a, b) => b.value - a.value)
}

export const getParentCode = (primary: 'fn' | 'ec', code: string | null): string | null => {
  if (!code) return null
  const cleaned = clean(code)
  if (primary === 'fn') {
    return getClassificationParent(cleaned)
  }
  return getEconomicParent(cleaned)
}


const byPrefix = (code: string | null | undefined, depth: 2 | 4 | 6) => {
  if (!code) return ''
  const clear = clean(code)
  if (!clear) return ''
  if (depth === 2) return clear.split('.')[0] ?? ''
  const parts = clear.split('.')
  if (depth === 4) return parts.slice(0, 2).join('.')
  return parts.slice(0, 3).join('.')
}

export function buildTreemapData(
  aggregated: AggregatedNode[],
  { primary, depth, drillPrefix, constraint }: BuildTreemapOptions,
): TreemapInput[] {
  const grouped = aggregated.reduce<Record<string, TreemapInput>>((acc, item) => {
    const fnCode = item.fn_c
    const ecCode = item.ec_c

    // Apply cross-constraint if present
    if (constraint?.type === 'fn') {
      if (!clean(fnCode).startsWith(clean(constraint.code))) return acc
    } else if (constraint?.type === 'ec') {
      if (!clean(ecCode).startsWith(clean(constraint.code))) return acc
    }

    const code = primary === 'fn' ? fnCode : ecCode
    const name = primary === 'fn' ? item.fn_n : item.ec_n

    const groupCode = byPrefix(code, depth)
    if (!groupCode) return acc

    if (drillPrefix && !clean(code).startsWith(clean(drillPrefix))) return acc

    if (!acc[groupCode]) {
      // Initial label; will be refined below based on primary/depth
      let label = name ?? groupCode

      if (primary === 'fn' && depth === 2) {
        const chapterName = getClassificationName(groupCode)
        if (chapterName) label = chapterName
      }

      if (primary === 'ec') {
        if (depth === 2) {
          const econChapter = getEconomicChapterName(groupCode)
          if (econChapter) label = econChapter
        } else if (depth === 4) {
          const econSub = getEconomicSubchapterName(groupCode)
          if (econSub) label = econSub
        } else if (depth === 6) {
          const econFull = getEconomicClassificationName(groupCode)
          if (econFull) label = econFull
        }
      }

      acc[groupCode] = {
        name: label,
        value: 0,
        code: groupCode,
        isLeaf: depth >= 4,
        children: [],
      }
    }
    acc[groupCode]!.value += item.amount ?? 0
    return acc
  }, {})

  const result = Object.values(grouped)

  // Already handled labels inline; just sort and return
  return result.sort((a, b) => b.value - a.value)
}

export type GroupedItem = {
    code: string
    name: string
    total: number
    count: number
}

export const groupData = (aggregated: AggregatedNode[], primary: 'fn' | 'ec', depth: 2 | 4 | 6) => {
  const grouped = aggregated.reduce<Record<string, GroupedItem>>((acc, item) => {
    const code = primary === 'fn' ? item.fn_c : item.ec_c
    const name = primary === 'fn' ? item.fn_n : item.ec_n
    const groupCode = byPrefix(code, depth)
    if (!groupCode) return acc

    if (!acc[groupCode]) {
      acc[groupCode] = {
        code: groupCode,
        name: name ?? groupCode,
        total: 0,
        count: 0,
      }
    }
    acc[groupCode].total += item.amount ?? 0
    acc[groupCode].count += item.count ?? 0
    return acc
  }, {})

  const all = Object.values(grouped)
  const baseTotal = all.reduce((s, it) => s + it.total, 0)
  const result = all.sort((a, b) => b.total - a.total).slice(0, 7)

  if (primary === 'fn' && depth === 2) {
    for (const item of result) {
      const chapterName = getClassificationName(item.code)
      if (chapterName) item.name = chapterName
    }
  } else if (primary === 'ec') {
    for (const item of result) {
      if (depth === 2) {
        const econChapter = getEconomicChapterName(item.code)
        if (econChapter) item.name = econChapter
      } else if (depth === 4) {
        const econSub = getEconomicSubchapterName(item.code)
        if (econSub) item.name = econSub
      } else if (depth === 6) {
        const econFull = getEconomicClassificationName(item.code)
        if (econFull) item.name = econFull
      }
    }
  }

  return { items: result, baseTotal }
}


