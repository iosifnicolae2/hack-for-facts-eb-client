/**
 * Update learning path configs with metadata from MDX frontmatter.
 *
 * This script reads MDX frontmatter and updates path config JSON files
 * to fill in missing fields. It does NOT overwrite fields that already
 * exist in the path config.
 *
 * Generated fields (from contentDir + MDX frontmatter):
 * - id: derived from contentDir (last segment without number prefix)
 * - slug: derived from contentDir (last segment)
 * - title.en: from index.en.mdx frontmatter
 * - title.ro: from index.ro.mdx frontmatter (if exists)
 * - durationMinutes: from frontmatter
 *
 * Run: yarn learning:generate
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import matter from 'gray-matter'

const PROJECT_ROOT = process.cwd()
const LEARNING_ROOT = path.join(PROJECT_ROOT, 'src', 'content', 'learning')
const MODULES_ROOT = path.join(LEARNING_ROOT, 'modules')
const PATHS_ROOT = path.join(LEARNING_ROOT, 'paths')

type MdxFrontmatter = {
  readonly title?: string
  readonly durationMinutes?: number
  readonly concept?: string
  readonly objective?: string
}

type LessonConfig = {
  id?: string
  slug?: string
  title?: { en?: string; ro?: string }
  durationMinutes?: number
  contentDir: string
  completionMode: string
  prerequisites?: string[]
}

type ModuleConfig = {
  id?: string
  slug?: string
  title?: { en?: string; ro?: string }
  description?: { en?: string; ro?: string }
  lessons: LessonConfig[]
}

type PathConfig = {
  id: string
  slug: string
  difficulty: string
  title: { en: string; ro: string }
  description: { en: string; ro: string }
  modules: ModuleConfig[]
}

function normalizeContentDir(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
}

async function readFrontmatter(contentDir: string, locale: string): Promise<MdxFrontmatter | null> {
  const mdxPath = path.join(MODULES_ROOT, contentDir, `index.${locale}.mdx`)
  try {
    const source = await fs.readFile(mdxPath, 'utf8')
    const parsed = matter(source)
    return parsed.data as MdxFrontmatter
  } catch {
    return null
  }
}

type FrontmatterData = {
  en: MdxFrontmatter | null
  ro: MdxFrontmatter | null
}

async function collectFrontmatterIndex(): Promise<Map<string, FrontmatterData>> {
  const index = new Map<string, FrontmatterData>()

  async function walkDir(dir: string, prefix: string = ''): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await walkDir(entryPath, prefix ? `${prefix}/${entry.name}` : entry.name)
      } else if (entry.name === 'index.en.mdx') {
        const contentDir = prefix
        const enFrontmatter = await readFrontmatter(contentDir, 'en')
        const roFrontmatter = await readFrontmatter(contentDir, 'ro')
        index.set(contentDir, { en: enFrontmatter, ro: roFrontmatter })
      }
    }
  }

  await walkDir(MODULES_ROOT)
  return index
}

async function readPathConfig(filePath: string): Promise<PathConfig> {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content) as PathConfig
}

/**
 * Derive id from contentDir.
 * Example: "citizen-foundations/01-what-is-a-budget" -> "what-is-a-budget"
 */
function deriveIdFromContentDir(contentDir: string): string {
  const lastSegment = contentDir.split('/').pop() || ''
  // Remove leading number prefix like "01-", "02-", etc.
  return lastSegment.replace(/^\d+-/, '')
}

/**
 * Derive slug from contentDir.
 * Example: "citizen-foundations/01-what-is-a-budget" -> "01-what-is-a-budget"
 */
function deriveSlugFromContentDir(contentDir: string): string {
  return contentDir.split('/').pop() || ''
}

function updateLessonWithFrontmatter(
  lesson: LessonConfig,
  frontmatter: FrontmatterData | undefined
): { updated: boolean; lesson: LessonConfig } {
  let updated = false
  const result = { ...lesson }
  const contentDir = normalizeContentDir(lesson.contentDir)

  // Generate id if missing
  if (result.id === undefined) {
    result.id = deriveIdFromContentDir(contentDir)
    updated = true
  }

  // Generate slug if missing
  if (result.slug === undefined) {
    result.slug = deriveSlugFromContentDir(contentDir)
    updated = true
  }

  // Generate title if missing or incomplete
  if (!result.title) {
    result.title = { en: undefined, ro: undefined }
  }

  // Read title from each locale-specific file (index.en.mdx has English title, index.ro.mdx has Romanian title)
  const enTitle = frontmatter?.en?.title
  const roTitle = frontmatter?.ro?.title

  if (result.title.en === undefined && enTitle) {
    result.title = { ...result.title, en: enTitle }
    updated = true
  }

  if (result.title.ro === undefined && roTitle) {
    result.title = { ...result.title, ro: roTitle }
    updated = true
  }

  // Fallback: use English title for Romanian if Romanian MDX doesn't exist
  if (result.title.ro === undefined && result.title.en) {
    result.title = { ...result.title, ro: result.title.en }
    updated = true
  }

  // Generate durationMinutes if missing
  if (result.durationMinutes === undefined && frontmatter?.en?.durationMinutes !== undefined) {
    result.durationMinutes = frontmatter.en.durationMinutes
    updated = true
  }

  return { updated, lesson: result }
}

