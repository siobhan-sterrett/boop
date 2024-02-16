import { Cell } from "./cell";
import { Theme } from "./theme";

const PIECE_KINDS = ['cat', 'kitten'] as const;
export type PieceKind = typeof PIECE_KINDS[number];

const PIECE_OWNERS = ['player', 'opponent'] as const;
export type PieceOwner = typeof PIECE_OWNERS[number];

export class Piece {
    readonly kind: PieceKind;
    readonly owner: PieceOwner;
    readonly home: Cell;
    center: DOMPoint;

    constructor(kind: PieceKind, owner: PieceOwner, home: Cell) {
        this.kind = kind;
        this.owner = owner;
        this.home = home;
    }

    get path(): Path2D {
        const path = new Path2D();
        const radius = this.kind == 'kitten' ? 0.30 : 0.45;
        path.arc(this.center.x, this.center.y, radius, 0, 2 * Math.PI);
        return path;
    }

    draw(ctx: CanvasRenderingContext2D, theme: Theme) {
        ctx.fillStyle = theme.pieces[this.owner];
        ctx.fill(this.path);
    }
}
