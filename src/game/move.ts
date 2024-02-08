import { BoardCoordinate } from "./board";
import { PieceKind } from "./piece";

export type Move =
    | PlaceMove
    | GraduateMove
    | RetrieveMove
    ;

export type PlaceMove = {
    kind: PieceKind;
    place: BoardCoordinate;
}

export type GraduateMove = {
    graduate: BoardCoordinate[];
}

export type RetrieveMove = {
    retrieve: BoardCoordinate;
}

export type Turn = PlaceMove & ({
    graduate: BoardCoordinate[];
    retrieve?: undefined;
} | {
    graduate?: undefined;
    retrieve: BoardCoordinate;
} | {
    graduate?: undefined;
    retrieve?: undefined;
});
