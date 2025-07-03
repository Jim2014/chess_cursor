import { GameState, Piece, BoardType, Coordinate, ChessSquare } from '../logic/types';

export const createEmptyGameState = (): GameState => {
  const emptyBoard: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  return {
    board: emptyBoard,
    lastMove: null,
    castlingRights: {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true }
    },
    isCheck: false,
    turn: 'white',
    moveHistory: []
  };
};

export const addPieceToBoard = (
  gameState: GameState,
  piece: Piece,
  position: { row: number; col: number }
): GameState => {
  const newBoard = gameState.board.map((row: ChessSquare[]) => [...row]);
  newBoard[position.row][position.col] = piece;
  return {
    ...gameState,
    board: newBoard
  };
};
