import {GameLevel} from "../core/level";
import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";
import {Vec3} from "../core/vec3";

async function createPlatform(level: GameLevel, at: Vec3) {
    const object3D = level.physics.add.box({
        width: 2,
        height: .4,
        depth: 1,
        x: at.x,
        y: at.y,
        z: at.z,
        collisionFlags: 1
    }, {lambert: {color: 0xffffff}});

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "physicsObject", object3D);
}

let maxAltitude = 0;

export function createPlatformGeneratorSystem(
    level: GameLevel
): EntitySystem<ComponentMap, SystemList> {
    return ({createView}) => {
        let playerAltitude: number | null = null;
        for (const {player} of createView("player")) {
            playerAltitude = player.altitude;
        }

        if (!playerAltitude || playerAltitude + 40 < maxAltitude) {
            return;
        }

        maxAltitude += 5;
        const platformX = Math.random() * 10 - 5;
        const platformVector = new Vec3(platformX, maxAltitude, 0);
        createPlatform(level, platformVector).then(() => {
            console.log("platform created at", JSON.stringify(platformVector));
        });
    };
}
