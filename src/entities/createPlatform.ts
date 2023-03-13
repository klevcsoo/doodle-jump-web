import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {PlatformType} from "../types";
import {getGameConfig} from "../core/config";

export function createPlatform(level: GameLevel, at: Vec3, type: PlatformType) {
    const platformOscDistance = getGameConfig("PLATFORM.OSCILLATION.DISTANCE", true);
    const platformOscVelocity = getGameConfig("PLATFORM.OSCILLATION.VELOCITY", true);
    const platformTag = getGameConfig("OBJECT.TAG.PLATFORM", false);
    const boostPlatformTag = getGameConfig("OBJECT.TAG.BOOST_PLATFORM", false);
    const maxVSpace = getGameConfig("PLATFORM.GENERATION.MAX_VERTICAL_SPACE", true);

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
    object3D.userData[platformTag] = true;
    object3D.userData[boostPlatformTag] = type.boost;

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "physicsObject", object3D);
    level.universe.attachComponent(uuid, "platform", {
        ...type, originalX: at.x, movementDelay: Math.random() * 10
    });

    level.universe.registerSystem("platformSystem", ({createView}, time) => {
        let playerAltitude: number | null = null;
        for (const {player} of createView("player")) {
            playerAltitude = player.altitude;
        }

        const view = createView("platform", "physicsObject");
        for (const {platform, physicsObject, uuid} of view) {
            if (
                playerAltitude &&
                physicsObject.position.y < playerAltitude - maxVSpace * 3
            ) {
                level.deleteEntity(uuid, physicsObject);
            }

            if (!platform.oscillating) {
                continue;
            }

            const alpha = Math.sin(time * platformOscVelocity + platform.movementDelay);
            physicsObject.position.x = platform.originalX + (platformOscDistance * alpha);
            physicsObject.body.needUpdate = true;
        }
    });
}
