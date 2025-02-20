import useLocalStorage from "@/hooks/useLocalStorage";
import {
  createInitialBoard,
  handleCastling,
  isInCheck,
  isInCheckmate,
  isStalemate,
  isValidMove,
  Piece,
  PieceColor,
  wouldMoveResultInCheck,
} from "@/utils/chessUtility";
import { createContext, ReactNode, useContext, useEffect } from "react";

export interface Move {
  piece: Piece;
  from: number;
  to: number;
  captured?: Piece;
  timestamp: number;
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
}

interface ChessContextType extends GameState {
  handleSquareClick: (position: number) => void;
  resetGame: () => void;
  toChessNotation: (position: number) => string;
  getMoveNotation: (move: Move) => string;
  exportPGN: () => string;
  gameState: GameState;
}

const ChessContext = createContext<ChessContextType | undefined>(undefined);

export const ChessProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useLocalStorage("gameState", {
    board: createInitialBoard(),
    selectedPiece: null,
    currentTurn: "white",
    gameStatus: "playing",
    moveHistory: [],
    whitePlayer: "Player",
    blackPlayer: "Computer",
    result: "*",
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

    // First click - selecting a piece
    if (selectedPiece === null && piece?.color === currentTurn) {
      setGameState((prev: GameState) => ({ ...prev, selectedPiece: position }));
      return;
    }

    // Second click - attempting to move
    if (selectedPiece !== null) {
      const movingPiece = board[selectedPiece];

      // Clicking the same square or invalid selection
      if (!movingPiece || selectedPiece === position) {
        setGameState((prev: GameState) => ({ ...prev, selectedPiece: null }));
        return;
      }

      // Check if move is valid and wouldn't result in self-check
      if (
        isValidMove(board, selectedPiece, position) &&
        !wouldMoveResultInCheck(board, selectedPiece, position, currentTurn)
      ) {
        let newBoard;

        // Handle castling moves
        if (
          movingPiece.type === "king" &&
          Math.abs(position - selectedPiece) === 2
        ) {
          newBoard = handleCastling(board, selectedPiece, position);
        } else {
          // Handle regular moves
          newBoard = [...board];
          newBoard[position] = movingPiece;
          newBoard[selectedPiece] = null;

          // Update piece position
          if (newBoard[position]) {
            newBoard[position]!.position = position;
            newBoard[position]!.hasMoved = true;
          }
        }

        const capturedPiece = board[position];

        // Record the move
        const move: Move = {
          piece: movingPiece,
          from: selectedPiece,
          to: position,
          captured: capturedPiece || undefined,
          timestamp: Date.now(),
        };

        // Calculate next turn's color
        const nextTurn = currentTurn === "white" ? "black" : "white";

        // Check game status for the next player AFTER the move
        let newGameStatus: GameState["gameStatus"] = "playing";

        if (isInCheckmate(newBoard, nextTurn)) {
          newGameStatus = "checkmate";
        } else if (isInCheck(newBoard, nextTurn)) {
          newGameStatus = "check";
        } else if (isStalemate(newBoard, nextTurn)) {
          newGameStatus = "stalemate";
        }

        setGameState((prev: GameState) => ({
          ...prev,
          board: newBoard,
          selectedPiece: null,
          currentTurn: nextTurn,
          gameStatus: newGameStatus,
          moveHistory: [...moveHistory, move],
        }));
      } else {
        // Invalid move - just deselect the piece
        setGameState((prev: GameState) => ({ ...prev, selectedPiece: null }));
      }
    }
  };

  useEffect(() => {
    const { board, currentTurn } = gameState;
    let status: GameState["gameStatus"] = "playing";

    if (isInCheckmate(board, currentTurn)) {
      status = "checkmate";
    } else if (isInCheck(board, currentTurn)) {
      status = "check";
    } else if (isStalemate(board, currentTurn)) {
      status = "stalemate";
    }

    if (status !== gameState.gameStatus) {
      setGameState((prev: GameState) => ({ ...prev, gameStatus: status }));
    }
  }, [gameState.board, gameState.currentTurn]);

  const resetGame = () => {
    setGameState({
      ...gameState,
      board: createInitialBoard(),
      selectedPiece: null,
      currentTurn: "white",
      gameStatus: "playing",
      moveHistory: [],
      result: "*",
      whitePlayer: "Player",
      blackPlayer: "Computer",
    });
  };

  const value = {
    ...gameState,
    gameState,
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
