/**
 * Color utility functions for charts.
 * This file is intentionally separate from utils.ts to avoid circular dependencies
 * with schemas/charts.ts which needs generateRandomColor at module initialization.
 */

/**
 * Apply an alpha (opacity) to a CSS color string.
 * Supports:
 *  - Hex:        #RGB, #RRGGBB, #RGBA, #RRGGBBAA
 *  - RGB/RGBA:   rgb(…, …, …), rgba(…, …, …, …)
 *  - HSL/HSLA:   hsl(…, …%, …%), hsla(…, …%, …%, …)
 */
export function applyAlpha(color: string, opacity: number): string {
    opacity = Math.max(0, Math.min(1, opacity));

    // HEX
    const hexFull = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;
    const hexShort = /^#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])?$/i;
    let m: RegExpExecArray | null;

    if ((m = hexFull.exec(color))) {
        const hex = m[1];
        const aa = m[2];
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const existingA = aa ? parseInt(aa, 16) / 255 : 1;
        return `rgba(${r}, ${g}, ${b}, ${existingA * opacity})`;
    }
    if ((m = hexShort.exec(color))) {
        // #RGBA or #RGB
        const r = parseInt(m[1] + m[1], 16);
        const g = parseInt(m[2] + m[2], 16);
        const b = parseInt(m[3] + m[3], 16);
        const existingA = m[4] ? parseInt(m[4] + m[4], 16) / 255 : 1;
        return `rgba(${r}, ${g}, ${b}, ${existingA * opacity})`;
    }

    // RGB[A]
    const rgb = /^rgba?\(\s*([\d.]+)(%?)\s*,\s*([\d.]+)(%?)\s*,\s*([\d.]+)(%?)(?:\s*,\s*([\d.]+)\s*)?\)$/i.exec(color);
    if (rgb) {
        const [, rStr, rPct, gStr, gPct, bStr, bPct, aStr] = rgb;
        const r = rPct ? Math.round(+rStr * 2.55) : +rStr;
        const g = gPct ? Math.round(+gStr * 2.55) : +gStr;
        const b = bPct ? Math.round(+bStr * 2.55) : +bStr;
        const existingA = aStr != null ? +aStr : 1;
        return `rgba(${r}, ${g}, ${b}, ${existingA * opacity})`;
    }

    // HSL[A]
    const hsl = /^hsla?\(\s*([\d.]+)(deg|rad|turn)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(color);
    if (hsl) {
        const [, hStr, unit, sStr, lStr, aStr] = hsl;
        let h = +hStr;
        if (unit === 'rad') h = h * (180 / Math.PI);
        else if (unit === 'turn') h = h * 360;
        // normalize
        h = ((h % 360) + 360) % 360;
        const s = +sStr;
        const l = +lStr;
        const existingA = aStr != null ? +aStr : 1;
        return `hsla(${h.toFixed(2)}, ${s}%, ${l}%, ${(existingA * opacity).toFixed(3)})`;
    }

    // Fallback: wrap in rgba() and hope the browser parses it
    return `rgba(${color} , ${opacity})`;
}

/**
 * Converts an HSL or HSLA color string to its HEX representation.
 * @param hslString The HSL color string (e.g., "hsl(120, 100%, 50%)").
 * @returns The HEX color string (e.g., "#00ff00"). Returns the original string if parsing fails.
 */
export function hslToHex(hslString: string): string {
    // Regex to parse HSL and HSLA values from a string.
    const hslMatch = /^hsla?\(\s*([\d.]+)(?:deg|rad|turn)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*[\d.]+)?\s*\)$/i.exec(hslString);

    if (!hslMatch) {
        // If the string doesn't match, return it as is.
        return hslString;
    }

    const [, hStr, sStr, lStr] = hslMatch;

    const h = parseFloat(hStr);
    let s = parseFloat(sStr);
    let l = parseFloat(lStr);

    // Convert percentages to decimals
    s /= 100;
    l /= 100;

    // The conversion formula
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
        r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
        r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
        r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
        r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
        r = x; g = 0; b = c;
    } else if (h >= 300 && h < 360) {
        r = c; g = 0; b = x;
    }

    // Convert RGB to HEX
    const toHex = (n: number) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    const red = toHex(r);
    const green = toHex(g);
    const blue = toHex(b);

    return `#${red}${green}${blue}`;
}

/**
 * Generates a random color suitable for use in charts and data visualizations.
 * Uses the HSL color model to create colors that are visually appealing and distinct.
 * @returns A color string in HEX format, e.g., "#3b82f6".
 */
export function generateRandomColor(): string {
    // To generate visually pleasing and distinct colors, we use the HSL model.
    // We'll keep saturation and lightness within a specific range to avoid
    // colors that are too jarring or too washed out.

    // Hue: 0-360 (any color on the wheel)
    const h = Math.floor(Math.random() * 360);

    // Saturation: 70% - 90% for rich, but not overly saturated colors.
    const s = Math.floor(Math.random() * 21) + 70; // Random number between 70 and 90

    // Lightness: 50% - 60% to ensure good visibility and contrast.
    // This range avoids colors that are too dark or too light.
    const l = Math.floor(Math.random() * 11) + 50; // Random number between 50 and 60

    const hlsColor = `hsl(${h}, ${s}%, ${l}%)`;
    return hslToHex(hlsColor);
}

/**
 * Get a color for a series based on its index.
 * @param index The index of the series.
 * @returns A color string in HEX format. The colors are selected to be visually distinct.
 */
export const getSeriesColor = (index: number) => {
    const colors = [
        '#3B82F6', '#F97316', '#10B981', '#EC4899', '#8B5CF6',
        '#EAB308', '#06B6D4', '#EF4444', '#1D4ED8', '#CA8A04',
        '#059669', '#DB2777', '#6D28D9', '#B91C1C', '#60A5FA',
        '#22C55E', '#F59E0B', '#84CC16', '#475569', '#A16207'
    ];
    return colors[index % colors.length];
}
