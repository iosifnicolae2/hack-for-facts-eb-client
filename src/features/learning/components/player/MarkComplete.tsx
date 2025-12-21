import { t } from '@lingui/core/macro'
import { Button } from '@/components/ui/button'
import { useLearningProgress } from '../../hooks/use-learning-progress'

export type MarkCompleteProps = {
  readonly label?: string
  readonly pathId: string
  readonly moduleId: string
}

export function MarkComplete({ label, pathId, moduleId }: MarkCompleteProps) {
  const { saveModuleProgress } = useLearningProgress()

  return (
    <div className="my-6">
      <Button
        onClick={() =>
          void saveModuleProgress({
            pathId,
            moduleId,
            status: 'completed',
            contentVersion: 'poc',
          })
        }
      >
        {label ?? t`Mark as complete`}
      </Button>
    </div>
  )
}
