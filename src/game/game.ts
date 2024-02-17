import { Board, BoardCoordinate, Cell } from './board';
import { Boop, GameEvent, boopEq } from './event';
import { Hand } from './hand';
import { PieceOwner } from './piece';

export type Triplet = [BoardCoordinate, BoardCoordinate, BoardCoordinate];

export type GameState<TCell extends Cell, THand extends Hand> = {
    turn: PieceOwner;
    board: Board<TCell>;
    hands: {
        player: THand;
        opponent: THand;
    }
};

export type Game<TCell extends Cell, THand extends Hand> = {
    history: GameEvent[];
    get state(): GameState<TCell, THand>;
}

export function newGame<TCell extends Cell, THand extends Hand>(turn: PieceOwner, Cell: new () => TCell, Hand: new (owner: PieceOwner) => THand): Game<TCell, THand> {
    const board = new Board(Cell);
    const hands = {
        player: new Hand('player'),
        opponent: new Hand('opponent'),
    };

    return {
        history: [{
            eventKind: 'begin-turn',
            turn,
        }],
        get state(): GameState<TCell, THand> {
            return { turn, board, hands };
        }
    };
}

export function* getTriplets<TCell extends Cell, THand extends Hand>(state: GameState<TCell, THand>): Generator<Triplet> {
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

export function isWinningTriplet<TCell extends Cell>(board: Board<TCell>, triplet: Triplet): boolean {
    return triplet.every((coordinate) => board.get(coordinate)?.piece?.kind == 'cat');
}

export function isWinningState<TCell extends Cell, THand extends Hand>(state: GameState<TCell, THand>): boolean {
    return Array.from(getTriplets(state)).some((triplet) => isWinningTriplet(state.board, triplet)) ||
        Array.from(state.board.values()).filter((cell) => cell.piece?.kind == 'cat').length == 8;
}

export function tripletEq(a: Triplet, b: Triplet): boolean {
    return a[1] == b[1] && (
        a[0] == b[0] && a[2] == b[2]
    ) || (
            a[0] == b[2] && a[2] == b[0]
        );
}

export function reduce<TCell extends Cell, THand extends Hand>(event: GameEvent, game: Game<TCell, THand>): Game<TCell, THand> {
    const { history, state } = game;

    if (isLegal(event, game)) {
        return {
            history: history.concat(event),
            get state(): GameState<TCell, THand> {
                return reduceState(event, state);
            }
        }
    } else {
        return game;
    }
}

export function reduceState<TCell extends Cell, THand extends Hand>(event: GameEvent, state: GameState<TCell, THand>): GameState<TCell, THand> {
    // Precondition: event is legal

    let { turn } = state;
    const { hands, board } = state;

    if (event.eventKind == 'begin-turn') {
        turn = event.turn;
    } else if (event.eventKind == 'place-piece') {
        const { pieceKind, target } = event;
        const cell = board.get(target)!;
        const piece = hands[turn].takePiece(pieceKind);
        cell.piece = piece;
    } else if (event.eventKind == 'boop') {
        const { boops } = event;
        for (const { origin, target } of boops) {
            const originCell = board.get(origin)!;
            const piece = originCell.piece!;
            originCell.piece = null;
            if (target) {
                const targetCell = board.get(target)!;
                targetCell.piece = piece;
            } else {
                hands[piece.owner].addPiece(piece.kind);
            }
        }
    } else if (event.eventKind == 'graduate-triplet') {
        const { triplet } = event;
        for (const place of triplet) {
            const cell = board.get(place)!;
            cell.piece = null;
            hands[turn].addPiece('cat');
        }
    } else if (event.eventKind == 'retrieve-piece') {
        const { target } = event;
        const cell = board.get(target)!;
        hands[turn].addPiece(cell.piece!.kind);
        cell.piece = null;
    }

    return {
        turn,
        hands,
        board
    };
}

export function calculateBoops<TCell extends Cell>(board: Board<TCell>, { r, c }: BoardCoordinate): Boop[] {
    const pieceKind = board.get({ r, c })!.piece!.kind;

    const boops: Boop[] = [];

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
                        boops.push({
                            origin: neighborCoordinate,
                            target: targetCoordinate,
                        });
                    }
                } else {
                    boops.push({
                        origin: neighborCoordinate
                    });
                }
            }
        }
    }

    return boops;
}

export function isLegal<TCell extends Cell, THand extends Hand>(event: GameEvent, game: Game<TCell, THand>): boolean {
    const { history, state } = game;

    const previousEvent = history.at(-1);
    if (!previousEvent) {
        return event.eventKind == 'begin-turn';
    }

    if (previousEvent.eventKind == 'begin-turn') {
        const { turn } = previousEvent;
        if (event.eventKind == 'place-piece') {
            const { pieceKind, target } = event;

            if (state.hands[turn].hasPiece(pieceKind)) {
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
        if (event.eventKind == 'boop') {
            const { boops } = event;
            const calculatedBoops = calculateBoops(state.board, previousEvent.target);

            if (boops.every((boop) => calculatedBoops.find((calculatedBoop) => boopEq(boop, calculatedBoop)))) {
                if (calculatedBoops.every((calculatedBoop) => boops.find((boop) => boopEq(calculatedBoop, boop)))) {
                    return true;
                } else {
                    // Missing boop
                }
            } else {
                // Extra boop
            }
        } else {
            // Must boop after placing a piece
        }
    }

    if (previousEvent.eventKind == 'boop') {
        const triplets = Array.from(getTriplets(state));

        const gameOver = triplets.some((triplet) => isWinningTriplet(state.board, triplet));

        if (gameOver) {
            // Any event is illegal
        } else {
            const canGraduate = (triplets.length != 0);
            const canRetrieve = state.hands[state.turn].hasPiece();

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
