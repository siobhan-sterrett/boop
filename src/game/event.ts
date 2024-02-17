import { BoardCoordinate, boardCoordinateEq } from './board';
import { Triplet } from './game';
import { PieceKind, PieceOwner } from './piece';

export type Boop = {
    origin: BoardCoordinate;
    target?: BoardCoordinate;
}

export function boopEq(a: Boop, b: Boop) {
    return boardCoordinateEq(a.origin, b.origin) && (
        (a.target == undefined && b.target == undefined) ||
        (a.target && b.target && boardCoordinateEq(a.target, b.target))
    );
}

export type GameEvent = {
    eventKind: 'begin-turn';
    turn: PieceOwner;
} | {
    eventKind: 'place-piece';
    pieceKind: PieceKind;
    target: BoardCoordinate;
} | {
    eventKind: 'boop';
    boops: Boop[];
} | {
    eventKind: 'graduate-triplet';
    triplet: Triplet;
} | {
    eventKind: 'retrieve-piece';
    target: BoardCoordinate;
};
