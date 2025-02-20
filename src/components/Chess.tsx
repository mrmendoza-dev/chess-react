import {
  faChessBishop,
  faChessKing,
  faChessKnight,
  faChessPawn,
  faChessQueen,
  faChessRook,
} from "@/assets/icons";
import { Button } from "@/components/ui/button";
import { useChess } from "@/contexts/ChessContext";
import { Piece, PieceColor } from "@/utils/chessUtility";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { capitalize } from "@/utils/formatUtility";
import { useEffect, useState } from "react";
import { CapturedPieces } from "./CapturedPieces";
import { ChessControls } from "./ChessControls";
import React from "react";

export const Chess = () => {
  const [boardSize, setBoardSize] = useState(0);
  const {
    board,
    selectedPiece,
    currentTurn,
    gameStatus,
    handleSquareClick,
    resetGame,
    moveHistory,
  } = useChess();

  const handleResize = () => {
    const container = document.getElementById("chess-container");
    if (!container) return;

    const containerWidth = container.clientWidth;
    const viewportHeight = window.innerHeight;

    const maxSize = Math.min(containerWidth * 1, viewportHeight * 0.95, 600);

    setBoardSize(maxSize);
  };

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPieceStyle = (color: PieceColor) => ({
    fontSize: `${boardSize / 12}px`,
    color: color === "white" ? "white" : "black",
    textShadow: "0 0 1px rgba(0, 0, 0, 0.5)",
    filter:
      color === "white"
        ? "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))"
        : "drop-shadow(2px 2px 2px rgba(255, 255, 255, 0.3))",
  });


  return (
    <div className="bg-background flex flex-col px-4 py-6 w-full">
      <main className="flex-1 w-full flex flex-col items-center justify-center gap-4">
        {/* Game Info Section */}
        <div className="w-full max-w-md">

          <ChessControls />
        </div>

        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
          {/* Chess Board Container */}
          <div id="chess-container" className="w-full">
            <CapturedPieces moveHistory={moveHistory} />

            <div
              className="mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 p-1"
              style={{ width: boardSize ? `${boardSize}px` : "100%" }}
            >
              {/* Main grid container */}
              <div className="grid grid-cols-[auto_repeat(8,1fr)_auto] gap-1">
                {/* Top row of file labels */}
                <div className="w-6" />
                {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
                  <div
                    key={`top-${file}`}
                    className="flex justify-center text-xs text-muted-foreground select-none"
                  >
                    {file}
                  </div>
                ))}
                <div className="w-6" />

                {/* Board squares with rank labels on both sides */}
                {[8, 7, 6, 5, 4, 3, 2, 1].map((rank, rankIndex) => (
                  <React.Fragment key={`rank-${rank}`}>
                    {/* Left rank label */}
                    <div className="flex items-center justify-center text-xs text-muted-foreground w-6 select-none">
                      {rank}
                    </div>

                    {/* Board squares for this rank */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((col) => {
                      const index = rankIndex * 8 + col;
                      const isBlack = (rankIndex + col) % 2 === 0;
                      const piece = board[index];

                      return (
                        <div
                          key={index}
                          onClick={() => handleSquareClick(index)}
                          className={`
                            ${
                              isBlack
                                ? "bg-gray-300 dark:bg-neutral-700"
                                : "bg-gray-100 dark:bg-neutral-300"
                            }
                            ${
                              selectedPiece === index
                                ? "ring-4 ring-blue-500 z-10"
                                : ""
                            }
                            aspect-square w-full hover:opacity-90 transition-opacity
                            relative cursor-pointer
                          `}
                        >
                          {piece && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FontAwesomeIcon
                                icon={getPieceIcon(piece.type)}
                                style={getPieceStyle(piece.color)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Right rank label */}
                    <div className="flex items-center justify-center text-xs text-muted-foreground w-6 select-none">
                      {rank}
                    </div>
                  </React.Fragment>
                ))}

                {/* Bottom row of file labels */}
                <div className="w-6" />
                {["a", "b", "c", "d", "e", "f", "g", "h"].map((file) => (
                  <div
                    key={`bottom-${file}`}
                    className="flex justify-center text-xs text-muted-foreground select-none"
                  >
                    {file}
                  </div>
                ))}
                <div className="w-6" />
              </div>
            </div>
          </div>
        </div>
      
      </main>
    </div>
  );
};

export const getPieceIcon = (type: Piece["type"]): IconDefinition => {
  const icons = {
    king: faChessKing,
    queen: faChessQueen,
    rook: faChessRook,
    bishop: faChessBishop,
    knight: faChessKnight,
    pawn: faChessPawn,
  };
  return icons[type];
};
