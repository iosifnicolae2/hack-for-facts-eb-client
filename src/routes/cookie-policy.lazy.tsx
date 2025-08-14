import { createLazyFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Seo } from '@/lib/seo'
import { Trans, t } from '@lingui/macro'

export const Route = createLazyFileRoute('/cookie-policy')({
  component: CookiePolicyPage,
})

function CookiePolicyPage() {
  const effectiveDate = 'August 12, 2025'
  const version = '1.0'
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-6">
      <Seo title={t`Cookie Policy – Transparenta.eu`} description={t`Details on cookies and localStorage used by Transparenta.eu, with consent choices.`} />
      <div>
        <h1 className="text-3xl font-semibold"><Trans>Cookie Policy</Trans></h1>
        <p className="text-sm text-muted-foreground"><Trans>Effective Date: {effectiveDate} • Version: {version}</Trans></p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-medium"><Trans>At a Glance</Trans></h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li><Trans>Essential storage is required for the app to work.</Trans></li>
          <li><Trans>Analytics and enhanced error reporting are opt-in.</Trans></li>
          <li><Trans>Manage preferences anytime in <Link to="/cookies" className="underline">Cookie Settings</Link>.</Trans></li>
        </ul>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3><Trans>Technologies we use</Trans></h3>
        <p><Trans>We use cookies and localStorage to operate the app and, with consent, to measure usage and improve reliability.</Trans></p>
        <h3><Trans>Categories</Trans></h3>
        <ul>
          <li><Trans><strong>Essential</strong>: consent preferences and core UI state.</Trans></li>
          <li><Trans><strong>Analytics (opt-in)</strong>: PostHog custom events only (no autocapture).</Trans></li>
          <li><Trans><strong>Enhanced error reporting (opt-in)</strong>: Sentry optional context.</Trans></li>
        </ul>
        <h3><Trans>Examples</Trans></h3>
        <ul>
          <li><Trans>localStorage: <code>cookie-consent</code>, <code>saved-charts</code>, <code>chart-categories</code>.</Trans></li>
          <li><Trans>PostHog: <code>ph_*</code> identifiers when analytics is enabled.</Trans></li>
          <li><Trans>Sentry: session keys for replay if enabled.</Trans></li>
        </ul>
        <h3><Trans>Managing preferences</Trans></h3>
        <p><Trans>Use <Link to="/cookies" className="underline">Cookie Settings</Link> or your browser controls to clear site data.</Trans></p>
        <p><Trans>See also our <Link to="/privacy" className="underline">Privacy Policy</Link>.</Trans></p>
      </div>
    </div>
  )
}


