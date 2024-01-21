import { Entity } from "./entity";

type Positionable = {
    position: [number, number];
}

const positionables: Map<Entity, Positionable> = new Map();

export const addPositionable = (entity: Entity, positionable: Positionable) => {
    positionables.set(entity, positionable);
}

export const deletePositionable = (entity: Entity) => {
    positionables.delete(entity);
}

export const getPosition = (entity: Entity): [number, number] | undefined => positionables.get(entity)?.position;

export const setPosition = (entity: Entity, position: [number, number]) => {
    positionables.set(entity, { position });
}
