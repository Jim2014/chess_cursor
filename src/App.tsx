import React from "react";
import Board from "./components/Board";
import "./styles/App.css";

const App: React.FC = () => {
  return (
    <div className="app">
      <h1>Chess Game - Cursor AI</h1>
      <Board />
    </div>

  );
};

export default App;
