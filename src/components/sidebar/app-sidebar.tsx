import React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import Logo from "./logo";
import { NavMain } from "./nav-main";
import { useLocation } from "@tanstack/react-router";
import { ModeToggle } from "@/components/theme/mode-toggle";
import { LanguageToggle } from "@/components/theme/language-toggle";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();

  // Hide sidebar on onboarding pages
  if (location.pathname.includes("/onboarding")) {
    return null;
  }

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
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
