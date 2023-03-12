import {GameLevel} from "../core/level";
import {getGameConfig} from "../core/config";
import {isInRange, takeChance} from "../utils";
import {PlatformType} from "../types";
import {Vec3} from "../core/vec3";
import {createPlatform} from "./createPlatform";

export function createPlatformGenerator(level: GameLevel) {
    const oscChance = getGameConfig("PLATFORM.GENERATION.OSCILLATING", true);
    const brChance = getGameConfig("PLATFORM.GENERATION.BREAKING", true);
    const boostChance = getGameConfig("PLATFORM.GENERATION.BOOST", true);
    const maxHSpace = getGameConfig("PLATFORM.GENERATION.MAX_HORIZONTAL_SPACE", true);
    const maxVSpace = getGameConfig("PLATFORM.GENERATION.MAX_VERTICAL_SPACE", true);
    const minRelDistance = getGameConfig("PLATFORM.GENERATION.MIN_RELATIVE_DISTANCE", true);
    const relMaxAlt = getGameConfig("PLATFORM.GENERATION.RELATIVE_MAX_ALTITUDE", true);

    const halfMaxHSpace = maxHSpace / 2;

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "platformGenerator", {
        lastPlatformX: 0,
        maxAltitude: 0
    });

    level.universe.registerSystem("platformGeneratorSystem", ({createView}) => {
        const view = createView("platformGenerator");
        for (const {platformGenerator} of view) {
            let playerAltitude: number | null = null;
            for (const {player} of createView("player")) {
                playerAltitude = player.altitude;
            }

            if (
                !playerAltitude ||
                playerAltitude + relMaxAlt < platformGenerator.maxAltitude
            ) {
                return;
            }

            // increase generation altitude
            platformGenerator.maxAltitude += maxVSpace;

            // keep generating, until x is out of a specified range,
            // to prevent platforms generating right above each other
            let platformX: number;
            do {
                platformX = Math.random() * maxHSpace - halfMaxHSpace;
            } while (isInRange(platformX, [
                platformGenerator.lastPlatformX - minRelDistance,
                platformGenerator.lastPlatformX + minRelDistance
            ]));
            platformGenerator.lastPlatformX = platformX;

            // decide on platform type
            const platformType: PlatformType = {
                oscillating: takeChance(oscChance),
                breakable: takeChance(brChance),
                boost: takeChance(boostChance)
            };

            // generate the platform
            const platformVector = new Vec3(platformX, platformGenerator.maxAltitude, 0);
            createPlatform(level, platformVector, platformType).then(() => {
                console.log(
                    "GENERATED PLATFORM: ",
                    platformGenerator.maxAltitude,
                    platformX, platformType
                );
            });
        }
    });
}
