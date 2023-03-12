import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {ExtendedMesh, ExtendedObject3D, THREE} from "enable3d";
import {createInputReceiver} from "../core/input";
import {lerp} from "../utils";
import {DebugDisplay} from "../ui/DebugDisplay";
import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";

const PLAYER_MOVEMENT_SPEED = 5;
const PLAYER_ACCELERATION = .4;
const PLAYER_JUMP_VELOCITY = 11;

export function createPlayer(level: GameLevel, at: Vec3) {
    const geometry = new THREE.CapsuleGeometry(.5, 1);
    const material = new THREE.MeshLambertMaterial({
        color: 0xffff00
    });
    const mesh = new ExtendedMesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;

    const object3D = new ExtendedObject3D();
    object3D.add(mesh);
    at.y++;
    object3D.position.copy(at);

    level.physics.add.existing(object3D, {
        shape: "convexMesh",
        mass: 70
    });
    level.add.existing(object3D);
    object3D.body.setLinearFactor(1, 1, 0);
    object3D.body.setAngularFactor(0, 0, 0);
    object3D.body.setFriction(0);

    const sensor = new ExtendedObject3D();
    sensor.name = "PlayerJumpSensor";
    level.physics.add.existing(sensor, {
        shape: "box",
        width: .8,
        height: .4,
        depth: .8,
        collisionFlags: 4,
        mass: 1e-8
    });
    level.physics.add.constraints.fixed(sensor.body, object3D.body, true);

    const uuid = level.universe.createEntity();
    level.universe.attachComponent(uuid, "player", {altitude: 0, isOnGround: true});
    level.universe.attachComponent(uuid, "inputReceiver", createInputReceiver());
    level.universe.attachComponent(uuid, "physicsObject", object3D);
    level.universe.attachComponent(uuid, "collisionSensor", {active: false, obj: sensor});
    level.universe.attachComponent(uuid, "cameraDirector", {
        position: Vec3.fromVec(object3D.position)
    });

    level.universe.registerSystem("playerSystem", playerSystem);
}

const playerSystem: EntitySystem<ComponentMap, SystemList> = ({createView}) => {
    const view = createView(
        "player", "inputReceiver", "physicsObject", "collisionSensor", "cameraDirector"
    );
    for (const {
        inputReceiver, physicsObject, collisionSensor, player, cameraDirector
    } of view) {
        // activating jump sensor if it hasn't been already
        if (!collisionSensor.active) {
            // noinspection TypeScriptValidateJSTypes
            collisionSensor.obj.body.on.collision((_, event) => {
                player.isOnGround = ["start", "collision"].includes(event);
            });
            collisionSensor.active = true;
        }

        // calculating horizontal movement
        const horizontalMovement = (
            Number(inputReceiver.keyboard.includes("KeyA")) * -1 +
            Number(inputReceiver.keyboard.includes("KeyD"))
        );
        const xVel = lerp(
            physicsObject.body.velocity.x, PLAYER_MOVEMENT_SPEED * horizontalMovement,
            PLAYER_ACCELERATION
        );
        physicsObject.body.setVelocityX(xVel);

        // jumping if close to ground and falling
        if (player.isOnGround && physicsObject.body.velocity.y <= 0) {
            physicsObject.body.setVelocityY(PLAYER_JUMP_VELOCITY);
        }

        // updating camera director position
        cameraDirector.position.copy(physicsObject.position);

        player.altitude = Math.floor(physicsObject.position.y);
        DebugDisplay.update("player_altitude", player.altitude);
    }
};
