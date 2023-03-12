import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {PlatformType} from "../types";
import {getGameConfig} from "../core/config";

export async function createPlatform(level: GameLevel, at: Vec3, type: PlatformType) {
    const platformOscDistance = getGameConfig("PLATFORM.OSCILLATION.DISTANCE", true);
    const platformOscVelocity = getGameConfig("PLATFORM.OSCILLATION.VELOCITY", true);

    const object3D = level.physics.add.box({
        width: 2,
        height: .4,
        depth: 1,
        x: at.x,
        y: at.y,
        z: at.z,
        collisionFlags: type.oscillating || type.breakable ? 2 : 1,
        breakable: type.breakable
    }, {
        lambert: {
            color: type.boost ? 0xffff00 : 0xffffff
        }
    });
    object3D.userData["platform"] = true;
    object3D.userData["boostPlatform"] = type.boost;

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "physicsObject", object3D);
    level.universe.attachComponent(uuid, "platform", {
        ...type, originalX: at.x, speed: platformOscVelocity
    });

    level.universe.registerSystem("platformSystem", ({createView}) => {
        const view = createView("platform", "physicsObject");
        for (const {platform, physicsObject} of view) {
            if (!platform.oscillating) {
                continue;
            }

            physicsObject.position.x = physicsObject.position.x + platform.speed;
            physicsObject.body.needUpdate = true;

            const minX = platform.originalX - platformOscDistance;
            const maxX = platform.originalX + platformOscDistance;
            if (
                physicsObject.position.x <= minX ||
                physicsObject.position.x >= maxX
            ) {
                platform.speed *= -1;
            }
        }
    });
}
