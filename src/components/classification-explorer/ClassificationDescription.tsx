import { Trans } from '@lingui/react/macro'
import type { ClassificationType } from '@/types/classification-explorer'
import { getUserLocale } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { loadClassificationDescription } from '@/lib/description-loader'

type ClassificationDescriptionProps = {
  readonly type: ClassificationType
  readonly code: string
}

export function ClassificationDescription({ type, code }: ClassificationDescriptionProps) {
  const locale = getUserLocale()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['classification-description', locale, type, code],
    queryFn: () => loadClassificationDescription(locale, type, code),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  if (isLoading) return (
    <p className="text-sm text-muted-foreground italic">
      <Trans>Loading...</Trans>
    </p>
  )

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground italic">
        <Trans>Missing description</Trans>
      </p>
    )
  }

  const text = data || ''
  if (text.trim().length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        <Trans>Missing description</Trans>
      </p>
    )
  }

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  )
}
