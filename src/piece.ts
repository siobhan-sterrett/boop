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

export const addPiece = (entityID: EntityID, piece: Piece) => {
    pieces.set(entityID, piece);
}

export const deletePiece = (entityID: EntityID) => {
    pieces.delete(entityID);
}

export const getPiece = (entityID: EntityID): Piece | undefined => pieces.get(entityID);

export const createPiece = (kind: Piece['kind'], color: Piece['color']): EntityID => {
    const entityID = getNextEntityID();

    addPiece(entityID, { kind, color });

    addDrawable(entityID, (() => {
        const path = new Path2D();
        path.ellipse(0, 0, 15, 15, 0, 0, 2 * Math.PI);

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
                    target: dropPosition
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
