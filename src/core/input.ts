const inputMap: InputReceiver = {
    keyboard: [],
    mouse: {
        buttons: {
            left: false,
            right: false
        },
        wheelDelta: 0.0,
        x: 0.0,
        y: 0.0
    }
};

function registerInputListeners() {
    window.addEventListener("mousemove", ({clientX, clientY}) => {
        inputMap.mouse.x = clientX;
        inputMap.mouse.y = clientY;
    }, false);

    window.addEventListener("mousedown", ({button}) => {
        if (button === 0) {
            inputMap.mouse.buttons.left = true;
        } else if (button === 2) {
            inputMap.mouse.buttons.right = true;
        }
    }, false);

    window.addEventListener("mouseup", ({button}) => {
        if (button === 0) {
            inputMap.mouse.buttons.left = false;
        } else if (button === 2) {
            inputMap.mouse.buttons.right = false;
        }
    }, false);

    window.addEventListener("wheel", ({deltaY}) => {
        inputMap.mouse.wheelDelta = deltaY;
    }, false);

    window.addEventListener("keydown", ({code}) => {
        if (!inputMap.keyboard.includes(code)) {
            inputMap.keyboard.push(code);
        }
    }, false);

    window.addEventListener("keyup", ({code}) => {
        if (inputMap.keyboard.includes(code)) {
            inputMap.keyboard.splice(
                inputMap.keyboard.indexOf(code), 1
            );
        }
    }, false);

    if (!!window.navigator.getGamepads) {
        window.addEventListener("gamepadconnected", () => {
            console.log("Gamepad connected");
        });

        window.addEventListener("gamepaddisconnected", () => {
            console.log("Gamepad disconnected");
        });
    }
}

export function currentInput(): typeof inputMap {
    return {
        keyboard: [...inputMap.keyboard],
        mouse: structuredClone(inputMap.mouse)
    };
}

export type InputReceiver = {
    keyboard: string[];
    mouse: {
        buttons: {
            left: boolean
            right: boolean
        }
        wheelDelta: number
        x: number
        y: number
    };
}

export function createInputReceiver(): InputReceiver {
    return {
        keyboard: [],
        mouse: {
            buttons: {
                left: false,
                right: false
            },
            wheelDelta: 0.0,
            x: 0.0,
            y: 0.0
        }
    };
}

registerInputListeners();
