/**
 * API Mocks for Testing
 *
 * This file provides mock functions for API calls.
 * Use these to control API responses in your tests.
 *
 * @example
 * ```typescript
 * import { mockGraphqlRequest, setupApiMocks } from '@/test/mocks/api'
 *
 * // In your test file, set up the mock
 * vi.mock('@/lib/api/graphql', () => ({
 *   graphqlRequest: (...args: unknown[]) => mockGraphqlRequest(...args),
 * }))
 *
 * beforeEach(() => {
 *   mockGraphqlRequest.mockResolvedValue({ data: [] })
 * })
 *
 * it('fetches data', async () => {
 *   mockGraphqlRequest.mockResolvedValue({
 *     entities: { nodes: [{ id: '1', name: 'Test' }] }
 *   })
 *   // ... test code
 * })
 * ```
 */

import { vi } from 'vitest'

/**
 * Mock GraphQL request function.
 * Configure this in your tests to return specific data.
 */
export const mockGraphqlRequest = vi.fn()

/**
 * Mock fetch function for REST APIs.
 */
export const mockFetch = vi.fn()

/**
 * Resets all API mocks.
 */
export const resetApiMocks = () => {
  mockGraphqlRequest.mockReset()
  mockFetch.mockReset()
}

/**
 * Creates a mock GraphQL response with pagination info.
 */
export const createMockPaginatedResponse = <T>(
  nodes: T[],
  options: {
    totalCount?: number
    hasNextPage?: boolean
    hasPreviousPage?: boolean
  } = {}
) => ({
  nodes,
  pageInfo: {
    totalCount: options.totalCount ?? nodes.length,
    hasNextPage: options.hasNextPage ?? false,
    hasPreviousPage: options.hasPreviousPage ?? false,
  },
})

/**
 * Creates a mock error response.
 */
export const createMockErrorResponse = (message: string) => {
  return Promise.reject(new Error(message))
}

/**
 * Common mock data factories
 */
export const mockDataFactories = {
  /**
   * Creates a mock entity
   */
  createEntity: (overrides: Record<string, unknown> = {}) => ({
    cui: '12345678',
    name: 'Test Entity',
    type: 'UAT',
    uat: {
      name: 'Test UAT',
      county_code: 'CJ',
    },
    ...overrides,
  }),

  /**
   * Creates a mock financial line item
   */
  createLineItem: (overrides: Record<string, unknown> = {}) => ({
    code: '01',
    name: 'Test Line Item',
    amount: 1000000,
    type: 'expense',
    ...overrides,
  }),

  /**
   * Creates mock treemap data
   */
  createTreemapData: (count = 3) =>
    Array.from({ length: count }, (_, i) => ({
      name: `Category ${i + 1}`,
      value: (count - i) * 1000000,
      code: `${i + 1}`,
      isLeaf: false,
      children: [],
    })),
}
