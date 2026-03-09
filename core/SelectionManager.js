import * as THREE from "three";

export class SelectionManager {
  constructor(scene, cameraManager, renderer) {
    this.scene = scene;
    this.cameraManager = cameraManager;
    this.camera = cameraManager.camera;

    this.domElement = renderer.domElement;
    this.domElement.tabIndex = 0;
    this.domElement.focus();

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.domElement.addEventListener("dblclick", (e) => this.onDoubleClick(e));

    console.log("SelectionManager initialized");
  }

  onDoubleClick(event) {
    const rect = this.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hits = this.raycaster
      .intersectObjects(this.scene.children, true)
      .filter((hit) => !hit.object.userData.ignoreRaycast);

    if (!hits.length) return;

    let obj = hits[0].object;
    while (obj && !obj.userData.body) obj = obj.parent;

    if (obj?.userData.body) {
      this.cameraManager.follow(obj.userData.body);
    }

    console.log(hits[0].object.userData);
    console.log("dblclick detected");
  }
}
