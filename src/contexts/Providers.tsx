import { ThemeProvider } from "@/contexts/ThemeContext";
import { ApplicationShellProvider } from "@/contexts/ApplicationShellContext";
import { ChessProvider } from "@/contexts/ChessContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ApplicationShellProvider>
        <ChessProvider>{children}</ChessProvider>
      </ApplicationShellProvider>
    </ThemeProvider>
  );
}
