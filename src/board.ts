import { addDrawable } from "./drawable";
import { createEntity } from "./entity"
import { addPositionable } from "./positionable";

const createBoardSquare = (i: number, j: number) => {
    const boardSquare = createEntity();

    const path = new Path2D();
    path.rect(0, 0, 66, 66);
    const fillStyle = i % 2 == j % 2 ? "navy" : "blue";
    addDrawable(boardSquare, {
        path,
        fillStyle,
    });

    const position: [number, number] = [
        300 + (i - 3) * 67,
        400 + (j - 3) * 67
    ];
    addPositionable(boardSquare, { position });
}

export const createBoard = () => {
    for (let i = 0; i < 6; ++i) {
        for (let j = 0; j < 6; ++j) {
            createBoardSquare(i, j);
        }
    }
}
