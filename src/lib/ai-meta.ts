import { z } from 'zod'
import { describeZodSchema } from '@/lib/zod-introspect'
import { getSiteUrl } from '@/config/env'

type HeadEntry = { name?: string; content?: string; title?: string }
type ScriptEntry = { type: string; children: string }

export function buildAiHeadFromSchema({
  schema,
  routePathTemplate,
  params,
  search,
}: {
  readonly schema: z.ZodTypeAny
  readonly routePathTemplate: string // e.g., '/entities/{cui}'
  readonly params: Record<string, string>
  readonly search: Record<string, unknown>
}): { meta: HeadEntry[]; scripts: ScriptEntry[] } {
  const site = getSiteUrl()
  const paramDoc = describeZodSchema(schema)
  const resolvedPath = interpolate(routePathTemplate, params)
  const urlTemplate = `${site}${routePathTemplate}`

  const meta: HeadEntry[] = [
    { title: buildTitle(params, search) },
    {
      name: 'description',
      content:
        'Public finance analytics for Romanian entities. Use query parameters to change period, view, and normalization.',
    },
    { name: 'ai:urlTemplate', content: urlTemplateWithPlaceholders(schema, urlTemplate) },
    {
      name: 'ai:instructions',
      content:
        'Put entity CUI in path. Add ?year=YYYY. Optional: period=YEAR|QUARTER|MONTH, view=overview|map|income-trends|expense-trends, normalization=total|total_euro|per_capita|per_capita_euro.',
    },
    {
      name: 'ai:parameters:url',
      content: `${site}/ai/entities-parameters.json`,
    },
  ]

  const scripts: ScriptEntry[] = [
    // Entity as Thing with identifier (CUI)
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Thing',
        identifier: params.cui,
        url: `${site}${resolvedPath}`,
      }),
    },
    // Minimal FAQ from schema descriptions
    {
      type: 'application/ld+json',
      children: JSON.stringify(buildFaqFromParamDoc(paramDoc)),
    },
  ]

  return { meta, scripts }
}

function buildTitle(params: Record<string, string>, search: Record<string, unknown>): string {
  const cui = params.cui || 'Entity'
  const year = search.year ? String(search.year) : undefined
  return year ? `Entity ${cui} — ${year} | Transparenta` : `Entity ${cui} | Transparenta`
}

function interpolate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`)
}

function urlTemplateWithPlaceholders(schema: z.ZodTypeAny, base: string): string {
  const params: string[] = []
  const shape: any = (schema as any)._def?.shape?.() ?? {}
  for (const [key, field] of Object.entries<any>(shape)) {
    // Only include primitives/enum for template clarity
    const t = field?._def?.typeName
    if (t === 'ZodString' || t === 'ZodNumber' || t === 'ZodEnum') {
      params.push(`${encodeURIComponent(key)}={${key}}`)
    }
  }
  return params.length ? `${base}?${params.join('&')}` : base
}

function buildFaqFromParamDoc(paramDoc: Record<string, any>) {
  const mainEntity: any[] = []
  for (const [key, spec] of Object.entries<any>(paramDoc)) {
    const name = `How do I use the '${key}' parameter?`
    const answer = spec.description
      ? spec.description
      : `Provide a ${spec.type}${spec.enumValues ? ` (${spec.enumValues.join('|')})` : ''}${
          spec.min || spec.max ? ` within range ${spec.min ?? '-inf'} to ${spec.max ?? '+inf'}` : ''
        }.`
    mainEntity.push({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text: answer } })
  }
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity }
}

export function buildAiStaticParamDoc(schema: z.ZodTypeAny): Record<string, unknown> {
  return describeZodSchema(schema)
}


