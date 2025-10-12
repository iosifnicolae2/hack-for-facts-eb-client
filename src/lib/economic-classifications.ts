import economicClassifications from '@/assets/economic-classifications-general-ro.json'

type ClassificationNode = {
    code?: string
    description: string
    children?: ClassificationNode[]
}

const codeToDescription = new Map<string, string>()
const chapterToDescription = new Map<string, string>() // NN -> description
const subchapterToDescription = new Map<string, string>() // NN.MM -> description

const clean = (val?: string | null) => (val ?? '').replace(/[^0-9.]/g, '')

function buildMaps(nodes: ClassificationNode[]) {
    for (const node of nodes) {
        if (node.code) {
            const code = clean(node.code)
            if (code) {
                codeToDescription.set(code, node.description)

                const chapterMatch = code.match(/^(\d{2})$/)
                if (chapterMatch) {
                    chapterToDescription.set(chapterMatch[1]!, node.description)
                }

                const subMatch = code.match(/^(\d{2})\.(\d{2})$/)
                if (subMatch) {
                    subchapterToDescription.set(`${subMatch[1]}.${subMatch[2]}`, node.description)
                }
            }
        }
        if (node.children && node.children.length > 0) {
            buildMaps(node.children)
        }
    }
}

// The economic classification file has a single root with children
if (Array.isArray(economicClassifications) && economicClassifications.length > 0) {
    const root = economicClassifications[0]
    if (root && Array.isArray(root.children)) {
        buildMaps(root.children as ClassificationNode[])
    } else {
        buildMaps(economicClassifications as unknown as ClassificationNode[])
    }
}

export function getEconomicClassificationName(code: string): string | undefined {
    const normalized = clean(code)
    if (!normalized) return undefined
    return codeToDescription.get(normalized)
}

export function getEconomicChapterName(prefix2: string): string | undefined {
    const normalized = clean(prefix2).slice(0, 2)
    if (!normalized) return undefined
    return chapterToDescription.get(normalized)
}

export function getEconomicSubchapterName(prefix4: string): string | undefined {
    const normalized = clean(prefix4)
    const m = normalized.match(/^(\d{2})\.(\d{2})/)
    if (!m) return undefined
    return subchapterToDescription.get(`${m[1]}.${m[2]}`)
}


