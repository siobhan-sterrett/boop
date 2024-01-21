import { addDrawable } from "./drawable";
import { addDropTarget } from "./dropTarget";
import { getNextEntityID } from "./entityID"
import { addPositionable } from "./positionable";

const createBoardSquare = (i: number, j: number) => {
    const id = getNextEntityID();

    const path = new Path2D();
    path.rect(0, 0, 66, 66);
    const fillStyle = i % 2 == j % 2 ? "navy" : "blue";
    addDrawable(id, {
        path,
        fillStyle,
    });

    const position: [number, number] = [
        300 + (i - 3) * 67,
        400 + (j - 3) * 67
    ];
    addPositionable(id, { position });

    const dropPosition: [number, number] = [
        position[0] + 33,
        position[1] + 33
    ];
    addDropTarget(id, {
        dropPosition
    });
}

export const createBoard = () => {
    for (let i = 0; i < 6; ++i) {
        for (let j = 0; j < 6; ++j) {
            createBoardSquare(i, j);
        }
    }
}
