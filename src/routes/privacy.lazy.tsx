import { createLazyFileRoute } from '@tanstack/react-router'
import { Seo } from '@/lib/seo'
import { Trans, t } from '@lingui/macro'

export const Route = createLazyFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  const effectiveDate = 'August 12, 2025'
  const version = '1.0'
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-6">
      <Seo title={t`Privacy Policy – Transparenta.eu`} description={t`How Transparenta.eu handles data, analytics, and error reporting with consent.`} />
      <div>
        <h1 className="text-3xl font-semibold"><Trans>Privacy Policy</Trans></h1>
        <p className="text-sm text-muted-foreground"><Trans>Effective Date: {effectiveDate} • Version: {version}</Trans></p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium"><Trans>At a Glance</Trans></h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li><Trans>Local-first: charts and preferences are stored in your browser.</Trans></li>
          <li><Trans>Analytics and enhanced error reporting only with your consent.</Trans></li>
          <li><Trans>No accounts required; no selling of personal data.</Trans></li>
        </ul>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3><Trans>Who we are</Trans></h3>
        <p>
          <Trans>Controller: Claudiu Constantin Bogdan, persoana fizica. Contact: contact@devostack.com.</Trans>
        </p>

        <h3><Trans>What we process</Trans></h3>
        <ul>
          <li><Trans>Essential technical data and consent preferences (legitimate interests).</Trans></li>
          <li><Trans>Usage analytics via PostHog (consent-only, custom events, no autocapture).</Trans></li>
          <li><Trans>Enhanced error reporting via Sentry (consent-only); minimal telemetry otherwise.</Trans></li>
          <li><Trans>User-created charts/annotations/filters stored locally (localStorage).</Trans></li>
        </ul>

        <h3><Trans>Purposes and legal bases</Trans></h3>
        <ul>
          <li><Trans>Operate and secure the service (legitimate interests).</Trans></li>
          <li><Trans>Improve product and fix issues (consent for analytics/error context).</Trans></li>
        </ul>

        <h3><Trans>Data sources and licensing</Trans></h3>
        <p><Trans>Public sector information from Ministerul Finanțelor, made available as open data. No government affiliation.</Trans></p>

        <h3><Trans>Sharing and processors</Trans></h3>
        <p><Trans>PostHog (analytics), Sentry (error reporting), hosting providers. EU-first; safeguards for transfers.</Trans></p>

        <h3><Trans>Retention</Trans></h3>
        <ul>
          <li><Trans>LocalStorage: until you clear it.</Trans></li>
        </ul>

        <h3><Trans>Your rights</Trans></h3>
        <p><Trans>GDPR rights incl. access, erasure, objection, withdrawal of consent, and complaint to ANSPDCP.</Trans></p>

        <h3><Trans>Children</Trans></h3>
        <p><Trans>Not directed to children under 16.</Trans></p>

        <h3><Trans>Changes</Trans></h3>
        <p><Trans>We may update this policy; we’ll post changes with a new effective date.</Trans></p>
      </div>
    </div>
  )
}


