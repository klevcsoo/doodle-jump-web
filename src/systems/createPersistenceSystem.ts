import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";
import {getGameConfig} from "../core/config";
import {DebugDisplay} from "../ui/DebugDisplay";

export function createPersistenceSystem(): EntitySystem<ComponentMap, SystemList> {
    const maxAltitudeKey = getGameConfig("STORAGE.KEY.MAX_ALTITUDE", false);
    const starsKey = getGameConfig("STORAGE.KEY.STARS", false);

    return ({createView}) => {
        for (const {player} of createView("player")) {
            const savedMax = localStorage.getItem(maxAltitudeKey) ?? 0;
            if (player.altitude > savedMax) {
                localStorage.setItem(maxAltitudeKey, String(player.altitude));
            }
            localStorage.setItem(starsKey, String(player.starsCollected));

            DebugDisplay.update("max_altitude", savedMax);
        }
    };
}
