import React from 'react';

interface SavedGame {
  name: string;
  date: string;
}

interface LoadGameDialogProps {
  saves: SavedGame[];
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
  onCancel: () => void;
}

const LoadGameDialog: React.FC<LoadGameDialogProps> = ({ saves, onLoad, onDelete, onCancel }) => {
  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>Load Game</h3>
        <div className="saves-list">
          {saves.length === 0 ? (
            <p>No saved games found</p>
          ) : (
            saves.map(save => (
              <div key={save.name} className="save-item">
                <div className="save-info">
                  <span className="save-name">{save.name}</span>
                  <span className="save-date">{save.date}</span>
                </div>
                <div className="save-actions">
                  <button onClick={() => onLoad(save.name)}>Load</button>
                  <button onClick={() => onDelete(save.name)}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default LoadGameDialog; 