import { Cell } from "./cell";
import { PieceOwner } from "./piece";

export type BoardCoordinate = {
    r: number;
    c: number;
}

export class Board {
    element: Element;

    constructor(element: Element) {
        this.element = element;
    }

    *[Symbol.iterator](): Generator<[BoardCoordinate, Cell]> {
        for (let r = 0; r < this.element.childElementCount; ++r) {
            const rowElement = this.element.children[r];
            for (let c = 0; c < rowElement.childElementCount; ++c) {
                const cellElement = rowElement.children[c];
                yield [{ r, c }, new Cell(cellElement)];
            }
        }
    }

    get({ r, c }: BoardCoordinate): Cell | undefined {
        const rowElement = this.element.children[r];
        const cellElement = rowElement?.children[c];
        if (cellElement) {
            return new Cell(cellElement);
        }
    }

    *triplets(owner: PieceOwner): Generator<[Cell, Cell, Cell]> {
        const vectors: [number, number][] = [[0, -1], [-1, -1], [-1, 0], [-1, 1]];

        for (const [{ r, c }, cell] of this) {
            if (cell.piece == null) {
                continue;
            }

            if (cell.piece.owner == owner) {
                for (const [dr, dc] of vectors) {
                    const leftCoordinate = { r: r + dr, c: c + dc };
                    const rightCoordinate = { r: r - dr, c: c - dc };

                    const left = this.get(leftCoordinate);
                    const right = this.get(rightCoordinate);

                    if (left?.piece?.owner == owner && right?.piece?.owner == owner) {
                        yield [left, cell, right];
                    }
                }
            }
        }
    }
}

export const board = (() => {
    const boardElement = document.getElementById('board');
    if (boardElement) {
        return new Board(boardElement);
    } else {
        throw new Error('Board not found');
    }
})();
