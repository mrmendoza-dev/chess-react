import { Piece, PieceColor, PieceType, GameState } from "@/types/chess";
import { isValidMove } from "./pieceValidation";
import { isEnPassantMove } from "./specialMoves";
import { wouldMoveResultInCheck } from "./gameState";
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

// Helper functions
export const getRow = (position: number): number => Math.floor(position / 8);
export const getCol = (position: number): number => position % 8;
export const getPosition = (row: number, col: number): number => row * 8 + col;

// Helper to find a king's position
export const findKing = (
  board: (Piece | null)[],
  color: PieceColor
): number => {
  return board.findIndex(
    (piece) => piece?.type === "king" && piece.color === color
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

// Helper function to convert position to board coordinates
export const positionToCoords = (position: number) => ({
  row: Math.floor(position / 8),
  col: position % 8,
});

// Helper function to get move description
export const getMoveDescription = (
  board: (Piece | null)[],
  from: number,
  to: number
): string => {
  const piece = board[from];
  if (!piece) return "";

  const fromCoords = positionToCoords(from);
  const toCoords = positionToCoords(to);

  // Special moves
  if (piece.type === "king" && Math.abs(toCoords.col - fromCoords.col) === 2) {
    return toCoords.col > fromCoords.col
      ? "Kingside Castle"
      : "Queenside Castle";
  }

  const targetPiece = board[to];
  const moveType = targetPiece ? "Capture" : "Move";

  return `${moveType} ${piece.type} to ${String.fromCharCode(
    97 + toCoords.col
  )}${8 - toCoords.row}`;
};

// Function to format moves for display
export const formatValidMoves = (
  board: (Piece | null)[],
  position: number,
  color: PieceColor
): { position: number; description: string }[] => {
  const validMoves = getValidMoves(board, position, color);

  return validMoves.map((movePos) => ({
    position: movePos,
    description: getMoveDescription(board, position, movePos),
  }));
};

// Helper to get all pieces that can attack a specific position
export const getPiecesThreateningSquare = (
  board: (Piece | null)[],
  targetPosition: number,
  attackingColor: PieceColor
): number[] => {
  const threateningPieces: number[] = [];

  for (let pos = 0; pos < 64; pos++) {
    const piece = board[pos];
    if (piece && piece.color === attackingColor) {
      if (isValidMove(board, pos, targetPosition)) {
        threateningPieces.push(pos);
      }
    }
  }

  return threateningPieces;
};

// Get all squares a piece can attack, including those blocked by friendly pieces
export const getPotentialAttacks = (
  board: (Piece | null)[],
  position: number,
  color: PieceColor
): number[] => {
  const piece = board[position];
  if (!piece || piece.color !== color) return [];

  const potentialAttacks: number[] = [];
  const tempBoard = [...board];

  // Temporarily remove friendly pieces to see full attack range
  for (let i = 0; i < 64; i++) {
    if (tempBoard[i]?.color === color && i !== position) {
      tempBoard[i] = null;
    }
  }

  // Check all possible squares
  for (let targetPos = 0; targetPos < 64; targetPos++) {
    if (targetPos === position) continue;

    if (isValidMove(tempBoard, position, targetPos)) {
      potentialAttacks.push(targetPos);
    }
  }

  return potentialAttacks;
};

export const getValidMoves = (
  board: (Piece | null)[],
  position: number,
  color: PieceColor,
  lastPawnMove?: GameState["lastPawnMove"]
): number[] => {
  const piece = board[position];
  if (!piece || piece.color !== color) return [];

  const validMoves: number[] = [];

  // Check all possible squares
  for (let targetPos = 0; targetPos < 64; targetPos++) {
    if (targetPos === position) continue;

    // Check if move is valid (including en passant) and wouldn't result in check
    if (
      (isValidMove(board, position, targetPos) ||
        (piece.type === "pawn" &&
          isEnPassantMove(board, position, targetPos, lastPawnMove))) &&
      !wouldMoveResultInCheck(board, position, targetPos, color)
    ) {
      validMoves.push(targetPos);
    }
  }

  return validMoves;
};

export const getValidAttacks = (
  board: (Piece | null)[],
  position: number,
  color: PieceColor,
  lastPawnMove?: GameState["lastPawnMove"]
): number[] => {
  const piece = board[position];
  if (!piece || piece.color !== color) return [];

  const validAttacks: number[] = [];

  // Check all possible squares
  for (let targetPos = 0; targetPos < 64; targetPos++) {
    if (targetPos === position) continue;

    const targetPiece = board[targetPos];

    // Include both regular captures and en passant captures
    if (
      ((isValidMove(board, position, targetPos) &&
        targetPiece &&
        targetPiece.color !== color) ||
        (piece.type === "pawn" &&
          isEnPassantMove(board, position, targetPos, lastPawnMove))) &&
      !wouldMoveResultInCheck(board, position, targetPos, color)
    ) {
      validAttacks.push(targetPos);
    }
  }

  return validAttacks;
};
