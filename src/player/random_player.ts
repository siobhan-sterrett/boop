/**
 * A random player simply makes a random move from the available moves.
 */

import { Player } from ".";
import { BoardCoordinate } from "../game/board";
import { Move, Turn, PieceKind, PlacePiece, GameWithState, makeTurn, endTurn, PlaceMove, placePiece, isGraduatePieces, graduatePieces, isRetrievePiece, retrievePiece, GraduatePieces, GraduateMove, RetrievePiece, RetrieveMove } from "../game";

export class RandomPlayer implements Player {
    game: GameWithState<PlacePiece>

    constructor(game: GameWithState<PlacePiece>) {
        this.game = game;
    }

    *turns(initialTurn?: Turn): Generator<Turn, void, Turn> {
        if (initialTurn) {
            const game = endTurn(makeTurn(this.game, initialTurn));
            if (game == 'win') {
                return;
            }
            this.game = game;
        }

        while (true) {
            let turn: Turn = this.#randomPlaceMove();
            const placed = placePiece(this.game, turn);

            // TODO: Instead of doing fancy type bullshit, maybe just use callbacks. 
            // TODO: makeTurn(this.game, move, (candidates) => chooseCandidate(candidate), (retrieves) => chooseRetrieve(retrieves)): [Game, Turn]
            const endOfTurn = (() => {
                if (isGraduatePieces(placed.game)) {
                    const graduateMove = this.#randomGraduateMove(placed.game);
                    turn = { ...turn, ...graduateMove };
                    return graduatePieces(placed.game, graduateMove);
                } else if (isRetrievePiece(placed.game)) {
                    const retrieveMove = this.#randomRetrieveMove(placed.game);
                    turn = { ...turn, ...retrieveMove };
                    return retrievePiece(placed.game, retrieveMove);
                } else {
                    return placed.game;
                }
            })();

            let game = endTurn(endOfTurn);
            if (game == 'win') {
                return;
            }

            const opponentTurn = yield turn;

            game = endTurn(makeTurn(game, opponentTurn));
            if (game == 'win') {
                return;
            }

            this.game = game;
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

    #randomPlaceMove(): PlaceMove {
        return {
            kind: this.#randomPieceKind(),
            place: this.#randomEmptyCell(),
        }
    }

    #randomGraduateMove(game: GameWithState<GraduatePieces>): GraduateMove {
        return {
            graduate: game.candidates[Math.random() % game.candidates.length]
        };
    }

    #randomRetrieveMove(game: GameWithState<RetrievePiece>): RetrieveMove {
        return {
            retrieve: game.retrieves[Math.random() % game.retrieves.length]
        };
    }
}
