import React from 'react';
import '../styles/PlayerInfo.css';

interface PlayerInfoProps {
  color: 'white' | 'black';
  gameMode: 'human' | 'computer' | 'computer-vs-computer';
  isCurrentTurn: boolean;
  computerLevel?: 'easy' | 'medium' | 'hard';
  hardSettings?: {
    maxDepth: number;
    useAlphaBeta: boolean;
  };
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ color, gameMode, isCurrentTurn, computerLevel, hardSettings }) => {
  const getPlayerType = () => {
    if (gameMode === 'human') return 'Human';
    if (computerLevel === 'hard' && hardSettings) {
      return `Computer (hard, D${hardSettings.maxDepth}${hardSettings.useAlphaBeta ? '' : ', no AB'})`;
    }
    return computerLevel ? `Computer (${computerLevel})` : 'Human';
  };

  return (
    <div className={`player-info ${isCurrentTurn ? 'active' : ''}`}>
      <div className={`player-color ${color}`} />
      <div className="player-details">
        <div className="player-name">{color.charAt(0).toUpperCase() + color.slice(1)}</div>
        <div className="player-type">{getPlayerType()}</div>
      </div>
    </div>
  );
};

export default PlayerInfo; 