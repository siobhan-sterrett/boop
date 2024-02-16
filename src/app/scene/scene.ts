import { Canvas } from "../canvas";
import { Board, Triplet } from "./board";
import { Cell } from "./cell";
import { CellCoordinate } from "./cell_map";
import { Gutter } from "./gutter";
import { Hand } from "./hand";
import { Piece, PieceKind, PieceOwner } from "./piece";
import { PieceAnimations } from "./piece_animations";
import { DEFAULT_THEME, Theme } from "./theme";

export class Scene {
    canvas: Canvas;
    board: Board = new Board();
    gutter: Gutter = new Gutter();
    hands: Record<PieceOwner, Hand> = {
        player: new Hand('player'),
        opponent: new Hand('opponent'),
    };
    draggingCell: Cell = new Cell(new DOMRect(0, 0, 1, 1));
    tripletOvals: Path2D[] = [];
    theme: Theme = DEFAULT_THEME;
    pieces: Piece[] = [];
    message: string = "";
    pieceAnimations: PieceAnimations = new PieceAnimations();

    constructor(canvas: Canvas) {
        this.canvas = canvas;
        for (const cell of this.hands.player.values()) {
            const piece = new Piece('kitten', 'player', cell);
            cell.piece = piece;
            this.pieces.push(piece);
        }

        for (const cell of this.hands.opponent.values()) {
            const piece = new Piece('kitten', 'opponent', cell);
            cell.piece = piece;
            this.pieces.push(piece);
        }

        const piece = this.hands.opponent.get({ r: 0, c: 0 })!.takePiece()!;
        this.board.get({ r: 1, c: 1 })!.piece = piece;
    }

    draw(ctx: CanvasRenderingContext2D) {
        this.pieceAnimations.updateAll();

        this.board.draw(ctx, this.theme);
        this.pieces.forEach((piece) => piece.draw(ctx, this.theme));

        ctx.fillStyle = 'black';
        ctx.font = '0.5px serif';
        const text = ctx.measureText(this.message);
        ctx.fillText(this.message, -text.width / 2, 4.5);
    }

    calculateScale(width: number, height: number) {
        const minHMargin = 1.0;
        const gutterWidth = 1.0;
        const boardWidth = 6.0;
        const sceneWidth = boardWidth + 2 * (gutterWidth + minHMargin);

        const minVMargin = 1.0;
        const handHeight = 2.5;
        const minGutterVMargin = 0.5;
        const gutterHeight = 1.0;
        const boardHeight = 6.0;
        const sceneHeight = boardHeight + 2 * (minVMargin + handHeight + minGutterVMargin + gutterHeight);

        return Math.min(width / sceneWidth, height / sceneHeight);
    }

    runPlacePiece() {
        this.message = 'Drag a piece to the board';

        const { clear } = this.canvas.addEventListeners({
            'pointerdown': (ev: PointerEvent) => {
                this.draggingCell.ifHasPiece((piece) => {
                    this.draggingCell.takePiece();
                    this.pieceAnimations.moveTo(piece, piece.home);
                });

                for (const cell of this.hands.player.values()) {
                    cell.ifHasPiece((piece) => {
                        if (this.canvas.isPointInPath(piece.path, ev.offsetX, ev.offsetY)) {
                            cell.takePiece();
                            this.pieceAnimations.moveTo(piece, this.draggingCell);
                        }
                    });
                }
            },
            'pointermove': (ev: PointerEvent) => {
                const point = this.canvas.toScenePoint(ev.offsetX, ev.offsetY);
                this.draggingCell.center = point;
            },
            'pointerup': (ev: PointerEvent) => {
                this.draggingCell.ifHasPiece((piece) => {
                    for (const [coordinate, cell] of this.board) {
                        if (this.canvas.isPointInPath(cell.path, ev.offsetX, ev.offsetY)) {
                            cell.ifEmpty(() => {
                                clear();
                                this.draggingCell.takePiece();
                                this.pieceAnimations.moveTo(piece, cell).then(() => {
                                    this.runBoops(coordinate, piece.kind);
                                });
                            });
                            break;
                        }
                    }
                });

                this.draggingCell.ifHasPiece((piece) => {
                    this.draggingCell.takePiece();
                    this.pieceAnimations.moveTo(piece, piece.home);
                })
            }
        });
    }

    runBoops({ r, c }: CellCoordinate, pieceKind: PieceKind) {
        const boops: Promise<void>[] = [];

        for (const dr of [-1, 0, 1]) {
            for (const dc of [-1, 0, 1]) {
                const neighborCoordinate = { r: r + dr, c: c + dc };
                const neighbor = this.board.get(neighborCoordinate);
                if (neighbor) {
                    neighbor.ifHasPiece((neighborPiece) => {
                        if (!(pieceKind == 'kitten' && neighborPiece.kind == 'cat')) {
                            const targetCoordinate = { r: r + 2 * dr, c: c + 2 * dc };
                            let target: Cell | undefined = this.board.get(targetCoordinate);
                            if (target) {
                                if (target.isEmpty()) {
                                    neighbor.takePiece();
                                    boops.push(this.pieceAnimations.moveTo(neighborPiece, target));
                                }
                            } else {
                                target = this.gutter.get(targetCoordinate)!;
                                neighbor.takePiece();
                                boops.push(this.pieceAnimations.moveTo(neighborPiece, target).then(() => {
                                    setTimeout(() => {
                                        target!.takePiece();
                                        this.pieceAnimations.moveTo(neighborPiece, neighborPiece.home);
                                    }, 500);
                                }));
                            }
                        }
                    });
                }
            }
        }

        Promise.all(boops).then(() => {
            this.runPostBoop();
        })
    }

    runPostBoop() {
        // If there's at least one triplet...
        const triplets = Array.from(this.board.triplets('player'));
        if (triplets.length != 0) {
            const winningTriplet = triplets.find((triplet) => triplet.every(([_, cell]) => cell.piece?.kind == 'cat'));
            if (winningTriplet) {
                setTimeout(() => this.win(winningTriplet));
            } else {
                setTimeout(() => this.runGraduateTriplet(triplets));
            }
            return;
        }

        if (this.hands.player.isEmpty()) {
            setTimeout(() => this.runRetrievePiece());
            return;
        }

        // Otherwise, it's the opponent's turn
        setTimeout(() => this.runOpponentTurn());
    }

    runGraduateTriplet(triplets: Triplet[]) {

    }

    runRetrievePiece() {

    }

    runOpponentTurn() {

    }

    win(winningTriplet: Triplet) {

    }

    lose(winningTriplet: Triplet) {

    }
}
