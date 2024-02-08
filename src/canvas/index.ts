import { Board } from "./board";
import { Hand } from "./hand";
import { Piece } from "./piece";
import { Cell } from "./cell";

type Colors = {
    pieces: {
        player: string;
        opponent: string;
    };
    board: [string, string];
};

export class Canvas {
    element: HTMLCanvasElement;
    colors: Colors;
    playerHand: Hand;
    opponentHand: Hand;
    board: Board;
    pieces: Piece[] = [];

    constructor() {
        this.element = document.createElement('canvas');

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
    }

    prepareCanvas(): CanvasRenderingContext2D {
        const ratio = window.devicePixelRatio;
        this.element.width = this.element.clientWidth * ratio;
        this.element.height = this.element.clientHeight * ratio;

        const ctx = this.element.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get 2D rendering context for canvas');
        }

        ctx.clearRect(0, 0, this.element.width, this.element.height);
        ctx.translate(this.element.width / 2, this.element.height / 2);

        const cellLength = this.getCellLength();
        ctx.scale(cellLength, cellLength);

        return ctx;
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

    drawPiece(ctx: CanvasRenderingContext2D, piece: Piece) {
        ctx.fillStyle = this.colors.pieces[piece.owner];
        ctx.beginPath();
        ctx.fill(piece.path());
    }

    drawBoardCell(ctx: CanvasRenderingContext2D, cell: Cell, color: string) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.fill(cell.path);
    }

    drawLoop() {
        requestAnimationFrame(() => this.drawLoop());

        const ctx = this.prepareCanvas();

        this.board.cells.forEach((row, r) => {
            row.forEach((cell, c) => {
                const color = (r % 2 == c % 2) ? this.colors.board[0] : this.colors.board[1];
                this.drawBoardCell(ctx, cell, color);
            })
        })

        this.pieces.forEach((piece) => {
            this.drawPiece(ctx, piece);
        })
    }
}
