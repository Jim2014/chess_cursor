// src/components/MoveHistory.tsx
import React from "react";
import "../styles/MoveHistory.css";
import { Move } from "../logic/types";

interface MoveHistoryProps {
  moves: Move[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  return (
    <div className="move-history">
      <h3>Move History</h3>
      <ul>
        {moves.map((move, index) => (
          <li key={index}>
            {formatMove(move, index)}
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * Converts a move into simple chess notation.
 * For example: "e2 → e4"
 */
const formatMove = (move: Move, index: number): string => {
  const posToString = (pos: { row: number; col: number }): string => {
    // Files: a-h; Ranks: 8-1 (row 0 = 8, row 7 = 1)
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
    return files[pos.col] + ranks[pos.row];
  };

  return `${index + 1}. ${posToString(move.from)} → ${posToString(move.to)}`;
};

export default MoveHistory;
