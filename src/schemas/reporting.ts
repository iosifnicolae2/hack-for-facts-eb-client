import { z } from 'zod'

export type TMonth = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12'
export type TQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export type YearPeriod = `${number}`
export type YearMonthPeriod = `${number}-${TMonth}`
export type YearQuarterPeriod = `${number}-${TQuarter}`
export type ReportPeriodType = 'YEAR' | 'MONTH' | 'QUARTER'

export type PeriodDate = YearPeriod | YearMonthPeriod | YearQuarterPeriod
export type DateInput = PeriodDate

export type PeriodIntervalInput = {
  start: PeriodDate
  end: PeriodDate
}

export type PeriodSelection =
  | { interval: PeriodIntervalInput; dates?: undefined }
  | { dates: PeriodDate[]; interval?: undefined }

export interface ReportPeriodInput {
  readonly type: ReportPeriodType
  readonly selection: PeriodSelection
}

export type ExecutionGqlReportType = 'PRINCIPAL_AGGREGATED' | 'SECONDARY_AGGREGATED' | 'DETAILED'
export type CommitmentGqlReportType =
  | 'COMMITMENT_PRINCIPAL_AGGREGATED'
  | 'COMMITMENT_SECONDARY_AGGREGATED'
  | 'COMMITMENT_DETAILED'
export type GqlReportType = ExecutionGqlReportType | CommitmentGqlReportType

export function isCommitmentReportType(type?: GqlReportType): type is CommitmentGqlReportType {
  return (
    type === 'COMMITMENT_PRINCIPAL_AGGREGATED' ||
    type === 'COMMITMENT_SECONDARY_AGGREGATED' ||
    type === 'COMMITMENT_DETAILED'
  )
}

export function toCommitmentReportType(type?: GqlReportType): CommitmentGqlReportType | undefined {
  if (!type) return undefined
  if (isCommitmentReportType(type)) return type
  if (type === 'PRINCIPAL_AGGREGATED') return 'COMMITMENT_PRINCIPAL_AGGREGATED'
  if (type === 'SECONDARY_AGGREGATED') return 'COMMITMENT_SECONDARY_AGGREGATED'
  return 'COMMITMENT_DETAILED'
}

export function toExecutionReportType(type?: GqlReportType): ExecutionGqlReportType | undefined {
  if (!type) return undefined
  if (type === 'COMMITMENT_PRINCIPAL_AGGREGATED') return 'PRINCIPAL_AGGREGATED'
  if (type === 'COMMITMENT_SECONDARY_AGGREGATED') return 'SECONDARY_AGGREGATED'
  if (type === 'COMMITMENT_DETAILED') return 'DETAILED'
  return type
}

export function toReportTypeValue(gqlReportType: ExecutionGqlReportType): 'Executie bugetara agregata la nivel de ordonator principal' | 'Executie bugetara agregata la nivel de ordonator secundar' | 'Executie bugetara detaliata'
export function toReportTypeValue(gqlReportType: CommitmentGqlReportType): 'Angajamente bugetare agregat principal' | 'Angajamente bugetare agregat secundar' | 'Angajamente bugetare detaliat'
export function toReportTypeValue(gqlReportType: GqlReportType): string
export function toReportTypeValue(gqlReportType: GqlReportType): string {
  if (gqlReportType === 'PRINCIPAL_AGGREGATED') return 'Executie bugetara agregata la nivel de ordonator principal'
  if (gqlReportType === 'SECONDARY_AGGREGATED') return 'Executie bugetara agregata la nivel de ordonator secundar'
  if (gqlReportType === 'DETAILED') return 'Executie bugetara detaliata'
  if (gqlReportType === 'COMMITMENT_PRINCIPAL_AGGREGATED') return 'Angajamente bugetare agregat principal'
  if (gqlReportType === 'COMMITMENT_SECONDARY_AGGREGATED') return 'Angajamente bugetare agregat secundar'
  if (gqlReportType === 'COMMITMENT_DETAILED') return 'Angajamente bugetare detaliat'
  throw new Error('Invalid GqlReportType')
}

