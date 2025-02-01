import React from "react";
import Board from "./components/Board";
import "./styles/App.css";

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Chess Game - Stage 1</h1>
      <Board />
    </div>
  );
};

export default App;
