import {GameLevel} from "../core/level";
import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";
import {Vec3} from "../core/vec3";
import {isInRange} from "../utils";

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

// TODO: put these in a component ffs
let maxAltitude = 0;
let lastPlatformX = 0;

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

        // increase generation altitude
        maxAltitude += 5;

        // keep generating, until x is out of a specified range,
        // to prevent platforms generating right above each other
        let platformX: number;
        do {
            platformX = Math.random() * 10 - 5;
        } while (isInRange(platformX, [lastPlatformX - 2, lastPlatformX + 2]));
        lastPlatformX = platformX;

        // generate the platform
        const platformVector = new Vec3(platformX, maxAltitude, 0);
        createPlatform(level, platformVector).then(() => {
            console.log("GENERATED PLATFORM: ", maxAltitude, platformX);
        });
    };
}
