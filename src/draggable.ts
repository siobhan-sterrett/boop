import { getPath } from "./drawable";
import { Entity } from "./entity";
import { getPosition, setPosition } from "./positionable";

type Draggable = {
    onDrop?: (offset: [number, number]) => void;
};

const draggables: Map<Entity, Draggable> = new Map();

let currentDraggable: Entity | undefined = undefined;

export const addDraggable = (entity: Entity, draggable: Draggable) => {
    draggables.set(entity, draggable);
}

export const deleteDraggable = (entity: Entity) => {
    draggables.delete(entity);
}

const dropCurrentDraggable = (offset: [number, number]) => {
    if (currentDraggable) {
        const { onDrop } = draggables.get(currentDraggable);
        if (onDrop) {
            onDrop(offset)
        }

        currentDraggable = undefined;
    }
}

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

export const startDrag = (event: MouseEvent) => {
    for (const [entity] of draggables) {
        const path = getPath(entity);
        const [x, y] = getPosition(entity);

        ctx.save();
        ctx.translate(x, y);
        if (ctx.isPointInPath(path, event.offsetX, event.offsetY)) {
            currentDraggable = entity;
            ctx.restore();
            return;
        }
        ctx.restore();
    }

    currentDraggable = undefined;
}

export const doDrag = (event: MouseEvent) => {
    if (currentDraggable) {
        setPosition(currentDraggable, [event.offsetX, event.offsetY]);
    }
}

export const endDrag = (event: MouseEvent) => {
    dropCurrentDraggable([event.offsetX, event.offsetY]);
}
