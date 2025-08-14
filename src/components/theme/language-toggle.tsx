import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { i18n } from "@lingui/core";
import { dynamicActivate } from "@/lib/i18n";
import { Trans } from "@lingui/react";

export function LanguageToggle() {
    const currentLocale = i18n.locale || "en";

    async function setLocale(locale: "en" | "ro"): Promise<void> {
        if (locale === currentLocale) return;
        await dynamicActivate(locale);
        try {
            window.localStorage.setItem("locale", locale);
        } catch { }
        try {
            document.documentElement.setAttribute("lang", locale);
        } catch { }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Globe className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only"><Trans>Toggle language</Trans></span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLocale("en")}>
                    <Trans>English</Trans>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale("ro")}>
                    <Trans>Romanian</Trans>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


