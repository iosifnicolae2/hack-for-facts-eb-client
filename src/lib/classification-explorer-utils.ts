/**
 * Utility functions for classification explorer
 */

import type {
  ClassificationType,
  ClassificationLevel,
  ClassificationNode,
  FlatClassification,
} from '@/types/classification-explorer'
import classificationsRO from '@/assets/functional-classifications-general-ro.json'
import classificationsEN from '@/assets/functional-classifications-general-en.json'
import economicClassificationsRO from '@/assets/economic-classifications-general-ro.json'
import economicClassificationsEN from '@/assets/economic-classifications-general-en.json'
import { getUserLocale } from '@/lib/utils'

type RawClassificationNode = {
  code?: string
  description: string
  children?: RawClassificationNode[]
}

/**
 * Get classification level based on code structure
 * - chapter: No dots (e.g., "68", "10")
 * - subchapter: One dot (e.g., "68.03", "10.01")
 * - paragraph: Two or more dots (e.g., "68.03.01", "10.01.30")
 */
export function getClassificationLevel(code: string): ClassificationLevel {
  const dotCount = (code.match(/\./g) || []).length
  if (dotCount === 0) return 'chapter'
  if (dotCount === 1) return 'subchapter'
  return 'paragraph'
}

/**
 * Parse a classification code into its components
 * E.g., "68.03.01" → { chapter: "68", subchapter: "68.03", paragraph: "68.03.01" }
 */
export function parseClassificationCode(code: string): {
  readonly chapter: string
  readonly subchapter?: string
  readonly paragraph?: string
} {
  const parts = code.split('.')
  const chapter = parts[0]!
  const subchapter = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : undefined
  const paragraph = parts.length >= 3 ? code : undefined

  return { chapter, subchapter, paragraph }
}

/**
 * Get parent code for a classification
 * Returns null if no parent exists (i.e., at chapter level)
 */
export function getParentCode(code: string): string | null {
  if (!code.includes('.')) return null
  return code.substring(0, code.lastIndexOf('.'))
}

/**
 * Check if code1 is a child of code2
 */
export function isChildOf(code1: string, code2: string): boolean {
  return code1.startsWith(code2 + '.')
}

/**
 * Check if code1 is a descendant of code2 (child, grandchild, etc.)
 */
export function isDescendantOf(code1: string, code2: string): boolean {
  return code1 !== code2 && code1.startsWith(code2)
}

/**
 * Get all ancestor codes for a given code
 * E.g., "68.03.01" → ["68", "68.03"]
 */
export function getAncestorCodes(code: string): readonly string[] {
  const ancestors: string[] = []
  let current = getParentCode(code)
  while (current) {
    ancestors.unshift(current)
    current = getParentCode(current)
  }
  return ancestors
}

/**
 * Get path from root to code (including the code itself)
 * E.g., "68.03.01" → ["68", "68.03", "68.03.01"]
 */
export function getCodePath(code: string): readonly string[] {
  return [...getAncestorCodes(code), code]
}

/**
 * Flatten raw classification tree to list of codes with descriptions
 */
function flattenClassifications(
  nodes: readonly RawClassificationNode[],
  result: FlatClassification[] = []
): FlatClassification[] {
  for (const node of nodes) {
    if (node.code) {
      result.push({
        code: node.code,
        name: node.description,
        description: undefined, // Can be populated later with MDX content
      })
    }
    if (node.children) {
      flattenClassifications(node.children, result)
    }
  }
  return result
}

/**
 * Get all functional classifications for a locale
 */
function getFunctionalClassifications(locale: 'en' | 'ro'): readonly FlatClassification[] {
  const json = locale === 'ro' ? classificationsRO : classificationsEN
  return flattenClassifications(json as unknown as RawClassificationNode[])
}

/**
 * Get all economic classifications for a locale
 */
function getEconomicClassifications(locale: 'en' | 'ro'): readonly FlatClassification[] {
  const json = locale === 'ro' ? economicClassificationsRO : economicClassificationsEN

  // Economic classifications may have a wrapper structure
  if (Array.isArray(json) && json.length > 0) {
    const root = json[0] as RawClassificationNode
    if (root && Array.isArray(root.children)) {
      return flattenClassifications(root.children as RawClassificationNode[])
    }
  }

  return flattenClassifications(json as unknown as RawClassificationNode[])
}

/**
 * Get all classifications for a given type and current locale
 */
export function getAllClassifications(type: ClassificationType): readonly FlatClassification[] {
  const locale = getUserLocale()
  if (type === 'functional') {
    return getFunctionalClassifications(locale)
  }
  return getEconomicClassifications(locale)
}

/**
 * Build a classification tree structure from flat list
 * Automatically creates missing intermediate nodes (e.g., if 01.01.01 exists but 01.01 doesn't)
 */
