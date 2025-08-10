import { useQuery } from "@tanstack/react-query";
import { getChartAnalytics, getStaticChartAnalytics, StaticAnalyticsDataPoint } from "@/lib/api/charts";
import { AnalyticsFilterType, AnalyticsInput, Chart, AnalyticsDataPoint, Series, defaultYearRange, SeriesConfig, StaticSeriesConfiguration } from "@/schemas/charts";
import { useMemo } from "react";
import { generateHash, convertDaysToMs } from "@/lib/utils";
import { calculateAllSeriesData } from "@/lib/chart-calculation-utils";

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

export type DataSeriesMap = Map<SeriesId, AnalyticsDataPoint>;
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
    const staticSeriesDatasetIds = useMemo(() => [...new Set(staticSeries.map(s => s.datasetId).filter((id): id is string => !!id))], [staticSeries]);
    const staticSeriesDatasetIdsHash = useMemo(() => getStaticSeriesInputHash(staticSeriesDatasetIds), [staticSeriesDatasetIds]);
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
        queryKey: ['chart-data', staticSeriesDatasetIdsHash],
        queryFn: () => getStaticChartAnalytics(staticSeriesDatasetIds),
        enabled: enabled && hasChart && hasStaticSeries,
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    });


    // Transform server data to our custom data format.
    const dataSeriesMap = useMemo(() => {
        if (!chart) return undefined;

        const dataSeriesMap = new Map<SeriesId, AnalyticsDataPoint>();
        if (serverChartData) {
            serverChartData.forEach(data => {
                dataSeriesMap.set(data.seriesId, data);
            });
        }

        if (staticServerChartData) {
            const staticServerChartDataMap = staticServerChartData.reduce((acc, data) => {
                acc.set(data.datasetId, data);
                return acc;
            }, new Map<string, StaticAnalyticsDataPoint>());

            staticSeries.forEach(series => {
                if (series.datasetId) {
                    const data = staticServerChartDataMap.get(series.datasetId);
                    if (data) {
                        dataSeriesMap.set(series.id, { ...data, seriesId: series.id, unit: series.unit || data.unit });
                    }
                }
            });
        }

        // Updates the dataSeriesMap with the calculated data, custom series, etc.
        calculateAllSeriesData(chart.series, dataSeriesMap);
        return dataSeriesMap;

    }, [chart, serverChartData, staticServerChartData, staticSeries]);

    return {
        dataSeriesMap,
        isLoadingData: isLoadingData || isLoadingStaticData,
        dataError: dataError || staticDataError,
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

function getStaticSeriesInputHash(datasetIds: string[]) {
    if (datasetIds.length === 0) return '';
    const payloadHash = datasetIds
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, input) => {
            return acc + input;
        }, '');

    return generateHash(payloadHash);
}


export function convertToTimeSeriesData(dataSeriesMap: Map<SeriesId, AnalyticsDataPoint>, chart: Chart): { data: TimeSeriesDataPoint[], unitMap: UnitMap } {
    if (dataSeriesMap.size === 0) return { data: [], unitMap: new Map<SeriesId, Unit>() };

    const allYears = new Set<number>();
    dataSeriesMap.forEach(dataPoint => {
        dataPoint.yearlyTrend.forEach(point => allYears.add(point.year));
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
            const yearData = data.yearlyTrend.find(p => p.year === year);
            const initialValue = yearData?.totalAmount || 0;
            const initialUnit = data.unit || '';

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
                const unit = data?.unit || '';
                const firstSeries = firstSeriesMap.get(unit);
                if (!firstSeries) {
                    const value = data?.yearlyTrend.find(p => p.year === year)?.totalAmount || 0;
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

export function convertToAggregatedData(dataSeriesMap: DataSeriesMap, chart: Chart): { data: DataPointPayload[], unitMap: UnitMap } {

    if (!chart || !dataSeriesMap) return { data: [], unitMap: new Map<SeriesId, Unit>() };

    const enabledSeries = chart.series.filter(s => s.enabled);

    const yearRange = chart.config.yearRange;
    const startYear = yearRange?.start ?? -Infinity;
    const endYear = yearRange?.end ?? Infinity;

    const unitMap = new Map<SeriesId, Unit>();

    const isRelative = chart.config.showRelativeValues ?? false;

    let firstSeriesValue = 1;

    const data = enabledSeries.map((series: Series, index: number) => {
        const dataSeries = dataSeriesMap.get(series.id);
        const totalValue = dataSeries?.yearlyTrend
            .filter(trend => trend.year >= startYear && trend.year <= endYear)
            .reduce((acc, trend) => acc + trend.totalAmount, 0) ?? 0;

        const initialValue = totalValue;
        const initialUnit = dataSeries?.unit || '';
        let value = initialValue;
        let unit = initialUnit;

        if (isRelative && index === 0) {
            firstSeriesValue = totalValue ?? 0;
        }
        if (isRelative) {
            value = (totalValue / firstSeriesValue) * 100;
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

    return { data, unitMap };
}