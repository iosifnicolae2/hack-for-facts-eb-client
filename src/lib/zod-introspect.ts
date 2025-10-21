import { z } from 'zod'

export type IntrospectedParam = {
  type: string
  optional?: boolean
  default?: unknown
  enumValues?: readonly string[]
  min?: number
  max?: number
  pattern?: string
  description?: string
}

export function describeZodSchema(schema: z.ZodTypeAny): Record<string, IntrospectedParam> {
  const shape = getShape(schema)
  const result: Record<string, IntrospectedParam> = {}
  for (const [key, field] of Object.entries(shape)) {
    result[key] = describeZod(field)
  }
  return result
}

function getShape(schema: z.ZodTypeAny): Record<string, z.ZodTypeAny> {
  const def: any = (schema as any)._def
  if (def?.typeName === 'ZodObject') {
    return (def.shape() as Record<string, z.ZodTypeAny>)
  }
  return {}
}

function describeZod(schema: z.ZodTypeAny): IntrospectedParam {
  // unwrap optional, default, effects
  let s: any = schema
  const meta: IntrospectedParam = { type: 'unknown' }
  // Default
  if (s._def?.typeName === 'ZodDefault') {
    meta.default = s._def.defaultValue()
    s = s._def.innerType
  }
  // Optional
  if (s._def?.typeName === 'ZodOptional') {
    meta.optional = true
    s = s._def.innerType
  }
  // Effects (coerce, preprocess)
  if (s._def?.typeName === 'ZodEffects') {
    s = s._def.schema
  }

  const typeName = s._def?.typeName
  if (!typeName) return meta

  // Common description if available
  if (s.description) meta.description = s.description

  switch (typeName) {
    case 'ZodString': {
      meta.type = 'string'
      const checks = s._def.checks as Array<any>
      const pattern = checks?.find((c) => c.kind === 'regex')?.regex?.source
      if (pattern) meta.pattern = pattern
      return meta
    }
    case 'ZodNumber': {
      meta.type = 'number'
      const checks = s._def.checks as Array<any>
      const min = checks?.find((c) => c.kind === 'min')?.value
      const max = checks?.find((c) => c.kind === 'max')?.value
      if (typeof min === 'number') meta.min = min
      if (typeof max === 'number') meta.max = max
      return meta
    }
    case 'ZodEnum': {
      meta.type = 'enum'
      meta.enumValues = s._def.values as string[]
      return meta
    }
    case 'ZodBoolean': {
      meta.type = 'boolean'
      return meta
    }
    case 'ZodArray': {
      meta.type = 'array'
      return meta
    }
    case 'ZodObject': {
      meta.type = 'object'
      return meta
    }
    default: {
      meta.type = String(typeName)
      return meta
    }
  }
}


