import React, { useState } from 'react';
import { HardComputerSettings } from '../ai/HardComputerPlayer';
import '../styles/Dialog.css';

interface HardComputerSettingsProps {
  initialSettings: HardComputerSettings;
  onSave: (settings: HardComputerSettings) => void;
  onCancel: () => void;
}

const HardSettingsDialog: React.FC<HardComputerSettingsProps> = ({
  initialSettings,
  onSave,
  onCancel
}) => {
  const [settings, setSettings] = useState<HardComputerSettings>(initialSettings);

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Hard Computer Settings</h3>
        
        <div className="settings-group">
          <label>Search Depth (2-6):</label>
          <input
            type="number"
            min="2"
            max="6"
            value={settings.maxDepth}
            onChange={(e) => setSettings({
              ...settings,
              maxDepth: Math.min(6, Math.max(2, parseInt(e.target.value) || 2))
            })}
          />
          <div className="setting-description">
            Higher values make the computer stronger but slower
          </div>
        </div>

        <div className="settings-group">
          <label>Move Delay (ms):</label>
          <input
            type="number"
            min="0"
            max="3000"
            step="100"
            value={settings.moveDelay}
            onChange={(e) => setSettings({
              ...settings,
              moveDelay: Math.max(0, parseInt(e.target.value) || 0)
            })}
          />
          <div className="setting-description">
            Delay between moves (in milliseconds)
          </div>
        </div>

        <div className="settings-group">
          <label>
            <input
              type="checkbox"
              checked={settings.useAlphaBeta}
              onChange={(e) => setSettings({
                ...settings,
                useAlphaBeta: e.target.checked
              })}
            />
            Use Alpha-Beta Pruning
          </label>
          <div className="setting-description">
            Makes the computer faster but might affect move quality
          </div>
        </div>

        <div className="dialog-buttons">
          <button onClick={() => onSave(settings)}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default HardSettingsDialog; 