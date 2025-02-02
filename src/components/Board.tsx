import React, { useState, useEffect } from "react";
import Square from "./Square";
import MoveHistory from "./MoveHistory";
import "../styles/Board.css";
import { Position, Piece, Move, GameState } from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";
import { isValidMove } from "../logic/ChessRulesEngine";
import SaveGameDialog from './SaveGameDialog';
import LoadGameDialog from './LoadGameDialog';

interface SavedGame {
  name: string;
  date: string;
  state: GameState;
}

const createGameState = (board: (Piece | null)[][], turn: "white" | "black" = "white"): GameState => ({
  board,
  lastMove: null,
  castlingRights: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  },
  isCheck: false,
  turn,
  moveHistory: []
});

const getValidMoves = (board: (Piece | null)[][], position: { row: number; col: number }): { row: number; col: number }[] => {
  const moves: { row: number; col: number }[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const move: Move = { from: position, to: { row, col } };
      const gameState = createGameState(board);
      if (isValidMove(gameState, move)) {
        moves.push({ row, col });
      }
    }
  }
  
  return moves;
};

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

  // Add these state variables
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [castlingRights, setCastlingRights] = useState({
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  });
  const [isCheck, setIsCheck] = useState(false);

  // New state variables
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);

  // Load saved games list on component mount
  useEffect(() => {
    const saves = localStorage.getItem('chessGameSaves');
    if (saves) {
      setSavedGames(JSON.parse(saves));
    }
  }, []);

  // Compute allowed moves for the selected piece.
  const computeAllowedMoves = (position: Position): Position[] => {
    const moves: Position[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const move: Move = { from: position, to: { row, col } };
        const gameState = createGameState(board, turn);
        if (isValidMove(gameState, move)) {
          moves.push({ row, col });
        }
      }
    }
    return moves;
  };

  // Save current game state to the undo stack and clear the redo stack.
  const pushCurrentStateToUndoStack = () => {
    const currentState: GameState = {
      board,
      turn,
      moveHistory,
      lastMove,
      castlingRights,
      isCheck
    };
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
    const currentState: GameState = {
      board,
      turn,
      moveHistory,
      lastMove,
      castlingRights,
      isCheck
    };
    const lastState = undoStack[undoStack.length - 1];
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, currentState]);

    // Restore the previous state
    setBoard(lastState.board);
    setTurn(lastState.turn);
    setMoveHistory(lastState.moveHistory);
    setLastMove(lastState.lastMove);
    setCastlingRights(lastState.castlingRights);
    setIsCheck(lastState.isCheck);
    setSelectedPosition(null);
    setAllowedMoves([]);
  };

  // Redo: Restore the state from the redo stack.
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const currentState: GameState = {
      board,
      turn,
      moveHistory,
      lastMove,
      castlingRights,
      isCheck
    };
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, currentState]);

    // Restore the next state
    setBoard(nextState.board);
    setTurn(nextState.turn);
    setMoveHistory(nextState.moveHistory);
    setLastMove(nextState.lastMove);
    setCastlingRights(nextState.castlingRights);
    setIsCheck(nextState.isCheck);
    setSelectedPosition(null);
    setAllowedMoves([]);
  };

  const resetGame = () => {
    setBoard(initialBoardSetup());
    setTurn("white");
    setSelectedPosition(null);
    setAllowedMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setCastlingRights({
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true }
    });
    setIsCheck(false);
    setUndoStack([]);
    setRedoStack([]);
  };

  const handleSaveGame = (name: string) => {
    const gameState: SavedGame = {
      name,
      date: new Date().toLocaleString(),
      state: {
        board,
        turn,
        moveHistory,
        lastMove,
        castlingRights,
        isCheck
      }
    };
    
    const updatedSaves = savedGames.filter(save => save.name !== name);
    const newSaves = [...updatedSaves, gameState];
    localStorage.setItem('chessGameSaves', JSON.stringify(newSaves));
    setSavedGames(newSaves);
    setShowSaveDialog(false);
  };

  const handleLoadGame = (name: string) => {
    const savedGame = savedGames.find(save => save.name === name);
    if (savedGame) {
      try {
        const gameState = savedGame.state;
        setUndoStack([]);
        setRedoStack([]);
        setBoard(gameState.board);
        setTurn(gameState.turn);
        setMoveHistory(gameState.moveHistory);
        setLastMove(gameState.lastMove);
        setCastlingRights(gameState.castlingRights);
        setIsCheck(gameState.isCheck);
        setSelectedPosition(null);
        setAllowedMoves([]);
        
        setTimeout(() => {
          setBoard(prev => [...prev]);
        }, 0);
        setShowLoadDialog(false);
      } catch (error) {
        console.error('Error loading game state:', error);
        alert('Failed to load saved game');
      }
    }
  };

  const handleDeleteSave = (name: string) => {
    const newSaves = savedGames.filter(save => save.name !== name);
    localStorage.setItem('chessGameSaves', JSON.stringify(newSaves));
    setSavedGames(newSaves);
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

    // Calculate the rank (number) for the row.
    // Standard chess boards label the top row as 8, bottom as 1.
    const rank = 8 - row;


    boardRows.push(
      <div key={row} className="board-row">
        <div className="row-label">{rank}</div>
        {rowSquares}
      </div>
    );
  }

  return (
    <div>
      <div className="game-container">
        <div className="board-container">
          <div className="board-grid">
            {boardRows}
            <div className="column-labels">
              <div className="column-label-empty"></div>
              {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((letter) => (
                <div key={letter} className="column-label">{letter}</div>
              ))}
            </div>
          </div>
          <div className="turn-indicator">Turn: {turn}</div>
          <div className="controls">
            <button className="reset-button" onClick={resetGame}>
              Reset Game
            </button>
            <button className="save-button" onClick={() => setShowSaveDialog(true)}>
              Save Game
            </button>
            <button className="load-button" onClick={() => setShowLoadDialog(true)}>
              Load Game
            </button>
            <button className="undo-button" onClick={handleUndo}>
              Undo
            </button>
            <button className="redo-button" onClick={handleRedo}>
              Redo
            </button>
          </div>
        </div>
        <div className="side-panel">
          <MoveHistory moves={moveHistory} />
        </div>
      </div>
      {showSaveDialog && (
        <SaveGameDialog
          onSave={handleSaveGame}
          onCancel={() => setShowSaveDialog(false)}
        />
      )}
      {showLoadDialog && (
        <LoadGameDialog
          saves={savedGames}
          onLoad={handleLoadGame}
          onDelete={handleDeleteSave}
          onCancel={() => setShowLoadDialog(false)}
        />
      )}
    </div>
  );
};

export default Board;
