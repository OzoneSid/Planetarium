import { SolarSystem } from "../world/SolarSystem.js";
import { SceneManager } from "./SceneManager.js";
import { Skybox } from "../world/Skybox.js";
import { UIManager } from "../ui/UIManager.js";
import { CameraManager } from "./CameraManager.js";
import { SelectionManager } from "./SelectionManager.js";

export class App {
  constructor() {
    this.sceneManager = new SceneManager();

    this.solarSystem = new SolarSystem(this.sceneManager.scene);
    this.skybox = new Skybox(this.sceneManager.scene);

    this.skybox.load();

    this.ui = new UIManager({
      time: this.sceneManager.time,
    });

    this.cameraManager = new CameraManager(
      this.sceneManager.renderer,
      this.sceneManager.scene,
    );

    this.selectionManager = new SelectionManager(
      this.sceneManager.scene,
      this.cameraManager,
      this.sceneManager.renderer,
    );

    this.sceneManager.setCameraManager(this.cameraManager);

    this.sceneManager.start();
  }
}
