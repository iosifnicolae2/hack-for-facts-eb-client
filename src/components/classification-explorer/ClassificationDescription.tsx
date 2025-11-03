import { Trans } from '@lingui/react/macro'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import type { ClassificationType } from '@/types/classification-explorer'

type ClassificationDescriptionProps = {
  readonly type: ClassificationType
  readonly code: string
}

/**
 * Mock component for classification description
 * TODO: Implement MDX loading system for classification descriptions
 */
export function ClassificationDescription({
  type,
  code,
}: ClassificationDescriptionProps) {
  // In the future, this will load MDX content based on type and code
  // For now, return a placeholder

  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        <Trans>
          Detailed description for {type} classification {code} will be available soon.
          This area will display comprehensive information, examples, and usage guidelines
          for this classification code.
        </Trans>
      </AlertDescription>
    </Alert>
  )
}

/**
 * Future implementation:
 * TODO: Implement MDX loading system for classification descriptions
 * Example path: `/descriptions/${type}/${code}.mdx`
 * Use dynamic import or fetch to load and parse the MDX content
 */
