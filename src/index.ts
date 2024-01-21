import { createBoard } from "./board";
import { addDraggable } from "./draggable";
import { addDrawable, drawAll } from "./drawable";
import { getDropPosition, getDropTarget } from "./dropTarget";
import { createEntity } from "./entity";
import { addMoveable, moveAll } from "./moveable";
import { addPositionable } from "./positionable";

createBoard();

const piece = createEntity();

addDrawable(piece, (() => {
    const path = new Path2D();
    path.ellipse(0, 0, 15, 15, 0, 0, 2 * Math.PI);

    return {
        path,
        fillStyle: "orange"
    }
})());

addPositionable(piece, {
    position: [100, 700]
});

addDraggable(piece, {
    onDrop: ([offsetX, offsetY]) => {
        const dropTarget = getDropTarget([offsetX, offsetY]);
        if (dropTarget) {
            const dropPosition = getDropPosition(dropTarget)!;
            addMoveable(piece, {
                speed: 10,
                target: dropPosition
            })
        } else {
            addMoveable(piece, {
                speed: 10,
                target: [100, 700]
            })
        }
    }
});

const update_loop = () => {
    window.requestAnimationFrame(update_loop);

    moveAll();
    drawAll();
}

window.requestAnimationFrame(update_loop);
