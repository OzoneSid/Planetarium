export class Controls {
  constructor(time) {
    this.el = document.getElementById("controls");

    const slider = document.getElementById("time-slider");

    slider.addEventListener("input", (e) => {
      const value = Number(e.target.value);
      time.setTimeScale(value);
      document.dispatchEvent(new CustomEvent("time:change", { detail: value }));
    });
  }
}
