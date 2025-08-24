import { useQuery } from "@tanstack/react-query";
import { getChartAnalytics, getStaticChartAnalytics } from "@/lib/api/charts";
import { AnalyticsFilterType, AnalyticsInput, Chart, AnalyticsSeries, Series, defaultYearRange, SeriesConfig, StaticSeriesConfiguration } from "@/schemas/charts";
import { useMemo } from "react";
import { generateHash, convertDaysToMs } from "@/lib/utils";
import { calculateAllSeriesData } from "@/lib/chart-calculation-utils";
import { combineValidationResults } from "@/lib/chart-data-validation";
import { validateAnalyticsSeries, sanitizeAnalyticsSeries, formatValidationErrors, ValidationResult } from "@/lib/chart-data-validation";

interface UseChartDataProps {
    chart?: Chart;
    enabled?: boolean;
}

export type SeriesId = string;
export type Unit = string;

export type DataPointPayload = {
    id: SeriesId;
    series: Pick<Series, 'id' | 'label'> & { config: Pick<SeriesConfig, 'color'> };
    year: number | string;
    value: number;
    unit: string;
    initialValue: number;
    initialUnit: string;
};

export type TimeSeriesDataPoint = Record<SeriesId, DataPointPayload> & {
    year: number;
}

export type DataSeriesMap = Map<SeriesId, AnalyticsSeries>;
export type UnitMap = Map<SeriesId, Unit>;

export function useChartData({ chart, enabled = true }: UseChartDataProps) {
    const analyticsInputs = useMemo(() => {
        if (!chart) return [];

        const buildDefaultYears = () =>
            Array.from({ length: defaultYearRange.end - defaultYearRange.start + 1 }, (_, i) => defaultYearRange.start + i);

        return chart.series
            .filter(series => series.type === 'line-items-aggregated-yearly')
            .map(series => {
                const filter = series.filter as AnalyticsFilterType;
                const years = (Array.isArray(filter.years) && filter.years.length > 0)
                    ? filter.years
                    : buildDefaultYears();
                const account_category = (filter.account_category ?? 'ch') as 'ch' | 'vn';
                return { seriesId: series.id, filter: { ...filter, years, account_category } as AnalyticsFilterType };
            });
    }, [chart]);

    const staticSeries = useMemo(() => {
        if (!chart) return [];
        return chart.series
            .filter(series => series.type === 'static-series')
            .map(series => series as StaticSeriesConfiguration);
    }, [chart]);

    const analyticsInputsHash = useMemo(() => getAnalyticsInputHash(analyticsInputs), [analyticsInputs]);
    const staticSeriesIds = useMemo(() => [...new Set(staticSeries.map(s => s.seriesId).filter((id): id is string => !!id))], [staticSeries]);
    const staticSeriesIdsHash = useMemo(() => getStaticSeriesInputHash(staticSeriesIds), [staticSeriesIds]);
    const hasChart = !!chart;
    const hasFilters = analyticsInputs.length > 0;
    const hasStaticSeries = staticSeries.length > 0;

    // Use the chart series filters to get series data.
    const { data: serverChartData, isLoading: isLoadingData, error: dataError } = useQuery({
        queryKey: ['chart-data', analyticsInputsHash],
        queryFn: () => getChartAnalytics(analyticsInputs),
        enabled: enabled && hasChart && hasFilters,
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    });

    const { data: staticServerChartData, isLoading: isLoadingStaticData, error: staticDataError } = useQuery({
        queryKey: ['chart-data', staticSeriesIdsHash],
        queryFn: () => getStaticChartAnalytics(staticSeriesIds),
        enabled: enabled && hasChart && hasStaticSeries,
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    });


    // Transform server data to our custom data format.
    const computedSeries = useMemo(() => {
        if (!chart) return undefined as undefined | { map: Map<SeriesId, AnalyticsSeries>; calcWarnings: ValidationResult['warnings'] };

        const map = new Map<SeriesId, AnalyticsSeries>();
        if (serverChartData) {
            serverChartData.forEach(data => {
                map.set(data.seriesId, data);
            });
        }

        if (staticServerChartData) {
            const staticServerChartDataMap = staticServerChartData.reduce((acc, data) => {
                acc.set(data.seriesId, data);
                return acc;
            }, new Map<string, AnalyticsSeries>());

            staticSeries.forEach(series => {
                if (series.seriesId) {
                    const data = staticServerChartDataMap.get(series.seriesId);
                    if (data) {
                        map.set(series.id, { ...data, seriesId: series.id, yAxis: { ...data.yAxis, unit: series.unit || data.yAxis.unit } });
                    }
                }
            });
        }

        // Updates the map with the calculated data, custom series, etc.
        const calc = calculateAllSeriesData(chart.series, map);
        return { map: calc.dataSeriesMap, calcWarnings: calc.warnings };

    }, [chart, serverChartData, staticServerChartData, staticSeries]);

    const dataSeriesMap = computedSeries?.map;
    const calculationWarnings = computedSeries?.calcWarnings ?? [];

    // Validate the data
    const validationResult = useMemo(() => {
        if (!dataSeriesMap) return null;
        const base = validateAnalyticsSeries(dataSeriesMap);
        const calcWarningsResult = calculationWarnings.length > 0 ? { isValid: true, errors: [], warnings: calculationWarnings } as ValidationResult : null;
        return combineValidationResults(base, calcWarningsResult);
    }, [dataSeriesMap, calculationWarnings]);

    // Create sanitized data map if needed
    const sanitizedDataSeriesMap = useMemo(() => {
        if (!dataSeriesMap || !validationResult) return dataSeriesMap;
        
        if (!validationResult.isValid || validationResult.warnings.length > 0) {
            console.warn('Chart data validation adjustments applied:', formatValidationErrors(validationResult));
            return sanitizeAnalyticsSeries(dataSeriesMap, validationResult);
        }
        
        return dataSeriesMap;
    }, [dataSeriesMap, validationResult]);

    return {
        dataSeriesMap: sanitizedDataSeriesMap,
        isLoadingData: isLoadingData || isLoadingStaticData,
        dataError: dataError || staticDataError,
        validationResult,
    };
}

