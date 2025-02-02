import React from 'react';
import '../styles/Dialog.css';

export type GameResult = {
  type: 'checkmate' | 'stalemate' | 'insufficient-material' | 'threefold-repetition' | 'fifty-move';
  winner?: 'white' | 'black';
  moveLimit?: boolean;
};

interface GameResultDialogProps {
  result: GameResult;
  onNewGame: () => void;
  onClose: () => void;
}

const GameResultDialog: React.FC<GameResultDialogProps> = ({ result, onNewGame, onClose }) => {
  const getMessage = () => {
    switch (result.type) {
      case 'checkmate':
        return `Checkmate! ${result.winner === 'white' ? 'White' : 'Black'} wins!`;
      case 'stalemate':
        return 'Draw by Stalemate';
      case 'insufficient-material':
        if (result.moveLimit) {
          return 'Draw by Move Limit (200 moves)';
        }
        return 'Draw by Insufficient Material';
      case 'threefold-repetition':
        return 'Draw by Threefold Repetition';
      case 'fifty-move':
        return 'Draw by Fifty-Move Rule';
      default:
        return 'Game Over';
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Game Over</h3>
        <p>{getMessage()}</p>
        <div className="dialog-buttons">
          <button onClick={onNewGame}>New Game</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default GameResultDialog; 