import { Move, Turn } from "../game";

export interface Player {
    turns(initialMove?: Turn): Generator<Turn, void, Turn>;
}
