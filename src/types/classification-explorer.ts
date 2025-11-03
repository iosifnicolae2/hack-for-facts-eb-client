/**
 * Types for Classification Explorer
 */

/**
 * Type of classification system
 */
export type ClassificationType = 'functional' | 'economic'

/**
 * Level within the classification hierarchy
 * - chapter: Top level (e.g., "68" or "10")
 * - subchapter: Second level (e.g., "68.03" or "10.01")
 * - paragraph: Third level (e.g., "68.03.01" or "10.01.01")
 */
export type ClassificationLevel = 'chapter' | 'subchapter' | 'paragraph'

/**
 * A single classification node with hierarchy information
 */
export type ClassificationNode = {
  readonly code: string
  readonly name: string
  readonly description?: string
  readonly level: ClassificationLevel
  readonly parent?: string
  readonly children: readonly ClassificationNode[]
  readonly hasChildren: boolean
}

/**
 * Complete hierarchy information for a classification node
 */
export type ClassificationHierarchy = {
  readonly node: ClassificationNode
  readonly parents: readonly ClassificationNode[]
  readonly children: readonly ClassificationNode[]
  readonly siblings: readonly ClassificationNode[]
}

/**
 * Flattened classification entry (from existing data structure)
 */
export type FlatClassification = {
  readonly code: string
  readonly name: string
  readonly description?: string
}

/**
 * Tree expansion state
 */
export type TreeExpansionState = {
  readonly expandedNodes: Set<string>
  readonly toggleNode: (code: string) => void
  readonly expandNode: (code: string) => void
  readonly collapseNode: (code: string) => void
  readonly expandPath: (codes: readonly string[]) => void
  readonly collapseAll: () => void
}

/**
 * Search state and actions
 */
export type ClassificationSearchState = {
  readonly searchTerm: string
  readonly debouncedSearchTerm: string
  readonly setSearchTerm: (term: string) => void
  readonly clearSearch: () => void
  readonly isSearching: boolean
}
