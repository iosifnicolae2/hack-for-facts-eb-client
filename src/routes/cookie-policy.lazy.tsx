import { createLazyFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/cookie-policy')({
  component: CookiePolicyPage,
})

function CookiePolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Cookie Policy</h1>
      <p className="text-muted-foreground">This policy explains how Transparenta.eu uses cookies.</p>
      <ul className="list-disc pl-6 space-y-2 text-sm">
        <li>
          <strong>Essential cookies</strong>: required for core functionality, authentication, and security.
        </li>
        <li>
          <strong>Analytics cookies</strong>: used only with your consent to collect usage statistics via PostHog.
        </li>
      </ul>
      <p className="text-sm text-muted-foreground">
        You can change your preferences anytime on the <Link to="/cookies" className="underline">Cookie Settings</Link> page.
      </p>
    </div>
  )
}


