import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Bug } from "lucide-react";
import { t } from "@lingui/core/macro";
import { ReactElement } from "react";
import { useSendBugReport } from "@/hooks/useSendBugReport";

export function SendErrorAction(): ReactElement {
  const sendBugReport = useSendBugReport();
  return (
    <DropdownMenuItem
      onSelect={() => {
        sendBugReport();
      }}
    >
      <Bug className="h-4 w-4" />
      <span>{t`Report bug`}</span>
    </DropdownMenuItem>
  );
}


