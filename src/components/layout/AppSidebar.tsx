// UI Component imports
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sidebar, SidebarContent, SidebarGroup } from "@/components/ui/sidebar";

import { MoveHistory } from "@/components/MoveHistory";
import { useChess } from "@/contexts/ChessContext";
import { useMediaQuery } from "react-responsive";
import { exportPGN } from "@/utils/pgnUtility";
import { Download } from "lucide-react";

type BotDifficulty = "easy" | "medium" | "hard";

export const AppSidebar = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const {
    moveHistory,
    gameState,
    playComputer,
    setPlayComputer,
    botDifficulty,
    setBotDifficulty,
  } = useChess();

  const handleExportPGN = () => {
    exportPGN(gameState);
  };

  return (
    <Sidebar
      className="top-16 shrink-0"
      variant={isMobile ? "floating" : "sidebar"}
      collapsible="offcanvas"
    >
      <SidebarContent>
        <SidebarGroup>
          <div className="space-y-6 p-2">
            {/* Move History */}
            <MoveHistory moveHistory={moveHistory} />

            {/* Export Button */}
            <div className="flex justify-center">
              <Button onClick={handleExportPGN} variant="outline">
                Export PGN
                <Download className="ml-2 h-4 w-4" />
              </Button>
            </div>
            {/* Computer Play Controls */}
            <div className="space-y-4 px-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="playComputer">Play Computer</Label>
                <Switch
                  id="playComputer"
                  checked={playComputer}
                  onCheckedChange={setPlayComputer}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="botDifficulty">Bot Difficulty</Label>
                <Select
                  value={botDifficulty}
                  onValueChange={(value) =>
                    setBotDifficulty(value as BotDifficulty)
                  }
                  disabled={!playComputer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