function getAnalyticsInputHash(analyticsInputs: AnalyticsInput[]) {
    if (analyticsInputs.length === 0) return '';
    const payloadHash = analyticsInputs
        .sort((a, b) => a.seriesId.localeCompare(b.seriesId))
        .reduce((acc, input) => {
            return acc + input.seriesId + '::' + JSON.stringify(input.filter);
        }, '');

    return generateHash(payloadHash);
}

function getStaticSeriesInputHash(seriesIds: string[]) {
    if (seriesIds.length === 0) return '';
    const payloadHash = seriesIds
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, input) => {
            return acc + input;
        }, '');

    return generateHash(payloadHash);
}


export function convertToTimeSeriesData(dataSeriesMap: Map<SeriesId, AnalyticsSeries>, chart: Chart): { data: TimeSeriesDataPoint[], unitMap: UnitMap } {
    if (dataSeriesMap.size === 0) return { data: [], unitMap: new Map<SeriesId, Unit>() };

    const allYears = new Set<number>();
    dataSeriesMap.forEach(dataPoint => {
        dataPoint.data.forEach(point => allYears.add(Number(point.x)));
    });

    const unitMap = new Map<SeriesId, Unit>();
    const seriesMap = chart.series.reduce((acc, series) => {
        acc[series.id] = series;
        return acc;
    }, {} as Record<SeriesId, Series>);

    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    const startYear = chart.config.yearRange?.start ?? sortedYears[0] ?? defaultYearRange.start;
    const endYear = chart.config.yearRange?.end ?? sortedYears[sortedYears.length - 1] ?? defaultYearRange.end;

    const filteredYears = sortedYears.filter(year => year >= startYear && year <= endYear);
    const isRelative = chart.config.showRelativeValues ?? false;

    const data = filteredYears.map(year => {
        const dataPoint: TimeSeriesDataPoint = {} as TimeSeriesDataPoint;
        dataSeriesMap.forEach((data, seriesId) => {
            const yearData = data.data.find(p => Number(p.x) === year);
            const initialValue = yearData?.y || 0;
            const initialUnit = data.yAxis.unit || '';

            const series = seriesMap[seriesId];


            unitMap.set(seriesId, initialUnit);
            dataPoint.year = year;
            dataPoint[seriesId] = {
                id: seriesId,
                series,
                year,
                value: initialValue,
                unit: initialUnit,
                initialValue,
                initialUnit,
            };
        });

        if (isRelative) {
            // Map first series to unit and value
            const firstSeriesMap = new Map<Unit, { unit: Unit, value: number }>();
            chart.series.forEach(series => {
                const data = dataSeriesMap.get(series.id);
                const unit = data?.yAxis.unit || '';
                const firstSeries = firstSeriesMap.get(unit);
                if (!firstSeries) {
                    const value = data?.data.find(p => Number(p.x) === year)?.y || 0;
                    firstSeriesMap.set(unit, { unit, value });
                }
            })

            // Update the value and unit to relative values (%)
            dataSeriesMap.forEach((_, seriesId) => {
                const dataPointPayload = dataPoint[seriesId];
                const firstSeries = firstSeriesMap.get(dataPointPayload.unit);
                if (!firstSeries || !dataPointPayload || firstSeries.value === 0) return;
                const value = (dataPointPayload.value / firstSeries.value) * 100;
                const unit = "%";
                dataPointPayload.value = value;
                dataPointPayload.unit = unit;
                // Update the unitMap with the new unit (%)
                unitMap.set(seriesId, unit);
            })

        }

        return dataPoint;
    });


    return { data, unitMap };
}

