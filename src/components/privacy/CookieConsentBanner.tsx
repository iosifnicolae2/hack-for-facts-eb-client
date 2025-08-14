"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Cookie } from "lucide-react";
import { acceptAll, declineAll } from "@/lib/consent";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { onConsentChange } from "@/lib/consent";
import { Analytics } from "@/lib/analytics";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";

/**
 * CookieConsentBanner
 *
 * Shown only when the user hasn't made a consent choice yet.
 * Defaults to essential-only (analytics disabled) until explicit opt-in.
 */
export function CookieConsentBanner(): ReactElement | null {
  const [showBanner, setShowBanner] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // If user hasn't explicitly accepted analytics yet AND no stored key (first visit), show banner
    const stored = window.localStorage.getItem("cookie-consent");
    setShowBanner(!stored);
  }, []);

  const acceptCookies = () => {
    setIsExiting(true);
    acceptAll();
    setShowBanner(false);
  };

  const declineCookies = () => {
    setIsExiting(true);
    declineAll();
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 p-3 md:p-6 transition-transform duration-500 ease-in-out ${isExiting ? "translate-y-full" : "translate-y-0"
        }`}
      role="dialog"
      aria-live="polite"
      aria-label={t`Cookie consent`}
    >
      <Card className="mx-auto max-w-5xl rounded-2xl border bg-card/80 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg md:text-xl"><Trans>Cookie settings</Trans></CardTitle>
          </div>
          <CardDescription>
            <Trans>Essential cookies keep the app working. With your permission, we also use analytics (PostHog) and optional error reporting (Sentry) to understand issues and improve Transparenta.eu.</Trans>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-end">
            <Button variant="link" onClick={declineCookies} className="text-amber-600">
              <Trans>Essential only</Trans>
            </Button>
            <Button onClick={acceptCookies} className="px-6">
              <Trans>Accept all</Trans>
            </Button>
            <Button asChild variant="link">
              <Link to="/cookies"><Trans>Cookie Settings</Trans></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Emit analytics when consent changes (runs once in module scope; safe in client)
if (typeof window !== 'undefined') {
  try {
    onConsentChange((prefs) => {
      Analytics.capture(Analytics.EVENTS.CookieConsentChanged, {
        analytics: prefs.analytics,
        sentry: prefs.sentry,
      });
    });
  } catch {
    // ignore
  }
}


