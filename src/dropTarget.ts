import { getPath } from "./drawable";
import { EntityID } from "./entityID";
import { getPosition } from "./positionable";

export type DropTarget = {
    dropPosition: [number, number];
};

const dropTargets: Map<EntityID, DropTarget> = new Map();

export const addDropTarget = (entity: EntityID, dropTarget: DropTarget) => {
    dropTargets.set(entity, dropTarget);
}

export const removeDropTarget = (entity: EntityID) => {
    dropTargets.delete(entity);
}

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

export const getDropTarget = ([offsetX, offsetY]: [number, number]): EntityID | undefined => {
    for (const [entity] of dropTargets) {
        const path = getPath(entity);
        const [x, y] = getPosition(entity);
        ctx.save();
        ctx.translate(x, y);
        if (ctx.isPointInPath(path, offsetX, offsetY)) {
            ctx.restore();
            return entity;
        }
        ctx.restore();
    }

    return undefined;
}

export const getDropPosition = (entity: EntityID): [number, number] | undefined => dropTargets.get(entity)?.dropPosition;
