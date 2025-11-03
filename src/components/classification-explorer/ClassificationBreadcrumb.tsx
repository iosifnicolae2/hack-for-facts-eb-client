import { Link } from '@tanstack/react-router'
import { Trans } from '@lingui/react/macro'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'
import type { ClassificationNode, ClassificationType } from '@/types/classification-explorer'

type ClassificationBreadcrumbProps = {
  readonly type: ClassificationType
  readonly parents: readonly ClassificationNode[]
  readonly current: ClassificationNode
}

export function ClassificationBreadcrumb({
  type,
  parents,
  current,
}: ClassificationBreadcrumbProps) {
  const basePath = `/classifications/${type}`

  return (
    <Breadcrumb className="max-w-full overflow-hidden">
      <BreadcrumbList className="flex-wrap">
        <BreadcrumbItem className="shrink-0">
          <BreadcrumbLink asChild>
            <Link to={basePath} className="text-xs font-medium whitespace-nowrap">
              <Trans>All Classifications</Trans>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {parents.map((parent) => (
          <div key={parent.code} className="contents">
            <BreadcrumbSeparator className="shrink-0" />
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbLink asChild>
                <Link to={`${basePath}/${parent.code}` as any} className="text-xs font-medium whitespace-nowrap inline-flex items-center gap-1">
                  <span className="font-mono font-bold">{parent.code}</span>
                  {parent.name && (
                    <>
                      <span className="text-muted-foreground">-</span>
                      <span className="max-w-[150px] truncate">{parent.name}</span>
                    </>
                  )}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </div>
        ))}

        <BreadcrumbSeparator className="shrink-0" />
        <BreadcrumbItem className="shrink-0 max-w-full">
          <BreadcrumbPage className="text-xs font-medium whitespace-nowrap inline-flex items-center gap-1 overflow-hidden">
            <span className="font-mono font-bold shrink-0">{current.code}</span>
            {current.name && (
              <>
                <span className="text-muted-foreground shrink-0">-</span>
                <span className="truncate">{current.name}</span>
              </>
            )}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
