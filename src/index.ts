import { initialize_interaction } from "./interaction";
import { initialize_pieces } from "./pieces";
import { draw_pieces } from "./graphics";

initialize_interaction();
initialize_pieces();

const update_loop = () => {
    draw_pieces();

    window.requestAnimationFrame(update_loop);
}

window.requestAnimationFrame(update_loop);
