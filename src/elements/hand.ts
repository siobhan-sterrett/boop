import { Piece, PieceOwner, isPieceElement } from "./piece";

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

    append(piece: Piece) {
        this.element.appendChild(piece.element);
    }

    remove(piece: Piece) {
        this.element.removeChild(piece.element);
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

export function hand(owner: PieceOwner): Hand {
    if (owner == 'player') {
        return playerHand;
    } else {
        return opponentHand;
    }
}
