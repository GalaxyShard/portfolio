
const popup = document.getElementById("popup");
const closePopup = popup.getElementsByTagName("button")[0];
const newTab = popup.getElementsByTagName("a")[0];
const popupFrame = popup.getElementsByTagName("iframe")[0];
closePopup.addEventListener("click", _ => {
    popup.classList.remove("opened");
});

const sections = document.getElementById("sections");

const buttons = sections.getElementsByTagName("button");
for (const element of buttons) {
    element.addEventListener("click", _ => {

        var frame = element.getAttribute("data-frame");
        var link = element.getAttribute("data-link");

        popupFrame.src = frame;
        newTab.href = link || "javascript:void()";
        if (link) {
            newTab.classList.remove("invisible");
        } else {
            newTab.classList.add("invisible");
        }
        popup.classList.add("opened");
    });
}