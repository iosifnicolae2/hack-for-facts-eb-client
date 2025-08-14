import { createFileRoute } from '@tanstack/react-router'
import { t } from '@lingui/macro'

export const Route = createFileRoute('/cookie-policy')({
  staticData: {
    title: t`Cookie Policy`,
  },
})


