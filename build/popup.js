const popup = document.createElement("div");
popup.id = "popup";
popup.classList.add("closed");
popup.setAttribute("role", "dialog");
popup.setAttribute("aria-modal", "true");
popup.setAttribute("aria-hidden", "true");
const closeButton = document.createElement("button");
closeButton.setAttribute("aria-label", "Close");
popup.appendChild(closeButton);
document.body.appendChild(popup);
let popupFrame = null;
let closedEvent = undefined;
closeButton.addEventListener("click", _ => {
    popup.classList.remove("opened");
    setTimeout(() => {
        popup.classList.add("closed");
        popup.setAttribute("aria-hidden", "true");
        popupFrame === null || popupFrame === void 0 ? void 0 : popupFrame.remove();
        popupFrame = null;
    }, 500);
    closedEvent === null || closedEvent === void 0 ? void 0 : closedEvent();
    closedEvent = undefined;
});
export function openPopup(subpage, onClose) {
    if (!popup.classList.contains("closed")) {
        return false;
    }
    popupFrame = document.createElement("iframe");
    popupFrame.src = subpage;
    popup.appendChild(popupFrame);
    closedEvent = onClose;
    popup.classList.remove("closed");
    popup.classList.add("opened");
    popup.setAttribute("aria-hidden", "false");
    closeButton.focus();
    return true;
}
