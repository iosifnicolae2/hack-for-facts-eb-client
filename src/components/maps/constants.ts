import { PathOptions, LatLngExpression, LatLngBoundsExpression } from 'leaflet';

export const DEFAULT_MAP_CENTER: LatLngExpression = [45.9432, 24.9668]; // Center of Romania
export const DEFAULT_MAP_ZOOM = 7;
export const DEFAULT_MIN_ZOOM = 6;
export const DEFAULT_MAX_ZOOM = 12;

// Romania bounding box
export const DEFAULT_MAX_BOUNDS: LatLngBoundsExpression = [
    [35.5, 20.0],
    [50.5, 30.0],
];

export const DEFAULT_FEATURE_STYLE: PathOptions = {
    color: '#cccccc', // Light gray border
    weight: 1,      // Small border
    opacity: 1,
    fillColor: '#f0f0f0', // Very light gray fill
    fillOpacity: 0.5,
};

export const HIGHLIGHT_FEATURE_STYLE: PathOptions = {
    weight: 3,
    color: '#666',
    fillOpacity: 0.7,
};

export const PERMANENT_HIGHLIGHT_STYLE: PathOptions = {
    weight: 3,
    dashArray: '10, 10',
    color: '#000000', // A distinct black color for the border  
};