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

    set piece(piece: Piece) {
        this.element.appendChild(piece.element);
    }
}
