/**
 * A piece is an object which has a kind and an owner. Each piece is either
 * in a cell, or is being moved by user interaction or by animation.
 */

import { PieceKind, PieceOwner } from "../game";
import { CanvasCoordinate } from "./canvas_coordinate";
import { Cell } from "./cell";

export type PiecePlace = Cell | CanvasCoordinate;

export class Piece {
    kind: PieceKind;
    owner: PieceOwner;
    place: PiecePlace;

    constructor(kind: PieceKind, owner: PieceOwner, place: Cell) {
        this.kind = kind;
        this.owner = owner;
        this.place = place;
    }

    setPlace(place: PiecePlace) {
        this.place = place;
    }

    path(): Path2D {
        const { x, y } = this.place instanceof Cell ? this.place.center() : this.place;
        const radius = this.kind == 'cat' ? 0.45 : 0.30;

        const path = new Path2D();
        path.arc(x, y, radius, 0, 2 * Math.PI);
        return path;
    }
}
