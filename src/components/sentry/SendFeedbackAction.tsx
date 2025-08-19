import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MessageSquare } from "lucide-react";
import { t } from "@lingui/core/macro";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useSentryConsent } from "@/hooks/useSentryConsent";
import { openSentryFeedback } from "@/lib/sentry";
import { ReactElement } from "react";

export function SendFeedbackAction(): ReactElement {
  const hasConsent = useSentryConsent();
  const navigate = useNavigate();

  const handleClick = () => {
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
      } catch {}
    }
    toast.error(t`Feedback is currently unavailable.`);
  };

  return (
    <DropdownMenuItem onClick={handleClick}>
      <MessageSquare className="h-4 w-4" />
      <span>{t`Send feedback`}</span>
    </DropdownMenuItem>
  );
}


