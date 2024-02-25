import { Piece, isPieceElement } from "./piece";

export class Hand {
    element: Element;

    constructor(element: Element) {
        this.element = element;
    }

    *pieces(): Generator<Piece> {
        for (const childElement of this.element.children) {
            if (isPieceElement(childElement)) {
                yield new Piece(childElement);
            }
        }
    }

    isEmpty(): boolean {
        return this.element.childElementCount == 0;
    }
}

export const playerHand = (() => {
    const element = document.getElementById('player-hand');
    if (element) {
        return new Hand(element);
    } else {
        throw new Error('Player hand not found');
    }
})();


export const opponentHand = (() => {
    const element = document.getElementById('opponent-hand');
    if (element) {
        return new Hand(element);
    } else {
        throw new Error('Opponent hand not found');
    }
})();
