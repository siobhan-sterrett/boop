import {
    BoardCoordinate,
    Move,
    Triplet,
} from './types';
import { GameState } from './state';

import { Player } from '../player';

export class Game {
    state: GameState;
    player: Player;
    opponent: Player;

    constructor(players: [Player, Player]) {
        this.state = new GameState();
        this.player = players[0];
        this.opponent = players[1];
    }

    async #makeMove(): Promise<Move> {
        const move = await this.player.getMove(new GameState(this.state));

        const boops = this.state.placePiece(move);
        await this.player.onBoops(boops);
        return move;
    }

    async #doGraduate(): Promise<Triplet | undefined> {
        const candidates = this.state.graduationCandidates();

        if (candidates.length != 0) {
            const triplet = await this.player.getCandidate(candidates);
            this.state.graduateTriplet(triplet);
            return triplet;
        }

        return undefined;
    }

    async #doRetrieve(): Promise<BoardCoordinate | undefined> {
        const candidates = this.state.retrievalCandidates();

        if (candidates.length != 0) {
            const place = await this.player.getRetrieve(candidates);
            this.state.retrievePiece(place);
            return place;
        }

        return undefined;
    }

    async run() {
        const move = await this.#makeMove();
        const graduate = await this.#doGraduate();
        const retrieve = await this.#doRetrieve();

        this.opponent.onOpponentTurn({
            ...move,
            ...graduate,
            ...retrieve
        });

        const triplet = this.state.winningTriplet();
        if (triplet) {
            this.player.onWin(triplet);
            this.opponent.onLose(triplet);
        } else {
            this.state.swapPlayers();
            setTimeout(() => this.run());
        }
    }
}
