// src/components/Chess/CapturedPieces.tsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Piece, PieceColor } from "@/types/chess";
import { getPieceIcon } from "@/components/Chess";

interface CapturedPiecesProps {
  moveHistory: Array<{
    piece: Piece;
    captured?: Piece;
  }>;
}

const PIECE_VALUES = {
  queen: 9,
  rook: 5,
  bishop: 3,
  knight: 3,
  pawn: 1,
  king: 0,
} as const;

export const CapturedPieces = ({ moveHistory }: CapturedPiecesProps) => {
  const getCapturedPieces = (color: PieceColor) => {
    return moveHistory
      .filter((move) => move.captured?.color === color)
      .map((move) => move.captured!);
  };

  const calculateMaterialDifference = () => {
    const whiteCaptured = getCapturedPieces("white");
    const blackCaptured = getCapturedPieces("black");

    const whiteValue = whiteCaptured.reduce(
      (sum, piece) => sum + PIECE_VALUES[piece.type],
      0
    );
    const blackValue = blackCaptured.reduce(
      (sum, piece) => sum + PIECE_VALUES[piece.type],
      0
    );

    return blackValue - whiteValue;
  };

  const materialDiff = calculateMaterialDifference();

  const CapturedPieceRow = ({ color }: { color: PieceColor }) => {
    const capturedPieces = getCapturedPieces(color);

    // Only render if there are captured pieces
    if (capturedPieces.length === 0) return null;

    const sortedPieces = [...capturedPieces].sort(
      (a, b) => PIECE_VALUES[b.type] - PIECE_VALUES[a.type]
    );

    return (
      <div className="flex flex-wrap bg-gray-100 dark:bg-gray-800 rounded-md p-2">
        {sortedPieces.map((piece, index) => (
          <div
            key={`${piece.type}-${index}`}
            className="flex items-center justify-center"
          >
            <FontAwesomeIcon
              icon={getPieceIcon(piece.type)}
              className={`text-xl`}
              style={{
                color: color === "white" ? "white" : "black",
                textShadow: "0 0 1px rgba(0, 0, 0, 0.5)",
                filter:
                  color === "white"
                    ? "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))"
                    : "drop-shadow(2px 2px 2px rgba(255, 255, 255, 0.1))",
              }}
            />
          </div>
        ))}
        {materialDiff >= 1 && (
          <div className="w-min text-sm ml-2 text-muted-foreground">
            {color === "white" ? `+${materialDiff}` : `-${materialDiff}`}
          </div>
        )}
      </div>
    );
  };

  // Only render the Card if either color has captured pieces
  const hasBlackCaptured = getCapturedPieces("black").length > 0;
  const hasWhiteCaptured = getCapturedPieces("white").length > 0;

  if (!hasBlackCaptured && !hasWhiteCaptured) return null;

  return (
    <Card className="w-full max-w-lg mx-auto border-none rounded-none shadow-none">
      <CardContent className="flex flex-row justify-between items-center gap-4 p-2">
        <CapturedPieceRow color="black" />
        {hasBlackCaptured && hasWhiteCaptured && (
          <div className="border-t border-border" />
        )}
        <CapturedPieceRow color="white" />
      </CardContent>
    </Card>
  );
};