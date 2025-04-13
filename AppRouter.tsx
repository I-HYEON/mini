import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RunAwayGamePage } from "@/pages/RunAwayGamePage";
import { GameLayout } from "@/layouts/GameLayout";
import HomePage from "@/pages/HomePage";
import { HomeLayout } from "@/layouts/HomeLayout";
import GoHigh from "@/components/GoHighGame/GoHigh";
import FlyToTheSky from "@/components/FlyToTheSkyGame/FlyToTheSky";

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<HomeLayout/>}>
          <Route path="/games" element={<HomePage />} />
        </Route>

        <Route element={<GameLayout />}>
          <Route path="/games/run-away" element={<RunAwayGamePage />} />
          <Route path="/games/go-high" element={<GoHigh/>}/>
          <Route path="/games/fly-to-the-sky" element={<FlyToTheSky/>}/>
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRouter;
