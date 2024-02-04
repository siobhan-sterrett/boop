import { cells, getCell, getEmptyCells, opponentHand, playGameButton, playerHand, showScreen } from "./elements"

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

                cell.classList.remove('cell-highlighted');
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
    nextTurn = opponentTurn;
    if (playerHand.hasChildNodes()) {
        setTimeout(placePlayerPiece);
    } else {
        setTimeout(graduatePlayerPiece);
    }
}

const opponentTurn = () => {
    nextTurn = playerTurn;
    if (opponentHand.hasChildNodes()) {
        setTimeout(placeOpponentPiece);
    } else {
        setTimeout(graduateOpponentPiece);
    }
}

let nextTurn: () => void = playerTurn;

const graduatePlayerPiece = () => {
    console.log('graduatePlayerPiece');
    // TODO
}

const graduateOpponentPiece = () => {
    console.log('graduateOpponentPiece');
    // TODO
}

const placePlayerPiece = () => {
    console.log('placePlayerPiece');
    for (const element of playerHand.children) {
        element.setAttribute('draggable', 'true');
    }

    for (const [_, cell] of getEmptyCells()) {
        cell.addEventListener('dragover', onDragOver);
        cell.addEventListener('dragenter', onDragEnter);
        cell.addEventListener('dragleave', onDragLeave);
    }
}

const placeOpponentPiece = () => {
    console.log('placeOpponentPiece');
    const emptyCells = getEmptyCells();

    const [[r, c], target] = emptyCells[Math.floor(Math.random() * emptyCells.length)];

    const piece = opponentHand.children[0];
    opponentHand.removeChild(piece);
    target.appendChild(piece);

    setTimeout(() => boop(r, c));
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

    setTimeout(() => boop(r, c));
}

const boop = (r: number, c: number) => {
    console.log('boop');
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

        const piece = neighbor.children[0];

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

    Promise.all(animationPromises).then(() => { setTimeout(nextTurn, 500) });
}
