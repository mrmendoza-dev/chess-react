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




// Add these to utils/chess.ts

// Helper to find a king's position
export const findKing = (board: (Piece | null)[], color: PieceColor): number => {
  return board.findIndex(
    (piece) => piece?.type === 'king' && piece.color === color
  );
};

// Check if a position is under attack by the opposite color
export const isSquareUnderAttack = (
  board: (Piece | null)[],
  position: number,
  attackingColor: PieceColor
): boolean => {
  // Check every square on the board
  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (piece && piece.color === attackingColor) {
      // If an enemy piece can move to this position, the square is under attack
      if (isValidMove(board, i, position)) {
        return true;
      }
    }
  }
  return false;
};

// Check if the given color is in check
export const isInCheck = (
  board: (Piece | null)[],
  color: PieceColor
): boolean => {
  const kingPosition = findKing(board, color);
  const oppositeColor = color === 'white' ? 'black' : 'white';
  
  return isSquareUnderAttack(board, kingPosition, oppositeColor);
};

// Simulate a move and check if it results in self-check
export const wouldMoveResultInCheck = (
  board: (Piece | null)[],
  from: number,
  to: number,
  color: PieceColor
): boolean => {
  // Create a copy of the board
  const tempBoard = [...board];
  
  // Make the move on the temporary board
  tempBoard[to] = tempBoard[from];
  tempBoard[from] = null;
  
  // Check if the move results in check
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