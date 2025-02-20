import useLocalStorage from "@/hooks/useLocalStorage";
import {
  createInitialBoard,
  getValidMoves,
  getValidAttacks,
  handleCastling,
  isInCheck,
  isInCheckmate,
  isStalemate,
  isValidMove,
  Piece,
  PieceColor,
  wouldMoveResultInCheck,
} from "@/utils/chessUtility";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { playSound } from "@/utils/soundUtility";

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
  handleSquareHover: (position: number | null) => void;
  resetGame: () => void;
  toChessNotation: (position: number) => string;
  getMoveNotation: (move: Move) => string;
  exportPGN: () => string;
  gameState: GameState;
  validMoves: number[];
  validAttacks: number[];
  hoverPiece: number | null;
  previewMoves: number[];
  previewAttacks: number[];
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
  const [soundTheme, setSoundTheme] = useState("standard");
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [validAttacks, setValidAttacks] = useState<number[]>([]);
  const [hoverPiece, setHoverPiece] = useState<number | null>(null);
  const [previewMoves, setPreviewMoves] = useState<number[]>([]);
  const [previewAttacks, setPreviewAttacks] = useState<number[]>([]);


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

  const updateValidMoves = (board: (Piece | null)[], position: number, currentTurn: PieceColor) => {
    setValidMoves(getValidMoves(board, position, currentTurn));
    setValidAttacks(getValidAttacks(board, position, currentTurn));
  };
  const resetValidMoves = () => {
    setValidMoves([]);
    setValidAttacks([]);
  };
const handleSquareClick = (position: number) => {
  const { board, selectedPiece, currentTurn, moveHistory } = gameState;
  const piece = board[position];

  // If a piece is already selected...
  if (selectedPiece !== null) {
    // If clicking the same piece again, deselect it

    if (position === selectedPiece) {
      setGameState((prev: GameState) => ({ ...prev, selectedPiece: null }));
      resetValidMoves();
      return;
    }

    // If clicking a valid move position, make the move
    if (validMoves.includes(position)) {
      const movingPiece = board[selectedPiece];
      let newBoard;

      // Handle castling moves
      if (
        movingPiece.type === "king" &&
        Math.abs(position - selectedPiece) === 2
      ) {
        newBoard = handleCastling(board, selectedPiece, position);
        playSound(soundTheme, "Castle");
      } else {
        // Handle regular moves
        newBoard = [...board];
        newBoard[position] = movingPiece;
        newBoard[selectedPiece] = null;

        if (board[position]) {
          playSound(soundTheme, "Capture");
        } else {
          playSound(soundTheme, "Move");
        }

        if (newBoard[position]) {
          newBoard[position]!.position = position;
          newBoard[position]!.hasMoved = true;
        }
      }

      const capturedPiece = board[position];
      const nextTurn = currentTurn === "white" ? "black" : "white";
      let newGameStatus: GameState["gameStatus"] = "playing";

      // Record the move
      const move: Move = {
        piece: movingPiece,
        from: selectedPiece,
        to: position,
        captured: capturedPiece || undefined,
        timestamp: Date.now(),
      };

      // Check game status
      if (isInCheckmate(newBoard, nextTurn)) {
        newGameStatus = "checkmate";
        playSound(soundTheme, "Victory");
      } else if (isInCheck(newBoard, nextTurn)) {
        newGameStatus = "check";
        playSound(soundTheme, "Check");
      } else if (isStalemate(newBoard, nextTurn)) {
        newGameStatus = "stalemate";
        playSound(soundTheme, "Draw");
      }

      // Update game state
      setGameState((prev: GameState) => ({
        ...prev,
        board: newBoard,
        selectedPiece: null,
        currentTurn: nextTurn,
        gameStatus: newGameStatus,
        moveHistory: [...moveHistory, move],
      }));
      resetValidMoves();
      return;
    }

    // If clicking a different piece of the same color, select it instead
    if (piece?.color === currentTurn) {
      setGameState((prev: GameState) => ({ ...prev, selectedPiece: position }));
      updateValidMoves(board, position, currentTurn);
      return;
    }

    // If clicking anywhere else, deselect the current piece
    setGameState((prev: GameState) => ({ ...prev, selectedPiece: null }));
    resetValidMoves();
    return;
  }

  // If no piece is selected, select a piece of the current turn's color
  if (piece?.color === currentTurn) {
    setGameState((prev: GameState) => ({ ...prev, selectedPiece: position }));
    updateValidMoves(board, position, currentTurn);
  }
};

const handleSquareHover = (position: number | null) => {
  const { board, currentTurn } = gameState;

  // Clear previews if mouse leaves a square
  if (position === null) {
    setHoverPiece(null);
    setPreviewMoves([]);
    setPreviewAttacks([]);
    return;
  }

  const piece = board[position];

  // Only show previews for current turn's pieces
  if (piece?.color === currentTurn) {
    setHoverPiece(position);
    setPreviewMoves(getValidMoves(board, position, currentTurn));
    setPreviewAttacks(getValidAttacks(board, position, currentTurn));
  } else {
    setHoverPiece(null);
    setPreviewMoves([]);
    setPreviewAttacks([]);
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
    validMoves,
    validAttacks,
    hoverPiece,
    previewMoves,
    previewAttacks,
    handleSquareHover,
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
