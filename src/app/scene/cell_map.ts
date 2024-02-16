import { Cell } from "./cell";

export type CellCoordinate = {
    r: number;
    c: number;
}

export type CoordinateAndCell = [CellCoordinate, Cell];

function iterMap<T, U>(iterator: Iterator<T>, yieldFn: (value: T) => U): IterableIterator<U> {
    const map = {
        [Symbol.iterator]() { return map; },
        next() {
            const { done, value } = iterator.next();
            if (done) {
                return { done, value };
            }
            return { done, value: yieldFn(value) };
        }
    };
    return map;
}

export class CellMap implements ReadonlyMap<CellCoordinate, Cell> {
    #entries: ReadonlyMap<number, CoordinateAndCell> = new Map();

    static #toKey({ r, c }: CellCoordinate) {
        return r * 8 + c;
    }

    constructor(iterable: Iterable<CoordinateAndCell>) {
        this.#entries = new Map(iterMap(iterable[Symbol.iterator](), ([coordinate, cell]) => {
            const key = CellMap.#toKey(coordinate);
            return [key, [coordinate, cell]];
        }));
    }

    forEach(callbackFn: (cell: Cell, key: CellCoordinate, map: ReadonlyMap<CellCoordinate, Cell>) => void, thisArg?: any) {
        this.#entries.forEach(([coordinate, cell], _) => {
            callbackFn(cell, coordinate, this);
        }, thisArg);
    }

    get(coordinate: CellCoordinate): Cell | undefined {
        return this.#entries.get(CellMap.#toKey(coordinate))?.[1];
    }

    has(coordinate: CellCoordinate): boolean {
        return this.#entries.has(CellMap.#toKey(coordinate));
    }

    get size(): number {
        return this.#entries.size;
    }

    [Symbol.iterator]() {
        return this.entries();
    }

    entries(): IterableIterator<CoordinateAndCell> {
        return this.#entries.values();
    }

    keys(): IterableIterator<CellCoordinate> {
        return iterMap(this.entries(), ([coordinate, _]) => coordinate);
    }

    values(): IterableIterator<Cell> {
        return iterMap(this.entries(), ([_, cell]) => cell);
    }
}
