import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const classificationSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  view: z.enum(['grid', 'tree']).optional().catch('grid'),
})

export const Route = createFileRoute('/classifications/functional/')({
  validateSearch: classificationSearchSchema,
  staticData: {
    title: 'Functional Classifications',
  },
})
