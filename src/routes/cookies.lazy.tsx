import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getConsent, setConsent, type ConsentPreferences, onConsentChange, acceptAll, declineAll } from '@/lib/consent'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trans, t } from '@lingui/macro'

export const Route = createLazyFileRoute('/cookies')({
  component: CookieSettingsPage,
})

function CookieSettingsPage() {
  const [prefs, setPrefs] = useState<ConsentPreferences>(getConsent())

  useEffect(() => {
    setPrefs(getConsent())
    const off = onConsentChange((next) => setPrefs(next))
    return () => off()
  }, [])

  const onSave = () => {
    // Persist current state (may already be persisted when toggling)
    setConsent(prefs)
    setPrefs(getConsent())
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold"><Trans>Cookie Settings</Trans></h1>
        <p className="text-muted-foreground"><Trans>Manage your preferences for Transparenta.eu.</Trans></p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle><Trans>Essential cookies</Trans></CardTitle>
            <CardDescription>
              <Trans>Required for core functionality like security and preferences. Always on.</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Switch checked disabled aria-readonly className="mr-2" />
            <span className="text-sm text-muted-foreground"><Trans>Always enabled</Trans></span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Trans>Analytics cookies (PostHog)</Trans></CardTitle>
            <CardDescription>
              <Trans>Help us understand usage to improve the product. No analytics is sent unless you opt in.</Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium"><Trans>Usage analytics</Trans></div>
                <div className="text-sm text-muted-foreground"><Trans>Anonymous usage patterns, page views, interactions.</Trans></div>
              </div>
              <Switch
                checked={prefs.analytics}
                onCheckedChange={(v) => {
                  const next = { ...prefs, analytics: Boolean(v) }
                  setConsent(next)
                  setPrefs(getConsent())
                }}
                aria-label={t`Toggle analytics cookies`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Trans>Error reporting (Sentry)</Trans></CardTitle>
            <CardDescription>
              <Trans>
                Help us fix problems by sending error reports. When disabled, we only send anonymous, minimal error telemetry necessary to keep the service reliable.
              </Trans>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium"><Trans>Enhanced error reporting</Trans></div>
                <div className="text-sm text-muted-foreground"><Trans>Includes additional error context. No user identity is attached.</Trans></div>
              </div>
              <Switch
                checked={prefs.sentry}
                onCheckedChange={(v) => {
                  const next = { ...prefs, sentry: Boolean(v) }
                  setConsent(next)
                  setPrefs(getConsent())
                }}
                aria-label={t`Toggle enhanced error reporting`}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => { declineAll(); setPrefs(getConsent()) }}><Trans>Essential only</Trans></Button>
          <Button onClick={() => { acceptAll(); setPrefs(getConsent()) }}><Trans>Accept all</Trans></Button>
          <Button variant="ghost" onClick={onSave}><Trans>Save preferences</Trans></Button>
          <span className="text-sm text-muted-foreground"><Trans>Updated:</Trans> {new Date(prefs.updatedAt).toLocaleString()}</span>
        </div>

        <div className="text-sm text-muted-foreground">
          <Trans>
            Read our <Link to="/cookie-policy" className="underline">Cookie Policy</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
          </Trans>
        </div>
      </div>
    </div>
  )
}


