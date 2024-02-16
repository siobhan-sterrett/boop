export type Theme = {
    pieces: {
        player: string;
        opponent: string;
    };
    board: [string, string];
};

export const DEFAULT_THEME: Theme = {
    pieces: {
        player: '#e07729',
        opponent: '#9f9d9b',
    },
    board: ['#3d4e6e', '#303345'],
};
