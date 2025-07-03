import React, { useState, useEffect } from 'react';
import '../styles/SuggestionSheet.css';

interface SuggestionSheetProps {
  suggestion: {
    move: string;
    explain: string;
  } | null;
  onClose: () => void;
  onMakeMove: (move: string) => void;
}

const SuggestionSheet: React.FC<SuggestionSheetProps> = ({ suggestion, onClose, onMakeMove }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (suggestion) {
      setIsCollapsed(false); // Expand when a new suggestion arrives
    }
  }, [suggestion]);

  if (!suggestion) return null;

  return (
    <div className={`suggestion-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>AI Suggestion</h2>
        <button className="collapse-button" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? '>' : '<'}
        </button>
      </div>
      {!isCollapsed && (
        <div className="sidebar-content">
          <div className="suggestion-content">
            <p><strong>Suggested Move:</strong> {suggestion.move}</p>
            <p><strong>Explanation:</strong> {suggestion.explain}</p>
          </div>
          <div className="dialog-buttons">
            <button onClick={() => onMakeMove(suggestion.move)}>Make Move</button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuggestionSheet;