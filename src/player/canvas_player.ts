import { Player } from "./player";
import { Canvas } from "../canvas";
import { BoardCoordinate, Boop, Game, Move, Triplet, Turn } from "../game";

export class CanvasPlayer extends Player {
    canvas: Canvas;

    constructor(game: Game, canvas: Canvas) {
        super(game);
        this.canvas = canvas;
    }

    getMove(): Promise<Move> {
        return this.canvas.getMove();
    }

    doBoops(boops: Boop[]): Promise<void> {
        return this.canvas.doBoops(boops);
    }

    getCandidate(candidates: Triplet[]): Promise<Triplet> {
        return this.canvas.getCandidate(candidates);
    }

    getRetrieve(retrieves: BoardCoordinate[]): Promise<BoardCoordinate> {
        return this.canvas.getRetrieve(retrieves);
    }

    onOpponentTurn(turn: Turn): Promise<void> {
        return this.canvas.onOpponentTurn(turn);
    }

    onWin(triplet: Triplet): void {
        return this.canvas.onWin(triplet);
    }

    onLose(triplet: Triplet): void {
        return this.canvas.onLose(triplet);
    }
}
