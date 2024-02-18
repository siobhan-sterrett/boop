import { CellCoordinate, CellMap } from './cell_map';
import { Cell } from "./cell";
import { Theme } from './theme';

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
}
