import { BoardCoordinate, Boop, Game, Move, Triplet, Turn, makeMove, makeTurn, swapPlayers, winningTriplet } from "../game";

export abstract class Player {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    abstract getMove(): Promise<Move>;
    abstract doBoops(boops: Boop[]): Promise<void>;
    abstract getCandidate(candidates: Triplet[]): Promise<Triplet>;
    abstract getRetrieve(retrieves: BoardCoordinate[]): Promise<BoardCoordinate>;
    abstract onOpponentTurn(turn: Turn): Promise<void>;
    abstract onWin(triplet: Triplet): void;
    abstract onLose(triplet: Triplet): void;

    async playerTurn(): Promise<Turn> {
        const turn = await makeMove(
            this.game,
            await this.getMove(),
            (boops) => this.doBoops(boops),
            (candidates) => this.getCandidate(candidates),
            (retrieves) => this.getRetrieve(retrieves)
        );

        const win = winningTriplet(this.game);
        if (win) {
            this.onWin(win);
        }

        swapPlayers(this.game);

        return turn;
    }

    async opponentTurn(turn: Turn) {
        makeTurn(this.game, turn);
        await this.onOpponentTurn(turn);

        const win = winningTriplet(this.game);
        if (win) {
            this.onLose(win);
        }

        swapPlayers(this.game);
    }
}
