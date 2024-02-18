export type PieceKind = 'cat' | 'kitten';
export type PieceOwner = 'player' | 'opponent';

export interface Piece {
    get kind(): PieceKind;
    get owner(): PieceOwner;
}

export interface BoardCoordinate {
    get r(): number;
    get c(): number;
}

export interface Cell {
    get piece(): Piece | null;
}

export interface Board {
    [Symbol.iterator](): Iterator<[BoardCoordinate, Cell]>;
    get(coordinate: BoardCoordinate): Cell | undefined;
};

export interface Boop {
    get from(): BoardCoordinate;
    get to(): BoardCoordinate | undefined;
}

export function* getBoops(board: Board, originCoordinate: BoardCoordinate): Generator<Boop> {
    const { r, c } = originCoordinate;
    const origin = board.get(originCoordinate);
    const originPiece = origin?.piece;

    if (!originPiece) {
        return;
    }

    for (const [dr, dc] of [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]) {
        const neighborCoordinate = { r: r + dr, c: c + dc };
        const neighbor = board.get(neighborCoordinate);
        const neighborPiece = neighbor?.piece;

        if (neighborPiece) {
            if (!(originPiece.kind == 'kitten' && neighborPiece.kind == 'cat')) {
                const targetCoordinate = { r: r + 2 * dr, c: c + 2 * dc };
                const target = board.get(targetCoordinate);

                if (target) {
                    const targetPiece = target.piece;
                    if (!targetPiece) {
                        yield {
                            from: neighborCoordinate,
                            to: targetCoordinate
                        };
                    }
                } else {
                    yield {
                        from: neighborCoordinate,
                        to: undefined,
                    };
                }
            }
        }
    }
}

export type Triplet = [BoardCoordinate, BoardCoordinate, BoardCoordinate];

function* triplets(board: Board, owner: PieceOwner, filter: (pieces: [Piece, Piece, Piece]) => boolean): Generator<Triplet> {
    for (const [{ r, c }, cell] of board) {
        if (cell.piece?.owner == owner) {
            for (const [dr, dc] of [
                [0, 1], [1, 1], [1, 0], [1, -1]
            ]) {
                const leftCoordinate = { r: r + dr, c: c + dc };
                const left = board.get(leftCoordinate);
                const rightCoordinate = { r: r - dr, c: c - dc };
                const right = board.get(rightCoordinate);

                if (left?.piece?.owner == owner && right?.piece?.owner == owner) {
                    if (filter([left.piece, cell.piece, right.piece])) {
                        yield [
                            leftCoordinate,
                            { r, c },
                            rightCoordinate
                        ];
                    }
                }
            }
        }
    }
}

function isWinningTriplet(pieces: [Piece, Piece, Piece]): boolean {
    return pieces.every((piece) => piece.kind == 'cat');
}

export function* getGraduationCandidates(board: Board, owner: PieceOwner): Generator<Triplet> {
    return triplets(board, owner, (pieces) => !isWinningTriplet(pieces));
}

export function* getWinningTriplets(board: Board, owner: PieceOwner): Generator<Triplet> {
    return triplets(board, owner, isWinningTriplet);
}

export function* getRetrievalCandidates(board: Board, owner: PieceOwner): Generator<BoardCoordinate> {
    const coordinates = Array.from(board).filter(([_, cell]) => cell?.piece?.owner == owner).map(([coordinate, _]) => coordinate);
    if (coordinates.length == 8) {
        for (const coordinate of coordinates) {
            yield coordinate;
        }
    }
}
