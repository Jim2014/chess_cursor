import React from "react";
import "../styles/Square.css";
import { Position, Piece } from "../logic/types";
import PieceComponent from "./Piece";

interface SquareProps {
  position: Position;
  piece: Piece | null;
  onClick: (position: Position) => void;
  isSelected?: boolean;
}

const Square: React.FC<SquareProps> = ({
  position,
  piece,
  onClick,
  isSelected = false,
}) => {
  // Determine square color.
  const isDark = (position.row + position.col) % 2 === 1;
  let squareClass = isDark ? "square dark" : "square light";
  if (isSelected) {
    squareClass += " selected";
  }

  return (
    <div className={squareClass} onClick={() => onClick(position)}>
      {piece && <PieceComponent piece={piece} />}
    </div>
  );
};

export default Square;
