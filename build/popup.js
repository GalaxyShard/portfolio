const popup = document.getElementById("popup");
const closePopup = popup.getElementsByTagName("button")[0];
const newTab = popup.getElementsByTagName("a")[0];
const popupFrame = popup.getElementsByTagName("iframe")[0];
let closedEvent = undefined;
closePopup.addEventListener("click", _ => {
    popup.classList.remove("opened");
    closedEvent === null || closedEvent === void 0 ? void 0 : closedEvent();
    closedEvent = undefined;
});
export function openPopup(subpage, extWebsite, onClose) {
    if (popup.classList.contains("opened")) {
        return;
    }
    popupFrame.src = subpage;
    closedEvent = onClose;
    // disable "Open in new tab" if there is no dedicated website
    newTab.href = extWebsite || "javascript:void()";
    if (extWebsite) {
        newTab.classList.remove("invisible");
    }
    else {
        newTab.classList.add("invisible");
    }
    popup.classList.add("opened");
}
