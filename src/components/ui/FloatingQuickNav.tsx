import { cn, generateHash } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Map, BarChart2, Table } from 'lucide-react';
import { AnalyticsFilterType, Chart, ChartSchema, defaultYearRange, ReportType } from '@/schemas/charts';
import { useNavigate } from '@tanstack/react-router';
import { ChartUrlState } from '@/components/charts/page-schema';
import { MapUrlState } from '@/schemas/map-filters';
import { EntityAnalyticsUrlState } from '@/routes/entity-analytics';
import { getSeriesColor } from '../charts/components/chart-renderer/utils';
import { useEntityLabel, useUatLabel } from '@/hooks/filters/useFilterLabels';
import { LabelStore } from '@/hooks/filters/interfaces';
import { t } from '@lingui/core/macro';

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
    mapViewType: 'UAT' | 'County';
    mapActive?: boolean;
    tableActive?: boolean;
    chartActive?: boolean;
    filterInput: AnalyticsFilterType;
}

export function FloatingQuickNav({ className, mapViewType, mapActive, tableActive, chartActive, filterInput }: FloatingQuickNavProps) {

    const uatLabelMap = useUatLabel((filterInput.uat_ids ?? []).map(String));
    const entityLabelMap = useEntityLabel((filterInput.entity_cuis ?? []) as string[]);
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
        const next = convertFilterInputToChartState(filterInput, { uatLabelMap, entityLabelMap })
        navigate({ to: '/charts/$chartId', params: { chartId: next.chart.id }, search: next });
    }

    const actions: Action[] = [
        { key: 'map', label: t`Go to Map`, onClick: handleMapNavigate, icon: <Map className="h-5 w-5" />, active: mapActive },
        { key: 'table', label: t`Go to Entity Table`, onClick: handleTableNavigate, icon: <Table className="h-5 w-5" />, active: tableActive },
        { key: 'chart', label: t`Go to Chart View`, onClick: handleChartNavigate, icon: <BarChart2 className="h-5 w-5" />, active: chartActive },
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
                    title={action.label}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full shadow-lg border border-border"
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

function convertFilterInputToChartState(
    filterInput: AnalyticsFilterType,
    labelMaps: { uatLabelMap: LabelStore; entityLabelMap: LabelStore }
): ChartUrlState {
    const accountCategory = (filterInput.account_category ?? 'ch') as 'ch' | 'vn'
    const reportType = coerceReportType(filterInput) ?? 'Executie bugetara agregata la nivel de ordonator principal'
    const years = Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, i) => defaultYearRange.end - i).reverse();
    const series: Chart['series'] = []

    // Edge cases:
    // - If Judet view and entity_cuis contains a county entity (admin_county_council), keep CUI as-is
    // - If Judet view and no entities selected but county_codes present, create one series per county
    // - If UAT view and entity_cuis provided, create one series per entity

    if (filterInput.entity_cuis && filterInput.entity_cuis.length > 0) {
        // One series per selected entity CUI
        filterInput.entity_cuis.forEach((cui, index) => {
            series.push({
                id: crypto.randomUUID(),
                type: 'line-items-aggregated-yearly',
                enabled: true,
                label: labelMaps.entityLabelMap.map(cui),
                unit: 'RON',
                filter: {
                    ...filterInput,
                    years: years,
                    account_category: accountCategory,
                    report_type: reportType,
                    entity_cuis: [cui],
                },
                config: {
                    visible: true,
                    showDataLabels: false,
                    color: getSeriesColor(index),
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
        })
    } else if (filterInput.uat_ids && filterInput.uat_ids.length > 0) {
        // One series per selected entity (assumed county councils)
        filterInput.uat_ids.forEach((uatId, index) => {
            series.push({
                id: crypto.randomUUID(),
                type: 'line-items-aggregated-yearly',
                enabled: true,
                label: labelMaps.uatLabelMap.map(uatId),
                unit: 'RON',
                filter: {
                    ...filterInput,
                    years: years,
                    account_category: accountCategory,
                    report_type: reportType,
                    uat_ids: [uatId],
                },
                config: {
                    visible: true,
                    showDataLabels: false,
                    color: getSeriesColor(index),
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
        })
    } else if (filterInput.county_codes && filterInput.county_codes.length > 0) {
        filterInput.county_codes.forEach((cc, index) => {
            series.push({
                id: crypto.randomUUID(),
                type: 'line-items-aggregated-yearly',
                enabled: true,
                label: `County ${cc}`,
                unit: 'RON',
                filter: {
                    ...filterInput,
                    years: years,
                    account_category: accountCategory,
                    report_type: reportType,
                    county_codes: [cc],
                },
                config: {
                    visible: true,
                    showDataLabels: false,
                    color: getSeriesColor(index),
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            })
        })
    }

    if (series.length === 0) {
        // Default: one series with provided filter
        series.push({
            id: crypto.randomUUID(),
            type: 'line-items-aggregated-yearly',
            enabled: true,
            label: "Series",
            unit: 'RON',
            filter: {
                ...filterInput,
                years: years,
                account_category: accountCategory,
                report_type: reportType,
            },
            config: {
                visible: true,
                showDataLabels: false,
                color: getSeriesColor(0),
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        })
    }

    const chartId = generateHash(JSON.stringify(filterInput))
    const chartState: ChartUrlState = {
        chart: ChartSchema.parse({
            id: chartId,
            title: t`Analytics`,
            config: {
                chartType: 'bar',
                yearRange: { start: years[0], end: years[years.length - 1] }
            },
            series,
            annotations: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }),
        view: 'overview',
    }
    return chartState
}

function convertFilterInputToEntityTableState(filterInput: AnalyticsFilterType, mapViewType: 'UAT' | 'County'): EntityAnalyticsUrlState {
    const years = ensureYears(filterInput)
    const accountCategory = (filterInput.account_category ?? 'ch') as 'ch' | 'vn'
    const base: EntityAnalyticsUrlState = {
        view: 'table',
        sortOrder: 'desc',
        page: 1,
        pageSize: 25,
        filter: { ...filterInput, years, account_category: accountCategory },
    }

    // Edge cases for uat table:
    // - If switching from Judet with no uat_ids, aggregate at county level: use entity_types admin_county_council
    // - If Judet and uat_ids selected -> prefer uat_ids
    // - If UAT view and uat_ids selected, keep is_uat true
    if (mapViewType === 'County') {
        if (filterInput.uat_ids && filterInput.uat_ids.length > 0) {
            base.filter = { ...base.filter, uat_ids: filterInput.uat_ids, entity_types: undefined, is_uat: undefined }
        } else {
            base.filter = { ...base.filter, entity_types: ['admin_county_council'], is_uat: undefined }
        }
    } else {
        if (filterInput.county_codes && filterInput.county_codes.length > 0) {
            base.filter = { ...base.filter, is_uat: undefined }
        } else {
            base.filter = { ...base.filter, is_uat: true }
        }
    }

    return base
}

function convertFilterInputToMapState(filterInput: AnalyticsFilterType, mapViewType: 'UAT' | 'County'): MapUrlState {
    const years = ensureYears(filterInput)
    const accountCategory = (filterInput.account_category ?? 'ch') as 'ch' | 'vn'

    return {
        filters: { ...filterInput, years, account_category: accountCategory },
        mapViewType: mapViewType,
        activeView: 'map',
    }
}