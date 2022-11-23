
const popup = document.getElementById("popup");
const closePopup = popup.getElementsByClassName("close")[0];
const newTab = popup.getElementsByClassName("open")[0];
const popupFrame = popup.getElementsByTagName("iframe")[0];
closePopup.addEventListener("click", _ => {
    popup.classList.remove("opened");
});

const sections = document.getElementById("sections");

const buttons = sections.getElementsByTagName("button");
for (const button in buttons) {
    const element = buttons[button];
    element.addEventListener("click", _ => {
        
        popupFrame.src = element.getAttribute("data-href");

        popup.classList.add("opened");
    });
}