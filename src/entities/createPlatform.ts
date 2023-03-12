import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {PlatformType} from "../types";

const PLATFORM_OSCILLATION_DISTANCE = 2;

export async function createPlatform(level: GameLevel, at: Vec3, type: PlatformType) {
    const object3D = level.physics.add.box({
        width: 2,
        height: .4,
        depth: 1,
        x: at.x,
        y: at.y,
        z: at.z,
        collisionFlags: type.oscillating || type.breakable ? 2 : 1,
        breakable: type.breakable
    }, {lambert: {color: 0xffffff}});

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "physicsObject", object3D);
    level.universe.attachComponent(uuid, "platform", {
        ...type, originalX: at.x, speed: .05
    });

    level.universe.registerSystem("platformSystem", ({createView}) => {
        const view = createView("platform", "physicsObject");
        for (const {platform, physicsObject} of view) {
            if (!platform.oscillating) {
                continue;
            }

            physicsObject.position.x = physicsObject.position.x + platform.speed;
            physicsObject.body.needUpdate = true;

            const minX = platform.originalX - PLATFORM_OSCILLATION_DISTANCE;
            const maxX = platform.originalX + PLATFORM_OSCILLATION_DISTANCE;
            if (
                physicsObject.position.x <= minX ||
                physicsObject.position.x >= maxX
            ) {
                platform.speed *= -1;
            }
        }
    });
}
