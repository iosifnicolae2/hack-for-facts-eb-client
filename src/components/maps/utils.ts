import { HeatmapJudetDataPoint, HeatmapUATDataPoint } from "@/schemas/heatmap";
import { UatFeature, UatProperties } from './interfaces';
import { formatCurrency } from '@/lib/utils';
import { DEFAULT_FEATURE_STYLE } from './constants';


/**
 * Generates HTML content for a feature's tooltip.
 * Prioritizes data from heatmapData if available for the UAT.
 */
export const createTooltipContent = (
    properties: UatProperties,
    heatmapData: (HeatmapUATDataPoint | HeatmapJudetDataPoint)[] | undefined,
    mapViewType: 'UAT' | 'Judet'
): string => {
    const isUAT = mapViewType === 'UAT';
    const featureIdentifier = isUAT ? properties.natcode : properties.mnemonic;

    // Find data point
    const dataPoint = heatmapData?.find(d => {
        if (isUAT && 'siruta_code' in d) return d.siruta_code === featureIdentifier;
        if (!isUAT && 'county_code' in d) return d.county_code === featureIdentifier;
        return false;
    });

    if (dataPoint) {
        if (isUAT && 'siruta_code' in dataPoint) {
            return `
        <div>
          <strong>${dataPoint.uat_name || properties.name}</strong> (${dataPoint.siruta_code || featureIdentifier})<br/>
          Județ: ${dataPoint.county_name || properties.county || 'N/A'}<br/>
          Populație: ${dataPoint.population !== undefined && dataPoint.population !== null ? dataPoint.population.toLocaleString('ro-RO') : 'N/A'}<br/>
          Suma/Cap de locuitor: <strong>${formatCurrency(dataPoint.per_capita_amount, "compact")}</strong><br/>
          Suma totală: <strong>${formatCurrency(dataPoint.total_amount, "compact")}</strong>
        </div>
      `;
        } else if (!isUAT && 'county_code' in dataPoint) {
            const judetData = dataPoint as HeatmapJudetDataPoint;
            return `
        <div>
          <strong>${judetData.county_name || properties.name}</strong><br/>
          Populație: ${judetData.county_population !== undefined && judetData.county_population !== null ? judetData.county_population.toLocaleString('ro-RO') : 'N/A'}<br/>
          Suma/Cap de locuitor: <strong>${formatCurrency(judetData.per_capita_amount, "compact")}</strong><br/>
          Suma totală: <strong>${formatCurrency(judetData.total_amount, "compact")}</strong>
        </div>
      `;
        }
    }

    return `
    <div>
      <strong>${properties.name}</strong> (${featureIdentifier})<br/>
      ${isUAT ? `Județ: ${properties.county || 'N/A'}<br/>` : ''}
      <em style="font-size: 0.9em; color: #666;">No aggregated data available for current filters.</em>
    </div>
  `;
};


// Helper function to calculate percentile values
export const getPercentileValues = (
    data: (HeatmapUATDataPoint | HeatmapJudetDataPoint)[] | undefined,
    lowerPercentile: number,
    upperPercentile: number,
    valueKey: 'total_amount' | 'per_capita_amount'
): { min: number; max: number } => {
    if (!data || data.length === 0) {
        return { min: 0, max: 0 };
    }

    const amounts = data.map(d => {
        if (valueKey in d && typeof d[valueKey] === 'number') {
            return d[valueKey] as number;
        }
        return 0;
    }).sort((a, b) => a - b);


    const lowerIndex = Math.floor((lowerPercentile / 100) * (amounts.length - 1));
    const upperIndex = Math.ceil((upperPercentile / 100) * (amounts.length - 1));


    let min = amounts[lowerIndex];
    let max = amounts[upperIndex];

    if (min === max) {
        if (amounts.length > 0) {
            const actualMin = amounts[0];
            const actualMax = amounts[amounts.length - 1];
            if (actualMin === actualMax) {
                min = actualMin * 0.9;
                max = actualMax * 1.1;
                if (min === 0 && max === 0 && actualMin === 0) {
                    return { min: 0, max: 1 };
                }
            } else {
                min = actualMin;
                max = actualMax;
            }
        } else {
            return { min: 0, max: 1 };
        }
    }


    return {
        min,
        max,
    };
};

