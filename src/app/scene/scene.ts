import { Triplet, getBoops, getGraduationCandidates, getRetrievalCandidates, getWinningTriplets } from "../../board";
import { Canvas } from "../canvas";
import { Board } from "./board";
import { Cell } from "./cell";
import { CellCoordinate } from "./cell_map";
import { Gutter } from "./gutter";
import { Hand } from "./hand";
import { Piece, PieceOwner } from "./piece";
import { PieceAnimations } from "./piece_animations";
import { DEFAULT_THEME, Theme } from "./theme";

export class Scene {
    readonly canvas: Canvas;
    readonly board: Board = new Board();
    readonly gutter: Gutter = new Gutter();
    readonly hands: Record<PieceOwner, Hand> = {
        player: new Hand('player'),
        opponent: new Hand('opponent'),
    };
    readonly draggingCell: Cell = new Cell(new DOMRect(0, 0, 1, 1));
    readonly tripletOvals: Path2D[] = [];
    readonly theme: Theme = DEFAULT_THEME;
    readonly pieces: Piece[] = [];
    readonly pieceAnimations: PieceAnimations = new PieceAnimations();
    message: string = "";

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

        const { removeListeners } = this.canvas.addEventListeners({
            'pointerdown': (ev: PointerEvent) => {
                const piece = this.draggingCell.takePiece();
                if (piece) {
                    this.pieceAnimations.moveTo(piece, piece.home);
                }

                for (const cell of this.hands.player.values()) {
                    if (cell.piece) {
                        if (this.canvas.isPointInPath(cell.piece.path, ev.offsetX, ev.offsetY)) {
                            const piece = cell.takePiece()!;
                            this.pieceAnimations.moveTo(piece, this.draggingCell);
                        }
                    }
                }
            },
            'pointermove': (ev: PointerEvent) => {
                const point = this.canvas.toScenePoint(ev.offsetX, ev.offsetY);
                this.draggingCell.center = point;
            },
            'pointerup': (ev: PointerEvent) => {
                const piece = this.draggingCell.takePiece();

                if (piece) {
                    for (const [coordinate, cell] of this.board) {
                        if (this.canvas.isPointInPath(cell.path, ev.offsetX, ev.offsetY)) {
                            if (cell.piece == null) {
                                removeListeners();
                                this.pieceAnimations.moveTo(piece, cell).then(() => {
                                    this.runBoops(coordinate);
                                });
                                return;
                            }
                        }
                    }


                    this.pieceAnimations.moveTo(piece, piece.home);
                }
            }
        });
    }

    runBoops(origin: CellCoordinate) {
        const animations: Promise<void>[] = [];

        for (const { from, to } of getBoops(this.board, origin)) {
            const piece = this.board.get(from)!.takePiece()!;
            if (to) {
                const target = this.board.get(to)!;
                animations.push(this.pieceAnimations.moveTo(piece, target));
            } else {
                const targetCoordinate = {
                    r: 2 * from.r + origin.r,
                    c: 2 * from.c + origin.c,
                };
                const target = this.gutter.get(targetCoordinate)!;
                animations.push(this.pieceAnimations.moveTo(piece, target).then(() => {
                    setTimeout(() => {
                        target.takePiece();
                        this.pieceAnimations.moveTo(piece, piece.home);
                    });
                }));
            }
        }

        Promise.all(animations).then(() => {
            this.runPostBoop();
        })
    }

    runPostBoop() {
        const winningTriplets = Array.from(getWinningTriplets(this.board, 'player'));

        if (winningTriplets.length > 0) {
            this.win(winningTriplets);
        } else {
            const graduationCandidates = Array.from(getGraduationCandidates(this.board, 'player'));
            const retrievalCandidates = Array.from(getRetrievalCandidates(this.board, 'player'));

            if (graduationCandidates.length > 0 && retrievalCandidates.length > 0) {
                this.runGraduateTripletOrRetrievePiece(graduationCandidates, retrievalCandidates);
            } else if (graduationCandidates.length > 0) {
                this.runGraduateTriplet(graduationCandidates);
            } else if (retrievalCandidates.length > 0) {
                this.runRetrievePiece(retrievalCandidates);
            } else {
                this.runOpponentTurn();
            }
        }
    }

    runGraduateTripletOrRetrievePiece(
        graduationCandidates: Triplet[],
        retrievalCandidates: CellCoordinate[]
    ) {

    }

    runGraduateTriplet(candidates: Triplet[]) {

    }

    runRetrievePiece(candidates: CellCoordinate[]) {

    }

    runOpponentTurn() {

    }

    win(winningTriplets: Triplet[]) {

    }

    lose(winningTriplets: Triplet[]) {

    }
}
