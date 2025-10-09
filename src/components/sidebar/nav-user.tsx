import React from "react";
import { Link } from "@tanstack/react-router";
import { Bell, ChevronsUpDown, LogIn, LogOut, Settings } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { createLogger } from "@/lib/logger";
import { useAuth, AuthSignInButton } from "@/lib/auth";
import { ThemeSwitcher } from "./theme-switcher";

const logger = createLogger({ context: "NavUser" });

type NavUserProps = {
  readonly user?: {
    readonly name?: string | null;
    readonly email?: string | null;
    readonly avatarUrl?: string | null;
  } | null;
};

export function NavUser(_props: NavUserProps) {
  const { isMobile, setIsOverlayLockedOpen } = useSidebar();
  const { user, isSignedIn, isLoaded, signOut } = useAuth();

  const displayName = React.useMemo(() => {
    if (!user) return "Guest";
    const first = user.firstName ?? "";
    const last = user.lastName ?? "";
    const full = `${first} ${last}`.trim();
    return full || "User";
  }, [user]);

  const initials = React.useMemo(() => {
    if (!user) return "GU";
    const first = (user.firstName?.[0] ?? "U").toUpperCase();
    const last = (user.lastName?.[0] ?? "").toUpperCase();
    return `${first}${last}`.slice(0, 2);
  }, [user]);

  const email = user?.email ?? "";

  const handleLogout = async () => {
    try {
      logger.info("Logout Triggered");
      await signOut();
    } catch (error) {
      logger.error("Logout Failed", { error: String(error) });
    }
  };

  // When auth is disabled or not loaded yet, show a minimal placeholder
  if (!isLoaded) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu
          onOpenChange={(open) => {
            // Lock sidebar open while the user menu is open
            setIsOverlayLockedOpen(open);
          }}
        >
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={undefined} alt={displayName} />
                <AvatarFallback className="rounded-lg font-medium group-data-[collapsible=icon]:pl-3">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Hide text when collapsed; keep a subtle chevron */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{displayName}</span>
                {email && <span className="truncate text-xs">{email}</span>}
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={undefined} alt={displayName} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  {email && <span className="truncate text-xs">{email}</span>}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/settings/profile">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings/notifications">
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ThemeSwitcher />
            <DropdownMenuSeparator />
            {isSignedIn ? (
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            ) : (
              <AuthSignInButton>
                <DropdownMenuItem>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign in</span>
                </DropdownMenuItem>
              </AuthSignInButton>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}


