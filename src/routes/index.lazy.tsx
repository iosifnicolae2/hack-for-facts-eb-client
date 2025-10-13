import { useEffect } from "react";
import { Trans } from "@lingui/react/macro";
import { t } from "@lingui/core/macro";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { usePersistedState } from "@/lib/hooks/usePersistedState";
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

export const Route = createLazyFileRoute("/")({
  component: Index,
});

const title = "Transparenta.eu";

function Index() {
  const { animationActive } = useTitleAnimation()
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-start justify-center p-4">
        <div className="container mx-auto flex flex-col items-center text-center space-y-10 py-16 md:py-24 relative">
          <Seo
            title="Transparenta.eu – Explore public finance data with charts and maps"
            description="Search entities, explore budgets on the map, and build custom charts. Local-first, consent-based analytics."
            image="/assets/logo/logo.png"
          />
          {/* Title Container - applies gradient styles to its children */}
          <div
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight
           bg-gradient-to-b from-slate-50 via-white to-slate-50
           bg-clip-text text-transparent
           drop-shadow-[0_10px_22px_rgba(18,65,161,0.8),0_10px_22px_rgba(18,65,161,0.8),0_10px_22px_rgba(200,65,161,0.8),0_1px_1px_rgba(250,65,250,0.8)]"
          >
            {animationActive ? (
              <AnimatedTitle />
            ) : (
              <h1>{title}</h1>
            )}
          </div>

          <p className="max-w-2xl text-lg sm:text-xl text-slate-400 dark:text-slate-300">
            <code className="mr-4">[trans.paˈren.t͡sə]</code>
            <span><Trans>See-through, clear</Trans></span>
          </p>

          <div className="w-full max-w-2xl lg:max-w-3xl mt-8 space-y-6">
            <EntitySearchInput
              placeholder={t`Enter entity name or CUI...`}
              autoFocus={!isMobile}
            />
            <QuickEntityAccess />
          </div>

          {/* Quick navigation cards */}
          <div className="mt-20 grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
            <PageCard
              title={t`Map`}
              description={t`Explore data through a map.`}
              to="/map"
              image={mapPreview}
              imageAlt="Map preview"
            />
            <PageCard
              title={t`Budget Explorer`}
              description={t`Explore budget data and spending breakdown.`}
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


/**
 * A component that displays the title with a typewriter animation.
 */
function AnimatedTitle() {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const displayText = useTransform(rounded, (latest) => title.slice(0, latest));

  useEffect(() => {
    const controls = animate(count, title.length, {
      type: "tween",
      duration: 2, // Animation duration in seconds
      ease: "easeInOut",
    });
    // Return cleanup function
    return controls.stop;
  }, [count]);

  return (
    // Flex container to align text and cursor
    <div className="flex items-center justify-center">
      <motion.span>{displayText}</motion.span>
      {/* Blinking Cursor */}
      <motion.div
        className="ml-2 inline-block h-[45px] w-1.5 rounded-sm bg-slate-200/90 sm:h-[55px] md:h-[65px]"
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror" }}
      />
    </div>
  );
}

function useTitleAnimation() {
  // State to track animation completion
  const [animationActive, setAnimationActive] = usePersistedState("landing-title-animation-complete", true);

  // Set a timer to switch to the static title after the animation finishes.
  // Animation (2.5s) + pause with cursor (1s) = 3.5s total.
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationActive(false);
    }, 2500);

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer);
  }, [setAnimationActive]);

  return { animationActive }
}