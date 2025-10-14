import L from 'leaflet';
import { Feature, Geometry, Polygon, MultiPolygon } from 'geojson';
import { HeatmapCountyDataPoint, HeatmapUATDataPoint } from '@/schemas/heatmap';
import { formatNumber } from '@/lib/utils';

export interface PolygonLabelData {
  text: string;
  amount?: string;
  position: [number, number]; // [lat, lng]
  bounds: L.LatLngBounds;
  area: number;
  fontSize: number;
  visible: boolean;
  showAmount: boolean;
  featureId: string;
}

// Zoom thresholds
export const ZOOM_THRESHOLDS = {
  UAT_NAME_MIN: 9,        // Show UAT names at zoom 9+
  UAT_AMOUNT_MIN: 11,     // Show UAT amounts at zoom 11+
  COUNTY_AMOUNT_MIN: 0,   // Show county amounts at all zoom levels
};

/**
 * Calculate the centroid of a polygon using the geometric center
 * Optimized: uses simple average instead of complex centroid calculation
 */
export function calculatePolygonCentroid(coordinates: number[][][]): [number, number] | null {
  if (!coordinates || coordinates.length === 0) return null;

  const polygon = coordinates[0]; // Use outer ring
  let sumLat = 0;
  let sumLng = 0;
  const count = polygon.length;

  for (let i = 0; i < count; i++) {
    sumLng += polygon[i][0];
    sumLat += polygon[i][1];
  }

  if (count === 0) return null;
  return [sumLat / count, sumLng / count];
}

/**
 * Calculate the area of a polygon in screen pixels at current zoom level
 * Cached result to avoid recalculation
 */
export function calculatePolygonScreenArea(bounds: L.LatLngBounds, map: L.Map): number {
  const ne = map.latLngToContainerPoint(bounds.getNorthEast());
  const sw = map.latLngToContainerPoint(bounds.getSouthWest());

  const width = Math.abs(ne.x - sw.x);
  const height = Math.abs(ne.y - sw.y);

  return width * height;
}

/**
 * Get appropriate font size based on polygon area and zoom level
 */
export function calculateFontSize(screenArea: number, zoom: number, baseSize: number = 12): number {
  // Simplified calculation for performance
  const areaFactor = Math.sqrt(screenArea) / 100;
  const zoomFactor = Math.pow(1.15, zoom - 7);

  const calculatedSize = baseSize * areaFactor * zoomFactor;

  // Clamp between min and max sizes
  return Math.max(9, Math.min(20, calculatedSize));
}

/**
 * Calculate font size based on population value to create visual hierarchy
 * Higher population areas get larger, more prominent labels
 */
export function calculateFontSizeByValue(
  value: number,
  maxValue: number,
  zoom: number,
  mapViewType: 'UAT' | 'County'
): number {
  // Base font sizes - smaller for counties, good size for UATs
  const minFontSize = mapViewType === 'County' ? 11 : 12;
  const maxFontSize = mapViewType === 'County' ? 20 : 28;

  // Zoom factor to scale fonts at different zoom levels
  const zoomFactor = Math.pow(1.15, zoom - (mapViewType === 'County' ? 6 : 9));

  // Normalize the value to 0-1 range
  const normalizedValue = maxValue > 0 ? value / maxValue : 0;

  // Use square root for better distribution (prevents extreme size differences)
  const scaleFactor = Math.sqrt(normalizedValue);

  // Calculate font size
  const baseSize = minFontSize + (maxFontSize - minFontSize) * scaleFactor;
  const calculatedSize = baseSize * zoomFactor;

  // Clamp to reasonable bounds
  return Math.max(minFontSize, Math.min(maxFontSize * 1.3, calculatedSize));
}

/**
 * Abbreviate long names to fit in smaller polygons
 */
export function abbreviateName(name: string, maxLength: number = 15): string {
  if (name.length <= maxLength) return name;

  // Try to abbreviate common words
  const abbreviations: Record<string, string> = {
    'Municipiul': 'Mun.',
    'Orașul': 'Or.',
    'Oraş': 'Or.',
    'Comuna': 'Com.',
    'Judeţul': 'Jud.',
    'Județul': 'Jud.',
  };

  let abbreviated = name;
  for (const [full, abbr] of Object.entries(abbreviations)) {
    abbreviated = abbreviated.replace(new RegExp(`^${full}\\s+`, 'i'), abbr + ' ');
  }

  // If still too long, truncate with ellipsis
  if (abbreviated.length > maxLength) {
    return abbreviated.substring(0, maxLength - 1) + '…';
  }

  return abbreviated;
}

/**
 * Calculate text width in pixels (approximate)
 */
export function estimateTextWidth(text: string, fontSize: number): number {
  // Rough approximation: average character width is ~0.6 * font size
  return text.length * fontSize * 0.6;
}

/**
 * Check if label fits within polygon bounds at current zoom
 */
export function doesLabelFit(
  text: string,
  fontSize: number,
  bounds: L.LatLngBounds,
  map: L.Map,
  withAmount: boolean = false
): boolean {
  const textWidth = estimateTextWidth(text, fontSize);
  const textHeight = fontSize * (withAmount ? 2.5 : 1.2); // More height if showing amount

  const ne = map.latLngToContainerPoint(bounds.getNorthEast());
  const sw = map.latLngToContainerPoint(bounds.getSouthWest());

  const boundsWidth = Math.abs(ne.x - sw.x);
  const boundsHeight = Math.abs(ne.y - sw.y);

  return textWidth <= boundsWidth * 0.8 && textHeight <= boundsHeight * 0.8;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number): string {
  return formatNumber(amount, 'compact');
}

