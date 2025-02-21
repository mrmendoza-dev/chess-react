import { Piece, PieceColor, GameState } from "@/types/chess";
import { isValidMove } from "./pieceValidation";
import { isInCheck, wouldMoveResultInCheck } from "./gameState";
import { findKing } from "./chessUtility";

// Basic piece values for evaluation
const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Position bonuses for each piece type
const POSITION_BONUSES = {
  pawn: [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
  ],
  knight: [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
  ],
  bishop: [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
  ],
  rook: [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
  ],
  queen: [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  king: [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
  ]
};


// Get all valid moves for a color
const getAllValidMoves = (
  board: (Piece | null)[],
  color: PieceColor,
  gameState?: GameState
): Array<{ from: number; to: number }> => {
  const moves: Array<{ from: number; to: number }> = [];

  for (let from = 0; from < 64; from++) {
    const piece = board[from];
    if (piece && piece.color === color) {
      for (let to = 0; to < 64; to++) {
        if (
          isValidMove(board, from, to, gameState?.lastPawnMove) &&
          !wouldMoveResultInCheck(board, from, to, color, gameState?.lastPawnMove)
        ) {
          moves.push({ from, to });
        }
      }
    }
  }

  return moves;
};

// Make a move on a board copy
const makeMove = (
  board: (Piece | null)[],
  from: number,
  to: number
): (Piece | null)[] => {
  const newBoard = [...board];
  newBoard[to] = newBoard[from];
  newBoard[from] = null;
  return newBoard;
};

// Minimax with alpha-beta pruning
const minimax = (
  board: (Piece | null)[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  gameState?: GameState
): { score: number; move?: { from: number; to: number } } => {
  if (depth === 0) {
    return { score: evaluatePosition(board) };
  }

  const color = isMaximizing ? "white" : "black";
  const moves = getAllValidMoves(board, color, gameState);

  if (moves.length === 0) {
    return { score: isMaximizing ? -Infinity : Infinity };
  }

  let bestMove: { from: number; to: number } | undefined;
  let bestScore = isMaximizing ? -Infinity : Infinity;

  for (const move of moves) {
    const newBoard = makeMove(board, move.from, move.to);
    const { score } = minimax(newBoard, depth - 1, alpha, beta, !isMaximizing, gameState);

    if (isMaximizing) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestScore);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, bestScore);
    }

    if (beta <= alpha) {
      break;
    }
  }

  return { score: bestScore, move: bestMove };
};




