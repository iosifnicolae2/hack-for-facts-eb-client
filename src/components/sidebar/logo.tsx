import { FC } from "react";
import { SquareSquare } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "../ui/sidebar";
import { Link } from "@tanstack/react-router";

const Logo: FC = () => {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center">
          <SidebarMenuButton
            size={"default"}
            className="h-8 w-full overflow-hidden"
            onClick={() => setOpenMobile(false)}
            asChild
          >
            <Link to="/" className="flex w-full items-center gap-2">
              <SquareSquare className="h-6 w-6 text-black dark:text-white" />
              <span
                className="font-semibold text-lg whitespace-nowrap transition-opacity duration-200 group-data-[collapsible=icon]:opacity-0"
              >
                Transparenta.eu
              </span>
            </Link>
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default Logo;
