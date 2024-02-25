import { Cell, playGameButton, showScreen } from "./elements"
import { opponentHand, playerHand } from "./elements";
import { BoardCoordinate, board } from "./elements";

const onDragEnter = (ev: DragEvent) => {
    ev.target?.dispatchEvent(new Event('highlight'));
    ev.preventDefault();
}

const onDragLeave = (ev: DragEvent) => {
    ev.target?.dispatchEvent(new Event('unhighlight'));
    ev.preventDefault();
}

const onDragOver = (ev: DragEvent) => {
    if (ev.dataTransfer) {
        ev.dataTransfer.dropEffect = 'move';
    }
    ev.preventDefault();
}

export const init = () => {
    console.log('init');
    showScreen('game-menu');
    playGameButton.addEventListener('click', startGame);
}

const startGame = () => {
    console.log('startGame');
    showScreen('game-play-area');

    for (const piece of playerHand.pieces()) {
        piece.element.addEventListener('dragstart', (ev: DragEvent) => {
            if (ev.dataTransfer) {
                ev.dataTransfer.setData('application/boop', piece.element.id);
                ev.dataTransfer.effectAllowed = 'move';
            }
        });
    }

    for (const [coordinate, cell] of board) {
        cell.element.addEventListener('highlight', () => cell.element.classList.add('cell-highlighted'));
        cell.element.addEventListener('unhighlight', () => cell.element.classList.remove('cell-highlighted'));
        cell.element.addEventListener('drop', (ev: DragEvent) => {
            if (ev.dataTransfer) {
                const pieceId = ev.dataTransfer.getData('application/boop');
                cell.element.appendChild(document.getElementById(pieceId)!);
            }

            cell.element.dispatchEvent(new Event('unhighlight'));
            setTimeout(() => playerPiecePlaced(coordinate));
            ev.preventDefault();
        });
    }

    // TODO: For now, player always goes first
    setTimeout(playerTurn);
}

const playerTurn = () => {
    console.log('playerTurn');

    for (const piece of playerHand.pieces()) {
        piece.element.setAttribute('draggable', 'true');
    }

    for (const [_, cell] of board) {
        if (cell.piece == null) {
            cell.element.addEventListener('dragover', onDragOver);
            cell.element.addEventListener('dragenter', onDragEnter);
            cell.element.addEventListener('dragleave', onDragLeave);
        }
    }
}

const opponentTurn = () => {
    console.log('opponentTurn');

    const emptyCells = Array.from(board).filter(([_, cell]) => cell.piece == null);

    const [coordinate, target] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    const { value: piece } = opponentHand.pieces().next();
    opponentHand.element.removeChild(piece.element);
    target.element.appendChild(piece.element);

    setTimeout(() => boop('opponent', coordinate));
}

const playerPiecePlaced = (coordinate: BoardCoordinate) => {
    console.log('playerPiecePlaced');
    // Set player cells not draggable
    for (const element of document.getElementsByClassName('player-piece')) {
        element.setAttribute('draggable', 'false');
    }

    // Remove drop targets from board
    for (const [_, cell] of board) {
        cell.element.removeEventListener('dragover', onDragOver);
        cell.element.removeEventListener('dragenter', onDragEnter);
        cell.element.removeEventListener('dragleave', onDragLeave);
    }

    setTimeout(() => boop('player', coordinate));
}

const boop = (turn: 'player' | 'opponent', { r, c }: BoardCoordinate) => {
    console.log('boop');

    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];

    const animationPromises: Promise<unknown>[] = [];

    const cell = board.get({ r, c })!;
    const boopingPiece = cell.piece!;

    for (const [dr, dc] of vectors) {
        const neighbor = board.get({ r: r + dr, c: c + dc });
        const neighborPiece = neighbor?.piece;

        if (!neighborPiece) {
            continue;
        }

        const { height, width } = neighbor.element.getBoundingClientRect();

        if (boopingPiece.kind == 'kitten' && neighborPiece.kind == 'cat') {
            continue;
        }

        const target = board.get({ r: r + 2 * dr, c: c + 2 * dc });

        if (target) {
            if (target.piece == null) {
                const animation = new Animation(new KeyframeEffect(neighborPiece.element, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dc}px, ${height * dr}px)` }
                ], 500));

                animationPromises.push(animation.finished.then(() => {
                    neighbor.element.removeChild(neighborPiece.element);
                    target.element.appendChild(neighborPiece.element);
                }));

                animation.play();
            } else {
                const animation = new Animation(new KeyframeEffect(neighborPiece.element, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dc / 2}px, ${height * dr / 2}px)` },
                    { transform: "translate(0px, 0px)" }
                ], 500));

                animationPromises.push(animation.finished);

                animation.play();
            }
        } else {
            const animation = new Animation(new KeyframeEffect(neighborPiece.element, [
                { transform: "translate(0px, 0px)" },
                { transform: `translate(${width * dc}px, ${height * dr}px)` }
            ], 500));

            animationPromises.push(animation.finished.then(() => {
                neighbor.element.removeChild(neighborPiece.element);
                if (neighbor.piece!.owner == 'player') {
                    playerHand.element.appendChild(neighborPiece.element);
                } else {
                    opponentHand.element.appendChild(neighborPiece.element);
                }
            }));

            animation.play();
        }
    }

    Promise.all(animationPromises).then(() => { setTimeout(() => postBoop(turn)) });
}

