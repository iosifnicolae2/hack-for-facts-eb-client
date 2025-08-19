import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MessageSquare } from "lucide-react";
import { t } from "@lingui/core/macro";
import { ReactElement } from "react";
import { useSendFeedback } from "@/hooks/useSendFeedback";

export function SendFeedbackAction(): ReactElement {
  const sendFeedback = useSendFeedback();

  return (
    <DropdownMenuItem
      onSelect={(e) => {
        e.preventDefault();
        sendFeedback();
      }}
    >
      <MessageSquare className="h-4 w-4" />
      <span>{t`Send feedback`}</span>
    </DropdownMenuItem>
  );
}


