// src/components/Board.tsx
import React, { useState } from "react";
import Square from "./Square";
import MoveHistory from "./MoveHistory";
import "../styles/Board.css";
import { Position, Piece, Move } from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";
import { isValidMove } from "../logic/ChessRulesEngine";

const Board: React.FC = () => {
  // Board state, selected piece, allowed moves, turn, and move history.
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoardSetup());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [allowedMoves, setAllowedMoves] = useState<Position[]>([]);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  // Compute allowed moves for a selected piece.
  const computeAllowedMoves = (position: Position): Position[] => {
    const moves: Position[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const move: Move = { from: position, to: { row, col } };
        if (isValidMove(board, move)) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  };

  const handleSquareClick = (position: Position) => {
    const clickedPiece = board[position.row][position.col];

    if (!selectedPosition) {
      // No piece is currently selected.
      // If a piece exists at the clicked square and it belongs to the current turn, select it.
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedPosition(position);
        const allowed = computeAllowedMoves(position);
        setAllowedMoves(allowed);
      }
      return;
    } else {
      // If the user clicks on an allowed move square, execute the move.
      const isAllowed = allowedMoves.some(
        (pos) => pos.row === position.row && pos.col === position.col
      );
      if (isAllowed) {
        const move: Move = { from: selectedPosition, to: position };
        // Create a deep copy of the board and perform the move.
        const newBoard = board.map((row) => row.slice());
        newBoard[position.row][position.col] = board[selectedPosition.row][selectedPosition.col];
        newBoard[selectedPosition.row][selectedPosition.col] = null;
        setBoard(newBoard);
        // Record the move and switch the turn.
        setMoveHistory([...moveHistory, move]);
        setTurn(turn === "white" ? "black" : "white");
        setSelectedPosition(null);
        setAllowedMoves([]);
        return;
      } else {
        // If the clicked square is not allowed but contains another piece that belongs to the current turn,
        // update the selection.
        if (clickedPiece && clickedPiece.color === turn) {
          setSelectedPosition(position);
          const allowed = computeAllowedMoves(position);
          setAllowedMoves(allowed);
        } else {
          // Otherwise, clear the selection.
          setSelectedPosition(null);
          setAllowedMoves([]);
        }
      }
    }
  };

  const resetGame = () => {
    setBoard(initialBoardSetup());
    setTurn("white");
    setSelectedPosition(null);
    setAllowedMoves([]);
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
      setAllowedMoves([]);
    }
  };

  const renderSquare = (row: number, col: number) => {
    const position: Position = { row, col };
    const piece = board[row][col];
    const isSelected =
      selectedPosition &&
      selectedPosition.row === row &&
      selectedPosition.col === col;
    const isAllowed = allowedMoves.some(
      (pos) => pos.row === row && pos.col === col
    );
    return (
      <Square
        key={`${row}-${col}`}
        position={position}
        piece={piece}
        onClick={handleSquareClick}
        isSelected={!!isSelected}
        allowed={isAllowed}
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
      <MoveHistory moves={moveHistory} />
    </div>
  );
};

export default Board;
