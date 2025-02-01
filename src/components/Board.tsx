import React from "react";
import Square from "./Square";
import "../styles/Board.css";
import { Position } from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";

const Board: React.FC = () => {
  const boardSetup = initialBoardSetup();

  const renderSquare = (row: number, col: number) => {
    const position: Position = { row, col };
    const piece = boardSetup[row][col];
    return <Square key={`${row}-${col}`} position={position} piece={piece} />;
  };

  const boardRows = [];
  for (let row = 0; row < 8; row++) {
    const rowSquares = [];
    for (let col = 0; col < 8; col++) {
      rowSquares.push(renderSquare(row, col));
    }
    boardRows.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return <div className="board">{boardRows}</div>;
};

export default Board;
