export const PIECE_KINDS = ['kitten', 'cat'] as const;
export type PieceKind = typeof PIECE_KINDS[number];
export const PIECE_OWNERS = ['player', 'opponent'] as const;
export type PieceOwner = typeof PIECE_OWNERS[number];

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

    get center(): DOMPoint {
        const { x, y, width, height } = this.element.getBoundingClientRect();
        return new DOMPoint(x + width / 2, y + height / 2);
    }

    graduate() {
        this.element.dataset.kind = 'cat';
    }
}
