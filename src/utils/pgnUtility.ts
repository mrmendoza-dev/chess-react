import { GameState, Move } from "@/contexts/ChessContext";
import { getMoveNotation } from "./formatUtility";

export const translateMove = (move: string): string => {
  // Handle castling
  if (move === "e1g1") return "O-O";
  if (move === "e1c1") return "O-O-O";
  if (move === "e8g8") return "O-O";
  if (move === "e8c8") return "O-O-O";

  // Handle piece movements (B, N, R, Q, K)
  const pieceMatch = move.match(/^([BNRQK])(.*)$/);
  if (pieceMatch) {
    const [_, piece, destination] = pieceMatch;
    // If it's a capture, format accordingly
    if (destination.includes("x")) {
      const [from, to] = destination.split("x");
      return `${piece}x${to}`;
    }
    // Regular piece move
    return `${piece}${destination.slice(-2)}`;
  }

  // Handle pawn moves
  const from = move.slice(0, 2);
  const to = move.slice(2);

  // Handle pawn captures
  if (to.includes("x")) {
    const [_, captureTo] = to.split("x");
    return `${from[0]}x${captureTo}`;
  }

  // Regular pawn moves just show destination
  return move.slice(-2);
};

export const formatMoves = (moveHistory: string[]): string => {
  let formattedMoves = "";

  for (let i = 0; i < moveHistory.length; i++) {
    const moveNumber = Math.floor(i / 2) + 1;
    const move = translateMove(moveHistory[i]);

    // For white's moves (even indices)
    if (i % 2 === 0) {
      formattedMoves += `${moveNumber}. ${move} `;
    }
    // For black's moves (odd indices)
    else {
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

  const notatedMoves = gameState.moveHistory.map((move: Move) =>
    getMoveNotation(move)
  );

  const moves = formatMoves(notatedMoves);
  const pgn = `${metadata}\n\n${moves} ${gameState.result || "*"}`;
    const blob = new Blob([pgn], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game.pgn";
    a.click();
};
