import { Piece } from './piece';

export type BoardCoordinate = { r: number, c: number };

export class Cell {
    piece: Piece | null = null;
};

function iterMap<T, U>(iterator: Iterator<T>, callbackFn: (value: T) => U): IterableIterator<U> {
    const it = {
        [Symbol.iterator]() { return it; },
        next() {
            const { value, done } = iterator.next();
            if (done) {
                return { value, done };
            } else {
                return { value: callbackFn(value), done };
            }
        }
    };
    return it;
}

export class Board<TCell extends Cell> implements ReadonlyMap<BoardCoordinate, TCell> {
    #entries: Map<number, [BoardCoordinate, TCell]> = new Map();

    constructor(Cell: new () => TCell) {
        for (let r = 0; r < 6; ++r) {
            for (let c = 0; c < 6; ++c) {
                const coordinate = { r, c };
                const cell = new Cell();
                this.#entries.set(Board.#hash(coordinate), [coordinate, cell]);
            }
        }
    }

    static #hash({ r, c }: BoardCoordinate): number {
        return r * 8 + c;
    }

    forEach(callbackFn: (value: TCell, key: BoardCoordinate, map: ReadonlyMap<BoardCoordinate, TCell>) => void) {
        this.#entries.forEach(([key, value]) => {
            callbackFn(value, key, this)
        })
    }

    get(key: BoardCoordinate): TCell | undefined {
        return this.#entries.get(Board.#hash(key))?.[1];
    }

    has(key: BoardCoordinate): boolean {
        return this.#entries.has(Board.#hash(key));
    }

    get size() {
        return this.#entries.size;
    }

    [Symbol.iterator](): IterableIterator<[BoardCoordinate, TCell]> {
        return this.entries();
    }

    entries(): IterableIterator<[BoardCoordinate, TCell]> {
        return this.#entries.values();
    }

    keys(): IterableIterator<BoardCoordinate> {
        return iterMap(this.entries(), ([key, _]) => key);
    }

    values(): IterableIterator<TCell> {
        return iterMap(this.entries(), ([_, value]) => value);
    }
}
