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
let map = document.getElementById("map");
// TODO
// possibly add random lines to the sides, or connect the icons
// add sections or headers somehow for projects
// possibly lay out the map like the interactive version, from a top-down perspective
const delay = (ms) => new Promise(res => setTimeout(res, ms));
function dragMap(dx, dy) {
    let x = parseFloat(map.style.getPropertyValue("--map-offset-x") || "0");
    let y = parseFloat(map.style.getPropertyValue("--map-offset-y") || "0");
    let scale = 1;
    map.style.setProperty("--map-offset-x", `${x + dx * scale}`);
    map.style.setProperty("--map-offset-y", `${y + dy * scale}`);
}
function handleMouseMove(e) {
    dragMap(e.movementX, e.movementY);
}
let lastTouchX = 0;
let lastTouchY = 0;
let touchId = null;
function handleTouchMove(e) {
    let touchX = 0;
    let touchY = 0;
    for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
            touchX = e.changedTouches[0].clientX;
            touchY = e.changedTouches[0].clientY;
        }
    }
    dragMap(touchX - lastTouchX, touchY - lastTouchY);
    lastTouchX = touchX;
    lastTouchY = touchY;
}
function handleMouseUp() {
    map.removeEventListener("mousemove", handleMouseMove);
}
function handleTouchEnd() {
    map.removeEventListener("touchmove", handleTouchMove);
    touchId = null;
}
map.addEventListener("mousedown", e => {
    map.addEventListener("mousemove", handleMouseMove);
});
map.addEventListener("mouseup", handleMouseUp);
map.addEventListener("mouseleave", handleMouseUp);
map.addEventListener("touchstart", e => {
    map.addEventListener("touchmove", handleTouchMove);
    if (touchId === null) {
        touchId = e.changedTouches[0].identifier;
        lastTouchX = e.changedTouches[0].clientX;
        lastTouchY = e.changedTouches[0].clientY;
    }
});
map.addEventListener("touchend", handleTouchEnd);
map.addEventListener("touchcancel", handleTouchEnd);
function createIcon(name, offsetX, offsetY, popup) {
    let container = document.createElement("div");
    let button = document.createElement("button");
    let title = document.createElement("div");
    container.style.setProperty("--x", `${offsetX}`);
    container.style.setProperty("--y", `${offsetY}`);
    button.addEventListener("click", () => {
        openPopup(popup.subpage, popup.extWebsite, popup.closedEvent);
    });
    title.textContent = name;
    title.classList.add("title");
    container.appendChild(button);
    container.appendChild(title);
    map.appendChild(container);
    return { container: container, button: button, title: title };
}
let clickHere = createIcon("Click here", 0, 0, {
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
        yield delay(250);
        // TODO: add a dotted line
        // https://stackoverflow.com/questions/32891173/animate-a-dotted-diagonal-line
        createIcon("About", -5, 6, {
            subpage: "subpages/about.html"
        });
    });
}
if (localStorage === null || localStorage === void 0 ? void 0 : localStorage.getItem("map-tutorial")) {
    createMap();
}
