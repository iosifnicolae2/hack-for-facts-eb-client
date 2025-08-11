import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Map, BarChart2, Table } from 'lucide-react';
import { AnalyticsFilterType, ChartSchema, ReportType } from '@/schemas/charts';
import { useNavigate } from '@tanstack/react-router';
import { ChartUrlState } from '@/routes/charts/$chartId/_schema';
import { MapUrlState } from '@/schemas/map-filters';
import { EntityAnalyticsUrlState } from '@/routes/entity-analytics';

type View = 'map' | 'table' | 'chart';

type Action = {
    key: View;
    label: string;
    onClick: () => void;
    icon: React.ReactNode;
    active?: boolean;
}

interface FloatingQuickNavProps {
    className?: string;
    mapViewType: 'UAT' | 'Judet';
    mapActive?: boolean;
    tableActive?: boolean;
    chartActive?: boolean;
    filterInput: AnalyticsFilterType;
}

export function FloatingQuickNav({ className, mapViewType, mapActive, tableActive, chartActive, filterInput }: FloatingQuickNavProps) {

    const navigate = useNavigate();

    const handleMapNavigate = () => {
        const next = convertFilterInputToMapState(filterInput, mapViewType)
        navigate({ to: '/map', search: next });
    }

    const handleTableNavigate = () => {
        const next = convertFilterInputToEntityTableState(filterInput, mapViewType)
        navigate({ to: '/entity-analytics', search: next });
    }

    const handleChartNavigate = () => {
        const next = convertFilterInputToChartState(filterInput, mapViewType)
        navigate({ to: '/charts/$chartId', params: { chartId: crypto.randomUUID() }, search: next });
    }

    const actions: Action[] = [
        { key: 'map', label: 'Go to Map', onClick: handleMapNavigate, icon: <Map className="h-5 w-5" />, active: mapActive },
        { key: 'table', label: 'Go to Entity Table', onClick: handleTableNavigate, icon: <Table className="h-5 w-5" />, active: tableActive },
        { key: 'chart', label: 'Go to Chart View', onClick: handleChartNavigate, icon: <BarChart2 className="h-5 w-5" />, active: chartActive },
    ]

    const visibleActions = actions.filter(a => a.active);

    return (
        <div
            className={cn(
                'hidden md:flex fixed top-8 right-18 z-40 flex-row gap-2',
                className,
            )}
        >
            {visibleActions.map(action => (
                <Button
                    key={action.key}
                    aria-label={action.label}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg border border-slate-200 dark:border-slate-700"
                    onClick={action.onClick}
                >
                    {action.icon}
                </Button>
            ))}
        </div>
    );
}

function coerceReportType(filter: AnalyticsFilterType): ReportType | undefined {
    return (filter as any).report_types?.[0] ?? filter.report_type ?? undefined
}

function ensureYears(filter: AnalyticsFilterType): number[] {
    if (Array.isArray(filter.years) && filter.years.length > 0) return filter.years
    const currentYear = new Date().getFullYear()
    return [currentYear]
}

