import { createLazyFileRoute } from "@tanstack/react-router";
import { EntitySearchInput } from "@/components/entities/EntitySearch";
import { PageCard } from "@/components/landing/PageCard";
import { QuickEntityAccess } from "@/components/entities/QuickEntityAccess";
import mapPreview from "@/assets/images/map.png";
import chartPreview from "@/assets/images/chart.png";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">

      <main className="flex-grow flex items-start justify-center p-4">
        <div className="container mx-auto flex flex-col items-center text-center space-y-10 py-16 md:py-24">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Financial Data Explorer
          </h1>
          <p className="max-w-2xl text-lg sm:text-xl text-slate-600 dark:text-slate-300">
            Search and analyze public spending data for entities across Romania.
          </p>

          <div className="w-full max-w-2xl lg:max-w-3xl mt-8 space-y-6">
            <EntitySearchInput
              placeholder="Enter entity name or CUI..."
              autoFocus
            />
            <QuickEntityAccess />
          </div>

          {/* Quick navigation cards */}
          <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            <PageCard
              title="Explore Data"
              description="Advanced filtering & analysis."
              to="/data-discovery"
              image={chartPreview}
              imageAlt="Charts preview"
            />
            <PageCard
              title="Map"
              description="Explore spending by UAT."
              to="/map"
              image={mapPreview}
              imageAlt="Map preview"
            />
          </div>

        </div>
      </main>
    </div>
  );
}
