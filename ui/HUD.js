export class HUD {
  constructor() {
    this.el = document.getElementById("hud");

    this.el.innerHTML = `
      <div class="hud-panel">
        <h2>Système solaire</h2>
        <p id="time-scale">Temps : x1</p>
      </div>
    `;
  }

  updateTimeScale(value) {
    const el = document.getElementById("time-scale");
    if (el) el.textContent = `Temps : x${value}`;
  }
}
