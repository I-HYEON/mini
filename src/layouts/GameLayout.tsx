import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

export const GameLayout: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="h-screen flex flex-col">
      <div onClick={() => navigate("/games")} className="cursor-pointer mt-4 text-2xl font-bold text-left mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-zinc-500 to-cyan-500">
        MINI FUN ARCADE
      </div>
      <Outlet />
      <Footer />
    </div>
  );
};
