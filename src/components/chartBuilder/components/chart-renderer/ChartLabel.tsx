import { Props as LabelProps } from "recharts/types/component/Label";
import { SeriesConfiguration } from "@/schemas/charts";

interface ChartLabelProps extends LabelProps {
    series: SeriesConfiguration
    dataLabelFormatter: (value: number, isRelative: boolean) => string;
    getSeriesColor: (seriesId: string, opacity?: number) => string;
    isRelative: boolean;
}

export function ChartLabel(props: ChartLabelProps) {
    const { x, y, value, offset, width, series, dataLabelFormatter, getSeriesColor, isRelative } = props;
    const xValue = isNaN(Number(x)) ? 0 : Number(x);
    const yValue = isNaN(Number(y)) ? 0 : Number(y);
    const offsetValue = isNaN(Number(offset)) ? 0 : Number(offset);
    const formattedValue = dataLabelFormatter(Number(value), isRelative);
    const chartItemWidth = isNaN(Number(width)) ? 0 : Number(width);

    const increaseFactor = 7;
    const labelWidth = formattedValue.length > 6 ? formattedValue.length * increaseFactor : 50;
    return (
        <g>
            <rect
                x={xValue - labelWidth / 2 + chartItemWidth / 2}
                y={yValue - offsetValue}
                width={labelWidth}
                height={20}
                fill={getSeriesColor(series.id, 0.2)}
                rx={4}
                opacity={0.9}
            />
            <text
                x={xValue + chartItemWidth / 2}
                y={yValue - offsetValue + 12}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#000"
                fontSize="10px"
                fontWeight="bold"
            >
                {formattedValue}
            </text>
        </g>
    );
}
