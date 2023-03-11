import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {THREE} from "enable3d";

let count = 0;

export function createDebugCube(level: GameLevel, at: Vec3) {
    const worldObject = level.physics.add.box(
        {
            name: `DummyBox:${count++}`,
            width: 1,
            height: 1,
            depth: 1,
            mass: 12,
            x: at.x,
            y: at.y,
            z: at.z
        }, {lambert: {color: 0xffffff}}
    );

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "physicsObject", worldObject);
    level.universe.attachComponent(uuid, "dummy", {random: Math.random()});

    level.universe.registerSystem("debugCubeColourSystem", ({createView}) => {
        for (const {physicsObject, dummy} of createView("physicsObject", "dummy")) {
            (physicsObject.material as THREE.MeshLambertMaterial).color.set(
                (dummy.random * Date.now()) % 0xffffff
            );
        }
    });
    level.universe.scheduleSystem("debugCubeColourSystem", .5, "seconds");
}
