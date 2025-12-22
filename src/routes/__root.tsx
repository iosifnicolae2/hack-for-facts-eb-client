import { ThemeProvider } from "@/components/theme/theme-provider";
import { i18n } from "@lingui/core";
import { dynamicActivate } from "@/lib/i18n";
import { createRootRoute, Outlet, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from "sonner";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { HotkeysProvider } from "react-hotkeys-hook";
import { MobileSidebarFab } from "@/components/sidebar/mobile-sidebar-fab";
import { queryClient } from "@/lib/queryClient";
import { FloatingEntitySearch } from "@/components/entities/FloatingEntitySearch";
import { AppFooter } from "@/components/footer/AppFooter";
import { ChatFab } from "@/components/footer/ChatFab";
import { CookieConsentBanner } from "@/components/privacy/CookieConsentBanner";
import { Analytics } from "@/lib/analytics";
import { getSiteUrl } from "@/config/env";
import { useEffect } from "react";
import { I18nProvider } from "@lingui/react";
import { getUserLocale } from "@/lib/utils";
import GlobalErrorPage from "@/components/errors/GlobalErrorPage";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Home, FileQuestion } from "lucide-react";
import { t } from "@lingui/core/macro";

export const Route = createRootRoute({
  head: getGlobalHead,
  errorComponent: ({ error }) => <GlobalErrorPage error={error} />,
  notFoundComponent: NotFoundPage,
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    const userLocale = getUserLocale();
    dynamicActivate(userLocale);
    Analytics.capture(Analytics.EVENTS.DefaultLanguage, { locale: userLocale });
    try {
      document.documentElement.setAttribute('lang', userLocale);
    } catch { }
  }, []);

  const isMobile = useIsMobile();

  return (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <I18nProvider i18n={i18n}>
          <ThemeProvider defaultTheme="light" storageKey="ui-theme">
            <HotkeysProvider>
              <SidebarProvider>
                <HeadContent />
                <AppSidebar />
                <SidebarInset>
                  <div className="flex-1">
                    <AnalyticsPageviewBridge />
                    <Outlet />
                    <Toaster />
                    {isMobile && <FloatingEntitySearch showButton />}
                  </div>
                  <AppFooter />
                  <ChatFab />
                  <MobileSidebarFab />
                  <CookieConsentBanner />
                  <Scripts />
                </SidebarInset>
              </SidebarProvider>
            </HotkeysProvider>
          </ThemeProvider>
        </I18nProvider>
      </QueryClientProvider>
    </ErrorProvider>
  );
}

function AnalyticsPageviewBridge() {
  Analytics.pageviewHook();
  return null;
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {t`Page not found`}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t`The page you are looking for doesn't exist or has been moved.`}
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              {t`Go to homepage`}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function getGlobalHead() {
  const site = getSiteUrl()
  return {
    meta: [
      {
        name: 'keywords',
        content:
          'execuții bugetare, extranet anaf, anaf, executii bugetare, bugetul statului, transparență bugetară, transparenta bugetara, analiză bugetară, analiza bugetara, cheltuieli publice, venituri publice, buget local, buget județean, UAT, hartă cheltuieli, harta cheltuieli, vizualizare buget, vizualizare date, finanțe publice, finante publice, România, Romania',
      },
      {
        name: 'ai:site:instructions',
        content:
          'Use /entities/{cui} for single-entity analytics; /entity-analytics for cross-entity analytics; /budget-explorer for multi-filter budget exploration.',
      },
      {
        name: 'ai:routes',
        content: JSON.stringify({
          '/entities/{cui}': 'Entity details and analytics (views, period, normalization).',
          '/entity-analytics': 'Cross-entity analytics (filter by years, categories, geography).',
          '/budget-explorer': 'Explore and slice budget across years and categories.',
        }),
      },
      { name: 'ai:parameters:index', content: 'https://transparenta.eu/ai/index.json' },
    ],
    scripts: [
      // Global WebSite & FAQ JSON-LD for AI agents
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Transparenta.eu',
          url: site,
          potentialAction: {
            '@type': 'SearchAction',
            target: `${site}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        }),
      },
      // Organization entity to improve entity recognition and citations
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          '@id': `${site}#organization`,
          name: 'Transparenta.eu',
          alternateName: 'Romanian Budget Transparency Platform',
          url: site,
          logo: `${site}/logo.png`,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'Data Support',
            email: 'contact@transparenta.eu',
          },
        }),
      },
    ],
  }
}
