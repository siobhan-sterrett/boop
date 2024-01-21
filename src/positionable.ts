import { EntityID } from "./entityID";

type Positionable = {
    position: [number, number];
}

const positionables: Map<EntityID, Positionable> = new Map();

export const addPositionable = (entity: EntityID, positionable: Positionable) => {
    positionables.set(entity, positionable);
}

export const deletePositionable = (entity: EntityID) => {
    positionables.delete(entity);
}

export const getPosition = (entity: EntityID): [number, number] | undefined => positionables.get(entity)?.position;

export const setPosition = (entity: EntityID, position: [number, number]) => {
    positionables.set(entity, { position });
}
