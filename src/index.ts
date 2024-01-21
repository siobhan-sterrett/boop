import { createBoard } from "./board";
import { drawAll } from "./drawable";
import { initializeInteractions } from "./interactions";
import { moveAll } from "./moveable";
import { createPiece } from "./piece";

createBoard();
createPiece('cat', 'orange');
initializeInteractions();

const update_loop = () => {
    window.requestAnimationFrame(update_loop);

    moveAll();
    drawAll();
}

window.requestAnimationFrame(update_loop);
