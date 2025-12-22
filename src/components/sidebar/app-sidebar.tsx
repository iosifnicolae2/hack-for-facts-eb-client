import React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import Logo from "./logo";
import { NavMain } from "./nav-main";
import { LanguageToggle } from "@/components/theme/language-toggle";
import { CurrencyToggle } from "@/components/theme/currency-toggle";
import { InflationToggle } from "@/components/theme/inflation-toggle";
import { NavUser } from "./nav-user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="flex flex-1 flex-col">
        <div className="flex-1">
          <NavMain />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <CurrencyToggle />
        <InflationToggle />
        <LanguageToggle />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
