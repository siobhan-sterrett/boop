import { getPath } from "./drawable";
import { Entity } from "./entity";
import { getPosition } from "./positionable";

export type DropTarget = {
    dropPosition: [number, number];
};

const dropTargets: Map<Entity, DropTarget> = new Map();

export const addDropTarget = (entity: Entity, dropTarget: DropTarget) => {
    dropTargets.set(entity, dropTarget);
}

export const removeDropTarget = (entity: Entity) => {
    dropTargets.delete(entity);
}

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

export const getDropTarget = ([offsetX, offsetY]: [number, number]): Entity | undefined => {
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

export const getDropPosition = (entity: Entity): [number, number] | undefined => dropTargets.get(entity)?.dropPosition;
