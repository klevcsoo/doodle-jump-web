import {GameLevel} from "../core/level";
import {EntitySystem} from "necst";
import {ComponentMap, PlatformType, SystemList} from "../types";
import {Vec3} from "../core/vec3";
import {isInRange, takeChance} from "../utils";
import {createPlatform} from "../entities/createPlatform";
import {getGameConfig} from "../core/config";

// TODO: put these in a component ffs
let maxAltitude = 0;
let lastPlatformX = 0;

export function createPlatformGeneratorSystem(
    level: GameLevel
): EntitySystem<ComponentMap, SystemList> {
    const oscChance = getGameConfig("PLATFORM.GENERATION.OSCILLATING", true);
    const brChance = getGameConfig("PLATFORM.GENERATION.BREAKING", true);
    const maxHSpace = getGameConfig("PLATFORM.GENERATION.MAX_HORIZONTAL_SPACE", true);
    const maxVSpace = getGameConfig("PLATFORM.GENERATION.MAX_VERTICAL_SPACE", true);
    const minRelDistance = getGameConfig("PLATFORM.GENERATION.MIN_RELATIVE_DISTANCE", true);
    const relMaxAlt = getGameConfig("PLATFORM.GENERATION.RELATIVE_MAX_ALTITUDE", true);

    const halfMaxHSpace = maxHSpace / 2;

    return ({createView}) => {
        let playerAltitude: number | null = null;
        for (const {player} of createView("player")) {
            playerAltitude = player.altitude;
        }

        if (!playerAltitude || playerAltitude + relMaxAlt < maxAltitude) {
            return;
        }

        // increase generation altitude
        maxAltitude += maxVSpace;

        // keep generating, until x is out of a specified range,
        // to prevent platforms generating right above each other
        let platformX: number;
        do {
            platformX = Math.random() * maxHSpace - halfMaxHSpace;
        } while (isInRange(platformX, [
            lastPlatformX - minRelDistance, lastPlatformX + minRelDistance
        ]));
        lastPlatformX = platformX;

        // decide on platform type
        const platformType: PlatformType = {
            oscillating: takeChance(oscChance),
            breakable: takeChance(brChance)
        };

        // generate the platform
        const platformVector = new Vec3(platformX, maxAltitude, 0);
        createPlatform(level, platformVector, platformType).then(() => {
            console.log("GENERATED PLATFORM: ", maxAltitude, platformX, platformType);
        });
    };
}
