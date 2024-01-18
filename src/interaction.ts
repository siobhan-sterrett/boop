import { Piece, pieces } from "./pieces";

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d');

let selectedPiece: Piece | undefined = undefined;

export const initialize_interaction = () => {
    canvas.addEventListener("mousedown", (event) => {
        selectedPiece = undefined;

        pieces.forEach((piece) => {
            if (ctx.isPointInPath(piece.getPath(), event.offsetX, event.offsetY)) {
                selectedPiece = piece;
            }
        })
    })

    canvas.addEventListener("mousemove", (event) => {
        if (selectedPiece) {
            selectedPiece.moveTo([event.offsetX, event.offsetY]);
        }
    })

    canvas.addEventListener("mouseup", () => {
        selectedPiece = undefined;
    })
}
