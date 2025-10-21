import { createLazyFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { getSiteUrl } from '@/config/env'
import { Trans } from '@lingui/react/macro'

export const Route = createLazyFileRoute('/cookie-policy')({
  component: CookiePolicyPage,
})

function CookiePolicyPage() {
  const effectiveDate = 'October 17, 2025'
  const version = '2.0'
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-6">
      {/* Head handled by Route.head */}
      <div>
        <h1 className="text-3xl font-semibold"><Trans>Cookie Policy</Trans></h1>
        <p className="text-sm text-muted-foreground"><Trans>Effective Date: {effectiveDate} • Version: {version}</Trans></p>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-medium"><Trans>At a Glance</Trans></h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li><Trans>Essential storage is required for the app to work.</Trans></li>
          <li><Trans>Authentication cookies are used if you create an account.</Trans></li>
          <li><Trans>Analytics and enhanced error reporting are opt-in.</Trans></li>
          <li><Trans>Manage preferences anytime in <Link to="/cookies" className="underline">Cookie Settings</Link>.</Trans></li>
        </ul>
      </div>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3><Trans>Technologies we use</Trans></h3>
        <p><Trans>We use cookies and localStorage to operate the app and, with consent, to measure usage and improve reliability.</Trans></p>
        <h3><Trans>Categories</Trans></h3>
        <ul>
          <li><Trans><strong>Essential</strong>: Consent preferences and core UI state (always active).</Trans></li>
          <li><Trans><strong>Authentication (essential, if you have an account)</strong>: Clerk session cookies for secure login and account management.</Trans></li>
          <li><Trans><strong>Analytics (opt-in)</strong>: PostHog custom events only (no autocapture).</Trans></li>
          <li><Trans><strong>Enhanced error reporting (opt-in)</strong>: Sentry optional context.</Trans></li>
        </ul>
        <h3><Trans>Detailed breakdown</Trans></h3>

        <h4><Trans>Essential Cookies and Storage (always active)</Trans></h4>
        <p><Trans>These are necessary for the Service to function and cannot be disabled:</Trans></p>
        <ul>
          <li><Trans><strong>localStorage</strong>: <code>cookie-consent</code> (stores your consent preferences), <code>saved-charts</code> (your saved visualizations), <code>chart-categories</code> (chart organization), <code>theme-preference</code> (dark/light mode).</Trans></li>
        </ul>

        <h4><Trans>Authentication Cookies (essential if you have an account)</Trans></h4>
        <p><Trans>If you create an account, Clerk sets the following cookies for authentication and session management:</Trans></p>
        <ul>
          <li><Trans><strong>__clerk_db_jwt</strong>: Session token for authentication (httpOnly, secure).</Trans></li>
          <li><Trans><strong>__session</strong>: Session identifier (httpOnly, secure).</Trans></li>
          <li><Trans><strong>__clerk_*</strong>: Various Clerk cookies for account management and security.</Trans></li>
        </ul>
        <p><Trans>These cookies are essential for account functionality. If you delete them, you will be signed out.</Trans></p>

        <h4><Trans>Analytics Cookies (opt-in only)</Trans></h4>
        <p><Trans>Only set if you consent to analytics:</Trans></p>
        <ul>
          <li><Trans><strong>PostHog</strong>: <code>ph_*</code> identifiers for usage analytics. Custom events only, no autocapture or session recordings.</Trans></li>
        </ul>

        <h4><Trans>Error Reporting (opt-in only)</Trans></h4>
        <p><Trans>Only set if you consent to enhanced error reporting:</Trans></p>
        <ul>
          <li><Trans><strong>Sentry</strong>: Session keys for error context and replay if enabled.</Trans></li>
        </ul>

        <h3><Trans>Cookie duration</Trans></h3>
        <ul>
          <li><Trans><strong>Essential localStorage</strong>: Persists until manually cleared by you.</Trans></li>
          <li><Trans><strong>Clerk authentication cookies</strong>: Session cookies (expire when you close browser) and persistent cookies (up to 30 days for "remember me").</Trans></li>
          <li><Trans><strong>PostHog analytics</strong>: Up to 1 year.</Trans></li>
          <li><Trans><strong>Sentry</strong>: Session duration only.</Trans></li>
        </ul>

        <h3><Trans>Managing preferences</Trans></h3>
        <p><Trans>Use <Link to="/cookies" className="underline">Cookie Settings</Link> to manage analytics and error reporting consent, or use your browser controls to clear site data.</Trans></p>
        <p><Trans>Note: Deleting authentication cookies will sign you out of your account. Deleting essential localStorage will reset your saved charts and preferences.</Trans></p>
        <p><Trans>See also our <Link to="/privacy" className="underline">Privacy Policy</Link>.</Trans></p>
      </div>
    </div>
  )
}

function buildCookiePolicyHead() {
  const site = getSiteUrl()
  const canonical = `${site}/cookie-policy`
  const title = 'Cookie Policy – Transparenta.eu'
  const description = 'Details on cookies and localStorage used by Transparenta.eu, with consent choices.'
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:url', content: canonical },
      { name: 'canonical', content: canonical },
    ],
  }
}

export function head() {
  return buildCookiePolicyHead()
}


