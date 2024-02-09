const PIECE_KINDS = ['cat', 'kitten'] as const;
export type PieceKind = typeof PIECE_KINDS[number];

const PIECE_OWNERS = ['player', 'opponent'] as const;
export type PieceOwner = typeof PIECE_OWNERS[number];

export type Piece = {
    kind: PieceKind;
    owner: PieceOwner;
}

export type BoardCoordinate = {
    r: number;
    c: number;
}

export type Cell = {
    piece: Piece | null;
}

export type Board = Cell[][];

export type Hand = {
    kitten: number;
    cat: number;
};

export type Boop = {
    from: BoardCoordinate,
    to?: BoardCoordinate,
}

export type Move = {
    kind: PieceKind;
    place: BoardCoordinate;
}

export type Triplet = [BoardCoordinate, BoardCoordinate, BoardCoordinate];

export type Graduate = {
    graduate: Triplet;
}

export type Retrieve = {
    retrieve: BoardCoordinate;
}

export type Turn = Move & Partial<Graduate> & Partial<Retrieve>;
