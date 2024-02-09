/**
 * A random player simply makes a random move from the available moves.
 */

import { Player } from "./player";
import { BoardCoordinate, GameState, Move, PieceKind, Triplet } from "../game";

export class RandomPlayer implements Player {
    getMove(state: GameState): Promise<Move> {
        return Promise.resolve(this.#randomMove(state));
    }

    onBoops(): Promise<void> {
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

    #randomPieceKind(state: GameState): PieceKind {
        if (state.hands.player.kitten == 0) {
            return 'cat';
        } else if (state.hands.player.cat == 0) {
            return 'kitten';
        } else {
            return Math.random() > 0.5 ? 'cat' : 'kitten';
        }
    }

    #randomEmptyCell(state: GameState): BoardCoordinate {
        const emptyCells: BoardCoordinate[] = [];
        state.board.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell.piece == null) {
                    emptyCells.push({ r, c });
                }
            })
        });
        return emptyCells[Math.random() * emptyCells.length];
    }

    #randomMove(state: GameState): Move {
        return {
            kind: this.#randomPieceKind(state),
            place: this.#randomEmptyCell(state),
        }
    }
}
