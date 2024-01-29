import { setPiece } from "./cell";
import { addDraggable } from "./draggable";
import { addDrawable } from "./drawable";
import { getDropTarget, getDropPosition } from "./dropTarget";
import { EntityID, getNextEntityID } from "./entityID";
import { addMoveable } from "./moveable";
import { addPositionable } from "./positionable";

export type Piece = {
    kind: 'cat' | 'kitten',
    color: 'orange' | 'gray',
}

const pieces: Map<EntityID, Piece> = new Map();

const addPiece = (entityID: EntityID, piece: Piece) => {
    pieces.set(entityID, piece);
}

export const createPiece = (kind: Piece['kind'], color: Piece['color']): EntityID => {
    const entityID = getNextEntityID();

    addPiece(entityID, { kind, color });

    addDrawable(entityID, (() => {
        const path = new Path2D();
        const radius = kind == 'cat' ? 25 : 15;
        path.ellipse(0, 0, radius, radius, 0, 0, 2 * Math.PI);

        return {
            path,
            fillStyle: color,
        }
    })());

    addPositionable(entityID, {
        position: [100, 700]
    });

    addDraggable(entityID, {
        onDrop: ([offsetX, offsetY]) => {
            const dropTarget = getDropTarget([offsetX, offsetY]);
            if (dropTarget) {
                const dropPosition = getDropPosition(dropTarget)!;
                addMoveable(entityID, {
                    speed: 10,
                    target: dropPosition,
                    onComplete: () => setPiece(dropTarget, { kind, color })
                })
            } else {
                addMoveable(entityID, {
                    speed: 10,
                    target: [100, 700]
                })

            }
        }
    });

    return entityID;
}

export const createHand = (color: Piece['color'], owner: 'player' | 'opponent') => {
    const path = new Path2D();
    path.ellipse(0, 0, 15, 15, 0, 0, 2 * Math.PI);

    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 2; ++j) {
            const entityID = getNextEntityID();
            addPiece(entityID, { kind: 'kitten', color });
            addDrawable(entityID, { path: new Path2D(path), fillStyle: color });

            const x = 180 + 80 * i;
            const y = (owner == 'player' ? 660 : 60) + 80 * j;

            addPositionable(entityID, { position: [x, y] });
        }
    }
}