/**
 * Derive module id from first lesson's contentDir.
 * Example: "citizen-foundations/01-what-is-a-budget" -> "citizen-foundations"
 */
function deriveModuleIdFromContentDir(contentDir: string): string {
  const parts = contentDir.split('/')
  return parts.length > 1 ? parts[0] : contentDir
}

/**
 * Derive module slug from module id.
 * Example: "citizen-foundations" -> "foundations"
 */
function deriveModuleSlugFromId(moduleId: string): string {
  const parts = moduleId.split('-')
  return parts.length > 1 ? parts.slice(1).join('-') : moduleId
}

function updateModuleWithDefaults(
  module: ModuleConfig
): { updated: boolean; module: ModuleConfig } {
  let updated = false
  const result = { ...module }

  // Derive module id from first lesson if missing
  if (result.id === undefined && result.lessons.length > 0) {
    const firstLesson = result.lessons[0]
    result.id = deriveModuleIdFromContentDir(normalizeContentDir(firstLesson.contentDir))
    updated = true
  }

  // Derive module slug from id if missing
  if (result.slug === undefined && result.id) {
    result.slug = deriveModuleSlugFromId(result.id)
    updated = true
  }

  return { updated, module: result }
}

async function updatePathConfig(
  pathConfig: PathConfig,
  frontmatterIndex: Map<string, FrontmatterData>
): Promise<{ updated: boolean; config: PathConfig }> {
  let anyUpdated = false

  const updatedModules = pathConfig.modules.map((module) => {
    // Update lessons
    const updatedLessons = module.lessons.map((lesson) => {
      const contentDir = normalizeContentDir(lesson.contentDir)
      const frontmatter = frontmatterIndex.get(contentDir)
      const { updated, lesson: updatedLesson } = updateLessonWithFrontmatter(lesson, frontmatter)
      if (updated) {
        anyUpdated = true
      }
      return updatedLesson
    })

    const moduleWithLessons = { ...module, lessons: updatedLessons }

    // Update module itself
    const { updated: moduleUpdated, module: updatedModule } = updateModuleWithDefaults(moduleWithLessons)
    if (moduleUpdated) {
      anyUpdated = true
    }

    return updatedModule
  })

  return {
    updated: anyUpdated,
    config: {
      ...pathConfig,
      modules: updatedModules,
    },
  }
}

async function main(): Promise<void> {
  console.log('Updating learning paths with MDX frontmatter...\n')

  // Collect frontmatter from all MDX files
  const frontmatterIndex = await collectFrontmatterIndex()
  console.log(`Found ${frontmatterIndex.size} MDX content directories`)

  // Read all path configs
  const pathFiles = await fs.readdir(PATHS_ROOT)
  const jsonFiles = pathFiles.filter((f) => f.endsWith('.json'))

  let totalUpdated = 0

  for (const fileName of jsonFiles) {
    const filePath = path.join(PATHS_ROOT, fileName)

    try {
      const pathConfig = await readPathConfig(filePath)
      const { updated, config } = await updatePathConfig(pathConfig, frontmatterIndex)

      if (updated) {
        await fs.writeFile(filePath, JSON.stringify(config, null, 2) + '\n', 'utf8')
        console.log(`✓ Updated ${fileName}`)
        totalUpdated++
      } else {
        console.log(`· ${fileName} (no changes needed)`)
      }
    } catch (error) {
      console.error(`✗ Failed to process ${fileName}:`)
      console.error(`  ${error instanceof Error ? error.message : String(error)}`)
      process.exitCode = 1
    }
  }

  console.log('')
  if (totalUpdated > 0) {
    console.log(`✅ Updated ${totalUpdated} path file(s).`)
  } else {
    console.log('✅ All paths are up to date.')
  }
}

main().catch((error) => {
  console.error(`Failed to update learning paths: ${error instanceof Error ? error.message : error}`)
  process.exitCode = 1
})
