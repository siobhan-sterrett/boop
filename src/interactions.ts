import { startDrag, doDrag, endDrag } from "./draggable";

const onMouseDown = (event: MouseEvent) => {
    startDrag(event);
};

const onMouseMove = (event: MouseEvent) => {
    doDrag(event);
}

const onMouseUp = (event: MouseEvent) => {
    endDrag(event);
}

const onMouseEnter = (event: MouseEvent) => {
    if (!(event.buttons & 1)) {
        endDrag(event);
    }
}

const onMouseLeave = (event: MouseEvent) => { }

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

export const initializeInteractions = () => {
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseenter', onMouseEnter);
    canvas.addEventListener('mouseleave', onMouseLeave);
}