export function buildClassificationTree(
  classifications: readonly FlatClassification[]
): readonly ClassificationNode[] {
  // Create a map for quick lookup
  const nodeMap = new Map<string, ClassificationNode>()

  // First pass: ensure all nodes and their ancestors exist
  for (const classification of classifications) {
    // Ensure all ancestors exist
    const ancestors = getAncestorCodes(classification.code)
    for (const ancestorCode of ancestors) {
      if (!nodeMap.has(ancestorCode)) {
        // Create synthetic parent node with placeholder name
        nodeMap.set(ancestorCode, {
          code: ancestorCode,
          name: '', // Empty name for synthetic nodes - will display only code
          description: undefined,
          level: getClassificationLevel(ancestorCode),
          parent: getParentCode(ancestorCode) || undefined,
          children: [],
          hasChildren: false,
        })
      }
    }

    // Create or update the actual node
    if (!nodeMap.has(classification.code)) {
      nodeMap.set(classification.code, {
        code: classification.code,
        name: classification.name || '',
        description: classification.description,
        level: getClassificationLevel(classification.code),
        parent: getParentCode(classification.code) || undefined,
        children: [],
        hasChildren: false,
      })
    } else {
      // Update existing node with real data
      const existing = nodeMap.get(classification.code)!
      nodeMap.set(classification.code, {
        ...existing,
        name: classification.name || existing.name,
        description: classification.description || existing.description,
      })
    }
  }

  // Second pass: build parent-child relationships by finding children for each node
  const allNodes = Array.from(nodeMap.values())

  for (const node of allNodes) {
    const children = allNodes.filter(n => n.parent === node.code)

    if (children.length > 0) {
      // Update node with its children
      nodeMap.set(node.code, {
        ...node,
        children: children.sort((a, b) => a.code.localeCompare(b.code)),
        hasChildren: true,
      })
    }
  }

  // Get root nodes (nodes without parents)
  const rootNodes = allNodes
    .filter(node => !node.parent)
    .map(node => nodeMap.get(node.code)!)
    .filter(Boolean)

  // Recursively build tree with updated references from map
  const buildTreeNode = (node: ClassificationNode): ClassificationNode => {
    const updatedNode = nodeMap.get(node.code)!

    if (!updatedNode.hasChildren) {
      return updatedNode
    }

    return {
      ...updatedNode,
      children: updatedNode.children.map(buildTreeNode),
    }
  }

  return rootNodes
    .sort((a, b) => a.code.localeCompare(b.code))
    .map(buildTreeNode)
}

/**
 * Find a classification node by code in a tree
 */
export function findNodeByCode(
  tree: readonly ClassificationNode[],
  code: string
): ClassificationNode | null {
  for (const node of tree) {
    if (node.code === code) return node
    if (node.children.length > 0) {
      const found = findNodeByCode(node.children, code)
      if (found) return found
    }
  }
  return null
}

/**
 * Get all nodes in a tree as a flat list
 */
export function flattenTree(tree: readonly ClassificationNode[]): readonly ClassificationNode[] {
  const result: ClassificationNode[] = []
  const traverse = (nodes: readonly ClassificationNode[]) => {
    for (const node of nodes) {
      result.push(node)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    }
  }
  traverse(tree)
  return result
}

/**
 * Filter classifications by search term (code or name)
 */
export function filterClassifications(
  classifications: readonly FlatClassification[],
  searchTerm: string
): readonly FlatClassification[] {
  if (!searchTerm.trim()) return classifications

  const lowerSearch = searchTerm.toLowerCase().trim()

  return classifications.filter(
    (c) =>
      c.code.toLowerCase().includes(lowerSearch) ||
      c.name.toLowerCase().includes(lowerSearch)
  )
}

/**
 * Get all codes that match a search term, including their ancestors
 * This is useful for expanding the tree to show search results
 */
export function getSearchMatchesWithAncestors(
  classifications: readonly FlatClassification[],
  searchTerm: string
): Set<string> {
  const matches = filterClassifications(classifications, searchTerm)
  const codesSet = new Set<string>()

  for (const match of matches) {
    // Add the match itself
    codesSet.add(match.code)
    // Add all ancestors
    const ancestors = getAncestorCodes(match.code)
    for (const ancestor of ancestors) {
      codesSet.add(ancestor)
    }
  }

  return codesSet
}

/**
 * Check if a code or its descendants match a search term
 */
export function codeMatchesSearch(
  code: string,
  allClassifications: readonly FlatClassification[],
  searchTerm: string
): boolean {
  if (!searchTerm.trim()) return true

  const lowerSearch = searchTerm.toLowerCase().trim()

  // Check if code itself matches
  const node = allClassifications.find((c) => c.code === code)
  if (node) {
    if (
      node.code.toLowerCase().includes(lowerSearch) ||
      node.name.toLowerCase().includes(lowerSearch)
    ) {
      return true
    }
  }

  // Check if any descendant matches
  return allClassifications.some(
    (c) =>
      isDescendantOf(c.code, code) &&
      (c.code.toLowerCase().includes(lowerSearch) ||
        c.name.toLowerCase().includes(lowerSearch))
  )
}
