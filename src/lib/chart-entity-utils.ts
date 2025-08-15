import { EntityDetailsData } from '@/lib/api/entities';
import { StoredChart } from '@/components/charts/chartsStore';
import { Series } from '@/schemas/charts';

function isLineItemsSeries(series: Series): series is Extract<Series, { type: 'line-items-aggregated-yearly' }> {
  return series.type === 'line-items-aggregated-yearly';
}

export function chartRelatesToEntity(chart: StoredChart, entity: EntityDetailsData): boolean {
  const cui = entity.cui;
  const isUatEntity = !!entity.is_uat;
  const uatId = entity.uat?.siruta_code != null ? String(entity.uat.siruta_code) : undefined;
  const isCountyEntity = entity.entity_type === 'admin_county_council';
  const countyCode = entity.uat?.county_code ?? undefined;

  return chart.series.some((s) => {
    if (!isLineItemsSeries(s)) return false;
    const filter = s.filter ?? {} as Record<string, unknown>;

    const entityCuis = Array.isArray((filter as any).entity_cuis)
      ? ((filter as any).entity_cuis as unknown[]).map(String)
      : [];
    if (entityCuis.includes(String(cui))) return true;

    if (isUatEntity && uatId) {
      const uatIds = Array.isArray((filter as any).uat_ids)
        ? ((filter as any).uat_ids as unknown[]).map(String)
        : [];
      if (uatIds.includes(uatId)) return true;
    }

    if (isCountyEntity && countyCode) {
      const countyCodes = Array.isArray((filter as any).county_codes)
        ? ((filter as any).county_codes as unknown[]).map(String)
        : [];
      if (countyCodes.includes(String(countyCode))) return true;
    }

    return false;
  });
}


