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
