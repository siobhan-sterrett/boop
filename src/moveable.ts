import { EntityID } from "./entityID";
import { getPosition, setPosition } from "./positionable";

type Moveable = {
    speed: number;
    target: [number, number];
    onComplete?: (entityID: EntityID) => void;
}

const moveables: Map<EntityID, Moveable> = new Map();

export const addMoveable = (entityID: EntityID, moveable: Moveable) => {
    moveables.set(entityID, moveable);
}

export const deleteMoveable = (entityID: EntityID) => {
    moveables.delete(entityID);
}

export const moveAll = () => {
    for (const [entityID, { speed, target: [targetX, targetY], onComplete }] of moveables) {
        const [x, y] = getPosition(entityID);
        const [distanceX, distanceY] = [targetX - x, targetY - y];
        const squaredDistance = distanceX ** 2 + distanceY ** 2;
        if (squaredDistance < speed ** 2) {
            setPosition(entityID, [targetX, targetY]);
            deleteMoveable(entityID);
            if (onComplete) {
                onComplete(entityID);
            }
        } else {
            const distance = Math.sqrt(squaredDistance);
            const [speedX, speedY] = [distanceX / distance * speed, distanceY / distance * speed];
            setPosition(entityID, [x + speedX, y + speedY]);
        }
    }
}
