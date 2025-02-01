import { isValidMove } from './ChessRulesEngine';
import { GameState, Piece } from './types';

describe('ChessRulesEngine', () => {
  let gameState: GameState;

  beforeEach(() => {
    // Setup empty board
    const emptyBoard: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
    gameState = {
      board: emptyBoard,
      lastMove: null,
      castlingRights: {
        white: { kingSide: true, queenSide: true },
        black: { kingSide: true, queenSide: true }
      },
      isCheck: false,
      turn: 'white',
      moveHistory: []
    };
  });

  describe('Pawn Movement', () => {
    beforeEach(() => {
      // Add white pawn at e2 (row 6, col 4)
      gameState.board[6][4] = { type: 'pawn', color: 'white' };
    });

    test('can move one square forward', () => {
      const move = {
        from: { row: 6, col: 4 },
        to: { row: 5, col: 4 }
      };
      expect(isValidMove(gameState, move)).toBe(true);
    });

    test('can move two squares from starting position', () => {
      const move = {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 }
      };
      expect(isValidMove(gameState, move)).toBe(true);
    });

    test('cannot move diagonally without capture', () => {
      const move = {
        from: { row: 6, col: 4 },
        to: { row: 5, col: 5 }
      };
      expect(isValidMove(gameState, move)).toBe(false);
    });

    test('can capture diagonally', () => {
      gameState.board[5][5] = { type: 'pawn', color: 'black' };
      const move = {
        from: { row: 6, col: 4 },
        to: { row: 5, col: 5 }
      };
      expect(isValidMove(gameState, move)).toBe(true);
    });
  });

  describe('Knight Movement', () => {
    beforeEach(() => {
      // Add white knight at b1 (row 7, col 1)
      gameState.board[7][1] = { type: 'knight', color: 'white' };
    });

    test('can move in L-shape', () => {
      const validMoves = [
        { from: { row: 7, col: 1 }, to: { row: 5, col: 2 } },
        { from: { row: 7, col: 1 }, to: { row: 5, col: 0 } }
      ];

      validMoves.forEach(move => {
        expect(isValidMove(gameState, move)).toBe(true);
      });
    });

    test('cannot move straight', () => {
      const move = {
        from: { row: 7, col: 1 },
        to: { row: 6, col: 1 }
      };
      expect(isValidMove(gameState, move)).toBe(false);
    });
  });

  describe('King Movement', () => {
    beforeEach(() => {
      // Add white king at e1 (row 7, col 4)
      gameState.board[7][4] = { type: 'king', color: 'white' };
    });

    test('can move one square in any direction', () => {
      const validMoves = [
        { from: { row: 7, col: 4 }, to: { row: 6, col: 4 } }, // up
        { from: { row: 7, col: 4 }, to: { row: 6, col: 5 } }, // up-right
        { from: { row: 7, col: 4 }, to: { row: 7, col: 5 } }, // right
      ];

      validMoves.forEach(move => {
        expect(isValidMove(gameState, move)).toBe(true);
      });
    });

    test('cannot move more than one square', () => {
      const move = {
        from: { row: 7, col: 4 },
        to: { row: 5, col: 4 }
      };
      expect(isValidMove(gameState, move)).toBe(false);
    });
  });

  describe('Castling', () => {
    beforeEach(() => {
      // Setup initial position for castling
      gameState.board[7][4] = { type: 'king', color: 'white' };
      gameState.board[7][7] = { type: 'rook', color: 'white' };
      gameState.board[7][0] = { type: 'rook', color: 'white' };
    });

    test('can castle kingside', () => {
      const move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 6 }
      };
      expect(isValidMove(gameState, move)).toBe(true);
    });

    test('cannot castle through pieces', () => {
      gameState.board[7][5] = { type: 'bishop', color: 'white' };
      const move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 6 }
      };
      expect(isValidMove(gameState, move)).toBe(false);
    });
  });
}); 