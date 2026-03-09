import * as THREE from "three";

export class CelestialBody extends THREE.Object3D {
  constructor({
    name = "",
    selectable = true,
    rotationSpeed = 0,
    axialTilt = 0,
    orbit = {},
  } = {}) {
    super();

    this.name = name;
    this.selectable = selectable;
    this.rotationSpeed = rotationSpeed;

    // Orbite
    this.orbit = {
      radius: 0,
      speed: 0,
      inclination: 0,
      phase: 0,
      eccentricity: 0,
      ...orbit,
    };

    this._theta = THREE.MathUtils.degToRad(this.orbit.phase || 0);

    // Anchor orbital
    this.anchor = new THREE.Object3D();
    this.add(this.anchor);

    // Pivot inclinaison axiale
    this.axialTiltPivot = new THREE.Object3D();
    this.axialTiltPivot.rotation.z = THREE.MathUtils.degToRad(axialTilt);
    this.anchor.add(this.axialTiltPivot);

    // Pivot satellites
    this.satellitesPivot = new THREE.Object3D();
    this.anchor.add(this.satellitesPivot);

    this.mesh = null;
  }

  bindMesh(mesh) {
    this.mesh = mesh;
    this.mesh.userData.body = this;
    this.axialTiltPivot.add(mesh);
  }

  addSatellite(body) {
    this.satellitesPivot.add(body);
  }

  getWorldAnchorPosition(target = new THREE.Vector3()) {
    return this.anchor.getWorldPosition(target);
  }

  update(delta) {
    // Rotation propre
    if (this.lod && this.rotationSpeed !== 0) {
      this.lod.rotation.y += this.rotationSpeed * delta;
    }

    // Orbite
    if (this.orbit.radius && this.orbit.speed) {
      this._theta += this.orbit.speed * delta;

      const a = this.orbit.radius;
      const e = this.orbit.eccentricity;

      const inc = THREE.MathUtils.degToRad(this.orbit.inclination);

      const r = (a * (1 - e * e)) / (1 + e * Math.cos(this._theta));

      const x = r * Math.cos(this._theta);
      const z = -r * Math.sin(this._theta);

      const y = z * Math.sin(inc);
      const zFinal = z * Math.cos(inc);

      this.anchor.position.set(x, y, zFinal);
    }
  }
}
