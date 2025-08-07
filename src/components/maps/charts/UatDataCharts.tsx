import React from 'react';
import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { UatTopNBarChart } from './UatTopNBarChart';
import { UatCountyBarChart } from './UatCountyBarChart';
import { UatPopulationSpendingScatterPlot } from './UatPopulationSpendingScatterPlot';
import { UatAverageSpendingCountyChart } from './UatAverageSpendingCountyChart';
import { useMapFilter } from '@/lib/hooks/useMapFilterStore';

interface UatDataChartsProps {
    data: (HeatmapUATDataPoint | HeatmapJudetDataPoint)[];
}

export const UatDataCharts: React.FC<UatDataChartsProps> = ({ data }) => {
    const { mapViewType } = useMapFilter();
    if (!data || data.length === 0) {
        return <p className="text-center text-muted-foreground">No data available to display charts.</p>;
    }

    const isUatView = mapViewType === 'UAT';

    return (
        <div className="space-y-8 p-4 md:p-6">
            <div className="p-4 border rounded-lg bg-card shadow-lg">
                <UatTopNBarChart
                    data={data}
                    valueKey="total_amount"
                    nameKey={isUatView ? "uat_name" : "county_name"}
                    topN={15}
                    chartTitle={isUatView ? "Top 15 UAT-uri după suma totală" : "Top 15 județe după suma totală"}
                    xAxisLabel="Suma"
                    yAxisLabel={isUatView ? "UAT" : "Județ"}
                    isCurrency={true}
                />
            </div>

            <div className="p-4 border rounded-lg bg-card shadow-lg">
                <UatPopulationSpendingScatterPlot
                    data={data}
                    chartTitle="Populație vs. Suma Totală"
                    xAxisLabel="Populație"
                    yAxisLabel="Suma"
                />
            </div>

            {isUatView && (
                <>
                    <div className="p-4 border rounded-lg bg-card shadow-lg">
                        <UatCountyBarChart
                            data={data as HeatmapUATDataPoint[]}
                            chartTitle="Suma totală pe județ"
                            xAxisLabel="Județ"
                            yAxisLabel="Suma totală"
                        />
                    </div>

                    <div className="p-4 border rounded-lg bg-card shadow-lg">
                        <UatAverageSpendingCountyChart
                            data={data as HeatmapUATDataPoint[]}
                            chartTitle="Suma medie per UAT pe județ"
                            xAxisLabel="Județ"
                            yAxisLabel="Suma medie"
                        />
                    </div>
                </>
            )}
        </div>
    );
};
 