import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getChartAnalytics, getStaticChartAnalytics } from "@/lib/api/charts";
import {
    AnalyticsFilterType,
    AnalyticsInput,
    Chart,
    AnalyticsSeries,
    Series,
    defaultYearRange,
    SeriesConfig,
    StaticSeriesConfiguration,
} from "@/schemas/charts";
import { normalizeAnalyticsFilter } from "@/lib/filterUtils";
import { generateHash, convertDaysToMs } from "@/lib/utils";
import { calculateAllSeriesData } from "@/lib/chart-calculation-utils";
import {
    validateAnalyticsSeries,
    sanitizeAnalyticsSeries,
    combineValidationResults,
    type ValidationResult,
    type DataValidationError,
} from "@/lib/chart-data-validation";
import { getXAxisUnit, parseMonth, parseQuarter } from "@/lib/chart-data-utils";

interface UseChartDataProps {
    chart?: Chart;
    enabled?: boolean;
}

export type SeriesId = string;
export type Unit = string;

export type DataPointPayload = {
    id: SeriesId;
    series: Pick<Series, "id" | "label"> & { config: Pick<SeriesConfig, "color"> };
    year: number | string;
    value: number;
    unit: string;
    initialValue: number;
    initialUnit: string;
};

export type TimeSeriesDataPoint = Record<SeriesId, DataPointPayload> & {
    year: number | string;
};

export type DataSeriesMap = Map<SeriesId, AnalyticsSeries>;
export type UnitMap = Map<SeriesId, Unit>;

