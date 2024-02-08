/**
 * A random player simply makes a random move from the available moves.
 */

import { Player } from ".";
import { BoardCoordinate, Game, GraduationCandidate, Move, PieceKind, Turn, makeTurn, playerWins, makeMove, swapPlayers } from "../game";

export class RandomPlayer implements Player {
    game: Game;

    constructor(game: Game) {
        this.game = game;
    }

    *turns(initialTurn?: Turn): Generator<Turn, void, Turn> {
        if (initialTurn) {
            makeTurn(this.game, initialTurn);
            if (playerWins(this.game)) {
                return;
            }
            swapPlayers(this.game);
        }

        while (true) {
            let move: Move = this.#randomMove();
            let turn = makeMove(
                this.game,
                move,
                () => { },
                (candidates: GraduationCandidate[]) => candidates[Math.random() % candidates.length],
                (retrieves: BoardCoordinate[]) => retrieves[Math.random() * retrieves.length]
            );

            if (playerWins(this.game)) {
                return;
            }

            swapPlayers(this.game);

            const opponentTurn = yield turn;
            makeTurn(this.game, opponentTurn);
            if (playerWins(this.game)) {
                return;
            }

            swapPlayers(this.game);
        }
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
