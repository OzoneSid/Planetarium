export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Echelle logarithmique
export function logScale(value, factor = 10) {
  return Math.log(value + 1) * factor;
}
