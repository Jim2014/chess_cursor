import React from "react";
import "../styles/Piece.css";
import { Piece as PieceType } from "../logic/types";

interface PieceProps {
  piece: PieceType;
}

const pieceSymbols: { [key in PieceType["type"]]: { white: string; black: string } } = {
  pawn: { white: "\u2659", black: "\u265F" },
  rook: { white: "\u2656", black: "\u265C" },
  knight: { white: "\u2658", black: "\u265E" },
  bishop: { white: "\u2657", black: "\u265D" },
  queen: { white: "\u2655", black: "\u265B" },
  king: { white: "\u2654", black: "\u265A" },
};

const Piece: React.FC<PieceProps> = ({ piece }) => {
  const symbol = pieceSymbols[piece.type][piece.color];
  const colorClass = piece.color === "white" ? "piece white-piece" : "piece black-piece";
  return <div className={colorClass}>{symbol}</div>;
};

export default Piece;
