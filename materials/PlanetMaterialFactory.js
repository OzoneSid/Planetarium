import * as THREE from "three";

export class PlanetMaterialFactory {
  constructor(shaderManager) {
    this.shader = shaderManager.get("planet");
  }

  create({
    map,
    nightMap = null,
    useNightMap = false,
    useMoonShadow = false,
    transparent = false,
    depthWrite = true,
    isClouds = false,
  }) {
    return new THREE.ShaderMaterial({
      vertexShader: this.shader.vertex,
      fragmentShader: this.shader.fragment,

      transparent: transparent,
      depthWrite: depthWrite,

      uniforms: {
        time: { value: 0 },

        sunPositionWorld: { value: new THREE.Vector3() },
        earthPositionWorld: { value: new THREE.Vector3() },

        lightPosition: { value: new THREE.Vector3() },

        eclipseFactor: { value: 0 },

        isClouds: { value: isClouds },

        map: { value: map },
        nightMap: { value: nightMap },

        useNightMap: { value: useNightMap },
        useMoonShadow: { value: useMoonShadow },

        sunDirectionWorld: { value: new THREE.Vector3() },

        moonShadowFactor: { value: 0 },
        moonDirectionWorld: { value: new THREE.Vector3() },
        moonAngularRadius: { value: 0.2 },
      },
    });
  }
}
