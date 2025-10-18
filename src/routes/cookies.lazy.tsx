import { createLazyFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useCallback } from 'react'
import { getConsent, setConsent, type ConsentPreferences, onConsentChange, acceptAll, declineAll } from '@/lib/consent'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trans } from '@lingui/react/macro'
import { t } from '@lingui/core/macro'
import { useAuth } from '@/lib/auth'

export const Route = createLazyFileRoute('/cookies')({
  component: CookieSettingsPage,
})

function CookieSettingsPage() {
  const [prefs, setPrefs] = useState<ConsentPreferences>(getConsent())
  const { isEnabled: isAuthEnabled, isSignedIn } = useAuth()
  const navigate = useNavigate({ from: '/cookies' })

  useEffect(() => {
    setPrefs(getConsent())
    const off = onConsentChange((next) => setPrefs(next))
    return () => off()
  }, [])

  const updateConsent = useCallback((patch: Partial<ConsentPreferences>) => {
    const current = getConsent()
    setConsent({ ...current, ...patch })
    setPrefs(getConsent())
  }, [])

  const handleAnalyticsToggle = useCallback((checked: boolean) => {
    updateConsent({ analytics: Boolean(checked) })
  }, [updateConsent])

  const handleSentryToggle = useCallback((checked: boolean) => {
    updateConsent({ sentry: Boolean(checked) })
  }, [updateConsent])

  const handleAllowEssentialOnly = useCallback(() => {
    declineAll()
    setPrefs(getConsent())
    navigate({ to: '/' })
  }, [navigate])

  const handleAllowAll = useCallback(() => {
    acceptAll()
    setPrefs(getConsent())
    navigate({ to: '/' })
  }, [navigate])

  const handleAcceptSelected = useCallback(() => {
    navigate({ to: '/' })
  }, [navigate])

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-2xl font-semibold"><Trans>Cookie Settings</Trans></h1>
        <p className="text-muted-foreground"><Trans>Choose between essential-only or all cookies, then fine-tune options below.</Trans></p>
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
            <div className="flex items-center gap-3">
              <Switch checked disabled aria-readonly className="mr-2" />
              <span className="text-sm text-muted-foreground"><Trans>Always enabled</Trans></span>
            </div>
            {isAuthEnabled && (
              <p className="mt-3 text-sm text-muted-foreground">
                {isSignedIn ? (
                  <Trans>
                    You are signed in. Authentication cookies (Clerk) are essential and required to keep you signed in. Deleting them will sign you out.
                  </Trans>
                ) : (
                  <Trans>
                    If you sign in, authentication cookies (Clerk) are essential to manage your session. Deleting them will sign you out.
                  </Trans>
                )}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle><Trans>Analytics (PostHog)</Trans></CardTitle>
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
                onCheckedChange={handleAnalyticsToggle}
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
                onCheckedChange={handleSentryToggle}
                aria-label={t`Toggle enhanced error reporting`}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick actions moved to the bottom */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <Button
            variant="secondary"
            onClick={handleAllowEssentialOnly}
            className="w-full sm:w-auto min-w-[200px]"
            aria-label={t`Allow essential cookies only`}
          >
            <Trans>Allow essential only</Trans>
          </Button>
          <Button
            onClick={handleAcceptSelected}
            className="w-full sm:w-auto min-w-[200px]"
            aria-label={t`Save cookie preferences`}
          >
            <Trans>Confirm choices</Trans>
          </Button>
          <Button
            onClick={handleAllowAll}
            className="w-full sm:w-auto min-w-[200px]"
            aria-label={t`Allow all cookies`}
          >
            <Trans>Allow all</Trans>
          </Button>
          <span className="text-sm text-muted-foreground self-center">
            <Trans>Updated:</Trans> {new Date(prefs.updatedAt).toLocaleString()}
          </span>
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
