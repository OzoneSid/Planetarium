import * as THREE from "three";

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

    this.bodyInfoPanel = document.getElementById("body-info-panel");
    this.bodyInfoClose = document.getElementById("body-info-close");
    this.bodyInfoName = document.getElementById("body-info-name");
    this.bodyInfoProperties = document.getElementById("body-properties");

    this.connectorPosition = new THREE.Vector3();
    this.bodyConnector = document.getElementById("body-connector");
    this.bodyConnectorLine = document.getElementById("body-connector-line");

    this.timeBackwardImg = this.timeBackward.querySelector("img");
    this.timePauseImg = this.timePause.querySelector("img");
    this.timeForwardImg = this.timeForward.querySelector("img");

    this.menuButton.addEventListener("click", () => {
      this.menuButton.classList.toggle("open");
      this.dropdown.classList.toggle("hidden");
      this.timeMenu.classList.toggle("hidden");
    });

    this.bodyInfoClose.addEventListener("click", () => {
      this.closeBodyInfo();
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

    this.timeFactor.textContent = `${this.currentScale > 0 ? "" : "-"}${Math.abs(this.currentScale)}x`;
  }

  updateConnector() {
    const token = this.selectedBody?.token;

    if (!token || !this.bodyInfoPanel.classList.contains("is-open")) {
      this.bodyConnector.classList.add("hidden");
      return;
    }

    const camera = this.cameraManager.camera;
    camera.updateMatrixWorld();

    token.getWorldPosition(this.connectorPosition);
    this.connectorPosition.project(camera);

    const { x, y, z } = this.connectorPosition;

    if (z < -1 || z > 1 || x < -1 || x > 1 || y < -1 || y > 1) {
      this.bodyConnector.classList.add("hidden");
      return;
    }

    const svgRect = this.bodyConnector.getBoundingClientRect();
    const panelRect = this.bodyInfoPanel.getBoundingClientRect();

    const tokenX = (x * 0.5 + 0.5) * svgRect.width;
    const tokenY = (-y * 0.5 + 0.5) * svgRect.height;

    const endX = panelRect.left - svgRect.left + 1;
    const endY = panelRect.top - svgRect.top + 1;

    const direction = Math.sign(endX - tokenX) || 1;
    const lead = Math.min(64, Math.abs(endX - tokenX) / 2);
    const tail = Math.min(48, Math.abs(endX - tokenX) / 2);

    const firstBendX = tokenX + direction * lead;
    const secondBendX = endX - direction * tail;

    this.bodyConnectorLine.setAttribute(
      "points",
      `${tokenX},${tokenY} ${firstBendX},${tokenY} ${secondBendX},${endY} ${endX},${endY}`,
    );

    this.bodyConnector.classList.remove("hidden");
  }

  showBodyInfo(body) {
    this.selectedBody = body;

    this.bodyInfoName.textContent = body.name;
    this.bodyInfoProperties.replaceChildren();

    for (const { label, value } of body.prop ?? []) {
      const term = document.createElement("dt");
      const description = document.createElement("dd");

      term.textContent = label;
      description.textContent = value;
      this.bodyInfoProperties.append(term, description);
    }

    this.bodyInfoPanel.classList.add("is-open");
    this.updateConnector();

    console.log({
      name: body.name,
      orbit: body.orbit,
      rotationSpeed: body.rotationSpeed,
    });
  }

  closeBodyInfo() {
    this.bodyInfoPanel.classList.remove("is-open");
    this.selectedBody = null;
    this.bodyConnector.classList.add("hidden");
  }
}
