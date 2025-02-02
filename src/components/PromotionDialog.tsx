import React from "react";
import "../styles/PromotionDialog.css";
import { Color } from "../logic/types";

interface PromotionDialogProps {
  color: Color;
  onSelect: (pieceType: "queen" | "rook" | "bishop" | "knight") => void;
}

const PromotionDialog: React.FC<PromotionDialogProps> = ({ color, onSelect }) => {
  const pieces = {
    queen: color === "white" ? "♕" : "♛",
    rook: color === "white" ? "♖" : "♜",
    bishop: color === "white" ? "♗" : "♝",
    knight: color === "white" ? "♘" : "♞"
  };

  return (
    <div className="promotion-dialog-overlay">
      <div className="promotion-dialog">
        <h3>Choose promotion piece</h3>
        <div className="promotion-options">
          {Object.entries(pieces).map(([type, symbol]) => (
            <button
              key={type}
              className={`piece-option ${color}-piece`}
              onClick={() => onSelect(type as "queen" | "rook" | "bishop" | "knight")}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionDialog; 