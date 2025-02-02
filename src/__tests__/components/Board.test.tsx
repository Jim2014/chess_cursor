import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from '../../components/Board';
import { initialBoardSetup } from '../../logic/GameManager';
import { act } from 'react-dom/test-utils';

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});

describe('Board Component', () => {
  test('renders chess board with correct initial setup', () => {
    render(<Board />);
    
    // Check if pawns are rendered
    const whitePawns = screen.getAllByText('♙');
    const blackPawns = screen.getAllByText('♟');
    expect(whitePawns).toHaveLength(8);
    expect(blackPawns).toHaveLength(8);

    // Check if other pieces are rendered
    expect(screen.getAllByText('♖')).toHaveLength(2); // white rooks
    expect(screen.getAllByText('♘')).toHaveLength(2); // white knights
    expect(screen.getAllByText('♗')).toHaveLength(2); // white bishops
    expect(screen.getAllByText('♕')).toHaveLength(1); // white queen
    expect(screen.getAllByText('♔')).toHaveLength(1); // white king

    // Check black pieces
    expect(screen.getAllByText('♜')).toHaveLength(2); // black rooks
    expect(screen.getAllByText('♞')).toHaveLength(2); // black knights
    expect(screen.getAllByText('♝')).toHaveLength(2); // black bishops
    expect(screen.getAllByText('♛')).toHaveLength(1); // black queen
    expect(screen.getAllByText('♚')).toHaveLength(1); // black king

    // Check turn indicator
    expect(screen.getByText(/Turn:\s*white/)).toBeInTheDocument();
  });

  test('shows valid moves when piece is clicked', () => {
    render(<Board />);
    
    // Click on a white pawn
    const whitePawn = screen.getAllByText('♙')[0];
    fireEvent.click(whitePawn);

    // Check if valid moves are highlighted
    const highlightedSquares = document.querySelectorAll('.allowed');
    expect(highlightedSquares.length).toBeGreaterThan(0);
  });

  test('moves piece when valid move is clicked', () => {
    render(<Board />);
    
    // Click on a white pawn
    const whitePawn = screen.getAllByText('♙')[0];
    fireEvent.click(whitePawn);

    // Click on a valid move square
    const squares = document.querySelectorAll('.square');
    const targetSquare = squares[40]; // Two squares forward from first white pawn
    fireEvent.click(targetSquare);

    // Check if pawn moved
    expect(targetSquare.querySelector('.piece')?.textContent).toBe('♙');
  });

  test('handles turn switching correctly', () => {
    render(<Board />);
    
    // Initial turn should be white
    expect(screen.getByText(/Turn:\s*white/)).toBeInTheDocument();

    // Make a move with white
    const whitePawn = screen.getAllByText('♙')[0];
    fireEvent.click(whitePawn);
    const squares = document.querySelectorAll('.square');
    fireEvent.click(squares[40]); // Two squares forward

    // Turn should switch to black
    expect(screen.getByText(/Turn:\s*black/)).toBeInTheDocument();
  });

  test('undo/redo functionality works', () => {
    render(<Board />);
    
    // Make a move
    const whitePawn = screen.getAllByText('♙')[0];
    fireEvent.click(whitePawn);
    const squares = document.querySelectorAll('.square');
    fireEvent.click(squares[40]); // Two squares forward

    // Click undo
    const undoButton = screen.getByText('Undo');
    fireEvent.click(undoButton);

    // Check if position is restored (pawn back to original position)
    const originalSquare = squares[48]; // First white pawn's starting position
    expect(originalSquare.querySelector('.piece')?.textContent).toBe('♙');

    // Click redo
    const redoButton = screen.getByText('Redo');
    fireEvent.click(redoButton);

    // Check if move is reapplied
    expect(squares[40].querySelector('.piece')?.textContent).toBe('♙');
  });

  describe('Save/Load Game Management', () => {
    test('can save a game with a custom name', async () => {
      const { container } = render(<Board />);
      
      // Make a move
      const whitePawn = screen.getAllByText('♙')[0];
      fireEvent.click(whitePawn);
      const squares = container.querySelectorAll('.square');
      fireEvent.click(squares[40]); // Move pawn two squares forward
    
      // Open save dialog
      fireEvent.click(screen.getByText('Save Game'));
      
      // Enter save name
      const saveInput = screen.getByPlaceholderText('Enter save name');
      fireEvent.change(saveInput, { target: { value: 'Test Save 1' } });
      
      // Click save button
      fireEvent.click(screen.getByText('Save'));
      
      // Verify save in localStorage
      const saves = JSON.parse(localStorage.getItem('chessGameSaves') || '[]');
      expect(saves).toHaveLength(1);
      expect(saves[0].name).toBe('Test Save 1');
      expect(saves[0].state.moveHistory).toHaveLength(1);
    });

    test('can load a saved game', async () => {
      // First save a game
      const initialBoard = initialBoardSetup();
      // Move a pawn from a7 to a5
      initialBoard[4][0] = initialBoard[6][0];  // Move pawn to a5
      initialBoard[6][0] = null;  // Clear original position

      const savedGame = {
        name: 'Test Save',
        date: new Date().toLocaleString(),
        state: {
          board: initialBoard,
          turn: 'black',
          moveHistory: [{ from: { row: 6, col: 0 }, to: { row: 4, col: 0 } }],
          lastMove: null,
          castlingRights: {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
          },
          isCheck: false
        }
      };
      localStorage.setItem('chessGameSaves', JSON.stringify([savedGame]));

      const { container } = render(<Board />);

      // Open load dialog
      fireEvent.click(screen.getByText('Load Game'));
      
      // Click load button for the saved game
      fireEvent.click(screen.getByText('Load'));
      
      // Verify game state was loaded
      await waitFor(() => {
        expect(screen.getByText('Turn: black')).toBeInTheDocument();
        const squares = container.querySelectorAll('.square');
        // Check that pawn moved from a7 to a5
        expect(squares[32].querySelector('.piece')?.textContent).toBe('♙');  // a5
        expect(squares[48].querySelector('.piece')).toBeNull();  // a7 should be empty
      });
    });

    test('can delete a saved game', async () => {
      // First save a game
      const savedGame = {
        name: 'Test Save',
        date: new Date().toLocaleString(),
        state: {
          board: initialBoardSetup(),
          turn: 'white',
          moveHistory: [],
          lastMove: null,
          castlingRights: {
            white: { kingSide: true, queenSide: true },
            black: { kingSide: true, queenSide: true }
          },
          isCheck: false
        }
      };
      localStorage.setItem('chessGameSaves', JSON.stringify([savedGame]));

      render(<Board />);

      // Open load dialog
      fireEvent.click(screen.getByText('Load Game'));
      
      // Click delete button
      fireEvent.click(screen.getByText('Delete'));
      
      // Verify save was deleted
      const saves = JSON.parse(localStorage.getItem('chessGameSaves') || '[]');
      expect(saves).toHaveLength(0);
    });

    test('handles multiple saves', async () => {
      const { container } = render(<Board />);

      // Save first game
      fireEvent.click(screen.getByText('Save Game'));
      fireEvent.change(screen.getByPlaceholderText('Enter save name'), 
        { target: { value: 'Save 1' } }
      );
      fireEvent.click(screen.getByText('Save'));

      // Make a move and save second game
      const whitePawn = screen.getAllByText('♙')[0];
      fireEvent.click(whitePawn);
      const squares = container.querySelectorAll('.square');
      fireEvent.click(squares[40]);

      fireEvent.click(screen.getByText('Save Game'));
      fireEvent.change(screen.getByPlaceholderText('Enter save name'),
        { target: { value: 'Save 2' } }
      );
      fireEvent.click(screen.getByText('Save'));

      // Verify both saves exist
      const saves = JSON.parse(localStorage.getItem('chessGameSaves') || '[]');
      expect(saves).toHaveLength(2);
      expect(saves[0].name).toBe('Save 1');
      expect(saves[1].name).toBe('Save 2');
      expect(saves[1].state.moveHistory).toHaveLength(1);
    });
  });
});

export {}; // This makes the file a module 