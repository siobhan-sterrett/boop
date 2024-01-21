//import { initialize_interaction } from "./interaction";
//import { initialize_pieces } from "./pieces";
//import { draw_pieces } from "./graphics";

import { addDraggable } from "./draggable";
import { addDrawable, drawAll } from "./drawable";
import { createEntity } from "./entity";
import { addPositionable } from "./positionable";

//initialize_interaction();
//initialize_pieces();

const piece = createEntity();

addDrawable(piece, (() => {
    const path = new Path2D();
    path.ellipse(0, 0, 20, 20, 0, 0, 2 * Math.PI);

    return {
        path,
        fillStyle: "orange"
    }
})());

addPositionable(piece, {
    position: [300, 400]
});

addDraggable(piece);

const update_loop = () => {
    window.requestAnimationFrame(update_loop);

    drawAll();
}

window.requestAnimationFrame(update_loop);
