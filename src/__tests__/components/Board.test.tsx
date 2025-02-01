import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Board from '../../components/Board';

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

  test('save and load functionality works', async () => {
    const { container, unmount, rerender } = render(<Board />);
    
    // Make a move
    const whitePawn = screen.getAllByText('♙')[0];
    fireEvent.click(whitePawn);
    const squares = container.querySelectorAll('.square');
    fireEvent.click(squares[40]);

    // Verify move was made
    await waitFor(() => {
      expect(squares[40].querySelector('.piece')?.textContent).toBe('♙');
    });

    // Save game
    fireEvent.click(screen.getByText('Save Game'));
    
    // Wait for save to complete
    await waitFor(() => {
      const savedState = localStorage.getItem('chessGameState');
      expect(savedState).toBeTruthy();
    });
    
    // Unmount the board to simulate a page reload
    unmount();
    
    // Render a new instance of Board (simulating reopening the application)
    const { container: newContainer, rerender: newRerender } = render(<Board />);
    
    // Load game into the new board instance
    fireEvent.click(screen.getByText('Load Game'));
    
    // Optionally force a re-render
    newRerender(<Board />);
    
    // Wait for and verify the loaded state
    await waitFor(
      () => {
        const loadedSquares = newContainer.querySelectorAll('.square');
        const pieceAtTarget = loadedSquares[40].querySelector('.piece');
        if (!pieceAtTarget) {
          console.log('Current localStorage state:', localStorage.getItem('chessGameState'));
          console.log('Current board state:', {
            targetSquare: loadedSquares[40].innerHTML,
            hasPiece: !!loadedSquares[40].querySelector('.piece'),
            pieceContent: loadedSquares[40].querySelector('.piece')?.textContent,
            allPieces: newContainer.querySelectorAll('.piece').length
          });
          throw new Error('Piece not found at target square');
        }
        expect(pieceAtTarget.textContent).toBe('♙');
      },
      { timeout: 3000, interval: 100 }
    );
  });
});

export {}; // This makes the file a module 