import "./style.css"
import {Project, PhysicsLoader as AmmoPhysicsLoader} from "enable3d";
import {GameLevel} from "./level";

// config and project loader
const config: ConstructorParameters<typeof Project>[ 0 ] = {
    scenes: [GameLevel],
    antialias: true
};
AmmoPhysicsLoader('/lib/ammo', () => new Project(config));
