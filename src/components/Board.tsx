import React, { useState, useEffect } from "react";
import Square from "./Square";
import MoveHistory from "./MoveHistory";
import "../styles/Board.css";
import { Position, Piece, Move, GameState, MoveWithSnapshot, BoardSnapshot, PromotionType } from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";
import { isValidMove } from "../logic/ChessRulesEngine";
import SaveGameDialog from './SaveGameDialog';
import LoadGameDialog from './LoadGameDialog';

interface SavedGame {
  name: string;
  date: string;
  state: {
    board: (Piece | null)[][];
    turn: "white" | "black";
    castlingRights: {
      white: { kingSide: boolean; queenSide: boolean };
      black: { kingSide: boolean; queenSide: boolean };
    };
    isCheck: boolean;
    lastMove: Move | null;
    moveHistory: MoveWithSnapshot[];
  };
}

const createGameState = (board: (Piece | null)[][], turn: "white" | "black" = "white"): GameState => ({
  board,
  turn,
  lastMove: null,
  castlingRights: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  },
  isCheck: false,
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
  const [moveHistory, setMoveHistory] = useState<MoveWithSnapshot[]>([]);

  // Undo/redo stacks
  const [undoStack, setUndoStack] = useState<MoveWithSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<MoveWithSnapshot[]>([]);

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

  // Add these state variables at the top with other state declarations
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);

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

  const createBoardSnapshot = (): BoardSnapshot => ({
    board: board.map(row => [...row]),
    turn,
    castlingRights: {
      white: { ...castlingRights.white },
      black: { ...castlingRights.black }
    },
    isCheck,
    lastMove
  });

  const getMoveDescription = (from: Position, to: Position): string => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return `${files[from.col]}${ranks[from.row]} → ${files[to.col]}${ranks[to.row]}`;
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
        const currentSnapshot = createBoardSnapshot();
        
        // Execute the move.
        const move: Move = { from: selectedPosition, to: position };
        const newBoard = board.map((row) => row.slice());
        newBoard[position.row][position.col] = board[selectedPosition.row][selectedPosition.col];
        newBoard[selectedPosition.row][selectedPosition.col] = null;
        setBoard(newBoard);

        // Create move with snapshot
        const moveWithSnapshot: MoveWithSnapshot = {
          move,
          description: getMoveDescription(selectedPosition, position),
          snapshot: currentSnapshot
        };
        
        // Update move history and switch turn.
        setMoveHistory([...moveHistory, moveWithSnapshot]);
        setTurn(turn === "white" ? "black" : "white");
        setSelectedPosition(null);
        setAllowedMoves([]);
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
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory[moveHistory.length - 1];
    const previousSnapshot = lastMove.snapshot;
    
    setRedoStack([...redoStack, lastMove]);
    setMoveHistory(moveHistory.slice(0, -1));
    
    // Restore the previous state
    setBoard(previousSnapshot.board);
    setTurn(previousSnapshot.turn);
    setCastlingRights(previousSnapshot.castlingRights);
    setIsCheck(previousSnapshot.isCheck);
    setSelectedPosition(null);
    setAllowedMoves([]);
  };

  // Redo: Restore the state from the redo stack.
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    
    const nextMove = redoStack[redoStack.length - 1];
    
    // Make the move
    const newBoard = board.map(row => [...row]);
    newBoard[nextMove.move.to.row][nextMove.move.to.col] = 
      newBoard[nextMove.move.from.row][nextMove.move.from.col];
    newBoard[nextMove.move.from.row][nextMove.move.from.col] = null;
    
    // Handle promotion if present
    if (nextMove.move.promotion) {
      newBoard[nextMove.move.to.row][nextMove.move.to.col] = {
        type: nextMove.move.promotion,
        color: turn
      };
    }
    
    setMoveHistory([...moveHistory, nextMove]);
    setRedoStack(redoStack.slice(0, -1));
    
    // Apply the new state
    setBoard(newBoard);
    setTurn(turn === "white" ? "black" : "white");
    setLastMove(nextMove.move);
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
        castlingRights,
        isCheck,
        lastMove,
        moveHistory
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
        // Load the game state
        const gameState = savedGame.state;
        setMoveHistory(gameState.moveHistory);
        setBoard(gameState.board);
        setTurn(gameState.turn);
        setCastlingRights(gameState.castlingRights);
        setIsCheck(gameState.isCheck);
        setLastMove(gameState.lastMove);
        
        // Initialize undo stack with the initial state from the first move's snapshot
        if (gameState.moveHistory.length > 0) {
          setUndoStack([gameState.moveHistory[0]]);
          setRedoStack([]);
        }
        
        setSelectedPosition(null);
        setAllowedMoves([]);
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

  const handlePromotion = (newType: string) => {
    if (!selectedPosition || !promotionSquare) return;

    const promotionMove: Move = {
      from: selectedPosition,
      to: promotionSquare,
      promotion: newType as PromotionType
    };

    const newBoard = board.map((row) => row.slice());
    newBoard[promotionSquare.row][promotionSquare.col] = {
      type: newType as PromotionType,
      color: turn
    };
    newBoard[selectedPosition.row][selectedPosition.col] = null;

    // Create move with snapshot
    const currentSnapshot = createBoardSnapshot();
    const moveWithSnapshot: MoveWithSnapshot = {
      move: promotionMove,
      description: getMoveDescription(selectedPosition, promotionSquare),
      snapshot: currentSnapshot
    };

    setBoard(newBoard);
    setTurn(turn === "white" ? "black" : "white");
    setMoveHistory([...moveHistory, moveWithSnapshot]);
    setSelectedPosition(null);
    setPromotionSquare(null);
    setShowPromotionDialog(false);
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
