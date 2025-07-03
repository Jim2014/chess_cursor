import { Piece, Move, GameState, MoveWithSnapshot, Coordinate, Color, CastlingRights } from "./types";

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
  const { board, turn } = gameState;
  const { from, to } = move;
  
  // Ensure both positions are within bounds.
  if (!isInBounds(from) || !isInBounds(to)) return false;
  
  // Ensure there is a piece at the source.
  const piece = board[from.row][from.col];
  if (!piece || piece.color !== turn) return false;
  
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
    
    // Automatic pawn promotion
    if (piece.type === "pawn" && (move.to.row === 0 || move.to.row === 7)) {
      simulatedBoard[move.to.row][move.to.col] = { ...piece, type: "queen" };
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

  // Check if the move is within bounds and in the correct direction
  if (move.to.row < 0 || move.to.row > 7 || move.to.col < 0 || move.to.col > 7) {
    return false;
  }
  if (Math.sign(rowDiff) !== direction) {
    return false;
  }

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
  // Diagonal capture or en passant
  else if (Math.abs(colDiff) === 1 && Math.abs(rowDiff) === 1) {
    // Regular capture
    if (board[move.to.row][move.to.col] && board[move.to.row][move.to.col]?.color !== piece.color) {
      return true;
    }
    
    // En passant
    if (lastMove && 
        board[lastMove.to.row][lastMove.to.col]?.type === 'pawn' &&
        Math.abs(lastMove.from.row - lastMove.to.row) === 2 && // Last move was a two-square pawn move
        lastMove.to.row === move.from.row && // Capturing pawn is on the same rank as the target pawn
        lastMove.to.col === move.to.col && // The capture is happening on the column where the pawn landed
        board[lastMove.to.row][lastMove.to.col]?.color !== piece.color) { // Target pawn is of opposite color
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

export const isStalemate = (gameState: GameState): boolean => {
  const { board, turn } = gameState;
  
  // If the king is in check, it's not stalemate
  if (isKingInCheck(board, turn)) return false;
  
  // Check if there are any legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === turn) {
        for (let toRow = 0; toRow < 8; toRow++) {
          for (let toCol = 0; toCol < 8; toCol++) {
            const move: Move = {
              from: { row, col },
              to: { row: toRow, col: toCol }
            };
            if (isValidMove(gameState, move)) {
              return false;
            }
          }
        }
      }
    }
  }
  return true;
};

export const hasInsufficientMaterial = (board: (Piece | null)[][]): boolean => {
  const pieces = {
    white: { bishops: 0, knights: 0, others: 0 },
    black: { bishops: 0, knights: 0, others: 0 }
  };
  
  // Count pieces
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type !== 'king') {
        if (piece.type === 'bishop') {
          pieces[piece.color].bishops++;
        } else if (piece.type === 'knight') {
          pieces[piece.color].knights++;
        } else {
          pieces[piece.color].others++;
        }
      }
    }
  }
  
  // Check insufficient material conditions
  const whitePieces = pieces.white;
  const blackPieces = pieces.black;
  
  // King vs King
  if (whitePieces.bishops === 0 && whitePieces.knights === 0 && whitePieces.others === 0 &&
      blackPieces.bishops === 0 && blackPieces.knights === 0 && blackPieces.others === 0) {
    return true;
  }
  
  // King and Bishop vs King
  if ((whitePieces.bishops === 1 && whitePieces.knights === 0 && whitePieces.others === 0 &&
       blackPieces.bishops === 0 && blackPieces.knights === 0 && blackPieces.others === 0) ||
      (blackPieces.bishops === 1 && blackPieces.knights === 0 && blackPieces.others === 0 &&
       whitePieces.bishops === 0 && whitePieces.knights === 0 && whitePieces.others === 0)) {
    return true;
  }
  
  // King and Knight vs King
  if ((whitePieces.bishops === 0 && whitePieces.knights === 1 && whitePieces.others === 0 &&
       blackPieces.bishops === 0 && blackPieces.knights === 0 && blackPieces.others === 0) ||
      (blackPieces.bishops === 0 && blackPieces.knights === 1 && blackPieces.others === 0 &&
       whitePieces.bishops === 0 && whitePieces.knights === 0 && whitePieces.others === 0)) {
    return true;
  }
  
  return false;
};

export const isThreefoldRepetition = (moveHistory: MoveWithSnapshot[]): boolean => {
  // Create a map to store board positions and their count
  const positions = new Map<string, number>();
  
  // Go through each position in the move history
  for (const move of moveHistory) {
    const positionKey = getBoardPositionKey(move.snapshot.board);
    positions.set(positionKey, (positions.get(positionKey) || 0) + 1);
    if ((positions.get(positionKey) || 0) >= 3) {
      return true;
    }
  }
  
  return false;
};

