import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { Planet } from "../world/Planet.js";
import { Sun } from "../world/Sun.js";
import { SCALE } from "../utils/Constants.js";

export class CameraManager {
  constructor(renderer, scene) {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      25_000,
    );

    this.camera.position.set(0, 1100, 2500);
    this.camera.lookAt(0, 0, 0);
    this.camera.far = 6000;

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.controls.zoomSpeed = 2.5;

    this.controls.minDistance = SCALE.SUN_RADIUS * 5;
    this.controls.maxDistance = 3000;

    this.currentDistance = this.camera.position.length();
    this.targetDistance = this.currentDistance;

    this.controls.addEventListener("change", () => {
      this.targetDistance = this.controls.getDistance();
    });

    this.mode = "free";
    this.targetBody = null;

    this.offset = new THREE.Vector3(0, 5, 20);
    this.lerpFactor = 0.08;

    this._tmp = new THREE.Vector3();
    this._desired = new THREE.Vector3();

    this.followOffset = new THREE.Spherical();
    this.followOffset.radius = 20;
    this.followOffset.phi = Math.PI / 3;
    this.followOffset.theta = 0;
  }

  focusOn(body, offset = this.offset) {
    this.mode = "focus";
    this.targetBody = body;
    this.offset.copy(offset);

    const pos = body.getWorldAnchorPosition(this._tmp);
    this.controls.target.copy(pos);
    this.camera.position.copy(pos).add(this.offset);
    this.controls.update();
  }

  follow(body) {
    const geometry = body.mesh?.geometry;
    let radius = geometry?.parameters?.radius;

    if (radius == null && geometry) {
      geometry.computeBoundingSphere();
      radius = geometry.boundingSphere?.radius;
    }

    radius = radius ?? 5;

    const targetPos = body.getWorldAnchorPosition(this._tmp);

    // BODY CAMERA POSITION
    if (body instanceof Planet) {
      const minDistance = radius * 3.5;
      this.controls.minDistance = minDistance;
      this.offset.set(0, radius * 0.25, minDistance);
    } else if (body instanceof Sun) {
      const minDistance = radius * 5;
      this.controls.minDistance = minDistance;
      this.offset.set(0, radius * 0.5, minDistance);
    } else {
      this.offset.set(0, radius * 1.5, radius * 6);
    }

    this.mode = "follow";
    this.targetBody = body;

    this.camera.position.copy(targetPos).add(this.offset);

    this.controls.target.copy(targetPos);
    this.controls.update();

    this.followOffset.radius = this.camera.position.distanceTo(targetPos);
    this.followOffset.theta = this.controls.getAzimuthalAngle();
    this.followOffset.phi = this.controls.getPolarAngle();
  }

  free() {
    this.currentDistance = THREE.MathUtils.lerp(
      this.currentDistance,
      this.targetDistance,
      0.08,
    );

    // recalcul direction caméra → target
    const dir = new THREE.Vector3()
      .subVectors(this.camera.position, this.controls.target)
      .normalize();

    this.camera.position.copy(
      this.controls.target
        .clone()
        .add(dir.multiplyScalar(this.currentDistance)),
    );

    this.controls.update();
  }

  update() {
    if (this.mode === "focus" && this.targetBody) {
      const targetPos = this.targetBody.getWorldAnchorPosition(this._tmp);
      this._desired.copy(targetPos).add(this.offset);
      this.camera.position.lerp(this._desired, this.lerpFactor);
      this.controls.target.copy(targetPos);
      this.controls.update();
      return;
    }

    if (this.mode === "follow" && this.targetBody) {
      const targetPos = this.targetBody.getWorldAnchorPosition(this._tmp);
      this.followOffset.radius = this.controls.getDistance();
      this.followOffset.theta = this.controls.getAzimuthalAngle();
      this.followOffset.phi = this.controls.getPolarAngle();

      const offset = new THREE.Vector3().setFromSpherical(this.followOffset);
      this.camera.position.copy(targetPos).add(offset);
      this.controls.target.copy(targetPos);
      this.controls.update();

      return;
    }

    this.controls.update();
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
