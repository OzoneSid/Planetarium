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

    this.timeBackwardImg = this.timeBackward.querySelector("img");
    this.timePauseImg = this.timePause.querySelector("img");
    this.timeForwardImg = this.timeForward.querySelector("img");

    this.menuButton.addEventListener("click", () => {
      this.menuButton.classList.toggle("open");
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

  // Créer un élément de liste
  createNode(node, container) {
    const li = document.createElement("li");

    const icon = document.createElement("img");
    icon.src = node.icon;
    icon.alt = node.name;
    icon.className = "body-list-icon";

    const label = document.createElement("span");
    label.textContent = node.name;

    li.appendChild(icon);
    li.appendChild(label);

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
    this.savedScale = 1; // Preserve the last non-paused rate
    this.isPaused = false;

    this.updateTimeDisplay();

    this.timeForward.onclick = () => {
      if (this.isPaused) {
        return;
      }

      if (this.currentScale < 0) {
        if (this.currentScale <= -2) {
          this.currentScale /= 2;
        } else {
          this.currentScale = 1;
        }
      } else if (this.currentScale <= 0) {
        this.currentScale = 1;
      } else {
        this.currentScale *= 2;
      }

      this.savedScale = this.currentScale;
      this.applyTime();
    };

    this.timeBackward.onclick = () => {
      if (this.isPaused) {
        return;
      }

      if (this.currentScale > 0) {
        if (this.currentScale >= 2) {
          this.currentScale /= 2;
        } else {
          this.currentScale = -1;
        }
      } else if (this.currentScale >= 0) {
        this.currentScale = -1;
      } else {
        this.currentScale *= 2;
      }

      this.savedScale = this.currentScale;
      this.applyTime();
    };

    this.timePause.onclick = () => {
      if (!this.isPaused) {
        this.savedScale = this.currentScale || 1;
        this.currentScale = 0;
        this.isPaused = true;
      } else {
        this.currentScale = this.savedScale || 1;
        this.isPaused = false;
      }

      this.applyTime();
    };
  }

  updateTimeDisplay() {
    if (this.currentScale === 0) {
      this.timeFactor.innerHTML =
        '<img src="assets/ui/pause-icon.svg" alt="paused" class="time-factor-icon" />';
      this.timePauseImg.src = "assets/ui/forward-icon.svg";
      this.timePauseImg.alt = "play";
      return;
    }

    this.timePauseImg.src = "assets/ui/pause-icon.svg";
    this.timePauseImg.alt = "pause";

    const direction = this.currentScale > 0 ? "" : "-";
    const value = Math.abs(this.currentScale);

    this.timeFactor.textContent = `${this.currentScale > 0 ? "" : "-"}${Math.abs(this.currentScale)}x`;
  }
}
