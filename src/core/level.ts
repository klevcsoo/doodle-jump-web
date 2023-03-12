import {Scene3D, THREE} from "enable3d";
import {createUniverse, Universe} from "necst";
import {DebugDisplay} from "../ui/DebugDisplay";
import {ComponentMap, SystemList} from "../types";
import {Vec3} from "./vec3";
import {createPlayer} from "../entities/createPlayer";
import {createInputBroadcasterSystem} from "../systems/createInputBroadcasterSystem";
import {createCameraDirectorSystem} from "../systems/createCameraDirectorSystem";
import {createPlatformGenerator} from "../entities/createPlatformGenerator";
import {getGameConfig} from "./config";


class GameLevel extends Scene3D {
    public universe: Universe<ComponentMap, SystemList>;

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
        const {ground} = await this.warpSpeed("-orbitControls", "-camera", "-lookAtCenter");
        ground!.userData[platformTag] = true;

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

        createPlatformGenerator(this);
        createPlayer(this, new Vec3());
    }

    public update(_time: number, delta: number) {
        DebugDisplay.update("fps", Math.floor(1000 / delta));

        this.universe.update();
    }

}

export {GameLevel};
