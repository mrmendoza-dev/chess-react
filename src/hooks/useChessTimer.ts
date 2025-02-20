import { useState, useEffect } from "react";

interface PlayerTimes {
  current: number;
  cumulative: number;
}

export const useChessTimer = () => {
  const [gameTime, setGameTime] = useState(0);
  const [whiteTimes, setWhiteTimes] = useState<PlayerTimes>({
    current: 0,
    cumulative: 0,
  });
  const [blackTimes, setBlackTimes] = useState<PlayerTimes>({
    current: 0,
    cumulative: 0,
  });
  const [currentPlayer, setCurrentPlayer] = useState<"white" | "black">(
    "white"
  );
  const [isRunning, setIsRunning] = useState(false);

  // Game timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setGameTime((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Player timers
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        if (currentPlayer === "white") {
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
  }, [isRunning, currentPlayer]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const startGame = () => setIsRunning(true);
  const pauseGame = () => setIsRunning(false);

  const switchPlayer = () => {
    if (currentPlayer === "white") {
      setWhiteTimes((prev) => ({ ...prev, current: 0 }));
      setCurrentPlayer("black");
    } else {
      setBlackTimes((prev) => ({ ...prev, current: 0 }));
      setCurrentPlayer("white");
    }
  };

  const resetGame = () => {
    setGameTime(0);
    setWhiteTimes({ current: 0, cumulative: 0 });
    setBlackTimes({ current: 0, cumulative: 0 });
    setCurrentPlayer("white");
    setIsRunning(false);
  };

  return {
    gameTime: formatTime(gameTime),
    whiteTimes: {
      current: formatTime(whiteTimes.current),
      cumulative: formatTime(whiteTimes.cumulative),
    },
    blackTimes: {
      current: formatTime(blackTimes.current),
      cumulative: formatTime(blackTimes.cumulative),
    },
    currentPlayer,
    isRunning,
    startGame,
    pauseGame,
    switchPlayer,
    resetGame,
  };
};

