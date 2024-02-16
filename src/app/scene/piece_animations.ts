import { Cell } from "./cell";
import { Piece } from "./piece";

const PIECE_SPEED = 0.1;

type Animation = {
    target: Cell;
    resolve: () => void;
}

export class PieceAnimations {
    #targets: Map<Piece, Animation> = new Map();

    updateAll() {
        for (const [piece, { target, resolve }] of this.#targets) {
            const dx = target.center.x - piece.center.x;
            const dy = target.center.y - piece.center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < PIECE_SPEED) {
                target.piece = piece;
                this.#targets.delete(piece);
                resolve();
            } else {
                piece.center.x += dx * PIECE_SPEED / distance;
                piece.center.y += dy * PIECE_SPEED / distance;
            }
        }
    }

    moveTo(piece: Piece, target: Cell): Promise<void> {
        return new Promise((resolve) => {
            this.#targets.set(piece, { target, resolve });
        })
    }
}
