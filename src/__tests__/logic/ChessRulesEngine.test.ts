import { isValidMove } from '../../logic/ChessRulesEngine';
import { GameState, Piece } from '../../logic/types';
import { createEmptyGameState, addPieceToBoard } from '../../utils/testUtils';

describe('ChessRulesEngine', () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createEmptyGameState();
  });

  describe('Pawn Movement', () => {
    beforeEach(() => {
      // Add white pawn at e2 (row 6, col 4)
      gameState = addPieceToBoard(gameState, { type: 'pawn', color: 'white' }, { row: 6, col: 4 });
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
      gameState = addPieceToBoard(gameState, { type: 'pawn', color: 'black' }, { row: 5, col: 5 });
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
      gameState = addPieceToBoard(gameState, { type: 'knight', color: 'white' }, { row: 7, col: 1 });
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

  describe('Bishop Movement', () => {
    beforeEach(() => {
      // Add white bishop at c1 (row 7, col 2)
      gameState = addPieceToBoard(gameState, { type: 'bishop', color: 'white' }, { row: 7, col: 2 });
    });

    test('can move diagonally', () => {
      const validMoves = [
        { from: { row: 7, col: 2 }, to: { row: 6, col: 1 } },
        { from: { row: 7, col: 2 }, to: { row: 6, col: 3 } }
      ];

      validMoves.forEach(move => {
        expect(isValidMove(gameState, move)).toBe(true);
      });
    });

    test('cannot move straight', () => {
      const move = {
        from: { row: 7, col: 2 },
        to: { row: 6, col: 2 }
      };
      expect(isValidMove(gameState, move)).toBe(false);
    });
  });

  describe('Rook Movement', () => {
    beforeEach(() => {
      // Add white rook at a1 (row 7, col 0)
      gameState = addPieceToBoard(gameState, { type: 'rook', color: 'white' }, { row: 7, col: 0 });
    });

    test('can move horizontally and vertically', () => {
      const validMoves = [
        { from: { row: 7, col: 0 }, to: { row: 7, col: 4 } },
        { from: { row: 7, col: 0 }, to: { row: 5, col: 0 } }
      ];

      validMoves.forEach(move => {
        expect(isValidMove(gameState, move)).toBe(true);
      });
    });

    test('cannot move diagonally', () => {
      const move = {
        from: { row: 7, col: 0 },
        to: { row: 6, col: 1 }
      };
      expect(isValidMove(gameState, move)).toBe(false);
    });
  });

  describe('Queen Movement', () => {
    beforeEach(() => {
      // Add white queen at d1 (row 7, col 3)
      gameState = addPieceToBoard(gameState, { type: 'queen', color: 'white' }, { row: 7, col: 3 });
    });

    test('can move in any direction', () => {
      const validMoves = [
        { from: { row: 7, col: 3 }, to: { row: 7, col: 5 } }, // horizontal
        { from: { row: 7, col: 3 }, to: { row: 5, col: 3 } }, // vertical
        { from: { row: 7, col: 3 }, to: { row: 5, col: 5 } }  // diagonal
      ];

      validMoves.forEach(move => {
        expect(isValidMove(gameState, move)).toBe(true);
      });
    });
  });

  describe('King Movement', () => {
    beforeEach(() => {
      // Add white king at e1 (row 7, col 4)
      gameState = addPieceToBoard(gameState, { type: 'king', color: 'white' }, { row: 7, col: 4 });
    });

    test('can move one square in any direction', () => {
      const validMoves = [
        { from: { row: 7, col: 4 }, to: { row: 6, col: 4 } }, // up
        { from: { row: 7, col: 4 }, to: { row: 6, col: 5 } }, // up-right
        { from: { row: 7, col: 4 }, to: { row: 7, col: 5 } }  // right
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
}); 