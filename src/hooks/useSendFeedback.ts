import { t } from "@lingui/core/macro";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSentryConsent } from "@/hooks/useSentryConsent";
import { openSentryFeedback } from "@/lib/sentry";

export function useSendFeedback() {
  const hasConsent = useSentryConsent();
  const navigate = useNavigate();

  const sendFeedback = () => {
    if (!hasConsent) {
      toast.warning(t`Cookie consent required`, {
        description: t`You need to accept cookies to send feedback.`,
        action: {
          label: t`Open cookies`,
          onClick: () => navigate({ to: "/cookies" }),
        },
        duration: 6000,
      });
      return;
    }

    if (typeof openSentryFeedback === "function") {
      try {
        openSentryFeedback();
        return;
      } catch (e) {
        console.error("Failed to open Sentry feedback", e);
      }
    }
    toast.error(t`Feedback is currently unavailable.`);
  };

  return sendFeedback;
}
