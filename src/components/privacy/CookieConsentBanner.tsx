import { useCallback, useEffect, useState, type ReactElement } from "react";
import { CookieIcon } from "lucide-react";
import { acceptAll } from "@/lib/consent";
import { onConsentChange } from "@/lib/consent";
import { Analytics } from "@/lib/analytics";
import { Trans } from "@lingui/react/macro";
import { Link, useLocation } from "@tanstack/react-router";

/**
 * CookieConsentBanner
 *
 * A GDPR-compliant cookie consent banner that clearly explains data usage,
 * provides balanced choices, and respects user privacy.
 */
export function CookieConsentBanner(): ReactElement | null {
  const [isBannerVisible, setBannerVisible] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const { pathname } = useLocation();

  const showBanner = useCallback(() => {
    // We only want to run this logic on the client
    if (typeof window === "undefined") return;

    if (pathname.includes("/cookies")) {
      setBannerVisible(false);
      return
    }

    // Show the banner only if the user hasn't made a choice yet.
    const storedConsent = window.localStorage.getItem("cookie-consent");
    const shouldShow = !storedConsent;

    if (shouldShow) {
      setBannerVisible(true);
      // Trigger entrance animation after a brief delay
      setTimeout(() => setIsEntering(true), 50);
    } else {
      setBannerVisible(false);
    }
  }, [pathname]);

  useEffect(() => {
    // Delay showing the banner to avoid disrupting initial page load
    const timer = setTimeout(() => {
      showBanner()
    }, 2000); // 2 second delay

    return () => clearTimeout(timer);
  }, [pathname, showBanner]);

  const handleDecision = (consentFunction: () => void) => {
    setIsEntering(false);
    setIsExiting(true);
    consentFunction();
    // Hide banner after the exit animation completes
    setTimeout(() => setBannerVisible(false), 500);
  };

  if (!isBannerVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-50 p-3 md:p-6 max-w-5xl w-full transition-transform duration-500 ease-in-out ${
        isExiting ? "translate-y-full" : isEntering ? "translate-y-0" : "translate-y-full"
      }`}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <div className="rounded-2xl border border-slate-200/30 bg-white/80 shadow-2xl backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <CookieIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold md:text-xl text-gray-900">
              <Trans>We value your privacy</Trans>
            </h2>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            <Trans>
              We use cookies and similar technologies to enhance your experience, analyze our traffic, and report errors. With your permission, we use PostHog for analytics and Sentry for error reporting to improve our service. You can change your preferences at any time. For more information, please see our{" "}
              <Link to="/privacy" className="font-medium text-blue-600 hover:underline">
                Privacy Policy
              </Link>.
            </Trans>
          </p>

          <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              to="/cookies"
              className="w-full sm:w-auto rounded-lg py-2 px-5 text-center text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Trans>Customize</Trans>
            </Link>
            <button
              onClick={() => handleDecision(acceptAll)}
              className="w-full sm:w-auto sm:ml-auto rounded-lg bg-blue-600 py-2 px-5 text-sm font-medium text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Trans>Accept All</Trans>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Emit analytics when consent changes (runs once in module scope; safe in client)
if (typeof window !== "undefined") {
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