// Helper function to normalize a value within a given range
export const normalizeValue = (value: number, min: number, max: number): number => {
    if (max === min) {
        return value === 0 ? 0 : 0.5;
    }
    const clampedValue = Math.max(min, Math.min(value, max));
    return (clampedValue - min) / (max - min);
};

// Helper function to get a heatmap color (blue -> yellow -> red) for a normalized value (0-1)
const parseHsl = (hslColor: string): [number, number, number] | null => {
    const match = hslColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return null;
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
};

export const getHeatmapColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(1, value));
    const colors = [
        { stop: 0, color: 'hsl(60, 100%, 90%)' },    // Light Yellow
        { stop: 0.25, color: 'hsl(55, 100%, 75%)' }, // Yellow
        { stop: 0.5, color: 'hsl(40, 100%, 60%)' },    // Orange
        { stop: 0.75, color: 'hsl(20, 100%, 55%)' }, // Orange-Red
        { stop: 1, color: 'hsl(0, 100%, 50%)' },      // Red
    ];

    for (let i = 1; i < colors.length; i++) {
        if (clampedValue <= colors[i].stop) {
            const lower = colors[i - 1];
            const upper = colors[i];

            const lowerHsl = parseHsl(lower.color);
            const upperHsl = parseHsl(upper.color);

            if (!lowerHsl || !upperHsl) {
                return colors[0].color; // Fallback to a default color
            }

            const [h1, s1, l1] = lowerHsl;
            const [h2, s2, l2] = upperHsl;

            const range = upper.stop - lower.stop;
            const scaledValue = (clampedValue - lower.stop) / range;

            const h = h1 + (h2 - h1) * scaledValue;
            const s = s1 + (s2 - s1) * scaledValue;
            const l = l1 + (l2 - l1) * scaledValue;

            return `hsl(${h}, ${s}%, ${l}%)`;
        }
    }
    return colors[colors.length - 1].color;
};


export const createHeatmapStyleFunction = (
    heatmapData: (HeatmapUATDataPoint | HeatmapJudetDataPoint)[] | undefined,
    min: number,
    max: number,
    mapViewType: 'UAT' | 'Judet',
    valueKey: 'total_amount' | 'per_capita_amount'
): ((feature: UatFeature) => L.PathOptions) => {

    return (feature: UatFeature) => {
        if (!feature || !feature.properties) {
            return DEFAULT_FEATURE_STYLE;
        }

        const isUAT = mapViewType === 'UAT';
        const featureKey = isUAT ? feature.properties.natcode : feature.properties.mnemonic;

        if (!heatmapData) {
            return DEFAULT_FEATURE_STYLE;
        }

        const dataPoint = heatmapData.find(d => {
            if (isUAT && 'siruta_code' in d) return d.siruta_code === featureKey;
            if (!isUAT && 'county_code' in d) return d.county_code === featureKey;
            return false;
        });

        if (!dataPoint) {
            return { ...DEFAULT_FEATURE_STYLE, fillOpacity: 0.1, fillColor: "#cccccc" };
        }

        const value = (valueKey in dataPoint && typeof dataPoint[valueKey] === 'number') ? dataPoint[valueKey] : 0;

        if (min === max) {
            const style = {
                ...DEFAULT_FEATURE_STYLE,
                fillColor: value !== 0 ? getHeatmapColor(0.5) : DEFAULT_FEATURE_STYLE.fillColor,
                fillOpacity: 0.7,
            };
            return style;
        }

        const normalized = normalizeValue(value, min, max);
        const color = getHeatmapColor(normalized);
        const finalStyle = {
            ...DEFAULT_FEATURE_STYLE,
            fillColor: color,
            fillOpacity: 0.7,
        };

        return finalStyle;
    };
};

