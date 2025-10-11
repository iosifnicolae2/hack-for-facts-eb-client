import { getClassificationName } from '@/lib/classifications'
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
}

const clean = (val?: string | null) => val?.replace(/[^0-9.]/g, '') ?? ''

const byPrefix = (code: string | null | undefined, depth: 2 | 4 | 6) => {
  if (!code) return ''
  const clear = clean(code)
  if (!clear) return ''
  if (depth === 2) return clear.split('.')[0] ?? ''
  const parts = clear.split('.')
  if (depth === 4) return parts.slice(0, 2).join('.')
  return parts.slice(0, 3).join('.')
}

export function buildTreemapData(aggregated: AggregatedNode[], { primary, depth, drillPrefix }: BuildTreemapOptions): TreemapInput[] {
  const grouped = aggregated.reduce<Record<string, TreemapInput>>((acc, item) => {
    const code = primary === 'fn' ? item.fn_c : item.ec_c
    const name = primary === 'fn' ? item.fn_n : item.ec_n

    const groupCode = byPrefix(code, depth)
    if (!groupCode) return acc

    if (drillPrefix && !clean(code).startsWith(clean(drillPrefix))) return acc

    if (!acc[groupCode]) {
      acc[groupCode] = {
        name: name ?? groupCode,
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

  if (primary === 'fn' && depth === 2) {
    for (const item of result) {
      const chapterName = getClassificationName(item.code)
      if (chapterName) item.name = chapterName
    }
  }

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

  const result = Object.values(grouped).sort((a, b) => b.total - a.total).slice(0, 7)

  if (primary === 'fn' && depth === 2) {
    for (const item of result) {
      const chapterName = getClassificationName(item.code)
      if (chapterName) item.name = chapterName
    }
  }

  return result
}


