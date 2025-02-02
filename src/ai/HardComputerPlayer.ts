import { GameState, Move, Piece, Position } from "../logic/types";
import { isValidMove, isKingInCheck } from "../logic/ChessRulesEngine";

const PIECE_VALUES = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Position tables for piece-square evaluation
const POSITION_VALUES = {
  pawn: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  knight: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  bishop: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  rook: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  queen: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  king: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

export interface HardComputerSettings {
  maxDepth: number;        // Search depth (default: 4)
  moveDelay: number;       // Delay between moves in ms (default: 800)
  useAlphaBeta: boolean;   // Whether to use alpha-beta pruning (default: true)
}

export class HardComputerPlayer {
  private settings: HardComputerSettings;

  constructor(settings?: Partial<HardComputerSettings>) {
    this.settings = {
      maxDepth: settings?.maxDepth ?? 2,
      moveDelay: settings?.moveDelay ?? 800,
      useAlphaBeta: settings?.useAlphaBeta ?? true
    };
  }

  public updateSettings(settings: Partial<HardComputerSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  public getBestMove(gameState: GameState): Move | null {
    const moves = this.getAllValidMoves(gameState);
    if (moves.length === 0) return null;

    let bestMove: Move | null = null;
    let bestScore = gameState.turn === 'white' ? -Infinity : Infinity;

    // Always provide alpha-beta values, but only use them if useAlphaBeta is true
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      const newState = this.makeMove(gameState, move);
      if (this.isUnderAttack(newState, move.to, gameState.turn)) {
        const movingPiece = gameState.board[move.from.row][move.from.col]!;
        const targetPiece = gameState.board[move.to.row][move.to.col];
        if (!targetPiece || PIECE_VALUES[targetPiece.type] <= PIECE_VALUES[movingPiece.type]) {
          continue;
        }
      }

      const score = this.minimax(newState, this.settings.maxDepth - 1, alpha, beta, gameState.turn !== 'white');

      if (gameState.turn === 'white') {
        if (score > bestScore) {
          bestScore = score;
          bestMove = move;
        }
        if (this.settings.useAlphaBeta) {
          alpha = Math.max(alpha, bestScore);
        }
      } else {
        if (score < bestScore) {
          bestScore = score;
          bestMove = move;
        }
        if (this.settings.useAlphaBeta) {
          beta = Math.min(beta, bestScore);
        }
      }
      if (this.settings.useAlphaBeta && alpha >= beta) {
        break;
      }
    }

    return bestMove;
  }

  private minimax(gameState: GameState, depth: number, alpha: number, beta: number, maximizingPlayer: boolean): number {
    if (depth === 0) {
      return this.evaluatePosition(gameState);
    }

    const moves = this.getAllValidMoves(gameState);
    if (moves.length === 0) {
      // If no moves available, check if it's checkmate or stalemate
      if (isKingInCheck(gameState.board, gameState.turn)) {
        return maximizingPlayer ? -20000 : 20000; // Checkmate
      }
      return 0; // Stalemate
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (const move of moves) {
        const newState = this.makeMove(gameState, move);
        const evaluation = this.minimax(newState, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evaluation);
        if (maxEval >= beta) break; // Beta cutoff
        alpha = Math.max(alpha, evaluation);
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of moves) {
        const newState = this.makeMove(gameState, move);
        const evaluation = this.minimax(newState, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evaluation);
        if (minEval <= alpha) break; // Alpha cutoff
        beta = Math.min(beta, evaluation);
      }
      return minEval;
    }
  }

  private evaluatePosition(gameState: GameState): number {
    let score = 0;
    const { board } = gameState;

    // Material and position score
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          // Base piece value
          const pieceValue = PIECE_VALUES[piece.type];
          // Position value based on piece type and color
          const positionValue = piece.color === 'white'
            ? POSITION_VALUES[piece.type][row][col]
            : POSITION_VALUES[piece.type][7 - row][col];

          const multiplier = piece.color === 'white' ? 1 : -1;
          score += (pieceValue + positionValue) * multiplier;
        }
      }
    }

    // Safety evaluation - check if pieces are under attack
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          // Check if this piece can be captured
          if (this.isUnderAttack(gameState, { row, col }, piece.color)) {
            const pieceValue = PIECE_VALUES[piece.type];
            const multiplier = piece.color === 'white' ? -1 : 1;
            // Penalize having pieces under attack
            score += (pieceValue * 0.5) * multiplier;
          }
        }
      }
    }

    return score;
  }

  private getPieceMobilityScore(gameState: GameState, position: { row: number; col: number }): number {
    const piece = gameState.board[position.row][position.col];
    if (!piece) return 0;

    let mobilityScore = 0;
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const move: Move = { from: position, to: { row, col } };
        if (isValidMove(gameState, move)) {
          mobilityScore += 5;
          // Bonus for controlling center squares
          if ((row === 3 || row === 4) && (col === 3 || col === 4)) {
            mobilityScore += 3;
          }
        }
      }
    }
    return mobilityScore;
  }

  private getPositionalBonuses(gameState: GameState, piece: Piece, row: number, col: number): number {
    let bonus = 0;
    
    // Pawn structure evaluation
    if (piece.type === 'pawn') {
      // Doubled pawns penalty
      const doubledPawns = this.countDoubledPawns(gameState.board, col, piece.color);
      bonus -= doubledPawns * 20;

      // Isolated pawns penalty
      if (this.isIsolatedPawn(gameState.board, col, piece.color)) {
        bonus -= 30;
      }

      // Passed pawn bonus
      if (this.isPassedPawn(gameState.board, row, col, piece.color)) {
        bonus += 50;
      }
    }

    // Knight outpost bonus
    if (piece.type === 'knight' && this.isKnightOutpost(gameState.board, row, col, piece.color)) {
      bonus += 30;
    }

    // Rook on open file bonus
    if (piece.type === 'rook' && this.isOpenFile(gameState.board, col)) {
      bonus += 25;
    }

    return bonus;
  }

  private countDoubledPawns(board: (Piece | null)[][], col: number, color: string): number {
    let count = 0;
    for (let row = 0; row < 8; row++) {
      if (board[row][col]?.type === 'pawn' && board[row][col]?.color === color) {
        count++;
      }
    }
    return count > 1 ? count - 1 : 0;
  }

  private isIsolatedPawn(board: (Piece | null)[][], col: number, color: string): boolean {
    const adjacentCols = [col - 1, col + 1];
    return !adjacentCols.some(adjCol => {
      if (adjCol < 0 || adjCol > 7) return false;
      return board.some(row => row[adjCol]?.type === 'pawn' && row[adjCol]?.color === color);
    });
  }

  private isPassedPawn(board: (Piece | null)[][], row: number, col: number, color: string): boolean {
    const direction = color === 'white' ? -1 : 1;
    const endRow = color === 'white' ? 0 : 7;
    
    for (let r = row + direction; r !== endRow; r += direction) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (c >= 0 && c < 8 && board[r][c]?.type === 'pawn' && board[r][c]?.color !== color) {
          return false;
        }
      }
    }
    return true;
  }

  private isKnightOutpost(board: (Piece | null)[][], row: number, col: number, color: string): boolean {
    const forward = color === 'white' ? 1 : -1;
    return !this.canBeAttackedByPawn(board, row, col, color) &&
           this.isProtectedByPawn(board, row, col, color);
  }

  private isOpenFile(board: (Piece | null)[][], col: number): boolean {
    return !board.some(row => row[col]?.type === 'pawn');
  }

  private canBeAttackedByPawn(board: (Piece | null)[][], row: number, col: number, color: string): boolean {
    const attackRow = color === 'white' ? row + 1 : row - 1;
    const attackCols = [col - 1, col + 1];
    
    return attackCols.some(attackCol => {
      if (attackCol < 0 || attackCol > 7 || attackRow < 0 || attackRow > 7) return false;
      const piece = board[attackRow][attackCol];
      return piece?.type === 'pawn' && piece.color !== color;
    });
  }

  private isProtectedByPawn(board: (Piece | null)[][], row: number, col: number, color: string): boolean {
    const protectRow = color === 'white' ? row + 1 : row - 1;
    const protectCols = [col - 1, col + 1];
    
    return protectCols.some(protectCol => {
      if (protectCol < 0 || protectCol > 7 || protectRow < 0 || protectRow > 7) return false;
      const piece = board[protectRow][protectCol];
      return piece?.type === 'pawn' && piece.color === color;
    });
  }

  private isUnderAttack(gameState: GameState, position: Position, pieceColor: 'white' | 'black'): boolean {
    const opponentColor = pieceColor === 'white' ? 'black' : 'white';
    
    // Create a temporary game state to check opponent's moves
    const tempGameState: GameState = {
      ...gameState,
      turn: opponentColor,
      lastMove: null
    };
    
    // Check all opponent pieces for possible captures
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = gameState.board[row][col];
        if (piece && piece.color === opponentColor) {
          const move: Move = {
            from: { row, col },
            to: position
          };
          if (isValidMove(tempGameState, move)) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  private getAllValidMoves(gameState: GameState): Move[] {
    const moves: Move[] = [];
    const { board, turn } = gameState;

    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = board[fromRow][fromCol];
        if (piece && piece.color === turn) {
          for (let toRow = 0; toRow < 8; toRow++) {
            for (let toCol = 0; toCol < 8; toCol++) {
              const move: Move = {
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol }
              };
              if (isValidMove(gameState, move)) {
                moves.push(move);
              }
            }
          }
        }
      }
    }
    return moves;
  }

  private makeMove(gameState: GameState, move: Move): GameState {
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col];
    newBoard[move.from.row][move.from.col] = null;

    return {
      ...gameState,
      board: newBoard,
      turn: gameState.turn === 'white' ? 'black' : 'white',
      lastMove: move
    };
  }
} 