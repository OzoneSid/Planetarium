import * as THREE from "three";

export class Rings {
  constructor({ innerRadius, outerRadius, texture, tilt = 0 }) {
    const geometry = new THREE.RingGeometry(innerRadius, outerRadius, 128);

    // UV FIX
    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);

      const r = Math.sqrt(x * x + y * y);
      const u = (r - innerRadius) / (outerRadius - innerRadius);

      uv.setXY(i, u, 0.5);
    }

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      roughness: 1,
      metalness: 0,
    });

    this.mesh = new THREE.Mesh(geometry, material);

    // Orientation
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.rotation.z = THREE.MathUtils.degToRad(tilt);
  }

  attachTo(body) {
    body.anchor.add(this.mesh);
  }
}
