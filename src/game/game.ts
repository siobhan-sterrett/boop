import {
    BoardCoordinate,
    Boop,
    GameState,
    Triplet,
} from './types';

import { Player } from '../player';

function deepCopyGameState(state: GameState): GameState {
    const board = state.board.map((row) =>
        row.map((cell) => cell.piece ? { piece: { ...cell.piece } } : { piece: null })
    );

    return {
        hands: {
            player: { ...state.hands.player },
            opponent: { ...state.hands.opponent },
        },
        board,
    }
}

export class Game {
    state: GameState;
    player: Player;
    opponent: Player;

    constructor(players: [Player, Player]) {
        this.player = players[0];
        this.opponent = players[1];
        this.#initializeGameState();
    }

    #initializeGameState() {
        const board = [...Array(6).keys()].map(() =>
            [...Array(6).keys()].map(() => ({ piece: null }))
        );

        this.state = {
            hands: {
                player: { kitten: 8, cat: 0 },
                opponent: { kitten: 8, cat: 0 },
            },
            board,
        }
    }

    async #makeMove() {
        const { hands, board } = this.state;
        const { kind, place: { r, c } } = await this.player.getMove(deepCopyGameState(this.state));

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

        await this.player.onBoops(boops);
    }

    async #doGraduate() {
        const { hands, board } = this.state;

        const vectors: [number, number][] = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1]
        ]

        const candidates: Triplet[] = [];
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
            const graduate = await this.player.getCandidate(candidates);
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

    async #doRetrieve() {
        const { hands, board } = this.state;

        const retrieves: BoardCoordinate[] = [];
        board.forEach((row, r) => row.forEach((cell, c) => {
            if (cell.piece?.owner == 'player') {
                retrieves.push({ r, c });
            }
        }));

        if (retrieves.length != 0) {
            const retrieve = await this.player.getRetrieve(retrieves);
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

    #winningTriplet(): Triplet | undefined {
        const { board } = this.state;
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
                            return [
                                { r: r + dr, c: c + dc },
                                { r, c },
                                { r: r - dr, c: c - dc },
                            ];
                        }
                    }
                }
            }
        }));

        return undefined;
    }

    #swapPlayers() {
        const previousPlayer = this.player;
        this.player = this.opponent;
        this.opponent = previousPlayer;

        this.state.hands = {
            player: { ...this.state.hands.opponent },
            opponent: { ...this.state.hands.player },
        };

        this.state.board.forEach((row) =>
            row.forEach((cell) => {
                if (cell.piece) {
                    cell.piece.owner = cell.piece.owner == 'player' ? 'opponent' : 'player';
                }
            })
        )
    }

    async run() {
        await this.#makeMove();
        await this.#doGraduate();
        await this.#doRetrieve();

        const win = this.#winningTriplet();
        if (win) {
            this.player.onWin(win);
        } else {
            this.#swapPlayers();
            setTimeout(() => this.run());
        }
    }
}
