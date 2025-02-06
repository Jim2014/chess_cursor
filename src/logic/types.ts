// Chess Game Type Definitions

// Basic Types
export type Color = "white" | "black";
export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king";
export type PromotionType = "queen" | "rook" | "bishop" | "knight";

// Grid and Board Types
export type ChessSquare = Piece | null;
export type BoardType = ChessSquare[][];

// Coordinate Types
export type Coordinate = {
  row: number;
  col: number;
};

// Alias for Coordinate to maintain backwards compatibility
export type Position = Coordinate;

// Piece Definition
export interface Piece {
  type: PieceType;
  color: Color;
}

// Move Types
export interface Move {
  from: Coordinate;
  to: Coordinate;
  promotion?: PromotionType;
}

// Castling Rights Type
export type CastlingRights = {
  white: { kingSide: boolean; queenSide: boolean };
  black: { kingSide: boolean; queenSide: boolean };
};

// Game State Interfaces
export interface BoardSnapshot {
  board: BoardType;
  turn: Color;
  castlingRights: CastlingRights;
  isCheck: boolean;
  lastMove: Move | null;
}

export interface MoveWithSnapshot {
  move: Move;
  description: string;
  snapshot: BoardSnapshot;
}

export interface GameState {
  board: BoardType;
  turn: Color;
  castlingRights: CastlingRights;
  isCheck: boolean;
  lastMove: Move | null;
  moveHistory: Move[];
}
