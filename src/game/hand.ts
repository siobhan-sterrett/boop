import { Piece, PieceKind } from "./piece";

export interface Hand {
    addPiece(kind: PieceKind): void;
    hasPiece(kind?: PieceKind): boolean;
    takePiece(kind: PieceKind): Piece;
}
