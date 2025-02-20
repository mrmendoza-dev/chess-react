import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";
import { useChess } from "@/contexts/ChessContext";
import { exportPGN } from "@/utils/pgnUtility";
import { useMediaQuery } from "react-responsive";
import { DownloadIcon } from "lucide-react";
import { MoveHistory } from "@/components/MoveHistory";

export const AppSidebar = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { moveHistory, gameState } = useChess();

  const handleExportPGN = () => {
    exportPGN(gameState);
  };

  return (
    <Sidebar
      className="top-16 shrink-0"
      variant={isMobile ? "floating" : "sidebar"}
      collapsible={isMobile ? "offcanvas" : "offcanvas"}
    >
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          {/* <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent> */}
          {/* Move History */}
          <div className="flex justify-center p-2">
            <Button onClick={handleExportPGN} variant="outline">
              Export PGN <DownloadIcon className="w-4 h-4" />
            </Button>
          </div>
          <MoveHistory
            moveHistory={moveHistory}
          />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