const postBoop = (turn: 'player' | 'opponent') => {
    // TODO: If player can graduate or retrieve, they get to choose one.
    console.log('postBoop');

    const triplets = Array.from(board.triplets(turn));

    const winningTriplet = triplets.find((triplet) =>
        triplet.every((cell) => cell?.piece?.kind == 'cat')
    );

    if (winningTriplet) {
        setTimeout(() => endGame(turn));
    } else {
        if (triplets.length == 1) {
            setTimeout(() => graduateTriplet(turn, triplets[0]));
        } else if (triplets.length > 1) {
            if (turn == 'player') {
                setTimeout(() => choosePlayerTripletToGraduate(triplets));
            } else {
                setTimeout(() => chooseOpponentTripletToGraduate(triplets));
            }
        } else {
            if (turn == 'player') {
                if (playerHand.isEmpty()) {
                    setTimeout(returnPlayerPieceToHand);
                } else {
                    setTimeout(opponentTurn, 500);
                }
            } else {
                if (opponentHand.isEmpty()) {
                    setTimeout(returnOpponentPieceToHand);
                } else {
                    setTimeout(playerTurn, 500);
                }
            }
        }
    }
}

const graduateTriplet = (turn: 'player' | 'opponent', triplet: [Cell, Cell, Cell]) => {
    console.log('graduateTriplet');

    for (const cell of triplet) {
        const piece = cell.piece!;
        cell.element.removeChild(piece.element);
        piece.graduate();
        if (turn == 'player') {
            playerHand.element.appendChild(piece.element);
        } else {
            opponentHand.element.appendChild(piece.element);
        }
    }

    if (turn == 'player') {
        setTimeout(opponentTurn, 500);
    } else {
        setTimeout(playerTurn, 500);
    }
}

const choosePlayerTripletToGraduate = (triplets: [Cell, Cell, Cell][]) => {
    console.log('choosePlayerTripletToGraduate');

    for (const triplet of triplets) {
        for (const cell of triplet) {
            cell.element.dispatchEvent(new Event('highlight'));
        }
    }

    const removeOnClicks: (() => void)[] = [];
    for (const triplet of triplets) {
        for (const cell of triplet) {
            if (!triplets.some((tripletToCheck) => tripletToCheck != triplet && tripletToCheck.some((cellToCheck) => cellToCheck == cell))) {
                const onClick = () => {
                    for (const triplet of triplets) {
                        for (const cell of triplet) {
                            cell.element.dispatchEvent(new Event('unhighlight'));
                        }
                    }

                    removeOnClicks.forEach((callback) => callback());

                    setTimeout(() => graduateTriplet('player', triplet));
                };

                removeOnClicks.push(() => cell.element.removeEventListener('click', onClick));
                cell.element.addEventListener('click', onClick);
            }
        }
    }
}

const chooseOpponentTripletToGraduate = (triplets: [Cell, Cell, Cell][]) => {
    console.log('chooseOpponentTripletToGraduate');

    const triplet = triplets[Math.floor(Math.random() * triplets.length)];

    setTimeout(() => graduateTriplet('opponent', triplet));
}

const returnPlayerPieceToHand = () => {
    console.log('returnPlayerPieceToHand');

    const removeOnClicks: (() => void)[] = [];
    for (const [_, cell] of board) {
        const piece = cell.piece;
        if (piece?.owner == 'player') {
            cell.element.dispatchEvent(new Event('highlight'));
            const onClick = () => {
                cell.element.removeChild(piece.element);
                playerHand.element.appendChild(piece.element);
                removeOnClicks.forEach((callback) => callback());

                setTimeout(opponentTurn, 500);
            };
            removeOnClicks.push(() => {
                cell.element.dispatchEvent(new Event('unhighlight'));
                cell.element.removeEventListener('click', onClick);
            });
            cell.element.addEventListener('click', onClick);
        }
    }
}

const returnOpponentPieceToHand = () => {
    console.log('returnOpponentPieceToHand');

    const opponentCells = Array.from(board).map(([_, cell]) => cell).filter((cell) => cell.piece?.owner == 'opponent');

    const cell = opponentCells[Math.floor(Math.random() * opponentCells.length)];
    const piece = cell.piece!;
    cell.element.removeChild(piece.element);
    opponentHand.element.appendChild(piece.element);

    setTimeout(playerTurn, 500);
}

const endGame = (winner: 'player' | 'opponent') => {
    console.log(`Winner: ${winner}`);
    // TODO
}
