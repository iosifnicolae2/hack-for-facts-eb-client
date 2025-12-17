import { AnalyticsSeries } from "@/schemas/charts";

export type XAxisUnit = 'year' | 'quarter' | 'month' | 'unknown';

export function getXAxisUnit(dataSeriesMap: Map<string, AnalyticsSeries>): XAxisUnit {
    const firstSeries = dataSeriesMap.values().next().value as AnalyticsSeries | undefined;
    const unit = firstSeries?.xAxis?.unit?.toLowerCase?.() ?? '';
    if (unit === 'month') return 'month';
    if (unit === 'quarter') return 'quarter';
    // Fallback for empty or different unit
    return 'year';
}

export const parseQuarter = (x: string): { y: number | null; q: number | null } => {
    const v = String(x).trim().toUpperCase();
    // Formats: 'Q1', '2020-Q1', '1'
    let m = v.match(/^Q(\d)$/);
    if (m) {
        const q = Number(m[1]);
        if (q >= 1 && q <= 4) return { y: null, q };
        return { y: null, q: null };
    }
    m = v.match(/^(\d{4})-Q(\d)$/);
    if (m) {
        const q = Number(m[2]);
        if (q >= 1 && q <= 4) return { y: Number(m[1]), q };
        return { y: null, q: null };
    }
    const n = Number(v);
    if (Number.isFinite(n) && n >= 1 && n <= 4) return { y: null, q: n };
    return { y: null, q: null };
};

export const parseMonth = (x: string): { y: number | null; m: number | null } => {
    const v = String(x).trim();
    // ISO 'YYYY-MM'
    let m = v.match(/^(\d{4})-(\d{2})$/);
    if (m) return { y: Number(m[1]), m: Number(m[2]) };
    m = v.match(/^(\d{2})$/);
    if (m) return { y: null, m: Number(m[1]) };
    m = v.match(/^(\d)$/);
    if (m) return { y: null, m: Number(m[1]) };
    return { y: null, m: null };
};
