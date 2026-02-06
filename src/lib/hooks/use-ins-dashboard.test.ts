import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api/ins', () => ({
  getInsContexts: vi.fn(),
  getInsCountyDashboard: vi.fn(),
  getInsDatasetDimensions: vi.fn(),
  getInsDatasetHistory: vi.fn(),
  getInsDatasetsCatalog: vi.fn(),
  getInsLatestDatasetValues: vi.fn(),
  getInsUatDashboard: vi.fn(),
}))

import {
  insDatasetDimensionsQueryOptions,
  insDatasetHistoryQueryOptions,
  insLatestDatasetValuesQueryOptions,
} from './use-ins-dashboard'
import { getInsDatasetDimensions, getInsDatasetHistory, getInsLatestDatasetValues } from '@/lib/api/ins'

describe('use-ins-dashboard query options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('disables latest-values query when dataset list is empty', () => {
    const options = insLatestDatasetValuesQueryOptions({
      entity: { sirutaCode: '143450' },
      datasetCodes: [],
    })

    expect(options.enabled).toBe(false)
  })

  it('calls latest-values API query function', async () => {
    vi.mocked(getInsLatestDatasetValues).mockResolvedValue([])

    const options = insLatestDatasetValuesQueryOptions({
      entity: { sirutaCode: '143450' },
      datasetCodes: ['POP107D'],
      preferredClassificationCodes: ['TOTAL'],
    })

    await (options.queryFn as () => Promise<unknown>)()
    expect(getInsLatestDatasetValues).toHaveBeenCalledWith({
      entity: { sirutaCode: '143450' },
      datasetCodes: ['POP107D'],
      preferredClassificationCodes: ['TOTAL'],
    })
  })

  it('disables history query when dataset code is empty', () => {
    const options = insDatasetHistoryQueryOptions({
      datasetCode: '',
      filter: { sirutaCodes: ['143450'] },
    })

    expect(options.enabled).toBe(false)
  })

  it('calls history API query function when enabled', async () => {
    vi.mocked(getInsDatasetHistory).mockResolvedValue({
      observations: [],
      totalCount: 0,
      partial: false,
    })

    const options = insDatasetHistoryQueryOptions({
      datasetCode: 'POP107D',
      filter: { sirutaCodes: ['143450'] },
      enabled: true,
    })

    await (options.queryFn as () => Promise<unknown>)()
    expect(getInsDatasetHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        datasetCode: 'POP107D',
        filter: { sirutaCodes: ['143450'] },
      })
    )
  })

  it('disables dimensions query when dataset code is empty', () => {
    const options = insDatasetDimensionsQueryOptions({
      datasetCode: '',
    })

    expect(options.enabled).toBe(false)
  })

  it('calls dimensions API query function when enabled', async () => {
    vi.mocked(getInsDatasetDimensions).mockResolvedValue({
      datasetCode: 'SAN104B',
      dimensions: [],
    })

    const options = insDatasetDimensionsQueryOptions({
      datasetCode: 'san104b',
      enabled: true,
    })

    await (options.queryFn as () => Promise<unknown>)()
    expect(getInsDatasetDimensions).toHaveBeenCalledWith('SAN104B')
  })
})
