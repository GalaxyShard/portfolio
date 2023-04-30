import { openPopup } from "./popup.js"
let map = document.getElementById("map")!;

// TODO
// possibly add random lines to the sides, or connect the icons
// add sections or headers somehow for projects
// possibly lay out the map like the interactive version, from a top-down perspective
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function dragMap(dx: number, dy: number) {
    let x = parseFloat(map.style.getPropertyValue("--map-offset-x") || "0");
    let y = parseFloat(map.style.getPropertyValue("--map-offset-y") || "0");
    let scale = 1;
    map.style.setProperty("--map-offset-x", `${x + dx*scale}`);
    map.style.setProperty("--map-offset-y", `${y + dy*scale}`);

}
function handleMouseMove(e: MouseEvent) {
    dragMap(e.movementX, e.movementY);
}
let lastTouchX = 0;
let lastTouchY = 0;
let touchId: number | null = null;
function handleTouchMove(e: TouchEvent) {
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



function createIcon(name: string, offsetX: number, offsetY: number, popup: { subpage: any; closedEvent?: any; extWebsite?: any; }) {
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
        localStorage?.setItem("map-tutorial", "true");
        createMap();
    },
});
let mapCreated = false;
async function createMap() {
    if (mapCreated) {
        return;
    }
    mapCreated = true;
    await delay(250);
    
    // TODO: add a dotted line
    // https://stackoverflow.com/questions/32891173/animate-a-dotted-diagonal-line

    createIcon("About", -5, 6, {
        subpage: "subpages/about.html"
    });
}

if (localStorage?.getItem("map-tutorial")) {
    createMap();
}