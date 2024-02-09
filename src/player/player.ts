import { BoardCoordinate, Boop, GameState, Move, Triplet, Turn } from "../game";

export interface Player {
    getMove(state: GameState): Promise<Move>;
    onBoops(placed: BoardCoordinate, boops: Boop[]): Promise<void>;
    getCandidate(candidates: Triplet[]): Promise<Triplet>;
    getRetrieve(retrieves: BoardCoordinate[]): Promise<BoardCoordinate>;
    onOpponentTurn(turn: Turn): Promise<void>;
    onWin(triplet: Triplet): void;
    onLose(triplet: Triplet): void;
}
