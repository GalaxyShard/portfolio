/**
 *
 * @source: https://portfolio.byteroach.com/src/map.ts
 * 
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page
 *
 * Copyright (C) 2022-2024 Dominic Adragna
 *
 * The JavaScript code in this page is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page
 *
 */

import { openPopup } from "./popup.js"

let mapContainer = document.getElementById("map-container")!;
let map = document.getElementById("map")!;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function easingFunction(t: number) : number {
    return 1 - Math.pow(1 - t, 3);
}

type Vec2 = [number, number];
function setPositionRaw(pos: Vec2) {
    let x = Math.min(Math.max(pos[0], -750), 750);
    let y = Math.min(Math.max(pos[1], -500), 500);
    map.style.setProperty("--map-offset-x", `${x}`);
    map.style.setProperty("--map-offset-y", `${y}`);
}
function zoomMap(scale: number) {
    let startTime: number | null = null;
    let startScale = parseFloat(map.style.getPropertyValue("--map-zoom") || "1");

    let length = 1000 /* ms */;
    const animationFrame = (time: number) => {
        if (startTime === null) {
            startTime = time;
        }
        let elapsed = Math.min(time - startTime, length);
        map.style.setProperty("--map-zoom", `${startScale + (scale - startScale) * easingFunction(elapsed / length)}`);

        if (elapsed < length) {
            requestAnimationFrame(animationFrame);
        }
        
    }
    requestAnimationFrame(animationFrame);
}
function getPosition(): Vec2 {
    return [
        parseFloat(map.style.getPropertyValue("--map-offset-x") || "0"),
        parseFloat(map.style.getPropertyValue("--map-offset-y") || "0"),
    ];
}
function scrollToGridPosition(pos: Vec2) {
    // map-offset is measured in logical pixels, grid position is measured in tiles (20px each);
    const scale = 20;
    setPositionRaw([pos[0]*scale, pos[1]*scale]);
}
function putInView(pos: Vec2) {
    // map-offset is measured in pixels, positions measured in grid tiles (20px each);
    const scale = 20;

    let viewWidth = map.clientWidth;
    let viewHeight = map.clientHeight;
    let posPx: Vec2 = [pos[0] * scale, pos[1] * scale];

    let [x, y] = getPosition();

    let inset = 75;
    let insetRight = 150; // larger inset on the right so that text does not get cut off

    let screenLeft = x-viewWidth/2+inset;
    let screenRight = x+viewWidth/2-insetRight;
    let screenBottom = y-viewHeight/2+inset;
    let screenTop = y+viewHeight/2-inset;
    
    if (screenLeft > posPx[0]) {
        x -= screenLeft - posPx[0];
    } else if (screenRight < posPx[0]) {
        x += posPx[0] - screenRight;
    }
    if (screenBottom > posPx[1]) {
        y -= screenBottom - posPx[1];
    } else if (screenTop < posPx[1]) {
        y += posPx[1] - screenTop;
    }
    setPositionRaw([x, y]);
}
function dragMap(delta: Vec2) {
    let [x, y] = getPosition();
    const scale = 1;
    setPositionRaw([x + delta[0]*scale, y + delta[1]*scale]);
}
let lastMousePos: Vec2 | null = null;
function handleMouseMove(e: MouseEvent) {
    // major browsers are not compliant with e.movementX and e.movementY as of 2024
    let offset: Vec2 = [
        -(e.screenX - lastMousePos![0]),
        e.screenY - lastMousePos![1]
    ];
    lastMousePos![0] = e.screenX;
    lastMousePos![1] = e.screenY;
    dragMap(offset);
}
let currentTouches: {[index: number]: Vec2 | undefined} = {};
function handleTouchMove(e: TouchEvent) {

    let offset: Vec2 = [0, 0];
    for (let touch of e.changedTouches) {
        if (currentTouches[touch.identifier] !== undefined) {
            let lastTouch = currentTouches[touch.identifier]!;
            let touchPos: Vec2 = [touch.screenX, touch.screenY];
            
            offset[0] += -(touchPos[0] - lastTouch[0]);
            offset[1] += touchPos[1] - lastTouch[1];

            lastTouch[0] = touchPos[0];
            lastTouch[1] = touchPos[1];
        }
    }
    dragMap(offset);
}
function handleMouseUp() {
    lastMousePos = null;
    mapContainer.removeEventListener("mousemove", handleMouseMove);
}
function handleTouchEnd(e: TouchEvent) {
    for (let touch of e.changedTouches) {
        currentTouches[touch.identifier] = undefined;
    }
}
mapContainer.addEventListener("mousedown", e => {
    lastMousePos = [e.screenX, e.screenY];
    mapContainer.addEventListener("mousemove", handleMouseMove);
});
mapContainer.addEventListener("mouseup", handleMouseUp);
mapContainer.addEventListener("mouseleave", handleMouseUp);
mapContainer.addEventListener("wheel", e => {
    e.preventDefault();
    dragMap([e.deltaX, -e.deltaY]);
});
mapContainer.addEventListener("touchstart", e => {
    for (let touch of e.changedTouches) {
        currentTouches[touch.identifier] = [touch.screenX, touch.screenY];
    }
});
mapContainer.addEventListener("touchmove", handleTouchMove);
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

    /* NOTE: possibly remove this */
    container.addEventListener("mousedown", e => {
        e.stopPropagation();
    });

    container.append(open, title);
    map.append(container);
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
    
    
    container.append(element);
    map.append(container);
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
    
    const delayTime = 100;

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
            name: "Cats & Cups",
            subpage: "subpages/cats-and-cups.html",
        },
        2: {
            name: "Piroll Design",
            subpage: "subpages/piroll-design.html",
        },
        3: {
            name: "About",
            subpage: "subpages/about.html",
        },
        // 4: {
        //     name: "Resumé",
        //     subpage: "subpages/resume.html",
        // },
        5: {
            name: "Montecito",
            subpage: "subpages/montecito.html",
        },
        6: {
            name: "Waver",
            subpage: "subpages/waver.html",
        },
        8: {
            name: "Nua",
            subpage: "subpages/nua.html",
        },
        9: {
            name: "Retro Remaster",
            subpage: "subpages/retro-remaster.html",
        },
    };

    zoomMap(0.5);
    await delay(400);
    for (let i in mapIcons) {
        let iconInfo = mapIcons[i];
        let icon = createIcon(iconInfo.name, getPos(i as unknown as number), { subpage: iconInfo.subpage, closedEvent: iconInfo.closedEvent });
        icon.open.tabIndex = getTabIndex(i as unknown as number);
    }
    for (let i = 0; i < lines.length; i += 2) {
        await delay(delayTime);
        let a_index = lines[i];
        let b_index = lines[i+1];
        let a: Vec2 = a_index == -1 ? [0,0] : getPos(a_index);
        let b: Vec2 = b_index == -1 ? [0,0] : getPos(b_index);
        createLine(a, b);
    }
    await delay(400);
    zoomMap(1);

    await delay(400);


    let tooltip = createContainer("tooltip", [-3.5, -2]);
    tooltip.setAttribute("aria-hidden", "true");
    let svg = document.createElement("img");
    svg.src = "/images/cursor.svg";

    let text = document.createTextNode("Click & drag");
    tooltip.append(svg, text);
    
    map.append(tooltip);
}

if (localStorage?.getItem("map-tutorial")) {
    createMap();
}