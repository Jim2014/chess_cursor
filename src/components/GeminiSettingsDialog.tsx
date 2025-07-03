import React, { useState } from 'react';

interface GeminiSettingsDialogProps {
  onSave: (apiKey: string, modelName: string) => void;
  onCancel: () => void;
  initialApiKey?: string;
  initialModelName?: string;
}

const GeminiSettingsDialog: React.FC<GeminiSettingsDialogProps> = ({ onSave, onCancel, initialApiKey = '', initialModelName = '' }) => {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [modelName, setModelName] = useState(initialModelName);

  const handleSave = () => {
    onSave(apiKey, modelName);
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Gemini Settings</h2>
        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <input
            id="apiKey"
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
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