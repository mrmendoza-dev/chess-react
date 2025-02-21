import { Move } from "@/contexts/ChessContext";

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
  to: number,
  lastPawnMove?: GameState["lastPawnMove"]
): boolean => {
  const piece = board[from];
  if (!piece) return false;

  // Can't capture your own piece
  if (board[to]?.color === piece.color) return false;

  switch (piece.type) {
    case "pawn":
      return isValidPawnMove(board, from, to, lastPawnMove);
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
export const getRow = (position: number): number => Math.floor(position / 8);
export const getCol = (position: number): number => position % 8;
export const getPosition = (row: number, col: number): number => row * 8 + col;

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
// Update GameState interface in ChessContext
export interface GameState {
  board: (Piece | null)[];
  selectedPiece: number | null;
  currentTurn: PieceColor;
  gameStatus: "playing" | "check" | "checkmate" | "stalemate";
  moveHistory: Move[];
  whitePlayer: string;
  blackPlayer: string;
  result: string;
  lastPawnMove?: { // Add this field
    from: number;
    to: number;
    timestamp: number;
  };
}



// Update isValidPawnMove in chessUtility.ts
const isValidPawnMove = (
  board: (Piece | null)[],
  from: number,
  to: number,
  lastPawnMove?: GameState['lastPawnMove']
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

  // Regular capture move
  if (
    Math.abs(fromCol - toCol) === 1 &&
    toRow === fromRow + direction &&
    board[to] &&
    board[to]?.color !== piece.color
  ) {
    return true;
  }

  // En passant capture
  if (isEnPassantMove(board, from, to, lastPawnMove)) {
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

// Add these to utils/chess.ts

// Check if a castling move is valid
const isValidCastling = (
  board: (Piece | null)[],
  from: number,
  to: number,
  color: PieceColor
): boolean => {
  const piece = board[from];
  if (!piece || piece.type !== 'king' || piece.hasMoved) {
    return false;
  }

  // Kingside castling
  if (to === from + 2) {
    const rook = board[from + 3];
    if (!rook || rook.type !== 'rook' || rook.hasMoved) {
      return false;
    }
    
    // Check if path is clear
    if (board[from + 1] || board[from + 2]) {
      return false;
    }
    
    // Check if king passes through check
    if (
      isSquareUnderAttack(board, from, color === 'white' ? 'black' : 'white') ||
      isSquareUnderAttack(board, from + 1, color === 'white' ? 'black' : 'white') ||
      isSquareUnderAttack(board, from + 2, color === 'white' ? 'black' : 'white')
    ) {
      return false;
    }
    
    return true;
  }
  
  // Queenside castling
  if (to === from - 2) {
    const rook = board[from - 4];
    if (!rook || rook.type !== 'rook' || rook.hasMoved) {
      return false;
    }
    
    // Check if path is clear
    if (board[from - 1] || board[from - 2] || board[from - 3]) {
      return false;
    }
    
    // Check if king passes through check
    if (
      isSquareUnderAttack(board, from, color === 'white' ? 'black' : 'white') ||
      isSquareUnderAttack(board, from - 1, color === 'white' ? 'black' : 'white') ||
      isSquareUnderAttack(board, from - 2, color === 'white' ? 'black' : 'white')
    ) {
      return false;
    }
    
    return true;
  }
  
  return false;
};

// Update the isValidKingMove function
export const isValidKingMove = (
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

  // Normal king moves
  if (Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1) {
    return true;
  }

  // Castling moves
  if (fromRow === toRow && Math.abs(toCol - fromCol) === 2) {
    return isValidCastling(board, from, to, piece.color);
  }

  return false;
};

// Add this to your ChessContext's handleSquareClick function:
export const handleCastling = (
  board: (Piece | null)[],
  from: number,
  to: number
): (Piece | null)[] => {
  const newBoard: any = [...board];
  const king = board[from];

  if (!king || king.type !== 'king') return newBoard;
  
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


// export const getValidMoves = (
//   board: (Piece | null)[],
//   position: number,
//   color: PieceColor
// ): number[] => {
//   const piece = board[position];
//   if (!piece || piece.color !== color) return [];

//   const validMoves: number[] = [];

//   // Check all possible squares
//   for (let targetPos = 0; targetPos < 64; targetPos++) {
//     // Skip current position
//     if (targetPos === position) continue;

//     // Check if move is valid and wouldn't result in check
//     if (
//       isValidMove(board, position, targetPos) &&
//       !wouldMoveResultInCheck(board, position, targetPos, color)
//     ) {
//       validMoves.push(targetPos);
//     }
//   }

//   // Special case for castling
//   if (piece.type === "king" && !piece.hasMoved) {
//     // Kingside castling
//     if (isValidCastling(board, position, position + 2, color)) {
//       validMoves.push(position + 2);
//     }
//     // Queenside castling
//     if (isValidCastling(board, position, position - 2, color)) {
//       validMoves.push(position - 2);
//     }
//   }

//   return validMoves;
// };

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



// export const getValidAttacks = (
//   board: (Piece | null)[],
//   position: number,
//   color: PieceColor
// ): number[] => {
//   const piece = board[position];
//   if (!piece || piece.color !== color) return [];

//   const validAttacks: number[] = [];

//   // Check all possible squares
//   for (let targetPos = 0; targetPos < 64; targetPos++) {
//     // Skip current position
//     if (targetPos === position) continue;

//     const targetPiece = board[targetPos];

//     // Check if move is valid and targets an enemy piece
//     if (
//       isValidMove(board, position, targetPos) &&
//       targetPiece &&
//       targetPiece.color !== color
//     ) {
//       validAttacks.push(targetPos);
//     }
//   }

//   return validAttacks;
// };

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

// In chessUtility.ts

// Check if a pawn can be promoted
export const canPromotePawn = (board: (Piece | null)[], position: number): boolean => {
  const piece = board[position];
  if (!piece || piece.type !== "pawn") return false;
  
  const row = Math.floor(position / 8);
  return (piece.color === "white" && row === 0) || (piece.color === "black" && row === 7);
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
      type: newType
    };
  }
  
  return newBoard;
};



// In chessUtility.ts, update getValidMoves and getValidAttacks to include en passant

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
        (piece.type === "pawn" && isEnPassantMove(board, position, targetPos, lastPawnMove))) &&
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
      ((isValidMove(board, position, targetPos) && targetPiece && targetPiece.color !== color) ||
        (piece.type === "pawn" && isEnPassantMove(board, position, targetPos, lastPawnMove))) &&
      !wouldMoveResultInCheck(board, position, targetPos, color)
    ) {
      validAttacks.push(targetPos);
    }
  }

  return validAttacks;
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