import { createLazyFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { getConsent, setConsent, type ConsentPreferences, onConsentChange, acceptAll, declineAll } from '@/lib/consent'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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
        <h1 className="text-2xl font-semibold">Cookie Settings</h1>
        <p className="text-muted-foreground">Manage your preferences for Transparenta.eu.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Essential cookies</CardTitle>
            <CardDescription>
              Required for core functionality like security and preferences. Always on.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Switch checked disabled aria-readonly className="mr-2" />
            <span className="text-sm text-muted-foreground">Always enabled</span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics cookies (PostHog)</CardTitle>
            <CardDescription>
              Help us understand usage to improve the product. No analytics is sent unless you opt in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Usage analytics</div>
                <div className="text-sm text-muted-foreground">Anonymous usage patterns, page views, interactions.</div>
              </div>
              <Switch
                checked={prefs.analytics}
                onCheckedChange={(v) => {
                  const next = { ...prefs, analytics: Boolean(v) }
                  setConsent(next)
                  setPrefs(getConsent())
                }}
                aria-label="Toggle analytics cookies"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => { declineAll(); setPrefs(getConsent()) }}>Essential only</Button>
          <Button onClick={() => { acceptAll(); setPrefs(getConsent()) }}>Accept analytics</Button>
          <Button variant="ghost" onClick={onSave}>Save preferences</Button>
          <span className="text-sm text-muted-foreground">Updated: {new Date(prefs.updatedAt).toLocaleString()}</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Read our <Link to="/cookie-policy" className="underline">Cookie Policy</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  )
}


