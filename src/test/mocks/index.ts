/**
 * Test Mocks Index
 *
 * This file exports all available test mocks for easy importing.
 *
 * @example Import specific mocks
 * ```typescript
 * import { mockNavigate, mockGraphqlRequest } from '@/test/mocks'
 * ```
 *
 * @example Import Lingui mocks (auto-applies mocks)
 * ```typescript
 * import '@/test/mocks/lingui'
 * ```
 */

// Router mocks
export {
  mockNavigate,
  getMockSearchParams,
  getMockRouteParams,
  setMockSearchParams,
  setMockRouteParams,
  resetRouterMocks,
  setupRouterMocks,
  routerMockConfig,
} from './router'

// API mocks
export {
  mockGraphqlRequest,
  mockFetch,
  resetApiMocks,
  createMockPaginatedResponse,
  createMockErrorResponse,
  mockDataFactories,
} from './api'

// Note: Lingui mocks are applied via side-effect import
// Use: import '@/test/mocks/lingui'
