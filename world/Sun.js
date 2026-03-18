import * as THREE from "three";
import { CelestialBody } from "./CelestialBody.js";
import { Loader } from "../utils/Loader.js";
import { SCALE, SPEED } from "../utils/Constants.js";

export class Sun extends CelestialBody {
  constructor(scene, loader) {
    super();

    this.scene = scene;
    this.loader = loader;

    //  GÉOMÉTRIE
    const geometry = new THREE.SphereGeometry(SCALE.SUN_RADIUS, 64, 64);

    const texture = this.loader.loadTexture("assets/textures/sun/sun.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;

    //  MATÉRIAU (auto-éclairé)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.bindMesh(mesh);

    //  LUMIÈRE ÉMISE
    this.light = new THREE.DirectionalLight(0xffffff, 2.5);
    this.light.position.set(0, 0, 0);

    this.light.castShadow = true;

    this.light.shadow.mapSize.width = 4096;
    this.light.shadow.mapSize.height = 4096;

    this.light.shadow.camera.near = 0.1;
    this.light.shadow.camera.far = 2000;

    // zone d’ombre couvrant Terre + orbite lunaire
    this.light.shadow.camera.left = -200;
    this.light.shadow.camera.right = 200;
    this.light.shadow.camera.top = 200;
    this.light.shadow.camera.bottom = -200;

    // adoucissement pénombre
    this.light.shadow.radius = 4;
    this.light.shadow.bias = -0.0005;

    this.add(this.light);

    this.light.target.position.set(0, 0, 0);
    this.add(this.light.target);
  }

  addSatellite(body) {
    this.add(body);
  }

  update(delta) {
    // rotation propre du Soleil
    this.rotation.y += SPEED.SUN_ROTATION * delta;
  }
}
