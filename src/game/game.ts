import { BoardCoordinate } from "./board";
import { GraduateMove, Move, PlaceMove, RetrieveMove, Turn } from "./move";
import { Piece, PieceKind, PieceOwner } from "./piece"

export type BoordCoordinate = {
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

export type GameState =
    | PlacePiece
    | GraduatePieces
    | RetrievePiece
    | EndOfTurn
    ;

export type PlacePiece = {
    state: 'place-piece';
}

export type GraduatePieces = {
    state: 'graduate-pieces';
    candidates: [BoardCoordinate, BoardCoordinate, BoardCoordinate][];
}

export type RetrievePiece = {
    state: 'retrieve-piece';
    retrieves: BoardCoordinate[];
}

export type EndOfTurn = {
    state: 'end-of-turn';
}

export type GameWithState<S extends GameState> = {
    hands: {
        [O in PieceOwner]: Hand;
    };
    board: Board;
} & S;

export type Game =
    | GameWithState<PlacePiece>
    | GameWithState<GraduatePieces>
    | GameWithState<RetrievePiece>
    | GameWithState<EndOfTurn>
    ;

export function isPlacePiece(game: Game): game is GameWithState<PlacePiece> {
    return game.state == 'place-piece';
}

export function isGraduatePieces(game: Game): game is GameWithState<GraduatePieces> {
    return game.state == 'graduate-pieces';
}

export function isRetrievePiece(game: Game): game is GameWithState<RetrievePiece> {
    return game.state == 'retrieve-piece';
}

export function isEndOfTurn(game: Game): game is GameWithState<EndOfTurn> {
    return game.state == 'end-of-turn';
}

export function newGame(): GameWithState<PlacePiece> {
    return {
        state: 'place-piece',
        hands: {
            player: initialHand(),
            opponent: initialHand(),
        },
        board: initialBoard(),
    }
}

export function deepCopyGame<S extends GameState>(game: GameWithState<S>): GameWithState<S> {
    return {
        ...game,
        hands: {
            player: {
                ...game.hands.player,
            },
            opponent: {
                ...game.hands.opponent,
            }
        },
        board: [...Array(6).keys()].map((r) => [...Array(6).keys()].map((c) => {
            const cell = game.board[r][c];
            return {
                piece: cell.piece ? { ...cell.piece } : null
            };
        })),
    }
}

type Boop = {
    from: BoardCoordinate,
    to?: BoardCoordinate,
}

export function calculateBoops(board: Board, move: PlaceMove): Boop[] {
    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ]

    const { kind, place: { r, c } } = move;

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
                    }
                } else {
                    boops.push({
                        from: { r: r + dr, c: c + dc },
                        to: undefined
                    });
                }
            }
        }
    };

    return boops;
}

export function calculateCandidates(board: Board): [BoardCoordinate, BoardCoordinate, BoardCoordinate][] {
    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1]
    ]

    const candidates: [BoardCoordinate, BoardCoordinate, BoardCoordinate][] = [];
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

export function calculateRetrieves(board: Board): BoardCoordinate[] {
    const retrieves: BoardCoordinate[] = [];
    board.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.piece?.owner == 'player') {
            retrieves.push({ r, c });
        }
    }));

    if (retrieves.length == 8) {
        return retrieves;
    } else {
        return [];
    }
}

export function validatePlaceMove(game: GameWithState<PlacePiece>, move: PlaceMove) {
    const { hands, board } = deepCopyGame(game);
    const { kind, place: { r, c } } = move;

    if (hands.player[kind] == 0) {
        throw new Error(`Cannot place: player's hand contains no ${kind}s`);
    }

    const cell = board[r]?.[c];
    if (!cell) {
        throw new Error(`Cannot place: board coordinate { r: ${r}, c: ${c} } is out of range`);
    }

    if (cell.piece) {
        throw new Error(`Cannot place: board cell at { r: ${r}, c: ${c} } is occupied`);
    }
}

