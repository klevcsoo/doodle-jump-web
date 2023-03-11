import "./style.css";
import {PhysicsLoader as AmmoPhysicsLoader, Project} from "enable3d";
import {GameLevel} from "./core/level";

// config and project loader
const config: ConstructorParameters<typeof Project>[ 0 ] = {
    scenes: [GameLevel],
    antialias: true
};
AmmoPhysicsLoader('/lib/ammo', () => new Project(config));
