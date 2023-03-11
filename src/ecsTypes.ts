import {ExtendedObject3D} from "enable3d";
import {InputReceiver} from "./input";
import {Vec3} from "./vec3";

export type ComponentMap = {
    physicsObject: InstanceType<typeof ExtendedObject3D>
    collisionSensor: {
        active: boolean
        obj: InstanceType<typeof ExtendedObject3D>
    }
    dummy: {
        random: number
    }
    inputReceiver: InputReceiver
    player: {
        altitude: number
        isOnGround: boolean
    }
    cameraDirector: {
        position: Vec3
    }
}

export type SystemList = [
    "debugCubeColourSystem",
    "inputBroadcasterSystem",
    "playerSystem",
    "cameraDirectorSystem"
]
