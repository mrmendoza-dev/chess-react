// src/types/chess.ts
export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king";
export type PieceColor = "white" | "black";

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: number;
  hasMoved?: boolean;
}

export interface GameState {
  board: (Piece | null)[];
  selectedPiece: number | null;
  currentTurn: PieceColor;
  gameStatus: "playing" | "check" | "checkmate" | "stalemate";
  moveHistory: Move[];
  whitePlayer: string;
  blackPlayer: string;
  result: string;
  lastPawnMove?: {
    from: number;
    to: number;
    timestamp: number;
  };
}

export interface Move {
  piece: Piece;
  from: number;
  to: number;
  captured?: Piece;
  timestamp: number;
}