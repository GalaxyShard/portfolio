var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { openPopup } from "./popup.js";
let mapContainer = document.getElementById("map-container");
let map = document.getElementById("map");
const delay = (ms) => new Promise(res => setTimeout(res, ms));
function dragMap(delta) {
    let x = parseFloat(map.style.getPropertyValue("--map-offset-x") || "0");
    let y = parseFloat(map.style.getPropertyValue("--map-offset-y") || "0");
    const scale = 1;
    map.style.setProperty("--map-offset-x", `${x + delta[0] * scale}`);
    map.style.setProperty("--map-offset-y", `${y + delta[1] * scale}`);
}
function handleMouseMove(e) {
    dragMap([e.movementX, e.movementY]);
}
let lastTouch = [0, 0];
let touchId = null;
function handleTouchMove(e) {
    let touchPos = [0, 0];
    for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
            touchPos = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
        }
    }
    dragMap([touchPos[0] - lastTouch[0], touchPos[1] - lastTouch[1]]);
    lastTouch = touchPos;
}
function handleMouseUp() {
    mapContainer.removeEventListener("mousemove", handleMouseMove);
}
function handleTouchEnd() {
    mapContainer.removeEventListener("touchmove", handleTouchMove);
    touchId = null;
}
mapContainer.addEventListener("mousedown", e => {
    mapContainer.addEventListener("mousemove", handleMouseMove);
});
mapContainer.addEventListener("mouseup", handleMouseUp);
mapContainer.addEventListener("mouseleave", handleMouseUp);
mapContainer.addEventListener("wheel", e => {
    e.preventDefault();
    dragMap([-e.deltaX, -e.deltaY]);
});
mapContainer.addEventListener("touchstart", e => {
    mapContainer.addEventListener("touchmove", handleTouchMove);
    if (touchId === null) {
        touchId = e.changedTouches[0].identifier;
        lastTouch = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
    }
});
mapContainer.addEventListener("touchend", handleTouchEnd);
mapContainer.addEventListener("touchcancel", handleTouchEnd);
function createContainer(className, offset) {
    let container = document.createElement("div");
    container.classList.add(className);
    container.style.setProperty("--x", `${offset[0]}`);
    container.style.setProperty("--y", `${offset[1]}`);
    return container;
}
function createIcon(name, offset, popup) {
    let container = createContainer("icon", offset);
    let button = document.createElement("button");
    let title = document.createElement("div");
    button.addEventListener("click", () => {
        openPopup(popup.subpage, popup.closedEvent);
    });
    title.textContent = name;
    title.classList.add("title");
    container.appendChild(button);
    container.appendChild(title);
    map.appendChild(container);
    return { container: container, button: button, title: title };
}
function dist(a, b) {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    return Math.sqrt(dx * dx + dy * dy);
}
function createLine(start, end) {
    let container = createContainer("line", start);
    let element = document.createElement("div");
    element.style.setProperty("--length", `${dist(start, end)}`);
    let angle = Math.atan2(end[1] - start[1], end[0] - start[0]);
    // negate because css uses clockwise angles
    element.style.setProperty("--angle", `${-angle}rad`);
    container.appendChild(element);
    map.appendChild(container);
    return { container: container };
}
createIcon("Start Here", [0, 0], {
    subpage: "subpages/click-here.html",
    closedEvent: () => {
        localStorage === null || localStorage === void 0 ? void 0 : localStorage.setItem("map-tutorial", "true");
        createMap();
    },
});
let mapCreated = false;
function createMap() {
    return __awaiter(this, void 0, void 0, function* () {
        if (mapCreated) {
            return;
        }
        mapCreated = true;
        const delayTime = 250;
        const startPos = [0, 0];
        const aboutPos = [-5, 6];
        const project0Pos = [4, 7];
        const project1Pos = [7, 11];
        const project2Pos = [4, 15];
        const resumePos = [0, -6];
        yield delay(delayTime);
        createLine(startPos, aboutPos);
        createLine(startPos, project0Pos);
        createLine(startPos, resumePos);
        yield delay(delayTime);
        createIcon("About", aboutPos, {
            subpage: "subpages/about.html"
        });
        createIcon("Nua", project0Pos, {
            subpage: "subpages/nua.html",
        });
        createIcon("Resumé", resumePos, {
            subpage: "subpages/resume.html"
        });
        yield delay(delayTime);
        createLine(project0Pos, project1Pos);
        yield delay(delayTime);
        createIcon("Retro Remake", project1Pos, {
            subpage: "subpages/retro-remake.html",
        });
        yield delay(delayTime);
        createLine(project1Pos, project2Pos);
        yield delay(delayTime);
        createIcon("Cups & Pups", project2Pos, {
            subpage: "subpages/cups-pups.html",
        });
    });
}
if (localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem("map-tutorial")) {
    createMap();
}
