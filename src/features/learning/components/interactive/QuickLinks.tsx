/**
 * QuickLinks Component
 *
 * A grid of clickable cards linking to key government websites
 * for budget transparency. Each card shows name, description,
 * and opens external link in new tab.
 *
 * @example
 * ```mdx
 * <QuickLinks locale="en" />
 * ```
 */

import { t } from '@lingui/core/macro'
import { ExternalLink, Building2, Landmark, Scale, Database, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LearningLocale } from '../../types'
import type { QuickLinkItem } from './document-tracking-data'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

type QuickLinksProps = {
  readonly locale?: LearningLocale
  readonly links: readonly QuickLinkItem[]
}

// ═══════════════════════════════════════════════════════════════════════════
// Icon Mapping
// ═══════════════════════════════════════════════════════════════════════════

const ICON_MAP: Record<QuickLinkItem['icon'], typeof Building2> = {
  ministry: Building2,
  parliament: Landmark,
  audit: Scale,
  data: Database,
  transparency: Search,
}

// ═══════════════════════════════════════════════════════════════════════════
// Link Card Component
// ═══════════════════════════════════════════════════════════════════════════

type LinkCardProps = {
  readonly link: QuickLinkItem
}

function LinkCard({ link }: LinkCardProps) {
  const Icon = ICON_MAP[link.icon]

  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block p-4 rounded-lg border border-zinc-200 dark:border-zinc-800',
        'bg-white dark:bg-zinc-900/50',
        'hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="p-2 rounded-md shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Name with external link indicator */}
          <div className="flex items-center gap-1.5">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 transition-colors">
              {link.name}
            </h4>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
          </div>

          {/* Description */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{link.description}</p>

          {/* URL hint */}
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 truncate">{link.url.replace('https://', '')}</p>
        </div>
      </div>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export function QuickLinks({ links }: QuickLinksProps) {
  return (
    <div className="my-8 space-y-4">
      {/* Header */}
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 px-1">{t`Key Websites`}</h3>

      {/* Links Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((link) => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
    </div>
  )
}

export type { QuickLinksProps }
