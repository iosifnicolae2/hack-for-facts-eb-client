import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Trans } from "@lingui/react/macro";
import { useUserInflationAdjusted } from "@/lib/hooks/useUserInflationAdjusted";

export function InflationToggle() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const [inflationAdjusted, setInflationAdjusted] = useUserInflationAdjusted();

    const applyInflationAdjusted = (next: boolean) => {
        setInflationAdjusted(next);
        // Keep behavior consistent with CurrencyToggle: ensure loaders pick up the global setting everywhere.
        window.location.reload();
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>
                <Trans>Prices</Trans>
            </SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => applyInflationAdjusted(false)}>
                        <Button
                            variant={inflationAdjusted ? "ghost" : "secondary"}
                            size="icon"
                            className="w-full justify-start gap-2"
                        >
                            <span className="text-md">N</span>
                            {!collapsed && <span className="flex-1 text-left"><Trans>Nominal</Trans></span>}
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => applyInflationAdjusted(true)}>
                        <Button
                            variant={inflationAdjusted ? "secondary" : "ghost"}
                            size="icon"
                            className="w-full justify-start gap-2"
                        >
                            <span className="text-md">R</span>
                            {!collapsed && <span className="flex-1 text-left"><Trans>Real (2024)</Trans></span>}
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}

