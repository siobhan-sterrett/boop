import { Piece, isPieceElement } from "./piece";

export class Cell {
    element: Element;

    constructor(element: Element) {
        this.element = element;
    }

    get piece(): Piece | null {
        for (const childElement of this.element.children) {
            if (isPieceElement(childElement)) {
                return new Piece(childElement);
            }
        }

        return null;
    }

    set piece(piece: Piece | null) {
        if (piece) {
            this.element.appendChild(piece.element);
        } else {
            if (this.piece) {
                this.element.removeChild(this.piece.element);
            }
        }
    }

    get center(): DOMPoint {
        const { x, y, width, height } = this.element.getBoundingClientRect();
        return new DOMPoint(x + width / 2, y + height / 2);
    }
}
