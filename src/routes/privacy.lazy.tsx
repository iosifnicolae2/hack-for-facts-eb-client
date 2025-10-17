import { createLazyFileRoute } from '@tanstack/react-router'
import { Seo } from '@/lib/seo'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'

export const Route = createLazyFileRoute('/privacy')({
  component: PrivacyPage,
})

function PrivacyPage() {
  const effectiveDate = 'October 17, 2025'
  const version = '2.0'
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
          <li><Trans>Optional user accounts for newsletters and notifications.</Trans></li>
          <li><Trans>Analytics and enhanced error reporting only with your consent.</Trans></li>
          <li><Trans>No selling of personal data.</Trans></li>
          <li><Trans>Basic security logs are kept for a short period to protect accounts.</Trans></li>
        </ul>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3><Trans>Who we are</Trans></h3>
        <p>
          <Trans>Controller: Claudiu Constantin Bogdan, persoana fizica. Contact: contact@devostack.com.</Trans>
        </p>

        <h3><Trans>What personal data we collect</Trans></h3>
        <p><Trans>We collect different types of information depending on how you use our Service:</Trans></p>

        <h4><Trans>Data collected without an account:</Trans></h4>
        <ul>
          <li><Trans><strong>Essential Technical Data:</strong> Browser type, device type, IP address (anonymized), and general location (country level) for security and service provision (legitimate interests under GDPR Art. 6(1)(f)).</Trans></li>
          <li><Trans><strong>Consent Preferences:</strong> Your cookie and analytics consent choices stored in browser localStorage.</Trans></li>
          <li><Trans><strong>Local Storage Data:</strong> Charts, annotations, filters, and preferences stored locally in your browser. This data never leaves your device unless you explicitly export it.</Trans></li>
          <li><Trans><strong>Usage Analytics (opt-in):</strong> If you consent, we collect custom usage events via PostHog to understand how features are used. No autocapture or session recordings.</Trans></li>
          <li><Trans><strong>Error Reports (opt-in):</strong> If you consent, enhanced error context via Sentry to help us fix bugs. Without consent, only minimal error telemetry is collected.</Trans></li>
          <li><Trans><strong>Server Access Logs:</strong> IP address, user agent, requested URL, referrer, and timestamp to detect abuse, ensure reliability, and secure the Service (legitimate interests under GDPR Art. 6(1)(f)).</Trans></li>
        </ul>

        <h4><Trans>Data collected with an account:</Trans></h4>
        <ul>
          <li><Trans><strong>Account Information:</strong> User ID (assigned by Clerk), email address, first name, last name. This is the legal basis for processing under GDPR Art. 6(1)(b) (performance of contract) and Art. 6(1)(a) (consent for newsletters).</Trans></li>
          <li><Trans><strong>Authentication Data:</strong> Login timestamps, login IP address, device details (e.g., user agent), authentication tokens (managed by Clerk), and session information for account security.</Trans></li>
          <li><Trans><strong>Notification Preferences:</strong> Your subscription choices for newsletters (monthly, quarterly, annual) and entity notifications, including which entities you follow and notification types you've enabled.</Trans></li>
          <li><Trans><strong>Notification History:</strong> Records of notifications sent to you, including delivery status and unsubscribe actions, for compliance and delivery optimization.</Trans></li>
        </ul>

        <h3><Trans>How we use your data</Trans></h3>
        <ul>
          <li><Trans><strong>Service Provision:</strong> To operate the Service, provide visualizations, and ensure platform security (legitimate interests - GDPR Art. 6(1)(f)).</Trans></li>
          <li><Trans><strong>Account Management:</strong> To create and maintain your account, authenticate access, and provide account-related support (contract performance - GDPR Art. 6(1)(b)).</Trans></li>
          <li><Trans><strong>Newsletter Delivery:</strong> To send you budget execution updates and notifications that you have explicitly subscribed to (consent - GDPR Art. 6(1)(a)). You can withdraw consent and unsubscribe at any time.</Trans></li>
          <li><Trans><strong>Communication:</strong> To send essential account-related communications (e.g., security alerts, terms updates) as necessary for contract performance and legitimate interests.</Trans></li>
          <li><Trans><strong>Analytics and Improvement:</strong> With your consent, to understand usage patterns and improve the Service (consent - GDPR Art. 6(1)(a)).</Trans></li>
          <li><Trans><strong>Error Detection and Resolution:</strong> With your consent, to identify and fix technical issues (consent - GDPR Art. 6(1)(a)).</Trans></li>
        </ul>

        <h3><Trans>Legal bases for processing</Trans></h3>
        <ul>
          <li><Trans><strong>Legitimate Interests (Art. 6(1)(f)):</strong> Operating and securing the Service, preventing fraud and abuse.</Trans></li>
          <li><Trans><strong>Contract Performance (Art. 6(1)(b)):</strong> Providing account features and services you have requested.</Trans></li>
          <li><Trans><strong>Consent (Art. 6(1)(a)):</strong> Newsletter subscriptions, analytics, and enhanced error reporting. You may withdraw consent at any time.</Trans></li>
          <li><Trans><strong>Legal Obligations (Art. 6(1)(c)):</strong> Compliance with applicable laws and regulations.</Trans></li>
        </ul>

        <h3><Trans>Newsletter consent and management</Trans></h3>
        <ul>
          <li><Trans><strong>Opt-In Consent:</strong> Newsletter subscriptions are strictly opt-in. We only send you newsletters if you explicitly subscribe via the notification settings or entity pages.</Trans></li>
          <li><Trans><strong>What We Send:</strong> Budget execution updates (monthly, quarterly, or annual reports) for entities you follow, and alerts about significant budget changes if you've enabled them.</Trans></li>
          <li><Trans><strong>Unsubscribe:</strong> You can unsubscribe from any newsletter at any time by clicking the unsubscribe link in any email, managing your preferences in your account settings, or contacting us at contact@devostack.com.</Trans></li>
          <li><Trans><strong>No Marketing:</strong> We do not send promotional or marketing emails. All communications are informational updates you have requested.</Trans></li>
          <li><Trans><strong>No Sharing:</strong> We never sell, rent, or share your email address with third parties for their marketing purposes.</Trans></li>
        </ul>

        <h3><Trans>Data sources and licensing</Trans></h3>
        <p><Trans>Public sector information from Ministerul Finanțelor, made available as open data. No government affiliation.</Trans></p>

        <h3><Trans>Data sharing and processors</Trans></h3>
        <p><Trans>We share data with the following trusted service providers who process data on our behalf:</Trans></p>
        <ul>
          <li><Trans><strong>Clerk (Authentication):</strong> Manages user authentication and account data. EU/US with standard contractual clauses.</Trans></li>
          <li><Trans><strong>PostHog (Analytics):</strong> Processes usage analytics if you consent. EU-hosted option available.</Trans></li>
          <li><Trans><strong>Sentry (Error Reporting):</strong> Processes error logs if you consent. EU-first with data residency controls.</Trans></li>
          <li><Trans><strong>Email Service Provider:</strong> Delivers newsletters and notifications you've subscribed to.</Trans></li>
          <li><Trans><strong>Hosting Providers:</strong> Store and serve application data and databases.</Trans></li>
        </ul>
        <p><Trans>All processors are bound by data protection agreements and GDPR-compliant safeguards, including standard contractual clauses for international transfers.</Trans></p>

        <h3><Trans>Data retention</Trans></h3>
        <ul>
          <li><Trans><strong>LocalStorage:</strong> Stored in your browser until you clear it manually.</Trans></li>
          <li><Trans><strong>Account Data:</strong> Retained for as long as your account is active or as needed to provide services. Deleted within 90 days of account deletion request.</Trans></li>
          <li><Trans><strong>Notification Subscriptions:</strong> Retained while active. Soft-deleted (marked inactive) when you unsubscribe, with full deletion after 1 year for compliance and anti-spam purposes.</Trans></li>
          <li><Trans><strong>Newsletter Delivery Records:</strong> Retained for 2 years for delivery troubleshooting and compliance.</Trans></li>
          <li><Trans><strong>Analytics Data:</strong> Retained for 12 months, then automatically deleted or anonymized.</Trans></li>
          <li><Trans><strong>Error Logs:</strong> Retained for 90 days for debugging, then automatically deleted.</Trans></li>
          <li><Trans><strong>Server Access Logs:</strong> Retained for up to 90 days for security and reliability, then automatically deleted.</Trans></li>
        </ul>

        <h3><Trans>Your rights under GDPR</Trans></h3>
        <p><Trans>As a data subject under GDPR, you have the following rights:</Trans></p>
        <ul>
          <li><Trans><strong>Right of Access (Art. 15):</strong> Request a copy of the personal data we hold about you.</Trans></li>
          <li><Trans><strong>Right to Rectification (Art. 16):</strong> Request correction of inaccurate personal data.</Trans></li>
          <li><Trans><strong>Right to Erasure (Art. 17):</strong> Request deletion of your personal data ("right to be forgotten").</Trans></li>
          <li><Trans><strong>Right to Restriction (Art. 18):</strong> Request limitation of processing in certain circumstances.</Trans></li>
          <li><Trans><strong>Right to Data Portability (Art. 20):</strong> Receive your data in a structured, machine-readable format.</Trans></li>
          <li><Trans><strong>Right to Object (Art. 21):</strong> Object to processing based on legitimate interests.</Trans></li>
          <li><Trans><strong>Right to Withdraw Consent (Art. 7(3)):</strong> Withdraw consent for newsletters, analytics, or error reporting at any time without affecting the lawfulness of processing before withdrawal.</Trans></li>
          <li><Trans><strong>Right to Lodge a Complaint:</strong> File a complaint with the Romanian supervisory authority (ANSPDCP) at anspdcp.ro.</Trans></li>
        </ul>
        <p><Trans>To exercise any of these rights, contact us at contact@devostack.com. We will respond within 30 days.</Trans></p>

        <h3><Trans>Data security</Trans></h3>
        <ul>
          <li><Trans><strong>Encryption:</strong> Data in transit is encrypted using TLS/SSL. Data at rest is encrypted in our databases.</Trans></li>
          <li><Trans><strong>Access Controls:</strong> Strict access controls limit who can access personal data to authorized personnel only.</Trans></li>
          <li><Trans><strong>Authentication:</strong> Account access secured via Clerk with industry-standard security practices.</Trans></li>
          <li><Trans><strong>Monitoring:</strong> Security monitoring and logging to detect and respond to potential breaches.</Trans></li>
        </ul>

        <h3><Trans>International data transfers</Trans></h3>
        <p><Trans>Some service providers may process data outside the EU/EEA. All transfers are protected by appropriate safeguards including:</Trans></p>
        <ul>
          <li><Trans>Standard Contractual Clauses (SCCs) approved by the European Commission</Trans></li>
          <li><Trans>Adequacy decisions where applicable</Trans></li>
          <li><Trans>Additional technical and organizational measures</Trans></li>
        </ul>

        <h3><Trans>Automated decision-making</Trans></h3>
        <p><Trans>We do not use automated decision-making or profiling that produces legal effects or similarly significantly affects you.</Trans></p>

        <h3><Trans>Children's privacy</Trans></h3>
        <p><Trans>The Service is not directed to children under 16. We do not knowingly collect personal data from children under 16. If you believe we have collected data from a child under 16, please contact us immediately.</Trans></p>

        <h3><Trans>Changes to this policy</Trans></h3>
        <p><Trans>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will post the updated policy with a new effective date. For material changes, we may provide additional notice such as an email notification to account holders.</Trans></p>

        <h3><Trans>Contact and data protection officer</Trans></h3>
        <p><Trans>For questions about this Privacy Policy, to exercise your rights, or to contact our data protection officer, email us at contact@devostack.com.</Trans></p>

        <h3><Trans>Supervisory authority</Trans></h3>
        <p><Trans>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), B-dul G-ral. Gheorghe Magheru 28-30, Sector 1, București, Romania. Website: anspdcp.ro</Trans></p>
      </div>
    </div>
  )
}

