import React, { useState, useEffect, useMemo } from "react";
import Square from "./Square";
import MoveHistory from "./MoveHistory";
import "../styles/Board.css";
import { 
  BoardType, 
  Piece, 
  Move, 
  GameState, 
  MoveWithSnapshot, 
  BoardSnapshot, 
  PromotionType,
  Color,
  Coordinate
} from "../logic/types";
import { initialBoardSetup } from "../logic/GameManager";
import { isValidMove, isKingInCheck, isCheckmate } from "../logic/ChessRulesEngine";
import SaveGameDialog from './SaveGameDialog';
import LoadGameDialog from './LoadGameDialog';
import PromotionDialog from './PromotionDialog';
import { ComputerPlayer } from "../ai/ComputerPlayer";
import GameSettingsDialog, { GameSettings } from './GameSettingsDialog';
import { MediumComputerPlayer } from '../ai/MediumComputerPlayer';
import GameResultDialog, { GameResult } from './GameResultDialog';
import { isStalemate, hasInsufficientMaterial, isThreefoldRepetition, isFiftyMoveRule } from '../logic/ChessRulesEngine';
import PlayerInfo from './PlayerInfo';
import { HardComputerPlayer, type HardComputerSettings } from '../ai/HardComputerPlayer';
import HardSettingsDialog from './HardComputerSettings';

interface SavedGame {
  name: string;
  date: string;
  state: {
    board: (Piece | null)[][];
    turn: Color;
    castlingRights: {
      white: { kingSide: boolean; queenSide: boolean };
      black: { kingSide: boolean; queenSide: boolean };
    };
    isCheck: boolean;
    lastMove: Move | null;
    moveHistory: MoveWithSnapshot[];
  };
}

const createGameState = (board: BoardType, turn: Color = "white", lastMove: Move | null): GameState => ({
  board,
  turn,
  lastMove,
  castlingRights: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
  },
  isCheck: false,
  moveHistory: []
});

