/**
 * E2E Testing Types
 *
 * GraphQL-aware types for mocking API responses in Playwright tests.
 */

export type Mode = 'mock' | 'live' | 'record'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | '*'

export interface MockRouteOptions {
  /** HTTP method to match (default: 'POST' for GraphQL) */
  method?: HttpMethod
  /** Response status code (default: 200) */
  status?: number
  /** Custom response headers */
  headers?: Record<string, string>
  /** Delay in ms before responding (for loading state tests) */
  delay?: number
}

export interface GraphQLMockOptions extends MockRouteOptions {
  /**
   * Match specific GraphQL variables.
   * If provided, only requests with matching variables will use this fixture.
   * Partial matching: only specified keys need to match.
   */
  variables?: Record<string, unknown>
}

export interface MockApiFixture {
  mode: Mode

  /**
   * Mock a GraphQL operation with a fixture.
   *
   * @param operationName - The GraphQL operation name (e.g., 'GetEntities', 'SearchEntities')
   * @param fixture - Fixture name(s). Use 'shared/name' for shared fixtures.
   *                  Pass array for sequential responses (queue).
   * @param options - Variables to match, status, headers, delay
   *
   * @example
   * // Basic usage
   * await mockApi.mockGraphQL('GetEntities', 'entities')
   *
   * @example
   * // With variable matching
   * await mockApi.mockGraphQL('GetEntity', 'entity-detail', {
   *   variables: { cui: '12345678' }
   * })
   *
   * @example
   * // Sequential responses (queue-based)
   * await mockApi.mockGraphQL('GetCharts', ['charts-empty', 'charts-with-item'])
   */
  mockGraphQL: (
    operationName: string,
    fixture: string | string[],
    options?: GraphQLMockOptions
  ) => Promise<void>

  /**
   * Mock a REST route with a fixture.
   * Use this for non-GraphQL endpoints (e.g., file uploads, webhooks).
   *
   * @param pattern - URL glob pattern for matching routes
   * @param fixture - Fixture name(s)
   * @param options - Method, status, headers, delay
   */
  mockRoute: (
    pattern: string,
    fixture: string | string[],
    options?: MockRouteOptions
  ) => Promise<void>
}

/**
 * GraphQL request body structure
 */
export interface GraphQLRequestBody {
  operationName?: string
  query: string
  variables?: Record<string, unknown>
}

/**
 * Recorded fixture metadata
 */
export interface RecordedFixture {
  operationName: string
  variables?: Record<string, unknown>
  response: unknown
  timestamp: string
}