/**
 * Get heatmap data for a feature
 */
export function getFeatureHeatmapData(
  feature: Feature<Geometry, any>,
  heatmapDataMap: Map<string | number, HeatmapUATDataPoint | HeatmapCountyDataPoint>
): HeatmapUATDataPoint | HeatmapCountyDataPoint | undefined {
  const properties = feature.properties;
  if (!properties) return undefined;

  // Try multiple keys due to varying data sources
  const candidates = [properties.natcode, properties.mnemonic, properties.siruta_code, properties.uat_code]
    .filter(Boolean) as Array<string | number>;
  for (const key of candidates) {
    const found = heatmapDataMap.get(key);
    if (found) return found;
  }
  return undefined;
}

/**
 * Process a feature to extract label data
 * Optimized: minimal calculations, early returns
 */
export function processFeatureForLabel(
  feature: Feature<Geometry, any>,
  map: L.Map,
  zoom: number,
  mapViewType: 'UAT' | 'County',
  heatmapDataMap: Map<string | number, HeatmapUATDataPoint | HeatmapCountyDataPoint>,
  normalization: 'per_capita' | 'total',
  maxValue?: number
): PolygonLabelData | null {
  const properties = feature.properties;
  if (!properties) return null;

  const name = properties.name || properties.mnemonic || '';
  if (!name) return null;

  const featureId = properties.natcode || properties.mnemonic || '';

  // Early return based on zoom thresholds
  const isCounty = mapViewType === 'County';
  const isUAT = mapViewType === 'UAT';

  if (isUAT && zoom < ZOOM_THRESHOLDS.UAT_NAME_MIN) {
    return null; // Don't process UAT labels at low zoom
  }

  const geometry = feature.geometry;
  let coordinates: number[][][];
  let allCoordinates: number[][][] = [];

  if (geometry.type === 'Polygon') {
    coordinates = (geometry as Polygon).coordinates;
    allCoordinates = [coordinates[0]];
  } else if (geometry.type === 'MultiPolygon') {
    const multiCoords = (geometry as MultiPolygon).coordinates;
    // Find the largest polygon in the MultiPolygon
    coordinates = multiCoords.reduce((largest, current) => {
      return current[0].length > largest[0].length ? current : largest;
    }, multiCoords[0]);
    allCoordinates = multiCoords.map(c => c[0]);
  } else {
    return null;
  }

  const centroid = calculatePolygonCentroid(coordinates);
  if (!centroid) return null;

  // Calculate bounds from all coordinates (optimized: reuse latLngs array)
  const latLngs: L.LatLng[] = [];
  for (const coords of allCoordinates) {
    for (const coord of coords) {
      latLngs.push(L.latLng(coord[1], coord[0]));
    }
  }
  const bounds = L.latLngBounds(latLngs);

  const screenArea = calculatePolygonScreenArea(bounds, map);

  // Get heatmap data for both population and amount
  const heatmapData = getFeatureHeatmapData(feature, heatmapDataMap);
  const amountValue = heatmapData
    ? (normalization === 'per_capita' ? heatmapData.per_capita_amount : heatmapData.total_amount)
    : null;

  // Don't show labels without amount data
  if (amountValue === null || amountValue === undefined) {
    return null;
  }

  // Get population for font size calculation
  const population = heatmapData
    ? (isCounty
      ? (heatmapData as any).county_population
      : (heatmapData as any).population)
    : null;

  // Calculate font size based on population for better visual hierarchy
  // If maxValue (max population) is not provided, fall back to area-based calculation
  let fontSize: number;
  if (maxValue !== undefined && maxValue > 0 && population) {
    fontSize = calculateFontSizeByValue(population, maxValue, zoom, mapViewType);
  } else {
    // Fallback to area-based calculation with minimum sizes
    fontSize = calculateFontSize(screenArea, zoom);
    if (isCounty) {
      fontSize = Math.max(11, fontSize * 0.85);
    } else {
      fontSize = Math.max(12, fontSize);
    }
  }

  // Determine if we should show amount based on zoom
  const showAmount = isCounty
    ? zoom >= ZOOM_THRESHOLDS.COUNTY_AMOUNT_MIN
    : zoom >= ZOOM_THRESHOLDS.UAT_NAME_MIN;

  // Use full name without truncation - just adjust font size to fit
  let displayText = name;
  let fits = doesLabelFit(displayText, fontSize, bounds, map, showAmount);

  // If doesn't fit, reduce font size progressively
  if (!fits) {
    let trialFontSize = fontSize;
    const minFontSize = isCounty ? 9 : 8;
    while (trialFontSize > minFontSize && !doesLabelFit(displayText, trialFontSize, bounds, map, showAmount)) {
      trialFontSize -= 0.5;
    }
    fontSize = Math.max(minFontSize, trialFontSize);
    fits = doesLabelFit(displayText, fontSize, bounds, map, showAmount);
  }

  // Show all labels that have amount data, regardless of fit
  const visible = true;

  return {
    text: displayText,
    amount: showAmount && amountValue !== null && amountValue !== undefined ? formatAmount(amountValue) : undefined,
    position: centroid,
    bounds,
    area: screenArea,
    fontSize,
    visible,
    showAmount,
    featureId,
  };
}
