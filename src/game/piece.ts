export type PieceOwner = 'player' | 'opponent';
export type PieceKind = 'cat' | 'kitten';

export type Piece = {
    owner: PieceOwner;
    kind: PieceKind;
}
