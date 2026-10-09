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

    this.hoveredToken = null;
    this.pendingClick = null;
    this.onTokenClick = null;

    this.domElement.addEventListener("click", (e) => this.onClick(e));
    this.domElement.addEventListener("dblclick", (e) => this.onDoubleClick(e));
    this.domElement.addEventListener("pointermove", (e) => {
      this.onPointerMove(e);
    });

    console.log("SelectionManager initialized");
  }

  updatePointer(event) {
    const rect = this.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;

    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  onClick(event) {
    this.updatePointer(event);

    clearTimeout(this.pendingClick);
    this.pendingClick = null;

    const token = this.getTokenAtPointer();

    // Clicking mesh > nothing
    if (!token) {
      return;
    }

    // Store clicked body
    const body = token.userData.body;

    this.pendingClick = setTimeout(() => {
      this.onTokenClick?.(body);
      this.pendingClick = null;
    }, 250);
  }

  onDoubleClick(event) {
    clearTimeout(this.pendingClick);
    this.pendingClick = null;

    this.updatePointer(event);

    const token = this.getTokenAtPointer();

    // Double-clicking token > follow
    if (token) {
      this.cameraManager.follow(token.userData.body);
      return;
    }

    // Double-clicking mesh > follow
    const hits = this.raycaster
      .intersectObjects(this.scene.children, true)
      .filter((hit) => !hit.object.userData.ignoreRaycast);

    if (!hits.length) {
      return;
    }

    let object = hits[0].object;

    while (object && !object.userData.body) {
      object = object.parent;
    }

    if (object?.userData.body) {
      this.cameraManager.follow(object.userData.body);
    }
  }

  onPointerMove(event) {
    this.updatePointer(event);

    const token = this.getHoveredToken();

    this.setHoveredToken(token);
  }

  getTokenAtPointer() {
    const hits = this.raycaster
      .intersectObjects(this.scene.children, true)
      .filter((hit) => hit.object.userData.isBodyToken);

    return hits.length > 0 ? hits[0].object : null;
  }

  getHoveredToken() {
    return this.getTokenAtPointer();
  }

  setHoveredToken(token) {
    if (token === this.hoveredToken) {
      return;
    }

    if (this.hoveredToken) {
      this.setTokenHighlight(this.hoveredToken, false);
    }

    this.hoveredToken = token;

    if (this.hoveredToken) {
      this.setTokenHighlight(this.hoveredToken, true);
      this.domElement.style.cursor = "pointer";
    } else {
      this.domElement.style.cursor = "default";
    }
  }

  setTokenHighlight(token, isHighlighted) {
    const baseScale = token.userData.baseScale;

    token.scale.copy(baseScale);

    if (isHighlighted) {
      token.scale.multiplyScalar(1.25);
    }
  }

  setTokenClickHandler(callback) {
    this.onTokenClick = callback;
  }
}
