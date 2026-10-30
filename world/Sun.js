import * as THREE from "three";
import { CelestialBody } from "./CelestialBody.js";
import { Loader } from "../utils/Loader.js";
import { SCALE, SPEED } from "../utils/Constants.js";

//     LOD
let sunCoreTexture;
let sunGlowTexture;

function createRadialTexture(stops) {
  const canvas = document.createElement("canvas");
  canvas.width = 136;
  canvas.height = 136;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to create the Sun LOD sprite texture.");
  }

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [offset, color] of stops) {
    gradient.addColorStop(offset, color);
  }

  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function getSunCoreTexture() {
  sunCoreTexture ??= createRadialTexture([
    [0, "#ffffff"],
    [0.72, "#f0c22d"],
    [0.94, "#e6c534"],
    [1, "rgba(255,255,255,0)"],
  ]);
  return sunCoreTexture;
}

function getSunGlowTexture() {
  sunGlowTexture ??= createRadialTexture([
    [0, "rgba(255,255,255,0.8)"],
    [0.25, "rgba(253, 237, 93, 0.4)"],
    [0.65, "rgba(253, 189, 51, 0.12)"],
    [1, "rgba(255,255,255,0)"],
  ]);
  return sunGlowTexture;
}

export class Sun extends CelestialBody {
  constructor(scene, loader) {
    super();

    this.scene = scene;
    this.loader = loader;

    //  GÉOMÉTRIE
    const geometry = new THREE.SphereGeometry(SCALE.SUN_RADIUS, 64, 64);

    const texture = this.loader.loadTexture("assets/textures/sun/sun.jpg");
    texture.colorSpace = THREE.SRGBColorSpace;

    //  MATÉRIAU (auto-éclairé)
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    this.bindMesh(mesh);

    this.lod = new THREE.Group();
    this.lod.add(mesh);
    this.axialTiltPivot.add(this.lod);

    this.lodDistance = 400;
    this.lodRadius = SCALE.SUN_RADIUS;
    this.lodGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getSunGlowTexture(),
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.lodCore = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: getSunCoreTexture(),
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );
    this.lodGlow.userData.body = this;
    this.lodCore.userData.body = this;
    this.lodGlow.visible = false;
    this.lodCore.visible = false;
    this.lod.add(this.lodGlow, this.lodCore);

    this._lodCameraPosition = new THREE.Vector3();
    this._lodWorldPosition = new THREE.Vector3();
    this._lodDirection = new THREE.Vector3();
    this._lodQuaternion = new THREE.Quaternion();

    //  LUMIÈRE ÉMISE
    this.light = new THREE.DirectionalLight(0xffffff, 2.5);
    this.light.position.set(0, 0, 0);

    this.light.castShadow = true;

    this.light.shadow.mapSize.width = 4096;
    this.light.shadow.mapSize.height = 4096;

    this.light.shadow.camera.near = 0.1;
    this.light.shadow.camera.far = 2000;

    // zone d’ombre couvrant Terre + orbite lunaire
    this.light.shadow.camera.left = -200;
    this.light.shadow.camera.right = 200;
    this.light.shadow.camera.top = 200;
    this.light.shadow.camera.bottom = -200;

    // adoucissement pénombre
    this.light.shadow.radius = 4;
    this.light.shadow.bias = -0.0005;

    this.light.target.position.set(1000, 0, 0);

    this.scene.add(this.light.target);
  }

  addSatellite(body) {
    this.add(body);
  }

  update(delta) {
    // rotation propre du Soleil
    this.rotation.y += SPEED.SUN_ROTATION * delta;
  }

  updateLOD(camera) {
    camera.getWorldPosition(this._lodCameraPosition);
    this.lod.getWorldPosition(this._lodWorldPosition);

    const distance = this._lodCameraPosition.distanceTo(this._lodWorldPosition);
    const fadeRange = Math.max(this.lodDistance * 0.1, 0.01);
    const fadeStart = Math.max(this.lodDistance - fadeRange, 0);
    const spriteOpacity = THREE.MathUtils.smoothstep(
      distance,
      fadeStart,
      this.lodDistance + fadeRange,
    );

    this.mesh.visible = spriteOpacity < 1;
    this.mesh.material.opacity = 1 - spriteOpacity;

    this.lodGlow.visible = spriteOpacity > 0;
    this.lodCore.visible = spriteOpacity > 0;
    this.lodGlow.material.opacity = spriteOpacity;
    this.lodCore.material.opacity = spriteOpacity;

    const sizeProgress = THREE.MathUtils.smoothstep(
      distance,
      fadeStart,
      Math.max(this.lodDistance * 3, fadeStart + 1),
    );
    const coreSize = this.lodRadius * 2 * (1 + 5 * sizeProgress);
    this.lodCore.scale.set(coreSize, coreSize, 1);
    this.lodGlow.scale.set(coreSize * 2.2, coreSize * 2.2, 1);

    this.lod.getWorldQuaternion(this._lodQuaternion);
    this._lodDirection
      .subVectors(this._lodCameraPosition, this._lodWorldPosition)
      .normalize()
      .applyQuaternion(this._lodQuaternion.invert());

    this.lodCore.position
      .copy(this._lodDirection)
      .multiplyScalar(this.lodRadius * 1.01);
    this.lodGlow.position
      .copy(this._lodDirection)
      .multiplyScalar(this.lodRadius * 0.99);
  }
}