export function placePiece(game: GameWithState<PlacePiece>, move: PlaceMove): {
    game: GameWithState<GraduatePieces> | GameWithState<RetrievePiece> | GameWithState<EndOfTurn>;
    boops: Boop[];
} {
    validatePlaceMove(game, move);

    const { hands, board } = deepCopyGame(game);
    const { kind, place: { r, c } } = move;

    hands.player[kind] -= 1;

    board[r][c].piece = {
        kind,
        owner: 'player'
    };

    const boops = calculateBoops(board, move);
    for (const { from, to } of boops) {
        const piece = board[from.r][from.c].piece!;
        board[from.r][from.c].piece = null;
        if (to) {
            board[to.r][to.c].piece = piece;
        } else {
            hands[piece.owner][piece.kind] += 1;
        }
    }

    const candidates = calculateCandidates(board);

    if (candidates) {
        return {
            game: {
                hands,
                board,
                state: 'graduate-pieces',
                candidates,
            },
            boops,
        }
    }

    if (hands.player.kitten + hands.player.cat == 0) {
        const retrieves = calculateRetrieves(board);
        return {
            game: {
                hands,
                board,
                state: 'retrieve-piece',
                retrieves,
            },
            boops,
        };
    }

    return {
        game: {
            hands,
            board,
            state: 'end-of-turn',
        },
        boops,
    }
}

export function validateGraduateMove(game: GameWithState<GraduatePieces>, move: GraduateMove) {
    const { board } = deepCopyGame(game);
    const { graduate } = move;

    if (graduate.length != 3) {
        throw new Error(`Cannot graduate ${graduate.length} pieces`);
    }

    // TODO: ensure that graduate forms a line

    const cells = graduate.map(({ r, c }) => board[r]?.[c]);
    if (cells.some((cell) => cell == undefined)) {
        throw new Error(`Cannot graduate: board coordinate out of range`);
    }
    if (!cells.every((cell) => cell.piece?.owner == 'player')) {
        throw new Error(`Cannot graduate: not all cells contain player pieces`);
    }
    if (cells.every((cell) => cell.piece?.kind == 'cat')) {
        throw new Error(`Cannot graduate: all pieces are cats`);
    }
}

export function graduatePieces(game: GameWithState<GraduatePieces>, move: GraduateMove): GameWithState<EndOfTurn> {
    validateGraduateMove(game, move);

    const { hands, board } = deepCopyGame(game);
    const { graduate } = move;

    for (const { r, c } of graduate) {
        board[r][c].piece = null;
        hands.player.cat += 1;
    }

    return {
        hands,
        board,
        state: 'end-of-turn'
    }
}
export function validateRetrieveMove(game: GameWithState<RetrievePiece>, move: RetrieveMove) {
    const { hands, board } = deepCopyGame(game);
    const { retrieve: { r, c } } = move;

    if (hands.player.kitten + hands.player.cat > 0) {
        throw new Error(`Cannot retrieve: player's hand is not empty`);
    }

    const cell = board[r]?.[c];
    if (!cell) {
        throw new Error(`Cannot retrieve: board coordinate { r: ${r}, c: ${c} } is out of range.`);
    }
}

export function retrievePiece(game: GameWithState<RetrievePiece>, move: RetrieveMove): GameWithState<EndOfTurn> {
    validateRetrieveMove(game, move);

    const { hands, board } = deepCopyGame(game);
    const { retrieve: { r, c } } = move;

    const piece = board[r][c].piece!;
    board[r][c].piece = null;
    hands.player[piece.kind] += 1;

    return {
        hands,
        board,
        state: 'end-of-turn'
    }
}

export function playerWins(game: GameWithState<EndOfTurn>): boolean {
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

export function endTurn(game: GameWithState<EndOfTurn>): GameWithState<PlacePiece> | 'win' {
    if (playerWins(game)) {
        return 'win';
    }

    const { hands, board } = deepCopyGame(game);

    for (const row of board) {
        for (const cell of row) {
            if (cell.piece) {
                cell.piece.owner = cell.piece.owner == 'player' ? 'opponent' : 'player';
            }
        }
    }

    return {
        hands: {
            player: { ...hands.opponent },
            opponent: { ...hands.player },
        },
        board,
        state: 'place-piece',
    }
}

export function makeTurn(game: GameWithState<PlacePiece>, turn: Turn): GameWithState<EndOfTurn> {
    const placed = placePiece(game, turn);
    if (isGraduatePieces(placed.game)) {
        if (turn.graduate) {
            return graduatePieces(placed.game, turn);
        } else {
            throw new Error('Graduation required on turn');
        }
    } else if (isRetrievePiece(placed.game)) {
        if (turn.retrieve) {
            return retrievePiece(placed.game, turn);
        } else {
            throw new Error('Retrieval required on turn');
        }
    } else {
        return placed.game;
    }
}
