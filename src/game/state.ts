import { Board, BoardCoordinate, Boop, Hand, Move, PieceOwner, Triplet } from "./types";

export class GameState {
    hands: {
        [O in PieceOwner]: Hand;
    }
    board: Board;

    constructor(...args: [] | [GameState]) {
        const [state] = args;

        if (state) {
            this.hands = {
                player: { ...state.hands.player },
                opponent: { ...state.hands.opponent },
            };
            this.board = state.board.map((row) =>
                row.map((cell) => cell.piece ? { piece: { ...cell.piece } } : { piece: null })
            );
        } else {
            this.hands = {
                player: { kitten: 8, cat: 0 },
                opponent: { kitten: 8, cat: 8 },
            };
            this.board = [...Array(6).keys()].map(() =>
                [...Array(6).keys()].map(() => ({ piece: null }))
            );
        }
    }

    placePiece(move: Move): Boop[] {
        const { hands, board } = this;
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

        return boops;
    }

    graduationCandidates(): Triplet[] {
        const { board } = this;

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

        return candidates;
    }

    graduateTriplet(triplet: Triplet) {
        const { hands, board } = this;

        if (
            this.graduationCandidates().find((candidate) =>
                candidate.every(({ r, c }, i) =>
                    triplet[i].r == r && triplet[i].c == c
                )
            )
        ) {
            for (const { r, c } of triplet) {
                board[r][c].piece = null;
                hands.player.cat += 1;
            }
        } else {
            throw new Error('Cannot graduate: invalid choice');
        }
    }

    retrievalCandidates(): BoardCoordinate[] {
        const { board } = this;

        const candidates: BoardCoordinate[] = [];
        board.forEach((row, r) => row.forEach((cell, c) => {
            if (cell.piece?.owner == 'player') {
                candidates.push({ r, c });
            }
        }));

        if (candidates.length == 8) {
            return candidates;
        } else {
            return [];
        }
    }

    retrievePiece(place: BoardCoordinate) {
        const { hands, board } = this;
        if (this.retrievalCandidates().find(({ r, c }) => place.r == r && place.c == c)) {
            const cell = board[place.r][place.c];
            const piece = cell.piece!;
            cell.piece = null;
            hands.player[piece.kind] += 1;
        } else {
            throw new Error('Cannot retrieve: invalid choice');
        }
    }

    winningTriplet(): Triplet | undefined {
        const { board } = this;
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

    swapPlayers() {
        this.hands = {
            player: { ...this.hands.opponent },
            opponent: { ...this.hands.player },
        };

        this.board.forEach((row) =>
            row.forEach((cell) => {
                if (cell.piece) {
                    cell.piece.owner = cell.piece.owner == 'player' ? 'opponent' : 'player';
                }
            })
        )
    }
}
