import React, { useState, useEffect } from 'react';
import '../styles/SuggestionSheet.css';

interface SuggestionSheetProps {
  isOpen: boolean;
  suggestion: {
    move: string;
    explain: string;
  } | null;
  onClose: () => void;
  onMakeMove: (move: string) => void;
  onFetchNew: () => void;
  isFetchingSuggestion: boolean;
}

const SuggestionSheet: React.FC<SuggestionSheetProps> = ({ isOpen, suggestion, onClose, onMakeMove, onFetchNew, isFetchingSuggestion }) => {
  return (
    <div className={`suggestion-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="header-buttons">
          {suggestion && <button onClick={() => onMakeMove(suggestion.move)}>Action</button>}
          <button onClick={onFetchNew}>Suggestion</button>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
      </div>
      <div className="sidebar-content">
        {isFetchingSuggestion ? (
          <p>Getting suggestion from Gemini...</p>
        ) : suggestion ? (
          <div className="suggestion-content">
            <p><strong>Suggested Move:</strong> {suggestion.move}</p>
            <p><strong>Explanation:</strong> {suggestion.explain}</p>
          </div>
        ) : (
          <p>Click "Suggestion" to get a move recommendation.</p>
        )}
      </div>
    </div>
  );
};

export default SuggestionSheet;
