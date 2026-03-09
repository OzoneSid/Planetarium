import * as THREE from "three";

export class Orbit extends THREE.Line {
  constructor(
    radius,
    eccentricity = 0,
    inclination = 0,
    body = null,
    color = 0xffffff,
    segments = 256,
  ) {
    const geometry = new THREE.BufferGeometry();
    const points = [];

    const a = radius;
    const e = eccentricity;
    const inc = THREE.MathUtils.degToRad(inclination);

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;

      const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));

      const x = r * Math.cos(theta);
      const z = -r * Math.sin(theta);

      const y = z * Math.sin(inc);
      const zFinal = z * Math.cos(inc);

      points.push(x, y, zFinal);
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(points, 3),
    );

    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.4,
    });

    super(geometry, material);

    this.userData.body = body;
    this.userData.type = "orbit";
  }
}
