import { useEffect, useRef } from "react";
import { Move } from "@/contexts/ChessContext";
import { getMoveNotation } from "@/utils/pgnUtility";

export const MoveHistory = ({ moveHistory }: { moveHistory: Move[] }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const element = scrollRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [moveHistory]);

  const turns = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    turns.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1],
    });
  }

  return (
    <div className="w-full bg-card rounded-lg shadow-lg border border-border p-4">
      <h3 className="text-lg font-semibold mb-3">Move History</h3>
      <div
        ref={scrollRef}
        className="min-h-[400px] max-h-[400px] overflow-y-auto scroll-smooth"
      >
        {moveHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">No moves yet</p>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-card">
              <tr className="text-sm text-muted-foreground">
                <th className="w-12 text-left p-2">#</th>
                <th className="text-left p-2">White</th>
                <th className="text-left p-2">Black</th>
              </tr>
            </thead>
            <tbody>
              {turns.map((turn) => (
                <tr key={turn.number} className="hover:bg-muted/50 text-sm">
                  <td className="font-mono p-2 text-muted-foreground">
                    {turn.number}.
                  </td>
                  <td className="font-medium p-2">
                    {getMoveNotation(turn.white)}
                  </td>
                  <td className="font-medium p-2">
                    {turn.black ? getMoveNotation(turn.black) : "..."}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
