import { createActor, fromPromise, setup } from 'xstate';
import { board, cells, getCell, getEmptyCells, opponentHand, playerHand, screens } from './elements';

const onDragStart = (ev: DragEvent) => {
    if (ev.dataTransfer) {
        /// @ts-ignore id exists
        ev.dataTransfer.setData('application/boop', ev.target.id);
        ev.dataTransfer.effectAllowed = 'move';
    }
}

const onDragEnd = (ev: DragEvent) => {
    if (ev.dataTransfer) {
        if (ev.dataTransfer.dropEffect == 'move') {

        }
    }
}

const onDragEnter = (ev: DragEvent) => {
    (ev.target as HTMLDivElement).classList.add('cell-highlighted');
    ev.preventDefault();
}

const onDragLeave = (ev: DragEvent) => {
    (ev.target as HTMLDivElement).classList.remove('cell-highlighted');
    ev.preventDefault();
}

const onDragOver = (ev: DragEvent) => {
    if (ev.dataTransfer) {
        ev.dataTransfer.dropEffect = 'move';
    }
    ev.preventDefault();
}

const boop = async ([r, c]: [number, number]) => {
    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];

    const animationPromises: Promise<unknown>[] = [];

    for (const [dr, dc] of vectors) {
        const neighbor = getCell(r + dr, c + dc);

        if (!neighbor?.hasChildNodes()) {
            continue;
        }

        const { height, width } = neighbor.getBoundingClientRect();

        const piece = neighbor.children[0] as HTMLDivElement;

        const target = getCell(r + 2 * dr, c + 2 * dc);

        if (target) {
            if (!target.hasChildNodes()) {
                const animation = new Animation(new KeyframeEffect(piece, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dc}px, ${height * dr}px)` }
                ], {
                    duration: 500
                }));

                animationPromises.push(animation.finished.then(() => {
                    neighbor.removeChild(piece);
                    target.appendChild(piece);
                }));

                animation.play();
            } else {
                const animation = new Animation(new KeyframeEffect(piece, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dc / 2}px, ${height * dr / 2}px)` },
                    { transform: "translate(0px, 0px)" }
                ], {
                    duration: 500
                }));

                animationPromises.push(animation.finished);

                animation.play();
            }
        } else {
            const animation = new Animation(new KeyframeEffect(piece, [
                { transform: "translate(0px, 0px)" },
                { transform: `translate(${width * dc}px, ${height * dr}px)` }
            ], {
                duration: 500
            }));

            animationPromises.push(animation.finished.then(() => {
                neighbor.removeChild(piece);
                if (piece.classList.contains('player-piece')) {
                    playerHand.appendChild(piece);
                } else {
                    opponentHand.appendChild(piece);
                }
            }));

            animation.play();
        }
    }

    await Promise.all(animationPromises)
};

