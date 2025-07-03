import React, { useState, useRef } from 'react';

interface GeminiSettingsDialogProps {
  onSave: (apiKey: string, modelName: string) => void;
  onCancel: () => void;
  initialApiKey?: string;
  initialModelName?: string;
}

const GeminiSettingsDialog: React.FC<GeminiSettingsDialogProps> = ({ onSave, onCancel, initialApiKey = '', initialModelName = '' }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [modelName, setModelName] = useState(initialModelName);
  const [showApiKey, setShowApiKey] = useState(false);
  const apiKeyInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave(apiKey, modelName);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Gemini Settings</h2>
        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <div className="api-key-input-group">
            <input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              ref={apiKeyInputRef}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="toggle-api-key-button"
            >
              {showApiKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p className="api-key-note">Your API Key is saved in local storage only and is not sent to any server.</p>
        </div>
        <div className="form-group">
          <label htmlFor="modelName">Model Name</label>
          <input
            id="modelName"
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </div>
        <div className="dialog-buttons">
          <button onClick={handleSave}>Save</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default GeminiSettingsDialog;
