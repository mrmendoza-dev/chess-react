import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Piece, PieceColor } from "@/types/chess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getPieceIcon } from "./Chess";

interface PawnPromotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPromote: (pieceType: Piece["type"]) => void;
  color: PieceColor;
}

export const PawnPromotionDialog = ({
  isOpen,
  onClose,
  onPromote,
  color,
}: PawnPromotionDialogProps) => {
  const promotionPieces: Piece["type"][] = [
    "queen",
    "rook",
    "bishop",
    "knight",
  ];

  const getPieceStyle = (color: PieceColor) => ({
    fontSize: "48px",
    color: color === "white" ? "white" : "black",
    filter:
      color === "white"
        ? "drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.5))"
        : "drop-shadow(2px 2px 2px rgba(255, 255, 255, 0.3))",
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Choose Promotion Piece</DialogTitle>
        <div className="grid grid-cols-4 gap-4 bg-gray-100 dark:bg-neutral-800 rounded-lg">
          {promotionPieces.map((pieceType) => (
            <button
              key={pieceType}
              onClick={() => onPromote(pieceType)}
              className="p-4 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              <FontAwesomeIcon
                icon={getPieceIcon(pieceType)}
                style={getPieceStyle(color)}
              />
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
