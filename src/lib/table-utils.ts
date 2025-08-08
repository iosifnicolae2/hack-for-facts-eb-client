import type { Table } from '@tanstack/react-table'

export function getMergedColumnOrder<T>(table: Table<T>, fixedFirstIds: readonly string[] = []): string[] {
  const leafIds = table.getAllLeafColumns().map((c) => c.id)
  const stateOrder = table.getState().columnOrder ?? []

  const merged: string[] = []
  const seen = new Set<string>()
  for (const id of fixedFirstIds) {
    if (!seen.has(id)) {
      merged.push(id)
      seen.add(id)
    }
  }
  for (const id of stateOrder) {
    if (!seen.has(id)) {
      merged.push(id)
      seen.add(id)
    }
  }
  for (const id of leafIds) {
    if (!seen.has(id)) {
      merged.push(id)
      seen.add(id)
    }
  }
  return merged
}

export function moveColumnOrder(current: string[], columnId: string, direction: 'left' | 'right', fixedFirstIds: readonly string[] = []): string[] {
  if (fixedFirstIds.includes(columnId)) return current
  const movable = current.filter((id) => !fixedFirstIds.includes(id))
  const idx = movable.indexOf(columnId)
  if (idx === -1) return current
  const newIdx = Math.max(0, Math.min(movable.length - 1, idx + (direction === 'left' ? -1 : 1)))
  if (newIdx === idx) return current
  const updated = [...movable]
  updated.splice(idx, 1)
  updated.splice(newIdx, 0, columnId)
  return [...fixedFirstIds, ...updated]
}