function convertFilterInputToChartState(filterInput: AnalyticsFilterType, mapViewType: 'UAT' | 'Judet'): ChartUrlState {
    const years = ensureYears(filterInput)
    const accountCategory = (filterInput.account_category ?? 'ch') as 'ch' | 'vn'
    const reportType = coerceReportType(filterInput) ?? 'Executie bugetara agregata la nivel de ordonator principal'

    const series = [] as any[]

    // Edge cases:
    // - If Judet view and entity_cuis contains a county entity (admin_county_council), keep CUI as-is
    // - If Judet view and no entities selected but county_codes present, create one series per county
    // - If UAT view and entity_cuis provided, create one series per entity

    if (mapViewType === 'Judet') {
        if (filterInput.entity_cuis && filterInput.entity_cuis.length > 0) {
            // One series per selected entity (assumed county councils)
            filterInput.entity_cuis.forEach((cui) => {
                series.push({
                    id: crypto.randomUUID(),
                    type: 'line-items-aggregated-yearly',
                    enabled: true,
                    label: `CJ ${cui}`,
                    filter: {
                        ...filterInput,
                        years,
                        account_category: accountCategory,
                        report_type: reportType,
                        entity_cuis: [cui],
                        county_codes: undefined,
                        is_uat: undefined,
                    },
                    config: {},
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })
            })
        } else if (filterInput.county_codes && filterInput.county_codes.length > 0) {
            filterInput.county_codes.forEach((cc) => {
                series.push({
                    id: crypto.randomUUID(),
                    type: 'line-items-aggregated-yearly',
                    enabled: true,
                    label: `Județ ${cc}`,
                    filter: {
                        ...filterInput,
                        years,
                        account_category: accountCategory,
                        report_type: reportType,
                        county_codes: [cc],
                        entity_cuis: undefined,
                        is_uat: undefined,
                    },
                    config: {},
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                })
            })
        }
    }

    if (series.length === 0) {
        // Default: one series with provided filter
        series.push({
            id: crypto.randomUUID(),
            type: 'line-items-aggregated-yearly',
            enabled: true,
            label: 'Series',
            filter: {
                ...filterInput,
                years,
                account_category: accountCategory,
                report_type: reportType,
            },
            config: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
    }

    const chartState: ChartUrlState = {
        chart: ChartSchema.parse({
            id: crypto.randomUUID(),
            title: 'Analytics',
            config: { chartType: 'bar' },
            series,
            annotations: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }),
        view: 'overview',
    }
    return chartState
}

function convertFilterInputToEntityTableState(filterInput: AnalyticsFilterType, mapViewType: 'UAT' | 'Judet'): EntityAnalyticsUrlState {
    const years = ensureYears(filterInput)
    const accountCategory = (filterInput.account_category ?? 'ch') as 'ch' | 'vn'
    const base: EntityAnalyticsUrlState = {
        view: 'table',
        sortOrder: 'desc',
        page: 1,
        pageSize: 25,
        filter: { ...filterInput, years, account_category: accountCategory },
    }

    // Edge cases for entity table:
    // - If switching from Judet with no entities, aggregate at county level: use entity_types admin_county_council
    // - If Judet and entities selected -> prefer entity_cuis
    // - If UAT view and entities selected, keep is_uat true
    if (mapViewType === 'Judet') {
        if (filterInput.entity_cuis && filterInput.entity_cuis.length > 0) {
            base.filter = { ...base.filter, entity_cuis: filterInput.entity_cuis, entity_types: undefined, is_uat: undefined }
        } else {
            base.filter = { ...base.filter, entity_types: ['admin_county_council'], is_uat: undefined }
        }
    } else {
        if (filterInput.entity_cuis && filterInput.entity_cuis.length > 0) {
            base.filter = { ...base.filter, is_uat: undefined }
        } else {
            base.filter = { ...base.filter, is_uat: true }
        }
    }

    return base
}

function convertFilterInputToMapState(filterInput: AnalyticsFilterType, mapViewType: 'UAT' | 'Judet'): MapUrlState {
    const years = ensureYears(filterInput)
    const accountCategory = (filterInput.account_category ?? 'ch') as 'ch' | 'vn'

    return {
        filters: {
            years,
            account_category: accountCategory,
            normalization: filterInput.normalization,
            functional_codes: filterInput.functional_codes,
            economic_codes: filterInput.economic_codes,
            county_codes: filterInput.county_codes,
            regions: filterInput.regions,
            aggregate_min_amount: filterInput.aggregate_min_amount as number | undefined,
            aggregate_max_amount: filterInput.aggregate_max_amount as number | undefined,
            min_population: filterInput.min_population as number | undefined,
            max_population: filterInput.max_population as number | undefined,
        },
        mapViewType: mapViewType,
        activeView: 'map',
    }
}