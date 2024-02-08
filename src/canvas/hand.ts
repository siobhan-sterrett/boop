/**
 * A Hand is a collection of HandCells which hold either the player's
 * pieces, or the opponent's pieces, when they are not on the board or
 * being moved by player interaction or animation.
 */

import { PieceOwner } from "../game/piece";
import { Cell } from "./cell";

export class Hand {
    rect: DOMRect;
    owner: PieceOwner;
    cells: Cell[] = [];

    constructor(rect: DOMRect, owner: PieceOwner) {
        this.rect = rect;
        this.owner = owner;

        const cellWidth = rect.width / 4;
        const cellHeight = rect.height / 2;
        for (let i = 0; i < 4; ++i) {
            for (let j = 0; j < 2; ++j) {
                this.cells.push(new Cell(new DOMRect(
                    this.rect.x + i * cellWidth,
                    this.rect.y + j * cellHeight,
                    cellWidth, cellHeight
                )));
            }
        }
    }
}
