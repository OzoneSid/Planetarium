varying vec3 vWorldNormal;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec4 worldNormal = modelMatrix * vec4(normal, 0.0);
  vWorldNormal = normalize(worldNormal.xyz);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}