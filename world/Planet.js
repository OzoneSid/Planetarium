import * as THREE from "three";
import { CelestialBody } from "./CelestialBody.js";

let lodSpriteTexture;

function getLodSpriteTexture() {
  if (!lodSpriteTexture) {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to create the planet LOD sprite texture.");
    }

    context.beginPath();
    context.arc(64, 64, 62, 0, Math.PI * 2);
    context.clip();

    const gradient = context.createRadialGradient(42, 38, 4, 64, 64, 66);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.55, "#c8c8c8");
    gradient.addColorStop(1, "#555555");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);

    lodSpriteTexture = new THREE.CanvasTexture(canvas);
    lodSpriteTexture.colorSpace = THREE.SRGBColorSpace;
  }

  return lodSpriteTexture;
}

export class Planet extends CelestialBody {
  constructor({
    name = "",
    radius,
    material,
    rotationSpeed = 0,
    orbit = null,
    axialTilt = 0,
    selectable = true,
    lodDistance = 400,
    lodColor = 0xffffff,
  }) {
    super({ name, selectable, rotationSpeed, orbit, axialTilt });

    this.rotationSpeed = rotationSpeed;

    const geometry = new THREE.SphereGeometry(radius, 64, 64);
    geometry.computeVertexNormals();

    material.transparent = true;
    material.depthWrite = false;

    const mesh = new THREE.Mesh(geometry, material);
    this.bindMesh(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.body = this;

    // =================== LOD ================= //

    this.lod = new THREE.Group();
    this.lodDistance = lodDistance;
    this.lodRadius = radius;
    this.lod.add(mesh);

    this.lodSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getLodSpriteTexture(),
        color: lodColor,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.lodSprite.userData.body = this;
    this.lodSprite.visible = false;
    this.lod.add(this.lodSprite);

    this.axialTiltPivot.add(this.lod);

    this._lodCameraPosition = new THREE.Vector3();
    this._lodWorldPosition = new THREE.Vector3();
    this._lodDirection = new THREE.Vector3();
    this._lodQuaternion = new THREE.Quaternion();
  }

  updateLOD(camera) {
    camera.getWorldPosition(this._lodCameraPosition);
    this.lod.getWorldPosition(this._lodWorldPosition);

    const distance = this._lodCameraPosition.distanceTo(this._lodWorldPosition);
    const fadeRange = Math.max(this.lodDistance * 0.1, 0.01);
    const fadeStart = Math.max(this.lodDistance - fadeRange, 0);
    const fadeEnd = this.lodDistance + fadeRange;
    const spriteOpacity = THREE.MathUtils.smoothstep(
      distance,
      fadeStart,
      fadeEnd,
    );

    this.mesh.visible = spriteOpacity < 1;
    this.mesh.material.uniforms.opacity.value = 1 - spriteOpacity;

    this.lodSprite.visible = spriteOpacity > 0;
    this.lodSprite.material.opacity = spriteOpacity;

    const sizeProgress = THREE.MathUtils.smoothstep(
      distance,
      fadeStart,
      Math.max(this.lodDistance * 3, fadeStart + 1),
    );
    const size = this.lodRadius * 3 * (1 + 5 * sizeProgress);
    this.lodSprite.scale.set(size, size, 1);

    this.lod.getWorldQuaternion(this._lodQuaternion);
    this._lodDirection
      .subVectors(this._lodCameraPosition, this._lodWorldPosition)
      .normalize()
      .applyQuaternion(this._lodQuaternion.invert());
    this.lodSprite.position
      .copy(this._lodDirection)
      .multiplyScalar(this.lodRadius * 1.01);
  }
}
