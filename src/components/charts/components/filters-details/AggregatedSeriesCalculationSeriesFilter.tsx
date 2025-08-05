import { Operand, SeriesGroupConfiguration, Chart } from "@/schemas/charts";
import { FilterPill } from "./FilterPill";
import { useMemo } from "react";
import { FilterValueDisplay } from "./FilterValueDisplay";

interface AggregatedSeriesCalculationSeriesFilterProps {
    series: SeriesGroupConfiguration;
    chart: Chart;
}

export function AggregatedSeriesCalculationSeriesFilter({ series, chart }: AggregatedSeriesCalculationSeriesFilterProps) {
    const seriesIdMapToLabel = useMemo(() => {
        return chart.series.reduce((acc, s) => {
            acc[s.id] = s.label;
            return acc;
        }, {} as Record<string, string>);
    }, [chart.series]);

    const formatOperand = (operand: Operand): string => {
        if (typeof operand === 'number') {
            return String(operand);
        } else if (typeof operand === 'string') {
            return seriesIdMapToLabel[operand] || operand;
        } else if (operand.op && operand.args) {
            const op = operand.op === 'sum' ? '+' : operand.op === 'subtract' ? '-' : operand.op === 'multiply' ? '*' : '/';
            return `(${operand.args.map(formatOperand).join(` ${op} `)})`;
        }
        return String(operand);
    };

    const calculationString = formatOperand(series.calculation);

    return (
        <div className="flex flex-wrap gap-2">
            <FilterPill label="Calculation" value={<FilterValueDisplay value={calculationString} />} />
        </div>
    );
}