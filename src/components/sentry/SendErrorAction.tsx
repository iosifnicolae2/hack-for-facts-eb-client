import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Bug } from "lucide-react";
import { t } from "@lingui/core/macro";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSentryConsent } from "@/hooks/useSentryConsent";
import * as Sentry from "@sentry/react";
import { ReactElement } from "react";
import { openSentryBugReport } from "@/lib/sentry";

export function SendErrorAction(): ReactElement {
  const hasConsent = useSentryConsent();
  const navigate = useNavigate();

  const handleClick = () => {
    if (!hasConsent) {
      toast.warning(t`Cookie consent required`, {
        description: t`You need to accept cookies to send an error report.`,
        action: {
          label: t`Open cookies`,
          onClick: () => navigate({ to: "/cookies" }),
        },
        duration: 6000,
      });
      return;
    }

    try {
      if (typeof openSentryBugReport === 'function') {
        openSentryBugReport();
      } else {
        // Fallback: at least ship a marker event
        Sentry.captureMessage("User initiated bug report", {
          level: "error",
          tags: { source: "quick-actions" },
          extra: { url: typeof window !== 'undefined' ? window.location.href : '' },
        } as any);
        toast.success(t`Error signal sent`);
      }
    } catch {
      toast.error(t`Could not send error report.`);
    }
  };

  return (
    <DropdownMenuItem onClick={handleClick}>
      <Bug className="h-4 w-4" />
      <span>{t`Send error`}</span>
    </DropdownMenuItem>
  );
}


