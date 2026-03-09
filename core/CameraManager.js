import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export class CameraManager {
  constructor(renderer, scene) {
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      10_000,
    );

    this.camera.position.set(0, 1100, 2500);
    this.camera.lookAt(0, 0, 0);
    this.camera.far = 6000;

    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = true;

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
    const radius = body.mesh?.geometry?.boundingSphere?.radius ?? 5;
    this.offset.set(0, radius * 1.5, radius * 6);

    this.mode = "follow";
    this.targetBody = body;

    const targetPos = body.getWorldAnchorPosition(this._tmp);

    this.camera.position.copy(this.offset);
    body.localToWorld(this.camera.position);

    this.controls.target.copy(targetPos);
    this.controls.update();

    this.followOffset.radius = this.camera.position.distanceTo(targetPos);
    this.followOffset.theta = this.controls.getAzimuthalAngle();
    this.followOffset.phi = this.controls.getPolarAngle();
  }

  free() {
    this.mode = "free";
    this.targetBody = null;
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
