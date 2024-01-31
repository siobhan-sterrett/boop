import { createActor, fromPromise, setup } from 'xstate';

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

const onDrop = (ev: DragEvent) => {
    if (ev.dataTransfer) {
        const pieceId = ev.dataTransfer.getData('application/boop');
        /// @ts-ignore target has appendChild
        ev.target.appendChild(document.getElementById(pieceId));
    }
    const cell = ev.target as HTMLDivElement;
    cell.classList.remove('cell-highlighted');
    const coordinate = cell.getAttribute('data-coordinate')!.split(', ').map((x) => parseInt(x)) as [number, number];
    rootActor.send({ type: 'piece-placed', coordinate })
    ev.preventDefault();
}

const boop = async ([x, y]: [number, number]) => {
    const board = document.getElementById('board')! as HTMLDivElement;
    const vectors: [number, number][] = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0], [1, 0],
        [-1, 1], [0, 1], [1, 1],
    ];

    const getCell = (x: number, y: number): HTMLDivElement | undefined => {
        const row = board.children[y] as HTMLDivElement;
        if (row) {
            const cell = row.children[x] as HTMLDivElement;
            if (cell) {
                return cell;
            }
        }
    }

    const animationPromises: Promise<unknown>[] = [];

    for (const [dx, dy] of vectors) {
        const neighbor = getCell(x + dx, y + dy);

        if (!neighbor?.hasChildNodes()) {
            continue;
        }

        const { height, width } = neighbor.getBoundingClientRect();

        const piece = neighbor.children[0] as HTMLDivElement;

        const target = getCell(x + 2 * dx, y + 2 * dy);

        if (target) {
            if (!target.hasChildNodes()) {
                const animation = new Animation(new KeyframeEffect(piece, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dx}px, ${height * dy}px)` }
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
                    { transform: `translate(${width * dx / 2}px, ${height * dy / 2}px)` },
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
                { transform: `translate(${width * dx}px, ${height * dy}px)` }
            ], {
                duration: 500
            }));

            animationPromises.push(animation.finished.then(() => {
                neighbor.removeChild(piece);
                if (piece.classList.contains('player-piece')) {
                    const playerHand = document.getElementById('player-hand')!;
                    playerHand.appendChild(piece);
                } else {
                    const opponentHand = document.getElementById('opponent-hand')!;
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
            const playerHand = document.getElementById('player-hand')!;
            return !playerHand.hasChildNodes();
        },
        isOpponentHandEmpty: (): boolean => {
            const opponentHand = document.getElementById('opponent-hand')!;
            return !opponentHand.hasChildNodes();
        }
    },
    actions: {
        showScreen: (_, params: { gameScreen: 'game-menu' | 'game-play-area' }) => {
            const { gameScreen } = params;
            document.getElementById(gameScreen)!.hidden = false;
        },
        hideScreen: (_, params: { gameScreen: 'game-menu' }) => {
            const { gameScreen } = params;
            document.getElementById(gameScreen)!.hidden = true;
        },
        setPiecesInHandDraggable: () => {
            const playerHand = document.getElementById('player-hand')!;
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
            const board = document.getElementById('board')!;
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
                    cellElement.addEventListener('drop', onDrop);
                }
            }
        },
        setCellsNotDroppable: () => {
            const board = document.getElementById('board')!;
            for (const rowElement of board.children) {
                for (const cellElement of rowElement.children) {
                    cellElement.removeEventListener('dragover', onDragOver);
                    cellElement.removeEventListener('dragenter', onDragEnter);
                    cellElement.removeEventListener('dragleave', onDragLeave);
                    cellElement.removeEventListener('drop', onDrop);
                }
            }
        },
        placeOpponentPiece: () => {
            const emptyCells: HTMLDivElement[] = [];
            const board = document.getElementById('board')! as HTMLDivElement;
            for (const row of board.children) {
                for (const cell of row.children) {
                    if (!cell.hasChildNodes()) {
                        emptyCells.push(cell as HTMLDivElement);
                    }
                }
            }

            const target = emptyCells[Math.floor(Math.random() * emptyCells.length)];

            const opponentHand = document.getElementById('opponent-hand')!;
            const piece = opponentHand.children[0];
            opponentHand.removeChild(piece);
            target.appendChild(piece);

            const coordinate = target.getAttribute('data-coordinate')!.split(', ').map((x) => parseInt(x)) as [number, number];
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
                                onDone: 'turnEnd'
                            },
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

const rootActor = createActor(rootMachine, {
    inspect: (inspectionEvent) => {
        if (inspectionEvent.type == '@xstate.event') {
            console.log(inspectionEvent.event);
        }
    }
});
rootActor.start();

document.getElementById('play-game-button')?.addEventListener('click', () => {
    rootActor.send({ type: 'start-game' })
})
