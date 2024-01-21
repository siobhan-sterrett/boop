import { Entity } from "./entity";
import { getPosition } from "./positionable";

type Drawable = {
    path: Path2D;
    fillStyle: CanvasRenderingContext2D['fillStyle'];
}

const drawables: Map<Entity, Drawable> = new Map();

export const addDrawable = (entity: Entity, drawable: Drawable) => {
    drawables.set(entity, drawable);
}

export const deleteDrawable = (entity: Entity) => {
    drawables.delete(entity);
}

export const getPath = (entity: Entity): Path2D | undefined => drawables.get(entity)?.path;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

export const drawAll = () => {
    ctx.clearRect(0, 0, 600, 800);
    for (const [entity, { path, fillStyle }] of drawables) {
        const [x, y] = getPosition(entity);
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.fill(path);
        ctx.restore();
    }
}
