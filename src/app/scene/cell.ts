import { Piece } from "./piece";

export class Cell {
    #rect: DOMRect;
    #piece: Piece | null = null;

    constructor(rect: DOMRect, piece?: Piece) {
        if (piece) {
            this.#piece = piece;
        }
        this.rect = rect; // Sets piece center as well
    }

    set rect(rect: DOMRect) {
        this.#rect = rect;
        if (this.#piece) {
            this.#piece.center = this.center;
        }
    }

    get rect() {
        return this.#rect;
    }

    set piece(piece: Piece) {
        this.#piece = piece;
        this.#piece.center = this.center;
    }

    get center() {
        return new DOMPoint(
            this.#rect.x + 0.5 * this.#rect.width,
            this.#rect.y + 0.5 * this.#rect.height,
        )
    }

    set center(point: DOMPoint) {
        this.#rect.x = point.x - this.#rect.width / 2.0;
        this.#rect.y = point.y - this.#rect.height / 2.0;
        if (this.#piece) {
            this.#piece.center = this.center;
        }
    }

    get path() {
        const path = new Path2D();
        path.rect(this.#rect.x, this.#rect.y, this.#rect.width, this.#rect.height);
        return path;
    }

    takePiece(): Piece | null {
        const piece = this.#piece;
        this.#piece = null;
        return piece;
    }
}
