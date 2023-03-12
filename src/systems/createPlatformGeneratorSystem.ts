import {GameLevel} from "../core/level";
import {EntitySystem} from "necst";
import {ComponentMap, PlatformType, SystemList} from "../types";
import {Vec3} from "../core/vec3";
import {isInRange, takeChance} from "../utils";
import {createPlatform} from "../entities/createPlatform";

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

        // decide on platform type
        const platformType: PlatformType = {
            oscillating: takeChance(.25),
            breakable: takeChance(0)
        };

        // generate the platform
        const platformVector = new Vec3(platformX, maxAltitude, 0);
        createPlatform(level, platformVector, platformType).then(() => {
            console.log("GENERATED PLATFORM: ", maxAltitude, platformX, platformType);
        });
    };
}
