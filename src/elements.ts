export const screens = (() => {
    const menuScreen = document.getElementById('game-menu');
    if (!menuScreen) {
        throw new Error('game menu not found');
    }

    const playAreaScreen = document.getElementById('game-play-area');
    if (!playAreaScreen) {
        throw new Error('game play area not found');
    }

    return {
        'game-menu': menuScreen,
        'game-play-area': playAreaScreen,
    };
})();

export const showScreen = (screenName: keyof typeof screens) => {
    for (const [name, screen] of Object.entries(screens)) {
        if (name == screenName) {
            screen.hidden = false;
        } else {
            screen.hidden = true;
        }
    }
}

export const playGameButton = (() => {
    const playGameButton = document.getElementById('play-game-button');
    if (!playGameButton) {
        throw new Error('play game button not found');
    }
    return playGameButton;
})();

export const board = (() => {
    const board = document.getElementById('board');
    if (!board) {
        throw new Error('board not found');
    }
    return board;
})();

export const cells = (() => {
    const cells: Element[][] = [];

    for (const rowElement of board.children) {
        const row: Element[] = [];
        for (const cell of rowElement.children) {
            row.push(cell);
        }
        cells.push(row);
    }

    return cells;
})();

export const getCell = (r: number, c: number): Element | undefined => {
    const row = cells[r];
    if (row) {
        const cell = row[c];
        if (cell) {
            return cell;
        }
    }
}

export const getEmptyCells = (): [[number, number], Element][] => {
    const emptyCells: [[number, number], Element][] = [];

    cells.forEach((row, rowIdx) => {
        row.forEach((cell, colIdx) => {
            if (!cell.hasChildNodes()) {
                emptyCells.push([[rowIdx, colIdx], cell]);
            }
        });
    });

    return emptyCells;
}

export const playerHand = (() => {
    const playerHand = document.getElementById('player-hand');
    if (!playerHand) {
        throw new Error('player hand not found');
    }
    return playerHand;
})();

export const opponentHand = (() => {
    const opponentHand = document.getElementById('opponent-hand');
    if (!opponentHand) {
        throw new Error('opponent hand not found');
    }
    return opponentHand;
})();
