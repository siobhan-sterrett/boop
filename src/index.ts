import { createCells } from "./cell";
import { drawAll } from "./drawable";
import { initializeInteractions } from "./interactions";
import { moveAll } from "./moveable";
import { createHand } from "./piece";

createCells();
createHand('orange', 'player');
createHand('gray', 'opponent');
initializeInteractions();

const update_loop = () => {
    window.requestAnimationFrame(update_loop);

    moveAll();
    drawAll();
}

window.requestAnimationFrame(update_loop);
