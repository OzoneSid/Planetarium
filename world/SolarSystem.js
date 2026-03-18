import * as THREE from "three";
import { Sun } from "./Sun.js";
import { Planet } from "./Planet.js";
import { Moon } from "./Moon.js";
import { Orbit } from "./Orbit.js";
import { Loader } from "../utils/Loader.js";
import { SCALE, DISTANCE, SPEED } from "../utils/Constants.js";

export class SolarSystem extends THREE.Group {
  constructor(scene, loader) {
    super();

    this.scene = scene;
    this.loader = loader;

    this.loader = new Loader();

    // ========= SOLEIL =========
    this.sun = new Sun(this.scene, this.loader);
    this.add(this.sun);

    // ============ TEXTURES MERCURE =============

    const mercuryTexture = this.loader.loadTexture(
      "assets/textures/mercury/2k_mercury.jpg",
    );
    mercuryTexture.colorSpace = THREE.SRGBColorSpace;

    const mercuryMaterial = new THREE.MeshStandardMaterial({
      map: mercuryTexture,
    });
    // ============ MERCURE ==============

    this.mercury = new Planet({
      name: "Mercury",
      radius: SCALE.MERCURY_RADIUS,
      material: mercuryMaterial,
      rotationSpeed: 0.02,
      axialTilt: 0.03,
      orbit: {
        radius: DISTANCE.MERCURY_ORBIT,
        speed: SPEED.MERCURY_SPEED,
        eccentricity: 0.205,
        inclination: 7,
      },
      lodColor: 0xb5b5b5,
    });

    this.sun.add(this.mercury);

    const mercuryOrbit = new Orbit(
      this.mercury.orbit.radius,
      this.mercury.orbit.eccentricity,
      this.mercury.orbit.inclination,
      this.mercury,
      0xb5b5b5,
    );

    this.sun.add(mercuryOrbit);

    // ============ TEXTURES VENUS =============

    const venusTexture = this.loader.loadTexture(
      "assets/textures/venus/2k_venus_surface.jpg",
    );
    venusTexture.colorSpace = THREE.SRGBColorSpace;

    const venusMaterial = new THREE.MeshStandardMaterial({
      map: venusTexture,
    });

    // ============ VENUS ==============

    this.venus = new Planet({
      name: "Venus",
      radius: SCALE.VENUS_RADIUS,
      material: venusMaterial,
      rotationSpeed: 0.02,
      axialTilt: 177,
      orbit: {
        radius: DISTANCE.VENUS_ORBIT,
        speed: SPEED.VENUS_SPEED,
        eccentricity: 0.0067,
        inclination: 3.4,
      },
      lodColor: 0xd6c28a,
    });

    this.sun.add(this.venus);

    const venusOrbit = new Orbit(
      this.venus.orbit.radius,
      this.venus.orbit.eccentricity,
      this.venus.orbit.inclination,
      this.venus,
      0xd6c28a,
    );

    this.sun.add(venusOrbit);

    // ========= TEXTURES TERRE =========
    const earthDay = this.loader.loadTexture(
      "assets/textures/earth/earth_daymap.jpg",
    );
    earthDay.colorSpace = THREE.SRGBColorSpace;
    earthDay.wrapS = earthDay.wrapT = THREE.RepeatWrapping;

    const earthNight = this.loader.loadTexture(
      "assets/textures/earth/earth_nightmap.jpg",
    );
    earthNight.colorSpace = THREE.SRGBColorSpace;
    earthNight.wrapS = earthNight.wrapT = THREE.RepeatWrapping;

    const earthClouds = this.loader.loadTexture(
      "assets/textures/earth/earth_clouds.png",
    );
    earthClouds.colorSpace = THREE.SRGBColorSpace;

    // ========= SHADER TERRE  =========
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayMap: { value: earthDay },
        nightMap: { value: earthNight },
        sunDirectionWorld: { value: new THREE.Vector3() },
        moonShadowFactor: { value: 0.0 },
        moonDirectionWorld: { value: new THREE.Vector3() },
        moonAngularRadius: { value: 0.25 },
      },

