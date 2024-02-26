import { Cell, Piece, playGameButton, showScreen, playerMessage } from "./elements"
import { opponentHand, playerHand, hand } from "./elements";
import { BoardCoordinate, board, boardCoordinateEq } from "./elements";
import { playerConfirmButton } from "./elements/ux";

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
        piece.element.addEventListener('click', (ev) => {
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
            cell.element.addEventListener('click', (ev) => {
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
            }, { signal: controller.signal });
        }
    }

    document.addEventListener('click', () => {
        selectedPiece = undefined;
        playerMessage.innerText = selectPieceMsg;
    }, { signal: controller.signal });
}

const opponentTurn = () => {
    console.log('opponentTurn');

    playerMessage.innerText = 'Opponent moving...';

    const piecesInHand = Array.from(opponentHand.pieces());
    const piece = piecesInHand[Math.floor(Math.random() * piecesInHand.length)];

    const emptyCells = Array.from(board).filter(([_, cell]) => cell.piece == null);
    const [coordinate, target] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

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

    animation.play();
}

const boop = (turn: 'player' | 'opponent', { r, c }: BoardCoordinate) => {
    console.log('boop');

    playerMessage.innerText = 'Boop!';

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
                hand(neighborPiece.owner).append(neighborPiece);
            }));

            animation.play();
        }
    }

    Promise.all(animationPromises).then(() => {
        if (turn == 'player') {
            playerPostBoop();
        } else {
            opponentPostBoop();
        }
    });
}

function playerPostBoop() {
    console.log('playerPostBoop');

    const playerWins = board.hasWinningTriplet('player');

    if (playerWins) {
        setTimeout(() => endGame('player'));
        return;
    }

    const canGraduate = board.canGraduate('player');
    const canRetrieve = playerHand.isEmpty();

    if (!(canGraduate || canRetrieve)) {
        setTimeout(() => opponentTurn());
        return;
    }

    if (canGraduate && canRetrieve) {
        playerMessage.innerText = 'Choose three pieces in a row to graduate, or one piece to return to your hand.';
    } else if (canGraduate) {
        playerMessage.innerText = 'Choose three pieces in a row to graduate.';
    } else if (canRetrieve) {
        playerMessage.innerText = 'Choose one piece to return to your hand.';
    }

    const controller = new AbortController();

    playerConfirmButton.hidden = false;

    const selected: BoardCoordinate[] = [];

    const updateConfirmButton = () => {
        if (selected.length == 0) {
            playerConfirmButton.disabled = true;
            if (canGraduate && canRetrieve) {
                playerConfirmButton.value = '';
            } else if (canGraduate) {
                playerConfirmButton.value = 'Graduate';
            } else if (canRetrieve) {
                playerConfirmButton.value = 'Retrieve';
            }
        } else if (selected.length == 1) {
            if (canRetrieve) {
                playerConfirmButton.disabled = false;
                playerConfirmButton.value = 'Retrieve';
            } else {
                playerConfirmButton.disabled = true;
                playerConfirmButton.value = 'Graduate';
            }
        } else if (selected.length == 2) {
            // canGraduate must be true
            playerConfirmButton.disabled = true;
            playerConfirmButton.value = 'Graduate';
        } else if (selected.length == 3) {
            playerConfirmButton.disabled = false;
            playerConfirmButton.value = 'Graduate';
        }
    }

    updateConfirmButton();

    playerConfirmButton.addEventListener('click', () => {
        controller.abort();

        for (const coordinate of selected) {
            const cell = board.get(coordinate)!;
            const piece = cell.piece!;
            cell.piece = null;
            piece.element.classList.remove('selected');
            playerHand.append(piece);

            if (playerConfirmButton.value == 'Graduate') {
                piece.graduate();
            }
        }

        playerConfirmButton.disabled = true;
        playerConfirmButton.hidden = true;

        opponentTurn();
    }, { signal: controller.signal });

    // A triplet is selectable if every selected cell is in that triplet.
    const getSelectableTriplets = () =>
        Array.from(board.triplets('player')).filter((triplet) =>
            selected.every((selectedCoordinate) =>
                triplet.some((tripletCoordinate) =>
                    boardCoordinateEq(selectedCoordinate, tripletCoordinate))));

    let selectableTriplets = getSelectableTriplets();

    for (const [coordinate, cell] of board) {
        if (cell.piece) {
            const piece = cell.piece;
            piece.element.addEventListener('click', () => {
                // If piece is selected, deselect it
                let idx = selected.findIndex((selectedCoordinate) => boardCoordinateEq(coordinate, selectedCoordinate));
                if (idx != -1) {
                    selected.splice(idx, 1);
                    piece.element.classList.remove('selected');
                }

                // Otherwise, if there are no pieces selected, select this piece
                else if (selected.length == 0) {
                    selected.push(coordinate);
                    piece.element.classList.add('selected');
                }

                // Otherwise, if this piece is part of a selectable triplet, select this piece
                else if (selectableTriplets.some((triplet) => triplet.some((tripletCoordinate) => boardCoordinateEq(coordinate, tripletCoordinate)))) {
                    selected.push(coordinate);
                    piece.element.classList.add('selected');
                }

                // Finally, update the confirm button and update the selectable triplets
                selectableTriplets = getSelectableTriplets();
                updateConfirmButton();
            }, { signal: controller.signal });
        }
    }
}

function opponentPostBoop() {
    console.log('opponentPostBoop');

    const opponentWins = board.hasWinningTriplet('opponent');

    if (opponentWins) {
        setTimeout(() => endGame('opponent'));
        return;
    }

    const canGraduate = board.canGraduate('opponent');
    const canRetrieve = opponentHand.isEmpty();

    if (!(canGraduate || canRetrieve)) {
        setTimeout(() => playerTurn());
        return;
    }

    const options: (() => void)[] = [];

    if (canGraduate) {
        for (const triplet of board.triplets('opponent')) {
            options.push(() => {
                triplet.forEach((coordinate) => {
                    const cell = board.get(coordinate)!;
                    const piece = cell.piece!;
                    cell.piece = null;
                    piece.graduate();
                    opponentHand.append(piece);
                })
            });
        }
    }

    if (canRetrieve) {
        for (const [_, cell] of board) {
            if (cell.piece?.owner == 'opponent') {
                const piece = cell.piece;
                options.push(() => {
                    cell.piece = null;
                    opponentHand.append(piece);
                })
            }
        }
    }

    const choice = options[Math.floor(Math.random() * options.length)];

    choice();

    setTimeout(() => playerTurn());
}

const endGame = (winner: 'player' | 'opponent') => {
    console.log(`Winner: ${winner}`);
    if (winner == 'player') {
        playerMessage.innerText = 'You won!';
    } else {
        playerMessage.innerText = 'Somehow, you lost...';
    }
}
