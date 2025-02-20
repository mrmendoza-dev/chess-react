import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, Clock, Crown } from "lucide-react";
import { useChess } from "@/contexts/ChessContext";
import { capitalize } from "@/utils/formatUtility";

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

  useEffect(() => {
    if (gameStatus !== "playing") setIsRunning(false);
  }, [gameStatus]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getStatusMessage = () => {
    switch (gameStatus) {
      case "check":
        return `${capitalize(currentTurn)} is in check!`;
      case "checkmate":
        return `Checkmate! ${
          currentTurn === "white" ? "Black" : "White"
        } wins!`;
      case "stalemate":
        return "Stalemate! The game is a draw.";
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
  };

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        {/* Header with Game Info */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-lg">{formatTime(gameTime)}</span>
          </div>{" "}
          {/* Status Message */}
          <div
            className={`w-full text-sm font-medium text-center p-2 rounded-md ${
              gameStatus === "check"
                ? "bg-yellow-500/10 text-yellow-500"
                : gameStatus === "checkmate"
                ? "bg-red-500/10 text-red-500"
                : gameStatus === "stalemate"
                ? "bg-blue-500/10 text-blue-500"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {getStatusMessage()}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm text-muted-foreground">
              Turn {Math.floor(moveHistory.length / 2) + 1}
            </span>
            {gameStatus !== "playing" && (
              <Crown className="w-4 h-4 text-destructive" />
            )}
          </div>
        </div>

        {/* Player Times */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { color: "white", times: whiteTimes },
            { color: "black", times: blackTimes },
          ].map(({ color, times }) => (
            <div
              key={color}
              className={`p-3 rounded-lg border ${
                currentTurn === color && gameStatus === "playing"
                  ? "bg-accent border-accent"
                  : "bg-background"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{capitalize(color)}</span>
                <span className="text-xs text-muted-foreground">
                  Total: {formatTime(times.cumulative)}
                </span>
              </div>
              <div className="font-mono text-lg">
                {formatTime(times.current)}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            variant={isRunning ? "destructive" : "default"}
            onClick={() => setIsRunning(!isRunning)}
            disabled={gameStatus !== "playing"}
            className="flex-1"
          >
            {isRunning ? (
              <Pause className="w-4 h-4 mr-2" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
