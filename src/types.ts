import {ExtendedObject3D} from "enable3d";
import {InputReceiver} from "./core/input";
import {Vec3} from "./core/vec3";

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
        isOnPlatform: boolean
        isOnBoostPlatform: boolean
    }
    cameraDirector: {
        position: Vec3
    }
    platform: PlatformType & {
        originalX: number
        speed: number
    }
    platformGenerator: {
        maxAltitude: number
        lastPlatformX: number
    }
}

export type SystemList = [
    "debugCubeColourSystem",
    "inputBroadcasterSystem",
    "playerSystem",
    "cameraDirectorSystem",
    "platformGeneratorSystem",
    "platformSystem"
]

export type PlatformType = {
    oscillating: boolean
    breakable: boolean
    boost: boolean
}
