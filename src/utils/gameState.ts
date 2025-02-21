import { GameState } from "@/types/chess";
import { Piece, PieceColor } from "@/types/chess";
import { findKing, isSquareUnderAttack } from "./chessUtility";
import { isValidMove } from "./pieceValidation";
import { isEnPassantMove } from "./specialMoves";

// Check if the given color is in check
export const isInCheck = (
  board: (Piece | null)[],
  color: PieceColor
): boolean => {
  const kingPosition = findKing(board, color);
  const oppositeColor = color === "white" ? "black" : "white";

  return isSquareUnderAttack(board, kingPosition, oppositeColor);
};

// Simulate a move and check if it results in self-check
export const wouldMoveResultInCheck = (
  board: (Piece | null)[],
  from: number,
  to: number,
  color: PieceColor,
  lastPawnMove?: GameState["lastPawnMove"]
): boolean => {
  const tempBoard = [...board];
  const piece = tempBoard[from];

  // Handle en passant capture in check validation
  if (
    piece?.type === "pawn" &&
    isEnPassantMove(board, from, to, lastPawnMove)
  ) {
    const capturedPawnPos = lastPawnMove!.to;
    tempBoard[capturedPawnPos] = null;
  }

  tempBoard[to] = tempBoard[from];
  tempBoard[from] = null;

  return isInCheck(tempBoard, color);
};

// Check if the given color is in checkmate
export const isInCheckmate = (
  board: (Piece | null)[],
  color: PieceColor
): boolean => {
  // If not in check, can't be in checkmate
  if (!isInCheck(board, color)) {
    return false;
  }

  // Check every piece of the current color
  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (piece && piece.color === color) {
      // Try every possible destination
      for (let to = 0; to < 64; to++) {
        // If move is valid and doesn't result in check
        if (
          isValidMove(board, from, to) &&
          !wouldMoveResultInCheck(board, from, to, color)
        ) {
          // Found a legal move, not checkmate
          return false;
        }
      }
    }
  }

  // No legal moves found, it's checkmate
  return true;
};

// Check if the position is a stalemate
export const isStalemate = (
  board: (Piece | null)[],
  color: PieceColor
): boolean => {
  // If in check, it's not stalemate
  if (isInCheck(board, color)) {
    return false;
  }

  // Check if any legal moves exist
  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (piece && piece.color === color) {
      for (let to = 0; to < 64; to++) {
        if (
          isValidMove(board, from, to) &&
          !wouldMoveResultInCheck(board, from, to, color)
        ) {
          // Found a legal move, not stalemate
          return false;
        }
      }
    }
  }

  // No legal moves found, it's stalemate
  return true;
};
