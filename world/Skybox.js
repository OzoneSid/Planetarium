import * as THREE from "three";

export class Skybox {
  constructor(scene, loader, camera) {
    this.scene = scene;
    this.loader = loader;
    this.camera = camera;

    this.mesh = null;

    this.scene.background = new THREE.Color(0x000000);
  }

  load(path = "assets/skybox/space/8k_stars_milky_way.jpg") {
    const texture = this.loader.loadTexture(path);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(13000, 64, 64);

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    });

    this.mesh = new THREE.Mesh(geometry, material);

    this.mesh.rotation.z = THREE.MathUtils.degToRad(60);

    this.mesh.renderOrder = -1000;

    this.mesh.frustumCulled = false;

    this.scene.add(this.mesh);
  }

  update() {
    if (!this.mesh || !this.camera) return;

    // Skybox centrée sur la caméra
    this.mesh.position.copy(this.camera.position);

    this.mesh.rotation.y += 0.00001;
  }
}
