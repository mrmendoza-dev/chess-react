import { useState, useEffect } from "react";
import { Piece, PieceColor } from "@/utils/chess";
import {
  faChessKing,
  faChessQueen,
  faChessRook,
  faChessBishop,
  faChessKnight,
  faChessPawn,
} from "@/assets/icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@/components/ui/button";
import { useChess } from "@/contexts/ChessContext";

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


  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

  return (
    <div className="bg-background flex flex-col px-4 py-6 w-full">
      <main className="flex-1 w-full flex flex-col items-center justify-center gap-4">
        {/* Game Info Section */}
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg border border-border p-3">
            <h2 className="text-base font-semibold mb-1 text-foreground">
              Game Status
            </h2>
            <p className="text-base text-foreground">
              {getStatusMessage()}
            </p>

            <p className="text-sm text-muted-foreground">
              Turn {Math.floor(moveHistory.length / 2) + 1}
            </p>
          </div>
        </div>

        <div className="w-full max-w-4xl flex flex-col md:flex-row gap-4">
          {/* Chess Board Container */}
          <div id="chess-container" className="w-full">
            <div
              className="mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-gray-200 dark:border-neutral-700 p-2 sm:p-4"
              style={{ width: boardSize ? `${boardSize}px` : "100%" }}
            >
              <div className="grid grid-cols-8 gap-0 border-2 border-gray-300 dark:border-neutral-600">
                {board.map((piece, index) => {
                  const row = Math.floor(index / 8);
                  const col = index % 8;
                  const isBlack = (row + col) % 2 === 0;

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
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg shadow-lg border border-border p-3 w-full flex justify-center">
            <Button onClick={resetGame}>Reset Game</Button>
          </div>
        </div>
      </main>

      {/* <footer className="w-full bg-card shadow-lg border-border mt-4">
        <div className="max-w-7xl mx-auto p-3">
          <p className="text-center text-sm text-muted-foreground">
            {getStatusMessage()}
          </p>
        </div>
      </footer> */}
    </div>
  );
};

const getPieceIcon = (type: Piece["type"]): IconDefinition => {
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


