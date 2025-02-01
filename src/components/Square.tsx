import React from "react";
import "../styles/Square.css";
import { Position, Piece } from "../logic/types";
import PieceComponent from "./Piece";

interface SquareProps {
  position: Position;
  piece: Piece | null;
}

const Square: React.FC<SquareProps> = ({ position, piece }) => {
  // Alternate square color based on position
  const isDark = (position.row + position.col) % 2 === 1;
  const squareClass = isDark ? "square dark" : "square light";

  return <div className={squareClass}>{piece && <PieceComponent piece={piece} />}</div>;
};

export default Square;
