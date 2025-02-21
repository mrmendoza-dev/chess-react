import React from "react";
import clsx from "clsx";
import {
  faChessBishop,
  faChessKing,
  faChessKnight,
  faChessPawn,
  faChessQueen,
  faChessRook,
} from "@/assets/icons";
import { useChess } from "@/contexts/ChessContext";
import { Piece, PieceColor } from "@/utils/chessUtility";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { CapturedPieces } from "./CapturedPieces";
import { ChessControls } from "./ChessControls";
import { PawnPromotionDialog } from "./PawnPromotionDialog";

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
    validMoves,
    validAttacks,
    hoverPiece,
    previewMoves,
    previewAttacks,
    handleSquareHover,
    handlePromotion,
    promotionSquare,
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

  return (
    <div className="bg-background flex flex-col px-4 py-6 w-full">
      <main className="flex-1 w-full flex flex-col items-center justify-center gap-4">
        {/* Game Info Section */}
        <div className="w-full">
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
                        <ChessTile
                          key={index}
                          piece={piece}
                          index={index}
                          isBlack={isBlack}
                          isSelected={selectedPiece === index}
                          isHover={hoverPiece === index}
                          isPreview={
                            previewMoves.includes(index) ||
                            previewAttacks.includes(index)
                          }
                          handleSquareClick={handleSquareClick}
                          handleSquareHover={handleSquareHover}
                          validAttacks={validAttacks}
                          validMoves={validMoves}
                          previewAttacks={previewAttacks}
                          previewMoves={previewMoves}
                          selectedPiece={selectedPiece}
                          boardSize={boardSize}
                          gameStatus={gameStatus}
                          currentTurn={currentTurn}
                        />
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
        <PawnPromotionDialog
          isOpen={promotionSquare !== null}
          onClose={() => {}} // Dialog shouldn't be closeable
          onPromote={handlePromotion}
          color={currentTurn}
        />
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
interface ChessTileProps {
  piece: Piece | null;
  index: number;
  isBlack: boolean;
  isSelected: boolean;
  isHover: boolean;
  isPreview: boolean;
  handleSquareClick: (index: number) => void;
  handleSquareHover: (index: number | null) => void;
  validAttacks: number[];
  validMoves: number[];
  previewAttacks: number[];
  previewMoves: number[];
  selectedPiece: number | null;
  boardSize: number;
  // Add these new props
  gameStatus: "playing" | "check" | "checkmate" | "stalemate";
  currentTurn: PieceColor;
}

export const ChessTile = ({
  piece,
  index,
  isBlack,
  isSelected,
  isHover,
  isPreview,
  handleSquareClick,
  handleSquareHover,
  validAttacks,
  validMoves,
  previewAttacks,
  previewMoves,
  selectedPiece,
  boardSize,
  gameStatus,
  currentTurn,
}: ChessTileProps) => {
  // Check if this square contains the king that is in check
  const isKingInCheck =
    piece?.type === "king" &&
    piece.color === currentTurn &&
    (gameStatus === "check" || gameStatus === "checkmate");

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
    <div
      onClick={() => handleSquareClick(index)}
      onMouseEnter={() => handleSquareHover(index)}
      onMouseLeave={() => handleSquareHover(null)}
      className={clsx(
        // Base square styling
        "aspect-square w-full relative cursor-pointer transition-opacity hover:opacity-90",
        // Square color
        isBlack
          ? "bg-gray-300 dark:bg-neutral-700"
          : "bg-gray-100 dark:bg-neutral-300",
        // Selected piece highlight
        selectedPiece === index && "ring-4 ring-blue-500 z-10"
      )}
    >
      {/* Highlight layers - with check indicator having highest priority */}
      {isKingInCheck && (
        <div className="absolute inset-0 bg-red-600/30 animate-pulse ring-4 ring-red-500" />
      )}
      {!isKingInCheck &&
        (() => {
          if (validAttacks?.includes(index)) {
            return <div className="absolute inset-0 bg-red-500/50" />;
          }
          if (validMoves?.includes(index)) {
            return <div className="absolute inset-0 bg-green-500/50" />;
          }
          if (selectedPiece === null) {
            if (previewAttacks?.includes(index)) {
              return <div className="absolute inset-0 bg-purple-500/30" />;
            }
            if (previewMoves?.includes(index)) {
              return <div className="absolute inset-0 bg-yellow-500/30" />;
            }
          }
          return null;
        })()}

      {/* Piece icon */}
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
};
