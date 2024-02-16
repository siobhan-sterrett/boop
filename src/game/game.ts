import { Board, BoardCoordinate, Cell } from './board';
import { GameEvent } from './event';
import { PieceOwner } from './piece';

export type Triplet = [BoardCoordinate, BoardCoordinate, BoardCoordinate];

type Hand = {
    cat: number;
    kitten: number;
}

type GameState<TCell extends Cell> = {
    turn: PieceOwner;
    board: Board<TCell>;
    hands: {
        player: Hand;
        opponent: Hand;
    }
};

type Game<TCell extends Cell> = {
    history: GameEvent[];
    get state(): GameState<TCell>;
}

function newGame<TCell extends Cell>(turn: PieceOwner, Cell: new () => TCell): Game<TCell> {
    const board = new Board(Cell);
    const hands = {
        player: { kitten: 8, cat: 0 },
        opponent: { kitten: 8, cat: 0 },
    };

    return {
        history: [{
            eventKind: 'begin-turn',
            turn,
        }],
        get state(): GameState<TCell> {
            return { turn, board, hands };
        }
    };
}

function* getTriplets<TCell extends Cell>(state: GameState<TCell>): Generator<Triplet> {
    const { turn, board } = state;

    for (const [{ r, c }, cell] of board) {
        if (cell.piece?.owner == turn) {
            for (const [dr, dc] of [
                [0, 1], [1, 1], [1, 0], [1, -1]
            ]) {
                const leftCoordinate = { r: r + dr, c: c + dc };
                const left = board.get(leftCoordinate);
                const rightCoordinate = { r: r - dr, c: c - dc };
                const right = board.get(rightCoordinate);
                if (left?.piece?.owner == turn && right?.piece?.owner == turn) {
                    yield [leftCoordinate, { r, c }, rightCoordinate];
                }
            }
        }
    }
}

function isWinningTriplet<TCell extends Cell>(board: Board<TCell>, triplet: Triplet): boolean {
    return triplet.every((coordinate) => board.get(coordinate)?.piece?.kind == 'cat');
}

function isWinningState<TCell extends Cell>(state: GameState<TCell>): boolean {
    return Array.from(getTriplets(state)).some((triplet) => isWinningTriplet(state.board, triplet));
}

function tripletEq(a: Triplet, b: Triplet): boolean {
    return a[1] == b[1] && (
        a[0] == b[0] && a[2] == b[2]
    ) || (
            a[0] == b[2] && a[2] == b[0]
        );
}

function isHandEmpty(hand: Hand): boolean {
    return hand.cat == 0 && hand.kitten == 0;
}

function reduce<TCell extends Cell>(event: GameEvent, game: Game<TCell>): Game<TCell> {
    const { history, state } = game;

    if (isLegal(event, game)) {
        return {
            history: history.concat(event),
            get state(): GameState<TCell> {
                return reduceState(event, state);
            }
        }
    } else {
        return game;
    }
}

function reduceState<TCell extends Cell>(event: GameEvent, state: GameState<TCell>): GameState<TCell> {
    // Precondition: event is legal

    let { turn } = state;
    const { hands, board } = state;

    if (event.eventKind == 'begin-turn') {
        turn = event.turn;
    } else if (event.eventKind == 'place-piece') {
        const { pieceKind, target } = event;
        const cell = board.get(target)!;
        hands[turn][pieceKind] -= 1;
        cell.piece = { owner: turn, kind: pieceKind };
        boop(state, target);
    } else if (event.eventKind == 'graduate-triplet') {
        const { triplet } = event;
        for (const place of triplet) {
            const cell = board.get(place)!;
            cell.piece = null;
            hands[turn].cat += 1;
        }
    } else if (event.eventKind == 'retrieve-piece') {
        const { target } = event;
        const cell = board.get(target)!;
        hands[turn][cell.piece!.kind] += 1;
        cell.piece = null;
    }

    return {
        turn,
        hands,
        board
    };
}

