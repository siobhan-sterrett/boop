import { CanvasCoordinate } from "./canvas_coordinate";
import { Piece } from "./piece";

/**
 * A Cell is a rectangle on a canvas that can receive and hold a Piece.
 * Some cells are on the board, some are in a player's hand; and there might
 * be some cells in the board gutter (tbd).
 */
export class Cell {
    rect: DOMRect;
    path: Path2D;
    piece: Piece | null = null;

    constructor(rect: DOMRect) {
        this.rect = rect;
        this.path = new Path2D();
        this.path.rect(rect.x, rect.y, rect.width, rect.height);
    }

    center(): CanvasCoordinate {
        return new CanvasCoordinate(this.rect.x + this.rect.width / 2, this.rect.y + this.rect.height / 2);
    }

    setPiece(piece: Piece) {
        this.piece = piece;
        this.piece.setPlace(this);
    }

    removePiece(): Piece | null {
        const piece = this.piece;
        this.piece = null;
        piece?.setPlace(this.center());
        return piece;
    }
}
