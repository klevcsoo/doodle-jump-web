import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {ExtendedObject3D, THREE} from "enable3d";
import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";

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
        mass: 15,
        collisionFlags: 2
    });
    level.add.existing(object3D);

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "physicsObject", object3D);
    level.universe.attachComponent(uuid, "collectable", {
        type: "star", sensingCollisions: false, collidingWithPlayer: false
    });

    level.universe.registerSystem("collectableSystem", createCollectableSystem(level));
}

function createCollectableSystem(level: GameLevel): EntitySystem<ComponentMap, SystemList> {
    return ({createView}) => {
        const view = createView("collectable", "physicsObject");
        for (const {collectable, physicsObject, uuid} of view) {

            if (!collectable.sensingCollisions) {
                // noinspection TypeScriptValidateJSTypes
                physicsObject.body.on.collision((obj, event) => {

                    collectable.collidingWithPlayer = (
                        ["start", "collision"].includes(event) &&
                        ["PlayerObject", "PlayerJumpSensor"].includes(obj.name)
                    );

                });
                collectable.sensingCollisions = true;
            }

            if (collectable.collidingWithPlayer) {
                level.destroy(physicsObject);
                level.physics.destroy(physicsObject);
                level.universe.destroyEntity(uuid);
            }
        }
    };
}
