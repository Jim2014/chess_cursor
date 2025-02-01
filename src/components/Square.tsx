// src/components/Square.tsx
import React from "react";
import "../styles/Square.css";
import { Position, Piece } from "../logic/types";
import PieceComponent from "./Piece";

interface SquareProps {
  position: Position;
  piece: Piece | null;
  onClick: (position: Position) => void;
  isSelected?: boolean;
  allowed?: boolean;
}

const Square: React.FC<SquareProps> = ({
  position,
  piece,
  onClick,
  isSelected = false,
  allowed = false,
}) => {
  const isDark = (position.row + position.col) % 2 === 1;
  let squareClass = isDark ? "square dark" : "square light";
  if (isSelected) {
    squareClass += " selected";
  }
  if (allowed) {
    squareClass += " allowed";
  }
  return (
    <div className={squareClass} onClick={() => onClick(position)}>
      {piece && <PieceComponent piece={piece} />}
    </div>
  );
};

export default Square;
