import React, { useState } from "react";
import Square from "./Square";
import "../styles/Board.css";
import { Position, Piece } from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";
import { isValidMove } from "../logic/ChessRulesEngine";

const Board: React.FC = () => {
  // Manage board state, selected square, and turn
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoardSetup());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");

  const handleSquareClick = (position: Position) => {
    const clickedPiece = board[position.row][position.col];

    // If no piece is selected, try to select one.
    if (!selectedPosition) {
      // Only allow selection if a piece exists and it belongs to the current turn.
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedPosition(position);
      }
      return;
    } else {
      // If clicking the same square, deselect.
      if (selectedPosition.row === position.row && selectedPosition.col === position.col) {
        setSelectedPosition(null);
        return;
      }
      // Attempt to move the piece from selectedPosition to the clicked square.
      const move = { from: selectedPosition, to: position };
      if (isValidMove(board, move)) {
        // Copy the board and move the piece.
        const newBoard = board.map((row) => row.slice());
        newBoard[position.row][position.col] = board[selectedPosition.row][selectedPosition.col];
        newBoard[selectedPosition.row][selectedPosition.col] = null;
        setBoard(newBoard);
        // Switch the turn.
        setTurn(turn === "white" ? "black" : "white");
      }
      // Clear selection whether the move was valid or not.
      setSelectedPosition(null);
    }
  };

  const renderSquare = (row: number, col: number) => {
    const position: Position = { row, col };
    const piece = board[row][col];
    const isSelected =
      selectedPosition &&
      selectedPosition.row === row &&
      selectedPosition.col === col;
    return (
      <Square
        key={`${row}-${col}`}
        position={position}
        piece={piece}
        onClick={handleSquareClick}
        isSelected={!!isSelected}
      />
    );
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

  return (
    <div>
      <div className="board">{boardRows}</div>
      <div className="turn-indicator">Turn: {turn}</div>
    </div>
  );
};

export default Board;
