import { Piece, Move, GameState } from "./types";

/**
 * Checks whether the given position is inside the board boundaries.
 */
const isInBounds = (position: { row: number; col: number }): boolean => {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
};

/**
 * Validates a move on the board using piece-specific logic.
 */
export const isValidMove = (gameState: GameState, move: Move): boolean => {
  const { board } = gameState;
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
  
  // Validate movement according to piece type
  let isValid = false;
  switch (piece.type) {
    case "pawn":
      isValid = isValidPawnMove(gameState, move, piece);
      break;
    case "rook":
      isValid = isValidRookMove(board, move);
      break;
    case "knight":
      isValid = isValidKnightMove(move);
      break;
    case "bishop":
      isValid = isValidBishopMove(board, move);
      break;
    case "queen":
      isValid = isValidQueenMove(board, move);
      break;
    case "king":
      isValid = isValidKingMove(gameState, move, piece);
      break;
    default:
      return false;
  }

  // If the move is valid, check if it would leave the king in check
  if (isValid) {
    const simulatedBoard = simulateMove(board, move);
    if (isKingInCheck(simulatedBoard, piece.color)) {
      return false;
    }
  }

  return isValid;
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
const isValidPawnMove = (gameState: GameState, move: Move, piece: Piece): boolean => {
  const { board, lastMove } = gameState;
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

  // En passant
  if (lastMove && 
      Math.abs(colDiff) === 1 && 
      rowDiff === direction &&
      lastMove.from.row === (piece.color === "white" ? 1 : 6) &&
      lastMove.to.row === (piece.color === "white" ? 3 : 4) &&
      lastMove.to.col === move.to.col &&
      board[lastMove.to.row][lastMove.to.col]?.type === "pawn") {
    return true;
  }

  // Promotion validation
  const finalRow = piece.color === "white" ? 0 : 7;
  if (move.to.row === finalRow && !move.promotion) {
    return false; // Must specify promotion piece when reaching the last rank
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
const isValidKingMove = (gameState: GameState, move: Move, piece: Piece): boolean => {
  const { board, castlingRights } = gameState;
  const rowDiff = Math.abs(move.to.row - move.from.row);
  const colDiff = Math.abs(move.to.col - move.from.col);

  // Normal king movement
  if (rowDiff <= 1 && colDiff <= 1) {
    return true;
  }

  // Castling
  if (rowDiff === 0 && Math.abs(colDiff) === 2) {
    const rights = castlingRights[piece.color];
    const row = piece.color === "white" ? 7 : 0;

    // King-side castling
    if (move.to.col === 6 && rights.kingSide) {
      if (isPathClear(board, {row, col: 4}, {row, col: 7}) &&
          board[row][7]?.type === "rook" &&
          !isSquareUnderAttack(gameState, {row, col: 4}, piece.color) &&
          !isSquareUnderAttack(gameState, {row, col: 5}, piece.color) &&
          !isSquareUnderAttack(gameState, {row, col: 6}, piece.color)) {
        return true;
      }
    }

    // Queen-side castling
    if (move.to.col === 2 && rights.queenSide) {
      if (isPathClear(board, {row, col: 4}, {row, col: 0}) &&
          board[row][0]?.type === "rook" &&
          !isSquareUnderAttack(gameState, {row, col: 4}, piece.color) &&
          !isSquareUnderAttack(gameState, {row, col: 3}, piece.color) &&
          !isSquareUnderAttack(gameState, {row, col: 2}, piece.color)) {
        return true;
      }
    }
  }

  return false;
};

const isSquareUnderAttack = (
  gameState: GameState,
  square: { row: number; col: number },
  defendingColor: string
): boolean => {
  const { board } = gameState;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color !== defendingColor) {
        const move = { from: { row, col }, to: square };
        if (isValidMove({ ...gameState, isCheck: false }, move)) {
          return true;
        }
      }
    }
  }
  return false;
};

const isKingInCheck = (board: (Piece | null)[][], color: string): boolean => {
  // Find king position
  let kingPos = { row: -1, col: -1 };
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === "king" && piece.color === color) {
        kingPos = { row, col };
        break;
      }
    }
  }

  const tempGameState: GameState = {
    board,
    lastMove: null,
    castlingRights: defaultCastlingRights(),
    isCheck: false,
    turn: color === "white" ? "black" : "white", // Set opposite color as current turn
    moveHistory: []
  };

  return isSquareUnderAttack(tempGameState, kingPos, color);
};

const isCheckmate = (gameState: GameState, color: string): boolean => {
  if (!isKingInCheck(gameState.board, color)) {
    return false;
  }

  // Try all possible moves for all pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece?.color === color) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            const move = { from: { row, col }, to: { row: toRow, col: toCol } };
            if (isValidMove(gameState, move)) {
              return false; // Found at least one legal move
            }
          }
        }
      }
    }
  }
  return true; // No legal moves found
};

const defaultCastlingRights = () => ({
  white: { kingSide: true, queenSide: true },
  black: { kingSide: true, queenSide: true }
});

const simulateMove = (board: (Piece | null)[][], move: Move): (Piece | null)[][] => {
  const newBoard = board.map(row => [...row]);
  newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = null;
  return newBoard;
};

export { isInBounds };
