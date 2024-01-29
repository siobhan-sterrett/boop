import { EntityID } from "./entityID";
import { getPosition } from "./positionable";

type Drawable = {
    path: Path2D;
    fillStyle: CanvasRenderingContext2D['fillStyle'];
}

const drawables: Map<EntityID, Drawable> = new Map();

export const addDrawable = (entityID: EntityID, drawable: Drawable) => {
    drawables.set(entityID, drawable);
}

export const getPath = (entityID: EntityID): Path2D | undefined => drawables.get(entityID)?.path;

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
export const ctx = canvas.getContext('2d');

export const drawAll = () => {
    ctx.clearRect(0, 0, 600, 800);

    for (const [entityID, { path, fillStyle }] of drawables) {
        const [x, y] = getPosition(entityID);
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.fillStyle = fillStyle;
        ctx.fill(path);
        ctx.restore();
    }
}
