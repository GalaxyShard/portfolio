import { openPopup } from "./popup.js"

let mapContainer = document.getElementById("map-container")!;
let map = document.getElementById("map")!;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

type Vec2 = [number, number];
function scrollToPosition(pos: Vec2) {
    // map-offset is measured in pixels, positions measured in grid tiles (20px each);
    const scale = 20;
    map.style.setProperty("--map-offset-x", `${pos[0]*scale}`);
    map.style.setProperty("--map-offset-y", `${pos[1]*scale}`);
}
function putInView(pos: Vec2) {
    // map-offset is measured in pixels, positions measured in grid tiles (20px each);
    const scale = 20;

    let viewWidth = map.clientWidth;
    let viewHeight = map.clientHeight;
    let posPx = [pos[0] * scale, pos[1] * scale];

    let x = parseFloat(map.style.getPropertyValue("--map-offset-x") || "0");
    let y = parseFloat(map.style.getPropertyValue("--map-offset-y") || "0");

    let inset = 20;
    let insetRight = 100;
    // position is offscreen; center it
    if (
        x > posPx[0] && x-viewWidth/2+inset > posPx[0]
        || x < posPx[0] && x+viewWidth/2-insetRight < posPx[0]
        || y > posPx[1] && y-viewHeight/2+inset > posPx[1]
        || y < posPx[1] && y+viewHeight/2-inset < posPx[1]
    ) {
        map.style.setProperty("--map-offset-x", `${posPx[0]}`);
        map.style.setProperty("--map-offset-y", `${posPx[1]}`);
    }
}
function dragMap(delta: Vec2) {
    let x = parseFloat(map.style.getPropertyValue("--map-offset-x") || "0");
    let y = parseFloat(map.style.getPropertyValue("--map-offset-y") || "0");
    const scale = 1;
    map.style.setProperty("--map-offset-x", `${x + delta[0]*scale}`);
    map.style.setProperty("--map-offset-y", `${y + delta[1]*scale}`);

}
function handleMouseMove(e: MouseEvent) {
    dragMap([-e.movementX, e.movementY]);
}
let lastTouch: Vec2 = [0, 0];
let touchId: number | null = null;
function handleTouchMove(e: TouchEvent) {
    let touchPos: Vec2 = [0, 0];
    let touchFound = false;
    for (let touch of e.changedTouches) {
        if (touch.identifier === touchId) {
            touchPos = [e.changedTouches[0].clientX, e.changedTouches[0].clientY];
            touchFound = true;
        }
    }
    if (!touchFound) {
        return;
    }
    dragMap([-(touchPos[0] - lastTouch[0]), touchPos[1] - lastTouch[1]]);
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
    dragMap([e.deltaX, -e.deltaY]);
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
let iconCount = 0;
function createIcon(name: string, offset: Vec2, popup: { subpage: string; closedEvent?: any }) {
    let container = createContainer("icon", offset);
    let open = document.createElement("button");
    let title = document.createElement("label");

    open.id = `icon-${iconCount}`;
    title.htmlFor = `icon-${iconCount}`;
    iconCount++;

    open.addEventListener("click", e => {
        if (openPopup(popup.subpage, () => {
            map.inert = false;
            open.focus();
            popup.closedEvent?.();
        })) {
            map.inert = true;
        }
    });
    open.addEventListener("focus", e => {
        putInView(offset);
    });
    title.textContent = name;
    title.classList.add("title");

    container.appendChild(open);
    container.appendChild(title);
    map.appendChild(container);
    return { container: container, open: open, title: title };
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
let icon = createIcon("Start Here", [0, 0], {
    subpage: "subpages/start-here.html",
    closedEvent: () => {
        localStorage?.setItem("map-tutorial", "true");
        createMap();
    },
});
icon.open.tabIndex = 1;

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

    const triangle: Vec2[] = [
        [-1.56, 10], [1.23, 10], // 0, 1
        [-1.52, 5.202], // 2
        [-0.2, 2.24], // 3
        [-2.1, -2.19], [2.9, -1.595], [6.3, -2.19], // 4, 5, 6
        [-9.8, -4.595], [-3.9, -4.45], [10.66, -4.45], // 7, 8, 9
        [-8.33, -6.89], [9.25, -6.89], // 10, 11
    ];
    //           0---1
    //         /  \   \
    //        /    \   \
    //       /   2  \   \
    //      /   / \  \   \
    //     /   /   3  \   \
    //    /   /   / \  \   \
    //   /   /   4---5--6   \
    //  /   /   /            \
    // 7   /   8--------------9
    //  \ /                  /
    //   10----------------11
    function getTabIndex(location: number) : number {
        const tabindices: number[] = [
            // indices to triangle; tabindex is the index to this array + 2 (eg: 3 has a tabindex of 2)
            3, 4, 5, 2, 8, 6, 1, 0, 7, 10, 11, 9
        ];
        return tabindices.findIndex(v => v==location) + 2;
    }
    // pairs of indices to `triangle`
    const lines: number[] = [
        2, 5,
        3, 8,
        4, 6,
        2, 3,
        4, 8,
        5, 6,

        2, 10,
        8, 9,
        0, 6,
        7, 10,
        10, 11,
        9, 11,
        1, 9,
        0, 1,
        0, 7,
    ]
    function getPos(index: number) : Vec2 {
        let scale = 2.5;
        return [triangle[index][0] * scale, triangle[index][1] * scale];
    }
    const mapIcons: {[index: number]: {name:string, subpage:string, closedEvent?:any}} = {
        0: {
            name: "Cups & Pups",
            subpage: "subpages/cups-pups.html",
        },
        2: {
            name: "Piroll Design",
            subpage: "subpages/piroll-design.html",
        },
        8: {
            name: "Retro Remake",
            subpage: "subpages/retro-remake.html",
        },
        3: {
            name: "About",
            subpage: "subpages/about.html",
        },
        4: {
            name: "Resumé",
            subpage: "subpages/resume.html",
        },
        6: {
            name: "Nua",
            subpage: "subpages/nua.html",
        },
    };
    let initializedIcons: {[index: number]: boolean} = {};
    for (let i = 0; i < lines.length; i += 2) {
        await delay(delayTime);
        let a_index = lines[i];
        let b_index = lines[i+1];
        let a: Vec2 = a_index == -1 ? [0,0] : getPos(a_index);
        let b: Vec2 = b_index == -1 ? [0,0] : getPos(b_index);
        createLine(a, b);

        function tryInitializeIcon(index: number, pos: Vec2) {
            if (initializedIcons[index] != true && mapIcons[index]) {
                let icon = createIcon(mapIcons[index].name, pos, { subpage: mapIcons[index].subpage, closedEvent: mapIcons[index].closedEvent });
                icon.open.tabIndex = getTabIndex(index);
                initializedIcons[index] = true;
            }
        }
        tryInitializeIcon(a_index, a);
        tryInitializeIcon(b_index, b);
    }
}

if (localStorage?.getItem("map-tutorial")) {
    createMap();
}