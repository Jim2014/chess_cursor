import { Piece } from "./types";

/**
 * Returns the initial board setup as an 8x8 array.
 * Each cell is either a Piece object or null.
 */
export const initialBoardSetup = (): (Piece | null)[][] => {
  // Create an empty 8x8 board
  const board: (Piece | null)[][] = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  // Place Pawns
  for (let col = 0; col < 8; col++) {
    board[1][col] = { type: "pawn", color: "black" };
    board[6][col] = { type: "pawn", color: "white" };
  }

  // Place Rooks
  board[0][0] = { type: "rook", color: "black" };
  board[0][7] = { type: "rook", color: "black" };
  board[7][0] = { type: "rook", color: "white" };
  board[7][7] = { type: "rook", color: "white" };

  // Place Knights
  board[0][1] = { type: "knight", color: "black" };
  board[0][6] = { type: "knight", color: "black" };
  board[7][1] = { type: "knight", color: "white" };
  board[7][6] = { type: "knight", color: "white" };

  // Place Bishops
  board[0][2] = { type: "bishop", color: "black" };
  board[0][5] = { type: "bishop", color: "black" };
  board[7][2] = { type: "bishop", color: "white" };
  board[7][5] = { type: "bishop", color: "white" };

  // Place Queens
  board[0][3] = { type: "queen", color: "black" };
  board[7][3] = { type: "queen", color: "white" };

  // Place Kings
  board[0][4] = { type: "king", color: "black" };
  board[7][4] = { type: "king", color: "white" };

  return board;
};
