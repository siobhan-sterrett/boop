/**
 * A piece is an object which has a kind and an owner. Each piece is either
 * in a cell, or is being moved by user interaction or by animation.
 */

import { PieceKind, PieceOwner } from "../game";
import { CanvasCoordinate } from "./canvas_coordinate";
import { Cell } from "./cell";

export class Piece {
    kind: PieceKind;
    owner: PieceOwner;
    place: Cell | CanvasCoordinate;

    constructor(kind: PieceKind, owner: PieceOwner, place: Cell) {
        this.kind = kind;
        this.owner = owner;
        this.place = place;
    }

    setPlace(place: Cell | CanvasCoordinate) {
        this.place = place;
    }

    path(): Path2D {
        const { x, y } = this.place instanceof CanvasCoordinate ? this.place : this.place.center();
        const radius = this.kind == 'cat' ? 0.45 : 0.30;

        const path = new Path2D();
        path.arc(x, y, radius, 0, 2 * Math.PI);
        return path;
    }
}
