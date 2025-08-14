import { createFileRoute } from '@tanstack/react-router'
import { t } from '@lingui/macro'

export const Route = createFileRoute('/privacy')({
  staticData: {
    title: t`Privacy Policy`,
  },
})


