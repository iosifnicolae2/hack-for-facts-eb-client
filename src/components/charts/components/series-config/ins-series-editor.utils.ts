import type { OptionItem } from '@/components/filters/base-filter/interfaces';
import type { InsDimensionValue } from '@/schemas/ins';
import { getUserLocale } from '@/lib/utils';

export type InsDimensionOptionKind =
  | 'classification'
  | 'unit'
  | 'territory'
  | 'siruta';

export type InsLocale = 'ro' | 'en';

const TOTAL_KEYWORDS = ['total', 'ambele', 'general'];

function resolveLocale(locale?: InsLocale): InsLocale {
  if (locale) return locale;
  return getUserLocale() === 'en' ? 'en' : 'ro';
}

function getLocalizedText(
  ro: string | null | undefined,
  en: string | null | undefined,
  locale: InsLocale
): string {
  return locale === 'en' ? en || ro || '' : ro || en || '';
}

function normalizeLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function pickDefaultDimensionValue(values: InsDimensionValue[]): InsDimensionValue | null {
  if (values.length === 0) return null;

  const countryTotal = values.find((value) => value.territory?.code === 'RO');
  if (countryTotal) return countryTotal;

  const totalKeywordMatch = values.find((value) => {
    const label = String(value.label_ro ?? value.label_en ?? '');
    const normalizedLabel = normalizeLabel(label);
    return TOTAL_KEYWORDS.some((keyword) => normalizedLabel.includes(keyword));
  });
  if (totalKeywordMatch) return totalKeywordMatch;

  return values[0] ?? null;
}

export function mapInsDimensionValueToOption(
  value: InsDimensionValue,
  optionKind: InsDimensionOptionKind,
  classificationTypeCode?: string,
  locale?: InsLocale
): OptionItem | null {
  const resolvedLocale = resolveLocale(locale);

  if (optionKind === 'classification') {
    const typeCode = value.classification_value?.type_code;
    const code = value.classification_value?.code;
    if (!typeCode || !code) return null;
    if (classificationTypeCode && typeCode !== classificationTypeCode) return null;

    const name =
      getLocalizedText(
        value.classification_value?.name_ro,
        value.classification_value?.name_en,
        resolvedLocale
      ) ||
      getLocalizedText(value.label_ro, value.label_en, resolvedLocale) ||
      code;
    return {
      id: code,
      label: `${code} - ${name}`,
    };
  }

  if (optionKind === 'unit') {
    const code = value.unit?.code;
    if (!code) return null;

    const unitLabel =
      getLocalizedText(value.unit?.name_ro, value.unit?.name_en, resolvedLocale) ||
      value.unit?.symbol ||
      code;
    return {
      id: code,
      label: `${code} - ${unitLabel}`,
    };
  }

  if (optionKind === 'territory') {
    const territoryCode = value.territory?.code;
    if (!territoryCode) return null;

    const territoryName =
      getLocalizedText(value.territory?.name_ro, value.territory?.name_en, resolvedLocale) ||
      getLocalizedText(value.label_ro, value.label_en, resolvedLocale) ||
      territoryCode;
    return {
      id: territoryCode,
      label: `${territoryCode} - ${territoryName}`,
    };
  }

  const sirutaCode = value.territory?.siruta_code;
  if (!sirutaCode) return null;

  const territoryName =
    getLocalizedText(value.territory?.name_ro, value.territory?.name_en, resolvedLocale) ||
    getLocalizedText(value.label_ro, value.label_en, resolvedLocale) ||
    sirutaCode;
  const territoryCode = value.territory?.code;
  const suffix = territoryCode ? ` (${territoryCode})` : '';
  return {
    id: sirutaCode,
    label: `${sirutaCode} - ${territoryName}${suffix}`,
  };
}

export function upsertSelectionRecord(
  current: Record<string, string[]> | undefined,
  key: string,
  nextValues: string[]
): Record<string, string[]> | undefined {
  const next: Record<string, string[]> = { ...(current ?? {}) };

  if (nextValues.length === 0) {
    delete next[key];
  } else {
    next[key] = nextValues;
  }

  return Object.keys(next).length > 0 ? next : undefined;
}
