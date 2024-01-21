import { addDrawable } from "./drawable";
import { addDropTarget } from "./dropTarget";
import { EntityID, getNextEntityID } from "./entityID";
import { Piece, getPiece } from "./piece";
import { addPositionable } from "./positionable";

type Cell = {
    i: number;
    j: number;
    piece?: Piece;
}

const cells: Map<EntityID, Cell> = new Map();

export const addCell = (entityID: EntityID, cell: Cell) => {
    cells.set(entityID, cell);
}

export const deleteCell = (entityID: EntityID) => {
    cells.delete(entityID);
}

export const setPiece = (entityID: EntityID, piece: Piece) => {
    const cell = cells.get(entityID);
    if (cell) {
        cell.piece = piece;
        console.log(`Set piece at (${cell.i}, ${cell.j}) to`, piece);
    }
}

export const clearPiece = (entityID: EntityID) => {
    const cell = cells.get(entityID);
    if (cell) {
        delete cell.piece;
    }
}

export const createCell = (i: number, j: number) => {
    const id = getNextEntityID();

    addCell(id, { i, j });

    addDrawable(id, (() => {
        const path = new Path2D();
        path.rect(0, 0, 66, 66);

        return {
            path,
            fillStyle: i % 2 == j % 2 ? "navy" : "blue"
        }
    })());

    const position: [number, number] = [
        300 + (i - 3) * 67,
        400 + (j - 3) * 67
    ]
    addPositionable(id, { position });

    addDropTarget(id, {
        dropPosition: [
            position[0] + 33,
            position[1] + 33
        ],
        onDrop: (dropped: EntityID) => {
            const piece = getPiece(dropped);
            setPiece(id, piece);
        }
    })
}

export const createCells = () => {
    for (let i = 0; i < 6; ++i) {
        for (let j = 0; j < 6; ++j) {
            createCell(i, j);
        }
    }
}
