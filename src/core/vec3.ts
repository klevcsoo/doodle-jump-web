import {THREE} from "enable3d";

export class Vec3 extends THREE.Vector3 {
    public static fromVec(threeVector: THREE.Vector3) {
        return new this(threeVector.x, threeVector.y, threeVector.z);
    }

    public static fromComps({x, y, z}: { x: number, y: number, z: number; }) {
        return new this(x, y, z);
    }

    * [Symbol.iterator]() {
        yield this.x;
        yield this.y;
        yield this.z;
    }
}
