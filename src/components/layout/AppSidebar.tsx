import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useMediaQuery } from "react-responsive";
import { useChess } from "@/contexts/ChessContext";
import { getMoveNotation } from "@/utils/chess";


export const AppSidebar = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { moveHistory } = useChess();



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
          <div className="w-full bg-card rounded-lg shadow-lg border border-border p-4">
            <h3 className="text-lg font-semibold mb-3">Move History</h3>
            <div className="min-h-[400px] overflow-y-auto">
              {moveHistory.length === 0 ? (
                <p className="text-muted-foreground text-sm">No moves yet</p>
              ) : (
                <div className="space-y-2">
                  {moveHistory.map((move, index) => (
                    <div
                      key={move.timestamp}
                      className="flex items-center gap-2 text-sm p-2 hover:bg-muted/50 rounded"
                    >
                      <span className="font-mono w-8 text-muted-foreground">
                        {Math.floor(index / 2) + 1}.
                      </span>
                      <span className="font-medium">
                        {getMoveNotation(move)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
