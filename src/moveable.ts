import { EntityID } from "./entityID";
import { getPosition, setPosition } from "./positionable";

type Moveable = {
    speed: number;
    target: [number, number];
}

const moveables: Map<EntityID, Moveable> = new Map();

export const addMoveable = (entity: EntityID, moveable: Moveable) => {
    moveables.set(entity, moveable);
}

export const deleteMoveable = (entity: EntityID) => {
    moveables.delete(entity);
}

export const moveAll = () => {
    for (const [entity, { speed, target: [targetX, targetY] }] of moveables) {
        const [x, y] = getPosition(entity);
        const [distanceX, distanceY] = [targetX - x, targetY - y];
        const squaredDistance = distanceX ** 2 + distanceY ** 2;
        if (squaredDistance < speed ** 2) {
            setPosition(entity, [targetX, targetY]);
            deleteMoveable(entity);
        } else {
            const distance = Math.sqrt(squaredDistance);
            const [speedX, speedY] = [distanceX / distance * speed, distanceY / distance * speed];
            setPosition(entity, [x + speedX, y + speedY]);
        }
    }
}
