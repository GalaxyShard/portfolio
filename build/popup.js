const popup = document.createElement("div");
popup.id = "popup";
const closeButton = document.createElement("button");
const triangle = document.createElement("div");
closeButton.appendChild(triangle);
popup.appendChild(closeButton);
document.body.appendChild(popup);
let popupFrame = null;
let closedEvent = undefined;
closeButton.addEventListener("click", _ => {
    popup.classList.remove("opened");
    closedEvent === null || closedEvent === void 0 ? void 0 : closedEvent();
    closedEvent = undefined;
});
export function openPopup(subpage, onClose) {
    if (popup.classList.contains("opened")) {
        return;
    }
    // remove the previous frame to prevent slow connections from leaving it behind
    popupFrame === null || popupFrame === void 0 ? void 0 : popupFrame.remove();
    popupFrame = document.createElement("iframe");
    popupFrame.src = subpage;
    popup.appendChild(popupFrame);
    closedEvent = onClose;
    popup.classList.add("opened");
}
