import { CellCoordinate, CellMap } from './cell_map';
import { Cell } from './cell';
import { PieceOwner } from './piece';

export class Hand extends CellMap {
    constructor(owner: PieceOwner) {
        const coordinates: CellCoordinate[] = [];
        for (let r = 0; r < 4; ++r) {
            for (let c = 0; c < 2; ++c) {
                coordinates.push({ r, c });
            }
        }

        super(coordinates.map(({ r, c }) => {
            const dr = r - 2;
            const baseline = owner == 'player' ? 4.5 : -7.0;
            const rect = new DOMRect(
                1.5 * dr,
                baseline + 1.25 * c,
                1.5,
                1.25);
            return [{ r, c }, new Cell(rect)];
        }));
    }

    isEmpty(): boolean {
        return Array.from(this.values()).every((cell) => cell.isEmpty());
    }
}
