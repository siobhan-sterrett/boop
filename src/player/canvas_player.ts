import { Player } from "./player";
import { Canvas } from "../canvas";
import { Game, Turn, makeMove, swapPlayers } from "../game";

export class CanvasPlayer implements Player {
    game: Game;
    canvas: Canvas;

    constructor(game: Game, canvas: Canvas) {
        this.game = game;
        this.canvas = canvas;
    }

    async playerTurn(): Promise<Turn> {
        const turn = await makeMove(
            this.game,
            await this.canvas.getMove(),
            (boops) => this.canvas.doBoops(boops),
            (candidates) => this.canvas.getCandidate(candidates),
            (retrieves) => this.canvas.getRetrieve(retrieves),
        )

        swapPlayers(this.game);

        return turn;
    }

    async opponentTurn(turn: Turn) {

    }
}
