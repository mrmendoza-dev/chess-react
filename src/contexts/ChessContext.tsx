import useLocalStorage from "@/hooks/useLocalStorage";
import { GameState, Move, Piece, PieceColor } from "@/types/chess";
import {
  createInitialBoard,
  getValidAttacks,
  getValidMoves,
} from "@/utils/chessUtility";
import { handleCastling, isEnPassantMove } from "@/utils/specialMoves";
import { isInCheck, isInCheckmate, isStalemate } from "@/utils/gameState";
import { playSound } from "@/utils/soundUtility";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getComputerMove } from "@/utils/computerLogic";

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
  promotionSquare: number | null;
  handlePromotion: (pieceType: Piece["type"]) => void;
  playComputer: boolean;
  setPlayComputer: (playComputer: boolean) => void;
  botDifficulty: "easy" | "medium" | "hard";
  setBotDifficulty: (botDifficulty: "easy" | "medium" | "hard") => void;
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
    lastPawnMove: null,
  });
  const [soundTheme, setSoundTheme] = useState("standard");
  const [validMoves, setValidMoves] = useState<number[]>([]);
  const [validAttacks, setValidAttacks] = useState<number[]>([]);
  const [hoverPiece, setHoverPiece] = useState<number | null>(null);
  const [previewMoves, setPreviewMoves] = useState<number[]>([]);
  const [previewAttacks, setPreviewAttacks] = useState<number[]>([]);
  const [promotionSquare, setPromotionSquare] = useState<number | null>(null);
  const [botDifficulty, setBotDifficulty] = useLocalStorage(
    "botDifficulty",
    "medium"
  );
  const [playComputer, setPlayComputer] = useLocalStorage("playComputer", true);

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

  const updateValidMoves = (
    board: (Piece | null)[],
    position: number,
    currentTurn: PieceColor
  ) => {
    setValidMoves(
      getValidMoves(board, position, currentTurn, gameState.lastPawnMove)
    );
    setValidAttacks(
      getValidAttacks(board, position, currentTurn, gameState.lastPawnMove)
    );
  };

  const resetValidMoves = () => {
    setValidMoves([]);
    setValidAttacks([]);
  };
  const handleSquareClick = (position: number) => {
    const { board, selectedPiece, currentTurn, moveHistory, lastPawnMove } =
      gameState;
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
        let newBoard: (Piece | null)[];

        // Handle castling moves
        if (
          movingPiece.type === "king" &&
          Math.abs(position - selectedPiece) === 2
        ) {
          newBoard = handleCastling(board, selectedPiece, position);
          playSound(soundTheme, "Castle");
        } else {
          // Handle regular moves and en passant
          newBoard = [...board];

          // Check for en passant capture
          if (
            movingPiece.type === "pawn" &&
            isEnPassantMove(board, selectedPiece, position, lastPawnMove)
          ) {
            // Remove the captured pawn
            const capturedPawnPosition = lastPawnMove.to;
            const capturedPawn = board[capturedPawnPosition];
            newBoard[capturedPawnPosition] = null;
            playSound(soundTheme, "Capture");

            // Move the capturing pawn
            newBoard[position] = { ...movingPiece, position, hasMoved: true };
            newBoard[selectedPiece] = null;
          }
          // Check for pawn promotion
          else if (
            movingPiece.type === "pawn" &&
            ((movingPiece.color === "white" &&
              Math.floor(position / 8) === 0) ||
              (movingPiece.color === "black" && Math.floor(position / 8) === 7))
          ) {
            // Make the move but don't change turns yet
            newBoard[position] = { ...movingPiece, position, hasMoved: true };
            newBoard[selectedPiece] = null;

            const capturedPiece = board[position];

            // Update game state but stay on same turn
            setGameState((prev: GameState) => ({
              ...prev,
              board: newBoard,
              selectedPiece: null,
              moveHistory: [
                ...moveHistory,
                {
                  piece: movingPiece,
                  from: selectedPiece,
                  to: position,
                  captured: capturedPiece || undefined,
                  timestamp: Date.now(),
                },
              ],
              lastPawnMove:
                movingPiece.type === "pawn"
                  ? { from: selectedPiece, to: position, timestamp: Date.now() }
                  : prev.lastPawnMove,
            }));

            setPromotionSquare(position);
            resetValidMoves();
            return;
          }
          // Handle regular moves
          else {
            newBoard[position] = { ...movingPiece, position, hasMoved: true };
            newBoard[selectedPiece] = null;

            if (board[position]) {
              playSound(soundTheme, "Capture");
            } else {
              playSound(soundTheme, "Move");
            }
          }
        }

        const capturedPiece = board[position];
        const nextTurn = currentTurn === "white" ? "black" : "white";
        let newGameStatus: GameState["gameStatus"] = "playing";

        // Record the move and update lastPawnMove if needed
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
          lastPawnMove:
            movingPiece.type === "pawn"
              ? { from: selectedPiece, to: position, timestamp: Date.now() }
              : prev.lastPawnMove,
        }));
        resetValidMoves();
        return;
      }

      // If clicking a different piece of the same color, select it instead
      if (piece?.color === currentTurn) {
        setGameState((prev: GameState) => ({
          ...prev,
          selectedPiece: position,
        }));
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

  useEffect(() => {
    // Only make a move if it's computer's turn and game is still playing
    if (
      gameState.currentTurn === "black" &&
      gameState.blackPlayer === "Computer" &&
      (gameState.gameStatus === "playing" || gameState.gameStatus === "check") &&
      playComputer
    ) {
      const timer = setTimeout(() => {
        const computerMove = getComputerMove(
          gameState.board,
          "black",
          gameState,
          botDifficulty
        );

        if (computerMove) {
          // First click to select the piece
          handleSquareClick(computerMove.from);

          // Wait for valid moves to be calculated
          if (gameState.selectedPiece === computerMove.from) {
            setTimeout(() => {
              handleSquareClick(computerMove.to);
            }, 300);
          }
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.gameStatus, gameState.selectedPiece]); // Add selectedPiece to dependencies

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
      lastPawnMove: null,
    });
  };

  const handlePromotion = (pieceType: Piece["type"]) => {
    if (promotionSquare === null) return;

    // Get the current board state
    const { board, currentTurn, moveHistory } = gameState;

    // Create new board with promoted piece
    const newBoard = [...board];
    const piece = newBoard[promotionSquare];

    if (piece && piece.type === "pawn") {
      newBoard[promotionSquare] = {
        ...piece,
        type: pieceType,
      };
    }

    const nextTurn = currentTurn === "white" ? "black" : "white";
    let newGameStatus: GameState["gameStatus"] = "playing";

    // Check game status after promotion
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

    // Update the last move to include promotion
    const lastMove = moveHistory[moveHistory.length - 1];
    const updatedMove = {
      ...lastMove,
      promotion: pieceType,
    };

    // Update game state
    setGameState((prev: GameState) => ({
      ...prev,
      board: newBoard,
      currentTurn: nextTurn,
      gameStatus: newGameStatus,
      moveHistory: [...moveHistory.slice(0, -1), updatedMove],
    }));

    setPromotionSquare(null);
    playSound(soundTheme, "GenericNotify");
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
    handlePromotion,
    promotionSquare,
    playComputer,
    setPlayComputer,
    botDifficulty,
    setBotDifficulty,
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
