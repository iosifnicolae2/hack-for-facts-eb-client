export interface AnnotationPosition {
    pX: number;
    pY: number;
    pXDelta: number;
    pYDelta: number;
}

export interface AnnotationPositionChange {
    annotationId: string;
    position: AnnotationPosition;
}