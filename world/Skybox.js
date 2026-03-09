import * as THREE from "three";
import { Loader } from "../utils/Loader.js";

export class Skybox {
  constructor(scene) {
    this.scene = scene;
    this.loader = new Loader();

    this.scene.background = new THREE.Color(0x000010);
  }

  load(path = "assets/skybox/space/") {
    const skyboxPaths = [
      `${path}+X.jpg`,
      `${path}-X.jpg`,
      `${path}+Y.jpg`,
      `${path}-Y.jpg`,
      `${path}+Z.jpg`,
      `${path}-Z.jpg`,
    ];

    const cubeTexture = this.loader.loadSkybox(skyboxPaths);

    this.scene.background = cubeTexture;
    this.scene.environment = cubeTexture;
  }
}
