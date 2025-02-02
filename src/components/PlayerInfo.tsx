import React from 'react';
import '../styles/PlayerInfo.css';

interface PlayerInfoProps {
  color: 'white' | 'black';
  gameMode: 'human' | 'computer' | 'computer-vs-computer';
  isCurrentTurn: boolean;
  computerLevel?: 'easy' | 'medium';
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ color, gameMode, isCurrentTurn, computerLevel }) => {
  const getPlayerType = () => {
    if (gameMode === 'human') return 'Human';
    if (gameMode === 'computer-vs-computer') return `Computer (${computerLevel})`;
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