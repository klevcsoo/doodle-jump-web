import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";
import {currentInput} from "../core/input";

export function createInputBroadcasterSystem(): EntitySystem<ComponentMap, SystemList> {
    return ({createView}) => {
        const input = currentInput();
        for (const {inputReceiver} of createView("inputReceiver")) {
            inputReceiver.keyboard = input.keyboard;
            inputReceiver.mouse = input.mouse;
        }
    };
}

