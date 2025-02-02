import React, { useState } from 'react';
import '../styles/Dialog.css';

interface GameSettingsDialogProps {
  onStart: (settings: GameSettings) => void;
  onCancel: () => void;
}

export interface GameSettings {
  gameMode: 'human' | 'computer';
  computerColor: 'white' | 'black';
  difficulty: 'easy' | 'medium';
}

const GameSettingsDialog: React.FC<GameSettingsDialogProps> = ({ onStart, onCancel }) => {
  const [settings, setSettings] = useState<GameSettings>({
    gameMode: 'human',
    computerColor: 'black',
    difficulty: 'easy'
  });

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Game Settings</h3>
        
        <div className="settings-group">
          <label>Game Mode:</label>
          <select 
            value={settings.gameMode}
            onChange={(e) => setSettings({
              ...settings,
              gameMode: e.target.value as 'human' | 'computer'
            })}
          >
            <option value="human">Human vs Human</option>
            <option value="computer">vs Computer</option>
          </select>
        </div>

        {settings.gameMode === 'computer' && (
          <>
            <div className="settings-group">
              <label>Play as:</label>
              <select
                value={settings.computerColor === 'black' ? 'white' : 'black'}
                onChange={(e) => setSettings({
                  ...settings,
                  computerColor: e.target.value === 'white' ? 'black' : 'white'
                })}
              >
                <option value="white">White</option>
                <option value="black">Black</option>
              </select>
            </div>

            <div className="settings-group">
              <label>Difficulty:</label>
              <select
                value={settings.difficulty}
                onChange={(e) => setSettings({
                  ...settings,
                  difficulty: e.target.value as 'easy' | 'medium'
                })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </>
        )}

        <div className="dialog-buttons">
          <button onClick={() => onStart(settings)}>Start Game</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default GameSettingsDialog; 