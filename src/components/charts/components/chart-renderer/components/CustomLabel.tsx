import { SeriesConfiguration } from "@/schemas/charts";
import { formatCurrency, formatNumberRO } from "@/lib/utils";

type CustomLabelProps = {
    x?: number;
    y?: number;
    value?: number | string;
    series: SeriesConfiguration;
    getSeriesColor: (seriesId: string, opacity?: number) => string;
    isRelative: boolean;
};

const dataLabelFormatter = (value: number, isRelative: boolean) => {
    if (isRelative) {
        return `${formatNumberRO(value)}%`;
    }
    return formatCurrency(value, "compact");
};

export const CustomLabel = (props: CustomLabelProps) => {
    const { x, y, value, series, getSeriesColor, isRelative } = props;

    if (x === undefined || y === undefined || value === undefined) {
        return null;
    }

    return (
        <g>
            <text
                x={x}
                y={y}
                dy={-10}
                fill={getSeriesColor(series.id)}
                fontSize={12}
                textAnchor="middle"
            >
                {dataLabelFormatter(Number(value), isRelative)}
            </text>
        </g>
    );
};