export function useChartData({ chart, enabled = true }: UseChartDataProps) {
    const analyticsInputs = useMemo(() => {
        if (!chart) return [];

        const buildDefaultYears = () =>
            Array.from(
                { length: defaultYearRange.end - defaultYearRange.start + 1 },
                (_, i) => defaultYearRange.start + i
            );

        return chart.series
            .filter((series) => series.type === "line-items-aggregated-yearly")
            .map((series) => {
                const filter = series.filter as AnalyticsFilterType;
                const years =
                    Array.isArray(filter.years) && filter.years.length > 0
                        ? filter.years
                        : buildDefaultYears();
                const account_category = (filter.account_category ?? "ch") as "ch" | "vn";
                const normalizedFilter = normalizeAnalyticsFilter(
                    { ...filter, years, account_category } as AnalyticsFilterType,
                    { years }
                );
                return {
                    seriesId: series.id,
                    filter: normalizedFilter,
                };
            });
    }, [chart]);

    const staticSeries = useMemo(() => {
        if (!chart) return [];
        return chart.series
            .filter((series) => series.type === "static-series")
            .map((series) => series as StaticSeriesConfiguration);
    }, [chart]);

    const analyticsInputsHash = useMemo(
        () => getAnalyticsInputHash(analyticsInputs),
        [analyticsInputs]
    );
    const staticSeriesIds = useMemo(
        () =>
            [
                ...new Set(
                    staticSeries.map((s) => s.seriesId).filter((id): id is string => !!id)
                ),
            ],
        [staticSeries]
    );
    const staticSeriesIdsHash = useMemo(
        () => getStaticSeriesInputHash(staticSeriesIds),
        [staticSeriesIds]
    );

    const hasChart = !!chart;
    const hasFilters = analyticsInputs.length > 0;
    const hasStaticSeries = staticSeries.length > 0;

    // Fetch dynamic series
    const {
        data: serverChartData,
        isLoading: isLoadingData,
        error: dataError,
    } = useQuery({
        queryKey: ["chart-data", analyticsInputsHash],
        queryFn: () => getChartAnalytics(analyticsInputs),
        enabled: enabled && hasChart && hasFilters,
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    });

    // Fetch static series
    const {
        data: staticServerChartData,
        isLoading: isLoadingStaticData,
        error: staticDataError,
    } = useQuery({
        queryKey: ["chart-data", staticSeriesIdsHash],
        queryFn: () => getStaticChartAnalytics(staticSeriesIds),
        enabled: enabled && hasChart && hasStaticSeries,
        staleTime: convertDaysToMs(1),
        gcTime: convertDaysToMs(3),
    });

    // Merge server data, static series, and calculated/custom series
    const computedSeries = useMemo(() => {
        if (!chart)
            return undefined as
                | undefined
                | { map: Map<SeriesId, AnalyticsSeries>; calcWarnings: ValidationResult["warnings"] };

        const map = new Map<SeriesId, AnalyticsSeries>();

        if (serverChartData) {
            serverChartData.forEach((data) => {
                map.set(data.seriesId, data);
            });
        }

        if (staticServerChartData) {
            const staticServerChartDataMap = staticServerChartData.reduce(
                (acc, data) => {
                    acc.set(data.seriesId, data);
                    return acc;
                },
                new Map<string, AnalyticsSeries>()
            );

            staticSeries.forEach((series) => {
                if (series.seriesId) {
                    const data = staticServerChartDataMap.get(series.seriesId);
                    if (data) {
                        map.set(series.id, {
                            ...data,
                            seriesId: series.id,
                            yAxis: {
                                ...data.yAxis,
                                unit: series.unit || data.yAxis.unit,
                            },
                        });
                    }
                }
            });
        }

        // Include calculated/custom series
        const calc = calculateAllSeriesData(chart.series, map);
        return { map: calc.dataSeriesMap, calcWarnings: calc.warnings };
    }, [chart, serverChartData, staticServerChartData, staticSeries]);

    const dataSeriesMap = computedSeries?.map;
    const calculationWarnings = computedSeries?.calcWarnings ?? [];

    // Validate the data (base validation + calculation warnings)
    const validationResult = useMemo(() => {
        if (!dataSeriesMap) return null;
        const base = validateAnalyticsSeries(dataSeriesMap);
        const calcWarningsResult =
            calculationWarnings.length > 0
                ? ({
                    isValid: true,
                    errors: [],
                    warnings: calculationWarnings,
                } as ValidationResult)
                : null;
        return combineValidationResults(base, calcWarningsResult);
    }, [dataSeriesMap, calculationWarnings]);

    // Sanitize invalid points if needed
    const sanitizedDataSeriesMap = useMemo(() => {
        if (!dataSeriesMap || !validationResult) return dataSeriesMap;

        if (!validationResult.isValid || validationResult.warnings.length > 0) {
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
    if (analyticsInputs.length === 0) return "";
    const payloadHash = analyticsInputs
        .sort((a, b) => a.seriesId.localeCompare(b.seriesId))
        .reduce((acc, input) => {
            return acc + input.seriesId + "::" + JSON.stringify(input.filter);
        }, "");
    return generateHash(payloadHash);
}

function getStaticSeriesInputHash(seriesIds: string[]) {
    if (seriesIds.length === 0) return "";
    const payloadHash = seriesIds
        .sort((a, b) => a.localeCompare(b))
        .reduce((acc, input) => acc + input, "");
    return generateHash(payloadHash);
}

export interface ChartDataResult<T> {
    data: T;
    unitMap: UnitMap;
    validation: ValidationResult;
}

/**
 * Processes and validates time-series data in a single pass.
 * Returns data, unit map, and complete validation results.
 */
export function convertToTimeSeriesData(
    dataSeriesMap: Map<SeriesId, AnalyticsSeries>,
    chart: Chart
): ChartDataResult<TimeSeriesDataPoint[]> {
    if (dataSeriesMap.size === 0) {
        return {
            data: [],
            unitMap: new Map<SeriesId, Unit>(),
            validation: { isValid: true, errors: [], warnings: [] }
        };
    }

    // Infer x-axis semantics from the first series. Server provides xAxis.unit and x values as strings.
    const xUnit = getXAxisUnit(dataSeriesMap);
    const isMonth = xUnit === 'month';
    const isQuarter = xUnit === 'quarter';
    const isYear = xUnit === 'year';

    // Collect x-buckets (preserve display labels)
    const buckets = new Set<string>();
    dataSeriesMap.forEach((series) => {
        series.data.forEach((point) => {
            const label = String(point.x).trim();
            if (label !== '' && label !== 'NaN') buckets.add(label);
        });
    });

    // Sort buckets depending on unit
    const sortedBuckets = Array.from(buckets).sort((a, b) => {
        if (isYear) return Number(a) - Number(b);
        if (isQuarter) {
            const qa = parseQuarter(a).q ?? 0;
            const qb = parseQuarter(b).q ?? 0;
            return qa - qb;
        }
        if (isMonth) {
            const pa = parseMonth(a).m ?? 0;
            const pb = parseMonth(b).m ?? 0;
            // If include year prefix, sort by year then month
            const ya = parseMonth(a).y ?? 0;
            const yb = parseMonth(b).y ?? 0;
            if (ya !== yb) return ya - yb;
            return pa - pb;
        }
        return String(a).localeCompare(String(b));
    });
    // For year we can respect chart yearRange
    const filteredBuckets = isYear
        ? sortedBuckets.filter((label) => {
            const n = Number(label);
            const start = chart.config.yearRange?.start ?? Number(sortedBuckets[0]) ?? defaultYearRange.start;
            const end = chart.config.yearRange?.end ?? Number(sortedBuckets[sortedBuckets.length - 1]) ?? defaultYearRange.end;
            return Number.isFinite(n) && n >= start && n <= end;
        })
        : sortedBuckets;

    const unitMap = new Map<SeriesId, Unit>();
    const seriesMap = chart.series.reduce(
        (acc, series) => {
            acc[series.id] = series;
            return acc;
        },
        {} as Record<SeriesId, Series>
    );

    const warnings: DataValidationError[] = [];
    const errors: DataValidationError[] = [];

    // Validate input data structure
    if (!chart.config) {
        errors.push({
            type: 'missing_data',
            seriesId: 'chart',
            message: 'Chart configuration is missing or invalid'
        });
    }

    const isRelative = chart.config.showRelativeValues ?? false;
    const data = filteredBuckets.map((bucketLabel) => {
        // Build a plain record first to avoid mutating a fully-cast object
        const row: Record<SeriesId, DataPointPayload> = Object.create(null);

        dataSeriesMap.forEach((seriesData, seriesId) => {
            const match = seriesData.data.find((p) => String(p.x).trim() === bucketLabel);
            const initialValue = match?.y ?? 0;
            const initialUnit = seriesData.yAxis.unit || "";

            const series = seriesMap[seriesId];

            unitMap.set(seriesId, initialUnit);
            row[seriesId] = {
                id: seriesId,
                series,
                year: isYear ? Number(bucketLabel) : bucketLabel,
                value: initialValue,
                unit: initialUnit,
                initialValue,
                initialUnit,
            };
        });

        if (isRelative) {
            // Per-unit baseline by first series (in chart order) for that unit and year
            const firstSeriesMap = new Map<Unit, number>();
            chart.series.forEach((series) => {
                const d = dataSeriesMap.get(series.id);
                const unit = d?.yAxis.unit || "";
                if (!firstSeriesMap.has(unit)) {
                    const v = d?.data.find((p) => String(p.x).trim() === bucketLabel)?.y ?? 0;
                    firstSeriesMap.set(unit, v);
                }
            });

            Object.keys(row).forEach((sid) => {
                const seriesId = sid as SeriesId;
                const payload = row[seriesId];
                const base = firstSeriesMap.get(payload.unit) ?? 0;

                if (base === 0 || !Number.isFinite(base)) {
                    warnings.push({
                        type: "auto_adjusted_value",
                        seriesId,
                        message: `Relative base is ${base}. Auto-set ${seriesId} to 0% for ${bucketLabel}.`,
                        value: { base, year: (row[seriesId] as any).year, unit: payload.initialUnit },
                    });
                    payload.value = 0;
                    payload.unit = "%";
                    unitMap.set(seriesId, "%");
                } else {
                    const computed = (payload.value / base) * 100;
                    if (!Number.isFinite(computed)) {
                        warnings.push({
                            type: "auto_adjusted_value",
                            seriesId,
                            message: `Computed relative value not finite (${bucketLabel}). Auto-set ${seriesId} to 0%.`,
                            value: { base, value: payload.value, year: (row[seriesId] as any).year },
                        });
                    }
                    payload.value = Number.isFinite(computed) ? computed : 0;
                    payload.unit = "%";
                    unitMap.set(seriesId, "%");
                }
            });
        }

        const dataPoint: TimeSeriesDataPoint = Object.assign(row, { year: isYear ? Number(bucketLabel) : bucketLabel });
        return dataPoint;
    });

    // Validate processed data points
    data.forEach((point, index) => {
        Object.keys(point).forEach(key => {
            if (key !== 'year') {
                const payload = point[key as SeriesId];
                if (payload && (typeof payload.value !== 'number' || !Number.isFinite(payload.value))) {
                    warnings.push({
                        type: 'invalid_y_value',
                        seriesId: key,
                        message: `Processed value is invalid for year ${point.year}. This may cause chart rendering issues.`,
                        pointIndex: index,
                        value: payload.value
                    });
                }
            }
        });
    });

    const validation: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings
    };

    return { data, unitMap, validation };
}

/**
 * Processes and validates aggregated data in a single pass.
 * Returns data, unit map, and complete validation results.
 */
export function convertToAggregatedData(
    dataSeriesMap: DataSeriesMap,
    chart: Chart
): ChartDataResult<DataPointPayload[]> {
    if (!chart || !dataSeriesMap) {
        return {
            data: [],
            unitMap: new Map<SeriesId, Unit>(),
            validation: { isValid: true, errors: [], warnings: [] }
        };
    }

    const enabledSeries = chart.series.filter((s) => s.enabled);

    const yearRange = chart.config.yearRange;
    const startYear = yearRange?.start ?? -Infinity;
    const endYear = yearRange?.end ?? Infinity;

    const unitMap = new Map<SeriesId, Unit>();
    const isRelative = chart.config.showRelativeValues ?? false;

    let firstSeriesValue = 1;
    const warnings: DataValidationError[] = [];
    const errors: DataValidationError[] = [];

    // Validate input data
    if (!enabledSeries.length) {
        warnings.push({
            type: 'empty_series',
            seriesId: 'chart',
            message: 'No enabled series available for aggregation. Enable at least one series.'
        });
    }

    const data = enabledSeries.map((series: Series, index: number) => {
        const dataSeries = dataSeriesMap.get(series.id);

        const points = dataSeries?.data ?? [];
        const totalValueRaw = points
            .filter((trend) => {
                const x = Number(trend.x);
                return Number.isFinite(x) && x >= startYear && x <= endYear;
            })
            .reduce((acc, trend) => acc + (Number.isFinite(trend.y) ? trend.y : 0), 0);

        if (!Number.isFinite(totalValueRaw)) {
            warnings.push({
                type: "invalid_aggregated_value",
                seriesId: series.id,
                message: `Invalid aggregated value auto-set to 0 for ${startYear}-${endYear}.`,
                value: totalValueRaw,
            });
        }

        const totalValue = Number.isFinite(totalValueRaw) ? totalValueRaw : 0;

        const initialValue = totalValue;
        const initialUnit = dataSeries?.yAxis.unit || "";
        let value = initialValue;
        let unit = initialUnit;

        if (isRelative && index === 0) {
            firstSeriesValue = totalValue;
        }
        if (isRelative) {
            if (firstSeriesValue === 0 || !Number.isFinite(firstSeriesValue)) {
                warnings.push({
                    type: "auto_adjusted_value",
                    seriesId: series.id,
                    message: `Relative base is ${firstSeriesValue}. Auto-set value to 0 for aggregated period ${startYear}-${endYear}.`,
                    value: { base: firstSeriesValue, total: totalValue },
                });
                value = 0;
            } else {
                const computed = (totalValue / firstSeriesValue) * 100;
                if (!Number.isFinite(computed)) {
                    warnings.push({
                        type: "auto_adjusted_value",
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

    // Validate final aggregated data
    data.forEach((point, index) => {
        if (typeof point.value !== 'number' || !Number.isFinite(point.value)) {
            warnings.push({
                type: 'invalid_aggregated_value',
                seriesId: point.id,
                message: `Final aggregated value is invalid. This will affect chart display.`,
                pointIndex: index,
                value: point.value
            });
        }
    });

    const validation: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings
    };

    return { data, unitMap, validation };
}
