import { Trans } from '@lingui/react/macro'
import { Link } from '@tanstack/react-router'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ClassificationActions } from './ClassificationActions'
import { ClassificationDescription } from './ClassificationDescription'
import type { ClassificationNode, ClassificationType } from '@/types/classification-explorer'
import { useClassificationData } from './hooks/useClassificationData'

type ClassificationInfoProps = {
  readonly type: ClassificationType
  readonly node: ClassificationNode
}

export function ClassificationInfo({ type, node }: ClassificationInfoProps) {
  const { getByCode } = useClassificationData(type)
  const parentInfo = node.parent ? getByCode(node.parent) : undefined
  const basePath = `/classifications/${type}`
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {node.parent ? (
              <Link
                to={`${basePath}/${node.parent}` as any}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="font-medium"><Trans>Parent</Trans>:</span>
                <span className="font-mono font-bold">{node.parent}</span>
                {parentInfo?.name && (
                  <>
                    <span>-</span>
                    <span className="font-medium">{parentInfo.name}</span>
                  </>
                )}
              </Link>
            ) : (
              <Link
                to={basePath}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="font-medium"><Trans>All Classifications</Trans></span>
              </Link>
            )}
          </div>
          <ClassificationActions type={type} code={node.code} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-2xl font-bold text-foreground">{node.code}</span>
            <CardTitle className="text-2xl leading-tight">
              {node.name || <span className="italic text-muted-foreground/60"><Trans>Missing title</Trans></span>}
            </CardTitle>
          </div>
        </div>
        <ClassificationDescription type={type} code={node.code} />
      </CardContent>
    </Card>
  )
}
