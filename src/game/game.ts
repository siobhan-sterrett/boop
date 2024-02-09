import { GraduationCandidate, Move, Turn } from "./move";
import { Piece, PieceOwner } from "./piece"

export type BoardCoordinate = {
    r: number;
    c: number;
}

export type Cell = {
    piece: Piece | null;
}

export type Board = Cell[][];

export function initialBoard(): Board {
    return [...Array(6).keys()].map(() =>
        [...Array(6).keys()].map(() => ({ piece: null }))
    );
}

export type Hand = {
    kitten: number;
    cat: number;
};

export function initialHand(): Hand {
    return {
        kitten: 8,
        cat: 0
    }
}

export type Game = {
    hands: {
        [O in PieceOwner]: Hand;
    };
    board: Board;
};

export function newGame(): Game {
    return {
        hands: {
            player: initialHand(),
            opponent: initialHand(),
        },
        board: initialBoard(),
    }
}

export type Boop = {
    from: BoardCoordinate,
    to?: BoardCoordinate,
}

export function doMove(game: Game, move: Move) {
    const { hands, board } = game;
    const { kind, place: { r, c } } = move;

    if (hands.player[kind]) {
        const cell = board[r]?.[c];
        if (cell) {
            if (cell.piece == null) {
                hands.player[kind] -= 1;
                cell.piece = {
                    kind,
                    owner: 'player',
                };
            } else {
                throw new Error(`Cannot place: board cell at { r: ${r}, c: ${c} } is occupied`);
            }
        } else {
            throw new Error(`Cannot place: board coordinate { r: ${r}, c: ${c} } is out of range`);
        }
    } else {
        throw new Error(`Cannot place: player's hand contains no ${kind}s`);
    }
}

export async function doBoops(game: Game, move: Move, onBoops: (boops: Boop[]) => Promise<void>) {
    const { hands, board } = game;
    const { kind, place: { r, c } } = move;

    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ]

    const boops: Boop[] = [];
    for (const [dr, dc] of vectors) {
        const neighbor = board[r + dr]?.[c + dc];
        if (neighbor && neighbor.piece) {
            if (!(kind == 'kitten' && neighbor.piece.kind == 'cat')) {
                const target = board[r + 2 * dr]?.[c + 2 * dc];
                if (target) {
                    if (target.piece == null) {
                        boops.push({
                            from: { r: r + dr, c: c + dc },
                            to: { r: r + 2 * dr, c: c + 2 * dc },
                        });
                        const piece = neighbor.piece;
                        neighbor.piece = null;
                        target.piece = piece;
                    }
                } else {
                    boops.push({
                        from: { r: r + dr, c: c + dc },
                        to: undefined
                    });
                    const piece = neighbor.piece;
                    neighbor.piece = null;
                    hands[piece.owner][piece.kind] += 1;
                }
            }
        }
    };

    return onBoops(boops);
}

export async function doGraduate(game: Game, chooseCandidate: (candidates: GraduationCandidate[]) => Promise<GraduationCandidate>): Promise<GraduationCandidate | undefined> {
    const { hands, board } = game;

    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1]
    ]

    const candidates: GraduationCandidate[] = [];
    board.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.piece?.owner == 'player') {
            for (const [dr, dc] of vectors) {
                const left = board[r + dr]?.[c + dc];
                const right = board[r - dr]?.[c - dc];

                if (left?.piece?.owner == 'player' && right?.piece?.owner == 'player') {
                    const kinds = [left, cell, right].map((cell) => cell.piece?.kind);
                    if (!kinds.some((kind) => kind == 'kitten')) {
                        candidates.push([
                            { r: r + dr, c: c + dc },
                            { r, c },
                            { r: r - dr, c: c - dc },
                        ]);
                    }
                }
            }
        }
    }));

    if (candidates.length != 0) {
        const graduate = await chooseCandidate(candidates);
        if (
            candidates.find((candidate) =>
                candidate.every(({ r, c }, i) =>
                    graduate[i].r == r && graduate[i].c == c
                )
            )
        ) {
            for (const { r, c } of graduate) {
                board[r][c].piece = null;
                hands.player.cat += 1;
            }

            return graduate;
        } else {
            throw new Error('Cannot graduate: invalid choice');
        }
    }
}

export async function doRetrieve(game: Game, chooseRetrieve: (retrieves: BoardCoordinate[]) => Promise<BoardCoordinate>): Promise<BoardCoordinate | undefined> {
    const { hands, board } = game;

    const retrieves: BoardCoordinate[] = [];
    board.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.piece?.owner == 'player') {
            retrieves.push({ r, c });
        }
    }));

    if (retrieves.length != 0) {
        const retrieve = await chooseRetrieve(retrieves);
        if (retrieves.find(({ r, c }) => retrieve.r == r && retrieve.c == c)) {
            const cell = board[retrieve.r][retrieve.c];
            const piece = cell.piece!;
            cell.piece = null;
            hands.player[piece.kind] += 1;

            return retrieve;
        } else {
            throw new Error('Cannot retrieve: invalid choice');
        }
    }
}

export async function makeMove(
    game: Game,
    move: Move,
    onBoops: (boops: Boop[]) => Promise<void>,
    chooseGraduate: (candidates: GraduationCandidate[]) => Promise<GraduationCandidate>,
    chooseRetrieve: (retrieves: BoardCoordinate[]) => Promise<BoardCoordinate>
): Promise<Turn> {
    doMove(game, move);
    await doBoops(game, move, onBoops);
    const graduate = await doGraduate(game, chooseGraduate);
    const retrieve = await doRetrieve(game, chooseRetrieve);

    return {
        ...move,
        graduate,
        retrieve,
    };
}

export function makeTurn(
    game: Game,
    turn: Turn,
) {
    makeMove(game, turn, async () => { }, async () => turn.graduate!, async () => turn.retrieve!);
}

export function playerWins(game: Game): boolean {
    const { board } = game;
    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1]
    ]

    board.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.piece?.owner == 'player') {
            for (const [dr, dc] of vectors) {
                const left = board[r + dr]?.[c + dc];
                const right = board[r - dr]?.[c - dc];

                if (left?.piece?.owner == 'player' && right?.piece?.owner == 'player') {
                    const kinds = [left, cell, right].map((cell) => cell.piece?.kind);
                    if (!kinds.every((kind) => kind == 'cat')) {
                        return true;
                    }
                }
            }
        }
    }));

    return false;
}

export function swapPlayers(game: Game) {
    const { hands, board } = game;

    const playerHand = hands.player;
    hands.player = hands.opponent;
    hands.opponent = playerHand;

    for (const row of board) {
        for (const cell of row) {
            if (cell.piece) {
                cell.piece.owner = cell.piece.owner == 'player' ? 'opponent' : 'player';
            }
        }
    }
}
