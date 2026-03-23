export class UIManager {
  constructor({ time, cameraManager, solarSystem }) {
    this.time = time;
    this.cameraManager = cameraManager;
    this.solarSystem = solarSystem;

    this.init();
  }

  init() {
    this.menuButton = document.getElementById("menu-button");
    this.dropdown = document.getElementById("dropdown-menu");
    this.timeMenu = document.getElementById("time-menu");
    this.timeBackward = document.getElementById("time-backward");
    this.timePause = document.getElementById("time-pause");
    this.timeForward = document.getElementById("time-forward");
    this.timeFactor = document.getElementById("time-factor");
    this.bodyList = document.getElementById("body-list");

    this.menuButton.addEventListener("click", () => {
      this.dropdown.classList.toggle("hidden");
      this.timeMenu.classList.toggle("hidden");
    });

    this.initBodies();
    this.initTimeControls();
  }

  initBodies() {
    const tree = this.solarSystem.getAllBodies();
    tree.forEach((node) => this.createNode(node, this.bodyList));
  }

  createNode(node, container) {
    const li = document.createElement("li");
    li.textContent = node.name;

    li.onclick = () => {
      this.cameraManager.follow(node.ref);
    };

    container.appendChild(li);

    if (node.children && node.children.length > 0) {
      const ul = document.createElement("ul");
      ul.style.paddingLeft = "15px";

      node.children.forEach((child) => {
        this.createNode(child, ul);
      });

      container.appendChild(ul);
    }
  }

  applyTime() {
    this.time.setTimeScale(this.currentScale);
    this.updateTimeDisplay();
  }

  initTimeControls() {
    this.currentScale = 1;
    this.isPaused = false;
    this.pausedScale = 1;

    this.updateTimeDisplay();

    this.timeForward.onclick = () => {
      if (!this.isPaused) {
        this.currentScale *= 2;
        this.applyTime();
      }
    };

    this.timeBackward.onclick = () => {
      if (!this.isPaused) {
        this.currentScale /= 2;
        this.applyTime();
      }
    };

    this.timePause.onclick = () => {
      this.isPaused = !this.isPaused;
      if (this.isPaused) {
        this.pausedScale = this.currentScale;
        this.currentScale = 0;
      } else {
        this.currentScale = this.pausedScale;
      }
      this.applyTime();
    };
  }

  updateTimeDisplay() {
    if (this.isPaused) {
      this.timePause.textContent = "▶";
      this.timeFactor.textContent = "⏸";
      return;
    }

    this.timePause.textContent = "⏸";
    this.timeFactor.textContent = "x" + this.currentScale;
  }
}
