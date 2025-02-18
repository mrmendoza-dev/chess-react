import { Route, Routes } from "react-router-dom";
import { Chess } from "@/components/Chess";

export const MainContent = () => {
  return (
    <main className="relative flex-1 overflow-y-auto bg-background">
      <div className="">
        <Routes>
          <Route path="/" element={<Chess />} />
        </Routes>
      </div>
    </main>
  );
};
