import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {ExtendedObject3D, THREE} from "enable3d";
import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";
import {getGameConfig} from "../core/config";

export function createCollectable(level: GameLevel, at: Vec3) {
    const geometry = new THREE.TorusGeometry(.4, .15, 8, 16);
    const material = new THREE.MeshLambertMaterial({
        color: 0x0099ff
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;

    const object3D = new ExtendedObject3D();
    object3D.add(mesh);
    object3D.position.copy(at);

    level.physics.add.existing(object3D, {
        shape: "convexMesh",
        mass: 1e-8,
        collisionFlags: 2
    });
    level.add.existing(object3D);

    const sensor = new ExtendedObject3D();
    sensor.name = `CollectableSensor_${object3D.name}`;
    sensor.position.copy(at);
    level.physics.add.existing(sensor, {
        shape: "box",
        width: 1.2,
        height: 1.2,
        depth: 1.2,
        collisionFlags: 4,
        mass: 1e-8
    });
    level.physics.add.constraints.fixed(sensor.body, object3D.body, true);

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "physicsObject", object3D);
    level.universe.attachComponent(uuid, "collisionSensor", {
        active: false,
        obj: sensor
    });
    level.universe.attachComponent(uuid, "collectable", {
        type: "star", pickup: false
    });

    level.universe.registerSystem("collectableSystem", createCollectableSystem(level));
}

function createCollectableSystem(level: GameLevel): EntitySystem<ComponentMap, SystemList> {
    const playerName = getGameConfig("OBJECT.NAME.PLAYER", false);
    const jumpSensorName = getGameConfig("OBJECT.NAME.PLAYER_JUMP_SENSOR", false);

    return ({createView, sendCommand}) => {
        const view = createView("collectable", "physicsObject", "collisionSensor");
        for (const {collectable, physicsObject, collisionSensor, uuid} of view) {

            if (!collisionSensor.active) {
                // noinspection TypeScriptValidateJSTypes
                physicsObject.body.on.collision((obj, event) => {

                    collectable.pickup = (
                        ["start", "collision"].includes(event) &&
                        [playerName, jumpSensorName].includes(obj.name)
                    );

                });
                collisionSensor.active = true;
            }

            if (collectable.pickup) {
                level.destroy(physicsObject);
                level.physics.destroy(physicsObject);
                level.universe.destroyEntity(uuid);

                sendCommand("playerSystem", "collectable.pickup", collectable.type);
            }
        }
    };
}
