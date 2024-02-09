/**
 * A random player simply makes a random move from the available moves.
 */

import { Player } from "./player";
import { BoardCoordinate, Game, Move, PieceKind, Turn, makeTurn, makeMove, swapPlayers } from "../game";

export class RandomPlayer implements Player {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    playerTurn(): Promise<Turn> {
        const turn = makeMove(
            this.game,
            this.#randomMove(),
            async () => { },
            async (candidates) => candidates[Math.random() % candidates.length],
            async (retrieves) => retrieves[Math.random() * retrieves.length]
        );

        swapPlayers(this.game);

        return Promise.resolve(turn);
    }

    opponentTurn(turn: Turn) {
        makeTurn(this.game, turn);
        swapPlayers(this.game);
    }

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
