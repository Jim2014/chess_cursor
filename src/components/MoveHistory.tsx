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
        {[...moves].reverse().map((move, index) => {
          const moveNumber = moves.length - index;
          return (
            <li key={index}>
              {`${moveNumber}. ${move.description}`}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MoveHistory;
