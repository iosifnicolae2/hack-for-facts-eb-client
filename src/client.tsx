import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";
import { i18n } from "@lingui/core";
import { dynamicActivate } from "@/lib/i18n";
import { getUserLocale } from "@/lib/utils";
import { getReactRootErrorHandlers } from "@/lib/sentry";

const hasWindow = typeof window !== "undefined";
const userLocale = hasWindow ? getUserLocale() : "ro";
i18n.load(userLocale, {});
i18n.activate(userLocale);

if (hasWindow) {
  void dynamicActivate(userLocale).catch((error) => {
    if (import.meta.env.DEV) {
      console.error("Failed to load translations:", error);
    }
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
    getReactRootErrorHandlers(),
  );
});
