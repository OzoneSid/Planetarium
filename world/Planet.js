import * as THREE from "three";
import { CelestialBody } from "./CelestialBody.js";

export class Planet extends CelestialBody {
  constructor({
    name = "",
    radius,
    material,
    rotationSpeed = 0,
    orbit = null,
    axialTilt = 0,
    selectable = true,
    lodDistance = 400,
    lodColor = 0xffffff,
  }) {
    super({ name, selectable, rotationSpeed, orbit, axialTilt });

    this.rotationSpeed = rotationSpeed;

    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    this.bindMesh(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.body = this;

    // =================== LOD

    this.lod = new THREE.LOD();

    this.lod.addLevel(this.mesh, 0);

    const farGeometry = new THREE.SphereGeometry(radius * 6, 8, 8);
    const farMaterial = new THREE.MeshBasicMaterial({ color: lodColor });

    const farMesh = new THREE.Mesh(farGeometry, farMaterial);
    farMesh.userData.body = this;

    this.lod.addLevel(farMesh, lodDistance);

    this.axialTiltPivot.add(this.lod);
  }
}