const rootMachine = setup({
    types: {} as {
        events:
        | { type: 'start-game' }
        | { type: 'piece-placed', coordinate: [number, number] }
        | { type: 'boop-finished' },
    },
    guards: {
        isPlayerHandEmpty: (): boolean => {
            return !playerHand.hasChildNodes();
        },
        isOpponentHandEmpty: (): boolean => {
            return !opponentHand.hasChildNodes();
        }
    },
    actions: {
        showScreen: (_, params: { gameScreen: 'game-menu' | 'game-play-area' }) => {
            const screen = screens[params['gameScreen']];
            screen.hidden = false;
        },
        hideScreen: (_, params: { gameScreen: 'game-menu' }) => {
            const screen = screens[params['gameScreen']];
            screen.hidden = true;
        },
        setPiecesInHandDraggable: () => {
            for (const element of playerHand.children) {
                element.setAttribute('draggable', 'true');
                element.addEventListener('dragstart', onDragStart);
                element.addEventListener('dragend', onDragEnd);
            }
        },
        setPlayerPiecesNotDraggable: () => {
            for (const element of document.getElementsByClassName('player-piece')) {
                element.setAttribute('draggable', 'false');
                element.removeEventListener('dragstart', onDragStart);
                element.removeEventListener('dragend', onDragEnd);
            }
        },
        setEmptyCellsDroppable: () => {
            for (const rowElement of board.children) {
                for (const cellElement of rowElement.children) {
                    const coordinate = cellElement.getAttribute('data-coordinate')!;
                    if (cellElement.hasChildNodes()) {
                        console.log(`Cell (${coordinate}) is not empty`)
                        continue;
                    }
                    cellElement.addEventListener('dragover', onDragOver);
                    cellElement.addEventListener('dragenter', onDragEnter);
                    cellElement.addEventListener('dragleave', onDragLeave);
                }
            }
        },
        setCellsNotDroppable: () => {
            for (const rowElement of board.children) {
                for (const cellElement of rowElement.children) {
                    cellElement.removeEventListener('dragover', onDragOver);
                    cellElement.removeEventListener('dragenter', onDragEnter);
                    cellElement.removeEventListener('dragleave', onDragLeave);
                }
            }
        },
        placeOpponentPiece: () => {
            const emptyCells = getEmptyCells();

            const [coordinate, target] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

            const piece = opponentHand.children[0];
            opponentHand.removeChild(piece);
            target.appendChild(piece);

            rootActor.send({ type: 'piece-placed', coordinate });
        }
    }
}).createMachine({
    initial: 'menu',
    states: {
        menu: {
            on: {
                'start-game': {
                    target: 'gamePlaying'
                }
            },
            entry: [{ type: 'showScreen', params: { gameScreen: 'game-menu' } }],
            exit: [{ type: 'hideScreen', params: { gameScreen: 'game-menu' } }]
        },
        gamePlaying: {
            initial: 'playerTurn',
            states: {
                playerTurn: {
                    initial: 'init',
                    states: {
                        init: {
                            always: [{
                                guard: 'isPlayerHandEmpty',
                                target: 'selectPieceToGraduate'
                            }, {
                                target: 'dragPieceOntoBoard'
                            }]
                        },
                        selectPieceToGraduate: {},
                        dragPieceOntoBoard: {
                            on: {
                                'piece-placed': 'booping'
                            },
                            entry: ['setPiecesInHandDraggable', 'setEmptyCellsDroppable'],
                            exit: ['setPlayerPiecesNotDraggable', 'setCellsNotDroppable']
                        },
                        booping: {
                            invoke: {
                                src: fromPromise<void, [number, number]>(async ({ input }) => await boop(input)),
                                input: ({ event }) => {
                                    if (event.type == 'piece-placed') {
                                        return event.coordinate;
                                    }
                                },
                                onDone: 'preTurnEnd'
                            },
                        },
                        preTurnEnd: {
                            after: {
                                500: 'turnEnd'
                            }
                        },
                        turnEnd: {
                            type: 'final'
                        }
                    },
                    onDone: 'opponentTurn'
                },
                opponentTurn: {
                    initial: 'init',
                    states: {
                        init: {
                            always: [{
                                guard: 'isOpponentHandEmpty',
                                target: 'selectPieceToGraduate'
                            }, {
                                target: 'dragPieceOntoBoard'
                            }]
                        },
                        selectPieceToGraduate: {},
                        dragPieceOntoBoard: {
                            on: {
                                'piece-placed': 'booping'
                            },
                            entry: ['placeOpponentPiece']
                        },
                        booping: {
                            invoke: {
                                src: fromPromise<void, [number, number]>(async ({ input }) => await boop(input)),
                                input: ({ event }) => {
                                    if (event.type == 'piece-placed') {
                                        return event.coordinate;
                                    }
                                },
                                onDone: 'turnEnd'
                            },
                        },
                        turnEnd: {
                            type: 'final'
                        }
                    },
                    onDone: 'playerTurn'
                },
            },
            entry: [{ type: 'showScreen', params: { gameScreen: 'game-play-area' } }]
        },
        gameOver: {}
    }
});

const rootActor = createActor(rootMachine);
rootActor.start();

document.getElementById('play-game-button')?.addEventListener('click', () => {
    rootActor.send({ type: 'start-game' })
})

cells.forEach((row, rowIdx) => {
    row.forEach((cell, colIdx) => {
        cell.addEventListener('drop', (ev: DragEvent) => {
            if (ev.dataTransfer) {
                const pieceId = ev.dataTransfer.getData('application/boop');
                cell.appendChild(document.getElementById(pieceId)!);
            }

            cell.classList.remove('cell-highlighted');
            rootActor.send({ type: 'piece-placed', coordinate: [rowIdx, colIdx] });
            ev.preventDefault();
        });
    });
});
