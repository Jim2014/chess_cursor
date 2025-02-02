export type Color = "white" | "black";

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";

export type PromotionType = "queen" | "rook" | "bishop" | "knight";

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
  promotion?: PromotionType;
}

export interface BoardSnapshot {
  board: (Piece | null)[][];
  turn: "white" | "black";
  castlingRights: {
    white: { kingSide: boolean; queenSide: boolean };
    black: { kingSide: boolean; queenSide: boolean };
  };
  isCheck: boolean;
  lastMove: Move | null;
}

export interface MoveWithSnapshot {
  move: Move;
  description: string;  // e.g., "a2 → a4"
  snapshot: BoardSnapshot;
}

export interface GameState {
  board: (Piece | null)[][];
  turn: "white" | "black";
  castlingRights: {
    white: { kingSide: boolean; queenSide: boolean };
    black: { kingSide: boolean; queenSide: boolean };
  };
  isCheck: boolean;
  lastMove: Move | null;
  moveHistory: Move[];
}
