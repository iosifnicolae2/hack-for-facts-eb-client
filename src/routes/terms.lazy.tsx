import { createLazyFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Seo } from '@/lib/seo'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'

export const Route = createLazyFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  const effectiveDate = 'October 17, 2025'
  const version = '2.0'
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-6">
      <Seo title={t`Terms of Use – Transparenta.eu`} description={t`Terms for using the Transparenta.eu service and visualizations.`} />
      <div>
        <h1 className="text-3xl font-semibold"><Trans>Terms of Use</Trans></h1>
        <p className="text-sm text-muted-foreground"><Trans>Effective Date: {effectiveDate} • Version: {version}</Trans></p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium"><Trans>At a Glance</Trans></h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li><Trans>Informational purposes only; no warranties.</Trans></li>
          <li><Trans>Independent project; no government affiliation.</Trans></li>
          <li><Trans>Exports must include attribution to data source and Transparenta.eu.</Trans></li>
          <li><Trans>Optional user accounts for enhanced features like newsletters and notifications.</Trans></li>
        </ul>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3><Trans>Acceptance</Trans></h3>
        <p><Trans>By using the Service, you agree to these Terms. If you disagree, please do not use the Service.</Trans></p>
        <p><Trans>Your use of the Service is also governed by our <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/cookie-policy" className="underline">Cookie Policy</Link>, which describe how we process personal data, including security logs, authentication data, and your communication preferences.</Trans></p>

        <h3><Trans>Service and data sources</Trans></h3>
        <p><Trans>The Service provides tools to explore, analyze, and visualize public budget execution data from Romania.</Trans></p>
        <ul>
          <li><Trans><strong>No Government Affiliation:</strong> Transparenta.eu is an independent project and is not affiliated with, authorized, maintained, sponsored, or endorsed by any Romanian government entity.</Trans></li>
          <li><Trans><strong>Disclaimer of Warranties and Guarantees:</strong> The Service and all data, content, and visualizations are provided on an "as is" and "as available" basis, without any warranties or guarantees of any kind, express or implied. We explicitly disclaim all warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, timeliness, reliability, or non-infringement. We do not guarantee that the Service will be uninterrupted, error-free, or secure.</Trans></li>
          <li><Trans><strong>Data Accuracy Is Not Guaranteed:</strong> The financial data is sourced from third-party government portals. We do not create, verify, or audit this data and are not responsible for any errors, omissions, or inaccuracies it may contain. You acknowledge that the data may be incomplete, out of date, or incorrect.</Trans></li>
        </ul>

        <h3><Trans>User accounts and authentication</Trans></h3>
        <ul>
          <li><Trans><strong>Optional Accounts:</strong> User accounts are optional. You can use core features without creating an account. Creating an account enables additional features such as newsletters, notifications, and saved preferences.</Trans></li>
          <li><Trans><strong>Account Creation:</strong> When you create an account, you may be asked to provide certain information such as your email address and name. You are responsible for maintaining the confidentiality of your account credentials.</Trans></li>
          <li><Trans><strong>Third-Party Authentication:</strong> We use Clerk for authentication services. By creating an account, you also agree to Clerk's terms of service.</Trans></li>
          <li><Trans><strong>Account Termination:</strong> You may delete your account at any time. We may suspend or terminate accounts that violate these Terms or applicable law.</Trans></li>
        </ul>

        <h3><Trans>Newsletters and notifications</Trans></h3>
        <ul>
          <li><Trans><strong>Subscription:</strong> If you have an account, you may subscribe to receive newsletters and notifications about budget execution updates for entities you follow. Subscriptions are opt-in and you must explicitly choose to receive these communications.</Trans></li>
          <li><Trans><strong>Types of Communications:</strong> We may send monthly, quarterly, or annual budget reports, as well as alerts about specific data changes, based on your notification preferences.</Trans></li>
          <li><Trans><strong>Unsubscribe:</strong> You may unsubscribe from newsletters and notifications at any time via the unsubscribe link in any email, through your account settings, or by contacting us.</Trans></li>
          <li><Trans><strong>Email Delivery:</strong> We use your email address solely for delivering the notifications you have subscribed to and for essential account-related communications. We do not sell, rent, or share your email address with third parties for marketing purposes.</Trans></li>
          <li><Trans><strong>Consent:</strong> Newsletters and non-essential notifications are sent only with your explicit consent. You can withdraw consent at any time without affecting your account access.</Trans></li>
        </ul>

        <h3><Trans>Security monitoring and logs</Trans></h3>
        <ul>
          <li><Trans><strong>Security Logs:</strong> For safeguarding accounts and the Service, we maintain basic security logs such as IP address, user agent, timestamps, and actions (e.g., sign-in, unsubscribe) in accordance with our Privacy Policy.</Trans></li>
          <li><Trans><strong>Limited Retention:</strong> Security logs are retained only for a limited period to detect and prevent abuse, troubleshoot issues, and ensure reliability.</Trans></li>
        </ul>

        <h3><Trans>User responsibilities and assumption of risk</Trans></h3>
        <ul>
          <li><Trans><strong>Full Assumption of Risk:</strong> Your use of the Service and reliance on any information or visualization provided is done entirely at your own risk. You are solely responsible for any decisions made or actions taken based on this information.</Trans></li>
          <li><Trans><strong>Duty to Verify:</strong> You are solely responsible for independently verifying all information against original, official sources before using it for any purpose, including but not limited to journalistic, academic, financial, or legal matters. The content on this site is for general informational purposes only and is not professional, financial, or legal advice.</Trans></li>
          <li><Trans><strong>Lawful Use:</strong> You agree to use the Service only for lawful purposes and in a manner that does not harm the Service or its users. You must not remove or obscure any attribution notices on exported content.</Trans></li>
          <li><Trans><strong>Accurate Information:</strong> If you create an account, you agree to provide accurate and current information and to keep your account information updated.</Trans></li>
        </ul>

        <h3><Trans>Intellectual property</Trans></h3>
        <ul>
          <li><Trans>Open data follows the source license.</Trans></li>
          <li><Trans>User annotations created locally remain yours.</Trans></li>
          <li><Trans>The Service's software, design, and original content are protected by copyright and other intellectual property laws.</Trans></li>
        </ul>

        <h3><Trans>Exports and attribution</Trans></h3>
        <p><Trans>Include visible attribution to the data source and Transparenta.eu when sharing charts/maps.</Trans></p>
        <blockquote>
          <p><Trans><strong>Recommended:</strong> Chart: „Titlul Graficului" | Source: Ministerul Finanțelor (Open Data), via Transparenta.eu.</Trans></p>
        </blockquote>

        <h3><Trans>Data storage and retention</Trans></h3>
        <ul>
          <li><Trans><strong>Account Data:</strong> When you create an account, we store your user ID, name, email address, and notification preferences for as long as your account is active.</Trans></li>
          <li><Trans><strong>Notification Subscriptions:</strong> We store your notification subscription preferences, including the entities you follow and the types of updates you wish to receive.</Trans></li>
          <li><Trans><strong>Deletion:</strong> You may request deletion of your account and all associated data at any time by contacting us or using account deletion features when available.</Trans></li>
        </ul>

        <h3><Trans>Limitation of liability</Trans></h3>
        <p><Trans>To the maximum extent permitted by applicable law, Claudiu Constantin Bogdan and any owners, contributors, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, revenue, data, goodwill, or other intangible losses, resulting from: (i) your access to, use of, or inability to use the Service; (ii) any reliance on the data, content, or visualizations presented by the Service, regardless of any errors, omissions, or inaccuracies therein; (iii) any financial, professional, personal, or other loss or damage incurred as a result of using the information from the Service; or (iv) any unauthorized access to or use of our servers and any personal information stored therein. This limitation applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if we have been advised of the possibility of such damage. Your sole and exclusive remedy for any dispute with us is to stop using the Service.</Trans></p>

        <h3><Trans>Availability and changes</Trans></h3>
        <p><Trans>We may change or discontinue the Service at any time. We may update these Terms from time to time and will post the updated version with a new effective date.</Trans></p>

        <h3><Trans>Governing law</Trans></h3>
        <p><Trans>Romanian law and applicable EU law, including GDPR. Venue: Sibiu, Romania.</Trans></p>

        <h3><Trans>Contact</Trans></h3>
        <p><Trans>Contact us at contact@transparenta.eu See also our <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/cookie-policy" className="underline">Cookie Policy</Link>.</Trans></p>
      </div>
    </div>
  )
}

