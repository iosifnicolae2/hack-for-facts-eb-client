import { Link, createLazyFileRoute } from '@tanstack/react-router'
import { t } from '@lingui/core/macro'
import { ShieldCheck, ShieldX, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getLearningCertificateById } from '@/features/learning/components/certificates/certificates-storage'
import { getSiteUrl } from '@/config/env'

export const Route = createLazyFileRoute('/$lang/learning/certificates/$id')({
  component: CertificateVerificationPage,
})

function CertificateVerificationPage() {
  const { lang, id } = Route.useParams()
  const certificate = getLearningCertificateById(id)

  const isValid = Boolean(certificate)

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={
                isValid
                  ? 'flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10 text-green-700'
                  : 'flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive'
              }
            >
              {isValid ? <ShieldCheck className="h-5 w-5" /> : <ShieldX className="h-5 w-5" />}
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {isValid ? t`Certificate verified (PoC)` : t`Certificate not found`}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t`This is a proof-of-concept verification page stored in your browser.`}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {certificate ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Certificate ID`}</span>
                <span className="font-mono">{certificate.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Recipient`}</span>
                <span className="font-medium">{certificate.recipientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`User ID`}</span>
                <span className="font-mono">{certificate.userId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Issued at`}</span>
                <span>{new Date(certificate.issuedAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Learning path`}</span>
                <span className="font-medium">{certificate.pathId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">{t`Tier`}</span>
                <span className="font-medium">{certificate.tier}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t`No certificate record was found for this ID in local storage.`}
            </p>
          )}

          <Button variant="outline" asChild>
            <Link to={`/${lang}/learning` as '/'}>
              <ArrowLeft className="mr-2 h-4 w-4" /> {t`Back to learning`}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function buildCertificateHead(id: string, lang: string) {
  const site = getSiteUrl()
  const canonical = `${site}/${lang}/learning/certificates/${id}`
  const title = t`Learning Certificate Verification (PoC)`
  const description = t`Verify a learning certificate (proof of concept).`
  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'og:title', content: title },
      { name: 'og:description', content: description },
      { name: 'og:url', content: canonical },
      { name: 'canonical', content: canonical },
      { name: 'robots', content: 'noindex,follow' },
    ],
  }
}

export function head({ params }: { readonly params: { readonly id: string, readonly lang: string } }) {
  return buildCertificateHead(params.id, params.lang)
}
