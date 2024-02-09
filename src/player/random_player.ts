/**
 * A random player simply makes a random move from the available moves.
 */

import { Player } from "./player";
import { BoardCoordinate, Game, Move, PieceKind, Triplet } from "../game";

export class RandomPlayer extends Player {
    getMove(): Promise<Move> {
        return Promise.resolve(this.#randomMove());
    }

    doBoops(): Promise<void> {
        return Promise.resolve();
    }

    getCandidate(candidates: Triplet[]): Promise<Triplet> {
        return Promise.resolve(candidates[Math.random() % candidates.length]);
    }

    getRetrieve(retrieves: BoardCoordinate[]): Promise<BoardCoordinate> {
        return Promise.resolve(retrieves[Math.random() * retrieves.length]);
    }

    onOpponentTurn(): Promise<void> {
        return Promise.resolve();
    }

    onWin() { }

    onLose() { }

    #randomPieceKind(): PieceKind {
        if (this.game.hands.player.kitten == 0) {
            return 'cat';
        } else if (this.game.hands.player.cat == 0) {
            return 'kitten';
        } else {
            return Math.random() > 0.5 ? 'cat' : 'kitten';
        }
    }

    #randomEmptyCell(): BoardCoordinate {
        const emptyCells: BoardCoordinate[] = [];
        this.game.board.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell.piece == null) {
                    emptyCells.push({ r, c });
                }
            })
        });
        return emptyCells[Math.random() * emptyCells.length];
    }

    #randomMove(): Move {
        return {
            kind: this.#randomPieceKind(),
            place: this.#randomEmptyCell(),
        }
    }
}
