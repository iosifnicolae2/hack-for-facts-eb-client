import React from 'react';
import { HeatmapCountyDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { UatTopNBarChart } from './UatTopNBarChart';
import { UatPopulationSpendingScatterPlot } from './UatPopulationSpendingScatterPlot';
import { t } from '@lingui/core/macro';
import { useMapFilter } from '@/hooks/useMapFilter';

interface UatDataChartsProps {
    data: (HeatmapUATDataPoint | HeatmapCountyDataPoint)[];
    mapViewType: "UAT" | "County";
}

export const UatDataCharts: React.FC<UatDataChartsProps> = ({ data, mapViewType }) => {
    if (!data || data.length === 0) {
        return <p className="text-center text-muted-foreground">No data available to display charts.</p>;
    }

    const isUatView = mapViewType === 'UAT';
    const { mapState } = useMapFilter();
    const normalization = mapState.filters.normalization;

    return (
        <div className="space-y-8 p-4 md:p-6">
            <div className="p-4 border rounded-lg bg-card shadow-lg">
                <UatTopNBarChart
                    data={data}
                    valueKey="total_amount"
                    nameKey={isUatView ? "uat_name" : "county_name"}
                    topN={15}
                    chartTitle={isUatView ? t`Top 15 UATs by Total Amount` : t`Top 15 Counties by Total Amount`}
                    xAxisLabel={t`Amount`}
                    yAxisLabel={isUatView ? t`UAT` : t`County`}
                    isCurrency={true}
                    normalization={normalization}
                />
            </div>

            <div className="p-4 border rounded-lg bg-card shadow-lg">
                <UatPopulationSpendingScatterPlot
                    data={data}
                    chartTitle={t`Population vs. Total Amount`}
                    xAxisLabel={t`Population`}
                    yAxisLabel={t`Amount`}
                    normalization={normalization}
                />
            </div>

            {/* Removed county-level charts per request */}
        </div>
    );
};