export class Time {
  constructor() {
    this.start = performance.now();
    this.current = this.start;
    this.delta = 0;

    // Multiplicateur de temps (1 = temps réel)
    this.timeScale = 1;

    // Sécurité anti-gros sauts
    this.maxDelta = 0.05; // 50 ms
  }

  update() {
    const now = performance.now();
    this.delta = (now - this.current) / 1000;
    this.current = now;

    // Clamp du delta
    this.delta = Math.min(this.delta, this.maxDelta);

    return this.delta * this.timeScale;
  }

  getDelta() {
    return this.update();
  }

  setTimeScale(value) {
    this.timeScale = Math.max(0, value);
  }
}
