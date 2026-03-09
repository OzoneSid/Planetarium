import * as THREE from "three";

export class Loader {
  constructor() {
    this.textureLoader = new THREE.TextureLoader();
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
  }

  loadTexture(path) {
    return this.textureLoader.load(path);
  }

  loadSkybox(paths) {
    return this.cubeTextureLoader.load(paths);
  }
}
