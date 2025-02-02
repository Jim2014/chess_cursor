import React, { useState } from 'react';

interface SaveGameDialogProps {
  onSave: (name: string) => void;
  onCancel: () => void;
}

const SaveGameDialog: React.FC<SaveGameDialogProps> = ({ onSave, onCancel }) => {
  const [saveName, setSaveName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (saveName.trim()) {
      onSave(saveName.trim());
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Save Game</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Enter save name"
            autoFocus
          />
          <div className="dialog-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveGameDialog; 