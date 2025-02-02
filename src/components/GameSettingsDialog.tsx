import React, { useState } from 'react';
import '../styles/Dialog.css';

interface GameSettingsDialogProps {
  onStart: (settings: GameSettings) => void;
  onCancel: () => void;
}

export interface GameSettings {
  gameMode: 'human' | 'computer' | 'computer-vs-computer';
  computerColor: 'white' | 'black';  // Only used in human vs computer mode
  whitePlayerLevel: 'easy' | 'medium';  // Used for white player in computer vs computer
  blackPlayerLevel: 'easy' | 'medium';  // Used for black player in computer vs computer
}

const GameSettingsDialog: React.FC<GameSettingsDialogProps> = ({ onStart, onCancel }) => {
  const [settings, setSettings] = useState<GameSettings>({
    gameMode: 'human',
    computerColor: 'black',
    whitePlayerLevel: 'easy',
    blackPlayerLevel: 'easy'
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
              gameMode: e.target.value as GameSettings['gameMode']
            })}
          >
            <option value="human">Human vs Human</option>
            <option value="computer">Human vs Computer</option>
            <option value="computer-vs-computer">Computer vs Computer</option>
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
              <label>Computer Level:</label>
              <select
                value={settings.computerColor === 'white' ? settings.whitePlayerLevel : settings.blackPlayerLevel}
                onChange={(e) => {
                  const level = e.target.value as 'easy' | 'medium';
                  setSettings({
                    ...settings,
                    whitePlayerLevel: settings.computerColor === 'white' ? level : settings.whitePlayerLevel,
                    blackPlayerLevel: settings.computerColor === 'black' ? level : settings.blackPlayerLevel
                  });
                }}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
              </select>
            </div>
          </>
        )}

        {settings.gameMode === 'computer-vs-computer' && (
          <>
            <div className="settings-group">
              <label>White Player Level:</label>
              <select
                value={settings.whitePlayerLevel}
                onChange={(e) => setSettings({
                  ...settings,
                  whitePlayerLevel: e.target.value as 'easy' | 'medium'
                })}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
              </select>
            </div>

            <div className="settings-group">
              <label>Black Player Level:</label>
              <select
                value={settings.blackPlayerLevel}
                onChange={(e) => setSettings({
                  ...settings,
                  blackPlayerLevel: e.target.value as 'easy' | 'medium'
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