function boop<TCell extends Cell>(state: GameState<TCell>, { r, c }: BoardCoordinate) {
    const { board, hands } = state;

    const pieceKind = board.get({ r, c })!.piece!.kind;

    for (const [dr, dc] of [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ]) {
        const neighborCoordinate = { r: r + dr, c: c + dc };
        const neighbor = board.get(neighborCoordinate);
        if (neighbor && neighbor.piece) {
            if (!(pieceKind == 'kitten' && neighbor.piece.kind == 'cat')) {
                const targetCoordinate = { r: r + 2 * dr, c: c + 2 * dc };
                const target = board.get(targetCoordinate);
                if (target) {
                    if (!target.piece) {
                        target.piece = neighbor.piece;
                        neighbor.piece = null;
                    }
                } else {
                    hands[neighbor.piece.owner][neighbor.piece.kind] += 1;
                    neighbor.piece = null;
                }
            }
        }
    }
}

function isLegal<TCell extends Cell>(event: GameEvent, game: Game<TCell>): boolean {
    const { history, state } = game;

    const previousEvent = history.at(-1);
    if (!previousEvent) {
        return event.eventKind == 'begin-turn';
    }

    if (previousEvent.eventKind == 'begin-turn') {
        const { turn } = previousEvent;
        if (event.eventKind == 'place-piece') {
            const { pieceKind, target } = event;

            if (state.hands[turn][pieceKind] > 0) {
                const cell = state.board.get(target);
                if (cell) {
                    if (cell.piece) {
                        // Cell is occupied
                    } else {
                        return true;
                    }
                } else {
                    // Cell does not exist
                }
            } else {
                // Hand contains no pieces of pieceKind
            }
        } else {
            // Must place piece at beginning of turn
        }
    }

    if (previousEvent.eventKind == 'place-piece') {
        const triplets = Array.from(getTriplets(state));

        const gameOver = triplets.some((triplet) => isWinningTriplet(state.board, triplet));

        if (gameOver) {
            // Any event is illegal
        } else {
            const canGraduate = (triplets.length != 0);
            const canRetrieve = isHandEmpty(state.hands[state.turn]);

            if (event.eventKind == 'graduate-triplet') {
                if (canGraduate) {
                    const { triplet } = event;
                    if (triplets.some((t) => tripletEq(t, triplet))) {
                        return true;
                    } else {
                        // Triplet is not eligible for graduation
                    }
                } else {
                    // Cannot graduate
                }
            } else if (event.eventKind == 'retrieve-piece') {
                if (canRetrieve) {
                    const { target } = event;
                    const cell = state.board.get(target);
                    if (cell) {
                        if (cell.piece) {
                            if (cell.piece.owner == state.turn) {
                                return true;
                            } else {
                                // Cannot retrieve opponent's piece
                            }
                        } else {
                            // Cell is empty
                        }
                    } else {
                        // Cell does not exist
                    }
                } else {
                    // Cannot retrieve
                }
            } else if (event.eventKind == 'begin-turn') {
                if (canGraduate || canRetrieve) {
                    // Must either graduate or retrieve if one is possible
                } else {
                    const { turn } = event;
                    if (turn == state.turn) {
                        // Cannot take two turns in a row
                    } else {
                        return true;
                    }
                }
            }
        }
    }

    if (previousEvent.eventKind == 'graduate-triplet') {
        if (event.eventKind == 'begin-turn') {
            const { turn } = event;
            if (turn == state.turn) {
                // Cannot take two turns in a row
            } else {
                return true;
            }
        } else {
            // Must end turn after graduating triplet
        }
    }

    if (previousEvent.eventKind == 'retrieve-piece') {
        if (event.eventKind == 'begin-turn') {
            const { turn } = event;
            if (turn == state.turn) {
                // Cannot take two turns in a row
            } else {
                return true;
            }
        } else {
            // Must end turn after retrieving piece
        }
    }

    return false;
}