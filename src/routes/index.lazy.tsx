import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { createLazyFileRoute } from "@tanstack/react-router";
import { EntitySearchInput } from "@/components/entities/EntitySearch";
import { PageCard } from "@/components/landing/PageCard";
import { QuickEntityAccess } from "@/components/entities/QuickEntityAccess";
import mapPreview from "@/assets/images/map.png";
import chartPreview from "@/assets/images/chart.png";
import entityAnalyticsPreview from "@/assets/images/entity-analytics.png";
import morePreview from "@/assets/images/more-to-come.png";
import { useIsMobile } from "@/hooks/use-mobile";
import { Seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

const title = "Transparenta.eu";

function Index() {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-start justify-center p-4">
        <div className="container mx-auto flex flex-col items-center text-center space-y-10 py-16 md:py-24 relative">
          <Seo
            title="Transparenta.eu – Explore public finance data with charts and maps"
            description="Search entities, explore budgets on the map, and build custom charts. Local-first, consent-based analytics."
            image="/assets/images/share-image.png"
          />
          {/* Title Container - applies gradient styles to its children */}
          <div
            className={cn("text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight",
              "bg-gradient-to-b from-slate-50 via-white to-slate-50",
              "bg-clip-text text-transparent",
              isMobile ?
                "drop-shadow-[0_10px_10px_rgba(18,65,161,1),0_14px_20px_rgba(18,65,161,1),0_10px_20px_rgba(200,65,161,0.95),0_2px_2px_rgba(250,65,250,1)]" :
                "drop-shadow-[0_10px_22px_rgba(18,65,161,0.8),0_10px_22px_rgba(18,65,161,0.8),0_10px_22px_rgba(200,65,161,0.8),0_1px_1px_rgba(250,65,250,0.8)]")}
          >
            <h1>{title}</h1>
          </div>

          <p className="max-w-2xl text-lg sm:text-xl text-slate-400 dark:text-slate-300">
            <code className="mr-4">[trans.paˈren.t͡sə]</code>
            <span><Trans>See-through, clear</Trans></span>
          </p>

          <div className="w-full max-w-2xl -mt-10 lg:max-w-3xl space-y-6">
            <EntitySearchInput
              placeholder={t`Enter entity name or CUI...`}
              autoFocus={!isMobile}
              scrollToTopOnFocus={isMobile}
            />
            <QuickEntityAccess />
          </div>

          {/* Quick navigation cards */}
          <div className="lg:mt-20 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            <PageCard
              title={t`Map`}
              description={t`Explore data through a map.`}
              to="/map"
              image={mapPreview}
              imageAlt="Map preview"
            />
            <PageCard
              title={t`Budget Explorer`}
              description={t`Explore national budget.`}
              to="/budget-explorer"
              image={morePreview}
              imageAlt="Budget explorer preview"
            />
            <PageCard
              title={t`Entities`}
              description={t`Explore entities by aggregated values.`}
              to="/entity-analytics"
              image={entityAnalyticsPreview}
              imageAlt="Entity analytics preview"
            />
            <PageCard
              title={t`Charts`}
              description={t`Explore data through charts.`}
              to="/charts"
              image={chartPreview}
              imageAlt="Charts preview"
            />
          </div>

        </div>
      </main>
    </div>
  );
}
// (Title animation removed)
