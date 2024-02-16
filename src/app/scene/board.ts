import { CellCoordinate, CellMap, CoordinateAndCell } from './cell_map';
import { Cell } from "./cell";
import { Theme } from './theme';
import { PieceOwner } from './piece';

export type Triplet = [
    CoordinateAndCell,
    CoordinateAndCell,
    CoordinateAndCell
];

export class Board extends CellMap {
    constructor() {
        const coordinates: CellCoordinate[] = [];

        for (let r = 1; r <= 6; ++r) {
            for (let c = 1; c <= 6; ++c) {
                coordinates.push({ r, c });
            }
        }

        super(coordinates.map(({ r, c }) => {
            const dr = r - 4;
            const dc = c - 4;
            return [{ r, c }, new Cell(new DOMRect(dr, dc, 1, 1))]
        }));
    }

    draw(ctx: CanvasRenderingContext2D, theme: Theme) {
        for (const [{ r, c }, cell] of this) {
            const color = (r % 2 == c % 2) ? theme.board[0] : theme.board[1];
            ctx.fillStyle = color;
            ctx.fillRect(cell.rect.x, cell.rect.y, cell.rect.width, cell.rect.height);
        }
    }

    *triplets(owner: PieceOwner): Generator<Triplet> {
        for (const [{ r, c }, cell] of this) {
            if (cell.piece?.owner == owner) {
                for (const [dr, dc] of [
                    [0, 1], [1, 1], [1, 0], [1, -1]
                ]) {
                    const leftCoordinate = { r: r + dr, c: c + dc };
                    const left = this.get(leftCoordinate);
                    const rightCoordinate = { r: r - dr, c: c - dc };
                    const right = this.get(rightCoordinate);

                    if (left?.piece?.owner == owner && right?.piece?.owner == owner) {
                        yield [
                            [leftCoordinate, left],
                            [{ r, c }, cell],
                            [rightCoordinate, right]
                        ];
                    }
                }
            }
        }
    }
}
