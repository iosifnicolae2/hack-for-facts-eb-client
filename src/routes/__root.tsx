import { ThemeProvider } from "@/components/theme/theme-provider";
import { i18n } from "@lingui/core";
import { dynamicActivate } from "@/lib/i18n";
import { createRootRoute, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
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
import { useEffect, Suspense } from "react";
import { I18nProvider } from "@lingui/react";
import { getUserLocale } from "@/lib/utils";
import GlobalErrorPage from "@/components/errors/GlobalErrorPage";
import { useIsMobile } from "@/hooks/use-mobile";
import { ViewLoading } from "@/components/ui/ViewLoading";

export const Route = createRootRoute({
  head: getGlobalHead,
  errorComponent: ({ error }) => <GlobalErrorPage error={error} />,
  component: () => {
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
                  <div className="flex min-h-screen min-w-full">
                    <HeadContent />
                    <AppSidebar />
                    <SidebarInset>
                      <main className="flex-1">
                        <div>
                          <AnalyticsPageviewBridge />
                          <Suspense fallback={<ViewLoading />}>
                            <Outlet />
                          </Suspense>
                          <Toaster />
                          {isMobile && <FloatingEntitySearch showButton />}
                        </div>
                      </main>
                      <AppFooter />
                      <ChatFab />
                      <MobileSidebarFab />
                      <CookieConsentBanner />
                      <Scripts />
                    </SidebarInset>
                  </div>
                </SidebarProvider>
              </HotkeysProvider>
            </ThemeProvider>
          </I18nProvider>
        </QueryClientProvider>
      </ErrorProvider>
    );
  },
  beforeLoad: async () => { },
});

function AnalyticsPageviewBridge() {
  Analytics.pageviewHook();
  return null;
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
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Which path for a specific entity?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use /entities/{cui}. Add ?year, ?period=YEAR|QUARTER|MONTH, ?view, and normalization parameters as needed.',
              },
            },
            {
              '@type': 'Question',
              name: 'Which path for overall budget exploration?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use /budget-explorer. Combine year range, categories, and view options (overview, treemap, sankey, list).',
              },
            },
            {
              '@type': 'Question',
              name: 'Which path for analytics across entities?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Use /entity-analytics to compare entities. Filter by time, categories, and geography; switch between table, charts, and line-items views.',
              },
            },
          ],
        }),
      },
    ],
  }
}