const evaluatePosition = (
  board: (Piece | null)[],
  gameState?: GameState,
  difficulty: "beginner" | "easy" | "medium" | "hard" | "extreme" = "medium"
): number => {
  let score = 0;

  // Enhanced difficulty settings
  const accuracyMultiplier = {
    beginner: 0.5, // Makes very frequent mistakes
    easy: 0.7, // Makes frequent mistakes
    medium: 0.9, // Makes occasional mistakes
    hard: 1.0, // Plays accurately
    extreme: 1.2, // Enhanced accuracy and aggressive play
  };

  // Random variation adjusted for each level
  const randomVariation = {
    beginner: Math.random() * 400 - 200, // Very large random factor
    easy: Math.random() * 200 - 100, // Large random factor
    medium: Math.random() * 100 - 50, // Moderate random factor
    hard: Math.random() * 20 - 10, // Minimal randomness
    extreme: 0, // No randomness
  };

  // Position evaluation weights
  const positionalMultiplier = {
    beginner: 0.2, // Minimal positional understanding
    easy: 0.4, // Basic positional understanding
    medium: 0.8, // Good positional understanding
    hard: 1.0, // Full positional awareness
    extreme: 1.3, // Enhanced positional awareness
  };

  // Material and position evaluation
  board.forEach((piece, position) => {
    if (!piece) return;

    const value = PIECE_VALUES[piece.type];
    const multiplier = piece.color === "white" ? 1 : -1;
    const positionBonus =
      POSITION_BONUSES[piece.type][
        piece.color === "white" ? position : 63 - position
      ];

    // Apply difficulty-based multipliers
    score += value * multiplier * accuracyMultiplier[difficulty];
    score += positionBonus * multiplier * positionalMultiplier[difficulty];
  });

  // Add difficulty-based randomness
  score += randomVariation[difficulty];

  // Advanced strategic considerations for higher difficulties
  if (difficulty === "hard" || difficulty === "extreme") {
    // Enhanced center control evaluation
    const centerBonus = difficulty === "extreme" ? 40 : 25;
    const centerSquares = [27, 28, 35, 36];
    const extendedCenterSquares = [
      18, 19, 20, 21, 26, 29, 34, 37, 42, 43, 44, 45,
    ];

    centerSquares.forEach((square) => {
      const piece = board[square];
      if (piece) {
        score += centerBonus * (piece.color === "white" ? 1 : -1);
      }
    });

    // Additional bonus for extended center control in extreme mode
    if (difficulty === "extreme") {
      extendedCenterSquares.forEach((square) => {
        const piece = board[square];
        if (piece) {
          score += 15 * (piece.color === "white" ? 1 : -1);
        }
      });
    }
  }

  // King safety evaluation (enhanced for extreme)
  const whiteKingPos = findKing(board, "white");
  const blackKingPos = findKing(board, "black");

  if (whiteKingPos !== -1 && blackKingPos !== -1) {
    const kingEvalMultiplier = {
      beginner: 0.3,
      easy: 0.5,
      medium: 0.8,
      hard: 1.0,
      extreme: 1.5,
    };

    const whiteKingSafety = evaluateKingSafety(board, whiteKingPos, "white");
    const blackKingSafety = evaluateKingSafety(board, blackKingPos, "black");

    score += whiteKingSafety * kingEvalMultiplier[difficulty];
    score -= blackKingSafety * kingEvalMultiplier[difficulty];
  }

  // Check status evaluation
  const checkPenalty = {
    beginner: 300,
    easy: 400,
    medium: 500,
    hard: 600,
    extreme: 800,
  };

  if (isInCheck(board, "white")) {
    score -= checkPenalty[difficulty];
  }
  if (isInCheck(board, "black")) {
    score += checkPenalty[difficulty];
  }

  return score;
};

// Main function to get computer move with adjusted depths
export const getComputerMove = (
  board: (Piece | null)[],
  color: PieceColor,
  gameState?: GameState,
  difficulty: "beginner" | "easy" | "medium" | "hard" | "extreme" = "medium"
): { from: number; to: number } | null => {
  const depths = {
    beginner: 1, // Only looks at immediate moves
    easy: 2, // Looks 2 moves ahead
    medium: 3, // Looks 3 moves ahead
    hard: 4, // Looks 4 moves ahead
    extreme: 5, // Looks 5 moves ahead
  };

  const depth = depths[difficulty];
  const isMaximizing = color === "white";

  const { move } = minimax(
    board,
    depth,
    -Infinity,
    Infinity,
    isMaximizing,
    gameState
  );

  return move || null;
};

// Enhanced king safety evaluation
const evaluateKingSafety = (
  board: (Piece | null)[],
  kingPos: number,
  color: PieceColor
): number => {
  let safety = 0;
  const row = Math.floor(kingPos / 8);
  const col = kingPos % 8;

  // Increased penalty for exposed king
  if (col > 2 && col < 6) {
    safety -= 80;
  }

  // Enhanced pawn shield evaluation
  const pawnShieldSquares =
    color === "white"
      ? [
          kingPos - 8,
          kingPos - 7,
          kingPos - 9,
          kingPos - 16,
          kingPos - 15,
          kingPos - 17,
        ]
      : [
          kingPos + 8,
          kingPos + 7,
          kingPos + 9,
          kingPos + 16,
          kingPos + 15,
          kingPos + 17,
        ];

  pawnShieldSquares.forEach((square, index) => {
    if (square >= 0 && square < 64) {
      const piece = board[square];
      if (piece?.type === "pawn" && piece.color === color) {
        // Closer pawns provide better protection
        safety += index < 3 ? 40 : 20;
      }
    }
  });

  // Evaluate piece proximity to king
  const adjacentSquares = [
    kingPos - 9,
    kingPos - 8,
    kingPos - 7,
    kingPos - 1,
    kingPos + 1,
    kingPos + 7,
    kingPos + 8,
    kingPos + 9,
  ];

  adjacentSquares.forEach((square) => {
    if (square >= 0 && square < 64) {
      const piece = board[square];
      if (piece && piece.color === color) {
        safety += 15; // Bonus for friendly pieces near king
      }
    }
  });

  return safety;
};