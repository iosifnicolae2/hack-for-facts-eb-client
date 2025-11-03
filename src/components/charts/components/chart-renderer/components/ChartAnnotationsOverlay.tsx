import { useEffect, useMemo, useRef, useState } from 'react';
import { Annotation, CircleSubject, Connector, EditableAnnotation, Label } from '@visx/annotation';
import { TAnnotation } from '@/schemas/charts';
import { AnnotationPositionChange, ChartMargins } from './interfaces';
import { applyAlpha } from '../utils';

interface ChartAnnotationsOverlayProps {
    annotations: readonly TAnnotation[];
    editable: boolean;
    onPositionChange: (pos: AnnotationPositionChange) => void;
    margins?: Partial<ChartMargins>;
}

export function ChartAnnotationsOverlay({ annotations, editable, onPositionChange, margins }: ChartAnnotationsOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    useEffect(() => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                setSize({ width, height });
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const actualMargins = useMemo<ChartMargins>(() => ({
        top: margins?.top ?? 0,
        right: margins?.right ?? 0,
        bottom: margins?.bottom ?? 0,
        left: margins?.left ?? 0,
    }), [margins]);

    const plotArea = useMemo(() => {
        const width = Math.max(0, size.width - actualMargins.left - actualMargins.right);
        const height = Math.max(0, size.height - actualMargins.top - actualMargins.bottom);
        return {
            x: actualMargins.left,
            y: actualMargins.top,
            width,
            height,
        };
    }, [size.width, size.height, actualMargins]);

    if (!annotations || annotations.length === 0) return null;

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: editable ? 'auto' : 'none' }}>
            {annotations.map((annotation) => {
                const xPos = annotation.pX * plotArea.width + plotArea.x;
                const yPos = annotation.pY * plotArea.height + plotArea.y;
                const xDelta = annotation.pXDelta * plotArea.width;
                const yDelta = annotation.pYDelta * plotArea.height;

                const content = (
                    <>
                        {annotation.connector && <Connector stroke={annotation.color} type={annotation.subject ? 'line' : 'elbow'} />}
                        {annotation.subject && <CircleSubject stroke={annotation.color} />}
                        {annotation.label && (
                            <Label
                                anchorLineStroke={annotation.color}
                                titleFontSize={14}
                                subtitleFontSize={12}
                                title={annotation.title}
                                subtitle={annotation.subtitle}
                                backgroundFill={applyAlpha(annotation.color, 0.1)}
                            />
                        )}
                    </>
                );

                if (!editable && annotation.locked) {
                    return (
                        <Annotation key={annotation.id} x={xPos} y={yPos} dx={xDelta} dy={yDelta}>
                            {content}
                        </Annotation>
                    );
                }

                return (
                    <EditableAnnotation
                        key={annotation.id}
                        x={xPos}
                        y={yPos}
                        dx={xDelta}
                        dy={yDelta}
                        width={size.width}
                        height={size.height}
                        onDragEnd={({ x, y, dx, dy }) => {
                            const pX = (x - plotArea.x) / plotArea.width;
                            const pY = (y - plotArea.y) / plotArea.height;
                            const pXDelta = dx / plotArea.width;
                            const pYDelta = dy / plotArea.height;
                            onPositionChange({ annotationId: annotation.id, position: { pX, pY, pXDelta, pYDelta } });
                        }}
                    >
                        {content}
                    </EditableAnnotation>
                );
            })}
        </div>
    );
}


