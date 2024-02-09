import { CanvasCoordinate } from "./canvas_coordinate";
import { Cell } from "./cell";
import { Piece } from "./piece"

type Animation = {
    speed: number;
    target: CanvasCoordinate;
    resolve: (piece: Piece | PromiseLike<Piece>) => void;
}

export class Animations {
    animations: Map<Piece, Animation> = new Map();

    animatePiece(piece: Piece, target: CanvasCoordinate): Promise<Piece> {
        return new Promise((resolve) => {
            this.animations.set(piece, {
                speed: 0.2,
                target,
                resolve,
            });
        });
    }

    update() {
        for (const [piece, { speed, target, resolve }] of this.animations) {
            if (piece.place instanceof Cell) {
                this.animations.delete(piece);
            } else {
                const { x, y } = piece.place;
                const dx = target.x - x;
                const dy = target.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance > speed) {
                    piece.place.x += dx * speed / distance;
                    piece.place.y += dy * speed / distance;
                } else {
                    piece.setPlace(target);
                    resolve(piece);
                    this.animations.delete(piece);
                }
            }
        }
    }
}
