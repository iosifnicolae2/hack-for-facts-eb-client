import { useEffect } from "react";
import { Outlet, useRouter } from "@tanstack/react-router";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { PostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";
import { I18nProvider } from "@lingui/react";
import { i18n } from "@lingui/core";
import { getUserLocale } from "@/lib/utils";
import { hasAnalyticsConsent, onConsentChange } from "@/lib/consent";
import { useSentryConsent } from "@/hooks/useSentryConsent";
import { AuthProvider, authKey } from "@/lib/auth";
import { env } from "@/config/env";
import { cleanupSentry, initSentry } from "@/lib/sentry";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from "sonner";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { HotkeysProvider } from "react-hotkeys-hook";
import { MobileSidebarFab } from "@/components/sidebar/mobile-sidebar-fab";
import { FloatingEntitySearch } from "@/components/entities/FloatingEntitySearch";
import { AppFooter } from "@/components/footer/AppFooter";
import { ChatFab } from "@/components/footer/ChatFab";
import { CookieConsentBanner } from "@/components/privacy/CookieConsentBanner";
import { Analytics } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";

type AppShellProps = {
  queryClient: QueryClient;
};

export default function AppShell({ queryClient }: AppShellProps) {
  const router = useRouter();
  const hasSentryConsent = useSentryConsent();
  const isMobile = useIsMobile();

  useEffect(() => {
    const userLocale = getUserLocale();
    Analytics.capture(Analytics.EVENTS.DefaultLanguage, { locale: userLocale });
    try {
      document.documentElement.setAttribute("lang", userLocale);
    } catch { }
  }, []);

  useEffect(() => {
    if (hasSentryConsent) {
      initSentry(router);
    } else {
      cleanupSentry();
    }
  }, [hasSentryConsent, router]);

  useEffect(() => {
    if (!hasAnalyticsConsent()) {
      posthog.opt_out_capturing();
    } else {
      posthog.opt_in_capturing();
    }

    const unsubscribe = onConsentChange((prefs) => {
      if (prefs.analytics) {
        posthog.opt_in_capturing();
      } else {
        posthog.opt_out_capturing();
      }
    });

    if (env.VITE_POSTHOG_ENABLED) {
      try {
        posthog.register({
          app_version: env.VITE_APP_VERSION,
          app_name: env.VITE_APP_NAME,
          environment: env.VITE_APP_ENVIRONMENT,
        });
      } catch { }
    }

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider publishableKey={authKey}>
      <PostHogProvider
        apiKey={env.VITE_POSTHOG_API_KEY || ""}
        options={
          env.VITE_POSTHOG_ENABLED
            ? {
              api_host: env.VITE_POSTHOG_HOST,
              person_profiles: env.VITE_POSTHOG_PERSON_PROFILES,
              opt_out_capturing_by_default: true,
              autocapture: false,
              capture_pageview: false,
              disable_session_recording: true,
            }
            : undefined
        }
      >
        <ErrorProvider>
          <QueryClientProvider client={queryClient}>
            <I18nProvider i18n={i18n}>
              <ThemeProvider defaultTheme="light" storageKey="ui-theme">
                <HotkeysProvider>
                  <SidebarProvider>
                    <div className="flex min-h-screen min-w-full">
                      <AppSidebar />
                      <SidebarInset>
                        <main role="main" className="flex-1">
                          <div>
                            <AnalyticsPageviewBridge />
                            <Outlet />
                            <Toaster />
                            {isMobile && <FloatingEntitySearch showButton />}
                          </div>
                        </main>
                        <AppFooter />
                        <ChatFab />
                        <MobileSidebarFab />
                        <CookieConsentBanner />
                      </SidebarInset>
                    </div>
                  </SidebarProvider>
                </HotkeysProvider>
              </ThemeProvider>
            </I18nProvider>
          </QueryClientProvider>
        </ErrorProvider>
      </PostHogProvider>
    </AuthProvider>
  );
}

function AnalyticsPageviewBridge() {
  Analytics.pageviewHook();
  return null;
}
