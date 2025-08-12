import { createLazyFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { Seo } from '@/lib/seo'

export const Route = createLazyFileRoute('/terms')({
  component: TermsPage,
})

function TermsPage() {
  const effectiveDate = 'August 12, 2025'
  const version = '1.0'
  return (
    <div className="mx-auto w-full max-w-4xl p-6 space-y-6">
      <Seo title="Terms of Use – Transparenta.eu" description="Terms for using the Transparenta.eu service and visualizations." />
      <div>
        <h1 className="text-3xl font-semibold">Terms of Use</h1>
        <p className="text-sm text-muted-foreground">Effective Date: {effectiveDate} • Version: {version}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">At a Glance</h2>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Informational purposes only; no warranties.</li>
          <li>Independent project; no government affiliation.</li>
          <li>Exports must include attribution to data source and Transparenta.eu.</li>
        </ul>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h3>Acceptance</h3>
        <p>By using the Service, you agree to these Terms. If you disagree, please do not use the Service.</p>

        <h3>Service and data sources</h3>
        <p>The Service provides tools to explore, analyze, and visualize public budget execution data from Romania.</p>
        <ul>
          <li><strong>No Government Affiliation:</strong> Transparenta.eu is an independent project and is not affiliated with, authorized, maintained, sponsored, or endorsed by any Romanian government entity.</li>
          <li><strong>Disclaimer of Warranties and Guarantees:</strong> The Service and all data, content, and visualizations are provided on an “as is” and “as available” basis, without any warranties or guarantees of any kind, express or implied. We explicitly disclaim all warranties, including but not limited to warranties of merchantability, fitness for a particular purpose, accuracy, completeness, timeliness, reliability, or non-infringement. We do not guarantee that the Service will be uninterrupted, error-free, or secure.</li>
          <li><strong>Data Accuracy Is Not Guaranteed:</strong> The financial data is sourced from third-party government portals. We do not create, verify, or audit this data and are not responsible for any errors, omissions, or inaccuracies it may contain. You acknowledge that the data may be incomplete, out of date, or incorrect.</li>
        </ul>

        <h3>User responsibilities and assumption of risk</h3>
        <ul>
          <li><strong>Full Assumption of Risk:</strong> Your use of the Service and reliance on any information or visualization provided is done entirely at your own risk. You are solely responsible for any decisions made or actions taken based on this information.</li>
          <li><strong>Duty to Verify:</strong> You are solely responsible for independently verifying all information against original, official sources before using it for any purpose, including but not limited to journalistic, academic, financial, or legal matters. The content on this site is for general informational purposes only and is not professional, financial, or legal advice.</li>
          <li><strong>Lawful Use:</strong> You agree to use the Service only for lawful purposes and in a manner that does not harm the Service or its users. You must not remove or obscure any attribution notices on exported content.</li>
        </ul>

        <h3>Intellectual property</h3>
        <ul>
          <li>Open data follows the source license.</li>
          <li>User annotations created locally remain yours.</li>
        </ul>

        <h3>Exports and attribution</h3>
        <p>Include visible attribution to the data source and Transparenta.eu when sharing charts/maps.</p>
        <blockquote>
          <p><strong>Recommended:</strong> Chart: „Titlul Graficului” | Source: Ministerul Finanțelor (Open Data), via Transparenta.eu.</p>
        </blockquote>

        <h3>Limitation of liability</h3>
        <p>
          To the maximum extent permitted by applicable law, Claudiu Constantin Bogdan and any owners, contributors, and affiliates shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to, damages for loss of profits, revenue, data, goodwill, or other intangible losses, resulting from: (i) your access to, use of, or inability to use the Service; (ii) any reliance on the data, content, or visualizations presented by the Service, regardless of any errors, omissions, or inaccuracies therein; or (iii) any financial, professional, personal, or other loss or damage incurred as a result of using the information from the Service. This limitation applies whether the alleged liability is based on contract, tort, negligence, strict liability, or any other basis, even if we have been advised of the possibility of such damage. Your sole and exclusive remedy for any dispute with us is to stop using the Service.
        </p>

        <h3>Availability and changes</h3>
        <p>We may change or discontinue the Service at any time.</p>

        <h3>Governing law</h3>
        <p>Romanian law and applicable EU law. Venue: Sibiu, Romania.</p>

        <h3>Contact</h3>
        <p>Contact us at contact@devostack.com. See also our <Link to="/privacy" className="underline">Privacy Policy</Link> and <Link to="/cookie-policy" className="underline">Cookie Policy</Link>.</p>
      </div>
    </div>
  )
}


