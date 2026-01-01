/**
 * EmployeesView Component Tests
 *
 * This file tests the EmployeesView component which displays
 * employee statistics and legal limit calculations.
 *
 * Pattern: CSV Data Loading Component Testing
 * - Mock useCsvData hook
 * - Test loading, error, and data states
 * - Test calculations display
 * - Test percentile rankings
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { EmployeesView } from './EmployeesView'
import type { EntityDetailsData } from '@/lib/api/entities'
import type { GqlReportType } from '@/schemas/reporting'

// ============================================================================
// MOCKS
// ============================================================================

// Mock Lingui
vi.mock('@lingui/react/macro', () => ({
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@lingui/core/macro', () => ({
  t: (strings: TemplateStringsArray) => strings[0],
  msg: (strings: TemplateStringsArray) => strings[0],
}))

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to} data-testid="router-link">
      {children}
    </a>
  ),
}))

// Mock child components
vi.mock('../EntityEmployeesDataInfo', () => ({
  EntityEmployeesDataInfo: () => <div data-testid="employees-data-info">Employees Data Info</div>,
}))

vi.mock('./CalculationLegend', () => ({
  CalculationLegend: () => <div data-testid="calculation-legend">Calculation Legend</div>,
}))

// CSV row type
interface CsvRow {
  sirutaCode: number
  uatName: string
  uatPopulation: number
  occupiedPosts: number
  employeesPer1000Capita: number
  maxPostsFromOUG63: number
  popRegistryPosts: number
  onePolicePer1200Pop: number
  euProjectsImplementationPosts: number
  schoolBusDriversPosts: number
  euProjectsPostImplementationPosts: number
  totalPostsActual: number
  totalPostsReduction45: number
  localPolicePosts: number
}

const createMockCsvRow = (overrides: Partial<CsvRow> = {}): CsvRow => ({
  sirutaCode: 12345,
  uatName: 'Test UAT',
  uatPopulation: 50000,
  occupiedPosts: 100,
  employeesPer1000Capita: 2.0,
  maxPostsFromOUG63: 200,
  popRegistryPosts: 5,
  onePolicePer1200Pop: 42,
  euProjectsImplementationPosts: 10,
  schoolBusDriversPosts: 3,
  euProjectsPostImplementationPosts: 5,
  totalPostsActual: 110,
  totalPostsReduction45: 175,
  localPolicePosts: 50,
  ...overrides,
})

// Mock CSV data
let mockCsvData: CsvRow[] = []
let mockIsLoading = false
let mockError: Error | null = null

vi.mock('@/hooks/useCsvData', () => ({
  useCsvData: () => ({
    data: mockIsLoading ? undefined : mockCsvData.length > 0 ? mockCsvData : undefined,
    isLoading: mockIsLoading,
    error: mockError,
  }),
}))

// ============================================================================
// TEST DATA
// ============================================================================

const createMockEntity = (overrides: Partial<EntityDetailsData> = {}): EntityDetailsData => ({
  cui: 'test-cui-123',
  name: 'Test Entity',
  entity_type: 'admin_county_council',
  is_uat: true,
  default_report_type: 'PRINCIPAL_AGGREGATED' as GqlReportType,
  uat: {
    siruta_code: 12345,
    name: 'Test UAT',
    county_name: 'Test County',
    county_code: 'TC',
  },
  ...overrides,
})

// ============================================================================
// TESTS
// ============================================================================

describe('EmployeesView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCsvData = []
    mockIsLoading = false
    mockError = null
  })

  describe('loading state', () => {
    it('shows loading message when data is loading', () => {
      mockIsLoading = true

      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText(/Se încarcă datele analitice/)).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message when there is an error', () => {
      mockError = new Error('Failed to load CSV data')

      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Failed to load CSV data')).toBeInTheDocument()
    })
  })

  describe('no data state', () => {
    it('shows no data message when row is not found', () => {
      mockCsvData = [createMockCsvRow({ sirutaCode: 99999 })] // Different code

      render(<EmployeesView entity={createMockEntity()} />)

      expect(
        screen.getByText(/Nu au fost găsite date specifice pentru această entitate/)
      ).toBeInTheDocument()
    })

    it('shows no data message when data is empty', () => {
      mockCsvData = []

      render(<EmployeesView entity={createMockEntity()} />)

      expect(
        screen.getByText(/Nu au fost găsite date specifice pentru această entitate/)
      ).toBeInTheDocument()
    })
  })

  describe('data display', () => {
    beforeEach(() => {
      mockCsvData = [createMockCsvRow(), createMockCsvRow({ sirutaCode: 99999, uatName: 'Other' })]
    })

    it('renders population card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Populație')).toBeInTheDocument()
      expect(screen.getByText('50.000')).toBeInTheDocument()
    })

    it('renders occupied posts card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Posturi Ocupate')).toBeInTheDocument()
      // The value 100 is shown in multiple places, check the card content
      expect(screen.getAllByText('100').length).toBeGreaterThan(0)
    })

    it('renders employees per 1000 capita card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Angajați / 1.000 Locuitori')).toBeInTheDocument()
    })

    it('renders scenario scenarios card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Scenarii Alternative de Limită')).toBeInTheDocument()
      expect(screen.getByText('Scenariu -40%')).toBeInTheDocument()
      expect(screen.getByText('Scenariu -45%')).toBeInTheDocument()
    })

    it('renders comparison card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Comparație cu Alte Entități')).toBeInTheDocument()
    })

    it('renders normative components card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Componente Normative Relevante')).toBeInTheDocument()
    })

    it('renders organization chart card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Organigramă și Diferențe')).toBeInTheDocument()
    })

    it('renders calculation details card', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Detalii Calcul Limită Normativă')).toBeInTheDocument()
    })
  })

  describe('surplus state', () => {
    it('shows surplus message when occupied posts exceed limit', () => {
      mockCsvData = [
        createMockCsvRow({
          occupiedPosts: 500, // More than calculated limit
          maxPostsFromOUG63: 200,
        }),
      ]

      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Atenție: Excedent de Personal')).toBeInTheDocument()
      expect(screen.getByText('Posturi de Redus')).toBeInTheDocument()
    })
  })

  describe('deficit state', () => {
    it('shows within limits message when occupied posts are below limit', () => {
      mockCsvData = [
        createMockCsvRow({
          occupiedPosts: 50, // Less than calculated limit
          maxPostsFromOUG63: 200,
        }),
      ]

      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Status: În Limitele Legale')).toBeInTheDocument()
      expect(screen.getByText('Capacitate Disponibilă')).toBeInTheDocument()
    })
  })

  describe('child components', () => {
    beforeEach(() => {
      mockCsvData = [createMockCsvRow()]
    })

    it('renders CalculationLegend', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByTestId('calculation-legend')).toBeInTheDocument()
    })

    it('renders EntityEmployeesDataInfo', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByTestId('employees-data-info')).toBeInTheDocument()
    })

    it('renders link to all employees data', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Vezi Toate Datele')).toBeInTheDocument()
      expect(screen.getByTestId('router-link')).toHaveAttribute('href', '/research/employees-data')
    })
  })

  describe('normative components display', () => {
    beforeEach(() => {
      mockCsvData = [
        createMockCsvRow({
          popRegistryPosts: 5,
          localPolicePosts: 50,
          onePolicePer1200Pop: 42,
          euProjectsImplementationPosts: 10,
          euProjectsPostImplementationPosts: 5,
          schoolBusDriversPosts: 3,
        }),
      ]
    })

    it('displays population registry posts', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Evidența populației')).toBeInTheDocument()
    })

    it('displays local police posts', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Poliția locală (norma actuală)')).toBeInTheDocument()
    })

    it('displays EU projects total', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Total Proiecte UE')).toBeInTheDocument()
    })

    it('displays school bus drivers', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Șoferi microbuze școlare')).toBeInTheDocument()
    })
  })

  describe('organization chart data', () => {
    beforeEach(() => {
      mockCsvData = [
        createMockCsvRow({
          totalPostsActual: 110,
          occupiedPosts: 100,
          maxPostsFromOUG63: 200,
        }),
      ]
    })

    it('displays total posts in organization', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Total posturi în organigramă')).toBeInTheDocument()
    })

    it('displays vacant posts', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Posturi vacante')).toBeInTheDocument()
    })

    it('displays max legal posts', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Maxim legal (OUG 63/2010)')).toBeInTheDocument()
    })
  })

  describe('no population data', () => {
    it('shows no data message when population is 0', () => {
      mockCsvData = [
        createMockCsvRow({
          uatPopulation: 0,
        }),
      ]

      render(<EmployeesView entity={createMockEntity()} />)

      // Should show message in per capita section
      const noDataMessages = screen.getAllByText(/Nu există date suficiente pentru acest indicator/)
      expect(noDataMessages.length).toBeGreaterThan(0)
    })
  })

  describe('calculation display', () => {
    beforeEach(() => {
      mockCsvData = [
        createMockCsvRow({
          maxPostsFromOUG63: 200,
        }),
      ]
    })

    it('displays OUG 63/2010 legal limit', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Limită Legală OUG 63/2010 (G)')).toBeInTheDocument()
    })

    it('displays reduction scenario labels', () => {
      render(<EmployeesView entity={createMockEntity()} />)

      expect(screen.getByText('Scenariu Reducere -40%')).toBeInTheDocument()
      expect(screen.getByText('Scenariu Reducere -45%')).toBeInTheDocument()
    })
  })
})
