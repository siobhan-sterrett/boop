export type EntityID = number;

let nextEntityID = 1;

export const getNextEntityID = (): EntityID => nextEntityID++;
