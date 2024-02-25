import { PIECE_KINDS, PIECE_OWNERS, PieceKind, PieceOwner } from "../rules";

type PieceElement = HTMLElement & {
    dataset: {
        kind: PieceKind;
        owner: PieceOwner;
    }
}

export function isPieceElement(element: Element): element is PieceElement {
    if (element instanceof HTMLElement) {
        const { kind, owner } = element.dataset;

        if (kind && owner) {
            return (PIECE_KINDS as readonly (string)[]).includes(kind) &&
                (PIECE_OWNERS as readonly (string)[]).includes(owner);
        }
    }

    return false;
}

export class Piece {
    element: PieceElement;

    constructor(element: PieceElement) {
        this.element = element;
    }

    get kind(): PieceKind {
        return this.element.dataset.kind;
    }

    get owner(): PieceOwner {
        return this.element.dataset.owner;
    }

    graduate() {
        this.element.dataset.kind = 'cat';
    }
}
