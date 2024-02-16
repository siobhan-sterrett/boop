import { CellCoordinate, CellMap } from './cell_map';
import { Cell } from './cell';

export class Gutter extends CellMap {
    constructor() {
        const coordinates: CellCoordinate[] = [];

        for (let c = 0; c < 8; ++c) {
            coordinates.push({ r: 0, c });
        }

        for (let r = 1; r < 7; ++r) {
            coordinates.push({ r, c: 0 });
            coordinates.push({ r, c: 7 });
        }

        for (let c = 0; c < 8; ++c) {
            coordinates.push({ r: 7, c });
        }

        super(coordinates.map(({ r, c }) => {
            const dr = r - 4;
            const dc = c - 4;
            return [{ r, c }, new Cell(new DOMRect(dr, dc, 1, 1))];
        }));
    }
}
