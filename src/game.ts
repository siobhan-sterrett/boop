import { cells, getCell, getEmptyCells, getTriplets, opponentHand, playGameButton, playerHand, showScreen } from "./elements"

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

    for (const pieceElement of playerHand.children) {
        pieceElement.addEventListener('dragstart', (ev: DragEvent) => {
            if (ev.dataTransfer) {
                ev.dataTransfer.setData('application/boop', pieceElement.id);
                ev.dataTransfer.effectAllowed = 'move';
            }
        });
    }

    cells.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
            cell.addEventListener('highlight', () => cell.classList.add('cell-highlighted'));
            cell.addEventListener('unhighlight', () => cell.classList.remove('cell-highlighted'));
            cell.addEventListener('drop', (ev: DragEvent) => {
                if (ev.dataTransfer) {
                    const pieceId = ev.dataTransfer.getData('application/boop');
                    cell.appendChild(document.getElementById(pieceId)!);
                }

                cell.dispatchEvent(new Event('unhighlight'));
                setTimeout(() => playerPiecePlaced(rowIdx, colIdx));
                ev.preventDefault();
            });
        })
    })

    // TODO: For now, player always goes first
    setTimeout(playerTurn);
}

const playerTurn = () => {
    console.log('playerTurn');
    for (const element of playerHand.children) {
        element.setAttribute('draggable', 'true');
    }

    for (const [_, cell] of getEmptyCells()) {
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('dragenter', onDragEnter);
        cell.addEventListener('dragleave', onDragLeave);
    }
}

const opponentTurn = () => {
    console.log('opponentTurn');
    const emptyCells = getEmptyCells();

    const [[r, c], target] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    const piece = opponentHand.children[0];
    opponentHand.removeChild(piece);
    target.appendChild(piece);

    setTimeout(() => boop('opponent', r, c));
}

const playerPiecePlaced = (r: number, c: number) => {
    console.log('playerPiecePlaced');
    // Set player cells not draggable
    for (const element of document.getElementsByClassName('player-piece')) {
        element.setAttribute('draggable', 'false');
    }

    // Remove drop targets from board
    for (const row of cells) {
        for (const cell of row) {
            cell.removeEventListener('dragover', onDragOver);
            cell.removeEventListener('dragenter', onDragEnter);
            cell.removeEventListener('dragleave', onDragLeave);
        }
    }

    setTimeout(() => boop('player', r, c));
}

const boop = (turn: 'player' | 'opponent', r: number, c: number) => {
    console.log('boop');
    const vectors: [number, number][] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1],
    ];

    const animationPromises: Promise<unknown>[] = [];

    const cell = getCell(r, c)!;
    const boopingPiece = cell.children[0];

    for (const [dr, dc] of vectors) {
        const neighbor = getCell(r + dr, c + dc);

        if (!neighbor?.hasChildNodes()) {
            continue;
        }

        const { height, width } = neighbor.getBoundingClientRect();

        const piece = neighbor.children[0];

        if (boopingPiece.classList.contains('kitten') && piece.classList.contains('cat')) {
            continue;
        }

        const target = getCell(r + 2 * dr, c + 2 * dc);

        if (target) {
            if (!target.hasChildNodes()) {
                const animation = new Animation(new KeyframeEffect(piece, [
                    { transform: "translate(0px, 0px)" },
                    { transform: `translate(${width * dc}px, ${height * dr}px)` }
                ], 500));

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
                ], 500));

                animationPromises.push(animation.finished);

                animation.play();
            }
        } else {
            const animation = new Animation(new KeyframeEffect(piece, [
                { transform: "translate(0px, 0px)" },
                { transform: `translate(${width * dc}px, ${height * dr}px)` }
            ], 500));

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

    Promise.all(animationPromises).then(() => { setTimeout(() => postBoop(turn)) });
}

const postBoop = (turn: 'player' | 'opponent') => {
    console.log('postBoop');

    const triplets = getTriplets(turn);

    const winningTriplet = triplets.find((triplet) =>
        triplet.every(([r, c]) => {
            const cell = getCell(r, c);
            const piece = cell?.children[0];
            return piece?.classList.contains('cat');
        })
    );

    if (winningTriplet) {
        setTimeout(() => endGame(turn));
    } else {
        if (triplets.length == 1) {
            setTimeout(() => graduateTriplet(turn, triplets[0]));
        } else if (triplets.length > 1) {
            setTimeout(() => chooseTripletToGraduate(triplets));
        } else {
            if (turn == 'player') {
                setTimeout(opponentTurn, 500);
            } else {
                setTimeout(playerTurn, 500);
            }
        }
    }
}

const graduateTriplet = (turn: 'player' | 'opponent', triplet: [[number, number], [number, number], [number, number]]) => {
    console.log('graduateTriplet');

    for (const [r, c] of triplet) {
        const cell = getCell(r, c)!;
        const piece = cell.children[0];
        cell.removeChild(piece);
        if (piece.classList.contains('kitten')) {
            piece.classList.remove('kitten');
            piece.classList.add('cat');
        }
        if (turn == 'player') {
            playerHand.appendChild(piece);
        } else {
            opponentHand.appendChild(piece);
        }
    }

    if (turn == 'player') {
        setTimeout(opponentTurn, 500);
    } else {
        setTimeout(playerTurn, 500);
    }
}

const chooseTripletToGraduate = (triplets: [[number, number], [number, number], [number, number]][]) => {
    console.log('chooseTripletToGraduate');
    // TODO
}

const endGame = (winner: 'player' | 'opponent') => {
    console.log('endGame');
    // TODO
}
