const PIECE_KINDS = ['cat', 'kitten'] as const;
export type PieceKind = typeof PIECE_KINDS[number];

const PIECE_OWNERS = ['player', 'opponent'] as const;
export type PieceOwner = typeof PIECE_OWNERS[number];

export type Piece = {
    kind: PieceKind;
    owner: PieceOwner;
}
