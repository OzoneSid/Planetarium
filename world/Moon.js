import * as THREE from "three";
import { CelestialBody } from "./CelestialBody.js";

export class Moon extends CelestialBody {
  constructor({
    name = "",
    radius,
    material,
    rotationSpeed = 0,
    orbit = null,
    selectable = true,
  }) {
    super({ name, selectable, rotationSpeed, orbit });

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    this.bindMesh(mesh);

    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}
