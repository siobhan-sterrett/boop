import { Piece } from './piece';

export type BoardCoordinate = { r: number, c: number };

export type Cell = {
    piece: Piece | null
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

export class Board implements ReadonlyMap<BoardCoordinate, Cell> {
    #entries: Map<number, [BoardCoordinate, Cell]> = new Map();

    constructor() {
        for (let r = 0; r < 6; ++r) {
            for (let c = 0; c < 6; ++c) {
                const coordinate = { r, c };
                const cell = { piece: null };
                this.#entries.set(Board.#hash(coordinate), [coordinate, cell]);
            }
        }
    }

    static #hash({ r, c }: BoardCoordinate): number {
        return r * 8 + c;
    }

    forEach(callbackFn: (value: Cell, key: BoardCoordinate, map: ReadonlyMap<BoardCoordinate, Cell>) => void) {
        this.#entries.forEach(([key, value]) => {
            callbackFn(value, key, this)
        })
    }

    get(key: BoardCoordinate): Cell | undefined {
        return this.#entries.get(Board.#hash(key))?.[1];
    }

    has(key: BoardCoordinate): boolean {
        return this.#entries.has(Board.#hash(key));
    }

    get size() {
        return this.#entries.size;
    }

    [Symbol.iterator](): IterableIterator<[BoardCoordinate, Cell]> {
        return this.entries();
    }

    entries(): IterableIterator<[BoardCoordinate, Cell]> {
        return this.#entries.values();
    }

    keys(): IterableIterator<BoardCoordinate> {
        return iterMap(this.entries(), ([key, _]) => key);
    }

    values(): IterableIterator<Cell> {
        return iterMap(this.entries(), ([_, value]) => value);
    }
}
