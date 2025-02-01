import React from "react";
import "../styles/Piece.css";
import { Piece as PieceType } from "../logic/types";

interface PieceProps {
  piece: PieceType;
}

const Piece: React.FC<PieceProps> = ({ piece }) => {
  // For Stage 1, display a simple text symbol for the piece.
  const pieceSymbol = piece.type[0].toUpperCase();
  const colorClass = piece.color === "white" ? "piece white-piece" : "piece black-piece";
  return <div className={colorClass}>{pieceSymbol}</div>;
};

export default Piece;
