import * as THREE from "three";

export class Loader {
  constructor() {
    this.manager = new THREE.LoadingManager();

    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.cubeTextureLoader = new THREE.CubeTextureLoader(this.manager);

    const progressBar = document.getElementById("loading-progress");
    const screen = document.getElementById("loading-screen");

    this.manager.onProgress = (url, loaded, total) => {
      const progress = (loaded / total) * 100;
      progressBar.style.width = progress + "%";
    };

    this.manager.onLoad = () => {
      screen.style.opacity = "0";

      setTimeout(() => {
        screen.style.display = "none";
      }, 500);
    };
  }

  loadTexture(path) {
    return this.textureLoader.load(path);
  }

  loadSkybox(paths) {
    return this.cubeTextureLoader.load(paths);
  }
}
