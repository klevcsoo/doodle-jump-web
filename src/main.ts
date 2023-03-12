import "./style.css";
import {PhysicsLoader as AmmoPhysicsLoader, Project} from "enable3d";
import {GameLevel} from "./core/level";
import {loadGameConfig} from "./core/config";

fetch("/game.cfg").then(value => value.text()).then(cfgContent => {
    // game config loading
    loadGameConfig(cfgContent);

    // project loader
    const config: ConstructorParameters<typeof Project>[0] = {
        scenes: [GameLevel],
        antialias: true
    };
    AmmoPhysicsLoader('/lib/ammo', () => new Project(config));
});
