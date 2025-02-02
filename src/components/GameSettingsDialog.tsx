import React, { useState } from 'react';
import '../styles/Dialog.css';
import { HardComputerSettings } from '../ai/HardComputerPlayer';
import HardSettingsDialog from './HardComputerSettings';

interface GameSettingsDialogProps {
  onStart: (settings: GameSettings) => void;
  onCancel: () => void;
}

export interface GameSettings {
  gameMode: 'human' | 'computer' | 'computer-vs-computer';
  computerColor: 'white' | 'black';  // Only used in human vs computer mode
  whitePlayerLevel: 'easy' | 'medium' | 'hard';  // Used for white player in computer vs computer
  blackPlayerLevel: 'easy' | 'medium' | 'hard';  // Used for black player in computer vs computer
  whiteHardSettings?: HardComputerSettings;
  blackHardSettings?: HardComputerSettings;
}

const GameSettingsDialog: React.FC<GameSettingsDialogProps> = ({ onStart, onCancel }) => {
  const defaultSettings: GameSettings = {
    gameMode: 'human',
    computerColor: 'black',
    whitePlayerLevel: 'easy',
    blackPlayerLevel: 'easy',
    whiteHardSettings: {
      maxDepth: 2,
      moveDelay: 800,
      useAlphaBeta: true
    },
    blackHardSettings: {
      maxDepth: 2,
      moveDelay: 800,
      useAlphaBeta: true
    }
  };

  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [showWhiteHardSettings, setShowWhiteHardSettings] = useState(false);
  const [showBlackHardSettings, setShowBlackHardSettings] = useState(false);

  // Reset settings to default when dialog opens
  React.useEffect(() => {
    setSettings(defaultSettings);
  }, []); // Empty dependency array means this runs once when component mounts

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
              <div className="level-settings">
                <select
                  value={settings.computerColor === 'white' ? settings.whitePlayerLevel : settings.blackPlayerLevel}
                  onChange={(e) => {
                    const level = e.target.value as 'easy' | 'medium' | 'hard';
                    setSettings({
                      ...settings,
                      whitePlayerLevel: settings.computerColor === 'white' ? level : settings.whitePlayerLevel,
                      blackPlayerLevel: settings.computerColor === 'black' ? level : settings.blackPlayerLevel
                    });
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {((settings.computerColor === 'white' && settings.whitePlayerLevel === 'hard') ||
                  (settings.computerColor === 'black' && settings.blackPlayerLevel === 'hard')) && (
                  <button 
                    className="hard-settings-button"
                    onClick={() => settings.computerColor === 'white' 
                      ? setShowWhiteHardSettings(true) 
                      : setShowBlackHardSettings(true)}
                  >
                    Settings
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {settings.gameMode === 'computer-vs-computer' && (
          <>
            <div className="settings-group">
              <label>White Player Level:</label>
              <div className="level-settings">
                <select
                  value={settings.whitePlayerLevel}
                  onChange={(e) => setSettings({
                    ...settings,
                    whitePlayerLevel: e.target.value as 'easy' | 'medium' | 'hard'
                  })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {settings.whitePlayerLevel === 'hard' && (
                  <button 
                    className="hard-settings-button"
                    onClick={() => setShowWhiteHardSettings(true)}
                  >
                    Settings
                  </button>
                )}
              </div>
            </div>

            <div className="settings-group">
              <label>Black Player Level:</label>
              <div className="level-settings">
                <select
                  value={settings.blackPlayerLevel}
                  onChange={(e) => setSettings({
                    ...settings,
                    blackPlayerLevel: e.target.value as 'easy' | 'medium' | 'hard'
                  })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                {settings.blackPlayerLevel === 'hard' && (
                  <button 
                    className="hard-settings-button"
                    onClick={() => setShowBlackHardSettings(true)}
                  >
                    Settings
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <div className="dialog-buttons">
          <button onClick={() => onStart(settings)}>Start Game</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>

      {showWhiteHardSettings && (
        <HardSettingsDialog
          initialSettings={settings.whiteHardSettings!}
          onSave={(hardSettings: HardComputerSettings) => {
            setSettings({ ...settings, whiteHardSettings: hardSettings });
            setShowWhiteHardSettings(false);
          }}
          onCancel={() => setShowWhiteHardSettings(false)}
        />
      )}

      {showBlackHardSettings && (
        <HardSettingsDialog
          initialSettings={settings.blackHardSettings!}
          onSave={(hardSettings: HardComputerSettings) => {
            setSettings({ ...settings, blackHardSettings: hardSettings });
            setShowBlackHardSettings(false);
          }}
          onCancel={() => setShowBlackHardSettings(false)}
        />
      )}
    </div>
  );
};

export default GameSettingsDialog; 