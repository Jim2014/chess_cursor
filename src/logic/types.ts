export type Color = "white" | "black";

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export interface Piece {
  type: PieceType;
  color: Color;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: { row: number; col: number };
  to: { row: number; col: number };
  promotion?: 'queen' | 'rook' | 'bishop' | 'knight';
}

export interface GameState {
  board: (Piece | null)[][];
  lastMove: Move | null;
  castlingRights: {
    white: { kingSide: boolean; queenSide: boolean };
    black: { kingSide: boolean; queenSide: boolean };
  };
  isCheck: boolean;
  turn: "white" | "black";
  moveHistory: Move[];
}
