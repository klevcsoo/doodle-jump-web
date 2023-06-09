import {GameLevel} from "../core/level";
import {Vec3} from "../core/vec3";
import {ExtendedMesh, ExtendedObject3D, THREE} from "enable3d";
import {createInputReceiver} from "../core/input";
import {lerp} from "../utils";
import {DebugDisplay} from "../ui/DebugDisplay";
import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";
import {getGameConfig} from "../core/config";

export function createPlayer(level: GameLevel, at: Vec3) {
    const playerName = getGameConfig("OBJECT.NAME.PLAYER", false);
    const jumpSensorName = getGameConfig("OBJECT.NAME.PLAYER_JUMP_SENSOR", false);
    const starsKey = getGameConfig("STORAGE.KEY.STARS", false);

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
    object3D.name = playerName;

    level.physics.add.existing(object3D, {
        shape: "convexMesh",
        mass: 70,
        collisionFlags: 4
    });
    level.add.existing(object3D);
    object3D.body.setLinearFactor(1, 1, 0);
    object3D.body.setAngularFactor(0, 0, 0);
    object3D.body.setFriction(0);

    const sensor = new ExtendedObject3D();
    sensor.name = jumpSensorName;
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
    level.universe.attachComponent(uuid, "player", {
        altitude: 0,
        isOnPlatform: false,
        isOnBoostPlatform: false,
        starsCollected: parseInt(localStorage.getItem(starsKey) ?? "0"),
        fallen: false
    });
    level.universe.attachComponent(uuid, "inputReceiver", createInputReceiver());
    level.universe.attachComponent(uuid, "physicsObject", object3D);
    level.universe.attachComponent(uuid, "collisionSensor", {active: false, obj: sensor});
    level.universe.attachComponent(uuid, "cameraDirector", {
        position: Vec3.fromVec(object3D.position)
    });

    level.universe.registerSystem("playerSystem", createPlayerSystem());
}

function createPlayerSystem(): EntitySystem<ComponentMap, SystemList> {
    const playerSpeed = getGameConfig("PLAYER.MOVEMENT.SPEED", true);
    const playerAcceleration = getGameConfig("PLAYER.MOVEMENT.ACCELERATION", true);
    const playerJumpVelocity = getGameConfig("PLAYER.JUMP.VELOCITY", true);
    const platformBoostMult = getGameConfig("PLATFORM.BOOST.MULTIPLIER", true);
    const pickupCommand = getGameConfig("COMMAND.COLLECTABLE.PICKUP", false);
    const platformTag = getGameConfig("OBJECT.TAG.PLATFORM", false);
    const boostPlatformTag = getGameConfig("OBJECT.TAG.BOOST_PLATFORM", false);
    const maxVSpace = getGameConfig("PLATFORM.GENERATION.MAX_VERTICAL_SPACE", true);
    const maxAltitudeKey = getGameConfig("STORAGE.KEY.MAX_ALTITUDE", false);
    const starsKey = getGameConfig("STORAGE.KEY.STARS", false);

    return ({createView, handleCommand}) => {
        const view = createView(
            "player", "inputReceiver", "physicsObject",
            "collisionSensor", "cameraDirector"
        );
        for (const {
            inputReceiver, physicsObject, collisionSensor, player, cameraDirector
        } of view) {

            if (player.fallen) {
                continue;
            }

            // activating jump sensor if it hasn't been already
            if (!collisionSensor.active) {
                // noinspection TypeScriptValidateJSTypes
                collisionSensor.obj.body.on.collision((platform, event) => {

                    if (["start", "collision"].includes(event)) {
                        player.isOnPlatform = !!(
                            platform.userData[platformTag]
                        );
                        player.isOnBoostPlatform = !!(
                            platform.userData[boostPlatformTag]
                        );
                    } else {
                        player.isOnPlatform = player.isOnBoostPlatform = false;
                    }

                });
                collisionSensor.active = true;
            }

            // calculating horizontal movement
            const horizontalMovement = (
                Number(inputReceiver.keyboard.includes("ArrowLeft")) * -1 +
                Number(inputReceiver.keyboard.includes("ArrowRight"))
            );
            const xVel = lerp(
                physicsObject.body.velocity.x, playerSpeed * horizontalMovement,
                playerAcceleration
            );
            physicsObject.body.setVelocityX(xVel);

            // jumping if close to ground and falling
            // if not
            // save and end game if player has fallen down too far
            if (player.isOnPlatform && physicsObject.body.velocity.y <= 0) {

                if (player.isOnBoostPlatform) {
                    physicsObject.body.setVelocityY(
                        playerJumpVelocity * platformBoostMult
                    );
                } else {
                    physicsObject.body.setVelocityY(playerJumpVelocity);
                }

            } else if (physicsObject.position.y < player.altitude - maxVSpace * 2) {

                // save progress
                const savedMax = localStorage.getItem(maxAltitudeKey) ?? 0;
                if (player.altitude > savedMax) {
                    localStorage.setItem(maxAltitudeKey, String(player.altitude));
                }
                localStorage.setItem(starsKey, String(player.starsCollected));

                // inform that the game is over
                player.fallen = true;
                alert("Game Over");
                window.location.reload();
            }

            // updating camera director position
            cameraDirector.position.copy(physicsObject.position);

            // setting player altitude
            player.altitude = Math.max(
                player.altitude, Math.floor(physicsObject.position.y)
            );

            // handling collectable pickup
            handleCommand(pickupCommand, () => {
                player.starsCollected++;
            });

            // printing to debug display
            DebugDisplay.update("player_altitude", player.altitude);
            DebugDisplay.update("player_stars", player.starsCollected);
        }
    };
}
