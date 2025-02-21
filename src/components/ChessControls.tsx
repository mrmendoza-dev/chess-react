import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, Clock, Crown } from "lucide-react";
import { useChess } from "@/contexts/ChessContext";
import { capitalize } from "@/utils/formatUtility";
import JSConfetti from "js-confetti";
import { playSound } from "@/utils/soundUtility";

interface PlayerTimes {
  current: number;
  cumulative: number;
}

export const ChessControls = () => {
  const {
    currentTurn,
    gameStatus,
    moveHistory,
    resetGame: resetChessGame,
  } = useChess();
  const [gameTime, setGameTime] = useState(0);
  const [whiteTimes, setWhiteTimes] = useState<PlayerTimes>({
    current: 0,
    cumulative: 0,
  });
  const [blackTimes, setBlackTimes] = useState<PlayerTimes>({
    current: 0,
    cumulative: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const victoryEffectsPlayed = useRef(false);

  useEffect(() => {
    if (gameStatus === "checkmate" && !victoryEffectsPlayed.current) {
      const jsConfetti = new JSConfetti();
      jsConfetti.addConfetti({
        emojis: ["♟️"],
      });
      playSound("standard", "Explosion");
      victoryEffectsPlayed.current = true;
    } else if (gameStatus === "playing") {
      victoryEffectsPlayed.current = false;
    }
  }, [gameStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && gameStatus === "playing") {
      interval = setInterval(() => setGameTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, gameStatus]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && gameStatus === "playing") {
      interval = setInterval(() => {
        if (currentTurn === "white") {
          setWhiteTimes((prev) => ({
            current: prev.current + 1,
            cumulative: prev.cumulative + 1,
          }));
        } else {
          setBlackTimes((prev) => ({
            current: prev.current + 1,
            cumulative: prev.cumulative + 1,
          }));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, currentTurn, gameStatus]);
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case "check":
        return `${capitalize(currentTurn)} in check!`;
      case "checkmate":
        return `Checkmate! ${
          currentTurn === "white" ? "Black" : "White"
        } wins!`;
      case "stalemate":
        return "Stalemate - Draw";
      default:
        return `${capitalize(currentTurn)}'s turn`;
    }
  };

  const handleReset = () => {
    resetChessGame();
    setGameTime(0);
    setWhiteTimes({ current: 0, cumulative: 0 });
    setBlackTimes({ current: 0, cumulative: 0 });
    setIsRunning(false);
    victoryEffectsPlayed.current = false;
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardContent className="p-2">
        <div className="flex items-center flex-wrap gap-2">
          {/* Left section - Game Time and Turn Count */}
          <div className="flex items-center gap-2 min-w-[100px]">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono">{formatTime(gameTime)}</span>
            <span className="text-sm text-muted-foreground">
              #{Math.floor(moveHistory.length / 2) + 1}
            </span>
          </div>

          {/* Middle section - Player Times */}
          <div className="flex-1 flex flex-wrap gap-2">
            {[
              { color: "white", times: whiteTimes },
              { color: "black", times: blackTimes },
            ].map(({ color, times }) => (
              <div
                key={color}
                className={`px-2 py-1 rounded-md border ${
                  currentTurn === color && gameStatus === "playing"
                    ? "bg-accent border-accent"
                    : "bg-background"
                }`}
              >
                <div className="flex items-center justify-between text-sm gap-2">
                  <span>{capitalize(color)}</span>
                  <span className="font-mono">{formatTime(times.current)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right section - Controls */}
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={isRunning ? "destructive" : "default"}
              onClick={() => setIsRunning(!isRunning)}
              disabled={gameStatus !== "playing" && gameStatus !== "check"}
            >
              {isRunning ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              New Game
            </Button>
          </div>
        </div>

        {/* Status Message - Only shown for important states */}
        {/* {gameStatus !== "playing" && ( */}
          <div
            className={`mt-2 text-sm font-medium text-center p-1 rounded-md ${
              gameStatus === "check"
                ? "bg-yellow-500/10 text-yellow-500"
                : gameStatus === "checkmate"
                ? "bg-red-500/10 text-red-500"
                : "bg-blue-500/10 text-blue-500"
            }`}
          >
            {getStatusMessage()}
            {gameStatus === "checkmate" && (
              <Crown className="inline w-4 h-4 ml-1" />
            )}
          </div>
        {/* )} */}
      </CardContent>
    </Card>
  );
};
