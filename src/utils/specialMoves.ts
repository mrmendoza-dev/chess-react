// Check if a castling move is valid
import { Piece, PieceColor, GameState } from "@/types/chess";
import { isSquareUnderAttack, getRow, getCol } from "./chessUtility";

export const isValidCastling = (
  board: (Piece | null)[],
  from: number,
  to: number,
  color: PieceColor
): boolean => {
  const piece = board[from];
  if (!piece || piece.type !== "king" || piece.hasMoved) {
    return false;
  }

  // Kingside castling
  if (to === from + 2) {
    const rook = board[from + 3];
    if (!rook || rook.type !== "rook" || rook.hasMoved) {
      return false;
    }

    // Check if path is clear
    if (board[from + 1] || board[from + 2]) {
      return false;
    }

    // Check if king passes through check
    if (
      isSquareUnderAttack(board, from, color === "white" ? "black" : "white") ||
      isSquareUnderAttack(
        board,
        from + 1,
        color === "white" ? "black" : "white"
      ) ||
      isSquareUnderAttack(
        board,
        from + 2,
        color === "white" ? "black" : "white"
      )
    ) {
      return false;
    }

    return true;
  }

  // Queenside castling
  if (to === from - 2) {
    const rook = board[from - 4];
    if (!rook || rook.type !== "rook" || rook.hasMoved) {
      return false;
    }

    // Check if path is clear
    if (board[from - 1] || board[from - 2] || board[from - 3]) {
      return false;
    }

    // Check if king passes through check
    if (
      isSquareUnderAttack(board, from, color === "white" ? "black" : "white") ||
      isSquareUnderAttack(
        board,
        from - 1,
        color === "white" ? "black" : "white"
      ) ||
      isSquareUnderAttack(
        board,
        from - 2,
        color === "white" ? "black" : "white"
      )
    ) {
      return false;
    }

    return true;
  }

  return false;
};


export const handleCastling = (
  board: (Piece | null)[],
  from: number,
  to: number
): (Piece | null)[] => {
  const newBoard: any = [...board];
  const king = board[from];

  if (!king || king.type !== "king") return newBoard;

  // Kingside castling
  if (to === from + 2) {
    // Move rook
    newBoard[from + 1] = newBoard[from + 3];
    newBoard[from + 3] = null;
    if (newBoard[from + 1]) {
      newBoard[from + 1].position = from + 1;
      newBoard[from + 1].hasMoved = true;
    }
  }

  // Queenside castling
  if (to === from - 2) {
    // Move rook
    newBoard[from - 1] = newBoard[from - 4];
    newBoard[from - 4] = null;
    if (newBoard[from - 1]) {
      newBoard[from - 1].position = from - 1;
      newBoard[from - 1].hasMoved = true;
    }
  }

  // Move king
  newBoard[to] = newBoard[from];
  newBoard[from] = null;
  if (newBoard[to]) {
    newBoard[to].position = to;
    newBoard[to].hasMoved = true;
  }

  return newBoard;
};

// Check if a pawn can be promoted
export const canPromotePawn = (
  board: (Piece | null)[],
  position: number
): boolean => {
  const piece = board[position];
  if (!piece || piece.type !== "pawn") return false;

  const row = Math.floor(position / 8);
  return (
    (piece.color === "white" && row === 0) ||
    (piece.color === "black" && row === 7)
  );
};

// Handle pawn promotion
export const promotePawn = (
  board: (Piece | null)[],
  position: number,
  newType: Piece["type"]
): (Piece | null)[] => {
  const newBoard = [...board];
  const piece = newBoard[position];

  if (piece && piece.type === "pawn") {
    newBoard[position] = {
      ...piece,
      type: newType,
    };
  }

  return newBoard;
};

export const isEnPassantMove = (
  board: (Piece | null)[],
  from: number,
  to: number,
  lastPawnMove?: GameState["lastPawnMove"]
): boolean => {
  if (!lastPawnMove) return false;

  const piece = board[from];
  if (!piece || piece.type !== "pawn") return false;

  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  // Must be on correct row based on color
  const correctRow = piece.color === "white" ? 3 : 4;
  if (fromRow !== correctRow) return false;

  // Must move diagonally forward one square, just like a normal pawn capture
  const direction = piece.color === "white" ? -1 : 1;
  if (toRow !== fromRow + direction) return false; // Must move exactly one row forward
  if (Math.abs(toCol - fromCol) !== 1) return false; // Must move exactly one column left or right

  // Check if there's an enemy pawn that just moved two squares
  const capturedPawnPos = lastPawnMove.to;
  const capturedPawn = board[capturedPawnPos];

  if (
    !capturedPawn ||
    capturedPawn.type !== "pawn" ||
    capturedPawn.color === piece.color
  )
    return false;

  // Check if the last move was a two-square pawn move
  const lastMoveFromRow = getRow(lastPawnMove.from);
  const lastMoveToRow = getRow(lastPawnMove.to);
  if (Math.abs(lastMoveToRow - lastMoveFromRow) !== 2) return false;

  // Check if the captured pawn is on the same column as the destination
  return toCol === getCol(lastPawnMove.to);
};
