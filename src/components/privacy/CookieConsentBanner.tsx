"use client";

import { useEffect, useState, type ReactElement } from "react";
import { Cookie } from "lucide-react";
import { acceptAll, declineAll } from "@/lib/consent";
import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    setTimeout(() => {
      acceptAll();
      setShowBanner(false);
    }, 400);
  };

  const declineCookies = () => {
    setIsExiting(true);
    setTimeout(() => {
      declineAll();
      setShowBanner(false);
    }, 400);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 p-3 md:p-6 transition-transform duration-500 ease-in-out ${
        isExiting ? "translate-y-full" : "translate-y-0"
      }`}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <Card className="mx-auto max-w-5xl rounded-2xl border bg-card/40 shadow-xl backdrop-blur supports-[backdrop-filter]:bg-card/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Cookie className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg md:text-xl">Cookie settings</CardTitle>
          </div>
          <CardDescription>
            Essential cookies keep the app working. With your permission, we also use analytics cookies (PostHog) to
            understand usage and improve Transparenta.eu.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-end">
            <Button variant="link" onClick={declineCookies} className="text-amber-600">
              Essential only
            </Button>
            <Button onClick={acceptCookies} className="px-6">
              Accept analytics
            </Button>
            <Button asChild variant="link">
              <Link to="/cookies">Cookie Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


