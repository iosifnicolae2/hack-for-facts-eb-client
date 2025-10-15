import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Trans } from "@lingui/react/macro";
import { usePersistedState } from "@/lib/hooks/usePersistedState";

type CurrencyCode = 'RON' | 'EUR'

export function CurrencyToggle() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";
    const [currency, setCurrency] = usePersistedState<CurrencyCode>("user-currency", "RON");

    const applyCurrency = (next: CurrencyCode) => {
        setCurrency(next);
        // Keep behavior consistent with LanguageToggle for simplicity
        window.location.reload();
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel >
                <Trans>Currency</Trans>
            </SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => applyCurrency("RON")}>
                        <Button variant={currency === 'RON' ? "secondary" : "ghost"} size="icon" className="w-full justify-start gap-2">
                            <span className="text-md">🇷🇴</span>
                            {!collapsed && <span className="flex-1 text-left"><Trans>RON</Trans></span>}
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => applyCurrency("EUR")}>
                        <Button variant={currency === 'EUR' ? "secondary" : "ghost"} size="icon" className="w-full justify-start gap-2">
                            <span className="text-md">🇪🇺</span>
                            {!collapsed && <span className="flex-1 text-left"><Trans>EUR</Trans></span>}
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}


