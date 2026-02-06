import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@/test/test-utils'

import type { EntityDetailsData } from '@/lib/api/entities'
import { InsStatsView } from './ins-stats-view'

const mockUseInsContexts = vi.fn()
const mockUseInsDatasetCatalog = vi.fn()
const mockUseInsDatasetDimensions = vi.fn()
const mockUseInsDatasetHistory = vi.fn()
const mockUseInsLatestDatasetValues = vi.fn()

vi.mock('@/lib/hooks/use-ins-dashboard', () => ({
  useInsContexts: (params: unknown) => mockUseInsContexts(params),
  useInsDatasetCatalog: (params: unknown) => mockUseInsDatasetCatalog(params),
  useInsDatasetDimensions: (params: unknown) => mockUseInsDatasetDimensions(params),
  useInsDatasetHistory: (params: unknown) => mockUseInsDatasetHistory(params),
  useInsLatestDatasetValues: (params: unknown) => mockUseInsLatestDatasetValues(params),
}))

describe('InsStatsView', () => {
  const entity = {
    is_uat: true,
    entity_type: 'admin_municipality',
    uat: {
      siruta_code: 143450,
      county_code: 'SB',
      county_name: 'Sibiu',
    },
  } as EntityDetailsData

  beforeEach(() => {
    vi.clearAllMocks()

    mockUseInsContexts.mockReturnValue({
      data: {
        nodes: [
          { code: '1', level: 0, name_ro: 'A. STATISTICA SOCIALA', name_ro_markdown: 'A. STATISTICA SOCIALA', path: '0.1' },
        ],
      },
      isLoading: false,
      error: null,
    })

    mockUseInsDatasetCatalog.mockReturnValue({
      data: {
        nodes: [
          {
            id: '1',
            code: 'POP107D',
            name_ro: 'Populatia dupa domiciliu',
            name_en: null,
            definition_ro: null,
            definition_en: null,
            periodicity: ['ANNUAL'],
            has_uat_data: true,
            has_county_data: true,
            has_siruta: true,
            context_code: '1130',
            context_name_ro: '1. POPULATIA REZIDENTA',
            context_name_en: null,
            context_path: '0.1.13.1130',
          },
        ],
      },
      isLoading: false,
      error: null,
    })

    mockUseInsLatestDatasetValues.mockImplementation((params: { datasetCodes: string[] }) => {
      if (params.datasetCodes.length === 4 && params.datasetCodes.includes('POP107D')) {
        return {
          data: [
            {
              latestPeriod: '2024',
              matchStrategy: 'TOTAL_FALLBACK',
              hasData: true,
              dataset: {
                id: '1',
                code: 'POP107D',
                name_ro: 'Populatia dupa domiciliu',
                name_en: null,
                definition_ro: null,
                definition_en: null,
                periodicity: ['ANNUAL'],
                has_uat_data: true,
                has_county_data: true,
                has_siruta: true,
                context_code: '1130',
                context_name_ro: '1. POPULATIA REZIDENTA',
                context_name_en: null,
                context_path: '0.1.13.1130',
              },
              observation: {
                dataset_code: 'POP107D',
                value: '134308',
                value_status: null,
                time_period: {
                  iso_period: '2024',
                  year: 2024,
                  quarter: null,
                  month: null,
                  periodicity: 'ANNUAL',
                },
                territory: null,
                unit: { code: 'PERS', symbol: null, name_ro: null },
                classifications: [],
              },
            },
          ],
          isLoading: false,
          error: null,
        }
      }

      return {
        data: [],
        isLoading: false,
        error: null,
      }
    })

    mockUseInsDatasetDimensions.mockReturnValue({
      data: {
        datasetCode: 'POP107D',
        dimensions: [],
      },
      isLoading: false,
      error: null,
    })

    mockUseInsDatasetHistory.mockReturnValue({
      data: { observations: [], totalCount: 0, partial: false },
      isLoading: false,
      error: null,
    })
  })

  it('auto-selects a default dataset and enables history query', async () => {
    render(<InsStatsView entity={entity} />)

    await waitFor(() => {
      expect(mockUseInsDatasetHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({
          datasetCode: 'POP107D',
          enabled: true,
        })
      )
    })

    expect(screen.queryByText('No dataset selected yet.')).not.toBeInTheDocument()
  })

  it('enables history query after clicking a summary metric card', async () => {
    render(<InsStatsView entity={entity} />)

    fireEvent.click(screen.getByRole('button', { name: /Population/i }))

    await waitFor(() => {
      expect(mockUseInsDatasetHistory).toHaveBeenLastCalledWith(
        expect.objectContaining({
          datasetCode: 'POP107D',
          enabled: true,
        })
      )
    })
  })

  it('toggles explorer between panel and full-width modes', () => {
    render(<InsStatsView entity={entity} />)

    const layout = screen.getByTestId('ins-explorer-layout')
    expect(layout.className).toContain('xl:grid-cols-[420px_minmax(0,1fr)]')

    fireEvent.click(screen.getByRole('button', { name: /Expand explorer to full width/i }))

    expect(layout.className).toContain('grid-cols-1')
    expect(screen.getByRole('button', { name: /Collapse explorer to side panel/i })).toBeInTheDocument()
  })

  it('renders deterministic selector controls for multi-dimensional datasets', async () => {
    mockUseInsDatasetDimensions.mockReturnValue({
      data: {
        datasetCode: 'POP107D',
        dimensions: [
          {
            index: 0,
            type: 'CLASSIFICATION',
            label_ro: 'Sex',
            label_en: null,
            classification_type: { code: 'SEX', name_ro: 'Sex', name_en: null },
          },
          {
            index: 1,
            type: 'CLASSIFICATION',
            label_ro: 'Grupa de varsta',
            label_en: null,
            classification_type: { code: 'AGE', name_ro: 'Grupa de varsta', name_en: null },
          },
        ],
      },
      isLoading: false,
      error: null,
    })

    mockUseInsDatasetHistory.mockReturnValue({
      data: {
        observations: [
          {
            dataset_code: 'POP107D',
            value: '1000',
            value_status: null,
            time_period: { iso_period: '2024', year: 2024, quarter: null, month: null, periodicity: 'ANNUAL' },
            territory: null,
            unit: { code: 'PERS', symbol: 'pers.', name_ro: 'persoane' },
            classifications: [
              { type_code: 'SEX', type_name_ro: 'Sex', code: 'TOTAL', name_ro: 'Total', sort_order: 1 },
              { type_code: 'AGE', type_name_ro: 'Grupa de varsta', code: 'TOTAL', name_ro: 'Total', sort_order: 1 },
            ],
          },
          {
            dataset_code: 'POP107D',
            value: '800',
            value_status: null,
            time_period: { iso_period: '2024', year: 2024, quarter: null, month: null, periodicity: 'ANNUAL' },
            territory: null,
            unit: { code: 'PERS', symbol: 'pers.', name_ro: 'persoane' },
            classifications: [
              { type_code: 'SEX', type_name_ro: 'Sex', code: 'F', name_ro: 'Feminin', sort_order: 2 },
              { type_code: 'AGE', type_name_ro: 'Grupa de varsta', code: 'TOTAL', name_ro: 'Total', sort_order: 1 },
            ],
          },
        ],
        totalCount: 2,
        partial: false,
      },
      isLoading: false,
      error: null,
    })

    render(<InsStatsView entity={entity} />)

    await waitFor(() => {
      expect(screen.getByText('Series selector')).toBeInTheDocument()
      expect(screen.getByText('Sex')).toBeInTheDocument()
    })
  })

  it('keeps chart populated by switching to a compatible tuple when unit selection changes', async () => {
    mockUseInsDatasetDimensions.mockReturnValue({
      data: {
        datasetCode: 'POP107D',
        dimensions: [
          {
            index: 0,
            type: 'CLASSIFICATION',
            label_ro: 'Produs',
            label_en: null,
            classification_type: { code: 'PROD', name_ro: 'Produs', name_en: null },
          },
        ],
      },
      isLoading: false,
      error: null,
    })

    mockUseInsDatasetHistory.mockReturnValue({
      data: {
        observations: [
          {
            dataset_code: 'POP107D',
            value: '120',
            value_status: null,
            time_period: { iso_period: '2024', year: 2024, quarter: null, month: null, periodicity: 'ANNUAL' },
            territory: null,
            unit: { code: 'LEI__KG', symbol: 'lei/kg', name_ro: 'lei pe kilogram' },
            classifications: [{ type_code: 'PROD', type_name_ro: 'Produs', code: 'A', name_ro: 'Produs A', sort_order: 1 }],
          },
          {
            dataset_code: 'POP107D',
            value: '118',
            value_status: null,
            time_period: { iso_period: '2023', year: 2023, quarter: null, month: null, periodicity: 'ANNUAL' },
            territory: null,
            unit: { code: 'LEI__KG', symbol: 'lei/kg', name_ro: 'lei pe kilogram' },
            classifications: [{ type_code: 'PROD', type_name_ro: 'Produs', code: 'A', name_ro: 'Produs A', sort_order: 1 }],
          },
          {
            dataset_code: 'POP107D',
            value: '52',
            value_status: null,
            time_period: { iso_period: '2024', year: 2024, quarter: null, month: null, periodicity: 'ANNUAL' },
            territory: null,
            unit: { code: 'LEI__L', symbol: 'lei/l', name_ro: 'lei pe litru' },
            classifications: [{ type_code: 'PROD', type_name_ro: 'Produs', code: 'B', name_ro: 'Produs B', sort_order: 2 }],
          },
          {
            dataset_code: 'POP107D',
            value: '50',
            value_status: null,
            time_period: { iso_period: '2023', year: 2023, quarter: null, month: null, periodicity: 'ANNUAL' },
            territory: null,
            unit: { code: 'LEI__L', symbol: 'lei/l', name_ro: 'lei pe litru' },
            classifications: [{ type_code: 'PROD', type_name_ro: 'Produs', code: 'B', name_ro: 'Produs B', sort_order: 2 }],
          },
        ],
        totalCount: 4,
        partial: false,
      },
      isLoading: false,
      error: null,
    })

    render(<InsStatsView entity={entity} />)

    await waitFor(() => {
      expect(screen.getByText('Series selector')).toBeInTheDocument()
      expect(screen.getByLabelText('Unit')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Unit'), { target: { value: 'LEI__L' } })

    await waitFor(() => {
      expect(screen.queryByText('No observations available for the selected dataset and entity.')).not.toBeInTheDocument()
      expect(screen.getByText(/Produs: Produs B/i)).toBeInTheDocument()
    })
  })
})
