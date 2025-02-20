import { GameState, Move } from "@/contexts/ChessContext";

interface ChessPosition {
  file: number;
  rank: number;
}

const PIECE_SYMBOLS: Record<string, string> = {
  king: "K",
  queen: "Q",
  rook: "R",
  bishop: "B",
  knight: "N",
  pawn: "",
};

// Convert numeric position to chess notation (e.g., 0 -> a8, 63 -> h1)
export const toChessNotation = (position: number | ChessPosition): string => {
  if (typeof position === "number") {
    const file = position % 8;
    const rank = Math.floor(position / 8);
    return `${String.fromCharCode(97 + file)}${8 - rank}`;
  }
  return `${String.fromCharCode(97 + position.file)}${8 - position.rank}`;
};

// Convert chess notation to numeric position (e.g., a8 -> 0, h1 -> 63)
export const fromChessNotation = (notation: string): number => {
  const file = notation.charCodeAt(0) - 97;
  const rank = 8 - parseInt(notation[1]);
  return rank * 8 + file;
};

export const getMoveNotation = (move: Move): string => {
  // Handle castling
  if (move.piece.type === "king" && Math.abs(move.from - move.to) === 2) {
    return move.to > move.from ? "O-O" : "O-O-O";
  }

  const from = toChessNotation(move.from);
  const to = toChessNotation(move.to);
  const pieceSymbol = PIECE_SYMBOLS[move.piece.type];
  const captureNotation = move.captured ? "x" : "";

  // Pawns only show file when capturing
  if (!pieceSymbol && move.captured) {
    return `${from[0]}x${to}`;
  }

  // Regular piece moves
  if (pieceSymbol) {
    // Add from square for disambiguation only when needed
    return `${pieceSymbol}${from}${captureNotation}${to}`;
  }

  // Regular pawn moves just show destination
  return `${captureNotation}${to}`;
};

export const formatMoves = (moveHistory: Move[]): string => {
  let formattedMoves = "";

  for (let i = 0; i < moveHistory.length; i++) {
    const moveNumber = Math.floor(i / 2) + 1;
    const move = getMoveNotation(moveHistory[i]);

    if (i % 2 === 0) {
      formattedMoves += `${moveNumber}. ${move} `;
    } else {
      formattedMoves += `${move} `;
    }
  }

  return formattedMoves.trim();
};

export const exportPGN = (gameState: GameState): void => {
  const metadata = [
    `[White "${gameState.whitePlayer}"]`,
    `[Black "${gameState.blackPlayer}"]`,
    `[Date "${new Date().toLocaleDateString("en-US")}"]`,
    `[Result "${gameState.result || "*"}"]`,
  ].join("\n");

  const moves = formatMoves(gameState.moveHistory);
  const pgn = `${metadata}\n\n${moves} ${gameState.result || "*"}`;

  // Create and trigger download
  const blob = new Blob([pgn], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "game.pgn";
  a.click();
  URL.revokeObjectURL(url); // Clean up
};
