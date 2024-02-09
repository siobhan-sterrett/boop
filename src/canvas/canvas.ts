import { Board } from "./board";
import { Hand } from "./hand";
import { Piece } from "./piece";
import { Cell } from "./cell";
import { BoardCoordinate, Boop, Move, Triplet, Turn } from "../game";

type Colors = {
    pieces: {
        player: string;
        opponent: string;
    };
    board: [string, string];
};

export class Canvas {
    element: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cellLength: number | undefined = undefined;
    colors: Colors;
    playerHand: Hand;
    opponentHand: Hand;
    board: Board;
    pieces: Piece[] = [];
    animations: {
        piece: Piece;
        speed: number;
        target: Cell;
    }[] = [];

    constructor() {
        this.element = document.createElement('canvas');

        const ctx = this.element.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D rendering context for canvas');
        }
        this.ctx = ctx;
        this.ctx.save();

        this.colors = {
            pieces: {
                player: '#e07729',
                opponent: '#9f9d9b'
            },
            board: ['#3d4e6e', '#303345']
        };

        this.playerHand = new Hand(
            new DOMRect(-3, 4.5, 6, 2.5),
            'player'
        );
        this.opponentHand = new Hand(
            new DOMRect(-3, -7, 6, 2.5),
            'opponent'
        );

        this.board = new Board(new DOMRect(-3, -3, 6, 6));

        for (const cell of this.playerHand.cells) {
            const piece = new Piece('kitten', 'player', cell);
            cell.setPiece(piece);
            this.pieces.push(piece);
        }
        for (const cell of this.opponentHand.cells) {
            const piece = new Piece('kitten', 'opponent', cell);
            cell.setPiece(piece);
            this.pieces.push(piece);
        }

        window.addEventListener('resize', () => {
            this.cellLength = undefined;
        });
    }


    resize() {
        const ratio = window.devicePixelRatio;
        this.element.width = this.element.clientWidth * ratio;
        this.element.height = this.element.clientHeight * ratio;

        this.cellLength = this.getCellLength();

        this.ctx.restore();
        this.ctx.translate(this.element.width / 2, this.element.height / 2);
        this.ctx.scale(this.cellLength, this.cellLength);
    }

    getCellLength() {
        const { width, height } = this.element;

        const minHMargin = 1.0;
        const gutterWidth = 1.0;
        const boardWidth = 6.0;
        const gameWidth = boardWidth + 2 * gutterWidth + 2 * minHMargin;

        const minVMargin = 0.5;
        const handHeight = 2.5;
        const gutterHeight = 1.0;
        const boardHeight = 6.0;
        const gameHeight = boardHeight + 2 * gutterHeight + 2 * handHeight + 2 * minVMargin;

        return Math.min(width / gameWidth, height / gameHeight);
    }

    drawPiece(piece: Piece) {
        this.ctx.fillStyle = this.colors.pieces[piece.owner];
        this.ctx.beginPath();
        this.ctx.fill(piece.path());
    }

    drawBoardCell(cell: Cell, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.fill(cell.path);
    }

    drawLoop() {
        if (this.cellLength == undefined) {
            this.resize()
        }

        requestAnimationFrame(() => this.drawLoop());

        this.ctx.clearRect(-this.element.width / 2, -this.element.height / 2, this.element.width, this.element.height);

        this.board.cells.forEach((row, r) => {
            row.forEach((cell, c) => {
                const color = (r % 2 == c % 2) ? this.colors.board[0] : this.colors.board[1];
                this.drawBoardCell(cell, color);
            })
        })

        this.pieces.forEach((piece) => {
            this.drawPiece(piece);
        })
    }

    animatePiece(piece: Piece, target: Cell) {
        this.animations.push({
            piece,
            speed: 0.5,
            target,
        })
    }

    updateAnimations() {
        const finishedIdxs: number[] = [];
        this.animations.forEach(({ piece, speed, target }, i) => {
            if (piece.place instanceof Cell) {
                finishedIdxs.push(i);
                return;
            } else {
                const { x, y } = piece.place;
                const dx = target.center().x - x;
                const dy = target.center().y - y;
                const distance = Math.sqrt(dy * dy + dx * dx);
                if (distance > speed) {
                    piece.place.x = dx * speed / distance;
                    piece.place.y = dy * speed / distance;
                } else {
                    piece.setPlace(target);
                    finishedIdxs.push(i);
                }
            }
        });

        for (const i of finishedIdxs.reverse()) {
            this.animations.splice(i, 1);
        }
    }

    getMove(): Promise<Move> {
        return new Promise((resolve) => {
            let draggedPiece: Piece | null = null;

            const onPointerDown = (ev: PointerEvent) => {
                for (const cell of this.playerHand.cells) {
                    if (cell.piece) {
                        if (this.ctx.isPointInPath(cell.piece.path(), ev.offsetX, ev.offsetY)) {
                            draggedPiece = cell.piece;
                            draggedPiece.setPlace({ x: ev.x, y: ev.y });
                            cell.piece = null;
                        }
                    }
                }
            }

            const onPointerMove = (ev: PointerEvent) => {
                if (draggedPiece) {
                    draggedPiece.setPlace({ x: ev.y, y: ev.y });
                }
            }

            const onPointerUp = (ev: PointerEvent) => {
                if (draggedPiece) {
                    for (const cell of this.playerHand.cells) {
                        if (!cell.piece && this.ctx.isPointInPath(cell.path, ev.x, ev.y)) {
                            cell.piece = draggedPiece;
                            draggedPiece.setPlace(cell);
                            return;
                        }
                    }

                    for (let r = 0; r < this.board.cells.length; ++r) {
                        for (let c = 0; c < this.board.cells.length; ++c) {
                            const cell = this.board.cells[r][c];
                            if (!cell.piece && this.ctx.isPointInPath(cell.path, ev.x, ev.y)) {
                                cell.piece = draggedPiece;
                                draggedPiece.setPlace(cell);
                                resolve({
                                    kind: draggedPiece.kind,
                                    place: { r, c }
                                });
                                return;
                            }
                        }
                    }

                    const cell = this.playerHand.cells.find((cell) => cell.piece == null)!;
                    this.animatePiece(draggedPiece, cell);
                    draggedPiece = null;
                }
            }

            this.element.addEventListener('pointerdown', onPointerDown);
            this.element.addEventListener('pointermove', onPointerMove);
            this.element.addEventListener('pointerup', onPointerUp);
        });
    }

    async doBoops(boops: Boop[]): Promise<void> {
        // TODO
    }

    async getCandidate(candidates: Triplet[]): Promise<Triplet> {
        // TODO
        return candidates[0];
    }

    async getRetrieve(retrieves: BoardCoordinate[]): Promise<BoardCoordinate> {
        // TODO
        return retrieves[0];
    }

    async onOpponentTurn(turn: Turn): Promise<void> {
        // TODO
    }

    onWin(triplet: Triplet): void {
        // TODO
    }

    onLose(triplet: Triplet): void {
        // TODO
    }
}
