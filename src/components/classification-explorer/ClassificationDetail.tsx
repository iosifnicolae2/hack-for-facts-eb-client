import { motion } from 'framer-motion'
import { ClassificationBreadcrumb } from './ClassificationBreadcrumb'
import { ClassificationInfo } from './ClassificationInfo'
import { ClassificationChildren } from './ClassificationChildren'
import { ClassificationSiblings } from './ClassificationSiblings'
import type { ClassificationHierarchy, ClassificationType } from '@/types/classification-explorer'

type ClassificationDetailProps = {
  readonly type: ClassificationType
  readonly hierarchy: ClassificationHierarchy
}

export function ClassificationDetail({ type, hierarchy }: ClassificationDetailProps) {
  const { node, parents, children, siblings } = hierarchy

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Breadcrumb navigation */}
      <ClassificationBreadcrumb type={type} parents={parents} current={node} />

      {/* One-column flow: primary (item) → secondary (lists) */}
      <div className="space-y-6">
        <ClassificationInfo type={type} node={node} />
        <ClassificationChildren type={type} children={children} />
        {siblings.length > 0 && (
          <ClassificationSiblings type={type} siblings={siblings} />
        )}
      </div>
    </motion.div>
  )
}
