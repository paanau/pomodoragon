'use client';

import React from "react";
import { GameStateProvider } from "../GameState";
import LeftInfoArea from "./LeftInfoArea";
import CenterGameArea from "./CenterGameArea";
import RightDetailArea from "./RightDetailArea";
import "../styles/game.css";

const GameLayout: React.FC = () => {
  return (
    <div className="game-layout">
      <div className="w-1/4">
        <LeftInfoArea />
      </div>
      <div className="w-2/4">
        <CenterGameArea />
      </div>
      <div className="w-1/4">
        <RightDetailArea />
      </div>
    </div>
  );
};

const GameClient: React.FC = () => {
  return (
    <GameStateProvider>
      <GameLayout />
    </GameStateProvider>
  );
};

export default GameClient; 