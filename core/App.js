import { SolarSystem } from "../world/SolarSystem.js";
import { SceneManager } from "./SceneManager.js";
import { Skybox } from "../world/Skybox.js";
import { UIManager } from "../ui/UIManager.js";
import { CameraManager } from "./CameraManager.js";
import { SelectionManager } from "./SelectionManager.js";
import { Loader } from "../utils/Loader.js";

export class App {
  constructor() {
    if (this.isMobile()) {
      this.showMobileWarning();
    } else {
      this.startApp();
    }
  }

  startApp() {
    // Ensure disclaimer overlay is hidden in case it was shown
    this.hideMobileWarning();

    this.sceneManager = new SceneManager();

    this.loader = new Loader();

    this.solarSystem = new SolarSystem(this.sceneManager.scene, this.loader);

    this.skybox = new Skybox(this.sceneManager.scene, this.loader);

    this.cameraManager = new CameraManager(
      this.sceneManager.renderer,
      this.sceneManager.scene,
    );

    this.selectionManager = new SelectionManager(
      this.sceneManager.scene,
      this.cameraManager,
      this.sceneManager.renderer,
    );

    this.ui = new UIManager({
      time: this.sceneManager.time,
      cameraManager: this.cameraManager,
      solarSystem: this.solarSystem,
    });

    this.sceneManager.setCameraManager(this.cameraManager);

    this.sceneManager.start();

    this.skybox.load();
  }

  isMobile() {
    const ua = navigator.userAgent || "";
    const result =
      /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(ua);
    console.info("[App] isMobile()", { ua, result });
    return result;
  }

  hideMobileWarning() {
    const warning = document.getElementById("mobile-warning");
    const mainUI = document.getElementById("main-ui");
    const scene = document.getElementById("scene3d");

    if (warning) {
      warning.classList.add("hidden");
    }

    if (mainUI) {
      mainUI.classList.remove("hidden");
    }

    if (scene) {
      scene.classList.remove("hidden");
    }
  }

  showMobileWarning() {
    const warning = document.getElementById("mobile-warning");
    const loading = document.getElementById("loading-screen");
    const mainUI = document.getElementById("main-ui");
    const scene = document.getElementById("scene3d");

    if (warning) {
      warning.classList.remove("hidden");
    }

    if (loading) {
      loading.style.display = "none";
    }

    if (mainUI) {
      mainUI.classList.add("hidden");
    }

    if (scene) {
      scene.classList.add("hidden");
    }

    const dismiss = document.getElementById("mobile-warning-dismiss");
    if (dismiss) {
      dismiss.onclick = () => {
        this.hideMobileWarning();
        this.startApp();
      };
    }
  }
}
