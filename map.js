
let map = document.getElementById("map");

// TODO
// possibly add random lines to the sides, or connect the icons
// add sections or headers somehow for projects
// possibly lay out the map like the interactive version, from a top-down perspective

function dragMap(dx, dy) {
    let x = parseFloat(map.style.getPropertyValue("--map-offset-x") || 0);
    let y = parseFloat(map.style.getPropertyValue("--map-offset-y") || 0);
    
    let scale = 1;
    map.style.setProperty("--map-offset-x", `${x + dx*scale}`);
    map.style.setProperty("--map-offset-y", `${y + dy*scale}`);

}
function handleMouseMove(e) {
    dragMap(e.movementX, e.movementY);
}
let lastTouchX = 0;
let lastTouchY = 0;
function handleTouchMove(e) {
    let touchX = 0;
    let touchY = 0;
    for (let touch of e.changedTouches) {
        touchX += touch.clientX;
        touchY += touch.clientY;
    }
    dragMap(touchX - lastTouchX, touchY - lastTouchY);
    lastTouchX = touchX;
    lastTouchY = touchY;
}
function handleMouseUp(e) {
    map.removeEventListener("mousemove", handleMouseMove);
}
function handleTouchEnd(e) {
    map.removeEventListener("touchmove", handleTouchMove);
}
map.addEventListener("mousedown", e => {
    e.preventDefault();
    map.addEventListener("mousemove", handleMouseMove);
});
map.addEventListener("mouseup", handleMouseUp);
map.addEventListener("mouseleave", handleMouseUp);
map.addEventListener("touchstart", e => {
    map.addEventListener("touchmove", handleTouchMove);
    lastTouchX = 0;
    lastTouchY = 0;
    for (let touch of e.changedTouches) {
        lastTouchX += touch.clientX;
        lastTouchY += touch.clientY;
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
        localStorage.setItem("map-tutorial", true);
        createMap();
    },
});
let mapCreated = false;
function createMap() {
    if (mapCreated) {
        return;
    }
    mapCreated = true;
    createIcon("About", -5, 6, {
        subpage: "subpages/about.html"
    });
}

if (localStorage.getItem("map-tutorial")) {
    createMap();
}