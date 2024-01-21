import { addDrawable } from "./drawable";
import { addDropTarget, removeDropTarget } from "./dropTarget";
import { EntityID, getNextEntityID } from "./entityID";
import { Piece } from "./piece";
import { addPositionable, getPosition } from "./positionable";

type Cell = {
    i: number;
    j: number;
    piece?: Piece;
}

const cells: Map<EntityID, Cell> = new Map();

const addCell = (entityID: EntityID, cell: Cell) => {
    cells.set(entityID, cell);
}

export const setPiece = (entityID: EntityID, piece: Piece) => {
    const cell = cells.get(entityID);
    if (cell) {
        cell.piece = piece;
        console.log(`Set piece at (${cell.i}, ${cell.j}) to`, piece);
        removeDropTarget(entityID);
    }
}

export const clearPiece = (entityID: EntityID) => {
    const cell = cells.get(entityID);
    if (cell) {
        delete cell.piece;
        addDropTarget(entityID, {
            dropPosition: dropPosition(entityID),
        });
    }
}

const dropPosition = (entityID: EntityID): [number, number] | undefined => {
    const position = getPosition(entityID);
    if (position) {
        const [x, y] = position;
        return [
            x + 33,
            y + 33
        ]
    }

    return undefined;
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
    })
}

export const createCells = () => {
    for (let i = 0; i < 6; ++i) {
        for (let j = 0; j < 6; ++j) {
            createCell(i, j);
        }
    }
}
