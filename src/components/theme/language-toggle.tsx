import { Button } from "@/components/ui/button";
import { dynamicActivate } from "@/lib/i18n";
import { Trans } from "@lingui/react/macro";
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Analytics } from "@/lib/analytics";

export function LanguageToggle() {
    const { state } = useSidebar();
    const collapsed = state === "collapsed";

    async function setLocale(locale: "en" | "ro"): Promise<void> {
        await dynamicActivate(locale);
        try {
            window.localStorage.setItem("locale", locale);
        } catch { }
        try {
            document.documentElement.setAttribute("lang", locale);
        } catch { }
        Analytics.capture(Analytics.EVENTS.LanguageChanged, { locale });
    }

    return (
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => setLocale("en")}>
                        <Button variant="ghost" size="icon">
                            <span>🇬🇧</span>
                            {!collapsed && <span className="flex-1"><Trans>English</Trans></span>}
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild onClick={() => setLocale("ro")}>
                        <Button variant="ghost" size="icon">
                            <span>🇷🇴</span>
                            {!collapsed && <span className="flex-1"><Trans>Romanian</Trans></span>}
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}


