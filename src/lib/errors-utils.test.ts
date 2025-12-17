import { describe, it, expect, vi } from 'vitest'

// Mock Lingui before importing
vi.mock('@lingui/core/macro', () => ({
  defineMessage: vi.fn((descriptor: { id: string; message: string }) => descriptor),
}))

import { classifyError, getTechnicalMessage, messages } from './errors-utils'

describe('errors-utils', () => {
  describe('messages', () => {
    it('has all required message descriptors', () => {
      expect(messages.updateAvailableTitle).toBeDefined()
      expect(messages.updateAvailable).toBeDefined()
      expect(messages.validationIssue).toBeDefined()
      expect(messages.pageRenderErrorTitle).toBeDefined()
      expect(messages.genericError).toBeDefined()
    })
  })

  describe('classifyError', () => {
    describe('null/undefined errors', () => {
      it('returns generic error for null', () => {
        const result = classifyError(null)
        expect(result.title).toBe(messages.pageRenderErrorTitle)
        expect(result.friendlyMessage).toBe(messages.genericError)
      })

      it('returns generic error for undefined', () => {
        const result = classifyError(undefined)
        expect(result.title).toBe(messages.pageRenderErrorTitle)
        expect(result.friendlyMessage).toBe(messages.genericError)
      })
    })

    describe('chunk loading errors (deployment)', () => {
      it('classifies "loading chunk" error as update available', () => {
        const error = new Error('Loading chunk 123 failed')
        const result = classifyError(error)
        expect(result.title).toBe(messages.updateAvailableTitle)
        expect(result.friendlyMessage).toBe(messages.updateAvailable)
      })

      it('classifies "ChunkLoadError" as update available', () => {
        const error = new Error('ChunkLoadError: failed to load chunk')
        const result = classifyError(error)
        expect(result.title).toBe(messages.updateAvailableTitle)
        expect(result.friendlyMessage).toBe(messages.updateAvailable)
      })

      it('classifies dynamic import failure as update available', () => {
        const error = new Error('Failed to fetch dynamically imported module')
        const result = classifyError(error)
        expect(result.title).toBe(messages.updateAvailableTitle)
        expect(result.friendlyMessage).toBe(messages.updateAvailable)
      })

      it('is case-insensitive for chunk errors', () => {
        const error = new Error('LOADING CHUNK 456 FAILED')
        const result = classifyError(error)
        expect(result.title).toBe(messages.updateAvailableTitle)
      })
    })

    describe('validation errors', () => {
      it('classifies ZodError as validation issue', () => {
        const error = new Error('ZodError: invalid input')
        const result = classifyError(error)
        expect(result.title).toBe(messages.pageRenderErrorTitle)
        expect(result.friendlyMessage).toBe(messages.validationIssue)
      })

      it('classifies "validation failed" as validation issue', () => {
        const error = new Error('Data validation failed')
        const result = classifyError(error)
        expect(result.title).toBe(messages.pageRenderErrorTitle)
        expect(result.friendlyMessage).toBe(messages.validationIssue)
      })
    })

    describe('generic errors', () => {
      it('returns generic error for unknown error types', () => {
        const error = new Error('Something unexpected happened')
        const result = classifyError(error)
        expect(result.title).toBe(messages.pageRenderErrorTitle)
        expect(result.friendlyMessage).toBe(messages.genericError)
      })

      it('handles non-Error objects', () => {
        const result = classifyError('string error')
        expect(result.title).toBe(messages.pageRenderErrorTitle)
        expect(result.friendlyMessage).toBe(messages.genericError)
      })

      it('handles objects', () => {
        const result = classifyError({ code: 500 })
        expect(result.title).toBe(messages.pageRenderErrorTitle)
        expect(result.friendlyMessage).toBe(messages.genericError)
      })
    })
  })

  describe('getTechnicalMessage', () => {
    it('returns null for null error', () => {
      expect(getTechnicalMessage(null)).toBeNull()
    })

    it('returns null for undefined error', () => {
      expect(getTechnicalMessage(undefined)).toBeNull()
    })

    it('returns stack trace for Error objects with stack', () => {
      const error = new Error('Test error')
      error.stack = 'Error: Test error\n    at file.js:10:5'
      const result = getTechnicalMessage(error)
      expect(result).toContain('Error: Test error')
      expect(result).toContain('at file.js:10:5')
    })

    it('returns message for Error objects without stack', () => {
      const error = new Error('Test error')
      // Delete the stack property to test fallback to message
      delete (error as { stack?: string }).stack
      const result = getTechnicalMessage(error)
      expect(result).toBe('Test error')
    })

    it('returns JSON string for plain objects', () => {
      const error = { code: 500, message: 'Server error' }
      const result = getTechnicalMessage(error)
      expect(result).toContain('"code": 500')
      expect(result).toContain('"message": "Server error"')
    })

    it('returns string directly for string errors', () => {
      // Strings are returned as-is without JSON.stringify wrapping
      const result = getTechnicalMessage('string error')
      expect(result).toBe('string error')
    })

    it('returns string representation for numbers', () => {
      const result = getTechnicalMessage(404)
      expect(result).toBe('404')
    })

    it('handles circular references gracefully', () => {
      const error: Record<string, unknown> = { name: 'circular' }
      error.self = error // Create circular reference
      const result = getTechnicalMessage(error)
      // Should not throw, might return string representation
      expect(result).toBeTruthy()
    })
  })
})
