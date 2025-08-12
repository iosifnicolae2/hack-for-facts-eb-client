import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  const effectiveDate = 'August 12, 2025'
  const version = '1.0'
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Effective Date: {effectiveDate} • Version: {version}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">At a Glance</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Local-first: charts and preferences are stored in your browser.</li>
          <li>Analytics and enhanced error reporting only with your consent.</li>
          <li>No accounts required; no selling of personal data.</li>
        </ul>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3>Who we are</h3>
        <p>
          Controller: Claudiu Constantin Bogdan, persoana fizica. Contact: contact@devostack.com.
        </p>

        <h3>What we process</h3>
        <ul>
          <li>Essential technical data and consent preferences (legitimate interests).</li>
          <li>Usage analytics via PostHog (consent-only, custom events, no autocapture).</li>
          <li>Enhanced error reporting via Sentry (consent-only); minimal telemetry otherwise.</li>
          <li>User-created charts/annotations/filters stored locally (localStorage).</li>
        </ul>

        <h3>Purposes and legal bases</h3>
        <ul>
          <li>Operate and secure the service (legitimate interests).</li>
          <li>Improve product and fix issues (consent for analytics/error context).</li>
        </ul>

        <h3>Data sources and licensing</h3>
        <p>
          Public sector information from Ministerul Finanțelor, made available as open data. No government affiliation.
        </p>

        <h3>Sharing and processors</h3>
        <p>PostHog (analytics), Sentry (error reporting), hosting providers. EU-first; safeguards for transfers.</p>

        <h3>Retention</h3>
        <ul>
          <li>LocalStorage: until you clear it.</li>
        </ul>

        <h3>Your rights</h3>
        <p>GDPR rights incl. access, erasure, objection, withdrawal of consent, and complaint to ANSPDCP.</p>

        <h3>Children</h3>
        <p>Not directed to children under 16.</p>

        <h3>Changes</h3>
        <p>We may update this policy; we’ll post changes with a new effective date.</p>
      </div>
    </div>
  )
}


