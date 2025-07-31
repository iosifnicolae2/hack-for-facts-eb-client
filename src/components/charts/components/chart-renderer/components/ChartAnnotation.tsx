import { Annotation, CircleSubject, Connector, EditableAnnotation, Label } from '@visx/annotation';
import { TAnnotation } from '@/schemas/charts';
import { AnnotationPositionChange } from './interfaces';
import { useChartHeight, useChartWidth, usePlotArea } from 'recharts';
import { applyAlpha } from '../utils';

interface ChartAnnotationProps {
    annotation: TAnnotation;
    globalEditable: boolean;
    onPositionChange: (pos: AnnotationPositionChange) => void;
}

export function ChartAnnotation({ annotation, globalEditable, onPositionChange }: ChartAnnotationProps) {

    const chartWidth = useChartWidth();
    const chartHeight = useChartHeight();
    const plotArea = usePlotArea();

    if (!plotArea || !chartWidth || !chartHeight) return null;

    const xPos = annotation.pX * plotArea.width + plotArea.x;
    const yPos = annotation.pY * plotArea.height + plotArea.y;
    const xDelta = annotation.pXDelta * plotArea.width;
    const yDelta = annotation.pYDelta * plotArea.height;

    if (!globalEditable && annotation.locked) {
        return (
            <Annotation
                key={annotation.id}
                x={xPos}
                y={yPos}
                dx={xDelta}
                dy={yDelta}
            >
                <AnnotationContent annotation={annotation} />
            </Annotation>
        )
    }

    return (
        <EditableAnnotation
            key={annotation.id}
            x={xPos}
            y={yPos}
            dx={xDelta}
            dy={yDelta}
            width={chartWidth}
            height={chartHeight}
            onDragEnd={({ x, y, dx, dy }) => {
                const pX = (x - plotArea.x) / plotArea.width;
                const pY = (y - plotArea.y) / plotArea.height;
                const pXDelta = dx / plotArea.width;
                const pYDelta = dy / plotArea.height;
                onPositionChange({ annotationId: annotation.id, position: { pX, pY, pXDelta, pYDelta } });
            }}
        >
            <AnnotationContent annotation={annotation} />
        </EditableAnnotation>
    )
}


const AnnotationContent = ({ annotation }: { annotation: TAnnotation }) => {
    return (
        <>
            {annotation.connector && <Connector stroke={annotation.color} type={annotation.subject ? 'line' : 'elbow'} />}
            {annotation.subject && <CircleSubject stroke={annotation.color} />}
            {annotation.label && <Label
                anchorLineStroke={annotation.color}
                titleFontSize={14}
                subtitleFontSize={12}
                title={annotation.title}
                subtitle={annotation.subtitle}
                backgroundFill={applyAlpha(annotation.color, 0.1)}
            />}
        </>
    )
}