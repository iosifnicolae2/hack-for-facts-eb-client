import economicClassificationsRO from '@/assets/economic-classifications-general-ro.json'
import economicClassificationsEN from '@/assets/economic-classifications-general-en.json'
import { getUserLocale } from '@/lib/utils'

type ClassificationNode = {
    code?: string
    description: string
    children?: ClassificationNode[]
}

type ClassificationMaps = {
    codeToDescription: Map<string, string>
    chapterToDescription: Map<string, string>
    subchapterToDescription: Map<string, string>
}

const roMaps: ClassificationMaps = {
    codeToDescription: new Map<string, string>(),
    chapterToDescription: new Map<string, string>(),
    subchapterToDescription: new Map<string, string>()
}

const enMaps: ClassificationMaps = {
    codeToDescription: new Map<string, string>(),
    chapterToDescription: new Map<string, string>(),
    subchapterToDescription: new Map<string, string>()
}

const clean = (val?: string | null) => (val ?? '').replace(/[^0-9.]/g, '')

function buildMaps(nodes: ClassificationNode[], maps: ClassificationMaps) {
    for (const node of nodes) {
        if (node.code) {
            const code = clean(node.code)
            if (code) {
                maps.codeToDescription.set(code, node.description)

                const chapterMatch = code.match(/^(\d{2})$/)
                if (chapterMatch) {
                    maps.chapterToDescription.set(chapterMatch[1]!, node.description)
                }

                const subMatch = code.match(/^(\d{2})\.(\d{2})$/)
                if (subMatch) {
                    maps.subchapterToDescription.set(`${subMatch[1]}.${subMatch[2]}`, node.description)
                }
            }
        }
        if (node.children && node.children.length > 0) {
            buildMaps(node.children, maps)
        }
    }
}

function buildFromJson(json: unknown, maps: ClassificationMaps) {
    if (Array.isArray(json) && json.length > 0) {
        const root = json[0] as ClassificationNode
        if (root && Array.isArray(root.children)) {
            buildMaps(root.children as ClassificationNode[], maps)
            return
        }
    }
    buildMaps(json as unknown as ClassificationNode[], maps)
}

// Build both locale maps at module init
buildFromJson(economicClassificationsRO as unknown, roMaps)
buildFromJson(economicClassificationsEN as unknown, enMaps)

function getActiveMaps(): ClassificationMaps {
    const locale = getUserLocale()
    return locale === 'ro' ? roMaps : enMaps
}

export function getEconomicClassificationName(code: string): string | undefined {
    const normalized = clean(code)
    if (!normalized) return undefined
    return getActiveMaps().codeToDescription.get(normalized)
}

export function getEconomicChapterName(prefix2: string): string | undefined {
    const normalized = clean(prefix2).slice(0, 2)
    if (!normalized) return undefined
    return getActiveMaps().chapterToDescription.get(normalized)
}

export function getEconomicSubchapterName(prefix4: string): string | undefined {
    const normalized = clean(prefix4)
    const m = normalized.match(/^(\d{2})\.(\d{2})/)
    if (!m) return undefined
    return getActiveMaps().subchapterToDescription.get(`${m[1]}.${m[2]}`)
}

export function getEconomicParent(code: string): string | null {
  const cleaned = clean(code);
  if (!cleaned.includes('.')) return null;
  return cleaned.substring(0, cleaned.lastIndexOf('.'));
}


