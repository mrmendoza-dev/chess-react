import { createContext, useContext, ReactNode, useState } from "react";
import {
  createInitialBoard,
  isValidMove,
  Piece,
  PieceColor,
} from "@/utils/chess";

interface Move {
  piece: Piece;
  from: number;
  to: number;
  captured?: Piece;
  timestamp: number;
}

interface GameState {
  board: (Piece | null)[];
  selectedPiece: number | null;
  currentTurn: PieceColor;
  gameStatus: "playing" | "check" | "checkmate" | "stalemate";
  moveHistory: Move[];
}

interface ChessContextType extends GameState {
  handleSquareClick: (position: number) => void;
  resetGame: () => void;
  toChessNotation: (position: number) => string;
  getMoveNotation: (move: Move) => string;
}

const ChessContext = createContext<ChessContextType | undefined>(undefined);

export const ChessProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>({
    board: createInitialBoard(),
    selectedPiece: null,
    currentTurn: "white",
    gameStatus: "playing",
    moveHistory: [],
  });

  // Convert position number to chess notation
  const toChessNotation = (position: number) => {
    const col = String.fromCharCode(97 + (position % 8)); // a-h
    const row = 8 - Math.floor(position / 8); // 1-8
    return `${col}${row}`;
  };

  // Convert move to readable chess notation
  const getMoveNotation = (move: Move) => {
    const pieceSymbols: Record<Piece["type"], string> = {
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

  const handleSquareClick = (position: number) => {
    const { board, selectedPiece, currentTurn, moveHistory } = gameState;
    const piece = board[position];

    if (selectedPiece === null && piece?.color === currentTurn) {
      setGameState((prev) => ({ ...prev, selectedPiece: position }));
      return;
    }

    if (selectedPiece !== null) {
      if (
        selectedPiece !== position &&
        isValidMove(board, selectedPiece, position)
      ) {
        const newBoard = [...board];
        const movingPiece = board[selectedPiece]!;
        const capturedPiece = board[position];

        // Record the move
        const move: Move = {
          piece: movingPiece,
          from: selectedPiece,
          to: position,
          captured: capturedPiece || undefined,
          timestamp: Date.now(),
        };

        // Update board
        newBoard[position] = board[selectedPiece];
        newBoard[selectedPiece] = null;

        if (newBoard[position]) {
          newBoard[position]!.position = position;
          newBoard[position]!.hasMoved = true;
        }

        setGameState((prev) => ({
          ...prev,
          board: newBoard,
          selectedPiece: null,
          currentTurn: currentTurn === "white" ? "black" : "white",
          moveHistory: [...moveHistory, move],
        }));
      } else {
        setGameState((prev) => ({ ...prev, selectedPiece: null }));
      }
    }
  };

  const resetGame = () => {
    setGameState({
      board: createInitialBoard(),
      selectedPiece: null,
      currentTurn: "white",
      gameStatus: "playing",
      moveHistory: [],
    });
  };

  const value = {
    ...gameState,
    handleSquareClick,
    resetGame,
    toChessNotation,
    getMoveNotation,
  };

  return (
    <ChessContext.Provider value={value}>{children}</ChessContext.Provider>
  );
};

// Custom hook for using the chess context
export const useChess = () => {
  const context = useContext(ChessContext);
  if (context === undefined) {
    throw new Error("useChess must be used within a ChessProvider");
  }
  return context;
};
