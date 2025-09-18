import { ReportPeriodInput, PeriodDate } from "@/schemas/reporting";

export type PeriodTag = {
    key: string;
    label: string;
    value: PeriodDate | string;
    isInterval?: boolean;
};

export function getPeriodTags(period: ReportPeriodInput | undefined): PeriodTag[] {
    if (!period) return [];

    if (period.selection.dates && period.selection.dates.length > 0) {
        return period.selection.dates.map(date => ({
            key: `period_date_${date}`,
            label: period.type,
            value: date,
        }));
    }

    if (period.selection.interval) {
        const { start, end } = period.selection.interval;
        if (!start || !end) return [];
        const value = start === end ? String(start) : `${start} - ${end}`;
        return [{
            key: 'period_interval',
            label: period.type,
            value: value,
            isInterval: true,
        }];
    }
    return [];
}
