import React, { useCallback, useMemo } from 'react';
import { Chart, Normalization } from '@/schemas/charts';
import { useChartData, convertToTimeSeriesData, convertToAggregatedData } from '@/components/charts/hooks/useChartData';
import { ChartDisplayArea } from '@/components/charts/components/chart-view/ChartDisplayArea';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Trans } from '@lingui/react/macro';
import { NormalizationSelector } from '@/components/common/NormalizationSelector';

interface ChartCardProps {
    chart: Chart;
    currentYear?: number;
    onYearClick?: (year: number) => void;
    normalization: Normalization;
    onNormalizationChange: (normalization: Normalization) => void;
}

export const ChartCard = React.memo(({ chart, onYearClick, currentYear, normalization, onNormalizationChange }: ChartCardProps) => {
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
        const year = Number(value);
        const isValidYear = !isNaN(year) && year > 1900 && year < 2100;
        if (isValidYear) {
            onYearClick?.(year);
        }
    }, [onYearClick]);

    const noop = useCallback(() => { }, []);

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
                <NormalizationSelector value={normalization} onChange={onNormalizationChange} />
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
                        xAxisMarker={currentYear}
                    />
                </div>
            </CardContent>
        </Card >
    );
});