// Helper function to create a unique key for a board position
const getBoardPositionKey = (board: (Piece | null)[][]): string => {
  return board.map(row => 
    row.map(piece => 
      piece ? `${piece.type}${piece.color}` : '-'
    ).join('')
  ).join('|');
};

export const isFiftyMoveRule = (moveHistory: MoveWithSnapshot[]): boolean => {
  let movesSincePawnMoveOrCapture = 0;
  
  for (let i = moveHistory.length - 1; i >= 0; i--) {
    const move = moveHistory[i];
    const piece = move.snapshot.board[move.move.from.row][move.move.from.col];
    const isCapture = move.snapshot.board[move.move.to.row][move.move.to.col] !== null;
    
    if (piece?.type === 'pawn' || isCapture) {
      break;
    }
    
    movesSincePawnMoveOrCapture++;
    if (movesSincePawnMoveOrCapture >= 100) { // 50 moves by each player = 100 half-moves
      return true;
    }
  }
  
  return false;
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

export const toAlgebraic = (coord: Coordinate): string => {
  return `${files[coord.col]}${ranks[coord.row]}`;
};

export const toSan = (
  initialBoard: (Piece | null)[][],
  move: Move,
  turn: Color,
  lastMove: Move | null,
  castlingRights: CastlingRights
): string => {
  const { from, to, promotion } = move;
  const piece = initialBoard[from.row][from.col];
  if (!piece) return ''; // Should not happen

  const targetPiece = initialBoard[to.row][to.col];
  const isCapture = targetPiece !== null || (piece.type === 'pawn' && from.col !== to.col && initialBoard[to.row][to.col] === null);

  // Simulate the move to check for check/checkmate
  const simulatedBoard = simulateMove(initialBoard, move);
  const simulatedGameState: GameState = {
    board: simulatedBoard,
    turn: turn === 'white' ? 'black' : 'white', // Next turn
    castlingRights: castlingRights,
    isCheck: false,
    lastMove: move,
    moveHistory: []
  };
  const causesCheck = isKingInCheck(simulatedBoard, turn === 'white' ? 'black' : 'white');
  const causesCheckmate = causesCheck && isCheckmate(simulatedGameState, turn === 'white' ? 'black' : 'white');

  // Castling
  if (piece.type === 'king' && Math.abs(from.col - to.col) === 2) {
    return to.col === 6 ? 'O-O' : 'O-O-O';
  }

  let san = '';

  // Piece abbreviation (empty for pawns)
  if (piece.type !== 'pawn') {
    san += piece.type === 'knight' ? 'N' :
           piece.type === 'bishop' ? 'B' :
           piece.type === 'rook' ? 'R' :
           piece.type === 'queen' ? 'Q' :
           piece.type === 'king' ? 'K' : '';
  }

  // Disambiguation (for non-pawn pieces)
  if (piece.type !== 'pawn') {
    const possibleOriginSquares: Coordinate[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const otherPiece = initialBoard[r][c];
        if (otherPiece && otherPiece.type === piece.type && otherPiece.color === piece.color &&
            !(r === from.row && c === from.col)) {
          const tempMove: Move = { from: { row: r, col: c }, to };
          const tempGameState: GameState = {
            board: initialBoard,
            turn,
            castlingRights,
            isCheck: false,
            lastMove,
            moveHistory: []
          };
          if (isValidMove(tempGameState, tempMove)) {
            possibleOriginSquares.push({ row: r, col: c });
          }
        }
      }
    }

    if (possibleOriginSquares.length > 0) {
      let needsFileDisambiguation = false;
      let needsRankDisambiguation = false;

      for (const origin of possibleOriginSquares) {
        if (origin.col === from.col) {
          needsFileDisambiguation = true;
        }
        if (origin.row === from.row) {
          needsRankDisambiguation = true;
        }
      }

      if (needsFileDisambiguation && needsRankDisambiguation) {
        san += toAlgebraic(from);
      } else if (needsFileDisambiguation) {
        san += files[from.col];
      } else if (needsRankDisambiguation) {
        san += ranks[from.row];
      }
    }
  }

  // Capture indicator
  if (isCapture) {
    if (piece.type === 'pawn' && from.col !== to.col) {
      san += files[from.col];
    }
    san += 'x';
  }

  // Destination square
  san += toAlgebraic(to);

  // Promotion
  if (promotion) {
    san += `=${promotion.toUpperCase()}`;
  }

  // Check/Checkmate indicator
  if (causesCheckmate) {
    san += '#';
  } else if (causesCheck) {
    san += '+';
  }

  return san;
};

export { isInBounds, isKingInCheck, isCheckmate };
