import { openPopup } from "./popup.js"

let mapContainer = document.getElementById("map-container")!;
let map = document.getElementById("map")!;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

type Vec2 = [number, number];
function dragMap(delta: Vec2) {
    let x = parseFloat(map.style.getPropertyValue("--map-offset-x") || "0");
    let y = parseFloat(map.style.getPropertyValue("--map-offset-y") || "0");
    const scale = 1;
    map.style.setProperty("--map-offset-x", `${x + delta[0]*scale}`);
    map.style.setProperty("--map-offset-y", `${y + delta[1]*scale}`);

}
function handleMouseMove(e: MouseEvent) {
    dragMap([e.movementX, e.movementY]);
}
let lastTouch: Vec2 = [0, 0];
let touchId: number | null = null;
function handleTouchMove(e: TouchEvent) {
    let touchPos: Vec2 = [0, 0];
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


function createContainer(className: string, offset: Vec2) {
    let container = document.createElement("div");
    container.classList.add(className);
    container.style.setProperty("--x", `${offset[0]}`);
    container.style.setProperty("--y", `${offset[1]}`);
    return container;
}
function createIcon(name: string, offset: Vec2, popup: { subpage: any; closedEvent?: any; /*extWebsite?: any;*/ }) {
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
function dist(a: Vec2, b: Vec2) {
    let dx = b[0] - a[0];
    let dy = b[1] - a[1];
    return Math.sqrt(dx*dx + dy*dy);
}
function createLine(start: Vec2, end: Vec2) {
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
    
    const delayTime = 250;
    const startPos: Vec2 = [0, 0];
    const aboutPos: Vec2 = [-5, 6];
    const project0Pos: Vec2 = [4, 7];
    const project1Pos: Vec2 = [7, 11];
    const project2Pos: Vec2 = [4, 15];
    const resumePos: Vec2 = [0, -6];

    await delay(delayTime);
    createLine(startPos, aboutPos);
    createLine(startPos, project0Pos);
    createLine(startPos, resumePos);

    await delay(delayTime);
    createIcon("About", aboutPos, {
        subpage: "subpages/about.html"
    });
    createIcon("Nua", project0Pos, {
        subpage: "subpages/nua.html",
        // extWebsite: "https://galaxyshard.github.io/nua/compiler.html"
    });
    createIcon("Resumé", resumePos, {
        subpage: "subpages/resume.html"
    });

    await delay(delayTime);
    createLine(project0Pos, project1Pos);

    await delay(delayTime);
    createIcon("Retro Remake", project1Pos, {
        subpage: "subpages/retro-remake.html",
        // extWebsite: "https://galaxyshard-wdpp.github.io/retro-c-binary"
    });

    await delay(delayTime);
    createLine(project1Pos, project2Pos);

    await delay(delayTime);
    createIcon("Cups & Pups", project2Pos, {
        subpage: "subpages/cups-pups.html",
        // extWebsite: "https://galaxyshard-wdpp.github.io/cups-pups"
    });
}

if (localStorage?.getItem("map-tutorial")) {
    createMap();
}