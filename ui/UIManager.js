import { HUD } from "./HUD.js";
import { Controls } from "./Controls.js";

export class UIManager {
  constructor({ time }) {
    this.hud = new HUD();
    this.controls = new Controls(time);

    document.addEventListener("time:change", (e) => {
      this.hud.updateTimeScale(e.detail);
    });
  }
}
