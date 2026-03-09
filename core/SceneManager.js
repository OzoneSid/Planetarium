import * as THREE from "three";
import { Renderer } from "./Renderer.js";
import { Time } from "./Time.js";

export class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();

    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    this.scene.add(ambient);

    this.renderer = new Renderer();
    this.time = new Time();

    this.cameraManager = null;

    this.renderer.setAnimationLoop(this.update.bind(this));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener("resize", () => this.onWindowResize());
  }

  setCameraManager(cameraManager) {
    this.cameraManager = cameraManager;
  }

  update() {
    const delta = this.time.getDelta();

    // Update du monde (rotations, shaders, orbites)
    this.scene.traverse((obj) => {
      if (obj.update && !(obj instanceof THREE.LOD)) {
        obj.update(delta);
      }
    });

    this.scene.updateMatrixWorld(true);

    const camera = this.cameraManager?.camera;

    // Update des LOD
    if (camera) {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.LOD) {
          obj.update(camera);
        }
      });
    }

    // Update caméra APRÈS le monde
    if (this.cameraManager) {
      this.cameraManager.update(delta);
      this.renderer.render(this.scene, this.cameraManager.camera);
    }
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (this.cameraManager) {
      this.cameraManager.camera.aspect = width / height;
      this.cameraManager.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(width, height);
  }

  start() {}
}
