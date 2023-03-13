import {ExtendedObject3D, Scene3D, THREE} from "enable3d";
import {createUniverse, Universe} from "necst";
import {DebugDisplay} from "../ui/DebugDisplay";
import {ComponentMap, SystemList} from "../types";
import {Vec3} from "./vec3";
import {createPlayer} from "../entities/createPlayer";
import {createInputBroadcasterSystem} from "../systems/createInputBroadcasterSystem";
import {createCameraDirectorSystem} from "../systems/createCameraDirectorSystem";
import {createPlatformGenerator} from "../entities/createPlatformGenerator";
import {getGameConfig} from "./config";
import {createShadowUpdaterSystem} from "../systems/createShadowUpdaterSystem";
import {createPersistenceSystem} from "../systems/createPersistenceSystem";

class GameLevel extends Scene3D {
    public universe: Universe<ComponentMap, SystemList>;
    public directionalLight: THREE.DirectionalLight | undefined;
    public hemisphereLight: THREE.HemisphereLight | undefined;
    private deletionQueue: (string | ExtendedObject3D)[] = [];

    constructor() {
        super({key: "GameScene", enableXR: false});
        this.universe = createUniverse<ComponentMap, SystemList>();
    }

    public async init() {
        const platformTag = getGameConfig("OBJECT.TAG.PLATFORM", false);

        // setup render size and resolution
        console.table({
            ["pixel_ratio"]: window.devicePixelRatio,
            ["max_anisotropy"]: this.renderer.capabilities.getMaxAnisotropy(),
            ["is_webgl_2"]: this.renderer.capabilities.isWebGL2
        });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        window.addEventListener("resize", () => {
            if (this.camera instanceof THREE.PerspectiveCamera) {
                (this.camera as THREE.PerspectiveCamera).aspect = (
                    window.innerWidth / window.innerHeight
                );
            }
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // set up scene (light, ground, grid, sky)
        const {
            ground, lights
        } = await this.warpSpeed("-orbitControls", "-camera", "-lookAtCenter");
        ground!.userData[platformTag] = true;
        this.directionalLight = lights?.directionalLight;
        this.hemisphereLight = lights?.hemisphereLight;

        // enable physics debug if running locally or with console command
        this.physics.debug!.enable();
        (window as any)["enablePhysicsDebug"] = () => this.physics.debug!.enable();
        (window as any)["disablePhysicsDebug"] = () => this.physics.debug!.disable();
    }

    public async create() {
        this.universe.registerSystem(
            "inputBroadcasterSystem", createInputBroadcasterSystem()
        );
        this.universe.registerSystem(
            "cameraDirectorSystem", createCameraDirectorSystem(this)
        );
        this.universe.registerSystem(
            "shadowUpdaterSystem", createShadowUpdaterSystem(this)
        );
        this.universe.registerSystem(
            "persistenceSystem", createPersistenceSystem()
        );
        this.universe.scheduleSystem("persistenceSystem", 5, "seconds");

        createPlatformGenerator(this);
        createPlayer(this, new Vec3());
    }

    public update(_time: number, delta: number) {
        DebugDisplay.update("fps", Math.floor(1000 / delta));

        this.universe.update();

        for (const obj of this.deletionQueue) {
            if (typeof obj === "string") {
                this.universe.destroyEntity(obj);
                console.log("deleted entity:", obj);
            } else {
                this.destroy(obj);
                console.log("deleted object:", obj.name);
            }
        }
        this.deletionQueue = [];

        const platformTag = getGameConfig("OBJECT.TAG.PLATFORM", false);
        const platformCountScene = this.scene.children.filter(obj => {
            return !!obj.userData[platformTag];
        }).length;
        DebugDisplay.update("platform_count_scene", platformCountScene);
        let platformCountUniverse = 0;
        for (const _ of this.universe.view("platform")) platformCountUniverse++;
        DebugDisplay.update("platform_count_universe", platformCountUniverse);
    }

    public deleteEntity(uuid: string, ...attachedObjects: ExtendedObject3D[]) {
        this.deletionQueue.push(uuid, ...attachedObjects);
    }
}

export {GameLevel};
