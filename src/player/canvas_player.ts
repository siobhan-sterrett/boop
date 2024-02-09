import { Player } from "./player";
import { Canvas } from "../canvas";
import { BoardCoordinate, Boop, Move, Triplet, Turn } from "../game";

export class CanvasPlayer implements Player {
    canvas: Canvas;

    constructor(canvas: Canvas) {
        this.canvas = canvas;
        this.canvas.drawLoop();
    }

    getMove(): Promise<Move> {
        console.log('Waiting for move from player');
        return this.canvas.getMove();
    }

    onBoops(boops: Boop[]): Promise<void> {
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
