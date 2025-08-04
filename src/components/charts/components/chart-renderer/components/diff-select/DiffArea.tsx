import { ReferenceArea } from "recharts";
import { DiffInfo, DiffLabel } from "./DiffLabel";

interface DiffAreaProps {
    yAxisId: string;
    refAreaLeft: number | string;
    refAreaRight: number | string;
    diffs: DiffInfo[];
}

export function DiffArea({ yAxisId, refAreaLeft, refAreaRight, diffs }: DiffAreaProps) {
    const primaryColor = "hsl(var(--primary))";

    return (
        <ReferenceArea
            yAxisId={yAxisId}
            x1={refAreaLeft}
            x2={refAreaRight}
            stroke={primaryColor}
            strokeDasharray="3 3"
            strokeOpacity={0.7}
            fill={primaryColor}
            fillOpacity={0.05}
            ifOverflow="visible"
            label={<DiffLabel data={diffs} start={refAreaLeft} end={refAreaRight} />}
        />
    )
}