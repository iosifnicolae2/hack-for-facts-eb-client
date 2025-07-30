import { Annotation, CircleSubject, Connector, EditableAnnotation, Label } from '@visx/annotation';
import { TAnnotation } from '@/schemas/charts';
import { AnnotationPositionChange } from './interfaces';

interface ChartAnnotationProps {
    annotation: TAnnotation;
    size: { width: number; height: number };
    globalEditable: boolean;
    onPositionChange: (pos: AnnotationPositionChange) => void;
}

export function ChartAnnotation({ annotation, size, globalEditable, onPositionChange }: ChartAnnotationProps) {
    if (size.width === 0 || size.height === 0) return null;

    if (!globalEditable && annotation.locked) {
        return (
            <Annotation
                key={annotation.id}
                x={annotation.pX * size.width}
                y={annotation.pY * size.height}
                dx={annotation.pXDelta * size.width}
                dy={annotation.pYDelta * size.height}
            >
                <Connector stroke={annotation.color} />
                <CircleSubject stroke={annotation.color} />
                <Label anchorLineStroke={annotation.color} title={annotation.title} subtitle={annotation.subtitle}></Label>
            </Annotation>
        )
    }

    return (
        <EditableAnnotation
            key={annotation.id}
            x={annotation.pX * size.width}
            y={annotation.pY * size.height}
            dx={annotation.pXDelta * size.width}
            dy={annotation.pYDelta * size.height}
            width={size.width}
            height={size.height}
            onDragEnd={({ x, y, dx, dy }) => {
                const pX = x / size.width;
                const pY = y / size.height;
                const pXDelta = dx / size.width;
                const pYDelta = dy / size.height;
                onPositionChange({ annotationId: annotation.id, position: { pX, pY, pXDelta, pYDelta } });
            }}
        >
            <Connector stroke={annotation.color} />
            <CircleSubject stroke={annotation.color} />
            <Label anchorLineStroke={annotation.color} title={annotation.title} subtitle={annotation.subtitle} />
        </EditableAnnotation>
    )
}