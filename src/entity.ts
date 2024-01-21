export type Entity = number;

let nextEntity = 1;

export const createEntity = (): Entity => nextEntity++;
