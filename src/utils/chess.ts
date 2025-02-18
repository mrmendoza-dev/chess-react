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
  position: number; // 0-63 for board positions
  hasMoved?: boolean;
}

export interface Square {
  position: number;
  piece: Piece | null;
}

export const createInitialBoard = (): (Piece | null)[] => {
  const board: (Piece | null)[] = Array(64).fill(null);

  // Helper to place pieces
  const placePiece = (position: number, type: PieceType, color: PieceColor) => {
    board[position] = { type, color, position };
  };

  // Place pawns
  for (let i = 8; i < 16; i++) {
    placePiece(i, "pawn", "black");
  }
  for (let i = 48; i < 56; i++) {
    placePiece(i, "pawn", "white");
  }

  // Place other pieces
  const backRowPieces: PieceType[] = [
    "rook",
    "knight",
    "bishop",
    "queen",
    "king",
    "bishop",
    "knight",
    "rook",
  ];

  // Black pieces
  backRowPieces.forEach((type, i) => {
    placePiece(i, type, "black");
  });

  // White pieces
  backRowPieces.forEach((type, i) => {
    placePiece(56 + i, type, "white");
  });

  return board;
};

// src/utils/chess.ts
export const isValidMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): boolean => {
  const piece = board[from];
  if (!piece) return false;

  // Can't capture your own piece
  if (board[to]?.color === piece.color) return false;

  switch (piece.type) {
    case "pawn":
      return isValidPawnMove(board, from, to);
    case "rook":
      return isValidRookMove(board, from, to);
    case "knight":
      return isValidKnightMove(board, from, to);
    case "bishop":
      return isValidBishopMove(board, from, to);
    case "queen":
      return isValidQueenMove(board, from, to);
    case "king":
      return isValidKingMove(board, from, to);
    default:
      return false;
  }
};

// Helper functions
const getRow = (position: number): number => Math.floor(position / 8);
const getCol = (position: number): number => position % 8;
const getPosition = (row: number, col: number): number => row * 8 + col;

const isPathClear = (
  board: (Piece | null)[],
  from: number,
  to: number,
  isDiagonal: boolean
): boolean => {
  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
  const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;

  while (
    isDiagonal
      ? currentRow !== toRow && currentCol !== toCol
      : currentRow !== toRow || currentCol !== toCol
  ) {
    if (board[getPosition(currentRow, currentCol)] !== null) {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
};

// Piece-specific move validation
const isValidPawnMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): boolean => {
  const piece = board[from];
  if (!piece) return false;

  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  const direction = piece.color === "white" ? -1 : 1;
  const startRow = piece.color === "white" ? 6 : 1;

  // Basic forward move
  if (fromCol === toCol && toRow === fromRow + direction && !board[to]) {
    return true;
  }

  // Initial two-square move
  if (
    fromCol === toCol &&
    fromRow === startRow &&
    toRow === fromRow + 2 * direction &&
    !board[to] &&
    !board[getPosition(fromRow + direction, fromCol)]
  ) {
    return true;
  }

  // Capture move
  if (
    Math.abs(fromCol - toCol) === 1 &&
    toRow === fromRow + direction &&
    board[to] &&
    board[to]?.color !== piece.color
  ) {
    return true;
  }

  return false;
};

const isValidRookMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): boolean => {
  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  if (fromRow !== toRow && fromCol !== toCol) return false;
  return isPathClear(board, from, to, false);
};

const isValidKnightMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): boolean => {
  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

const isValidBishopMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): boolean => {
  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
  return isPathClear(board, from, to, true);
};

const isValidQueenMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): boolean => {
  return isValidRookMove(board, from, to) || isValidBishopMove(board, from, to);
};

const isValidKingMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): boolean => {
  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  return Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
};

export const toChessNotation = (position: number) => {
  const col = String.fromCharCode(97 + (position % 8)); // a-h
  const row = 8 - Math.floor(position / 8); // 1-8
  return `${col}${row}`;
};

export const getMoveNotation = (move: any) => {
  const pieceSymbols: Record<string, string> = {
    king: "K",
    queen: "Q",
    rook: "R",
    bishop: "B",
    knight: "N",
    pawn: "",
  };

  const from = toChessNotation(move.from);
  const to = toChessNotation(move.to);
  const pieceSymbol = pieceSymbols[move.piece.type];
  const captureNotation = move.captured ? "x" : "";

  return `${pieceSymbol}${from}${captureNotation}${to}`;
};
