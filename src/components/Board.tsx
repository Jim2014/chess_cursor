// src/components/Board.tsx
import React, { useState } from "react";
import Square from "./Square";
import MoveHistory from "./MoveHistory"; // Make sure to import it!
import "../styles/Board.css";
import { Position, Piece, Move } from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";
import { isValidMove } from "../logic/ChessRulesEngine";

const Board: React.FC = () => {
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoardSetup());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  const handleSquareClick = (position: Position) => {
    const clickedPiece = board[position.row][position.col];

    if (!selectedPosition) {
      // Select piece if it belongs to the current turn.
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedPosition(position);
      }
      return;
    } else {
      // Deselect if the same square is clicked.
      if (selectedPosition.row === position.row && selectedPosition.col === position.col) {
        setSelectedPosition(null);
        return;
      }
      const move: Move = { from: selectedPosition, to: position };
      if (isValidMove(board, move)) {
        // Make a deep copy of the board and perform the move.
        const newBoard = board.map((row) => row.slice());
        newBoard[position.row][position.col] = board[selectedPosition.row][selectedPosition.col];
        newBoard[selectedPosition.row][selectedPosition.col] = null;
        setBoard(newBoard);
        // Update the move history.
        setMoveHistory([...moveHistory, move]);
        // Switch the turn.
        setTurn(turn === "white" ? "black" : "white");
      }
      setSelectedPosition(null);
    }
  };

  const resetGame = () => {
    setBoard(initialBoardSetup());
    setTurn("white");
    setSelectedPosition(null);
    setMoveHistory([]);
    localStorage.removeItem("chessGameState");
  };

  const saveGame = () => {
    const gameState = { board, turn, moveHistory };
    localStorage.setItem("chessGameState", JSON.stringify(gameState));
  };

  const loadGame = () => {
    const savedState = localStorage.getItem("chessGameState");
    if (savedState) {
      const { board, turn, moveHistory } = JSON.parse(savedState);
      setBoard(board);
      setTurn(turn);
      setMoveHistory(moveHistory);
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
      <div className="controls">
        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
        <button className="save-button" onClick={saveGame}>
          Save Game
        </button>
        <button className="load-button" onClick={loadGame}>
          Load Game
        </button>
      </div>
      {/* Render the MoveHistory component and pass the moveHistory array */}
      <MoveHistory moves={moveHistory} />
    </div>
  );
};

export default Board;
