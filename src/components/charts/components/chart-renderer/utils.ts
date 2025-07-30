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
