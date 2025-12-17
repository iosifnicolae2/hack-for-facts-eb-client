import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Lingui modules before importing anything that uses them
vi.mock('@lingui/core/macro', () => ({
  msg: (strings: TemplateStringsArray) => strings[0],
  t: (strings: TemplateStringsArray) => strings[0],
}))

vi.mock('@lingui/core', () => ({
  i18n: {
    _: (msg: unknown) => (typeof msg === 'string' ? msg : String(msg)),
  },
}))

// Mock generateRandomColor since it's used in charts schema defaults
vi.mock('@/components/charts/components/chart-renderer/utils', () => ({
  generateRandomColor: vi.fn(() => '#0000ff'),
}))

import { getAlertsStore, type StoredAlert } from './alertsStore'
import type { Alert } from '@/schemas/alerts'

// ============================================================================
// TEST CONSTANTS - Valid UUIDs for testing
// ============================================================================
const TEST_UUID_1 = '550e8400-e29b-41d4-a716-446655440001'
const TEST_UUID_2 = '550e8400-e29b-41d4-a716-446655440002'
const TEST_UUID_3 = '550e8400-e29b-41d4-a716-446655440003'
const TEST_UUID_NEW = '550e8400-e29b-41d4-a716-446655440010'
const TEST_UUID_EXISTING = '550e8400-e29b-41d4-a716-446655440020'
const TEST_UUID_VALID = '550e8400-e29b-41d4-a716-446655440030'
const TEST_UUID_STATIC = '550e8400-e29b-41d4-a716-446655440040'
const TEST_UUID_NON_EXISTENT = '550e8400-e29b-41d4-a716-446655440099'

// ============================================================================
// TEST HELPERS
// ============================================================================

const createMockAlert = (id: string, overrides?: Partial<Alert>): Alert => ({
  id,
  title: `Test Alert ${id.slice(-4)}`,
  description: 'Test description',
  isActive: true,
  seriesType: 'analytics',
  filter: {
    account_category: 'ch',
  },
  conditions: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
})

const createMockStoredAlert = (id: string, overrides?: Partial<StoredAlert>): StoredAlert => ({
  ...createMockAlert(id),
  deleted: false,
  ...overrides,
})

// ============================================================================
// SETUP
// ============================================================================

