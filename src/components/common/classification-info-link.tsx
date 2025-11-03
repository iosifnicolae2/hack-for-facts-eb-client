import React from 'react'
import { Link } from '@tanstack/react-router'
import { Info } from 'lucide-react'

type ClassificationType = 'functional' | 'economic'

type ClassificationInfoLinkProps = {
  type: ClassificationType
  code?: string
  title?: string
  className?: string
  iconClassName?: string
  showOnHoverOnly?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export function ClassificationInfoLink({
  type,
  code,
  title,
  className = '',
  iconClassName = 'h-4 w-4 text-slate-600 dark:text-slate-300',
  showOnHoverOnly = true,
  onClick,
}: ClassificationInfoLinkProps) {
  // Normalize codes like NN.MM.00 or NN.00 by removing a trailing .00 segment(s)
  const normalizedCode = code ? code.replace(/(\.00)+$/, '') : undefined
  const baseClasses = 'inline-flex items-center justify-center rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition-opacity'
  const hoverClasses = showOnHoverOnly ? 'opacity-0 group-hover:opacity-100' : ''
  const mergedClassName = ['ml-2', baseClasses, hoverClasses, className].filter(Boolean).join(' ')

  const commonProps = {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      onClick?.(e)
    },
    className: mergedClassName,
    title: title ?? (normalizedCode ? `Open ${type} classification ${normalizedCode}` : `Open ${type} classifications`),
  }

  if (type === 'functional') {
    if (normalizedCode) {
      return (
        <Link to={'/classifications/functional/$code'} params={{ code: normalizedCode }} {...commonProps}>
          <Info className={iconClassName} />
        </Link>
      )
    }
    return (
      <Link to={'/classifications/functional'} {...commonProps}>
        <Info className={iconClassName} />
      </Link>
    )
  } else {
    if (normalizedCode) {
      return (
        <Link to={'/classifications/economic/$code'} params={{ code: normalizedCode }} {...commonProps}>
          <Info className={iconClassName} />
        </Link>
      )
    }
    return (
      <Link to={'/classifications/economic'} {...commonProps}>
        <Info className={iconClassName} />
      </Link>
    )
  }
}
