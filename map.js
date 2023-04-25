
let map = document.getElementById("map");

// TODO
// possibly add random lines to the sides, or connect the icons
// add the scrolling feature
// add sections or headers somehow for projects
// possibly lay out the map like the interactive version, from a top-down perspective

function createIcon(name, offsetX, offsetY, popup) {
    let container = document.createElement("div");
    let button = document.createElement("button");
    let title = document.createElement("div");

    container.style.setProperty("--x", `${offsetX}`);
    container.style.setProperty("--y", `${offsetY}`);

    button.addEventListener("click", () => {
        openPopup(popup.subpage, popup.extWebsite);
    });
    
    title.textContent = name;
    title.classList.add("title");

    container.appendChild(button);
    container.appendChild(title);
    map.appendChild(container);
}
createIcon("Click here", 0, 0, {
    subpage: "subpages/click-here.html"
});

createIcon("About", -5, 6, {
    subpage: "subpages/about.html"
});