const Board: React.FC = () => {
  // Current game state
  const [board, setBoard] = useState<BoardType>(initialBoardSetup());
  const [selectedPosition, setSelectedPosition] = useState<Coordinate | null>(null);
  const [allowedMoves, setAllowedMoves] = useState<Coordinate[]>([]);
  const [turn, setTurn] = useState<Color>("white");
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
  const [isInCheckmate, setIsInCheckmate] = useState(false);
  const [computerLastMove, setComputerLastMove] = useState<Move | null>(null);

  // New state variables
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);

  // Add these state variables at the top with other state declarations
  const [promotionSquare, setPromotionSquare] = useState<Coordinate | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [pendingMove, setPendingMove] = useState<{ from: Coordinate; to: Coordinate } | null>(null);

  // Add these new state variables
  const [showSettings, setShowSettings] = useState(false);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    gameMode: 'human',
    computerColor: 'black',
    whitePlayerLevel: 'easy',
    blackPlayerLevel: 'easy'
  });
  
  // Add a counter for computer vs computer moves
  const [computerMoveCount, setComputerMoveCount] = useState(0);
  const [playMode, setPlayMode] = useState<'auto' | 'manual'>('auto');
  const [canMakeNextMove, setCanMakeNextMove] = useState(false);

  const whiteComputerPlayer = useMemo(() => {
    switch (gameSettings.whitePlayerLevel) {
      case 'hard':
        return new HardComputerPlayer(gameSettings.whiteHardSettings);
      case 'medium':
        return new MediumComputerPlayer();
      default:
        return new ComputerPlayer();
    }
  }, [gameSettings.whitePlayerLevel, gameSettings.whiteHardSettings]);
  
  const blackComputerPlayer = useMemo(() => {
    switch (gameSettings.blackPlayerLevel) {
      case 'hard':
        return new HardComputerPlayer(gameSettings.blackHardSettings);
      case 'medium':
        return new MediumComputerPlayer();
      default:
        return new ComputerPlayer();
    }
  }, [gameSettings.blackPlayerLevel, gameSettings.blackHardSettings]);

  const [gameResult, setGameResult] = useState<GameResult | null>(null);

  // Load saved games list on component mount
  useEffect(() => {
    const saves = localStorage.getItem('chessGameSaves');
    if (saves) {
      setSavedGames(JSON.parse(saves));
    }
  }, []);

  // Update computer move effect
  useEffect(() => {
    if ((gameSettings.gameMode === 'computer-vs-computer' ||
        (gameSettings.gameMode === 'computer' && turn === gameSettings.computerColor)) &&
        !promotionSquare && 
        !gameResult) {
      // In manual mode, only make move when canMakeNextMove is true
      if (gameSettings.gameMode === 'computer-vs-computer' && 
          playMode === 'manual' && !canMakeNextMove) {
        return;
      }

      // Check for move limit in computer vs computer mode
      if (gameSettings.gameMode === 'computer-vs-computer' && computerMoveCount >= 200) {
        setGameResult({
          type: 'insufficient-material',
          moveLimit: true
        });
        return;
      }

      const timer = setTimeout(() => {
        const gameState = createGameState(board, turn, lastMove);
        gameState.castlingRights = castlingRights;
        const move = turn === 'white' 
          ? whiteComputerPlayer.getBestMove(gameState)
          : blackComputerPlayer.getBestMove(gameState);
        if (move) {
          setComputerLastMove(move);
          makeMove(move);
          // Increment move counter only in computer vs computer mode
          if (gameSettings.gameMode === 'computer-vs-computer') {
            setComputerMoveCount(prev => prev + 1);
            setCanMakeNextMove(false); // Reset the flag after making a move in manual mode
          }
        }
      }, gameSettings.gameMode === 'computer-vs-computer' ? 800 : 500);
      
      return () => clearTimeout(timer);
    }
  }, [gameSettings.gameMode, turn, gameSettings.computerColor, board, lastMove, gameResult, 
      computerMoveCount, playMode, canMakeNextMove]);

  // Compute allowed moves for the selected piece.
  const computeAllowedMoves = (position: Coordinate): Coordinate[] => {
    const piece = board[position.row][position.col];
    if (!piece) return [];
    if (piece.color !== turn) return [];

    const moves: Coordinate[] = [];
    const gameState = createGameState(board, turn, lastMove);
    gameState.castlingRights = castlingRights;

    // For king, only show normal one-square moves and valid castling moves
    if (piece.type === 'king') {
      // Normal king moves (one square in any direction)
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],          [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];
      
      for (const [dRow, dCol] of directions) {
        const newRow = position.row + dRow;
        const newCol = position.col + dCol;
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
          const move: Move = { from: position, to: { row: newRow, col: newCol } };
          if (isValidMove(gameState, move)) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }

      // Castling moves
      const row = piece.color === 'white' ? 7 : 0;
      // Kingside castling
      if (castlingRights[turn].kingSide) {
        const kingsideCastling: Move = { 
          from: position, 
          to: { row, col: position.col + 2 } 
        };
        console.log('Checking kingside castling:', {
          from: kingsideCastling.from,
          to: kingsideCastling.to,
          isValid: isValidMove(gameState, kingsideCastling)
        });
        if (isValidMove(gameState, kingsideCastling)) {
          moves.push({ row, col: position.col + 2 });
        }
      }
      // Queenside castling
      if (castlingRights[turn].queenSide) {
        const queensideCastling: Move = { 
          from: position, 
          to: { row, col: position.col - 2 } 
        };
        console.log('Checking queenside castling:', {
          from: queensideCastling.from,
          to: queensideCastling.to,
          isValid: isValidMove(gameState, queensideCastling)
        });
        if (isValidMove(gameState, queensideCastling)) {
          moves.push({ row, col: position.col - 2 });
        }
      }
    } else if (piece.type === 'pawn') {
      const direction = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;
      
      // Forward moves
      const oneStep = { row: position.row + direction, col: position.col };
      if (oneStep.row >= 0 && oneStep.row < 8) {
        const move = { from: position, to: oneStep };
        if (isValidMove(gameState, move)) {
          moves.push(oneStep);
        }
        
        // Two steps from starting position
        if (position.row === startRow) {
          const twoStep = { row: position.row + 2 * direction, col: position.col };
          const move = { from: position, to: twoStep };
          if (isValidMove(gameState, move)) {
            moves.push(twoStep);
          }
        }
      }
      
      // Diagonal captures (including en passant)
      const captureMoves = [
        { row: position.row + direction, col: position.col - 1 },
        { row: position.row + direction, col: position.col + 1 }
      ];
      
      for (const captureMove of captureMoves) {
        if (captureMove.row >= 0 && captureMove.row < 8 && 
            captureMove.col >= 0 && captureMove.col < 8) {
          const move = { from: position, to: captureMove };
          if (isValidMove(gameState, move)) {
            moves.push(captureMove);
          }
        }
      }
    } else {
      // For all other pieces, keep the existing logic
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const move: Move = { from: position, to: { row, col } };
          gameState.turn = turn;
          if (isValidMove(gameState, move)) {
            moves.push({ row, col });
          }
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

  const getMoveDescription = (from: Coordinate, to: Coordinate): string => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return `${files[from.col]}${ranks[from.row]} → ${files[to.col]}${ranks[to.row]}`;
  };

  const makeMove = (move: Move) => {
    const currentSnapshot = createBoardSnapshot();
    const newBoard = board.map((row) => row.slice());
    
    // Handle castling
    const piece = board[move.from.row][move.from.col];
    if (piece?.type === 'king') {
      const isCastling = Math.abs(move.to.col - move.from.col) === 2;
      if (isCastling) {
        // Move rook
        const isKingside = move.to.col > move.from.col;
        const rookFromCol = isKingside ? 7 : 0;
        const rookToCol = isKingside ? move.to.col - 1 : move.to.col + 1;
        const rookRow = move.from.row;  // Same row as king
        console.log('Castling details:', {
          isKingside,
          rookFromCol,
          rookToCol,
          rookRow,
          rookPiece: newBoard[rookRow][rookFromCol]?.type,
          kingPiece: piece.type
        });
        newBoard[rookRow][rookToCol] = newBoard[rookRow][rookFromCol];
        newBoard[rookRow][rookFromCol] = null;
      }
    }
    
    // Handle en passant capture
    if (piece?.type === 'pawn' && lastMove) {
      const isEnPassantCapture = 
        Math.abs(move.to.col - move.from.col) === 1 && // Diagonal move
        !board[move.to.row][move.to.col] && // No piece at target square
        board[lastMove.to.row][lastMove.to.col]?.type === 'pawn' && // Last moved piece was a pawn
        Math.abs(lastMove.from.row - lastMove.to.row) === 2 && // Last move was a two-square pawn move
        lastMove.to.row === move.from.row && // Capturing pawn is on the same rank as the target pawn
        lastMove.to.col === move.to.col; // The capture is happening on the column where the pawn landed
      
      if (isEnPassantCapture) {
        // Remove the captured pawn
        newBoard[lastMove.to.row][lastMove.to.col] = null;
      }
    }
    
    console.log('Board state before move:', {
      fromPiece: board[move.from.row][move.from.col]?.type,
      toPiece: board[move.to.row][move.to.col]?.type
    });
    
    // Apply promotion if specified
    if (piece?.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
      newBoard[move.from.row][move.from.col] = null;
      newBoard[move.to.row][move.to.col] = {
        ...piece,
        type: move.promotion || 'queen' // Fallback to queen
      };
    } else {
      // Regular move handling
      newBoard[move.to.row][move.to.col] = piece;
      newBoard[move.from.row][move.from.col] = null;
    }

    console.log('Board state after move:', {
      fromPiece: newBoard[move.from.row][move.from.col]?.type,
      toPiece: newBoard[move.to.row][move.to.col]?.type
    });

    // Update castling rights
    if (piece?.type === 'king') {
      const newRights = { ...castlingRights };
      newRights[turn].kingSide = false;
      newRights[turn].queenSide = false;
      setCastlingRights(newRights);
    } else if (piece?.type === 'rook') {
      const newRights = { ...castlingRights };
      if (move.from.col === 0) newRights[turn].queenSide = false;
      if (move.from.col === 7) newRights[turn].kingSide = false;
      setCastlingRights(newRights);
    }

    // Check for check and checkmate
    const newGameState = createGameState(newBoard, turn === "white" ? "black" : "white", move);
    const isInCheck = isKingInCheck(newBoard, turn === "white" ? "black" : "white");
    const isInCheckmate = isInCheck && isCheckmate(newGameState, turn === "white" ? "black" : "white");
    setIsCheck(isInCheck);
    setIsInCheckmate(isInCheckmate);

    // Check for game end conditions
    if (isInCheckmate) {
      setGameResult({
        type: 'checkmate',
        winner: turn
      });
      setPlayMode('manual'); // Force pause when result dialog shows
    } else if (isStalemate(newGameState)) {
      setGameResult({
        type: 'stalemate'
      });
      setPlayMode('manual'); // Force pause when result dialog shows
    } else if (hasInsufficientMaterial(newBoard)) {
      setGameResult({
        type: 'insufficient-material'
      });
      setPlayMode('manual'); // Force pause when result dialog shows
    } else if (isThreefoldRepetition(moveHistory)) {
      setGameResult({
        type: 'threefold-repetition'
      });
      setPlayMode('manual'); // Force pause when result dialog shows
    } else if (isFiftyMoveRule(moveHistory)) {
      setGameResult({
        type: 'fifty-move'
      });
      setPlayMode('manual'); // Force pause when result dialog shows
    }

    // Create move description with check/checkmate status
    let moveDesc = getMoveDescription(move.from, move.to);
    if (isInCheckmate) {
      moveDesc += " #"; // Chess notation for checkmate
    } else if (isInCheck) {
      moveDesc += " +"; // Chess notation for check
    }

    // Create move with snapshot
    const moveWithSnapshot: MoveWithSnapshot = {
      move,
      description: moveDesc,
      snapshot: currentSnapshot
    };
    
    // Update game state
    setBoard(newBoard);
    setTurn(turn === "white" ? "black" : "white");
    setMoveHistory([...moveHistory, moveWithSnapshot]);
    setLastMove(move);
  };

  const handleSquareClick = (position: Coordinate) => {
    if (gameSettings.gameMode === 'computer-vs-computer' || 
        (gameSettings.gameMode === 'computer' && turn === gameSettings.computerColor)) {
      return;
    }
    if (selectedPosition) {
      const move: Move = {
        from: selectedPosition,
        to: position
      };

      const piece = board[selectedPosition.row][selectedPosition.col];
      // Create game state with current castling rights
      const gameState = createGameState(board, turn, lastMove);
      gameState.castlingRights = castlingRights;

      // Check if the move is valid first
      if (!isValidMove(gameState, move)) {
        setSelectedPosition(null);
        setAllowedMoves([]);
        return;
      }

      // Check for pawn promotion
      if (piece?.type === 'pawn') {
        const isPromotion = (piece.color === 'white' && position.row === 0) || 
                           (piece.color === 'black' && position.row === 7);
        if (isPromotion) {
          setPromotionSquare(position);
          setPendingMove({ from: selectedPosition, to: position });
          setSelectedPosition(null);
          setAllowedMoves([]);
          return;
        }
      }

      const isCastling = piece?.type === 'king' && 
        Math.abs(position.col - selectedPosition.col) === 2;

      console.log('Attempting move:', {
        piece: piece?.type,
        from: selectedPosition,
        to: position,
        isCastling,
        turn
      });

      console.log('Current castling rights:', castlingRights);
      console.log('Is valid move?', isValidMove(gameState, move));

      if (isValidMove(gameState, move)) {
        console.log('Making move...');
        handleMove(move);
        // If this was a castling move, update castling rights immediately
        if (isCastling) {
          console.log('Executing castling move');
          const newRights = { ...castlingRights };
          newRights[turn].kingSide = false;
          newRights[turn].queenSide = false;
          setCastlingRights(newRights);
        }
      }
      setSelectedPosition(null);
      setAllowedMoves([]);
    } else {
      // No piece is currently selected.
      const clickedPiece = board[position.row][position.col];
      console.log('Selecting piece:', {
        piece: clickedPiece?.type,
        color: clickedPiece?.color,
        position,
        turn
      });
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedPosition(position);
        const allowed = computeAllowedMoves(position);
        console.log('Allowed moves:', allowed);
        setAllowedMoves(allowed);
      }
    }
  };

  const handlePromotion = (pieceType: "queen" | "rook" | "bishop" | "knight") => {
    if (!pendingMove || !promotionSquare) return;

    const move: Move = {
      ...pendingMove,
      promotion: pieceType
    };

    const newBoard = board.map((row) => row.slice());
    newBoard[promotionSquare.row][promotionSquare.col] = {
      type: pieceType as PromotionType,
      color: turn
    };
    newBoard[pendingMove.from.row][pendingMove.from.col] = null;

    setBoard(newBoard);
    setTurn(turn === "white" ? "black" : "white");
    setMoveHistory([...moveHistory, {
      move,
      description: getMoveDescription(pendingMove.from, pendingMove.to),
      snapshot: createBoardSnapshot()
    }]);
    setSelectedPosition(null);
    setPromotionSquare(null);
    setPendingMove(null);
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
    setLastMove(previousSnapshot.lastMove);
    setSelectedPosition(null);
    setAllowedMoves([]);
    setComputerLastMove(null); // Reset computer last move
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
    setComputerLastMove(nextMove.move); // Set computer last move for highlighting
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
    setIsInCheckmate(false);
    setUndoStack([]);
    setRedoStack([]);
    setComputerLastMove(null);
    setGameResult(null);
    setComputerMoveCount(0);
    setPlayMode('auto');
    setCanMakeNextMove(false);
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
        setIsInCheckmate(gameState.isCheck && isCheckmate(createGameState(gameState.board, gameState.turn, gameState.lastMove), gameState.turn));
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

  const generateFen = (): string => {
    let fen = '';

    // 1. Piece placement
    for (let i = 0; i < 8; i++) {
        let empty = 0;
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                if (empty > 0) {
                    fen += empty;
                    empty = 0;
                }
                let pieceChar;
                switch (piece.type) {
                    case 'pawn': pieceChar = 'p'; break;
                    case 'knight': pieceChar = 'n'; break;
                    case 'bishop': pieceChar = 'b'; break;
                    case 'rook': pieceChar = 'r'; break;
                    case 'queen': pieceChar = 'q'; break;
                    case 'king': pieceChar = 'k'; break;
                    default: pieceChar = '';
                }
                if (piece.color === 'white') {
                    fen += pieceChar.toUpperCase();
                } else {
                    fen += pieceChar;
                }
            } else {
                empty++;
            }
        }
        if (empty > 0) {
            fen += empty;
        }
        if (i < 7) {
            fen += '/';
        }
    }

    // 2. Active color
    fen += turn === 'white' ? ' w' : ' b';

    // 3. Castling availability
    let castling = '';
    if (castlingRights.white.kingSide) castling += 'K';
    if (castlingRights.white.queenSide) castling += 'Q';
    if (castlingRights.black.kingSide) castling += 'k';
    if (castlingRights.black.queenSide) castling += 'q';
    fen += ' ' + (castling || '-');

    // 4. En passant target square
    let enPassant = '-';
    if (lastMove) {
        const movedPiece = board[lastMove.to.row][lastMove.to.col];
        if (movedPiece?.type === 'pawn' && Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
            const file = 'abcdefgh'[lastMove.from.col];
            const rank = '87654321'[(lastMove.from.row + lastMove.to.row) / 2];
            enPassant = file + rank;
        }
    }
    fen += ' ' + enPassant;

    // 5. Halfmove clock
    let halfMoveClock = 0;
    if (moveHistory.length > 0) {
        for (let i = moveHistory.length - 1; i >= 0; i--) {
            const historicMove = moveHistory[i];
            const movedPieceOnSnapshot = historicMove.snapshot.board[historicMove.move.from.row][historicMove.move.from.col];
            const capturedPieceOnSnapshot = historicMove.snapshot.board[historicMove.move.to.row][historicMove.move.to.col];

            if (movedPieceOnSnapshot?.type === 'pawn' || capturedPieceOnSnapshot) {
                break;
            }
            halfMoveClock++;
        }
    }
    fen += ' ' + halfMoveClock;

    // 6. Fullmove number
    fen += ' ' + (Math.floor(moveHistory.length / 2) + 1);

    return fen;
  };

  const handleCopyFen = () => {
      const fen = generateFen();
      navigator.clipboard.writeText(fen).then(() => {
          alert(`FEN copied to clipboard!\n\n${fen}`);
      }, (err) => {
          console.error('Could not copy FEN: ', err);
          alert('Failed to copy FEN.');
      });
  };

  const renderSquare = (row: number, col: number) => {
    const position: Coordinate = { row, col };
    const piece = board[row][col];
    const isSelected =
      selectedPosition &&
      selectedPosition.row === row &&
      selectedPosition.col === col;
    const isAllowed = allowedMoves.some(
      (pos) => pos.row === row && pos.col === col
    );
    const isKingInCheckSquare = isCheck && piece?.type === 'king' && piece.color === turn;
    const isComputerMoveSquare = !!computerLastMove && 
      ((computerLastMove.from.row === row && computerLastMove.from.col === col) ||
       (computerLastMove.to.row === row && computerLastMove.to.col === col));

    return (
      <Square
        key={`${row}-${col}`}
        position={position}
        piece={piece}
        onClick={handleSquareClick}
        isSelected={!!isSelected}
        allowed={isAllowed}
        isCheck={isKingInCheckSquare}
        isComputerMove={isComputerMoveSquare}
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

  // Update game controls
  const renderGameControls = () => (
    <div className="controls">
      <button onClick={() => {
        resetGame();
        // Set to manual mode if it's computer vs computer
        if (gameSettings.gameMode === 'computer-vs-computer') {
          setPlayMode('manual');
        }
        setShowSettings(true);
      }}>
        New Game
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
      <button className="fen-button" onClick={handleCopyFen}>
        FEN
      </button>
    </div>
  );

  // Add play control buttons render function
  const renderPlayControls = () => {
    if (gameSettings.gameMode !== 'computer-vs-computer') return null;
    
    return (
      <div className="play-controls">
        <button 
          onClick={() => setPlayMode(playMode === 'auto' ? 'manual' : 'auto')}
          className={playMode === 'auto' ? 'active' : ''}
        >
          {playMode === 'auto' ? 'Pause' : 'Auto'}
        </button>
        {playMode === 'manual' && (
          <button 
            onClick={() => setCanMakeNextMove(true)}
            disabled={canMakeNextMove}
          >
            Next Move
          </button>
        )}
      </div>
    );
  };

  const handleMove = (move: Move) => {
    const piece = board[move.from.row][move.from.col];
    if (!piece) return;

    // Check if it's a pawn promotion move
    if (piece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
      // For computer players, automatically promote to queen
      const isComputerMove = 
        (gameSettings.gameMode === 'computer' && gameSettings.computerColor === turn) ||
        (gameSettings.gameMode === 'computer-vs-computer');
      
      if (isComputerMove) {
        move.promotion = 'queen';
        makeMove(move);
        return;
      }
      
      // For human players, show promotion dialog
      setPromotionSquare(move.to);
      setPendingMove(move);
      return;
    }

    makeMove(move);
  };

  return (
    <div>
      <div className="game-container">
        <div className="main-content">
          <div className="players-container">
            <PlayerInfo
              color="white"
              gameMode={gameSettings.gameMode}
              isCurrentTurn={turn === 'white'}
              computerLevel={
                gameSettings.gameMode === 'computer-vs-computer' ? gameSettings.whitePlayerLevel :
                gameSettings.gameMode === 'computer' && gameSettings.computerColor === 'white' ? 
                gameSettings.whitePlayerLevel : undefined
              }
              hardSettings={
                gameSettings.whitePlayerLevel === 'hard' ? gameSettings.whiteHardSettings : undefined
              }
            />
            <PlayerInfo
              color="black"
              gameMode={gameSettings.gameMode}
              isCurrentTurn={turn === 'black'}
              computerLevel={
                gameSettings.gameMode === 'computer-vs-computer' ? gameSettings.blackPlayerLevel :
                gameSettings.gameMode === 'computer' && gameSettings.computerColor === 'black' ? 
                gameSettings.blackPlayerLevel : undefined
              }
              hardSettings={
                gameSettings.blackPlayerLevel === 'hard' ? gameSettings.blackHardSettings : undefined
              }
            />
          </div>
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
            {renderPlayControls()}
            {renderGameControls()}
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
      {promotionSquare && (
        <PromotionDialog
          color={turn}
          onSelect={handlePromotion}
        />
      )}
      {showSettings && (
        <GameSettingsDialog
          onStart={(settings) => {
            setGameSettings(settings);
            setShowSettings(false);
          }}
          onCancel={() => setShowSettings(false)}
        />
      )}
      {gameResult && (
        <GameResultDialog
          result={gameResult}
          onNewGame={() => {
            resetGame();
            // Set to manual mode if it's computer vs computer
            if (gameSettings.gameMode === 'computer-vs-computer') {
              setPlayMode('manual');
            }
            setShowSettings(true);
          }}
          onClose={() => setGameResult(null)}
        />
      )}
    </div>
  );
};

export default Board;
