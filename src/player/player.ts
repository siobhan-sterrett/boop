import { Turn } from "../game";

export interface Player {
    playerTurn(): Promise<Turn>;
    opponentTurn(turn: Turn): void;
}