describe('alertsStore', () => {
  let mockStorage: Record<string, string>

  beforeEach(() => {
    mockStorage = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key]
      }),
      clear: vi.fn(() => {
        mockStorage = {}
      }),
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  // ============================================================================
  // loadSavedAlerts
  // ============================================================================
  describe('loadSavedAlerts', () => {
    it('should return empty array when no alerts are stored', () => {
      const store = getAlertsStore()

      const alerts = store.loadSavedAlerts()

      expect(alerts).toEqual([])
    })

    it('should load alerts from localStorage', () => {
      const alert = createMockStoredAlert(TEST_UUID_1)
      mockStorage['saved-alerts'] = JSON.stringify([alert])

      const store = getAlertsStore()
      const alerts = store.loadSavedAlerts()

      expect(alerts).toHaveLength(1)
      expect(alerts[0].id).toBe(TEST_UUID_1)
    })

    it('should filter out deleted alerts when filterDeleted is true', () => {
      const alerts = [
        createMockStoredAlert(TEST_UUID_1),
        createMockStoredAlert(TEST_UUID_2, { deleted: true }),
      ]
      mockStorage['saved-alerts'] = JSON.stringify(alerts)

      const store = getAlertsStore()
      const result = store.loadSavedAlerts({ filterDeleted: true })

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(TEST_UUID_1)
    })

    it('should include deleted alerts when filterDeleted is false', () => {
      const alerts = [
        createMockStoredAlert(TEST_UUID_1),
        createMockStoredAlert(TEST_UUID_2, { deleted: true }),
      ]
      mockStorage['saved-alerts'] = JSON.stringify(alerts)

      const store = getAlertsStore()
      const result = store.loadSavedAlerts({ filterDeleted: false })

      expect(result).toHaveLength(2)
    })

    it('should include deleted alerts by default', () => {
      const alerts = [
        createMockStoredAlert(TEST_UUID_1),
        createMockStoredAlert(TEST_UUID_2, { deleted: true }),
      ]
      mockStorage['saved-alerts'] = JSON.stringify(alerts)

      const store = getAlertsStore()
      const result = store.loadSavedAlerts()

      expect(result).toHaveLength(2)
    })

    it('should handle invalid JSON in localStorage', () => {
      mockStorage['saved-alerts'] = 'invalid json'

      const store = getAlertsStore()
      const alerts = store.loadSavedAlerts()

      expect(alerts).toEqual([])
    })

    it('should handle non-array value in localStorage', () => {
      mockStorage['saved-alerts'] = JSON.stringify({ not: 'an array' })

      const store = getAlertsStore()
      const alerts = store.loadSavedAlerts()

      expect(alerts).toEqual([])
    })

    it('should filter out invalid alert objects', () => {
      const validAlert = createMockStoredAlert(TEST_UUID_VALID)
      const invalidAlert = { id: 'invalid' } // Missing required fields and invalid UUID
      mockStorage['saved-alerts'] = JSON.stringify([validAlert, invalidAlert])

      const store = getAlertsStore()
      const alerts = store.loadSavedAlerts()

      expect(alerts.some(a => a.id === TEST_UUID_VALID)).toBe(true)
    })
  })

  // ============================================================================
  // upsertAlert
  // ============================================================================
  describe('upsertAlert', () => {
    it('should add a new alert to localStorage', () => {
      const store = getAlertsStore()
      const alert = createMockAlert(TEST_UUID_NEW)

      store.upsertAlert(alert)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved).toHaveLength(1)
      expect(saved[0].id).toBe(TEST_UUID_NEW)
    })

    it('should prepend new alert to existing alerts', () => {
      const existing = createMockStoredAlert(TEST_UUID_EXISTING)
      mockStorage['saved-alerts'] = JSON.stringify([existing])

      const store = getAlertsStore()
      store.upsertAlert(createMockAlert(TEST_UUID_NEW))

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved[0].id).toBe(TEST_UUID_NEW)
      expect(saved[1].id).toBe(TEST_UUID_EXISTING)
    })

    it('should update an existing alert', () => {
      const existing = createMockStoredAlert(TEST_UUID_1, { title: 'Original' })
      mockStorage['saved-alerts'] = JSON.stringify([existing])

      const store = getAlertsStore()
      store.upsertAlert(createMockAlert(TEST_UUID_1, { title: 'Updated' }))

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved).toHaveLength(1)
      expect(saved[0].title).toBe('Updated')
    })

    it('should preserve deleted flag when updating', () => {
      const existing = createMockStoredAlert(TEST_UUID_1, { deleted: true })
      mockStorage['saved-alerts'] = JSON.stringify([existing])

      const store = getAlertsStore()
      store.upsertAlert(createMockAlert(TEST_UUID_1, { title: 'Updated' }))

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved[0].deleted).toBe(true)
    })

    it('should not save invalid alert', () => {
      const store = getAlertsStore()
      const invalidAlert = { id: 'invalid' } as Alert // Missing required fields and invalid UUID

      store.upsertAlert(invalidAlert)

      expect(mockStorage['saved-alerts']).toBeUndefined()
    })
  })

  // ============================================================================
  // deleteAlert
  // ============================================================================
  describe('deleteAlert', () => {
    it('should mark alert as deleted', () => {
      const alert = createMockStoredAlert(TEST_UUID_1)
      mockStorage['saved-alerts'] = JSON.stringify([alert])

      const store = getAlertsStore()
      store.deleteAlert(TEST_UUID_1)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved[0].deleted).toBe(true)
    })

    it('should update the updatedAt timestamp', () => {
      const oldDate = new Date('2020-01-01').toISOString()
      const alert = createMockStoredAlert(TEST_UUID_1, { updatedAt: oldDate })
      mockStorage['saved-alerts'] = JSON.stringify([alert])

      const store = getAlertsStore()
      store.deleteAlert(TEST_UUID_1)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(new Date(saved[0].updatedAt).getTime()).toBeGreaterThan(new Date(oldDate).getTime())
    })

    it('should not affect other alerts', () => {
      const alerts = [
        createMockStoredAlert(TEST_UUID_1),
        createMockStoredAlert(TEST_UUID_2),
      ]
      mockStorage['saved-alerts'] = JSON.stringify(alerts)

      const store = getAlertsStore()
      store.deleteAlert(TEST_UUID_1)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved.find((a: StoredAlert) => a.id === TEST_UUID_2)?.deleted).toBe(false)
    })
  })

  // ============================================================================
  // removeAlert
  // ============================================================================
  describe('removeAlert', () => {
    it('should permanently remove alert from storage', () => {
      const alert = createMockStoredAlert(TEST_UUID_1)
      mockStorage['saved-alerts'] = JSON.stringify([alert])

      const store = getAlertsStore()
      store.removeAlert(TEST_UUID_1)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved).toHaveLength(0)
    })

    it('should not affect other alerts', () => {
      const alerts = [
        createMockStoredAlert(TEST_UUID_1),
        createMockStoredAlert(TEST_UUID_2),
      ]
      mockStorage['saved-alerts'] = JSON.stringify(alerts)

      const store = getAlertsStore()
      store.removeAlert(TEST_UUID_1)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved).toHaveLength(1)
      expect(saved[0].id).toBe(TEST_UUID_2)
    })

    it('should handle non-existent alert', () => {
      const alert = createMockStoredAlert(TEST_UUID_1)
      mockStorage['saved-alerts'] = JSON.stringify([alert])

      const store = getAlertsStore()
      store.removeAlert(TEST_UUID_NON_EXISTENT)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved).toHaveLength(1)
    })
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe('edge cases', () => {
    it('should handle empty localStorage', () => {
      const store = getAlertsStore()

      expect(() => store.loadSavedAlerts()).not.toThrow()
      expect(() => store.deleteAlert(TEST_UUID_NON_EXISTENT)).not.toThrow()
      expect(() => store.removeAlert(TEST_UUID_NON_EXISTENT)).not.toThrow()
    })

    it('should handle concurrent operations', () => {
      const store = getAlertsStore()

      // Add multiple alerts
      store.upsertAlert(createMockAlert(TEST_UUID_1))
      store.upsertAlert(createMockAlert(TEST_UUID_2))
      store.upsertAlert(createMockAlert(TEST_UUID_3))

      // Delete one
      store.deleteAlert(TEST_UUID_2)

      // Update another
      store.upsertAlert(createMockAlert(TEST_UUID_1, { title: 'Updated' }))

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved).toHaveLength(3)
      expect(saved.find((a: StoredAlert) => a.id === TEST_UUID_1)?.title).toBe('Updated')
      expect(saved.find((a: StoredAlert) => a.id === TEST_UUID_2)?.deleted).toBe(true)
    })

    it('should handle alerts with various condition configurations', () => {
      const alertWithConditions = createMockAlert(TEST_UUID_1, {
        conditions: [
          { operator: 'gt', threshold: 1000000, unit: 'RON' },
          { operator: 'lt', threshold: 5000000, unit: 'RON' },
        ],
      })

      const store = getAlertsStore()
      store.upsertAlert(alertWithConditions)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved[0].conditions).toHaveLength(2)
    })

    it('should handle alerts with static series type', () => {
      const staticAlert = createMockAlert(TEST_UUID_STATIC, {
        seriesType: 'static',
        datasetId: 'dataset-123',
      })

      const store = getAlertsStore()
      store.upsertAlert(staticAlert)

      const saved = JSON.parse(mockStorage['saved-alerts'])
      expect(saved[0].seriesType).toBe('static')
      expect(saved[0].datasetId).toBe('dataset-123')
    })
  })
})