export function toReportGqlType(reportType: string) {
  if (reportType === 'Executie bugetara agregata la nivel de ordonator principal') return 'PRINCIPAL_AGGREGATED'
  if (reportType === 'Executie bugetara agregata la nivel de ordonator secundar') return 'SECONDARY_AGGREGATED'
  if (reportType === 'Executie bugetara detaliata') return 'DETAILED'
  if (reportType === 'Executie - Angajamente bugetare agregat principal') return 'COMMITMENT_PRINCIPAL_AGGREGATED'
  if (reportType === 'Executie - Angajamente bugetare agregat secundar') return 'COMMITMENT_SECONDARY_AGGREGATED'
  if (reportType === 'Executie - Angajamente bugetare detaliat') return 'COMMITMENT_DETAILED'
  if (reportType === 'Angajamente bugetare agregat principal') return 'COMMITMENT_PRINCIPAL_AGGREGATED'
  if (reportType === 'Angajamente bugetare agregat secundar') return 'COMMITMENT_SECONDARY_AGGREGATED'
  if (reportType === 'Angajamente bugetare detaliat') return 'COMMITMENT_DETAILED'
  throw new Error('Invalid ReportType')
}

export const YEAR_PERIOD = /^\d{4}$/
export const YEAR_MONTH_PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/
export const YEAR_QUARTER_PERIOD = /^\d{4}-Q[1-4]$/

export function assertYearMonthPeriod(m: string): asserts m is YearMonthPeriod {
  if (!YEAR_MONTH_PERIOD.test(m)) throw new Error('Invalid YearMonthPeriod (YYYY-MM)')
}

export function assertAnchored(type: ReportPeriodType, value: YearPeriod | YearMonthPeriod | YearQuarterPeriod) {
  if (type === 'YEAR' && !YEAR_PERIOD.test(value)) throw new Error('Year must use 4 digits')
  if (type === 'QUARTER' && !YEAR_QUARTER_PERIOD.test(value)) throw new Error('Quarter must use Q1/Q2/Q3/Q4 anchors')
  if (type === 'MONTH' && !YEAR_MONTH_PERIOD.test(value)) throw new Error('Month must use YYYY-MM anchors')
}

export function getQuarterForMonth(month: number): TQuarter {
  if (month <= 3) return 'Q1'
  if (month <= 6) return 'Q2'
  if (month <= 9) return 'Q3'
  return 'Q4'
}

export function getQuarterEndMonth(q: TQuarter): TMonth {
  return q === 'Q1' ? '03' : q === 'Q2' ? '06' : q === 'Q3' ? '09' : '12'
}

export function clampMonth(mm: number): TMonth {
  const m = Math.max(1, Math.min(12, mm))
  return String(m).padStart(2, '0') as TMonth
}

export function makeSingleTimePeriod(type: ReportPeriodType, ym: DateInput): ReportPeriodInput {
  if (type !== 'MONTH') assertAnchored(type, ym)
  return { type, selection: { interval: { start: ym, end: ym } } }
}

export function makeTrendPeriod(period: ReportPeriodType, year: number, startYear: number, endYear: number): ReportPeriodInput {
  if (period === 'YEAR') {
    return { type: 'YEAR', selection: { interval: { start: `${startYear}`, end: `${endYear}` } } }
  }
  if (period === 'QUARTER') {
    return { type: 'QUARTER', selection: { interval: { start: `${year}-Q1`, end: `${year}-Q4` } } }
  }
  if (period === 'MONTH') {
    return { type: 'MONTH', selection: { interval: { start: `${year}-01`, end: `${year}-12` } } }
  }
  throw new Error('Invalid period')
}

export function getInitialFilterState(period: ReportPeriodInput['type'], year: number, month: string, quarter: string): ReportPeriodInput {
  if (period === 'YEAR') return makeSingleTimePeriod('YEAR', `${year}` as DateInput)
  if (period === 'QUARTER') return makeSingleTimePeriod('QUARTER', `${year}-${quarter}` as DateInput)
  if (period === 'MONTH') return makeSingleTimePeriod('MONTH', `${year}-${month}` as DateInput)
  throw new Error('Invalid period')
}

export const GqlReportTypeEnum = z.enum([
  'PRINCIPAL_AGGREGATED',
  'SECONDARY_AGGREGATED',
  'DETAILED',
  'COMMITMENT_PRINCIPAL_AGGREGATED',
  'COMMITMENT_SECONDARY_AGGREGATED',
  'COMMITMENT_DETAILED',
])
export type GqlReportTypeEnumT = z.infer<typeof GqlReportTypeEnum>
