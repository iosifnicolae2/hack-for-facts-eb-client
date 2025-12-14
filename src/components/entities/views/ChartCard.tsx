import React, { useCallback, useMemo } from 'react';
import { Chart } from '@/schemas/charts';
import { useChartData, convertToTimeSeriesData, convertToAggregatedData } from '@/components/charts/hooks/useChartData';
import { ChartDisplayArea } from '@/components/charts/components/chart-view/ChartDisplayArea';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Trans } from '@lingui/react/macro';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { NormalizationOptions } from '@/lib/normalization';
import { NormalizationModeSelect } from '@/components/normalization/normalization-mode-select';

interface ChartCardProps {
    chart: Chart;
    currentYear?: number;
    onYearClick?: (year: number) => void;
    onXAxisItemClick?: (value: number | string) => void;
    xAxisMarker?: number | string;
    normalizationOptions: NormalizationOptions;
    onNormalizationChange: (next: NormalizationOptions) => void;
    allowPerCapita?: boolean;
}

export const ChartCard = React.memo(({ chart, onYearClick, onXAxisItemClick, currentYear, xAxisMarker, normalizationOptions, onNormalizationChange, allowPerCapita = false }: ChartCardProps) => {
    const { dataSeriesMap, isLoadingData, dataError } = useChartData({ chart });
    const { data: timeSeriesData, unitMap: timeSeriesUnitMap } = useMemo(() => convertToTimeSeriesData(dataSeriesMap!, chart), [dataSeriesMap, chart]);
    const { data: aggregatedData, unitMap: aggregatedUnitMap } = useMemo(() => convertToAggregatedData(dataSeriesMap!, chart), [dataSeriesMap, chart]);

    const getChartState = useMemo(() => ({
        ...chart,
        config: {
            ...chart.config,
            showTooltip: true,
            showLegend: true,
        }
    }), [chart]);

    const handleXAxisClick = useCallback((value: number | string) => {
        if (onXAxisItemClick) {
            onXAxisItemClick(value);
            return;
        }
        const year = Number(value);
        const isValidYear = !isNaN(year) && year > 1900 && year < 2100;
        if (isValidYear) onYearClick?.(year);
    }, [onXAxisItemClick, onYearClick]);

    const noop = useCallback(() => { }, []);
    const showPeriodGrowth = Boolean(normalizationOptions.show_period_growth)

    return (
        <Card>
            <CardDescription className="sr-only">{chart.description}</CardDescription>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-4">
                <Button asChild variant="outline" size="sm">
                    <Link to={`/charts/$chartId`} params={{ chartId: chart.id }} search={{ chart: getChartState }} preload="intent">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        <Trans>Open in Chart Editor</Trans>
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <Checkbox
                        id={`growth-${chart.id}`}
                        checked={showPeriodGrowth}
                        onCheckedChange={(checked) => {
                            onNormalizationChange({
                                ...normalizationOptions,
                                show_period_growth: Boolean(checked),
                            })
                        }}
                    />
                    <Label htmlFor={`growth-${chart.id}`} className="text-xs text-muted-foreground cursor-pointer">
                        <Trans>Show growth (%)</Trans>
                    </Label>
                    <NormalizationModeSelect
                        value={normalizationOptions.normalization}
                        allowPerCapita={allowPerCapita}
                        onChange={(nextNormalization) => {
                            onNormalizationChange({
                                ...normalizationOptions,
                                normalization: nextNormalization,
                                inflation_adjusted: nextNormalization === 'percent_gdp' ? false : normalizationOptions.inflation_adjusted,
                            })
                        }}
                        triggerClassName="h-8 text-xs"
                        className="w-[180px]"
                    />
                </div>
            </CardHeader>
            <CardContent>
                <div>
                    <ChartDisplayArea
                        chart={chart}
                        timeSeriesData={timeSeriesData}
                        aggregatedData={aggregatedData}
                        dataMap={dataSeriesMap}
                        unitMap={timeSeriesUnitMap || aggregatedUnitMap}
                        isLoading={isLoadingData}
                        error={dataError}
                        onAddSeries={noop}
                        onAnnotationPositionChange={noop}
                        onXAxisClick={handleXAxisClick}
                        xAxisMarker={xAxisMarker ?? currentYear}
                    />
                </div>
            </CardContent>
        </Card >
    );
});
