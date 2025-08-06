import { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { usePersistedState } from "@/lib/hooks/usePersistedState";
import { createLazyFileRoute } from "@tanstack/react-router";
import { EntitySearchInput } from "@/components/entities/EntitySearch";
import { PageCard } from "@/components/landing/PageCard";
import { QuickEntityAccess } from "@/components/entities/QuickEntityAccess";
import mapPreview from "@/assets/images/map.png";
import chartPreview from "@/assets/images/chart.png";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

const title = "Transparenta.eu";

function Index() {
  const { animationActive } = useTitleAnimation()
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <main className="flex-grow flex items-start justify-center p-4">
        <div className="container mx-auto flex flex-col items-center text-center space-y-10 py-16 md:py-24 relative">
          {/* Title Container - applies gradient styles to its children */}
          <div
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight
           bg-gradient-to-b from-slate-200/80 to-white
           bg-clip-text text-transparent
           drop-shadow-2xl"
          >
            {animationActive ? (
              <AnimatedTitle />
            ) : (
              <h1>{title}</h1>
            )}
          </div>

          <p className="max-w-2xl text-lg sm:text-xl text-slate-200 dark:text-slate-300">
            <code className="mr-4">[trans.paˈren.t͡sə]</code>
            <span>See-through, clear</span>
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