export class Controls {
  constructor(time) {
    this.el = document.getElementById("controls");

    this.el.innerHTML = `
      <div class="controls-panel">
        <label>
          Vitesse du temps
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            value="1"
            id="time-slider"
          />
        </label>
      </div>
    `;

    const slider = document.getElementById("time-slider");

    slider.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      time.setTimeScale(value);
      document.dispatchEvent(new CustomEvent("time:change", { detail: value }));
    });
  }
}
