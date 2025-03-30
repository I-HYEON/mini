import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

export const HomeLayout: React.FC = () => {
  return (
    <div className="flex flex-col space-y-8">
      <Outlet />
      <Footer />
    </div>
  );
};
