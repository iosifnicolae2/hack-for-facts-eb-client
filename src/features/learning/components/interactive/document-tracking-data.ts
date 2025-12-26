/**
 * Document Tracking Data Types
 *
 * Types for DocumentLibrary and QuickLinks components.
 */

export type DocumentPhase = 'approval' | 'execution' | 'audit'

export type BudgetDocument = {
  readonly id: string
  readonly phase: DocumentPhase
  readonly name: string
  readonly description: string
  readonly links: readonly {
    readonly label: string
    readonly url: string
  }[]
}

export type QuickLinkItem = {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly url: string
  readonly icon: 'ministry' | 'parliament' | 'audit' | 'data' | 'transparency'
}
