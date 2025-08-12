import { ThemeProvider } from "@/components/theme/theme-provider";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { Toaster } from "sonner";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { HotkeysProvider } from "react-hotkeys-hook";
import { MobileSidebarFab } from "@/components/sidebar/mobile-sidebar-fab";
import { queryClient } from "@/lib/queryClient";
import { FloatingEntitySearch } from "@/components/entities/FloatingEntitySearch";
import { AppFooter, ReportBugFab } from "@/components/footer/AppFooter";
import { CookieConsentBanner } from "@/components/privacy/CookieConsentBanner";
import { Analytics } from "@/lib/analytics";
import { Seo, JsonLd } from "@/lib/seo";

export const Route = createRootRoute({
  component: () => (
    <ErrorProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <HotkeysProvider>
            <SidebarProvider>
              <div className="flex min-h-screen min-w-full">
                <AppSidebar />
                <SidebarInset>
                  <main className="flex-1">
                    <div>
                      {/* Global SEO defaults. Child routes can render their own <Seo /> to override. */}
                      <Seo
                        additionalMeta={[
                          {
                            name: 'keywords',
                            content:
                              'execuții bugetare, executii bugetare, bugetul statului, transparență bugetară, transparenta bugetara, analiză bugetară, analiza bugetara, cheltuieli publice, venituri publice, buget local, buget județean, UAT, hartă cheltuieli, harta cheltuieli, vizualizare buget, vizualizare date, finanțe publice, finante publice, România, Romania',
                          },
                        ]}
                      />
                      <JsonLd data={{
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        name: 'Transparenta.eu',
                        url: 'https://transparenta.eu',
                        potentialAction: {
                          '@type': 'SearchAction',
                          target: 'https://transparenta.eu/?q={search_term_string}',
                          'query-input': 'required name=search_term_string'
                        }
                      }} />
                      {/* Global pageview tracking tied to router location */}
                      <AnalyticsPageviewBridge />
                      <Outlet />
                      <Toaster />
                      <FloatingEntitySearch />
                    </div>
                  </main>
                  <AppFooter />
                  <ReportBugFab />
                  <MobileSidebarFab />
                  <CookieConsentBanner />
                </SidebarInset>
              </div>
            </SidebarProvider>
          </HotkeysProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorProvider>
  ),
  beforeLoad: async () => { },
});

function AnalyticsPageviewBridge() {
  Analytics.pageviewHook();
  return null;
}
