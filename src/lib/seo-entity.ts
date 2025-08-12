import type { EntityDetailsData } from '@/lib/api/entities'
import { formatCurrency } from '@/lib/utils'

export type EntitySeo = {
  readonly title: string
  readonly description: string
}

/**
 * Builds SEO title and description for entity pages from API data.
 * Optimized for share previews and search snippets.
 */
export function buildEntitySeo(
  entity: EntityDetailsData | null,
  cui: string,
  selectedYear: number,
): EntitySeo {
  const title = entity?.name
    ? `${entity.name} – ${selectedYear} Budget Overview | Transparenta.eu`
    : `Entity ${cui} – ${selectedYear} Budget Overview | Transparenta.eu`

  const description = buildEntitySummary(entity, cui, selectedYear)
  return { title, description }
}

function buildEntitySummary(
  entity: EntityDetailsData | null,
  cui: string,
  selectedYear: number,
): string {
  if (!entity) return `Explore budget trends, reports, and map for entity ${cui}.`

  const county = entity.uat?.county_name || undefined
  const type = entity.entity_type || undefined
  const humanType = type ? type.split('_').join(' ') : undefined

  const header = [entity.name, county ? `(${county})` : undefined, humanType ? `– ${humanType}` : undefined]
    .filter(Boolean)
    .join(' ')

  const exp = typeof entity.totalExpenses === 'number' ? formatCurrency(entity.totalExpenses, 'compact') : undefined
  const inc = typeof entity.totalIncome === 'number' ? formatCurrency(entity.totalIncome, 'compact') : undefined
  const bal = typeof entity.budgetBalance === 'number' ? formatCurrency(entity.budgetBalance, 'compact') : undefined
  const parts: string[] = []
  if (exp) parts.push(`Expenses ${exp}`)
  if (inc) parts.push(`Income ${inc}`)
  if (bal) parts.push(`Balance ${bal}`)

  // Top 2 functional categories by current-year expenses
  const top = getTopExpenseFunctionalCategories(entity, 2)

  const summaryCore = parts.length ? `${parts.join(', ')} in ${selectedYear}` : `Budget overview for ${selectedYear}`
  const tail = top.length ? `. Top spending: ${top.join(', ')}.` : '.'
  return `${header}. ${summaryCore}${tail}`.trim()
}

function getTopExpenseFunctionalCategories(entity: EntityDetailsData, take: number): string[] {
  const nodes = entity.executionLineItems?.nodes || []
  const buckets = nodes
    .filter((n) => n.account_category === 'ch' && n.functionalClassification?.functional_name)
    .reduce<Record<string, number>>((acc, n) => {
      const key = n.functionalClassification!.functional_name
      const amt = typeof n.amount === 'number' ? n.amount : 0
      acc[key] = (acc[key] || 0) + amt
      return acc
    }, {})
  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, take)
    .map(([name]) => name)
}


