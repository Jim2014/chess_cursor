import React, { useState } from "react";
import Square from "./Square";
import MoveHistory from "./MoveHistory";
import "../styles/Board.css";
import { Position, Piece, Move } from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";
import { isValidMove } from "../logic/ChessRulesEngine";

// Define a type for storing the current game state.
interface GameState {
  board: (Piece | null)[][];
  turn: "white" | "black";
  moveHistory: Move[];
}

const Board: React.FC = () => {
  // Current game state
  const [board, setBoard] = useState<(Piece | null)[][]>(initialBoardSetup());
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [allowedMoves, setAllowedMoves] = useState<Position[]>([]);
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);

  // Undo/redo stacks
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  const [redoStack, setRedoStack] = useState<GameState[]>([]);

  // Compute allowed moves for the selected piece.
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

  // Save current game state to the undo stack and clear the redo stack.
  const pushCurrentStateToUndoStack = () => {
    const currentState: GameState = { board, turn, moveHistory };
    setUndoStack([...undoStack, currentState]);
    setRedoStack([]); // Clear redo history on a new move.
  };

  const handleSquareClick = (position: Position) => {
    const clickedPiece = board[position.row][position.col];

    if (!selectedPosition) {
      // No piece is currently selected.
      // Select the piece if it exists and belongs to the current turn.
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedPosition(position);
        const allowed = computeAllowedMoves(position);
        setAllowedMoves(allowed);
      }
      return;
    } else {
      // A piece is already selected.
      // Check if the clicked square is among the allowed moves.
      const isAllowed = allowedMoves.some(
        (pos) => pos.row === position.row && pos.col === position.col
      );
      if (isAllowed) {
        // Before performing the move, push the current state to the undo stack.
        pushCurrentStateToUndoStack();

        // Execute the move.
        const move: Move = { from: selectedPosition, to: position };
        const newBoard = board.map((row) => row.slice());
        newBoard[position.row][position.col] = board[selectedPosition.row][selectedPosition.col];
        newBoard[selectedPosition.row][selectedPosition.col] = null;
        setBoard(newBoard);

        // Update move history and switch turn.
        setMoveHistory([...moveHistory, move]);
        setTurn(turn === "white" ? "black" : "white");
        setSelectedPosition(null);
        setAllowedMoves([]);
        return;
      } else {
        // If clicking on another piece of the same color, update the selection.
        if (clickedPiece && clickedPiece.color === turn) {
          setSelectedPosition(position);
          const allowed = computeAllowedMoves(position);
          setAllowedMoves(allowed);
        } else {
          // Otherwise, clear selection.
          setSelectedPosition(null);
          setAllowedMoves([]);
        }
      }
    }
  };

  // Undo: Restore the previous game state.
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    // Save the current state to the redo stack.
    const currentState: GameState = { board, turn, moveHistory };
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, currentState]);

    // Restore the previous state.
    setBoard(lastState.board);
    setTurn(lastState.turn);
    setMoveHistory(lastState.moveHistory);
    setSelectedPosition(null);
    setAllowedMoves([]);
  };

  // Redo: Restore the state from the redo stack.
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const currentState: GameState = { board, turn, moveHistory };
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, currentState]);

    // Restore the next state.
    setBoard(nextState.board);
    setTurn(nextState.turn);
    setMoveHistory(nextState.moveHistory);
    setSelectedPosition(null);
    setAllowedMoves([]);
  };

  const resetGame = () => {
    setBoard(initialBoardSetup());
    setTurn("white");
    setSelectedPosition(null);
    setAllowedMoves([]);
    setMoveHistory([]);
    setUndoStack([]);
    setRedoStack([]);
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
        <button className="undo-button" onClick={handleUndo}>
          Undo
        </button>
        <button className="redo-button" onClick={handleRedo}>
          Redo
        </button>
      </div>
      <MoveHistory moves={moveHistory} />
    </div>
  );
};

export default Board;
