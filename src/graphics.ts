import { pieces } from "./pieces";

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

export const draw_pieces = () => {
    ctx.clearRect(0, 0, 600, 800);

    pieces.forEach((piece) => {
        ctx.beginPath();
        ctx.fill(piece.getPath());
    });
}
