import { BoardCoordinate } from "./game";
import { PieceKind } from "./piece";

export type Move = {
    kind: PieceKind;
    place: BoardCoordinate;
}

export type Triplet = [BoardCoordinate, BoardCoordinate, BoardCoordinate];

export type Graduate = {
    graduate: Triplet;
}

export type Retrieve = {
    retrieve: BoardCoordinate;
}

export type Turn = Move & Partial<Graduate> & Partial<Retrieve>;
