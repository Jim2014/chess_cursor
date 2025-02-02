import { GameState, Move, Piece } from "../logic/types";
import { isValidMove } from "../logic/ChessRulesEngine";

// Basic piece values for simple evaluation
const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0  // We don't consider king's value in basic evaluation
};

export class ComputerPlayer {
  // Get all valid moves for the current position
  private getAllValidMoves(gameState: GameState): Move[] {
    const validMoves: Move[] = [];
    const { board, turn } = gameState;

    // Go through all squares
    for (let fromRow = 0; fromRow < 8; fromRow++) {
      for (let fromCol = 0; fromCol < 8; fromCol++) {
        const piece = board[fromRow][fromCol];
        // Check if piece belongs to computer
        if (piece && piece.color === turn) {
          // Check all possible destination squares
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

  // Evaluate a capture move
  private evaluateMove(move: Move, gameState: GameState): number {
    const { board } = gameState;
    const targetPiece = board[move.to.row][move.to.col];
    
    // If it's a capture, return the value of the captured piece
    if (targetPiece) {
      return PIECE_VALUES[targetPiece.type];
    }
    
    return 0;  // Non-capture move
  }

  // Choose the best move
  public getBestMove(gameState: GameState): Move | null {
    const validMoves = this.getAllValidMoves(gameState);
    
    // If no valid moves are available, return null
    if (validMoves.length === 0) {
      return null;
    }
    
    // Sort moves by value (captures first)
    validMoves.sort((a, b) => 
      this.evaluateMove(b, gameState) - this.evaluateMove(a, gameState)
    );

    // If there are captures available, randomly select one of the best captures
    const bestValue = this.evaluateMove(validMoves[0], gameState);
    const bestMoves = validMoves.filter(move => 
      this.evaluateMove(move, gameState) === bestValue
    );

    // Return a random move from the best available moves
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }
} 