import { Piece, Move } from "./types";

/**
 * Checks whether the given position is inside the board boundaries.
 */
const isInBounds = (position: { row: number; col: number }): boolean => {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
};

/**
 * Validates a move on the board using piece-specific logic.
 */
export const isValidMove = (board: (Piece | null)[][], move: Move): boolean => {
  const { from, to } = move;
  
  // Ensure both positions are within bounds.
  if (!isInBounds(from) || !isInBounds(to)) return false;
  
  // Ensure there is a piece at the source.
  const piece = board[from.row][from.col];
  if (!piece) return false;
  
  // Prevent null moves.
  if (from.row === to.row && from.col === to.col) return false;
  
  // Prevent capturing a piece of the same color.
  const destPiece = board[to.row][to.col];
  if (destPiece && destPiece.color === piece.color) return false;
  
  // Validate movement according to piece type.
  switch (piece.type) {
    case "pawn":
      return isValidPawnMove(board, move, piece);
    case "rook":
      return isValidRookMove(board, move);
    case "knight":
      return isValidKnightMove(move);
    case "bishop":
      return isValidBishopMove(board, move);
    case "queen":
      return isValidQueenMove(board, move);
    case "king":
      return isValidKingMove(move);
    default:
      return false;
  }
};

/**
 * Returns true if the path from 'from' to 'to' is clear (no pieces in between).
 * Assumes that the movement is along a straight line (horizontal, vertical, or diagonal).
 */
const isPathClear = (
  board: (Piece | null)[][],
  from: { row: number; col: number },
  to: { row: number; col: number }
): boolean => {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  const rowStep = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
  const colStep = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

  let currentRow = from.row + rowStep;
  let currentCol = from.col + colStep;

  while (currentRow !== to.row || currentCol !== to.col) {
    if (board[currentRow][currentCol] !== null) return false;
    currentRow += rowStep;
    currentCol += colStep;
  }
  return true;
};

/**
 * Validates pawn moves.
 * For simplicity, this function:
 * - Allows one-step forward moves if the destination is empty.
 * - Allows two-step forward moves from the starting rank if both squares are empty.
 * - Allows one-step diagonal captures if an enemy piece occupies the target square.
 *
 * (Castling, en passant, and promotion are not handled here.)
 */
const isValidPawnMove = (board: (Piece | null)[][], move: Move, piece: Piece): boolean => {
  const direction = piece.color === "white" ? -1 : 1;
  const startRow = piece.color === "white" ? 6 : 1;
  const rowDiff = move.to.row - move.from.row;
  const colDiff = move.to.col - move.from.col;

  // Moving straight forward.
  if (colDiff === 0) {
    // One step forward.
    if (rowDiff === direction && board[move.to.row][move.to.col] === null) {
      return true;
    }
    // Two steps forward from the starting position.
    if (
      move.from.row === startRow &&
      rowDiff === 2 * direction &&
      board[move.to.row][move.to.col] === null &&
      board[move.from.row + direction][move.from.col] === null
    ) {
      return true;
    }
  }
  // Diagonal capture.
  else if (Math.abs(colDiff) === 1 && rowDiff === direction) {
    if (board[move.to.row][move.to.col] && board[move.to.row][move.to.col]?.color !== piece.color) {
      return true;
    }
  }
  return false;
};

/**
 * Validates rook moves.
 * Rooks move in a straight line horizontally or vertically and cannot jump over pieces.
 */
const isValidRookMove = (board: (Piece | null)[][], move: Move): boolean => {
  if (move.from.row !== move.to.row && move.from.col !== move.to.col) {
    return false;
  }
  return isPathClear(board, move.from, move.to);
};

/**
 * Validates knight moves.
 * Knights move in an "L" shape: two squares in one direction and then one square perpendicular.
 */
const isValidKnightMove = (move: Move): boolean => {
  const rowDiff = Math.abs(move.to.row - move.from.row);
  const colDiff = Math.abs(move.to.col - move.from.col);
  return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

/**
 * Validates bishop moves.
 * Bishops move diagonally and cannot jump over pieces.
 */
const isValidBishopMove = (board: (Piece | null)[][], move: Move): boolean => {
  if (Math.abs(move.to.row - move.from.row) !== Math.abs(move.to.col - move.from.col)) {
    return false;
  }
  return isPathClear(board, move.from, move.to);
};

/**
 * Validates queen moves.
 * Queens combine the movement of rooks and bishops.
 */
const isValidQueenMove = (board: (Piece | null)[][], move: Move): boolean => {
  return isValidRookMove(board, move) || isValidBishopMove(board, move);
};

/**
 * Validates king moves.
 * Kings move one square in any direction.
 * (Castling is not handled in this function.)
 */
const isValidKingMove = (move: Move): boolean => {
  const rowDiff = Math.abs(move.to.row - move.from.row);
  const colDiff = Math.abs(move.to.col - move.from.col);
  return rowDiff <= 1 && colDiff <= 1;
};

export { isInBounds };
