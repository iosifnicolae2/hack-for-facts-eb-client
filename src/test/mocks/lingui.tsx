/**
 * Lingui i18n Mocks for Testing
 *
 * This file provides standard mocks for Lingui internationalization.
 * Import this file at the top of your test file to mock all Lingui functionality.
 *
 * @example
 * ```typescript
 * import '@/test/mocks/lingui'
 * ```
 *
 * Or use the individual mock functions in your test file:
 * @example
 * ```typescript
 * vi.mock('@lingui/react/macro', () => ({
 *   Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
 * }))
 * ```
 */

import { vi } from 'vitest'

// Mock the Trans component from @lingui/react/macro
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock the t and msg macros from @lingui/core/macro
vi.mock('@lingui/core/macro', () => ({
  /**
   * Mock implementation of the t`` template tag.
   * Returns the template string with interpolated values.
   */
  t: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), ''),

  /**
   * Mock implementation of the msg`` template tag.
   * Returns the template string with interpolated values.
   */
  msg: (strings: TemplateStringsArray, ...values: unknown[]) =>
    strings.reduce((acc, str, i) => acc + str + (values[i] ?? ''), ''),
}))

// Mock the i18n instance from @lingui/core
vi.mock('@lingui/core', () => ({
  i18n: {
    /**
     * Mock implementation of i18n._().
     * Returns the message id or string directly.
     */
    _: (message: string | { id: string }) =>
      typeof message === 'string' ? message : message.id,
    locale: 'en',
    locales: ['en'],
    activate: vi.fn(),
    load: vi.fn(),
  },
}))
