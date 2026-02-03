/**
 * TanStack Router Mocks for Testing
 *
 * This file provides standard mocks for TanStack Router.
 * Import the mockNavigate function or use the setup function to configure your tests.
 *
 * @example Using exported mock
 * ```typescript
 * import { mockNavigate, setupRouterMocks } from '@/test/mocks/router'
 *
 * beforeEach(() => {
 *   setupRouterMocks()
 *   mockNavigate.mockClear()
 * })
 *
 * it('navigates on click', async () => {
 *   // ... test code
 *   expect(mockNavigate).toHaveBeenCalledWith({ to: '/path' })
 * })
 * ```
 *
 * @example Inline mock (when you need custom behavior)
 * ```typescript
 * const mockNavigate = vi.fn()
 * vi.mock('@tanstack/react-router', () => ({
 *   useNavigate: () => mockNavigate,
 *   useSearch: () => ({ myParam: 'value' }),
 *   Link: ({ children, to }) => <a href={to}>{children}</a>,
 * }))
 * ```
 */

import React from 'react'
import { vi } from 'vitest'

/**
 * Mock navigate function.
 * Use this to assert navigation calls in your tests.
 */
export const mockNavigate = vi.fn()
const defaultHistoryState = { __TSR_index: 0 }
const defaultLocation = {
  pathname: '/',
  search: '',
  searchStr: '',
  hash: '',
  state: defaultHistoryState,
}

export const mockParseLocation = (location: { href: string; state?: Record<string, unknown> }) => {
  const url = new URL(location.href, 'http://localhost')
  return {
    href: url.pathname + url.search + url.hash,
    publicHref: location.href,
    pathname: url.pathname,
    searchStr: url.search,
    search: Object.fromEntries(url.searchParams.entries()),
    hash: url.hash.replace('#', ''),
    state: location.state ?? defaultHistoryState,
  }
}

/**
 * Internal mutable state for router mocks.
 * Use the getter functions or setters to access/modify these values.
 */
const mockState = {
  searchParams: {} as Record<string, unknown>,
  routeParams: {} as Record<string, unknown>,
}

/**
 * Gets the current mock search params.
 */
export const getMockSearchParams = (): Record<string, unknown> => mockState.searchParams

/**
 * Gets the current mock route params.
 */
export const getMockRouteParams = (): Record<string, unknown> => mockState.routeParams

/**
 * Sets the mock search params for useSearch hook.
 */
export const setMockSearchParams = (params: Record<string, unknown>) => {
  mockState.searchParams = params
}

/**
 * Sets the mock route params for useParams hook.
 */
export const setMockRouteParams = (params: Record<string, unknown>) => {
  mockState.routeParams = params
}

/**
 * Resets all router mocks to their default state.
 */
export const resetRouterMocks = () => {
  mockNavigate.mockClear()
  mockState.searchParams = {}
  mockState.routeParams = {}
}

/**
 * Sets up the router mocks.
 * Call this in your test file to enable router mocking.
 *
 * Note: Due to how vi.mock() hoisting works, you may need to
 * define the mock inline in your test file instead.
 */
export const setupRouterMocks = () => {
  vi.mock('@tanstack/react-router', () => ({
    useNavigate: () => mockNavigate,
    useSearch: () => mockState.searchParams,
    useParams: () => mockState.routeParams,
    useLocation: () => ({
      pathname: defaultLocation.pathname,
      search: defaultLocation.search,
      hash: defaultLocation.hash,
      state: defaultLocation.state,
    }),
    useRouter: () => ({
      navigate: mockNavigate,
      parseLocation: mockParseLocation,
      state: { location: defaultLocation },
    }),
    Link: ({
      children,
      to,
      ...props
    }: {
      children: React.ReactNode
      to: string
      [key: string]: unknown
    }) =>
      React.createElement('a', { href: to, ...props }, children),
  }))
}

/**
 * Default router mock configuration.
 * Use this with vi.mock() in your test file.
 *
 * @example
 * ```typescript
 * vi.mock('@tanstack/react-router', () => routerMockConfig)
 * ```
 */
export const routerMockConfig = {
  useNavigate: () => mockNavigate,
  useSearch: () => mockState.searchParams,
  useParams: () => mockState.routeParams,
  useLocation: () => ({
    pathname: defaultLocation.pathname,
    search: defaultLocation.search,
    hash: defaultLocation.hash,
    state: defaultLocation.state,
  }),
  useRouter: () => ({
    navigate: mockNavigate,
    parseLocation: mockParseLocation,
    state: { location: defaultLocation },
  }),
  Link: ({
    children,
    to,
    ...props
  }: {
    children: React.ReactNode
    to: string
    [key: string]: unknown
  }) => React.createElement('a', { href: to, ...props }, children),
}