      vertexShader: `
        varying vec3 vWorldNormal;
        varying vec2 vUv;

        void main() {
          vUv = uv;

          vWorldNormal = normalize(mat3(modelMatrix) * normal);

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        precision mediump float;

        uniform sampler2D dayMap;
        uniform sampler2D nightMap;
        uniform vec3 sunDirectionWorld;
        uniform float moonShadowFactor;
        uniform vec3 moonDirectionWorld;
        uniform float moonAngularRadius;

        varying vec3 vWorldNormal;
        varying vec2 vUv;

        void main() {
         vec3 normal = normalize(vWorldNormal);
vec3 sunDir = normalize(sunDirectionWorld);

float ndl = dot(normal, sunDir);
float dayMix = smoothstep(-0.2, 0.2, ndl);

vec4 dayColor = texture2D(dayMap, vUv);
vec4 nightColor = texture2D(nightMap, vUv);

vec4 finalColor = mix(nightColor, dayColor, dayMix);


// =======================
// OMBRE LUNAIRE 
// =======================

vec3 moonDir = normalize(moonDirectionWorld);

// uniquement côté jour
float dayMask = step(0.0, dot(normal, sunDir));

// projection locale (pas globale)
float angular = dot(normal, moonDir);

float radial = smoothstep(
    cos(moonAngularRadius * 2.5),
    cos(moonAngularRadius * 0.2),
    angular
);

// ombre finale
float moonShadow = moonShadowFactor * radial * dayMask;

// réduit l'impact lorsque le soleil est rasant
float sunFade = smoothstep(0.0, 0.6, dot(normal, sunDir));
moonShadow *= sunFade;

// application douce
float softness = smoothstep(0.0, 1.0, moonShadow);
finalColor.rgb *= (1.0 - softness * 0.85);


gl_FragColor = finalColor;
    }
      `,
    });

    earthMaterial.userData = {
      cloudMap: earthClouds,
    };

    this.earthMaterial = earthMaterial;

    // ========= TERRE =========
    this.earth = new Planet({
      name: "Earth",
      radius: SCALE.EARTH_RADIUS,
      material: earthMaterial,
      rotationSpeed: 0.3,
      axialTilt: 23.44,
      orbit: {
        radius: DISTANCE.EARTH_ORBIT,
        speed: SPEED.EARTH_SPEED,
        inclination: 0,
        phase: 0,
        eccentricity: 0.0167,
      },
      lodColor: 0x4aa3ff,
    });

    this.sun.add(this.earth);

    const earthOrbit = new Orbit(
      this.earth.orbit.radius,
      this.earth.orbit.eccentricity,
      this.earth.orbit.inclination,
      this.earth,
      0x4aa3ff,
    );

    this.sun.add(earthOrbit);

    this.earth.mesh.material.lights = false;

    // ========= NUAGES TERRE =========
    const cloudGeometry = new THREE.SphereGeometry(
      SCALE.EARTH_RADIUS * 1.01,
      64,
      64,
    );

    const cloudMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        cloudMap: { value: earthClouds },
        sunDirectionWorld: { value: new THREE.Vector3() },
        moonDirectionWorld: { value: new THREE.Vector3() },
        moonAngularRadius: { value: 0.0 },
        moonShadowFactor: { value: 0.0 },
      },
      vertexShader: `
    varying vec3 vWorldNormal;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vWorldNormal = normalize(mat3(modelMatrix) * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    precision mediump float;

uniform sampler2D cloudMap;
uniform vec3 sunDirectionWorld;
uniform vec3 moonDirectionWorld;
uniform float moonAngularRadius;
uniform float moonShadowFactor;

varying vec3 vWorldNormal;
varying vec2 vUv;

void main() {

  vec4 cloud = texture2D(cloudMap, vUv);

  float density = cloud.r;
  if (density < 0.05) discard;

  vec3 normal = normalize(vWorldNormal);

  // éclairage solaire
  vec3 sunDir = normalize(sunDirectionWorld);
  float ndl = dot(normal, sunDir);
  float dayMix = smoothstep(-0.2, 0.2, ndl);

  float light = mix(0.15, 1.0, dayMix);

  vec3 finalColor = vec3(light);

  // =======================
  // OMBRE LUNAIRE (identique Terre)
  // =======================

  vec3 moonDir = normalize(moonDirectionWorld);

  float dayMask = step(0.0, dot(normal, sunDir));
  float angular = dot(normal, moonDir);

  float radial = smoothstep(
      cos(moonAngularRadius),
      cos(moonAngularRadius * 0.5),
      angular
  );

  float moonShadow = moonShadowFactor * radial * dayMask;

  finalColor *= (1.0 - moonShadow);

  gl_FragColor = vec4(finalColor, density * 0.6);
}
   `,
    });

    this.earthClouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.earthClouds.userData.ignoreRaycast = true;

    // Attacher les nuages à la Terre
    this.earth.anchor.add(this.earthClouds);

    // Mécanismes orbitaux

    this.earth.anchor.position.x = DISTANCE.EARTH_ORBIT;

    const earthOrbitLine = new Orbit(
      this.earth.orbit.radius,
      this.earth.orbit.eccentricity,
    );

    earthOrbitLine.rotation.z = THREE.MathUtils.degToRad(
      this.earth.orbit.inclination,
    );

    this.sun.add(earthOrbitLine);
    this.sun.addSatellite(this.earth);

    // ====== TEXTURE LUNE =====
    const moonTexture = this.loader.loadTexture(
      "assets/textures/moon/moon.jpg",
    );
    moonTexture.colorSpace = THREE.SRGBColorSpace;

    // ========= LUNE =========
    const moonMaterial = new THREE.ShaderMaterial({
      uniforms: {
        moonMap: { value: moonTexture },
        sunPositionWorld: { value: new THREE.Vector3() },
        earthPositionWorld: { value: new THREE.Vector3() },
        eclipseFactor: { value: 1.0 },
      },

      vertexShader: `
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vNormal = normalize(mat3(modelMatrix) * normal);

      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,

      fragmentShader: `
    uniform sampler2D moonMap;
    uniform vec3 sunPositionWorld;
    uniform vec3 earthPositionWorld;
    uniform float eclipseFactor;

    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 lightDir = normalize(sunPositionWorld - vWorldPosition);

      float ndl = max(dot(normal, lightDir), 0.0);
      ndl = pow(ndl, 0.8);

      float ambient = 0.18;

      float sunLight = ndl * eclipseFactor;
      float light = ambient + sunLight;

      vec4 base = texture2D(moonMap, vUv);
      gl_FragColor = vec4(base.rgb * light, 1.0);
    }
  `,
    });

    this.moon = new Moon({
      name: "Moon",
      radius: SCALE.MOON_RADIUS,
      material: moonMaterial,
      rotationSpeed: 0.1,
      axialTilt: 6.68,
      orbit: {
        radius: 20,
        speed: SPEED.MOON_SPEED,
        inclination: 5.14,
        phase: 180,
        eccentricity: 0.0549,
      },
    });

    this.earth.addSatellite(this.moon);

    const moonOrbitLine = new Orbit(
      this.moon.orbit.radius,
      this.moon.orbit.eccentricity,
      this.moon.orbit.inclination,
      this.moon,
    );

    this.earth.satellitesPivot.add(moonOrbitLine);

    // ============ TEXTURES MARS =============

    const marsTexture = this.loader.loadTexture(
      "assets/textures/mars/2k_mars.jpg",
    );
    marsTexture.colorSpace = THREE.SRGBColorSpace;

    const marsMaterial = new THREE.MeshStandardMaterial({
      map: marsTexture,
    });

    // ============ MARS =============

    this.mars = new Planet({
      name: "Mars",
      radius: SCALE.MARS_RADIUS,
      material: marsMaterial,
      rotationSpeed: 0.02,
      axialTilt: 25,
      orbit: {
        radius: DISTANCE.MARS_ORBIT,
        speed: SPEED.MARS_SPEED,
        eccentricity: 0.093,
        inclination: 1.85,
      },
      lodColor: 0xff5533,
    });

    this.sun.add(this.mars);

    const marsOrbit = new Orbit(
      this.mars.orbit.radius,
      this.mars.orbit.eccentricity,
      this.mars.orbit.inclination,
      this.mars,
      0xff5533,
    );

    this.sun.add(marsOrbit);

    // ============ TEXTURES JUPITER =============

    const jupiterTexture = this.loader.loadTexture(
      "assets/textures/jupiter/2k_jupiter.jpg",
    );
    jupiterTexture.colorSpace = THREE.SRGBColorSpace;

    const jupiterMaterial = new THREE.MeshStandardMaterial({
      map: jupiterTexture,
    });

    // ============ JUPITER =============

    this.jupiter = new Planet({
      name: "Jupiter",
      radius: SCALE.JUPITER_RADIUS,
      material: jupiterMaterial,
      rotationSpeed: 0.02,
      axialTilt: 3,
      orbit: {
        radius: DISTANCE.JUPITER_ORBIT,
        speed: 0.025,
        eccentricity: 0.048,
        inclination: 1.3,
      },
      lodColor: 0xd2b48c,
    });

    this.sun.add(this.jupiter);

    const jupiterOrbit = new Orbit(
      this.jupiter.orbit.radius,
      this.jupiter.orbit.eccentricity,
      this.jupiter.orbit.inclination,
      this.jupiter,
      0xd2b48c,
    );

    this.sun.add(jupiterOrbit);

    // ============ TEXTURES SATURNE =============

    const saturnTexture = this.loader.loadTexture(
      "assets/textures/saturn/2k_saturn.jpg",
    );
    saturnTexture.colorSpace = THREE.SRGBColorSpace;

    const saturnMaterial = new THREE.MeshStandardMaterial({
      map: saturnTexture,
    });

    // ============ SATURNE =============

    this.saturn = new Planet({
      name: "Saturn",
      radius: SCALE.SATURN_RADIUS,
      material: saturnMaterial,
      rotationSpeed: 0.02,
      axialTilt: 26.7,
      orbit: {
        radius: DISTANCE.SATURN_ORBIT,
        speed: 0.018,
        eccentricity: 0.056,
        inclination: 2.5,
      },
      lodColor: 0xe8d090,
    });

    this.sun.add(this.saturn);

    const saturnOrbit = new Orbit(
      this.saturn.orbit.radius,
      this.saturn.orbit.eccentricity,
      this.saturn.orbit.inclination,
      this.saturn,
      0xe8d090,
    );

    this.sun.add(saturnOrbit);

    // ============ TEXTURES URANUS =============

    const uranusTexture = this.loader.loadTexture(
      "assets/textures/uranus/2k_uranus.jpg",
    );
    uranusTexture.colorSpace = THREE.SRGBColorSpace;

    const uranusMaterial = new THREE.MeshStandardMaterial({
      map: uranusTexture,
    });

    // ============ URANUS =============

    this.uranus = new Planet({
      name: "Uranus",
      radius: SCALE.URANUS_RADIUS,
      material: uranusMaterial,
      rotationSpeed: 0.02,
      axialTilt: 97.8,
      orbit: {
        radius: DISTANCE.URANUS_ORBIT,
        speed: 0.012,
        eccentricity: 0.046,
        inclination: 0.8,
      },
      lodColor: 0x9fefff,
    });

    this.sun.add(this.uranus);

    const uranusOrbit = new Orbit(
      this.uranus.orbit.radius,
      this.uranus.orbit.eccentricity,
      this.uranus.orbit.inclination,
      this.uranus,
      0x9fefff,
    );

    this.sun.add(uranusOrbit);

    // ============ TEXTURES NEPTUNE =============

    const neptuneTexture = this.loader.loadTexture(
      "assets/textures/neptune/2k_neptune.jpg",
    );
    neptuneTexture.colorSpace = THREE.SRGBColorSpace;

    const neptuneMaterial = new THREE.MeshStandardMaterial({
      map: neptuneTexture,
    });

    // ============ NEPTUNE =============

    this.neptune = new Planet({
      name: "Neptune",
      radius: SCALE.NEPTUNE_RADIUS,
      material: neptuneMaterial,
      rotationSpeed: 0.02,
      axialTilt: 28,
      orbit: {
        radius: DISTANCE.NEPTUNE_ORBIT,
        speed: 0.01,
        eccentricity: 0.009,
        inclination: 1.8,
      },
      lodColor: 0x4a6cff,
    });

    this.sun.add(this.neptune);

    const neptuneOrbit = new Orbit(
      this.neptune.orbit.radius,
      this.neptune.orbit.eccentricity,
      this.neptune.orbit.inclination,
      this.neptune,
      0x4a6cff,
    );

    this.sun.add(neptuneOrbit);

    // ============== FIN DE GENERATION ==================

    scene.add(this);
  }

  update(delta) {
    const sunWorld = new THREE.Vector3();
    const earthWorld = new THREE.Vector3();
    const moonWorld = new THREE.Vector3();

    // Positions monde
    this.sun.getWorldPosition(sunWorld);
    this.earth.getWorldAnchorPosition(earthWorld);
    this.moon.mesh.getWorldPosition(moonWorld);

    // ==============================
    // ÉCLAIRAGE SOLAIRE GLOBAL
    // ==============================

    // Direction soleil -> Terre (référence unique)
    const sunDirection = sunWorld.clone().sub(earthWorld).normalize();

    this.earthMaterial.uniforms.sunDirectionWorld.value.copy(sunDirection);

    if (this.earthClouds) {
      this.earthClouds.material.uniforms.sunDirectionWorld.value.copy(
        sunDirection,
      );
    }

    // Direction soleil -> Lune
    this.moon.mesh.material.uniforms.sunPositionWorld.value.copy(sunWorld);
    this.moon.mesh.material.uniforms.earthPositionWorld.value.copy(earthWorld);

    // ==============================
    // ÉCLIPSE LUNAIRE (Terre -> Lune)
    // ==============================

    const sunDirFromEarth = sunWorld.clone().sub(earthWorld).normalize();
    const shadowDirEarth = sunDirFromEarth.clone().negate();

    const sunRadius = SCALE.SUN_RADIUS;
    const earthRadius = SCALE.EARTH_RADIUS;
    const sunEarthDist = sunWorld.distanceTo(earthWorld);

    const coneAngleEarth = Math.atan(earthRadius / sunEarthDist);

    const earthToMoon = moonWorld.clone().sub(earthWorld);
    const projLength = earthToMoon.dot(shadowDirEarth);

    const projectedPoint = earthWorld
      .clone()
      .add(shadowDirEarth.clone().multiplyScalar(projLength));

    const lateralDist = moonWorld.distanceTo(projectedPoint);

    const EARTH_SHADOW_SCALE = 4.0;

    const shadowRadius =
      projLength * Math.tan(coneAngleEarth) * EARTH_SHADOW_SCALE;

    let eclipseFactor = 1.0;

    if (projLength > 0 && lateralDist < shadowRadius * 2.0) {
      const t = lateralDist / (shadowRadius * 2.0);
      eclipseFactor = THREE.MathUtils.clamp(t, 0.0, 1.0);
    }

    this.moon.mesh.material.uniforms.eclipseFactor.value = eclipseFactor;

    // ==============================
    // ÉCLIPSE SOLAIRE (Lune -> Terre)
    // ==============================

    const sunToMoon = moonWorld.clone().sub(sunWorld);
    const sunDirMoon = sunToMoon.clone().normalize();

    // angle apparent du soleil depuis la Terre
    const coneAngleMoon = Math.atan(sunRadius / sunEarthDist);

    const moonToEarth = earthWorld.clone().sub(moonWorld);
    const projLengthMoon = moonToEarth.dot(sunDirMoon);

    const projectedPointMoon = moonWorld
      .clone()
      .add(sunDirMoon.clone().multiplyScalar(projLengthMoon));

    const lateralDistMoon = earthWorld.distanceTo(projectedPointMoon);

    const SHADOW_SCALE = 160.0;

    const shadowRadiusMoon =
      projLengthMoon * Math.tan(coneAngleMoon) * SHADOW_SCALE;

    let moonShadowTarget = 0.0;

    const sunToMoonDir = sunDirMoon.clone().normalize();
    const moonToEarthDirNorm = moonToEarth.clone().normalize();
    const alignment = sunToMoonDir.dot(moonToEarthDirNorm);

    // calcul cible (ombre “physique”)
    if (projLengthMoon > 0 && alignment > 0.96) {
      const distNorm = lateralDistMoon / (shadowRadiusMoon * 2.0);
      const penumbra = 1.0 - distNorm;

      moonShadowTarget = THREE.MathUtils.smoothstep(penumbra, 0.0, 1.0);
    }

    // lerp actif (entrée + sortie douce)
    this._moonShadowLerp = THREE.MathUtils.lerp(
      this._moonShadowLerp ?? 0,
      moonShadowTarget,
      0.06,
    );

    const moonShadowFactor = this._moonShadowLerp;

    // direction ombre lunaire sur Terre (opposée au soleil)
    const moonShadowDir = sunWorld.clone().sub(moonWorld).normalize();

    this.earthMaterial.uniforms.moonShadowFactor.value = moonShadowFactor;
    this.earthMaterial.uniforms.moonDirectionWorld.value.copy(moonShadowDir);
    this.earthMaterial.uniforms.moonAngularRadius.value = 0.18;

    if (this.earthClouds) {
      this.earthClouds.material.uniforms.moonDirectionWorld.value.copy(
        moonShadowDir,
      );
      this.earthClouds.material.uniforms.moonAngularRadius.value = 0.18;
    }

    this.earthClouds.material.uniforms.moonShadowFactor.value =
      moonShadowFactor;

    // ==============================
    // UPDATES
    // ==============================

    this.sun.update(delta);
    this.earth.update(delta);
    this.moon.update(delta);
  }
}
