import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="flex-none h-16 border-b bg-background backdrop-blur-sm z-50">
      <div className="flex justify-between h-full items-center px-4 gap-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="text-foreground p-4" />
          <Link to="/" className="flex items-center justify-between mr-4">
            <img src="/images/logo.png" className="mr-3 h-8" alt="App Logo" />
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Chess</h1>
          </Link>
        </div>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
