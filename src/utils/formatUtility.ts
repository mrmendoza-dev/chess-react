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

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
