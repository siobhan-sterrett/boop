import { BoardCoordinate } from './board';
import { Triplet } from './game';
import { PieceKind, PieceOwner } from './piece';

export type GameEvent = {
    eventKind: 'begin-turn';
    turn: PieceOwner;
} | {
    eventKind: 'place-piece';
    pieceKind: PieceKind;
    target: BoardCoordinate;
} | {
    eventKind: 'graduate-triplet';
    triplet: Triplet;
} | {
    eventKind: 'retrieve-piece';
    target: BoardCoordinate;
};
