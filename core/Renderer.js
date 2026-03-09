import * as THREE from "three";

export class Renderer extends THREE.WebGLRenderer {
  constructor() {
    const canvas = document.getElementById("scene3d");

    super({
      canvas,
      antialias: true,
    });

    this.setSize(window.innerWidth, window.innerHeight);
    this.setPixelRatio(window.devicePixelRatio);
  }
}
