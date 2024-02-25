import { Cell, Piece, playGameButton, showScreen, playerMessage } from "./elements"
import { opponentHand, playerHand } from "./elements";
import { BoardCoordinate, board } from "./elements";

export const init = () => {
    console.log('init');
    showScreen('game-menu');
    playGameButton.addEventListener('click', startGame);
}

const startGame = () => {
    console.log('startGame');
    showScreen('game-play-area');

    // TODO: For now, player always goes first
    setTimeout(playerTurn);
}

const playerTurn = () => {
    console.log('playerTurn');

    let selectedPiece: Piece | undefined = undefined;
    const controller = new AbortController();

    const selectPieceMsg = 'Select a piece to place on the board.';
    const selectCellMsg = 'Select a board square to place your piece.'

    playerMessage.innerText = selectPieceMsg;

    for (const piece of playerHand.pieces()) {
        piece.element.addEventListener('pointerdown', (ev) => {
            if (selectedPiece) {
                selectedPiece.element.classList.remove('selected');
            }
            selectedPiece = piece;
            piece.element.classList.add('selected');
            playerMessage.innerText = selectCellMsg;
            ev.stopPropagation();
        }, { signal: controller.signal });
    }

    for (const [coordinate, cell] of board) {
        if (cell.piece == null) {
            cell.element.addEventListener('pointerdown', (ev) => {
                if (selectedPiece) {
                    const piece = selectedPiece;
                    const dx = cell.center.x - selectedPiece.center.x;
                    const dy = cell.center.y - selectedPiece.center.y;

                    const animation = new Animation(new KeyframeEffect(piece.element, [
                        { transform: "translate(0px, 0px)" },
                        { transform: `translate(${dx}px, ${dy}px)` }
                    ], 1000));

                    animation.finished.then(() => {
                        playerHand.remove(piece);
                        cell.piece = piece;
                        piece.element.classList.remove('selected');
                        controller.abort();
                        boop('player', coordinate);
                    });

                    animation.play();

                    ev.stopPropagation();
                }
            })
        }
    }

    document.addEventListener('pointerdown', () => {
        selectedPiece = undefined;
        playerMessage.innerText = selectPieceMsg;
    });
}

const opponentTurn = () => {
    console.log('opponentTurn');

    const emptyCells = Array.from(board).filter(([_, cell]) => cell.piece == null);

    const [coordinate, target] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    const { value: piece } = opponentHand.pieces().next();

    const dx = target.center.x - piece.center.x;
    const dy = target.center.y - piece.center.y;

    const animation = new Animation(new KeyframeEffect(piece.element, [
        { transform: "translate(0px, 0px)" },
        { transform: `translate(${dx}px, ${dy}px)` }
    ], 1000));

    animation.finished.then(() => {
        opponentHand.remove(piece);
        target.piece = piece;
        boop('opponent', coordinate);
    });
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

        if (boopingPiece.kind == 'kitten' && neighborPiece.kind == 'cat') {
            continue;
        }

        const target = board.get({ r: r + 2 * dr, c: c + 2 * dc });

        if (target) {
            const dx = target.center.x - neighbor.center.x;
            const dy = target.center.y - neighbor.center.y;

            if (target.piece == null) {
                const animation = new Animation(new KeyframeEffect(neighborPiece.element, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${dx}px, ${dy}px)` }
                ], 500));

                animationPromises.push(animation.finished.then(() => {
                    neighbor.piece = null;
                    target.piece = neighborPiece;
                }));

                animation.play();
            } else {
                const animation = new Animation(new KeyframeEffect(neighborPiece.element, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${dx / 2}px, ${dy / 2}px)` },
                    { transform: "translate(0px, 0px)" }
                ], 500));

                animationPromises.push(animation.finished);

                animation.play();
            }
        } else {
            const dx = neighbor.center.x - cell.center.x;
            const dy = neighbor.center.y - cell.center.y;

            const animation = new Animation(new KeyframeEffect(neighborPiece.element, [
                { transform: "translate(0px, 0px)" },
                { transform: `translate(${dx}px, ${dy}px)` }
            ], 500));

            animationPromises.push(animation.finished.then(() => {
                neighbor.piece = null;
                if (neighbor.piece!.owner == 'player') {
                    playerHand.append(neighborPiece);
                } else {
                    opponentHand.append(neighborPiece);
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
        cell.piece = null;
        piece.graduate();
        if (turn == 'player') {
            playerHand.append(piece);
        } else {
            opponentHand.append(piece);
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
