import {EntitySystem} from "necst";
import {ComponentMap, SystemList} from "../types";
import {Vec3} from "../core/vec3";
import {GameLevel} from "../core/level";

const CAMERA_MOVEMENT_LERP_ALPHA = .25;
const CAMERA_ROTATION_LERP_ALPHA = .04;
const CAMERA_Z_OFFSET = 20;

export function createCameraDirectorSystem(
    level: GameLevel
): EntitySystem<ComponentMap, SystemList> {
    return ({createView}) => {
        const view = createView("cameraDirector");
        const vectors: Vec3[] = [];
        for (const {cameraDirector} of view) {
            vectors.push(cameraDirector.position);
        }

        // calculating centre of polygon enclosed by the camera directors
        const sumX = vectors.map(({x}) => x).reduce((a, b) => a + b);
        const sumY = vectors.map(({y}) => y).reduce((a, b) => a + b);
        const sumZ = vectors.map(({z}) => z).reduce((a, b) => a + b);
        const len = vectors.length;
        const targetVec = new Vec3(sumX / len, sumY / len, sumZ / len);

        // using linear interpolation to calculate new camera position
        const newCamPos = new Vec3(
            targetVec.x, targetVec.y, targetVec.z + CAMERA_Z_OFFSET
        );
        level.camera.position.lerp(newCamPos, CAMERA_MOVEMENT_LERP_ALPHA);

        // using linear interpolation to calculate new camera quaternion
        const originalQuat = level.camera.quaternion.clone(); // storing original quaternion
        level.camera.lookAt(targetVec); // precalculating new one
        const desiredQuat = level.camera.quaternion.clone(); // storing that
        level.camera.quaternion.copy(originalQuat); // restoring original
        level.camera.quaternion.slerp(desiredQuat, CAMERA_ROTATION_LERP_ALPHA); // blending
    };
}
