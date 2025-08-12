import { createLazyFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Seo } from '@/lib/seo'

export const Route = createLazyFileRoute('/cookie-policy')({
  component: CookiePolicyPage,
})

function CookiePolicyPage() {
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-6">
      <Seo title="Cookie Policy – Transparenta.eu" description="Details on cookies and localStorage used by Transparenta.eu, with consent choices." />
      <div>
        <h1 className="text-3xl font-semibold">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">Effective Date: August 12, 2025 • Version: 1.0</p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-medium">At a Glance</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Essential storage is required for the app to work.</li>
          <li>Analytics and enhanced error reporting are opt-in.</li>
          <li>Manage preferences anytime in <Link to="/cookies" className="underline">Cookie Settings</Link>.</li>
        </ul>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3>Technologies we use</h3>
        <p>We use cookies and localStorage to operate the app and, with consent, to measure usage and improve reliability.</p>
        <h3>Categories</h3>
        <ul>
          <li><strong>Essential</strong>: consent preferences and core UI state.</li>
          <li><strong>Analytics (opt-in)</strong>: PostHog custom events only (no autocapture).</li>
          <li><strong>Enhanced error reporting (opt-in)</strong>: Sentry optional context.</li>
        </ul>
        <h3>Examples</h3>
        <ul>
          <li>localStorage: <code>cookie-consent</code>, <code>saved-charts</code>, <code>chart-categories</code>.</li>
          <li>PostHog: <code>ph_*</code> identifiers when analytics is enabled.</li>
          <li>Sentry: session keys for replay if enabled.</li>
        </ul>
        <h3>Managing preferences</h3>
        <p>Use <Link to="/cookies" className="underline">Cookie Settings</Link> or your browser controls to clear site data.</p>
        <p>See also our <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
      </div>
    </div>
  )
}


