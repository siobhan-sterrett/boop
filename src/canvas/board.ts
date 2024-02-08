/**
 * A Board contains a two-dimensional (6x6) array of cells.
 */

import { Cell } from "./cell";

export class Board {
    rect: DOMRect;
    cells: Cell[][] = [];

    constructor(rect: DOMRect) {
        this.rect = rect;

        for (let r = 0; r < 6; ++r) {
            const row: Cell[] = [];
            for (let c = 0; c < 6; ++c) {
                const x = r - this.rect.width / 2;
                const y = c - this.rect.height / 2;
                row.push(new Cell(new DOMRect(x, y, 1, 1)));
            }
            this.cells.push(row);
        }
    }
}
