import { LayoutDashboard, BarChart2, Map, ListOrdered } from "lucide-react";
import { Link, useMatches } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Trans } from "@lingui/react/macro";

const mainItems = [
  {
    title: <Trans>Dashboard</Trans>,
    url: "/",
    icon: LayoutDashboard,
  },
  // {
  //   title: "Anomalies",
  //   url: "/anomalies",
  //   icon: AlertTriangle,
  // },
  {
    title: <Trans>Map</Trans>,
    url: "/map",
    icon: Map,
  },
  {
    title: <Trans>Charts</Trans>,
    url: "/charts",
    icon: BarChart2,
  },
  {
    title: <Trans>Entity Analytics</Trans>,
    url: "/entity-analytics",
    icon: ListOrdered,
  },
];

export function NavMain() {
  const matches = useMatches();
  const currentPath =
    matches.length > 0 ? matches[matches.length - 1].pathname : "/";
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";

  const isActive = (url: string) => {
    if (url === "/") {
      return currentPath === "/";
    }
    return currentPath.startsWith(url);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 py-2">
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <Link
                    to={item.url}
                    preload="intent"
                    onClick={handleLinkClick}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "w-full justify-start gap-2",
                      isActive(item.url) && "bg-muted font-medium"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="flex-1">{item.title}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </div>
    </div>
  );
}
