precision mediump float;

uniform sampler2D map;
uniform sampler2D nightMap;

uniform bool useNightMap;
uniform bool useMoonShadow;
uniform bool isClouds;

uniform vec3 sunDirectionWorld;

uniform float moonShadowFactor;
uniform vec3 moonDirectionWorld;
uniform float moonAngularRadius;

uniform float eclipseFactor;

varying vec3 vWorldNormal;
varying vec2 vUv;

void main() {

  vec3 normal = normalize(vWorldNormal);
  vec3 sunDir = normalize(sunDirectionWorld);

  // ===== LUMIÈRE =====
  float ndl = dot(normal, sunDir);
  float light = smoothstep(-0.2, 0.2, ndl);

  // ===== TEXTURE =====
  vec4 baseColor = texture2D(map, vUv);

  vec3 finalRGB;
  float finalAlpha = 1.0;

  // =========================================================
  //  MODE PLANÈTE (avec ou sans night map)
  // =========================================================
  if (useNightMap) {

    vec3 dayColor = baseColor.rgb * light;

    vec3 nightColor = texture2D(nightMap, vUv).rgb;
    vec3 nightLit = nightColor * (1.0 - light);

    finalRGB = dayColor + nightLit;

  } else {

    // planète simple (pas de night map)
    finalRGB = baseColor.rgb * light;

  }

  // =========================================================
  //  OMBRE LUNAIRE (optionnelle)
  // =========================================================
  if (useMoonShadow) {

    vec3 moonDir = normalize(moonDirectionWorld);

    float dayMask = step(0.0, dot(normal, sunDir));
    float angular = dot(normal, moonDir);

    float radial = smoothstep(
      cos(moonAngularRadius),
      cos(moonAngularRadius * 0.5),
      angular
    );

    float shadow = moonShadowFactor * radial * dayMask;

    finalRGB *= (1.0 - shadow);
  }

  // =========================================================
  //  MODE NUAGES
  // =========================================================
  if (isClouds) {

  float alpha = baseColor.r;

  
  finalRGB = vec3(0.6, 0.65, 0.7) * light;

  
  float dayMask = smoothstep(-0.01, 0.4, light);

  
  finalAlpha = alpha * dayMask * 0.7;
}

  gl_FragColor = vec4(finalRGB, finalAlpha);
}