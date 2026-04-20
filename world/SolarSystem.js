import * as THREE from "three";
import { Sun } from "./Sun.js";
import { Planet } from "./Planet.js";
import { Moon } from "./Moon.js";
import { Rings } from "./Rings.js";
import { Orbit } from "./Orbit.js";
import { PlanetMaterialFactory } from "../materials/PlanetMaterialFactory.js";
import { SCALE, DISTANCE, SPEED } from "../utils/Constants.js";

export class SolarSystem extends THREE.Group {
  constructor(scene, loader, shaderManager) {
    super();

    this.scene = scene;
    this.loader = loader;
    this.shaderManager = shaderManager;

    this.materialFactory = new PlanetMaterialFactory(this.shaderManager);

    this.bodies = [];

    // ========= SOLEIL =========
    this.sun = new Sun(this.scene, this.loader);
    this.sun.name = "Sun";
    this.add(this.sun);
    this.registerBody(this.sun);

    // ============ TEXTURES MERCURE =============

    const mercuryTexture = this.loader.loadTexture(
      "assets/textures/mercury/2k_mercury.jpg",
    );
    mercuryTexture.colorSpace = THREE.SRGBColorSpace;

    const mercuryMaterial = this.materialFactory.create({
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
    this.registerBody(this.mercury);

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

    const venusMaterial = this.materialFactory.create({
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
    this.registerBody(this.venus);

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
    const earthMaterial = this.materialFactory.create({
      map: earthDay,
      nightMap: earthNight,
      useNightMap: true,
      useMoonShadow: true,
    });

    earthMaterial.userData = {
      isClouds: true,
      cloudMap: earthClouds,
    };

    this.earthMaterial = earthMaterial;

    // ========= TERRE =========
    this.earth = new Planet({
      name: "Earth",
      radius: SCALE.EARTH_RADIUS,
      material: earthMaterial,
      rotationSpeed: 0.15,
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
    this.registerBody(this.earth);

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

    const cloudMaterial = this.materialFactory.create({
      map: earthClouds,
      useNightMap: false,
      transparent: true,
      depthWrite: false,
      isClouds: true,
    });

    cloudMaterial.blending = THREE.AdditiveBlending;

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
    const moonMaterial = this.materialFactory.create({
      map: moonTexture,
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
    this.registerSatellite(this.earth, this.moon);

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

    const marsMaterial = this.materialFactory.create({
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
    this.registerBody(this.mars);

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

    const jupiterMaterial = this.materialFactory.create({
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
    this.registerBody(this.jupiter);

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

    const saturnMaterial = this.materialFactory.create({
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
    this.registerBody(this.saturn);

    const saturnOrbit = new Orbit(
      this.saturn.orbit.radius,
      this.saturn.orbit.eccentricity,
      this.saturn.orbit.inclination,
      this.saturn,
      0xe8d090,
    );

    this.sun.add(saturnOrbit);

    // =========== TEXTURES ANNEAUX ============
    const ringsTexture = this.loader.loadTexture(
      "assets/textures/saturn/2k_saturn_ring_alpha.png",
    );
    ringsTexture.colorSpace = THREE.SRGBColorSpace;

    // ============ ANNEAUX SATURNE ============
    const rings = new Rings({
      innerRadius: SCALE.SATURN_RADIUS * 1.3,
      outerRadius: SCALE.SATURN_RADIUS * 2.2,
      texture: ringsTexture,
      tilt: 26.7,
    });

    rings.attachTo(this.saturn);

    // ============ TEXTURES URANUS =============

    const uranusTexture = this.loader.loadTexture(
      "assets/textures/uranus/2k_uranus.jpg",
    );
    uranusTexture.colorSpace = THREE.SRGBColorSpace;

    const uranusMaterial = this.materialFactory.create({
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
    this.registerBody(this.uranus);

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

    const neptuneMaterial = this.materialFactory.create({
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
    this.registerBody(this.neptune);

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

  registerBody(body) {
    body.childrenBodies = [];
    this.bodies.push(body);
  }

  registerSatellite(parent, satellite) {
    satellite.childrenBodies = [];
    parent.childrenBodies.push(satellite);
  }

  buildNode(body) {
    return {
      name: body.name,
      ref: body,
      children: (body.childrenBodies || []).map((child) =>
        this.buildNode(child),
      ),
    };
  }

  getAllBodies() {
    return this.bodies.map((body) => this.buildNode(body));
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

    this.sun.light.position.copy(sunWorld);

    // Direction soleil -> Terre (référence unique)
    const sunDirection = sunWorld.clone().sub(earthWorld).normalize();

    const earthForward = new THREE.Vector3(0, 0, 1)
      .applyQuaternion(this.earth.anchor.quaternion)
      .normalize();

    const lightFactor = Math.max(0, earthForward.dot(sunDirection));

    // Eclairage nuages et rotation
    this.earthClouds.material.opacity = 0.3 * lightFactor;
    this.earthClouds.rotation.y += delta * 0.3;

    // Direction soleil pour CHAQUE objet
    this.scene.traverse((obj) => {
      if (obj.material && obj.material.uniforms?.sunDirectionWorld) {
        const objWorld = new THREE.Vector3();
        obj.getWorldPosition(objWorld);

        const dir = new THREE.Vector3()
          .subVectors(sunWorld, objWorld)
          .normalize();

        obj.material.uniforms.sunDirectionWorld.value.copy(dir);
      }
    });

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

    // ==============================
    // UPDATES
    // ==============================

    this.sun.update(delta);
    this.earth.update(delta);
    this.moon.update(delta);
  }
}
