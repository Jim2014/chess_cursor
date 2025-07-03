import React from 'react';

interface SuggestionSheetProps {
  suggestion: {
    move: string;
    explain: string;
  } | null;
  onClose: () => void;
  onMakeMove: (move: string) => void;
}

const SuggestionSheet: React.FC<SuggestionSheetProps> = ({ suggestion, onClose, onMakeMove }) => {
  if (!suggestion) return null;

  return (
    <div className="suggestion-sheet-overlay">
      <div className="suggestion-sheet">
        <h2>AI Suggestion</h2>
        <div className="suggestion-content">
          <p><strong>Suggested Move:</strong> {suggestion.move}</p>
          <p><strong>Explanation:</strong> {suggestion.explain}</p>
        </div>
        <div className="dialog-buttons">
          <button onClick={() => onMakeMove(suggestion.move)}>Make Move</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionSheet;