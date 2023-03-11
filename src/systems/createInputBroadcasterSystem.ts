import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../ecsTypes";
import {currentInput} from "../input";

export function createInputBroadcasterSystem(): EntitySystem<ComponentMap, SystemList> {
    return ({createView}) => {
        const input = currentInput();
        for (const {inputReceiver} of createView("inputReceiver")) {
            inputReceiver.keyboard = input.keyboard;
            inputReceiver.mouse = input.mouse;
        }
    };
}

