import { GameState, Move, Piece, Position, PieceType } from "../logic/types";
import { isValidMove, isKingInCheck } from "../logic/ChessRulesEngine";

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Piece position values for improved evaluation
const POSITION_VALUES: Record<PieceType, number[][]> = {
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
    [-5,   0,  5,  5,  5,  5,  0, -5],
    [0,    0,  5,  5,  5,  5,  0, -5],
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

export class MediumComputerPlayer {
  private getAllValidMoves(gameState: GameState): Move[] {
    const validMoves: Move[] = [];
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
                validMoves.push(move);
              }
            }
          }
        }
      }
    }
    return validMoves;
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

  private isUnderAttack(position: Position, board: (Piece | null)[][], attackingColor: string): boolean {
    // Check if a position is under attack by any piece of the given color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece && piece.color === attackingColor) {
          const move: Move = {
            from: { row, col },
            to: position
          };
          const tempGameState: GameState = {
            board,
            turn: attackingColor,
            lastMove: null,
            castlingRights: {
              white: { kingSide: true, queenSide: true },
              black: { kingSide: true, queenSide: true }
            },
            isCheck: false,
            moveHistory: []
          };
          if (isValidMove(tempGameState, move)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private isCapturingMove(move: Move, board: (Piece | null)[][]): boolean {
    return board[move.to.row][move.to.col] !== null;
  }

  private evaluatePosition(gameState: GameState): number {
    const { board } = gameState;
    let score = 0;

    // Only evaluate material and immediate captures
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          const pieceValue = PIECE_VALUES[piece.type];
          if (piece.color === gameState.turn) {
            score += pieceValue;
            // Check if this piece can be captured
            if (this.isUnderAttack({ row, col }, board, piece.color === 'white' ? 'black' : 'white')) {
              score -= pieceValue * 0.5;
            }
          } else {
            score -= pieceValue;
          }
        }
      }
    }

    // Simple check evaluation
    if (isKingInCheck(board, gameState.turn === 'white' ? 'black' : 'white')) {
      score += 100;
    }
    if (isKingInCheck(board, gameState.turn)) {
      score -= 150;
    }

    return score;
  }

  public getBestMove(gameState: GameState): Move | null {
    const moves = this.getAllValidMoves(gameState);
    if (moves.length === 0) return null;

    // First, look for capturing moves
    const capturingMoves = moves.filter(move => this.isCapturingMove(move, gameState.board));
    
    if (capturingMoves.length > 0) {
      // Evaluate capturing moves more carefully
      const evaluatedCaptures = capturingMoves.map(move => {
        const simState = this.makeMove(gameState, move);
        const score = this.evaluatePosition(simState);
        return { move, score };
      });

      // Sort by score and get the best capture that doesn't lead to immediate loss
      evaluatedCaptures.sort((a, b) => b.score - a.score);
      for (const { move } of evaluatedCaptures) {
        const simState = this.makeMove(gameState, move);
        if (!this.isUnderAttack(move.to, simState.board, simState.turn)) {
          return move;
        }
      }
    }

    // If no good captures, make a safe move
    const safeMoves = moves.filter(move => {
      const simState = this.makeMove(gameState, move);
      return !this.isUnderAttack(move.to, simState.board, simState.turn);
    });

    if (safeMoves.length > 0) {
      return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    // If no safe moves, just make any legal move
    return moves[Math.floor(Math.random() * moves.length)];
  }
} 