export function convertToAggregatedData(dataSeriesMap: DataSeriesMap, chart: Chart): { data: DataPointPayload[], unitMap: UnitMap, warnings?: ValidationResult['warnings'] } {

    if (!chart || !dataSeriesMap) return { data: [], unitMap: new Map<SeriesId, Unit>() };

    const enabledSeries = chart.series.filter(s => s.enabled);

    const yearRange = chart.config.yearRange;
    const startYear = yearRange?.start ?? -Infinity;
    const endYear = yearRange?.end ?? Infinity;

    const unitMap = new Map<SeriesId, Unit>();

    const isRelative = chart.config.showRelativeValues ?? false;

    let firstSeriesValue = 1;

    const warnings: ValidationResult['warnings'] = [];

    const data = enabledSeries.map((series: Series, index: number) => {
        const dataSeries = dataSeriesMap.get(series.id);
        const totalValueRaw = dataSeries?.data
            .filter(trend => Number(trend.x) >= startYear && Number(trend.x) <= endYear)
            .reduce((acc, trend) => acc + trend.y, 0);

        const totalValue = Number.isFinite(totalValueRaw ?? 0) ? (totalValueRaw as number) : 0;

        const initialValue = totalValue;
        const initialUnit = dataSeries?.yAxis.unit || '';
        let value = initialValue;
        let unit = initialUnit;

        if (isRelative && index === 0) {
            firstSeriesValue = totalValue ?? 0;
        }
        if (isRelative) {
            // Guard division by zero or invalid values
            if (!firstSeriesValue || !Number.isFinite(firstSeriesValue)) {
                warnings.push({
                    type: 'auto_adjusted_value',
                    seriesId: series.id,
                    message: `Relative base is ${firstSeriesValue}. Auto-set value to 0 for aggregated period ${startYear}-${endYear}.`,
                    value: { base: firstSeriesValue, total: totalValue },
                  });
                value = 0;
            } else {
                const computed = (totalValue / firstSeriesValue) * 100;
                if (!Number.isFinite(computed)) {
                    warnings.push({
                        type: 'auto_adjusted_value',
                        seriesId: series.id,
                        message: `Computed relative value not finite. Auto-set to 0 for ${startYear}-${endYear}.`,
                        value: { base: firstSeriesValue, total: totalValue },
                      });
                }
                value = Number.isFinite(computed) ? computed : 0;
            }
            unit = "%";
        }

        unitMap.set(series.id, unit);

        const aggregatedDataPoint: DataPointPayload = {
            id: series.id,
            year: `${startYear}-${endYear}`,
            series,
            value,
            unit,
            initialValue,
            initialUnit,
        };

        return aggregatedDataPoint;
    });

    return { data, unitMap, warnings };
}