import React from 'react';

interface SuggestionSheetProps {
  suggestion: {
    move: string;
    explain: string;
  } | null;
  onClose: () => void;
}

const SuggestionSheet: React.FC<SuggestionSheetProps> = ({ suggestion, onClose }) => {
  if (!suggestion) return null;

  return (
    <div className="suggestion-sheet-overlay">
      <div className="suggestion-sheet">
        <h2>AI Suggestion</h2>
        <div className="suggestion-content">
          <p><strong>Suggested Move:</strong> {suggestion.move}</p>
          <p><strong>Explanation:</strong> {suggestion.explain}</p>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SuggestionSheet;