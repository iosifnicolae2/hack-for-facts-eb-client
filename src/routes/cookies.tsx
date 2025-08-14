import { createFileRoute } from '@tanstack/react-router'
import { t } from '@lingui/macro'

export const Route = createFileRoute('/cookies')({
  staticData: {
    title: t`Cookie Settings`,
  },
})


