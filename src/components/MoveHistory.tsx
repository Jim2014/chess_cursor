// src/components/MoveHistory.tsx
import React from "react";
import "../styles/MoveHistory.css";
import { MoveWithSnapshot } from "../logic/types";

interface MoveHistoryProps {
  moves: MoveWithSnapshot[];
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves }) => {
  return (
    <div className="move-history">
      <h3>Move History</h3>
      <ul>
        {moves.map((move, index) => (
          <li key={index}>
            {`${index + 1}. ${move.description}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MoveHistory;
